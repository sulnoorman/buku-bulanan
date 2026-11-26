<script lang="ts">
	import { Card } from '$components/ui/card';
	import { Badge } from '$components/ui/badge';
	import { formatRupiah, formatTanggal } from '$lib/utils/format';
	import type { CycleSummary } from '$features/dashboard/dashboard.service';

	let { summaries }: { summaries: CycleSummary[] } = $props();
</script>

{#if summaries.length === 0}
	<Card variant="dashed" padding="lg" class="py-section-lg">
		Belum ada siklus yang selesai.
	</Card>
{:else}
	<!-- Tampilan Mobile / PWA: Card Item List -->
	<ul class="space-y-stack-base md:hidden">
		{#each summaries as { cycle, totals, counts } (cycle.id)}
			<Card as="li" padding="base">
				<div class="flex items-center justify-between gap-stack-sm">
					<span class="font-mono font-semibold tracking-tight">Siklus #{cycle.cycleNumber}</span>
					<Badge variant="outline">{counts.paid}/{counts.total} lunas</Badge>
				</div>
				<p class="mt-stack-xs text-xs text-muted-foreground">
					{formatTanggal(cycle.startDate)} – {cycle.endDate ? formatTanggal(cycle.endDate) : '…'}
				</p>

				<dl class="mt-stack-base grid grid-cols-2 gap-stack-sm border-t pt-stack-base text-sm">
					<div class="space-y-stack-xs">
						<dt class="text-xs text-muted-foreground">Pemasukan</dt>
						<dd class="font-mono font-medium tabular-nums">+{formatRupiah(totals.income)}</dd>
					</div>
					<div class="space-y-stack-xs">
						<dt class="text-xs text-muted-foreground">Tagihan dibayar</dt>
						<dd class="font-mono font-medium tabular-nums">−{formatRupiah(totals.paid)}</dd>
					</div>
					<div class="space-y-stack-xs">
						<dt class="text-xs text-muted-foreground">Pengeluaran</dt>
						<dd class="font-mono font-medium tabular-nums">−{formatRupiah(totals.expenses)}</dd>
					</div>
					<div class="space-y-stack-xs">
						<dt class="text-xs text-muted-foreground">Sisa akhir</dt>
						<dd
							class="font-mono font-semibold tabular-nums {totals.balance < 0
								? 'text-red-600 dark:text-red-400'
								: 'text-emerald-700 dark:text-emerald-400'}"
						>
							{formatRupiah(totals.balance)}
						</dd>
					</div>
				</dl>
			</Card>
		{/each}
	</ul>

	<!-- Tampilan Desktop: Tabel -->
	<Card padding="none" class="hidden overflow-x-auto md:block">
		<table class="w-full text-sm">
			<thead class="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
				<tr>
					<th class="px-card-base py-card-sm font-medium">Siklus</th>
					<th class="px-card-base py-card-sm font-medium">Periode</th>
					<th class="px-card-base py-card-sm text-right font-medium">Pemasukan</th>
					<th class="px-card-base py-card-sm text-right font-medium">Tagihan</th>
					<th class="px-card-base py-card-sm text-right font-medium">Pengeluaran</th>
					<th class="px-card-base py-card-sm text-right font-medium">Sisa Akhir</th>
				</tr>
			</thead>
			<tbody class="divide-y">
				{#each summaries as { cycle, totals, counts } (cycle.id)}
					<tr>
						<td class="px-card-base py-card-sm font-mono font-semibold">#{cycle.cycleNumber}</td>
						<td class="px-card-base py-card-sm text-muted-foreground">
							{formatTanggal(cycle.startDate)} – {cycle.endDate ? formatTanggal(cycle.endDate) : '…'}
						</td>
						<td class="px-card-base py-card-sm text-right font-mono tabular-nums">
							+{formatRupiah(totals.income)}
						</td>
						<td class="px-card-base py-card-sm text-right font-mono tabular-nums">
							−{formatRupiah(totals.paid)}
							<span class="block text-xs text-muted-foreground">{counts.paid}/{counts.total} lunas</span>
						</td>
						<td class="px-card-base py-card-sm text-right font-mono tabular-nums">
							−{formatRupiah(totals.expenses)}
						</td>
						<td
							class="px-card-base py-card-sm text-right font-mono font-semibold tabular-nums {totals.balance <
							0
								? 'text-red-600 dark:text-red-400'
								: 'text-emerald-700 dark:text-emerald-400'}"
						>
							{formatRupiah(totals.balance)}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</Card>
{/if}
