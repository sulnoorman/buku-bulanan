<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	// Native <select>: ringan, aksesibel, dan nyaman di mobile.
	let { class: className, value = $bindable(), children, ...rest }: HTMLSelectAttributes = $props();
</script>

<select
	bind:value
	class={cn(
		'flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50',
		className
	)}
	{...rest}
>
	{@render children?.()}
</select>
