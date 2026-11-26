<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$components/ui/button';
	import { Badge } from '$components/ui/badge';
	import * as Dialog from '$components/ui/dialog';
	import { formatRupiah } from '$lib/utils/format';
	import { IconPencil, IconArchive, IconRestore, IconLoader2 } from '@tabler/icons-svelte';
	import type { Obligation } from './obligation.schema';

	let {
		obligations,
		onEdit
	}: { obligations: Obligation[]; onEdit: (ob: Obligation) => void } = $props();

	let togglingId = $state<number | null>(null);
	let confirmTarget = $state<Obligation | null>(null);
	let confirmOpen = $state(false);

	const totalActive = $derived(
		obligations.filter((o) => o.isActive).reduce((s, o) => s + o.amount, 0)
	);

	function askDeactivate(ob: Obligation) {
		confirmTarget = ob;
		confirmOpen = true;
	}

	function handleToggle(id: number) {
		return () => {
			togglingId = id;
			return async ({ update }: { update: () => Promise<void> }) => {
				await update();
				togglingId = null;
				confirmOpen = false;
			};
		};
	}
</script>

{#if obligations.length === 0}
	<p class="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
		Belum ada tagihan wajib. Tambahkan listrik, internet, cicilan, dll.
	</p>
{:else}
	<!-- Tampilan Mobile / PWA: Card Item List -->
	<div class="space-y-3 md:hidden">
		<div class="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3 text-sm">
			<span class="text-muted-foreground">Total tagihan aktif / bulan</span>
			<span class="font-semibold tabular-nums">{formatRupiah(totalActive)}</span>
		</div>

		<ul class="space-y-2.5">
			{#each obligations as ob (ob.id)}
				<li
					class="rounded-lg border p-4 {ob.isActive
						? 'bg-card'
						: 'bg-muted/20 text-muted-foreground'}"
				>
					<div class="flex items-start justify-between gap-3">
						<div class="min-w-0 flex-1">
							<div class="flex flex-wrap items-center gap-1.5">
								<p class="font-medium">{ob.name}</p>
								{#if ob.isVariable}
									<Badge variant="secondary">Estimasi</Badge>
								{/if}
								{#if !ob.isActive}
									<Badge variant="outline">Nonaktif</Badge>
								{/if}
							</div>
							<p class="mt-1 text-xs text-muted-foreground">
								Jatuh tempo tgl {ob.dueDay}
								{#if ob.installments > 1}
									· {ob.installments}× bayar ({formatRupiah(Math.floor(ob.amount / ob.installments))})
								{/if}
							</p>
						</div>

						<p class="shrink-0 text-right font-semibold tabular-nums">
							{ob.isVariable ? '~' : ''}{formatRupiah(ob.amount)}
						</p>
					</div>

					<div class="mt-3 flex items-center justify-end gap-2 border-t pt-2.5">
						{#if ob.isActive}
							<Button variant="outline" size="sm" onclick={() => onEdit(ob)}>
								<IconPencil />
								Edit
							</Button>
							<Button
								variant="destructive"
								size="sm"
								disabled={togglingId === ob.id}
								onclick={() => askDeactivate(ob)}
							>
								<IconArchive />
								Nonaktifkan
							</Button>
						{:else}
							<form method="POST" action="/tagihan?/toggle" use:enhance={handleToggle(ob.id)}>
								<input type="hidden" name="id" value={ob.id} />
								<input type="hidden" name="isActive" value="1" />
								<Button type="submit" variant="outline" size="sm" disabled={togglingId === ob.id}>
									{#if togglingId === ob.id}
										<IconLoader2 class="animate-spin" />
									{:else}
										<IconRestore />
									{/if}
									Aktifkan
								</Button>
							</form>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
	</div>

	<!-- Tampilan Desktop: Tabel -->
	<div class="hidden overflow-x-auto rounded-lg border md:block">
		<table class="w-full text-sm">
			<thead class="border-b bg-muted/50 text-left text-xs text-muted-foreground">
				<tr>
					<th class="px-4 py-2 font-medium">Nama</th>
					<th class="px-4 py-2 font-medium">Jatuh tempo</th>
					<th class="px-4 py-2 text-right font-medium">Nominal</th>
					<th class="w-40 px-4 py-2"></th>
				</tr>
			</thead>
			<tbody class="divide-y">
				{#each obligations as ob (ob.id)}
					<tr class={ob.isActive ? '' : 'text-muted-foreground'}>
						<td class="px-4 py-3">
							<span class="font-medium">{ob.name}</span>
							{#if ob.isVariable}<Badge variant="secondary" class="ml-2">Estimasi</Badge>{/if}
							{#if !ob.isActive}<Badge variant="outline" class="ml-2">Nonaktif</Badge>{/if}
						</td>
						<td class="px-4 py-3">Tgl {ob.dueDay}</td>
						<td class="px-4 py-3 text-right tabular-nums">
							{ob.isVariable ? '~' : ''}{formatRupiah(ob.amount)}
							{#if ob.installments > 1}
								<span class="block text-xs text-muted-foreground">
									{ob.installments} × {formatRupiah(Math.floor(ob.amount / ob.installments))}
								</span>
							{/if}
						</td>
						<td class="px-3 py-2">
							<div class="flex justify-end gap-1.5">
								{#if ob.isActive}
									<Button variant="outline" size="sm" title="Edit" onclick={() => onEdit(ob)}>
										<IconPencil />
										Edit
									</Button>
									<Button
										variant="destructive"
										size="sm"
										disabled={togglingId === ob.id}
										title="Nonaktifkan (tidak ikut siklus berikutnya)"
										onclick={() => askDeactivate(ob)}
									>
										<IconArchive />
										Nonaktifkan
									</Button>
								{:else}
									<form method="POST" action="/tagihan?/toggle" use:enhance={handleToggle(ob.id)}>
										<input type="hidden" name="id" value={ob.id} />
										<input type="hidden" name="isActive" value="1" />
										<Button
											type="submit"
											variant="outline"
											size="sm"
											disabled={togglingId === ob.id}
											title="Aktifkan lagi"
										>
											{#if togglingId === ob.id}
												<IconLoader2 class="animate-spin" />
											{:else}
												<IconRestore />
											{/if}
											Aktifkan
										</Button>
									</form>
								{/if}
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
			<tfoot class="border-t bg-muted/30">
				<tr>
					<td class="px-4 py-2 text-xs text-muted-foreground" colspan="2">Total tagihan aktif / bulan</td>
					<td class="px-4 py-2 text-right font-semibold tabular-nums">{formatRupiah(totalActive)}</td>
					<td></td>
				</tr>
			</tfoot>
		</table>
	</div>
{/if}

<!-- Dialog Konfirmasi Nonaktifkan Tagihan -->
<Dialog.Root bind:open={confirmOpen}>
	<Dialog.Content>
		<div class="space-y-1">
			<Dialog.Title class="text-lg font-semibold">Nonaktifkan Tagihan?</Dialog.Title>
			<Dialog.Description class="text-sm text-muted-foreground">
				Tagihan <strong class="text-foreground">{confirmTarget?.name}</strong> tidak akan dibuat otomatis
				pada siklus bulan berikutnya. Kamu tetap bisa mengaktifkannya kembali kapan saja.
			</Dialog.Description>
		</div>
		{#if confirmTarget}
			<form
				method="POST"
				action="/tagihan?/toggle"
				use:enhance={handleToggle(confirmTarget.id)}
				class="flex justify-end gap-2 pt-3"
			>
				<input type="hidden" name="id" value={confirmTarget.id} />
				<input type="hidden" name="isActive" value="0" />
				<Button
					type="button"
					variant="outline"
					onclick={() => (confirmOpen = false)}
					disabled={togglingId !== null}
				>
					Batal
				</Button>
				<Button type="submit" variant="destructive" disabled={togglingId !== null}>
					{#if togglingId === confirmTarget.id}
						<IconLoader2 class="animate-spin" />
					{:else}
						<IconArchive />
					{/if}
					Ya, Nonaktifkan
				</Button>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>
