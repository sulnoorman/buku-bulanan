<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { APP_NAME } from '$lib/utils/constants';
	import { Button } from '$components/ui/button';
	import {
		IconLayoutDashboard,
		IconReceipt2,
		IconShoppingCart,
		IconHistory,
		IconDownload
	} from '@tabler/icons-svelte';

	let { children } = $props();

	interface BeforeInstallPromptEvent extends Event {
		prompt: () => Promise<void>;
		userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
	}

	let deferredPrompt = $state<BeforeInstallPromptEvent | null>(null);

	onMount(() => {
		const handler = (e: Event) => {
			e.preventDefault();
			deferredPrompt = e as BeforeInstallPromptEvent;
		};
		window.addEventListener('beforeinstallprompt', handler);
		window.addEventListener('appinstalled', () => {
			deferredPrompt = null;
		});
		return () => window.removeEventListener('beforeinstallprompt', handler);
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

	const isActive = (href: string) =>
		href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);
</script>

<svelte:head>
	<title>{APP_NAME}</title>
</svelte:head>

<div class="min-h-screen pb-20 md:pb-0">
	<header class="sticky top-0 z-40 border-b bg-background">
		<div class="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4">
			<a href="/" class="font-semibold">{APP_NAME}</a>
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

	<main class="mx-auto max-w-5xl px-4 py-6">
		{@render children()}
	</main>

	<!-- Navigasi bawah untuk mobile (terasa seperti app native saat di-install sebagai PWA) -->
	<nav class="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t bg-background md:hidden">
		{#each nav as item (item.href)}
			<a
				href={item.href}
				class="flex flex-col items-center gap-1 py-2 text-[11px] {isActive(item.href)
					? 'font-medium text-foreground'
					: 'text-muted-foreground'}"
			>
				<item.icon class="size-5" />
				{item.label}
			</a>
		{/each}
	</nav>
</div>
