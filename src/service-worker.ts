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

// Fetch: aset statis dari cache. Data halaman SELALU dari network
// (data keuangan tidak boleh basi), fallback ke cache hanya saat offline.
sw.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;
	const url = new URL(event.request.url);
	if (url.origin !== location.origin) return;

	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE);
			if (ASSETS.includes(url.pathname)) {
				const cached = await cache.match(url.pathname);
				if (cached) return cached;
			}
			try {
				return await fetch(event.request);
			} catch {
				return (await cache.match(event.request)) ?? new Response('Offline', { status: 503 });
			}
		})()
	);
});

// Push dari server → tampilkan notifikasi
sw.addEventListener('push', (event) => {
	const data = event.data?.json() ?? {};
	event.waitUntil(
		sw.registration.showNotification(data.title ?? 'Buku Bulanan', {
			body: data.body ?? 'Ada tagihan yang mendekati jatuh tempo.',
			icon: '/icon-192.png'
		})
	);
});

// Klik notifikasi → buka dashboard
sw.addEventListener('notificationclick', (event) => {
	event.notification.close();
	event.waitUntil(sw.clients.openWindow('/'));
});
