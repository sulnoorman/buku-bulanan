<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$components/ui/button';
	import { IconBell, IconBellRinging, IconLoader2 } from '@tabler/icons-svelte';
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
	<div class="flex items-center gap-3 rounded-lg border p-3 text-sm">
		<IconBell class="size-4 shrink-0 text-muted-foreground" />
		<p class="flex-1 text-muted-foreground">Aktifkan notifikasi untuk pengingat jatuh tempo.</p>
		<Button variant="outline" size="sm" onclick={handleEnable} disabled={busy}>
			{#if busy}<IconLoader2 class="animate-spin" />{/if}
			Aktifkan
		</Button>
	</div>
{:else if pushState === 'granted'}
	<div class="flex items-center gap-3 text-xs text-muted-foreground">
		<IconBellRinging class="size-4" />
		<span>Notifikasi aktif.</span>
		<button
			class="inline-flex items-center gap-1 underline hover:text-foreground disabled:opacity-50"
			onclick={handleTest}
			disabled={busy}
		>
			{#if busy}<IconLoader2 class="size-3 animate-spin" />{/if}
			Kirim tes
		</button>
	</div>
{/if}
