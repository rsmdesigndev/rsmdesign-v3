<script lang="ts">
    import type { PageData } from './$types';
    import PageBlocks from "$lib/components/page_builder/page_blocks/index.svelte";
    import SeoHead from "$lib/components/SeoHead.svelte";
    
    export let data: PageData;

	$: console.log(data);
</script>

<SeoHead
	title={data.video?.seo_title ?? ""}
	description={data.video?.seo_page_description ?? undefined}
    slug="video"
/>

<template>
    <PageBlocks content={data.video?.page_content} />
</template>