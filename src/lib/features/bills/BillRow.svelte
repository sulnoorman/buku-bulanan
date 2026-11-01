<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$components/ui/button';
	import { Badge } from '$components/ui/badge';
	import { formatRupiah, formatRupiahShort, formatTanggalPendek } from '$lib/utils/format';
	import { IconCheck, IconPlayerSkipForward, IconArrowBackUp } from '@tabler/icons-svelte';
	import type { BillView } from './bill.service';

	let { bill }: { bill: BillView } = $props();

	let pending = $state(false);

	const isDone = $derived(bill.status === 'PAID');
	const isInstallment = $derived(bill.installments > 1);
	const fullySkipped = $derived(isDone && bill.paidCount === 0);

	const dueLabel = $derived.by(() => {
		if (fullySkipped) return 'Dilewati';
		if (isDone) return 'Lunas';
		if (bill.daysLeft < 0) return `Lewat ${-bill.daysLeft} hari`;
		if (bill.daysLeft === 0) return 'Hari ini';
		return `${bill.daysLeft} hari lagi`;
	});

	const badgeVariant = {
		paid: 'success',
		overdue: 'destructive',
		soon: 'warning',
		normal: 'outline'
	} as const;

	// Status tiap bagian untuk progress bar: paid → skipped → pending
	const segments = $derived(
		Array.from({ length: bill.installments }, (_, i) =>
			i < bill.paidCount ? 'paid' : i < bill.paidCount + bill.skippedCount ? 'skipped' : 'pending'
		)
	);

	// Satu form untuk semua tombol: tiap tombol mengirim `kind` + action-nya sendiri (formaction)
	const submit = () => {
		pending = true;
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			pending = false;
		};
	};
</script>

<li
	class="px-4 py-3 {bill.urgency === 'overdue'
		? 'bg-red-50/60'
		: bill.urgency === 'soon'
			? 'bg-amber-50/60'
			: ''}"
>
	<form method="POST" use:enhance={submit} class="flex flex-wrap items-center gap-x-3 gap-y-2">
		<input type="hidden" name="id" value={bill.id} />

		<!-- Info tagihan -->
		<div class="min-w-0 flex-1">
			<p class="truncate font-medium {isDone ? 'text-muted-foreground line-through' : ''}">
				{bill.name}
			</p>
			<p class="text-xs text-muted-foreground">
				{#if isInstallment}
					{bill.paidCount}/{bill.installments} dibayar
					{#if bill.skippedCount > 0}· {bill.skippedCount} dilewati{/if}
					{#if !isDone}· sisa {formatRupiah(bill.remainingAmount)}{/if}
				{:else}
					Jatuh tempo {formatTanggalPendek(bill.dueDate)}
				{/if}
			</p>
			{#if isInstallment}
				<div class="mt-1.5 flex max-w-48 gap-1">
					{#each segments as segment, i (i)}
						<span
							class="h-1.5 flex-1 rounded-full {segment === 'paid'
								? 'bg-emerald-600'
								: segment === 'skipped'
									? 'bg-muted-foreground/30'
									: 'bg-muted'}"
						></span>
					{/each}
				</div>
			{/if}
		</div>

		<Badge variant={fullySkipped ? 'outline' : badgeVariant[bill.urgency]} class="hidden sm:inline-flex">
			{dueLabel}
		</Badge>

		<p class="w-28 text-right text-sm font-medium tabular-nums">{formatRupiah(bill.amount)}</p>

		<!-- Aksi -->
		{#if !isDone}
			<div class="flex gap-1">
				<Button
					type="submit"
					variant="ghost"
					size="icon"
					name="kind"
					value="skip"
					formaction="/?/settleBill"
					disabled={pending}
					title={isInstallment ? 'Lewati bagian ini' : 'Lewati bulan ini'}
				>
					<IconPlayerSkipForward />
				</Button>
				<Button type="submit" size="sm" name="kind" value="pay" formaction="/?/settleBill" disabled={pending}>
					<IconCheck />
					Bayar{isInstallment ? ` ${formatRupiahShort(bill.nextAmount)}` : ''}
				</Button>
			</div>
		{/if}

		<!-- Batalkan kalau salah klik -->
		{#if bill.paidCount > 0 || bill.skippedCount > 0}
			<div class="flex w-full justify-end gap-3 text-xs text-muted-foreground">
				{#if bill.paidCount > 0}
					<button
						type="submit"
						name="kind"
						value="pay"
						formaction="/?/undoBill"
						disabled={pending}
						class="inline-flex items-center gap-1 hover:text-foreground"
					>
						<IconArrowBackUp class="size-3.5" /> Batal bayar
					</button>
				{/if}
				{#if bill.skippedCount > 0}
					<button
						type="submit"
						name="kind"
						value="skip"
						formaction="/?/undoBill"
						disabled={pending}
						class="inline-flex items-center gap-1 hover:text-foreground"
					>
						<IconArrowBackUp class="size-3.5" /> Batal lewati
					</button>
				{/if}
			</div>
		{/if}
	</form>
</li>
