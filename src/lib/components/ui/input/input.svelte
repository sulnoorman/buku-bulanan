<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	let { class: className, value = $bindable(), ...rest }: HTMLInputAttributes = $props();
</script>

<input
	bind:value
	class={cn(
		'flex h-control-base w-full rounded-control border border-input bg-card px-btn-x-sm text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
	{...rest}
/>
