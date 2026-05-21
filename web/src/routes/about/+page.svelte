<script lang="ts">
	import type { PageData } from "./$types";
	import SeoHead from "$lib/components/SeoHead.svelte";
	import PageBlocksV3 from "$lib/components/page_builder/page_blocks_v3/index.svelte";
	
	export let data: PageData;
</script>

<SeoHead
	title="About Us"
	description="We are a passionate team of designers, architects, and storytellers working at the intersection of graphics and architecture. Learn about us."
/>

<template>
	{#if data.about?.about_use_page_blocks_v3}
		{#if data.about.about_page_blocks_v3}
			<PageBlocksV3 blocks={data.about.about_page_blocks_v3} />
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
		grid-template-rows: auto 1fr;
		grid-auto-rows: auto;
	}
</style>
