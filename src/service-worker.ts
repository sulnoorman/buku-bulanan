/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;
const CACHE = `cache-${version}`;
const ASSETS = [...build, ...files];

// Install: simpan aset statis (JS/CSS/icon) ke cache & langsung aktifkan
sw.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE)
			.then((cache) => cache.addAll(ASSETS))
			.then(() => sw.skipWaiting())
	);
});

// Activate: hapus cache versi lama & ambil alih halaman saat ini
sw.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then(async (keys) => {
			for (const key of keys) if (key !== CACHE) await caches.delete(key);
			await sw.clients.claim();
		})
	);
});

// Fetch:
// 1. Aset statis (JS/CSS/icon) -> Cache-First
// 2. Halaman & data SvelteKit (__data.json) -> Network-First + simpan ke cache,
//    sehingga saat HP offline semua halaman dan data terakhir tetap bisa dibuka!
sw.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;
	const url = new URL(event.request.url);
	if (url.origin !== location.origin) return;
	if (url.pathname.startsWith('/api/')) return;

	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE);
			if (ASSETS.includes(url.pathname)) {
				const cached = await cache.match(url.pathname);
				if (cached) return cached;
			}
			try {
				const response = await fetch(event.request);
				if (response.status === 200) {
					cache.put(event.request, response.clone());
				}
				return response;
			} catch {
				const cached =
					(await cache.match(event.request)) ?? (await cache.match(url.pathname));
				if (cached) return cached;
				return new Response('Offline', { status: 503 });
			}
		})()
	);
});

// Push dari server → tampilkan notifikasi native di HP
sw.addEventListener('push', (event) => {
	const data = event.data?.json() ?? {};
	event.waitUntil(
		sw.registration.showNotification(data.title ?? 'Buku Bulanan', {
			body: data.body ?? 'Ada tagihan yang mendekati jatuh tempo.',
			icon: '/icon-192.png',
			badge: '/icon-192.png',
			data: { url: data.url ?? '/' }
		})
	);
});

// Klik notifikasi → fokus atau buka aplikasi
sw.addEventListener('notificationclick', (event) => {
	event.notification.close();
	const targetUrl = (event.notification.data as { url?: string } | undefined)?.url ?? '/';
	event.waitUntil(
		sw.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
			for (const client of clientList) {
				if ('focus' in client) return client.focus();
			}
			return sw.clients.openWindow(targetUrl);
		})
	);
});
