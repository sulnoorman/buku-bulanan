<script lang="ts">
	import { Card } from '$components/ui/card';
	import { formatTanggal } from '$lib/utils/format';
	import type { CycleSummary } from './dashboard.service';

	let { summary }: { summary: CycleSummary } = $props();

	const progress = $derived(
		summary.counts.total ? Math.round((summary.counts.paid / summary.counts.total) * 100) : 0
	);
</script>

<!-- Grid statistik dengan tinggi seragam (stretch) dan padding token identik -->
<Card
	as="section"
	padding="none"
	class="grid grid-cols-2 items-stretch divide-x divide-y sm:grid-cols-3 sm:divide-y-0"
>
	<div class="flex flex-col justify-between p-card-base">
		<p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Siklus Aktif</p>
		<p class="mt-stack-xs font-mono text-lg font-bold tracking-tight tabular-nums">
			#{summary.cycle.cycleNumber}
		</p>
		<p class="mt-stack-xs text-xs text-muted-foreground">
			Sejak {formatTanggal(summary.cycle.startDate)}
		</p>
	</div>

	<div class="flex flex-col justify-between p-card-base">
		<div class="flex items-center justify-between gap-stack-xs">
			<p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tagihan Lunas</p>
			<span class="font-mono text-xs text-muted-foreground">{progress}%</span>
		</div>
		<p class="mt-stack-xs font-mono text-lg font-bold tracking-tight tabular-nums">
			{summary.counts.paid} / {summary.counts.total}
		</p>
		<div class="mt-stack-sm h-progress overflow-hidden rounded-full bg-muted">
			<div
				class="h-full rounded-full bg-emerald-600 transition-all duration-300"
				style="width: {progress}%"
			></div>
		</div>
	</div>

	<div class="col-span-2 flex flex-col justify-between p-card-base sm:col-span-1">
		<p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Reset Berikutnya</p>
		<p class="mt-stack-xs font-mono text-lg font-bold tracking-tight tabular-nums">
			Tgl {summary.cycle.dueDay}
		</p>
		<p class="mt-stack-xs text-xs text-muted-foreground">Menunggu konfirmasi manual</p>
	</div>
</Card>
