<script lang="ts">
	import type { PageData } from "./$types";
	import SeoHead from "$lib/components/SeoHead.svelte";
	import PageBlocksV3 from "$lib/components/page_builder/page_blocks_v3/index.svelte";

	export let data: PageData;
</script>

<SeoHead
	title="Our Markets & Services"
	description="We provide branding, wayfinding, placemaking, environmental graphic design, and more in retail, civic, mixed-use, and residential spaces."
/>

<template>
	{#if data.expertise_page.expertise_use_page_blocks_v3}
		{#if data.expertise_page.expertise_page_blocks_v3}
			<PageBlocksV3 blocks={data.expertise_page.expertise_page_blocks_v3} />
		{:else}
			<div class="container">Page Blocks v3 selected, but no blocks added.</div>
		{/if}
	{:else}
		<div class="container">No v3 content added to page.</div>
	{/if}
</template>

<style lang="scss">
	.container {
		margin-top: calc(var(--HEADER-HEIGHT) + var(--GRID-CELL));
		
		@media (max-width: 31.25em) {
			margin-top: var(--HEADER-HEIGHT);
		}
	}
</style>
