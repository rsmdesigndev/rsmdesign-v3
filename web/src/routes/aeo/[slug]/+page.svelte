<script lang="ts">
	import type { PageData } from "./$types";
	import { assetUrl } from "$lib/cms/assets";
	import SeoHead from "$lib/components/SeoHead.svelte";
	import PageBlocks from "$lib/components/page_builder/page_blocks/index.svelte";
	import PageBlocksV3 from "$lib/components/page_builder/page_blocks_v3/index.svelte";
	import Cta, { type CtaData } from "$lib/components/page_builder/page_blocks_v3/atoms/Cta.svelte";
	import RichText, { type RichTextData } from "$lib/components/page_builder/page_blocks_v3/atoms/RichText.svelte";

	export let data: PageData;
</script>

<SeoHead
	title={`FAQs · ${data.article.aeo_article_heading}`}
	description={data.article.aeo_article_page_description}
	noindex={data.article.aeo_article_visibility === "feed"}
/>

<template>
	{#if data.article.aeo_article_use_page_blocks_v3}
		{#if data.article.aeo_article_page_blocks_v3}
			<PageBlocksV3 blocks={data.article.aeo_article_page_blocks_v3} />
		{:else}
			<div class="container">Page Blocks v3 selected, but no blocks added.</div>
		{/if}
	{:else}
		<article>
			<h1>{data.article.aeo_article_heading ?? "AEO Post"}</h1>
			{#if data.article.page_content}
				<PageBlocks content={data.article.page_content} news />
			{/if}
		</article>
	{/if}
	<!--<article>
		<h1>{data.article.aeo_article_heading}</h1>
		{#if data.article.aeo_article_services.length || data.article.aeo_article_markets.length || data.article.aeo_article_regions.length}
			<section class="tags-wrapper">
				<div class="tags-container">
					<h2>Article tags</h2>
					{#if data.article.aeo_article_services.length}
						<div>
							<h3>Services</h3>
							{#each data.article.aeo_article_services as service}
								<Cta data={ {...aeoCta,
											 cta_text_light: service.services_id.name,
											 cta_link: `/services/${service.services_id.slug}`
										  } }
									 sizeOverride="sm"
								/>
							{/each}
						</div>
					{/if}
					{#if data.article.aeo_article_markets.length}
						<div>
							<h3>Markets</h3>
							{#each data.article.aeo_article_markets as market}
								<Cta data={ {...aeoCta,
											 cta_text_light: market.markets_id.name,
											 cta_link: `/markets/${market.markets_id.slug}`
										  } }
									 sizeOverride="sm"
								/>
							{/each}
						</div>
					{/if}
					{#if data.article.aeo_article_regions.length}
						<div>
							<h3>Regions</h3>
							{#each data.article.aeo_article_regions as region}
								<Cta data={ {...aeoCta,
											 cta_text_light: region.geographical_regions_id.name,
											 cta_link: `/regions/${region.geographical_regions_id.slug}`
										  } }
									 sizeOverride="sm"
								/>
							{/each}
						</div>
					{/if}
				</div>
			</section>
		{/if}
		<section class="body">
			<RichText data={aeoBody} linkColor={"primary"} />
		</section>
		<figure>
			<img
				src={assetUrl(data.article.aeo_article_image?.filename_disk)}
				alt={data.article.aeo_article_image?.description}
			/>
		</figure>
	</article>-->
</template>

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
			font-weight: 300;
			line-height: 1;
		}
	}

	:global(.rich-text h2) {
		font-size: var(--FONT-SIZE-XL);
		text-transform: capitalize;
		letter-spacing: 0.015em;
	}
</style>