<script lang="ts">
	import CycleHistory from '$features/cycles/CycleHistory.svelte';

	let { data } = $props();
</script>

<svelte:head><title>Riwayat · Buku Bulanan</title></svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-xl font-semibold">Riwayat Siklus</h1>
		<p class="text-sm text-muted-foreground">Rekap siklus yang sudah selesai.</p>
	</div>
	<CycleHistory summaries={data.summaries} />
</div>
