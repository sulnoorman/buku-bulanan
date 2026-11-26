import * as webpush from 'web-push';
import { eq } from 'drizzle-orm';
import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { db } from '$lib/server/db';
import { pushSubscriptions } from './push.schema';
import { getActiveCycle } from '$features/cycles/cycle.queries';
import { getBillsByCycle } from '$features/bills/bill.queries';
import { toBillView } from '$features/bills/bill.service';
import { formatRupiah } from '$lib/utils/format';

type SubscriptionJSON = { endpoint: string; keys: { p256dh: string; auth: string } };

export type PushPayload = {
	title: string;
	body: string;
	url?: string;
};

export async function saveSubscription(sub: SubscriptionJSON) {
	await db
		.insert(pushSubscriptions)
		.values({ endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth })
		.onConflictDoNothing();
}

export async function getSubscriptions() {
	return db.select().from(pushSubscriptions);
}

function configureVapid(): boolean {
	const pub = publicEnv.PUBLIC_VAPID_KEY;
	const priv = privateEnv.VAPID_PRIVATE_KEY;
	if (!pub || !priv) return false;
	webpush.setVapidDetails('mailto:notifikasi@bukubulanan.app', pub, priv);
	return true;
}

/**
 * Kirim Web Push Notification ke semua perangkat yang terdaftar di database.
 * Subscription yang sudah kedaluwarsa (HTTP 404/410) otomatis dibersihkan.
 */
export async function sendPushToAll(payload: PushPayload) {
	if (!configureVapid()) {
		return { sent: 0, configured: false };
	}

	const subs = await getSubscriptions();
	let sent = 0;

	await Promise.all(
		subs.map(async (sub) => {
			try {
				await webpush.sendNotification(
					{
						endpoint: sub.endpoint,
						keys: { p256dh: sub.p256dh, auth: sub.auth }
					},
					JSON.stringify(payload)
				);
				sent++;
			} catch (err: unknown) {
				const statusCode = (err as { statusCode?: number })?.statusCode;
				if (statusCode === 404 || statusCode === 410) {
					await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, sub.endpoint));
				}
			}
		})
	);

	return { sent, total: subs.length, configured: true };
}

/**
 * Cek tagihan siklus aktif yang mendekati atau lewat jatuh tempo,
 * lalu kirim pengingat push notification jika ada.
 */
export async function sendDueBillsReminder() {
	const active = await getActiveCycle();
	if (!active) return { sent: 0, reason: 'no_active_cycle' };

	const rawBills = await getBillsByCycle(active.id);
	const urgent = rawBills
		.map((b) => toBillView(b, active.startDate))
		.filter((b) => b.urgency === 'overdue' || b.urgency === 'soon');

	if (urgent.length === 0) return { sent: 0, reason: 'no_urgent_bills' };

	const totalRemaining = urgent.reduce((s, b) => s + b.remainingAmount, 0);
	const details = urgent
		.map((b) => {
			if (b.daysLeft < 0) return `${b.name} (lewat ${-b.daysLeft} hari)`;
			if (b.daysLeft === 0) return `${b.name} (hari ini)`;
			return `${b.name} (${b.daysLeft} hari lagi)`;
		})
		.join(', ');

	const result = await sendPushToAll({
		title: `Pengingat Tagihan (${urgent.length}) · ${formatRupiah(totalRemaining)}`,
		body: details,
		url: '/'
	});

	return { ...result, urgentCount: urgent.length };
}
