<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$components/ui/button';
	import { Badge } from '$components/ui/badge';
	import * as Dialog from '$components/ui/dialog';
	import { formatRupiah } from '$lib/utils/format';
	import { IconTrash, IconLoader2 } from '@tabler/icons-svelte';
	import type { Income } from './income.schema';

	let { incomes }: { incomes: Income[] } = $props();

	let deletingId = $state<number | null>(null);
	let confirmTarget = $state<Income | null>(null);
	let confirmOpen = $state(false);

	function askDelete(income: Income) {
		confirmTarget = income;
		confirmOpen = true;
	}
</script>

<ul class="divide-y rounded-lg border">
	{#each incomes as income (income.id)}
		<li class="flex items-start justify-between gap-3 px-4 py-3 sm:items-center">
			<div class="min-w-0 flex-1">
				<p class="font-medium leading-snug">{income.label}</p>
				<div class="mt-1 sm:hidden">
					<Badge variant={income.type === 'PRIMARY' ? 'secondary' : 'outline'}>
						{income.type === 'PRIMARY' ? 'Utama' : 'Ekstra'}
					</Badge>
				</div>
			</div>
			<Badge variant={income.type === 'PRIMARY' ? 'secondary' : 'outline'} class="hidden sm:inline-flex">
				{income.type === 'PRIMARY' ? 'Utama' : 'Ekstra'}
			</Badge>
			<div class="flex shrink-0 items-center gap-2.5">
				<p class="text-right text-sm font-semibold tabular-nums text-emerald-700 sm:w-28 sm:font-medium">
					+ {formatRupiah(income.amount)}
				</p>
				<!-- Pemasukan utama tidak bisa dihapus agar siklus selalu punya basis -->
				{#if income.type === 'EXTRA'}
					<Button
						variant="destructive"
						size="icon"
						class="size-7"
						disabled={deletingId === income.id}
						onclick={() => askDelete(income)}
						title="Hapus pemasukan ekstra"
					>
						<IconTrash class="size-3.5" />
					</Button>
				{:else}
					<span class="hidden w-7 sm:inline-block"></span>
				{/if}
			</div>
		</li>
	{/each}
</ul>

<!-- Dialog Konfirmasi Hapus Pemasukan Ekstra -->
<Dialog.Root bind:open={confirmOpen}>
	<Dialog.Content>
		<div class="space-y-1">
			<Dialog.Title class="text-lg font-semibold">Hapus Pemasukan Ekstra?</Dialog.Title>
			<Dialog.Description class="text-sm text-muted-foreground">
				Yakin ingin menghapus pemasukan <strong class="text-foreground">{confirmTarget?.label}</strong>
				({confirmTarget ? formatRupiah(confirmTarget.amount) : ''})? Nilai Safe-to-Spend akan otomatis berkurang.
			</Dialog.Description>
		</div>
		{#if confirmTarget}
			<form
				method="POST"
				action="/?/deleteIncome"
				use:enhance={() => {
					deletingId = confirmTarget?.id ?? null;
					return async ({ update }) => {
						await update();
						deletingId = null;
						confirmOpen = false;
					};
				}}
				class="flex justify-end gap-2 pt-3"
			>
				<input type="hidden" name="id" value={confirmTarget.id} />
				<Button
					type="button"
					variant="outline"
					onclick={() => (confirmOpen = false)}
					disabled={deletingId !== null}
				>
					Batal
				</Button>
				<Button type="submit" variant="destructive" disabled={deletingId !== null}>
					{#if deletingId === confirmTarget.id}
						<IconLoader2 class="animate-spin" />
					{:else}
						<IconTrash />
					{/if}
					Ya, Hapus
				</Button>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>
