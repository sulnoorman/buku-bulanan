<script lang="ts">
	import { formatRupiah } from '$lib/utils/format';
	import { IconAlertTriangle } from '@tabler/icons-svelte';
	import type { BillView } from '$features/bills/bill.service';

	let { bills }: { bills: BillView[] } = $props();

	const urgent = $derived(bills.filter((b) => b.urgency === 'overdue' || b.urgency === 'soon'));
	const total = $derived(urgent.reduce((s, b) => s + b.remainingAmount, 0));
</script>

{#if urgent.length > 0}
	<div class="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
		<IconAlertTriangle class="mt-0.5 size-5 shrink-0 text-red-600" />
		<div>
			<p class="font-semibold text-red-900">
				{urgent.length} tagihan perlu dibayar segera · {formatRupiah(total)}
			</p>
			<p class="text-red-800">
				{urgent.map((b) => (b.daysLeft < 0 ? `${b.name} (lewat ${-b.daysLeft} hari)` : b.name)).join(', ')}
			</p>
		</div>
	</div>
{/if}
