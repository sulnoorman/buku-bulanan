<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$components/ui/button';
	import { Badge } from '$components/ui/badge';
	import { formatRupiah } from '$lib/utils/format';
	import { IconPencil, IconArchive, IconRestore } from '@tabler/icons-svelte';
	import type { Obligation } from './obligation.schema';

	let {
		obligations,
		onEdit
	}: { obligations: Obligation[]; onEdit: (ob: Obligation) => void } = $props();

	const totalActive = $derived(
		obligations.filter((o) => o.isActive).reduce((s, o) => s + o.amount, 0)
	);
</script>

{#if obligations.length === 0}
	<p class="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
		Belum ada tagihan wajib. Tambahkan listrik, internet, cicilan, dll.
	</p>
{:else}
	<div class="overflow-x-auto rounded-lg border">
		<table class="w-full text-sm">
			<thead class="border-b bg-muted/50 text-left text-xs text-muted-foreground">
				<tr>
					<th class="px-4 py-2 font-medium">Nama</th>
					<th class="px-4 py-2 font-medium">Jatuh tempo</th>
					<th class="px-4 py-2 text-right font-medium">Nominal</th>
					<th class="w-24 px-4 py-2"></th>
				</tr>
			</thead>
			<tbody class="divide-y">
				{#each obligations as ob (ob.id)}
					<tr class={ob.isActive ? '' : 'text-muted-foreground'}>
						<td class="px-4 py-3">
							<span class="font-medium">{ob.name}</span>
							{#if !ob.isActive}<Badge variant="outline" class="ml-2">Nonaktif</Badge>{/if}
						</td>
						<td class="px-4 py-3">Tgl {ob.dueDay}</td>
						<td class="px-4 py-3 text-right tabular-nums">
							{formatRupiah(ob.amount)}
							{#if ob.installments > 1}
								<span class="block text-xs text-muted-foreground">
									{ob.installments} × {formatRupiah(Math.floor(ob.amount / ob.installments))}
								</span>
							{/if}
						</td>
						<td class="px-2 py-2">
							<div class="flex justify-end">
								{#if ob.isActive}
									<Button variant="ghost" size="icon" title="Edit" onclick={() => onEdit(ob)}>
										<IconPencil />
									</Button>
								{/if}
								<form method="POST" action="/tagihan?/toggle" use:enhance>
									<input type="hidden" name="id" value={ob.id} />
									<input type="hidden" name="isActive" value={ob.isActive ? '0' : '1'} />
									<Button
										type="submit"
										variant="ghost"
										size="icon"
										title={ob.isActive ? 'Nonaktifkan (tidak ikut siklus berikutnya)' : 'Aktifkan lagi'}
									>
										{#if ob.isActive}<IconArchive />{:else}<IconRestore />{/if}
									</Button>
								</form>
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
