<script lang="ts">
	import { Button } from '$components/ui/button';
	import ExpenseList from '$features/expenses/ExpenseList.svelte';
	import ExpenseForm from '$features/expenses/ExpenseForm.svelte';
	import ExpenseByCategory from '$features/expenses/ExpenseByCategory.svelte';
	import { IconPlus } from '@tabler/icons-svelte';

	let { data } = $props();

	let formOpen = $state(false);
</script>

<svelte:head><title>Pengeluaran · Buku Bulanan</title></svelte:head>

<div class="space-y-6">
	<div class="flex items-end justify-between gap-4">
		<div>
			<h1 class="text-xl font-semibold">Pengeluaran</h1>
			<p class="text-sm text-muted-foreground">Pengeluaran harian di luar tagihan wajib, siklus berjalan.</p>
		</div>
		{#if data.hasActiveCycle}
			<Button onclick={() => (formOpen = true)}><IconPlus /> Catat</Button>
		{/if}
	</div>

	{#if data.hasActiveCycle}
		<ExpenseByCategory expenses={data.expenses} />
		<ExpenseList expenses={data.expenses} />
	{:else}
		<p class="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
			Belum ada siklus aktif. Mulai siklus dari <a href="/" class="underline">Dashboard</a>.
		</p>
	{/if}
</div>

<ExpenseForm bind:open={formOpen} />
