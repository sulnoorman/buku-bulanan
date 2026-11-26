<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$components/ui/button';
	import { Badge } from '$components/ui/badge';
	import { Input } from '$components/ui/input';
	import { Label } from '$components/ui/label';
	import * as Dialog from '$components/ui/dialog';
	import { formatRupiah, formatRupiahShort, formatTanggalPendek } from '$lib/utils/format';
	import {
		IconCheck,
		IconPlayerSkipForward,
		IconArrowBackUp,
		IconLoader2
	} from '@tabler/icons-svelte';
	import type { BillView } from './bill.service';

	let { bill }: { bill: BillView } = $props();

	let pendingAction = $state<'pay' | 'skip' | 'undo-pay' | 'undo-skip' | null>(null);
	let confirmModalOpen = $state(false);
	let actualAmount = $state<number>(0);

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

	function openVariableConfirm() {
		actualAmount = bill.amount;
		confirmModalOpen = true;
	}
</script>

<li
	class="rounded-lg border p-3.5 sm:rounded-none sm:border-0 sm:px-4 sm:py-3 {bill.urgency ===
	'overdue'
		? 'border-red-200 bg-red-50/60'
		: bill.urgency === 'soon'
			? 'border-amber-200 bg-amber-50/60'
			: 'bg-card sm:bg-transparent'}"
