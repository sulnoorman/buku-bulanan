<script lang="ts">
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
	import { IconPlus } from '@tabler/icons-svelte';

	let { data } = $props();

	let incomeOpen = $state(false);
	let expenseOpen = $state(false);
</script>

<div class="space-y-6">
	{#if data.needsNewCycle}
		<CycleBanner dueDay={data.dueDay} isFirstCycle={data.isFirstCycle} />
	{/if}

	{#if data.summary}
		{@const s = data.summary}
		<SafeToSpend totals={s.totals} />
		<DueDateAlert bills={s.bills} />
		<DashboardStats summary={s} />

		<section class="space-y-3">
			<h2 class="font-semibold">Tagihan bulan ini</h2>
			<BillList bills={s.bills} />
		</section>

		<section class="space-y-3">
			<div class="flex items-center justify-between">
				<h2 class="font-semibold">Pemasukan</h2>
				<Button variant="outline" size="sm" onclick={() => (incomeOpen = true)}>
					<IconPlus /> Pemasukan ekstra
				</Button>
			</div>
			<IncomeList incomes={s.incomes} />
		</section>

		<section class="flex items-center justify-between rounded-lg border p-4">
			<div>
				<p class="text-sm font-medium">Pengeluaran siklus ini</p>
				<p class="text-xs text-muted-foreground">
					{s.expenses.length} transaksi · <a href="/pengeluaran" class="underline">lihat semua</a>
				</p>
			</div>
			<Button size="sm" onclick={() => (expenseOpen = true)}><IconPlus /> Catat</Button>
		</section>

		<NotifPermission />

		<IncomeForm bind:open={incomeOpen} />
		<ExpenseForm bind:open={expenseOpen} />
	{:else if !data.needsNewCycle}
		<p class="text-sm text-muted-foreground">Tidak ada siklus aktif.</p>
	{/if}
</div>
