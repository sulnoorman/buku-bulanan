<script lang="ts">
	import { Card } from '$components/ui/card';
	import { Badge } from '$components/ui/badge';
	import { formatRupiah } from '$lib/utils/format';
	import type { CycleSummary } from './dashboard.service';

	let { totals }: { totals: CycleSummary['totals'] } = $props();

	const negative = $derived(totals.safeToSpend < 0);
</script>

<!-- Metrik utama: angka besar, jatah aman harian, serta rincian rumus transparan -->
<Card as="section" padding="lg">
	<div class="flex items-center justify-between gap-stack-sm">
		<p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
			Aman Dibelanjakan (Safe-to-Spend)
		</p>
		<Badge variant={negative ? 'destructive' : 'success'}>
			{negative ? 'Defisit' : 'Terkendali'}
		</Badge>
	</div>

	<p
		class="mt-stack-sm text-3xl font-bold tracking-tight tabular-nums sm:text-4xl {negative
			? 'text-red-600 dark:text-red-400'
			: 'text-foreground'}"
	>
		{formatRupiah(totals.safeToSpend)}
	</p>

	{#if negative}
		<p class="mt-stack-xs text-xs font-medium text-red-600 dark:text-red-400">
			Pengeluaran & tagihan melebihi pemasukan siklus ini.
		</p>
	{:else}
		<!-- Metrik Pacing Harian: Jatah Aman per Hari sampai tanggal reset berikutnya -->
		<div
			class="mt-stack-base flex flex-wrap items-center justify-between gap-stack-sm rounded-control bg-muted/55 text-xs"
		>
			<span class="text-muted-foreground">
				Jatah aman harian (<span class="font-medium text-foreground">{totals.daysRemaining} hari</span> tersisa)
			</span>
			<span class="font-semibold tracking-tight tabular-nums text-emerald-700 dark:text-emerald-400">
				{formatRupiah(totals.dailySafeToSpend)} / hari
			</span>
		</div>
	{/if}

	<dl
		class="mt-stack-lg grid grid-cols-2 gap-x-stack-lg gap-y-stack-base border-t pt-stack-md text-sm sm:grid-cols-4"
	>
		<div class="space-y-stack-xs">
			<dt class="text-xs text-muted-foreground">Pemasukan</dt>
			<dd class="font-semibold tracking-tight tabular-nums text-emerald-700 dark:text-emerald-400">
				+{formatRupiah(totals.income)}
			</dd>
		</div>
		<div class="space-y-stack-xs">
			<dt class="text-xs text-muted-foreground">Tagihan dibayar</dt>
			<dd class="font-medium tracking-tight tabular-nums">
				−{formatRupiah(totals.paid)}
			</dd>
		</div>
		<div class="space-y-stack-xs">
			<dt class="text-xs text-muted-foreground">Pengeluaran</dt>
			<dd class="font-medium tracking-tight tabular-nums">
				−{formatRupiah(totals.expenses)}
			</dd>
		</div>
		<div class="space-y-stack-xs">
			<dt class="text-xs text-muted-foreground">Tagihan belum bayar</dt>
			<dd class="font-semibold tracking-tight tabular-nums text-amber-700 dark:text-amber-400">
				−{formatRupiah(totals.unpaid)}
			</dd>
		</div>
	</dl>

	<p class="mt-stack-md border-t border-dashed pt-stack-base text-xs text-muted-foreground">
		Saldo kas saat ini
		<span class="font-semibold tabular-nums text-foreground">{formatRupiah(totals.balance)}</span>,
		dikurangi sisa kewajiban wajib yang belum dibayar.
	</p>
</Card>
