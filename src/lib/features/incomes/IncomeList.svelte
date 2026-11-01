<script lang="ts">
	import { enhance } from '$app/forms';
	import { Badge } from '$components/ui/badge';
	import { formatRupiah } from '$lib/utils/format';
	import { IconTrash } from '@tabler/icons-svelte';
	import type { Income } from './income.schema';

	let { incomes }: { incomes: Income[] } = $props();
</script>

<ul class="divide-y rounded-lg border">
	{#each incomes as income (income.id)}
		<li class="flex items-center gap-3 px-4 py-3">
			<p class="flex-1 truncate text-sm font-medium">{income.label}</p>
			<Badge variant={income.type === 'PRIMARY' ? 'secondary' : 'outline'}>
				{income.type === 'PRIMARY' ? 'Utama' : 'Ekstra'}
			</Badge>
			<p class="w-28 text-right text-sm font-medium tabular-nums text-emerald-700">
				+ {formatRupiah(income.amount)}
			</p>
			<!-- Pemasukan utama tidak bisa dihapus agar siklus selalu punya basis -->
			{#if income.type === 'EXTRA'}
				<form method="POST" action="/?/deleteIncome" use:enhance>
					<input type="hidden" name="id" value={income.id} />
					<button type="submit" class="text-muted-foreground hover:text-red-600" title="Hapus">
						<IconTrash class="size-4" />
					</button>
				</form>
			{:else}
				<span class="w-4"></span>
			{/if}
		</li>
	{/each}
</ul>
