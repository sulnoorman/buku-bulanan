<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const cardVariants = tv({
		base: 'rounded-card border text-card-foreground transition-colors',
		variants: {
			variant: {
				default: 'bg-card',
				muted: 'bg-muted/40',
				dashed: 'border-dashed bg-card/50 text-center text-sm text-muted-foreground',
				warning: 'border-amber-300/80 bg-amber-50/90 text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-100',
				danger: 'border-red-300/80 bg-red-50/90 text-red-950 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-100'
			},
			padding: {
				none: 'p-0',
				sm: 'p-card-sm',
				base: 'p-card-base',
				md: 'p-card-md',
				lg: 'p-card-lg'
			}
		},
		defaultVariants: {
			variant: 'default',
			padding: 'base'
		}
	});

	export type CardVariant = VariantProps<typeof cardVariants>['variant'];
	export type CardPadding = VariantProps<typeof cardVariants>['padding'];
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	type Props = HTMLAttributes<HTMLElement> & {
		as?: 'div' | 'section' | 'li' | 'article';
		variant?: CardVariant;
		padding?: CardPadding;
	};

	let {
		as = 'div',
		class: className,
		variant = 'default',
		padding = 'base',
		children,
		...rest
	}: Props = $props();
</script>

<svelte:element this={as} class={cn(cardVariants({ variant, padding }), className)} {...rest}>
	{@render children?.()}
</svelte:element>
