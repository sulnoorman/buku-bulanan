<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card } from '$components/ui/card';
	import { Button } from '$components/ui/button';
	import { Badge } from '$components/ui/badge';
	import * as Dialog from '$components/ui/dialog';
	import { formatRupiah } from '$lib/utils/format';
	import { IconPencil, IconArchive, IconRestore, IconLoader2, IconX } from '@tabler/icons-svelte';
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
	<Card variant="dashed" padding="lg" class="py-section-lg">
		Belum ada tagihan wajib. Tambahkan listrik, internet, cicilan, dll.
	</Card>
{:else}
	<!-- Tampilan Mobile / PWA: Card Item List -->
	<div class="space-y-stack-base md:hidden">
		<Card variant="muted" padding="base" class="flex items-center justify-between text-sm">
			<span class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
				Total Tagihan Aktif / Bulan
			</span>
			<span class="font-mono font-bold tracking-tight tabular-nums">{formatRupiah(totalActive)}</span>
		</Card>

		<ul class="space-y-stack-base">
			{#each obligations as ob (ob.id)}
				<Card
					as="li"
					variant={ob.isActive ? 'default' : 'muted'}
					padding="base"
					class={ob.isActive ? '' : 'text-muted-foreground'}
				>
					<div class="flex items-start justify-between gap-stack-base">
						<div class="min-w-0 flex-1 space-y-stack-xs">
							<div class="flex flex-wrap items-center gap-stack-xs">
								<p class="font-medium leading-snug">{ob.name}</p>
								{#if ob.isVariable}
									<Badge variant="secondary">Estimasi</Badge>
								{/if}
								{#if !ob.isActive}
									<Badge variant="outline">Nonaktif</Badge>
								{/if}
							</div>
							<p class="font-mono text-xs text-muted-foreground">
								Jatuh tempo tgl {ob.dueDay}
								{#if ob.installments > 1}
									· {ob.installments}× bayar ({formatRupiah(Math.floor(ob.amount / ob.installments))})
								{/if}
							</p>
						</div>

						<p class="shrink-0 text-right font-mono text-sm font-semibold tracking-tight tabular-nums">
							{ob.isVariable ? '~' : ''}{formatRupiah(ob.amount)}
						</p>
					</div>

					<div class="mt-stack-base flex items-center justify-end gap-stack-sm border-t pt-stack-base">
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
				</Card>
			{/each}
		</ul>
	</div>

	<!-- Tampilan Desktop: Tabel -->
	<Card padding="none" class="hidden overflow-x-auto md:block">
		<table class="w-full text-sm">
			<thead class="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
				<tr>
					<th class="px-card-base py-card-sm font-medium">Nama</th>
					<th class="px-card-base py-card-sm font-medium">Jatuh Tempo</th>
					<th class="px-card-base py-card-sm text-right font-medium">Nominal</th>
					<th class="w-48 px-card-base py-card-sm"></th>
				</tr>
			</thead>
			<tbody class="divide-y">
				{#each obligations as ob (ob.id)}
					<tr class={ob.isActive ? '' : 'text-muted-foreground'}>
						<td class="px-card-base py-card-sm">
							<div class="flex items-center gap-stack-sm">
								<span class="font-medium">{ob.name}</span>
								{#if ob.isVariable}<Badge variant="secondary">Estimasi</Badge>{/if}
								{#if !ob.isActive}<Badge variant="outline">Nonaktif</Badge>{/if}
							</div>
						</td>
						<td class="px-card-base py-card-sm font-mono">Tgl {ob.dueDay}</td>
						<td class="px-card-base py-card-sm text-right font-mono font-semibold tabular-nums">
							{ob.isVariable ? '~' : ''}{formatRupiah(ob.amount)}
							{#if ob.installments > 1}
								<span class="block text-xs font-normal text-muted-foreground">
									{ob.installments} × {formatRupiah(Math.floor(ob.amount / ob.installments))}
								</span>
							{/if}
						</td>
						<td class="px-card-base py-card-sm">
							<div class="flex justify-end gap-stack-sm">
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
					<td class="px-card-base py-card-sm text-xs font-medium uppercase tracking-wider text-muted-foreground" colspan="2">
						Total Tagihan Aktif / Bulan
					</td>
					<td class="px-card-base py-card-sm text-right font-mono font-bold tabular-nums">
						{formatRupiah(totalActive)}
					</td>
					<td></td>
				</tr>
			</tfoot>
		</table>
	</Card>
{/if}

<!-- Dialog Konfirmasi Nonaktifkan Tagihan -->
<Dialog.Root bind:open={confirmOpen}>
	<Dialog.Content>
		<div class="space-y-stack-xs">
			<Dialog.Title class="text-lg font-semibold tracking-tight">Nonaktifkan Tagihan?</Dialog.Title>
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
				class="flex justify-end gap-stack-sm pt-stack-sm"
			>
				<input type="hidden" name="id" value={confirmTarget.id} />
				<input type="hidden" name="isActive" value="0" />
				<Button
					type="button"
					variant="outline"
					onclick={() => (confirmOpen = false)}
					disabled={togglingId !== null}
				>
					<IconX />
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
