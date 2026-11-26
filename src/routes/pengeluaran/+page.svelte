<script lang="ts">
	import { Card } from '$components/ui/card';
	import { Button } from '$components/ui/button';
	import ExpenseList from '$features/expenses/ExpenseList.svelte';
	import ExpenseForm from '$features/expenses/ExpenseForm.svelte';
	import ExpenseByCategory from '$features/expenses/ExpenseByCategory.svelte';
	import { IconPlus } from '@tabler/icons-svelte';

	let { data } = $props();

	let formOpen = $state(false);
</script>

<svelte:head><title>Pengeluaran · Buku Bulanan</title></svelte:head>

<div class="space-y-stack-lg">
	<div class="flex items-end justify-between gap-stack-md">
		<div class="space-y-stack-xs">
			<h1 class="text-xl font-bold tracking-tight">Pengeluaran</h1>
			<p class="text-sm text-muted-foreground">
				Pengeluaran harian di luar tagihan wajib, siklus berjalan.
			</p>
		</div>
		{#if data.hasActiveCycle}
			<Button size="sm" onclick={() => (formOpen = true)}>
				<IconPlus />
				Catat
			</Button>
		{/if}
	</div>

	{#if data.hasActiveCycle}
		<ExpenseByCategory expenses={data.expenses} />
		<ExpenseList expenses={data.expenses} />
	{:else}
		<Card variant="dashed" padding="lg" class="py-section-lg">
			Belum ada siklus aktif. Mulai siklus dari <a href="/" class="underline">Dashboard</a>.
		</Card>
	{/if}
</div>

<ExpenseForm bind:open={formOpen} />
