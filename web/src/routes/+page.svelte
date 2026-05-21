<script lang="ts">
	import type { PageData } from "./$types";
	import PageBlocksV3 from "$lib/components/page_builder/page_blocks_v3/index.svelte";
	import SeoHead from "$lib/components/SeoHead.svelte";

	export let data: PageData;
</script>

<SeoHead
	title={data.homepage?.seo_title ?? ""}
	description={data.homepage?.seo_description ?? undefined}
/>

<template>
	{#if data.homepage.home_use_page_blocks_v3}
		{#if data.homepage.home_page_blocks_v3}
			<PageBlocksV3 blocks={data.homepage.home_page_blocks_v3} />
		{:else}
			<div class="container">Page Blocks v3 selected, but no blocks added.</div>
		{/if}
	{:else}
		<div class="container">No v3 content added to page.</div>
	{/if}
</template>

<style lang="scss">
	
</style>
