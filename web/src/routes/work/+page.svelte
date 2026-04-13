<script lang="ts">
	import SeoHead from "$lib/components/SeoHead.svelte";
	import type { PageData } from "./$types";
	import PageBlocksV3 from "$lib/components/page_builder/page_blocks_v3/index.svelte";

	export let data: PageData;
</script>

<SeoHead
	title={data?.work_page?.seo_title}
	description={data?.work_page?.seo_page_description}
/>

<template>
	{#if data.work_page.work_page_blocks_v3}
		<PageBlocksV3 blocks={data.work_page.work_page_blocks_v3} />
	{:else}
		<div class="container">Page Blocks v3 selected, but no blocks added.</div>
	{/if}
</template>

<style lang="scss">
	
</style>