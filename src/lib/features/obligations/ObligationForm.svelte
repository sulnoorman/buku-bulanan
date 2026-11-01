<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$components/ui/button';
	import { Input } from '$components/ui/input';
	import { Label } from '$components/ui/label';
	import { Switch } from '$components/ui/switch';
	import { Select } from '$components/ui/select';
	import * as Dialog from '$components/ui/dialog';
	import { formatRupiah } from '$lib/utils/format';
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
	let addToCycle = $state(true);

	// Setiap kali dialog dibuka, isi ulang field yang di-bind dari data yang diedit
	$effect(() => {
		if (open) {
			amount = obligation?.amount;
			installments = String(obligation?.installments ?? 1);
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<div class="space-y-1">
			<Dialog.Title class="text-lg font-semibold">{isEdit ? 'Edit Tagihan' : 'Tambah Tagihan Wajib'}</Dialog.Title>
			<Dialog.Description class="text-sm text-muted-foreground">
				{isEdit
					? 'Ubah detail tagihan wajib bulanan.'
					: 'Tagihan yang berulang setiap bulan.'}
			</Dialog.Description>
		</div>
		<form
			method="POST"
			action={isEdit ? '/tagihan?/update' : '/tagihan?/create'}
			class="space-y-4"
			use:enhance={() =>
				async ({ result, update }) => {
					await update();
					if (result.type === 'success') open = false;
				}}
		>
			{#if obligation}<input type="hidden" name="id" value={obligation.id} />{/if}
			<div class="grid gap-2">
				<Label for="obName">Nama tagihan</Label>
				<Input id="obName" name="name" value={obligation?.name ?? ''} placeholder="Listrik PLN" required />
			</div>
			<div class="grid grid-cols-2 gap-3">
				<div class="grid gap-2">
					<Label for="obAmount">Nominal (Rp)</Label>
					<Input id="obAmount" name="amount" type="number" min="1" inputmode="numeric" bind:value={amount} required />
				</div>
				<div class="grid gap-2">
					<Label for="obDueDay">Jatuh tempo (tgl)</Label>
					<Input id="obDueDay" name="dueDay" type="number" min="1" max="31" value={obligation?.dueDay ?? ''} required />
				</div>
			</div>
			{#if amount}<p class="-mt-2 text-xs text-muted-foreground">{formatRupiah(amount)}</p>{/if}

			<div class="grid gap-2">
				<Label for="obInstallments">Cara bayar</Label>
				<Select id="obInstallments" name="installments" bind:value={installments}>
					<option value="1">Sekali bayar</option>
					<option value="2">Bertahap 2× (per 2 minggu)</option>
					<option value="3">Bertahap 3×</option>
					<option value="4">Bertahap 4× (per minggu)</option>
					<option value="5">Bertahap 5× (per minggu, bulan panjang)</option>
				</Select>
				{#if Number(installments) > 1 && amount}
					<p class="text-xs text-muted-foreground">
						{installments} × {formatRupiah(Math.floor(amount / Number(installments)))} per siklus. Tiap bagian
						bisa dibayar atau dilewati.
					</p>
				{/if}
			</div>

			{#if hasActiveCycle}
				<label class="flex items-center justify-between gap-4 rounded-md border p-3">
					<span>
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
				<input type="hidden" name="addToCurrentCycle" value={addToCycle ? '1' : '0'} />
			{/if}

			<div class="flex justify-end gap-2 pt-2">
				<Button variant="outline" onclick={() => (open = false)}>Batal</Button>
				<Button type="submit">{isEdit ? 'Simpan' : 'Tambah'}</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
