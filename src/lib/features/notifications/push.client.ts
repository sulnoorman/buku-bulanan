import { env } from '$env/dynamic/public';

export type PushState = 'unsupported' | 'default' | 'denied' | 'granted';

export function getPushState(): PushState {
	if (!('Notification' in window) || !('serviceWorker' in navigator)) return 'unsupported';
	return Notification.permission;
}

/** Minta izin notifikasi, lalu (jika VAPID key tersedia) daftarkan subscription ke server. */
export async function enablePush(): Promise<PushState> {
	const permission = await Notification.requestPermission();
	if (permission !== 'granted') return permission;

	const vapidKey = env.PUBLIC_VAPID_KEY;
	if (!vapidKey) {
		console.info('PUBLIC_VAPID_KEY belum di-set: izin diberikan, tapi push dari server belum aktif.');
		return permission;
	}

	const registration = await navigator.serviceWorker.ready;
	const subscription =
		(await registration.pushManager.getSubscription()) ??
		(await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: vapidKey
		}));

	await fetch('/api/push/subscribe', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(subscription)
	});

	return permission;
}

/** Notifikasi lokal (tanpa server) untuk mengecek service worker & izin sudah benar. */
export async function sendTestNotification() {
	const registration = await navigator.serviceWorker.ready;
	await registration.showNotification('Buku Bulanan', {
		body: 'Notifikasi berhasil diaktifkan.',
		icon: '/icon-192.png'
	});
}
