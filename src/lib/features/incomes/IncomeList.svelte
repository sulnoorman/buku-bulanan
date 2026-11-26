<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card } from '$components/ui/card';
	import { Button } from '$components/ui/button';
	import { Badge } from '$components/ui/badge';
	import * as Dialog from '$components/ui/dialog';
	import { formatRupiah } from '$lib/utils/format';
	import { IconTrash, IconLoader2, IconX } from '@tabler/icons-svelte';
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

<Card padding="none" class="divide-y">
	{#each incomes as income (income.id)}
		<div class="flex items-start justify-between gap-stack-base p-card-base sm:items-center">
			<div class="min-w-0 flex-1 space-y-stack-xs">
				<p class="font-medium leading-snug">{income.label}</p>
				<div class="sm:hidden">
					<Badge variant={income.type === 'PRIMARY' ? 'secondary' : 'outline'}>
						{income.type === 'PRIMARY' ? 'Utama' : 'Ekstra'}
					</Badge>
				</div>
			</div>
			<Badge
				variant={income.type === 'PRIMARY' ? 'secondary' : 'outline'}
				class="hidden sm:inline-flex"
			>
				{income.type === 'PRIMARY' ? 'Utama' : 'Ekstra'}
			</Badge>
			<div class="flex shrink-0 items-center gap-stack-base">
				<p class="text-right font-mono text-sm font-semibold tracking-tight tabular-nums text-emerald-700 dark:text-emerald-400">
					+{formatRupiah(income.amount)}
				</p>
				<!-- Pemasukan utama tidak bisa dihapus agar siklus selalu punya basis -->
				{#if income.type === 'EXTRA'}
					<Button
						variant="destructive"
						size="sm"
						disabled={deletingId === income.id}
						onclick={() => askDelete(income)}
						title="Hapus pemasukan ekstra"
					>
						<IconTrash />
						Hapus
					</Button>
				{/if}
			</div>
		</div>
	{/each}
</Card>

<!-- Dialog Konfirmasi Hapus Pemasukan Ekstra -->
<Dialog.Root bind:open={confirmOpen}>
	<Dialog.Content>
		<div class="space-y-stack-xs">
			<Dialog.Title class="text-lg font-semibold tracking-tight">Hapus Pemasukan Ekstra?</Dialog.Title>
			<Dialog.Description class="text-sm text-muted-foreground">
				Yakin ingin menghapus pemasukan <strong class="text-foreground">{confirmTarget?.label}</strong>
				(<span class="font-mono">{confirmTarget ? formatRupiah(confirmTarget.amount) : ''}</span>)?
				Nilai Safe-to-Spend akan otomatis berkurang.
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
				class="flex justify-end gap-stack-sm pt-stack-sm"
			>
				<input type="hidden" name="id" value={confirmTarget.id} />
				<Button
					type="button"
					variant="outline"
					onclick={() => (confirmOpen = false)}
					disabled={deletingId !== null}
				>
					<IconX />
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
