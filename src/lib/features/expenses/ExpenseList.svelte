<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$components/ui/button';
	import { Badge } from '$components/ui/badge';
	import * as Dialog from '$components/ui/dialog';
	import { formatRupiah, formatTanggalPendek } from '$lib/utils/format';
	import { IconTrash, IconLoader2 } from '@tabler/icons-svelte';
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
	<p class="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
		Belum ada pengeluaran di siklus ini.
	</p>
{:else}
	<ul class="space-y-2.5 sm:space-y-0 sm:divide-y sm:rounded-lg sm:border">
		{#each expenses as expense (expense.id)}
			<li
				class="rounded-lg border bg-card p-3.5 sm:flex sm:items-center sm:gap-3 sm:rounded-none sm:border-0 sm:bg-transparent sm:px-4 sm:py-3"
			>
				<!-- Tanggal di Desktop -->
				<span class="hidden w-14 shrink-0 text-xs text-muted-foreground sm:inline">
					{formatTanggalPendek(expense.date)}
				</span>

				<!-- Info Pengeluaran & Nominal di Mobile -->
				<div class="flex items-start justify-between gap-3 sm:min-w-0 sm:flex-1">
					<div class="min-w-0 flex-1">
						<p class="font-medium leading-snug">{expense.label}</p>
						{#if expense.note}
							<p class="mt-0.5 text-xs text-muted-foreground">{expense.note}</p>
						{/if}
						<div class="mt-1.5 flex flex-wrap items-center gap-1.5 sm:hidden">
							<span class="text-xs text-muted-foreground">{formatTanggalPendek(expense.date)}</span>
							<span class="text-xs text-muted-foreground">·</span>
							<Badge variant="outline">{expense.category}</Badge>
						</div>
					</div>

					<!-- Nominal & Tombol Hapus di Mobile -->
					<div class="flex shrink-0 flex-col items-end gap-2 sm:hidden">
						<p class="text-sm font-semibold tabular-nums">− {formatRupiah(expense.amount)}</p>
						<Button
							variant="destructive"
							size="sm"
							class="h-7 px-2.5 text-xs"
							disabled={deletingId === expense.id}
							onclick={() => askDelete(expense)}
							title="Hapus pengeluaran"
						>
							<IconTrash class="size-3.5" />
							Hapus
						</Button>
					</div>
				</div>

				<!-- Kategori, Nominal & Tombol Hapus di Desktop -->
				<Badge variant="outline" class="hidden sm:inline-flex">{expense.category}</Badge>
				<p class="hidden w-28 text-right text-sm font-medium tabular-nums sm:block">
					− {formatRupiah(expense.amount)}
				</p>
				<Button
					variant="destructive"
					size="icon"
					class="hidden size-7 sm:inline-flex"
					disabled={deletingId === expense.id}
					onclick={() => askDelete(expense)}
					title="Hapus pengeluaran"
				>
					<IconTrash class="size-3.5" />
				</Button>
			</li>
		{/each}
	</ul>
{/if}

<!-- Dialog Konfirmasi Hapus Pengeluaran -->
<Dialog.Root bind:open={confirmOpen}>
	<Dialog.Content>
		<div class="space-y-1">
			<Dialog.Title class="text-lg font-semibold">Hapus Pengeluaran?</Dialog.Title>
			<Dialog.Description class="text-sm text-muted-foreground">
				Yakin ingin menghapus pengeluaran <strong class="text-foreground">{confirmTarget?.label}</strong>
				({confirmTarget ? formatRupiah(confirmTarget.amount) : ''})?
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
