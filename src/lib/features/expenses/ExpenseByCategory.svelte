<script lang="ts">
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
	<section class="rounded-lg border p-4">
		<div class="flex items-baseline justify-between">
			<p class="text-sm text-muted-foreground">Total pengeluaran</p>
			<p class="text-lg font-semibold tabular-nums">{formatRupiah(total)}</p>
		</div>
		<ul class="mt-3 space-y-2">
			{#each byCategory as [category, amount] (category)}
				<li class="text-sm">
					<div class="flex justify-between">
						<span>{category}</span>
						<span class="tabular-nums text-muted-foreground">{formatRupiah(amount)}</span>
					</div>
					<div class="mt-1 h-1.5 rounded-full bg-muted">
						<div class="h-full rounded-full bg-foreground/70" style="width: {(amount / total) * 100}%"></div>
					</div>
				</li>
			{/each}
		</ul>
	</section>
{/if}
