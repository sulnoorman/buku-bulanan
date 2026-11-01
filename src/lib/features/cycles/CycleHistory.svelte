<script lang="ts">
	import { formatRupiah, formatTanggal } from '$lib/utils/format';
	import type { CycleSummary } from '$features/dashboard/dashboard.service';

	let { summaries }: { summaries: CycleSummary[] } = $props();
</script>

{#if summaries.length === 0}
	<p class="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
		Belum ada siklus yang selesai.
	</p>
{:else}
	<div class="overflow-x-auto rounded-lg border">
		<table class="w-full text-sm">
			<thead class="border-b bg-muted/50 text-left text-xs text-muted-foreground">
				<tr>
					<th class="px-4 py-2 font-medium">Siklus</th>
					<th class="px-4 py-2 font-medium">Periode</th>
					<th class="px-4 py-2 text-right font-medium">Pemasukan</th>
					<th class="px-4 py-2 text-right font-medium">Tagihan</th>
					<th class="px-4 py-2 text-right font-medium">Pengeluaran</th>
					<th class="px-4 py-2 text-right font-medium">Sisa</th>
				</tr>
			</thead>
			<tbody class="divide-y">
				{#each summaries as { cycle, totals, counts } (cycle.id)}
					<tr>
						<td class="px-4 py-3 font-medium">#{cycle.cycleNumber}</td>
						<td class="px-4 py-3 text-muted-foreground">
							{formatTanggal(cycle.startDate)} – {cycle.endDate ? formatTanggal(cycle.endDate) : '…'}
						</td>
						<td class="px-4 py-3 text-right tabular-nums">{formatRupiah(totals.income)}</td>
						<td class="px-4 py-3 text-right tabular-nums">
							{formatRupiah(totals.paid)}
							<span class="block text-xs text-muted-foreground">{counts.paid}/{counts.total} lunas</span>
						</td>
						<td class="px-4 py-3 text-right tabular-nums">{formatRupiah(totals.expenses)}</td>
						<td
							class="px-4 py-3 text-right font-medium tabular-nums {totals.balance < 0
								? 'text-red-600'
								: 'text-emerald-700'}"
						>
							{formatRupiah(totals.balance)}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
