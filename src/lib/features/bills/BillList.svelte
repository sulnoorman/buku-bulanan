<script lang="ts">
	import BillRow from './BillRow.svelte';
	import type { BillView } from './bill.service';

	let { bills }: { bills: BillView[] } = $props();

	// Belum bayar di atas (urut jatuh tempo terdekat), yang lunas di bawah
	const sorted = $derived(
		[...bills].sort((a, b) => {
			if (a.status !== b.status) return a.status === 'UNPAID' ? -1 : 1;
			return a.dueDate.localeCompare(b.dueDate);
		})
	);
</script>

{#if bills.length === 0}
	<p class="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
		Belum ada tagihan di siklus ini. Tambahkan di menu <a href="/tagihan" class="underline">Tagihan</a>.
	</p>
{:else}
	<ul class="divide-y rounded-lg border">
		{#each sorted as bill (bill.id)}
			<BillRow {bill} />
		{/each}
	</ul>
{/if}
