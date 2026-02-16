<script lang="ts" context="module">
	export type SpacerData = {
		spacer_height?: string | null;
	};
</script>

<script lang="ts">
	export let data: SpacerData;
</script>

<template>
	<div class="spacer" 
		 style:--spacer-height={`var(--SPACE-${data.spacer_height?.toUpperCase()})`}
	/>
</template>

<style lang="scss">
	.spacer {
		grid-column: 1 / -1;
		height: var(--spacer-height);
	}
</style>