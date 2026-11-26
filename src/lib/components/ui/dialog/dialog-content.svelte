<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { IconX } from '@tabler/icons-svelte';
	import { cn } from '$lib/utils';

	let { class: className, children, ...rest }: DialogPrimitive.ContentProps = $props();
</script>

<DialogPrimitive.Portal>
	<DialogPrimitive.Overlay class="fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px]" />
	<DialogPrimitive.Content
		class={cn(
			'fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-stack-md rounded-card border bg-card p-card-lg text-card-foreground',
			className
		)}
		{...rest}
	>
		{@render children?.()}
		<DialogPrimitive.Close
			class="absolute right-card-base top-card-base inline-flex size-control-sm aspect-square items-center justify-center rounded-control text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
		>
			<IconX class="size-icon-base" />
			<span class="sr-only">Tutup</span>
		</DialogPrimitive.Close>
	</DialogPrimitive.Content>
</DialogPrimitive.Portal>
