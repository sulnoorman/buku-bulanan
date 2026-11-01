<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$components/ui/button';
	import { Input } from '$components/ui/input';
	import { Label } from '$components/ui/label';
	import { Select } from '$components/ui/select';
	import * as Dialog from '$components/ui/dialog';
	import { EXPENSE_CATEGORIES } from '$lib/utils/constants';
	import { formatRupiah } from '$lib/utils/format';
	import { todayISO } from '$lib/utils/date';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	let amount = $state<number>();
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<div class="space-y-1">
			<Dialog.Title class="text-lg font-semibold">Catat Pengeluaran</Dialog.Title>
			<Dialog.Description class="text-sm text-muted-foreground">
				Pengeluaran di luar tagihan wajib.
			</Dialog.Description>
		</div>
		<form
			method="POST"
			action="/pengeluaran?/add"
			class="space-y-4"
			use:enhance={() =>
				async ({ result, update }) => {
					await update();
					if (result.type === 'success') {
						open = false;
						amount = undefined;
					}
				}}
		>
			<div class="grid gap-2">
				<Label for="expLabel">Keterangan</Label>
				<Input id="expLabel" name="label" placeholder="Makan siang" required />
			</div>
			<div class="grid grid-cols-2 gap-3">
				<div class="grid gap-2">
					<Label for="expAmount">Nominal (Rp)</Label>
					<Input id="expAmount" name="amount" type="number" min="1" inputmode="numeric" bind:value={amount} required />
				</div>
				<div class="grid gap-2">
					<Label for="expDate">Tanggal</Label>
					<Input id="expDate" name="date" type="date" value={todayISO()} required />
				</div>
			</div>
			{#if amount}<p class="-mt-2 text-xs text-muted-foreground">{formatRupiah(amount)}</p>{/if}
			<div class="grid gap-2">
				<Label for="expCategory">Kategori</Label>
				<Select id="expCategory" name="category" value="Makanan">
					{#each EXPENSE_CATEGORIES as cat (cat.value)}
						<option value={cat.value}>{cat.label}</option>
					{/each}
				</Select>
			</div>
			<div class="grid gap-2">
				<Label for="expNote">Catatan <span class="text-muted-foreground">(opsional)</span></Label>
				<Input id="expNote" name="note" />
			</div>
			<div class="flex justify-end gap-2 pt-2">
				<Button variant="outline" onclick={() => (open = false)}>Batal</Button>
				<Button type="submit">Simpan</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
