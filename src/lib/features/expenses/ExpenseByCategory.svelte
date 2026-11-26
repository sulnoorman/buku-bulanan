<script lang="ts">
	import { Card } from '$components/ui/card';
	import { formatRupiah } from '$lib/utils/format';
	import type { Expense } from './expense.schema';

	let { expenses }: { expenses: Expense[] } = $props();

	// Total per kategori, diurutkan dari yang terbesar
	const byCategory = $derived.by(() => {
		const map = new Map<string, number>();
		for (const e of expenses) map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
		return [...map].sort((a, b) => b[1] - a[1]);
	});
	const total = $derived(expenses.reduce((s, e) => s + e.amount, 0));
</script>

{#if total > 0}
	<Card as="section" padding="base">
		<div class="flex items-baseline justify-between gap-stack-sm">
			<p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
				Total Pengeluaran
			</p>
			<p class="font-mono text-lg font-bold tracking-tight tabular-nums">
				{formatRupiah(total)}
			</p>
		</div>
		<ul class="mt-stack-base space-y-stack-sm">
			{#each byCategory as [category, amount] (category)}
				<li class="space-y-stack-xs text-sm">
					<div class="flex justify-between">
						<span class="font-medium">{category}</span>
						<span class="font-mono text-xs text-muted-foreground tabular-nums">
							{formatRupiah(amount)}
						</span>
					</div>
					<div class="h-progress overflow-hidden rounded-full bg-muted">
						<div
							class="h-full rounded-full bg-foreground/75 transition-all duration-300"
							style="width: {(amount / total) * 100}%"
						></div>
					</div>
				</li>
			{/each}
		</ul>
	</Card>
{/if}
