import { env } from '$env/dynamic/public';

export type PushState = 'unsupported' | 'default' | 'denied' | 'granted';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
	const rawData = atob(base64);
	const outputArray = new Uint8Array(rawData.length);
	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

export function getPushState(): PushState {
	if (!('Notification' in window) || !('serviceWorker' in navigator)) return 'unsupported';
	return Notification.permission;
}

/** Pastikan browser yang sudah memberi izin terdaftar ke tabel push_subscriptions di server. */
export async function syncPushSubscription(): Promise<boolean> {
	const vapidKey = env.PUBLIC_VAPID_KEY;
	if (!vapidKey || getPushState() !== 'granted') return false;

	const registration = await navigator.serviceWorker.ready;
	const subscription =
		(await registration.pushManager.getSubscription()) ??
		(await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource
		}));

	await fetch('/api/push/subscribe', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(subscription)
	});

	return true;
}

/** Minta izin notifikasi, lalu daftarkan subscription ke server. */
export async function enablePush(): Promise<PushState> {
	const permission = await Notification.requestPermission();
	if (permission !== 'granted') return permission;

	await syncPushSubscription();
	return permission;
}

/**
 * Kirim tes notifikasi:
 * Jika VAPID key aktif di server, kirim Web Push sungguhan dari server ke HP.
 * Jika belum, tampilkan notifikasi lokal lewat Service Worker.
 */
export async function sendTestNotification() {
	await syncPushSubscription().catch(() => {});

	try {
		const res = await fetch('/api/push/test', { method: 'POST' });
		if (res.ok) {
			const data = await res.json();
			if (data.sent > 0) return;
		}
	} catch {
		// Fallback ke notifikasi lokal jika sedang offline
	}

	const registration = await navigator.serviceWorker.ready;
	await registration.showNotification('Buku Bulanan', {
		body: 'Notifikasi berhasil diaktifkan.',
		icon: '/icon-192.png',
		badge: '/badge-96.png'
	});
}
