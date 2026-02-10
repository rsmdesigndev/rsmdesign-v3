<script lang="ts">
	import { assetUrl } from "$lib/cms/assets";
	import type { PageData } from "./$types";
	import PageBlocks from "$lib/components/page_builder/page_blocks/index.svelte";
	import NextEntry, { EntryType } from "$lib/components/NextEntry.svelte";
	import SeoHead from "$lib/components/SeoHead.svelte";
	import { formatDate } from "$lib/format";

	export let data: PageData;
</script>

<SeoHead
	title={data.news_post.post_title ?? ""}
	description={data.news_post.seo_page_description ?? undefined}
	noindex={data.news_post.visibility === "draft"}
/>

<article>
	<h1>{data.news_post.post_title ?? "News Post"}</h1>
	<p class="kicker">
		Posted {formatDate(data.news_post.published_date, { fullMonth: true })}
		&emsp;·&emsp;
		{#each data.news_post.topics as topic, i}
			{#if data.news_post.topics.length === i + 1}
				{topic.news_topics_id.name}
			{:else}
				{topic.news_topics_id.name},
			{/if}
		{/each}
	</p>
	<figure class="hero-image">
		<img
			src={assetUrl(data.news_post.hero_image?.filename_disk)}
			alt={data.news_post.hero_image?.description}
			class={data.news_post.hero_image_crop_attachment === "left"
				? "position-left"
				: data.news_post.hero_image_crop_attachment === "center_left"
				? "position-center-left"
				: data.news_post.hero_image_crop_attachment === "center"
				? ""
				: data.news_post.hero_image_crop_attachment === "center_right"
				? "position-center-right"
				: data.news_post.hero_image_crop_attachment === "right"
				? "position-right"
				: ""}
		/>
	</figure>
	{#if data.news_post.page_content}
		<PageBlocks content={data.news_post.page_content} news />
	{/if}
	<div class="container">
		<NextEntry currentSlug={data.news_post.slug ?? ""} entryType={EntryType.Article} />
	</div>
</article>

<style lang="scss">
	article {
		grid-column: viewport;
		margin-top: var(--SPACE-XXL);
		display: grid;
		grid-template-columns: subgrid;

		
		h1 {
			grid-column: eighth-start 1 / eighth-end 7;
			margin-bottom: 0.25em;

			@media (max-width: 62.5em) {
				grid-column: main;
			}

			font-size: calc((var(--FONT-SIZE-XXXL) + var(--FONT-SIZE-XXL)) / 2);
			line-height: 1;
		}
		p.kicker {
			grid-column: main;
			margin-bottom: calc(var(--GRID-CELL) * 1.5);
			font-weight: 500;
			color: var(--color-secondary, var(--COLOR-MID-GRAY));
		}
		figure.hero-image {
			grid-column: viewport;
			margin: 0 0 var(--SPACE-XL);
			padding: 0;
			img {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}
		}
	}

	:global(.rich-text h2) {
		font-size: var(--FONT-SIZE-XL);
		text-transform: capitalize;
		letter-spacing: 0.015em;
	}
</style>
