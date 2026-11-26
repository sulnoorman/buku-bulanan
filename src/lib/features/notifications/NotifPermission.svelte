<script lang="ts">
	import { onMount } from 'svelte';
	import { Card } from '$components/ui/card';
	import { Button } from '$components/ui/button';
	import { IconBell, IconBellRinging, IconLoader2, IconSend } from '@tabler/icons-svelte';
	import {
		enablePush,
		getPushState,
		sendTestNotification,
		syncPushSubscription,
		type PushState
	} from './push.client';

	let pushState = $state<PushState>('unsupported');
	let busy = $state(false);

	onMount(() => {
		pushState = getPushState();
		if (pushState === 'granted') {
			syncPushSubscription().catch(() => {});
		}
	});

	async function handleEnable() {
		busy = true;
		try {
			pushState = await enablePush();
		} finally {
			busy = false;
		}
	}

	async function handleTest() {
		busy = true;
		try {
			await sendTestNotification();
		} finally {
			busy = false;
		}
	}
</script>

{#if pushState === 'default'}
	<Card padding="base" class="flex items-center gap-stack-base text-sm">
		<IconBell class="size-icon-base shrink-0 text-muted-foreground" />
		<p class="flex-1 text-muted-foreground">Aktifkan notifikasi untuk pengingat jatuh tempo.</p>
		<Button variant="outline" size="sm" onclick={handleEnable} disabled={busy}>
			{#if busy}
				<IconLoader2 class="animate-spin" />
			{:else}
				<IconBell />
			{/if}
			Aktifkan
		</Button>
	</Card>
{:else if pushState === 'granted'}
	<Card variant="muted" padding="sm" class="flex items-center justify-between gap-stack-base text-xs">
		<div class="flex items-center gap-stack-sm text-muted-foreground">
			<IconBellRinging class="size-icon-base shrink-0 text-emerald-600 dark:text-emerald-400" />
			<span>Pengingat Web Push aktif (otomatis setiap 07:00 WIB).</span>
		</div>
		<Button variant="outline" size="sm" onclick={handleTest} disabled={busy}>
			{#if busy}
				<IconLoader2 class="animate-spin" />
			{:else}
				<IconSend />
			{/if}
			Kirim Tes
		</Button>
	</Card>
{/if}
