<script lang="ts">
	import { Card } from '$components/ui/card';
	import { formatRupiah } from '$lib/utils/format';
	import { IconAlertTriangle } from '@tabler/icons-svelte';
	import type { BillView } from '$features/bills/bill.service';

	let { bills }: { bills: BillView[] } = $props();

	const urgent = $derived(bills.filter((b) => b.urgency === 'overdue' || b.urgency === 'soon'));
	const total = $derived(urgent.reduce((s, b) => s + b.remainingAmount, 0));
</script>

{#if urgent.length > 0}
	<Card variant="danger" padding="base" class="flex items-start gap-stack-base text-sm">
		<IconAlertTriangle class="size-icon-md shrink-0 text-red-600 dark:text-red-400" />
		<div class="space-y-stack-xs">
			<p class="font-semibold tracking-tight">
				{urgent.length} tagihan perlu perhatian segera ·
				<span class="font-mono tabular-nums">{formatRupiah(total)}</span>
			</p>
			<p class="text-xs opacity-90">
				{urgent
					.map((b) => (b.daysLeft < 0 ? `${b.name} (lewat ${-b.daysLeft} hari)` : b.name))
					.join(', ')}
			</p>
		</div>
	</Card>
{/if}
