<script lang="ts">
	import CycleHistory from '$features/cycles/CycleHistory.svelte';

	let { data } = $props();
</script>

<svelte:head><title>Riwayat · Buku Bulanan</title></svelte:head>

<div class="space-y-stack-lg">
	<div class="space-y-stack-xs">
		<h1 class="text-xl font-bold tracking-tight">Riwayat Siklus</h1>
		<p class="text-sm text-muted-foreground">Rekap siklus yang sudah selesai.</p>
	</div>
	<CycleHistory summaries={data.summaries} />
</div>
