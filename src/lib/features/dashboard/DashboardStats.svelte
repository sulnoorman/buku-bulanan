<script lang="ts">
	import { formatTanggal } from '$lib/utils/format';
	import type { CycleSummary } from './dashboard.service';

	let { summary }: { summary: CycleSummary } = $props();

	const progress = $derived(
		summary.counts.total ? Math.round((summary.counts.paid / summary.counts.total) * 100) : 0
	);
</script>

<!-- Satu baris statistik ringkas dengan pembatas, bukan kartu-kartu terpisah -->
<section class="grid grid-cols-2 divide-x divide-y rounded-lg border sm:grid-cols-3 sm:divide-y-0">
	<div class="p-4">
		<p class="text-xs text-muted-foreground">Siklus</p>
		<p class="mt-1 font-semibold">#{summary.cycle.cycleNumber}</p>
		<p class="text-xs text-muted-foreground">sejak {formatTanggal(summary.cycle.startDate)}</p>
	</div>
	<div class="p-4">
		<p class="text-xs text-muted-foreground">Tagihan lunas</p>
		<p class="mt-1 font-semibold">{summary.counts.paid} / {summary.counts.total}</p>
		<div class="mt-2 h-1.5 rounded-full bg-muted">
			<div class="h-full rounded-full bg-emerald-600" style="width: {progress}%"></div>
		</div>
	</div>
	<div class="col-span-2 p-4 sm:col-span-1">
		<p class="text-xs text-muted-foreground">Reset berikutnya</p>
		<p class="mt-1 font-semibold">Tanggal {summary.cycle.dueDay}</p>
		<p class="text-xs text-muted-foreground">akan diminta konfirmasi</p>
	</div>
</section>
