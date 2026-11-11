<script lang="ts">
	import type { PageData } from "./$types";
	import SeoHead from "$lib/components/SeoHead.svelte";
	import PageBlocksV3 from "$lib/components/page_builder/page_blocks_v3/index.svelte";
	
	export let data: PageData;
</script>

<SeoHead
	title={`${data.global.seo_title}`}
	description={data.global.seo_page_description ?? ""}
	noindex="true"
/>

<template>
	{#if data.global.global_page_blocks_v3}
		<PageBlocksV3 blocks={data.global.global_page_blocks_v3} />
	{:else}
		<div class="container">Page Blocks v3 selected, but no blocks added.</div>
	{/if}
</template>

<style lang="scss">
	.container {
		margin-top: calc(var(--HEADER-HEIGHT) + var(--GRID-CELL));
		grid-template-rows: auto 1fr;
		grid-auto-rows: auto;
	}
</style>
