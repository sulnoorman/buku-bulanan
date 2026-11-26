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
		IconWifi,
		IconMoon,
		IconSun
	} from '@tabler/icons-svelte';

	let { children } = $props();

	interface BeforeInstallPromptEvent extends Event {
		prompt: () => Promise<void>;
		userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
	}

	let deferredPrompt = $state<BeforeInstallPromptEvent | null>(null);
	let connectionToast = $state<'offline' | 'online' | null>(null);
	let isDark = $state(false);
	let toastTimer: ReturnType<typeof setTimeout> | undefined;

	function applyTheme(dark: boolean) {
		isDark = dark;
		document.documentElement.classList.toggle('dark', dark);
		const meta = document.getElementById('meta-theme-color');
		if (meta) meta.setAttribute('content', dark ? '#212734' : '#ffffff');
		try {
			localStorage.setItem('bb-theme', dark ? 'dark' : 'light');
		} catch {}
	}

	function toggleTheme() {
		applyTheme(!isDark);
	}

	function showConnectionToast(kind: 'offline' | 'online') {
		clearTimeout(toastTimer);
		connectionToast = kind;
		toastTimer = setTimeout(() => {
			connectionToast = null;
		}, 3500);
	}

	onMount(() => {
		isDark = document.documentElement.classList.contains('dark');

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

<div class="min-h-screen pb-bottom-nav md:pb-0">
	<header class="sticky top-0 z-40 border-b bg-card/95 backdrop-blur-sm">
		{#if isNavigating}
			<div class="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-muted">
				<div class="h-full w-2/3 animate-pulse bg-primary"></div>
			</div>
		{/if}
		<div class="mx-auto flex h-header max-w-5xl items-center gap-stack-lg px-page-x">
			<a href="/" class="flex items-center gap-stack-sm font-semibold tracking-tight">
				{APP_NAME}
				{#if isNavigating}
					<IconLoader2 class="size-icon-base animate-spin text-muted-foreground" />
				{/if}
			</a>
			<!-- Navigasi desktop -->
			<nav class="hidden gap-stack-xs md:flex">
				{#each nav as item (item.href)}
					<a
						href={item.href}
						class="inline-flex h-control-sm items-center gap-gap-btn rounded-control px-btn-x-sm text-sm transition-colors {isActive(
							item.href
						)
							? 'bg-accent font-medium text-foreground'
							: 'text-muted-foreground hover:text-foreground'}"
					>
						<item.icon class="size-icon-base" />
						{item.label}
					</a>
				{/each}
			</nav>

			<!-- Aksi Header Kanan (Paritas Tombol: sama-sama Button variant="outline" size="sm" dengan Ikon + Teks) -->
			<div class="ml-auto flex items-center gap-stack-sm">
				<Button
					variant="outline"
					size="sm"
					onclick={toggleTheme}
					title={isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
				>
					{#if isDark}
						<IconSun />
						<span>Terang</span>
					{:else}
						<IconMoon />
						<span>Gelap</span>
					{/if}
				</Button>

				{#if deferredPrompt}
					<Button variant="outline" size="sm" onclick={installApp}>
						<IconDownload />
						<span>Install App</span>
					</Button>
				{/if}
			</div>
		</div>
	</header>

	<!-- Toast status koneksi (muncul otomatis beberapa detik lalu hilang) -->
	{#if connectionToast}
		<div
			role="status"
			aria-live="polite"
			class="fixed left-1/2 top-header z-50 mt-stack-sm flex -translate-x-1/2 items-center gap-gap-btn rounded-control px-btn-x-base py-stack-xs text-xs font-medium transition-all {connectionToast ===
			'offline'
				? 'bg-amber-600 text-white'
				: 'bg-emerald-600 text-white'}"
		>
			{#if connectionToast === 'offline'}
				<IconWifiOff class="size-icon-base shrink-0" />
				<span>Anda sedang offline</span>
			{:else}
				<IconWifi class="size-icon-base shrink-0" />
				<span>Kembali online</span>
			{/if}
		</div>
	{/if}

	<main
		class="mx-auto max-w-5xl px-page-x py-section-base transition-opacity {isNavigating
			? 'opacity-60'
			: ''}"
	>
		{@render children()}
	</main>

	<!-- Navigasi bawah untuk mobile (terasa seperti app native saat di-install sebagai PWA) -->
	<nav class="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t bg-card/95 backdrop-blur-sm md:hidden">
		{#each nav as item (item.href)}
			{@const targetLoading =
				isNavigating &&
				(item.href === '/'
					? navigating.to?.url.pathname === '/'
					: navigating.to?.url.pathname.startsWith(item.href))}
			<a
				href={item.href}
				class="flex flex-col items-center gap-stack-xs py-stack-sm text-[11px] transition-colors {isActive(
					item.href
				)
					? 'font-semibold text-foreground'
					: 'text-muted-foreground'}"
			>
				{#if targetLoading}
					<IconLoader2 class="size-icon-md animate-spin" />
				{:else}
					<item.icon class="size-icon-md" />
				{/if}
				{item.label}
			</a>
		{/each}
	</nav>
</div>
