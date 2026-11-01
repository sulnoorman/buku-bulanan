<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$components/ui/button';
	import { Input } from '$components/ui/input';
	import { Label } from '$components/ui/label';
	import * as Dialog from '$components/ui/dialog';
	import { formatRupiah } from '$lib/utils/format';
	import { IconCalendarRepeat } from '@tabler/icons-svelte';

	let { dueDay, isFirstCycle }: { dueDay: number; isFirstCycle: boolean } = $props();

	let open = $state(false);
	let amount = $state<number>();
	let submitting = $state(false);
</script>

<div class="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center">
	<IconCalendarRepeat class="size-5 shrink-0 text-amber-700" />
	<div class="flex-1">
		<p class="text-sm font-semibold text-amber-900">
			{isFirstCycle ? 'Mulai siklus pertamamu' : 'Pending Cycle Validation'}
		</p>
		<p class="text-sm text-amber-800">
			{isFirstCycle
				? 'Tentukan tanggal siklus dan pemasukan utama untuk mulai mencatat.'
				: `Tanggal siklus (tgl ${dueDay}) sudah tiba. Siap memulai bulan baru?`}
		</p>
	</div>
	<Button size="sm" onclick={() => (open = true)}>
		{isFirstCycle ? 'Mulai' : 'Ya, mulai bulan baru'}
	</Button>
</div>

<Dialog.Root bind:open>
	<Dialog.Content>
		<div class="space-y-1">
			<Dialog.Title class="text-lg font-semibold">Mulai Siklus Baru</Dialog.Title>
			<Dialog.Description class="text-sm text-muted-foreground">
				{isFirstCycle
					? 'Semua tagihan wajib yang aktif akan dibuat sebagai Belum Bayar.'
					: 'Siklus sekarang akan diarsipkan, dan tagihan wajib dibuat ulang sebagai Belum Bayar.'}
			</Dialog.Description>
		</div>

		<form
			method="POST"
			action="/?/startCycle"
			class="space-y-4"
			use:enhance={() => {
				submitting = true;
				return async ({ result, update }) => {
					await update();
					submitting = false;
					if (result.type === 'success') open = false;
				};
			}}
		>
			<div class="grid gap-2">
				<Label for="incomeLabel">Pemasukan utama</Label>
				<Input id="incomeLabel" name="incomeLabel" value="Gaji" required />
			</div>
			<div class="grid gap-2">
				<Label for="incomeAmount">Nominal (Rp)</Label>
				<Input
					id="incomeAmount"
					name="incomeAmount"
					type="number"
					min="1"
					inputmode="numeric"
					placeholder="5000000"
					bind:value={amount}
					required
				/>
				{#if amount}<p class="text-xs text-muted-foreground">{formatRupiah(amount)}</p>{/if}
			</div>
			<div class="grid gap-2">
				<Label for="dueDay">Tanggal siklus berikutnya</Label>
				<Input id="dueDay" name="dueDay" type="number" min="1" max="31" value={dueDay} required />
				<p class="text-xs text-muted-foreground">Misal 26 = siklus reset setiap tanggal 26.</p>
			</div>
			<div class="flex justify-end gap-2 pt-2">
				<Button variant="outline" onclick={() => (open = false)}>Nanti</Button>
				<Button type="submit" disabled={submitting}>Konfirmasi</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
