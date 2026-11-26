<script lang="ts">
	import { enhance } from '$app/forms';
	import { Badge } from '$components/ui/badge';
	import { formatRupiah } from '$lib/utils/format';
	import { IconTrash, IconLoader2 } from '@tabler/icons-svelte';
	import type { Income } from './income.schema';

	let { incomes }: { incomes: Income[] } = $props();

	let deletingId = $state<number | null>(null);
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
				<form
					method="POST"
					action="/?/deleteIncome"
					use:enhance={() => {
						deletingId = income.id;
						return async ({ update }) => {
							await update();
							deletingId = null;
						};
					}}
				>
					<input type="hidden" name="id" value={income.id} />
					<button
						type="submit"
						disabled={deletingId === income.id}
						class="text-muted-foreground hover:text-red-600 disabled:opacity-50"
						title="Hapus"
					>
						{#if deletingId === income.id}
							<IconLoader2 class="size-4 animate-spin" />
						{:else}
							<IconTrash class="size-4" />
						{/if}
					</button>
				</form>
			{:else}
				<span class="w-4"></span>
			{/if}
		</li>
	{/each}
</ul>
