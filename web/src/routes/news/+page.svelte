<script lang="ts">
	import type { PageData } from "./$types";
	import SeoHead from "$lib/components/SeoHead.svelte";
	import PageBlocksV3 from "$lib/components/page_builder/page_blocks_v3/index.svelte";
	
	export let data: PageData;
</script>

<SeoHead
	title="News & Information"
	description="Learn about our industry, projects, studios, team members, press, and more. Read the latest news and information on our site today."
/>

<template>
	{#if data.news_page.news_use_page_blocks_v3}
		{#if data.news_page.news_page_blocks_v3}
			<PageBlocksV3 blocks={data.news_page.news_page_blocks_v3} />
		{:else}
			<div class="container">Page Blocks v3 selected, but no blocks added.</div>
		{/if}
	{:else}
		<div class="container">No v3 content added to page.</div>
	{/if}
</template>

<style lang="scss">
	
</style>
