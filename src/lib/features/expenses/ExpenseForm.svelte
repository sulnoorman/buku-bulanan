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
	import { IconLoader2, IconCheck, IconX } from '@tabler/icons-svelte';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	let amount = $state<number>();
	let submitting = $state(false);
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<div class="space-y-stack-xs">
			<Dialog.Title class="text-lg font-semibold tracking-tight">Catat Pengeluaran</Dialog.Title>
			<Dialog.Description class="text-sm text-muted-foreground">
				Pengeluaran di luar tagihan wajib.
			</Dialog.Description>
		</div>
		<form
			method="POST"
			action="/pengeluaran?/add"
			class="space-y-stack-md"
			use:enhance={() => {
				submitting = true;
				return async ({ result, update }) => {
					await update();
					submitting = false;
					if (result.type === 'success') {
						open = false;
						amount = undefined;
					}
				};
			}}
		>
			<div class="grid gap-stack-sm">
				<Label for="expLabel">Keterangan</Label>
				<Input id="expLabel" name="label" placeholder="Makan siang" required />
			</div>
			<div class="grid grid-cols-2 gap-stack-base">
				<div class="grid gap-stack-sm">
					<Label for="expAmount">Nominal (Rp)</Label>
					<Input
						id="expAmount"
						name="amount"
						type="number"
						min="1"
						inputmode="numeric"
						bind:value={amount}
						required
					/>
				</div>
				<div class="grid gap-stack-sm">
					<Label for="expDate">Tanggal</Label>
					<Input id="expDate" name="date" type="date" value={todayISO()} required />
				</div>
			</div>
			{#if amount}
				<p class="font-mono text-xs text-muted-foreground">{formatRupiah(amount)}</p>
			{/if}
			<div class="grid gap-stack-sm">
				<Label for="expCategory">Kategori</Label>
				<Select id="expCategory" name="category" value="Makanan">
					{#each EXPENSE_CATEGORIES as cat (cat.value)}
						<option value={cat.value}>{cat.label}</option>
					{/each}
				</Select>
			</div>
			<div class="grid gap-stack-sm">
				<Label for="expNote">Catatan <span class="text-muted-foreground">(opsional)</span></Label>
				<Input id="expNote" name="note" />
			</div>
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
					Simpan
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
