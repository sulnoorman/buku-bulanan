<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$components/ui/button';
	import { Input } from '$components/ui/input';
	import { Label } from '$components/ui/label';
	import * as Dialog from '$components/ui/dialog';
	import { formatRupiah } from '$lib/utils/format';
	import { IconLoader2 } from '@tabler/icons-svelte';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	let amount = $state<number>();
	let submitting = $state(false);
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<div class="space-y-1">
			<Dialog.Title class="text-lg font-semibold">Tambah Pemasukan Ekstra</Dialog.Title>
			<Dialog.Description class="text-sm text-muted-foreground">
				Freelance, bonus, THR, dll. Langsung menambah Safe-to-Spend.
			</Dialog.Description>
		</div>
		<form
			method="POST"
			action="/?/addIncome"
			class="space-y-4"
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
			<div class="grid gap-2">
				<Label for="incLabel">Keterangan</Label>
				<Input id="incLabel" name="label" placeholder="Freelance" required />
			</div>
			<div class="grid gap-2">
				<Label for="incAmount">Nominal (Rp)</Label>
				<Input
					id="incAmount"
					name="amount"
					type="number"
					min="1"
					inputmode="numeric"
					bind:value={amount}
					required
				/>
				{#if amount}<p class="text-xs text-muted-foreground">{formatRupiah(amount)}</p>{/if}
			</div>
			<div class="flex justify-end gap-2 pt-2">
				<Button variant="outline" onclick={() => (open = false)} disabled={submitting}>Batal</Button>
				<Button type="submit" disabled={submitting}>
					{#if submitting}<IconLoader2 class="animate-spin" />{/if}
					Simpan
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
