import { db } from '$lib/server/db';
import { pushSubscriptions } from './push.schema';

type SubscriptionJSON = { endpoint: string; keys: { p256dh: string; auth: string } };

export async function saveSubscription(sub: SubscriptionJSON) {
	await db
		.insert(pushSubscriptions)
		.values({ endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth })
		.onConflictDoNothing();
}

export async function getSubscriptions() {
	return db.select().from(pushSubscriptions);
}

/*
 * LANGKAH BERIKUTNYA (belum diimplementasi):
 * 1. `pnpm add web-push` lalu generate VAPID key: `npx web-push generate-vapid-keys`
 * 2. Isi PUBLIC_VAPID_KEY & VAPID_PRIVATE_KEY di .env
 * 3. Buat endpoint cron (misal /api/cron/reminder) yang setiap pagi:
 *    - ambil tagihan UNPAID dengan urgency 'soon' / 'overdue'
 *    - kirim via webpush.sendNotification(subscription, JSON.stringify({ title, body }))
 * 4. Jadwalkan endpoint itu dengan Vercel Cron.
 */
