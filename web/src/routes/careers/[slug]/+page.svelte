<script lang="ts">
	import SeoHead from "$lib/components/SeoHead.svelte";
	import type { PageData } from "./$types";
	import PageBlocksV3 from "$lib/components/page_builder/page_blocks_v3/index.svelte";

	export let data: PageData;
</script>

<SeoHead
	title={`${data.career.name} · Careers`}
	description={data.career.seo_page_description ?? ""}
	noindex={data.career.visibility === "draft"}
/>

<template>
	{#if data.career.careers_page_blocks_v3}
		<PageBlocksV3 blocks={data.career.careers_page_blocks_v3} />
	{:else}
		<div class="container">Page Blocks v3 selected, but no blocks added.</div>
	{/if}
</template>

<style lang="scss">
	
</style>