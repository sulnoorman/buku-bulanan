<script lang="ts">
	import { Card } from '$components/ui/card';
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
	<Card variant="dashed" padding="lg" class="py-section-lg">
		Belum ada tagihan di siklus ini. Tambahkan di menu <a href="/tagihan" class="underline">Tagihan</a>.
	</Card>
{:else}
	<ul class="space-y-stack-base sm:space-y-0 sm:divide-y sm:rounded-card sm:border sm:bg-card">
		{#each sorted as bill (bill.id)}
			<BillRow {bill} />
		{/each}
	</ul>
{/if}
