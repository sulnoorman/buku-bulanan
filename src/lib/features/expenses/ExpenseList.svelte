<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card } from '$components/ui/card';
	import { Button } from '$components/ui/button';
	import { Badge } from '$components/ui/badge';
	import * as Dialog from '$components/ui/dialog';
	import { formatRupiah, formatTanggalPendek } from '$lib/utils/format';
	import { IconTrash, IconLoader2, IconX } from '@tabler/icons-svelte';
	import type { Expense } from './expense.schema';

	let { expenses }: { expenses: Expense[] } = $props();

	let deletingId = $state<number | null>(null);
	let confirmTarget = $state<Expense | null>(null);
	let confirmOpen = $state(false);

	function askDelete(expense: Expense) {
		confirmTarget = expense;
		confirmOpen = true;
	}
</script>

{#if expenses.length === 0}
	<Card variant="dashed" padding="lg" class="py-section-lg">
		Belum ada pengeluaran di siklus ini.
	</Card>
{:else}
	<ul class="space-y-stack-base sm:space-y-0 sm:divide-y sm:rounded-card sm:border sm:bg-card">
		{#each expenses as expense (expense.id)}
			<li
				class="rounded-card border bg-card p-card-base sm:flex sm:items-center sm:gap-stack-base sm:rounded-none sm:border-0 sm:bg-transparent"
			>
				<!-- Tanggal di Desktop -->
				<span class="hidden w-16 shrink-0 font-mono text-xs text-muted-foreground sm:inline">
					{formatTanggalPendek(expense.date)}
				</span>

				<!-- Info Pengeluaran & Nominal di Mobile -->
				<div class="flex items-start justify-between gap-stack-base sm:min-w-0 sm:flex-1">
					<div class="min-w-0 flex-1 space-y-stack-xs">
						<p class="font-medium leading-snug">{expense.label}</p>
						{#if expense.note}
							<p class="text-xs text-muted-foreground">{expense.note}</p>
						{/if}
						<div class="flex flex-wrap items-center gap-stack-xs sm:hidden">
							<span class="font-mono text-xs text-muted-foreground">
								{formatTanggalPendek(expense.date)}
							</span>
							<span class="text-xs text-muted-foreground">·</span>
							<Badge variant="outline">{expense.category}</Badge>
						</div>
					</div>

					<!-- Nominal & Tombol Hapus di Mobile -->
					<div class="flex shrink-0 flex-col items-end gap-stack-sm sm:hidden">
						<p class="font-mono text-sm font-semibold tracking-tight tabular-nums">
							−{formatRupiah(expense.amount)}
						</p>
						<Button
							variant="destructive"
							size="sm"
							disabled={deletingId === expense.id}
							onclick={() => askDelete(expense)}
							title="Hapus pengeluaran"
						>
							<IconTrash />
							Hapus
						</Button>
					</div>
				</div>

				<!-- Kategori, Nominal & Tombol Hapus di Desktop (seragam dengan mobile: Icon + Text) -->
				<Badge variant="outline" class="hidden sm:inline-flex">{expense.category}</Badge>
				<p class="hidden text-right font-mono text-sm font-semibold tracking-tight tabular-nums sm:block">
					−{formatRupiah(expense.amount)}
				</p>
				<Button
					variant="destructive"
					size="sm"
					class="hidden sm:inline-flex"
					disabled={deletingId === expense.id}
					onclick={() => askDelete(expense)}
					title="Hapus pengeluaran"
				>
					<IconTrash />
					Hapus
				</Button>
			</li>
		{/each}
	</ul>
{/if}

<!-- Dialog Konfirmasi Hapus Pengeluaran -->
<Dialog.Root bind:open={confirmOpen}>
	<Dialog.Content>
		<div class="space-y-stack-xs">
			<Dialog.Title class="text-lg font-semibold tracking-tight">Hapus Pengeluaran?</Dialog.Title>
			<Dialog.Description class="text-sm text-muted-foreground">
				Yakin ingin menghapus pengeluaran <strong class="text-foreground">{confirmTarget?.label}</strong>
				(<span class="font-mono">{confirmTarget ? formatRupiah(confirmTarget.amount) : ''}</span>)?
			</Dialog.Description>
		</div>
		{#if confirmTarget}
			<form
				method="POST"
				action="/pengeluaran?/delete"
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
