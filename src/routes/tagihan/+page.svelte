<script lang="ts">
	import { Button } from '$components/ui/button';
	import ObligationList from '$features/obligations/ObligationList.svelte';
	import ObligationForm from '$features/obligations/ObligationForm.svelte';
	import type { Obligation } from '$features/obligations/obligation.schema';
	import { IconPlus } from '@tabler/icons-svelte';

	let { data } = $props();

	let formOpen = $state(false);
	let editing = $state<Obligation | null>(null);

	function openForm(ob: Obligation | null) {
		editing = ob;
		formOpen = true;
	}
</script>

<svelte:head><title>Tagihan · Buku Bulanan</title></svelte:head>

<div class="space-y-stack-lg">
	<div class="flex items-end justify-between gap-stack-md">
		<div class="space-y-stack-xs">
			<h1 class="text-xl font-bold tracking-tight">Tagihan Wajib</h1>
			<p class="text-sm text-muted-foreground">Master tagihan yang dibuat ulang setiap siklus baru.</p>
		</div>
		<Button size="sm" onclick={() => openForm(null)}>
			<IconPlus />
			Tambah
		</Button>
	</div>

	<ObligationList obligations={data.obligations} onEdit={openForm} />
</div>

<ObligationForm bind:open={formOpen} obligation={editing} hasActiveCycle={data.hasActiveCycle} />
