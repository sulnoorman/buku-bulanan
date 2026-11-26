<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card } from '$components/ui/card';
	import { Button } from '$components/ui/button';
	import { Input } from '$components/ui/input';
	import { Label } from '$components/ui/label';
	import { Switch } from '$components/ui/switch';
	import { Select } from '$components/ui/select';
	import * as Dialog from '$components/ui/dialog';
	import { formatRupiah } from '$lib/utils/format';
	import { IconLoader2, IconCheck, IconX } from '@tabler/icons-svelte';
	import type { Obligation } from './obligation.schema';

	let {
		open = $bindable(false),
		obligation = null,
		hasActiveCycle
	}: {
		open?: boolean;
		/** null = mode tambah, berisi data = mode edit */
		obligation?: Obligation | null;
		hasActiveCycle: boolean;
	} = $props();

	const isEdit = $derived(obligation !== null);
	let amount = $state<number>();
	let installments = $state('1');
	let isVariable = $state(false);
	let addToCycle = $state(true);
	let submitting = $state(false);

	// Setiap kali dialog dibuka, isi ulang field yang di-bind dari data yang diedit
	$effect(() => {
		if (open) {
			amount = obligation?.amount;
			installments = String(obligation?.installments ?? 1);
			isVariable = obligation?.isVariable ?? false;
			submitting = false;
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<div class="space-y-stack-xs">
			<Dialog.Title class="text-lg font-semibold tracking-tight">
				{isEdit ? 'Edit Tagihan' : 'Tambah Tagihan Wajib'}
			</Dialog.Title>
			<Dialog.Description class="text-sm text-muted-foreground">
				{isEdit ? 'Ubah detail tagihan wajib bulanan.' : 'Tagihan yang berulang setiap bulan.'}
			</Dialog.Description>
		</div>
		<form
			method="POST"
			action={isEdit ? '/tagihan?/update' : '/tagihan?/create'}
			class="space-y-stack-md"
			use:enhance={() => {
				submitting = true;
				return async ({ result, update }) => {
					await update();
					submitting = false;
					if (result.type === 'success') open = false;
				};
			}}
		>
			{#if obligation}<input type="hidden" name="id" value={obligation.id} />{/if}
			<div class="grid gap-stack-sm">
				<Label for="obName">Nama tagihan</Label>
				<Input id="obName" name="name" value={obligation?.name ?? ''} placeholder="Listrik PLN" required />
			</div>
			<div class="grid grid-cols-2 gap-stack-base">
				<div class="grid gap-stack-sm">
					<Label for="obAmount">{isVariable ? 'Estimasi nominal (Rp)' : 'Nominal (Rp)'}</Label>
					<Input
						id="obAmount"
						name="amount"
						type="number"
						min="1"
						inputmode="numeric"
						bind:value={amount}
						required
					/>
				</div>
				<div class="grid gap-stack-sm">
					<Label for="obDueDay">Jatuh tempo (tgl)</Label>
					<Input
						id="obDueDay"
						name="dueDay"
						type="number"
						min="1"
						max="31"
						value={obligation?.dueDay ?? ''}
						required
					/>
				</div>
			</div>
			{#if amount}
				<p class="font-mono text-xs text-muted-foreground">{formatRupiah(amount)}</p>
			{/if}

			<div class="grid gap-stack-sm">
				<Label for="obInstallments">Cara bayar</Label>
				<Select id="obInstallments" name="installments" bind:value={installments}>
					<option value="1">Sekali bayar</option>
					<option value="2">Bertahap 2× (per 2 minggu)</option>
					<option value="3">Bertahap 3×</option>
					<option value="4">Bertahap 4× (per minggu)</option>
					<option value="5">Bertahap 5× (per minggu, bulan panjang)</option>
				</Select>
				{#if Number(installments) > 1 && amount}
					<p class="font-mono text-xs text-muted-foreground">
						{installments} × {formatRupiah(Math.floor(amount / Number(installments)))} per siklus. Tiap bagian
						bisa dibayar atau dilewati.
					</p>
				{/if}
			</div>

			<Card variant="muted" padding="sm">
				<label class="flex cursor-pointer items-center justify-between gap-stack-md">
					<span class="space-y-stack-xs">
						<span class="block text-sm font-medium">Nominal berubah-ubah tiap bulan</span>
						<span class="block text-xs text-muted-foreground">
							Contoh: Listrik/PDAM. Saat klik Bayar di Dashboard, akan muncul dialog konfirmasi nominal bulan ini.
						</span>
					</span>
					<Switch bind:checked={isVariable} />
				</label>
			</Card>
			<input type="hidden" name="isVariable" value={isVariable ? '1' : '0'} />

			{#if hasActiveCycle}
				<Card variant="muted" padding="sm">
					<label class="flex cursor-pointer items-center justify-between gap-stack-md">
						<span class="space-y-stack-xs">
							<span class="block text-sm font-medium">
								{isEdit ? 'Terapkan ke tagihan bulan ini' : 'Masukkan ke tagihan bulan ini'}
							</span>
							<span class="block text-xs text-muted-foreground">
								{isEdit
									? 'Matikan jika perubahan hanya untuk siklus berikutnya.'
									: 'Matikan jika tagihan baru mulai di siklus berikutnya.'}
							</span>
						</span>
						<Switch bind:checked={addToCycle} />
					</label>
				</Card>
				<input type="hidden" name="addToCurrentCycle" value={addToCycle ? '1' : '0'} />
			{/if}

			<div class="flex justify-end gap-stack-sm pt-stack-sm">
				<Button variant="outline" onclick={() => (open = false)} disabled={submitting}>
					<IconX />
					Batal
				</Button>
				<Button type="submit" disabled={submitting}>
					{#if submitting}
						<IconLoader2 class="animate-spin" />
					{:else}
						<IconCheck />
					{/if}
					{isEdit ? 'Simpan' : 'Tambah'}
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
