<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const badgeVariants = tv({
		base: 'inline-flex items-center rounded-badge border px-badge-x py-badge-y font-mono text-[11px] font-medium tracking-tight',
		variants: {
			variant: {
				default: 'border-transparent bg-primary text-primary-foreground',
				secondary: 'border-transparent bg-secondary text-secondary-foreground',
				outline: 'border-border bg-card/60 text-muted-foreground',
				success: 'border-emerald-300/80 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300',
				warning: 'border-amber-300/80 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300',
				destructive: 'border-red-300/80 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-300'
			}
		},
		defaultVariants: { variant: 'default' }
	});

	export type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	let {
		class: className,
		variant = 'default',
		children,
		...rest
	}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant } = $props();
</script>

<span class={cn(badgeVariants({ variant }), className)} {...rest}>
	{@render children?.()}
</span>
