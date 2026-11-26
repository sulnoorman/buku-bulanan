<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	let { class: className, value = $bindable(), children, ...rest }: HTMLSelectAttributes = $props();
</script>

<select
	bind:value
	class={cn(
		'flex h-control-base w-full rounded-control border border-input bg-card px-btn-x-sm text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50',
		className
	)}
	{...rest}
>
	{@render children?.()}
</select>
