<script lang="ts">
	import SeoHead from "$lib/components/SeoHead.svelte";
	import type { PageData } from "./$types";
	import PageBlocksV3 from "$lib/components/page_builder/page_blocks_v3/index.svelte";

	export let data: PageData;
</script>

<SeoHead
	title={data?.careers_page?.seo_title ? data?.careers_page?.seo_title : "Careers"}
	description={data?.careers_page?.seo_page_description ? data?.careers_page?.seo_page_description : "Explore Careers at RSM Design"}
/>

<template>
	{#if data.careers_page.careers_page_page_blocks_v3}
		<PageBlocksV3 blocks={data.careers_page.careers_page_page_blocks_v3} />
	{:else}
		<div class="container">Page Blocks v3 selected, but no blocks added.</div>
	{/if}
</template>

<style lang="scss">
	
</style>