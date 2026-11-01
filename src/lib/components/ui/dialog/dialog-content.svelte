<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { IconX } from '@tabler/icons-svelte';
	import { cn } from '$lib/utils';

	let { class: className, children, ...rest }: DialogPrimitive.ContentProps = $props();
</script>

<DialogPrimitive.Portal>
	<DialogPrimitive.Overlay class="fixed inset-0 z-50 bg-black/40" />
	<DialogPrimitive.Content
		class={cn(
			'fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-background p-6',
			className
		)}
		{...rest}
	>
		{@render children?.()}
		<DialogPrimitive.Close
			class="absolute right-4 top-4 rounded-sm text-muted-foreground hover:text-foreground"
		>
			<IconX class="size-4" />
			<span class="sr-only">Tutup</span>
		</DialogPrimitive.Close>
	</DialogPrimitive.Content>
</DialogPrimitive.Portal>
