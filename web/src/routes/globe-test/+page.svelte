<script lang="ts">
	import PageBlocksV3 from "$lib/components/page_builder/page_blocks_v3/index.svelte";
	import SeoHead from "$lib/components/SeoHead.svelte";

	// no prefetch: the feed shows "Loading..." and fetches its whole population in the browser
	const blocks = [{
		item: {
			__typename: "page_blocks_v3_organism_data_feed" as const,
			section_color_theme: "light",
			section_padding_top: "none",
			section_padding_bottom: "none",
			feed_source: "Projects",
			feed_view: "Globe",
			feed_load_functionality: "all",
			feed_show_filter_menu: false,
			feed_filter_logic: "and"
		}
	}];
</script>

<SeoHead
	title="3D Globe Test"
	description=""
/>

<template>
	<PageBlocksV3 {blocks} />
</template>

<style lang="scss">
</style>