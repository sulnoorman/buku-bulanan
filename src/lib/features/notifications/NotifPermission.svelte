<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$components/ui/button';
	import { IconBell, IconBellRinging } from '@tabler/icons-svelte';
	import { enablePush, getPushState, sendTestNotification, type PushState } from './push.client';

	let pushState = $state<PushState>('unsupported');

	onMount(() => {
		pushState = getPushState();
	});

	async function handleEnable() {
		pushState = await enablePush();
	}
</script>

{#if pushState === 'default'}
	<div class="flex items-center gap-3 rounded-lg border p-3 text-sm">
		<IconBell class="size-4 shrink-0 text-muted-foreground" />
		<p class="flex-1 text-muted-foreground">Aktifkan notifikasi untuk pengingat jatuh tempo.</p>
		<Button variant="outline" size="sm" onclick={handleEnable}>Aktifkan</Button>
	</div>
{:else if pushState === 'granted'}
	<div class="flex items-center gap-3 text-xs text-muted-foreground">
		<IconBellRinging class="size-4" />
		<span>Notifikasi aktif.</span>
		<button class="underline hover:text-foreground" onclick={sendTestNotification}>Kirim tes</button>
	</div>
{/if}
