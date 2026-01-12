<script lang="ts">
	export type dataFeedGridData = {
		feed_source?: string | null;
		feed_grid_columns?: number | null;
		feed_grid_style?: string | null;
	};

	export let data: dataFeedGridData;
	export let feedData: any[];
</script>

<template>
	Grid
</template>

<style lang="scss">
</style>