>
	<form
		method="POST"
		use:enhance={({ submitter }) => {
			const kind = submitter?.getAttribute('value');
			const action = submitter?.getAttribute('formaction');
			if (action?.includes('undoBill')) {
				pendingAction = kind === 'skip' ? 'undo-skip' : 'undo-pay';
			} else {
				pendingAction = kind === 'skip' ? 'skip' : 'pay';
			}
			return async ({ update }) => {
				await update();
				pendingAction = null;
			};
		}}
		class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-2"
	>
		<input type="hidden" name="id" value={bill.id} />

		<!-- Info tagihan & Nominal (Mobile: atas-bawah rapi, Desktop: kiri-tengah) -->
		<div class="flex items-start justify-between gap-3 sm:min-w-0 sm:flex-1">
			<div class="min-w-0 flex-1">
				<div class="flex flex-wrap items-center gap-1.5">
					<p class="font-medium leading-snug {isDone ? 'text-muted-foreground line-through' : ''}">
						{bill.name}
					</p>
					{#if bill.isVariable && !isDone}
						<Badge variant="secondary">Estimasi</Badge>
					{/if}
					<Badge variant={fullySkipped ? 'outline' : badgeVariant[bill.urgency]} class="sm:hidden">
						{dueLabel}
					</Badge>
				</div>

				<p class="mt-1 text-xs text-muted-foreground">
					{#if isInstallment}
						Jatuh tempo {formatTanggalPendek(bill.dueDate)} · {bill.paidCount}/{bill.installments} dibayar
						{#if bill.skippedCount > 0}· {bill.skippedCount} dilewati{/if}
						{#if !isDone}· sisa {formatRupiah(bill.remainingAmount)}{/if}
					{:else}
						Jatuh tempo {formatTanggalPendek(bill.dueDate)}
					{/if}
				</p>

				{#if isInstallment}
					<div class="mt-2 flex max-w-56 gap-1.5">
						{#each segments as segment, i (i)}
							<span
								class="h-1.5 flex-1 rounded-full {segment === 'paid'
									? 'bg-emerald-600'
									: segment === 'skipped'
										? 'bg-muted-foreground/40'
										: 'bg-muted'}"
							></span>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Nominal di Mobile (kanan atas card) -->
			<p class="shrink-0 text-right text-sm font-semibold tabular-nums sm:hidden">
				{bill.isVariable && !isDone ? '~' : ''}{formatRupiah(bill.amount)}
			</p>
		</div>

		<!-- Badge & Nominal di Desktop -->
		<Badge variant={fullySkipped ? 'outline' : badgeVariant[bill.urgency]} class="hidden sm:inline-flex">
			{dueLabel}
		</Badge>

		<p class="hidden w-28 text-right text-sm font-medium tabular-nums sm:block">
			{bill.isVariable && !isDone ? '~' : ''}{formatRupiah(bill.amount)}
		</p>

		<!-- Baris Aksi (Mobile: footer card dengan tombol lega, Desktop: di sisi kanan) -->
		{#if !isDone || bill.paidCount > 0 || bill.skippedCount > 0}
			<div
				class="flex flex-wrap items-center justify-between gap-2 border-t pt-2.5 sm:border-0 sm:pt-0"
			>
				<!-- Tombol Batal kalau salah klik (di kiri pada mobile) -->
				<div class="flex items-center gap-3 text-xs text-muted-foreground sm:hidden">
					{#if bill.paidCount > 0}
						<button
							type="submit"
							name="kind"
							value="pay"
							formaction="/?/undoBill"
							disabled={pendingAction !== null}
							class="inline-flex items-center gap-1 hover:text-foreground disabled:opacity-50"
						>
							{#if pendingAction === 'undo-pay'}
								<IconLoader2 class="size-3.5 animate-spin" />
							{:else}
								<IconArrowBackUp class="size-3.5" />
							{/if}
							Batal bayar
						</button>
					{/if}
					{#if bill.skippedCount > 0}
						<button
							type="submit"
							name="kind"
							value="skip"
							formaction="/?/undoBill"
							disabled={pendingAction !== null}
							class="inline-flex items-center gap-1 hover:text-foreground disabled:opacity-50"
						>
							{#if pendingAction === 'undo-skip'}
								<IconLoader2 class="size-3.5 animate-spin" />
							{:else}
								<IconArrowBackUp class="size-3.5" />
							{/if}
							Batal lewati
						</button>
					{/if}
				</div>

				<!-- Tombol Lewati & Bayar -->
				{#if !isDone}
					<div class="ml-auto flex items-center gap-1.5">
						<Button
							type="submit"
							variant="outline"
							size="sm"
							name="kind"
							value="skip"
							formaction="/?/settleBill"
							disabled={pendingAction !== null}
							title={isInstallment ? 'Lewati bagian ini' : 'Lewati bulan ini'}
						>
							{#if pendingAction === 'skip'}
								<IconLoader2 class="animate-spin" />
							{:else}
								<IconPlayerSkipForward />
							{/if}
							<span>Lewati</span>
						</Button>

						{#if bill.isVariable && bill.paidCount === 0}
							<Button
								type="button"
								size="sm"
								disabled={pendingAction !== null}
								onclick={openVariableConfirm}
							>
								<IconCheck />
								Bayar
							</Button>
						{:else}
							<Button
								type="submit"
								size="sm"
								name="kind"
								value="pay"
								formaction="/?/settleBill"
								disabled={pendingAction !== null}
							>
								{#if pendingAction === 'pay'}
									<IconLoader2 class="animate-spin" />
								{:else}
									<IconCheck />
								{/if}
								Bayar{isInstallment ? ` ${formatRupiahShort(bill.nextAmount)}` : ''}
							</Button>
						{/if}
					</div>
				{/if}
			</div>
		{/if}

		<!-- Tombol Batal di Desktop (baris kedua di kanan bawah) -->
		{#if bill.paidCount > 0 || bill.skippedCount > 0}
			<div class="hidden w-full justify-end gap-3 text-xs text-muted-foreground sm:flex">
				{#if bill.paidCount > 0}
					<button
						type="submit"
						name="kind"
						value="pay"
						formaction="/?/undoBill"
						disabled={pendingAction !== null}
						class="inline-flex items-center gap-1 hover:text-foreground disabled:opacity-50"
					>
						{#if pendingAction === 'undo-pay'}
							<IconLoader2 class="size-3.5 animate-spin" />
						{:else}
							<IconArrowBackUp class="size-3.5" />
						{/if}
						Batal bayar
					</button>
				{/if}
				{#if bill.skippedCount > 0}
					<button
						type="submit"
						name="kind"
						value="skip"
						formaction="/?/undoBill"
						disabled={pendingAction !== null}
						class="inline-flex items-center gap-1 hover:text-foreground disabled:opacity-50"
					>
						{#if pendingAction === 'undo-skip'}
							<IconLoader2 class="size-3.5 animate-spin" />
						{:else}
							<IconArrowBackUp class="size-3.5" />
						{/if}
						Batal lewati
					</button>
				{/if}
			</div>
		{/if}
	</form>
</li>

<!-- Dialog konfirmasi nominal untuk tagihan yang berubah-ubah tiap bulan -->
{#if bill.isVariable}
	<Dialog.Root bind:open={confirmModalOpen}>
		<Dialog.Content>
			<div class="space-y-1">
				<Dialog.Title class="text-lg font-semibold">Bayar {bill.name}</Dialog.Title>
				<Dialog.Description class="text-sm text-muted-foreground">
					Masukkan nominal tagihan {bill.name} bulan ini. Perubahan ini hanya berlaku untuk siklus bulan ini
					dan tidak mengubah patokan di Master Tagihan.
				</Dialog.Description>
			</div>

			<form
				method="POST"
				action="/?/settleBill"
				class="space-y-4"
				use:enhance={() => {
					pendingAction = 'pay';
					return async ({ result, update }) => {
						await update();
						pendingAction = null;
						if (result.type === 'success') confirmModalOpen = false;
					};
				}}
			>
				<input type="hidden" name="id" value={bill.id} />
				<input type="hidden" name="kind" value="pay" />
				<div class="grid gap-2">
					<Label for="varAmount-{bill.id}">Nominal tagihan bulan ini (Rp)</Label>
					<Input
						id="varAmount-{bill.id}"
						name="customAmount"
						type="number"
						min="1"
						inputmode="numeric"
						bind:value={actualAmount}
						required
					/>
					{#if actualAmount}
						<p class="text-xs text-muted-foreground">
							{formatRupiah(actualAmount)}
							{#if actualAmount !== bill.amount}
								(patokan awal: {formatRupiah(bill.amount)})
							{/if}
						</p>
					{/if}
				</div>

				<div class="flex justify-end gap-2 pt-2">
					<Button
						variant="outline"
						onclick={() => (confirmModalOpen = false)}
						disabled={pendingAction !== null}
					>
						Batal
					</Button>
					<Button type="submit" disabled={pendingAction !== null}>
						{#if pendingAction === 'pay'}
							<IconLoader2 class="animate-spin" />
						{:else}
							<IconCheck />
						{/if}
						Konfirmasi & Bayar
					</Button>
				</div>
			</form>
		</Dialog.Content>
	</Dialog.Root>
{/if}
