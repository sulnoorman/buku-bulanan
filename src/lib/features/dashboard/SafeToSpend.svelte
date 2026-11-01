<script lang="ts">
	import { formatRupiah } from '$lib/utils/format';
	import type { CycleSummary } from './dashboard.service';

	let { totals }: { totals: CycleSummary['totals'] } = $props();

	const negative = $derived(totals.safeToSpend < 0);
</script>

<!-- Metrik utama: angka besar, rincian rumus di bawahnya agar transparan -->
<section class="rounded-lg border p-5">
	<p class="text-sm text-muted-foreground">Aman dibelanjakan</p>
	<p
		class="mt-1 text-4xl font-semibold tracking-tight tabular-nums {negative
			? 'text-red-600'
			: 'text-foreground'}"
	>
		{formatRupiah(totals.safeToSpend)}
	</p>
	{#if negative}
		<p class="mt-1 text-sm text-red-600">Pengeluaran melebihi pemasukan siklus ini.</p>
	{/if}

	<dl class="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 border-t pt-4 text-sm sm:grid-cols-4">
		<div>
			<dt class="text-muted-foreground">Pemasukan</dt>
			<dd class="font-medium tabular-nums">{formatRupiah(totals.income)}</dd>
		</div>
		<div>
			<dt class="text-muted-foreground">Tagihan dibayar</dt>
			<dd class="font-medium tabular-nums">− {formatRupiah(totals.paid)}</dd>
		</div>
		<div>
			<dt class="text-muted-foreground">Pengeluaran</dt>
			<dd class="font-medium tabular-nums">− {formatRupiah(totals.expenses)}</dd>
		</div>
		<div>
			<dt class="text-muted-foreground">Tagihan belum dibayar</dt>
			<dd class="font-medium tabular-nums text-amber-700">− {formatRupiah(totals.unpaid)}</dd>
		</div>
	</dl>
	<p class="mt-3 text-xs text-muted-foreground">
		Saldo saat ini <span class="font-medium text-black">{formatRupiah(totals.balance)}</span>, dikurangi tagihan yang belum dibayar sebesar.
	</p>
</section>
