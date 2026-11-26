<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card } from '$components/ui/card';
	import { Button } from '$components/ui/button';
	import { Input } from '$components/ui/input';
	import { Label } from '$components/ui/label';
	import * as Dialog from '$components/ui/dialog';
	import { formatRupiah } from '$lib/utils/format';
	import {
		IconCalendarRepeat,
		IconLoader2,
		IconArrowRight,
		IconCheck,
		IconX
	} from '@tabler/icons-svelte';

	let { dueDay, isFirstCycle }: { dueDay: number; isFirstCycle: boolean } = $props();

	let open = $state(false);
	let amount = $state<number>();
	let submitting = $state(false);
</script>

<Card
	variant="warning"
	padding="base"
	class="flex flex-col gap-stack-base sm:flex-row sm:items-center"
>
	<IconCalendarRepeat class="size-icon-md shrink-0 text-amber-700 dark:text-amber-400" />
	<div class="flex-1 space-y-stack-xs">
		<p class="text-sm font-semibold tracking-tight">
			{isFirstCycle ? 'Mulai Siklus Pertamamu' : 'Validasi Siklus Baru'}
		</p>
		<p class="text-xs opacity-90">
			{isFirstCycle
				? 'Tentukan tanggal siklus dan pemasukan utama untuk mulai mencatat.'
				: `Tanggal jatuh tempo siklus (tgl ${dueDay}) sudah tiba. Siap memulai bulan baru?`}
		</p>
	</div>
	<Button size="sm" onclick={() => (open = true)}>
		<IconArrowRight />
		{isFirstCycle ? 'Mulai Siklus' : 'Mulai Bulan Baru'}
	</Button>
</Card>

<Dialog.Root bind:open>
	<Dialog.Content>
		<div class="space-y-stack-xs">
			<Dialog.Title class="text-lg font-semibold tracking-tight">Mulai Siklus Baru</Dialog.Title>
			<Dialog.Description class="text-sm text-muted-foreground">
				{isFirstCycle
					? 'Semua tagihan wajib yang aktif akan dibuat sebagai Belum Bayar.'
					: 'Siklus sekarang akan diarsipkan, dan tagihan wajib dibuat ulang sebagai Belum Bayar.'}
			</Dialog.Description>
		</div>

		<form
			method="POST"
			action="/?/startCycle"
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
			<div class="grid gap-stack-sm">
				<Label for="incomeLabel">Pemasukan utama</Label>
				<Input id="incomeLabel" name="incomeLabel" value="Gaji" required />
			</div>
			<div class="grid gap-stack-sm">
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
				{#if amount}
					<p class="font-mono text-xs text-muted-foreground">{formatRupiah(amount)}</p>
				{/if}
			</div>
			<div class="grid gap-stack-sm">
				<Label for="dueDay">Tanggal siklus berikutnya</Label>
				<Input id="dueDay" name="dueDay" type="number" min="1" max="31" value={dueDay} required />
				<p class="text-xs text-muted-foreground">Misal 26 = siklus reset setiap tanggal 26.</p>
			</div>
			<div class="flex justify-end gap-stack-sm pt-stack-sm">
				<Button variant="outline" onclick={() => (open = false)} disabled={submitting}>
					<IconX />
					Nanti
				</Button>
				<Button type="submit" disabled={submitting}>
					{#if submitting}
						<IconLoader2 class="animate-spin" />
					{:else}
						<IconCheck />
					{/if}
					Konfirmasi
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
