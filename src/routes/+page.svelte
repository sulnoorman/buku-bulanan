<script lang="ts">
	import { Card } from '$components/ui/card';
	import { Button } from '$components/ui/button';
	import CycleBanner from '$features/cycles/CycleBanner.svelte';
	import SafeToSpend from '$features/dashboard/SafeToSpend.svelte';
	import DashboardStats from '$features/dashboard/DashboardStats.svelte';
	import DueDateAlert from '$features/dashboard/DueDateAlert.svelte';
	import BillList from '$features/bills/BillList.svelte';
	import IncomeList from '$features/incomes/IncomeList.svelte';
	import IncomeForm from '$features/incomes/IncomeForm.svelte';
	import ExpenseForm from '$features/expenses/ExpenseForm.svelte';
	import NotifPermission from '$features/notifications/NotifPermission.svelte';
	import { formatRupiah } from '$lib/utils/format';
	import { IconPlus, IconArrowRight } from '@tabler/icons-svelte';

	let { data } = $props();

	let incomeOpen = $state(false);
	let expenseOpen = $state(false);
</script>

<div class="space-y-stack-lg">
	{#if data.needsNewCycle}
		<CycleBanner dueDay={data.dueDay} isFirstCycle={data.isFirstCycle} />
	{/if}

	{#if data.summary}
		{@const s = data.summary}
		<SafeToSpend totals={s.totals} />
		<DueDateAlert bills={s.bills} />
		<DashboardStats summary={s} />

		<section class="space-y-stack-base">
			<div class="flex items-baseline justify-between gap-stack-base">
				<h2 class="text-base font-semibold tracking-tight">Tagihan Bulan Ini</h2>
				<p class="text-xs text-muted-foreground">
					Total <span class="font-semibold tabular-nums text-foreground">{formatRupiah(s.totals.bills)}</span>
				</p>
			</div>
			<BillList bills={s.bills} />
		</section>

		<section class="space-y-stack-base">
			<div class="flex items-center justify-between gap-stack-base">
				<h2 class="text-base font-semibold tracking-tight">Pemasukan</h2>
				<Button variant="outline" size="sm" onclick={() => (incomeOpen = true)}>
					<IconPlus />
					Pemasukan Ekstra
				</Button>
			</div>
			<IncomeList incomes={s.incomes} />
		</section>

		<Card
			as="section"
			padding="base"
			class="flex flex-wrap items-center justify-between gap-stack-base"
		>
			<div class="space-y-stack-xs">
				<p class="text-sm font-semibold tracking-tight">Pengeluaran Siklus Ini</p>
				<p class="font-mono text-xs text-muted-foreground">
					{s.expenses.length} transaksi tercatat
				</p>
			</div>
			<!-- Paritas Tombol Ketat: kedua tombol dalam grup ini menggunakan Ikon + Teks & size="sm" -->
			<div class="flex items-center gap-stack-sm">
				<Button variant="outline" size="sm" href="/pengeluaran">
					<IconArrowRight />
					Lihat Semua
				</Button>
				<Button size="sm" onclick={() => (expenseOpen = true)}>
					<IconPlus />
					Catat
				</Button>
			</div>
		</Card>

		<NotifPermission />

		<IncomeForm bind:open={incomeOpen} />
		<ExpenseForm bind:open={expenseOpen} />
	{:else if !data.needsNewCycle}
		<Card variant="dashed" padding="lg" class="py-section-lg">
			Tidak ada siklus aktif.
		</Card>
	{/if}
</div>
