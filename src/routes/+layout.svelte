<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { preloadData } from '$app/navigation';
	import { navigating, page } from '$app/state';
	import { APP_NAME } from '$lib/utils/constants';
	import { Button } from '$components/ui/button';
	import {
		IconLayoutDashboard,
		IconReceipt2,
		IconShoppingCart,
		IconHistory,
		IconDownload,
		IconLoader2,
		IconWifiOff,
		IconWifi
	} from '@tabler/icons-svelte';

	let { children } = $props();

	interface BeforeInstallPromptEvent extends Event {
		prompt: () => Promise<void>;
		userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
	}

	let deferredPrompt = $state<BeforeInstallPromptEvent | null>(null);
	let connectionToast = $state<'offline' | 'online' | null>(null);
	let toastTimer: ReturnType<typeof setTimeout> | undefined;

	function showConnectionToast(kind: 'offline' | 'online') {
		clearTimeout(toastTimer);
		connectionToast = kind;
		toastTimer = setTimeout(() => {
			connectionToast = null;
		}, 3500);
	}

	onMount(() => {
		const handler = (e: Event) => {
			e.preventDefault();
			deferredPrompt = e as BeforeInstallPromptEvent;
		};
		const onOffline = () => showConnectionToast('offline');
		const onOnline = () => showConnectionToast('online');

		window.addEventListener('beforeinstallprompt', handler);
		window.addEventListener('appinstalled', () => {
			deferredPrompt = null;
		});
		window.addEventListener('offline', onOffline);
		window.addEventListener('online', onOnline);

		if (!navigator.onLine) {
			showConnectionToast('offline');
		} else {
			// Hangatkan cache 4 tab utama di background supaya saat tiba-tiba offline semuanya siap dibuka
			setTimeout(() => {
				for (const path of ['/', '/tagihan', '/pengeluaran', '/riwayat']) {
					if (path !== page.url.pathname) preloadData(path).catch(() => {});
				}
			}, 1500);
		}

		return () => {
			clearTimeout(toastTimer);
			window.removeEventListener('beforeinstallprompt', handler);
			window.removeEventListener('offline', onOffline);
			window.removeEventListener('online', onOnline);
		};
	});

	async function installApp() {
		if (!deferredPrompt) return;
		await deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;
		if (outcome === 'accepted') deferredPrompt = null;
	}

	const nav = [
		{ href: '/', label: 'Dashboard', icon: IconLayoutDashboard },
		{ href: '/tagihan', label: 'Tagihan', icon: IconReceipt2 },
		{ href: '/pengeluaran', label: 'Pengeluaran', icon: IconShoppingCart },
		{ href: '/riwayat', label: 'Riwayat', icon: IconHistory }
	];

	const isNavigating = $derived(navigating.to !== null);
	// Langsung nyalakan tab tujuan begitu disentuh supaya terasa instan di PWA
	const activePath = $derived(navigating.to?.url.pathname ?? page.url.pathname);

	const isActive = (href: string) =>
		href === '/' ? activePath === '/' : activePath.startsWith(href);
</script>

<svelte:head>
	<title>{APP_NAME}</title>
</svelte:head>

<div class="min-h-screen pb-20 md:pb-0">
	<header class="sticky top-0 z-40 border-b bg-background">
		{#if isNavigating}
			<div class="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-muted">
				<div class="h-full w-2/3 animate-pulse bg-primary"></div>
			</div>
		{/if}
		<div class="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4">
			<a href="/" class="flex items-center gap-2 font-semibold">
				{APP_NAME}
				{#if isNavigating}
					<IconLoader2 class="size-4 animate-spin text-muted-foreground" />
				{/if}
			</a>
			<!-- Navigasi desktop -->
			<nav class="hidden gap-1 md:flex">
				{#each nav as item (item.href)}
					<a
						href={item.href}
						class="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors {isActive(item.href)
							? 'bg-accent font-medium text-foreground'
							: 'text-muted-foreground hover:text-foreground'}"
					>
						<item.icon class="size-4" />
						{item.label}
					</a>
				{/each}
			</nav>

			{#if deferredPrompt}
				<div class="ml-auto">
					<Button variant="outline" size="sm" onclick={installApp}>
						<IconDownload />
						Install App
					</Button>
				</div>
			{/if}
		</div>
	</header>

	<!-- Toast status koneksi (muncul otomatis beberapa detik lalu hilang) -->
	{#if connectionToast}
		<div
			role="status"
			aria-live="polite"
			class="fixed left-1/2 top-16 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-xs font-medium shadow-md transition-all {connectionToast ===
			'offline'
				? 'bg-amber-600 text-white'
				: 'bg-emerald-600 text-white'}"
		>
			{#if connectionToast === 'offline'}
				<IconWifiOff class="size-4 shrink-0" />
				<span>Anda sedang offline</span>
			{:else}
				<IconWifi class="size-4 shrink-0" />
				<span>Kembali online</span>
			{/if}
		</div>
	{/if}

	<main class="mx-auto max-w-5xl px-4 py-6 transition-opacity {isNavigating ? 'opacity-60' : ''}">
		{@render children()}
	</main>

	<!-- Navigasi bawah untuk mobile (terasa seperti app native saat di-install sebagai PWA) -->
	<nav class="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t bg-background md:hidden">
		{#each nav as item (item.href)}
			{@const targetLoading =
				isNavigating &&
				(item.href === '/'
					? navigating.to?.url.pathname === '/'
					: navigating.to?.url.pathname.startsWith(item.href))}
			<a
				href={item.href}
				class="flex flex-col items-center gap-1 py-2 text-[11px] transition-colors {isActive(item.href)
					? 'font-medium text-foreground'
					: 'text-muted-foreground'}"
			>
				{#if targetLoading}
					<IconLoader2 class="size-5 animate-spin" />
				{:else}
					<item.icon class="size-5" />
				{/if}
				{item.label}
			</a>
		{/each}
	</nav>
</div>
