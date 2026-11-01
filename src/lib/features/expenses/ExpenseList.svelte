<script lang="ts">
	import { enhance } from '$app/forms';
	import { Badge } from '$components/ui/badge';
	import { formatRupiah, formatTanggalPendek } from '$lib/utils/format';
	import { IconTrash } from '@tabler/icons-svelte';
	import type { Expense } from './expense.schema';

	let { expenses }: { expenses: Expense[] } = $props();
</script>

{#if expenses.length === 0}
	<p class="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
		Belum ada pengeluaran di siklus ini.
	</p>
{:else}
	<ul class="divide-y rounded-lg border">
		{#each expenses as expense (expense.id)}
			<li class="flex items-center gap-3 px-4 py-3">
				<span class="w-14 shrink-0 text-xs text-muted-foreground">{formatTanggalPendek(expense.date)}</span>
				<div class="min-w-0 flex-1">
					<p class="truncate text-sm font-medium">{expense.label}</p>
					{#if expense.note}<p class="truncate text-xs text-muted-foreground">{expense.note}</p>{/if}
				</div>
				<Badge variant="outline" class="hidden sm:inline-flex">{expense.category}</Badge>
				<p class="w-28 text-right text-sm font-medium tabular-nums">− {formatRupiah(expense.amount)}</p>
				<form method="POST" action="/pengeluaran?/delete" use:enhance>
					<input type="hidden" name="id" value={expense.id} />
					<button type="submit" class="text-muted-foreground hover:text-red-600" title="Hapus">
						<IconTrash class="size-4" />
					</button>
				</form>
			</li>
		{/each}
	</ul>
{/if}
