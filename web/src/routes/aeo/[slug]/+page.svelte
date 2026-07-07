<script lang="ts">
	import type { PageData } from "./$types";
	import { assetUrl } from "$lib/cms/assets";
	import SeoHead from "$lib/components/SeoHead.svelte";
	import Cta, { type CtaData } from "$lib/components/page_builder/page_blocks_v3/atoms/Cta.svelte";
	import RichText, { type RichTextData } from "$lib/components/page_builder/page_blocks_v3/atoms/RichText.svelte";

	export let data: PageData;

	const aeoBody: RichTextData = {
		rich_text_size: "md",
		rich_text_content: data.article.aeo_article_body
	}

	const aeoCta = {
		cta_type: "link",
		cta_icon: "none",
		cta_style: "light",
		cta_hover_highlight: "light"
	}
</script>

<SeoHead
	title={`FAQs · ${data.article.aeo_article_heading}`}
	description={data.article.aeo_article_body ? data.article.aeo_article_body.replace(/<[^>]+>/g, '').slice(0, 254) + "…" : ""}
	noindex={data.article.aeo_article_visibility === "feed"}
/>

<template>
	{#if data.article.aeo_article_page_blocks_v3}
		<PageBlocksV3 blocks={data.article.aeo_article_page_blocks_v3} />
	{:else}
		<div class="container">Page Blocks v3 selected, but no blocks added.</div>
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
		/* 
			Z-Indexes
			1: Background color
			2: Content
			3: Menu bar
			4: Logo
			5: Hero
			6: Breadcrumbs
			7: Menu overlay
			8: Menu button
		*/
		z-index: 2;
		position: relative;

		grid-column: viewport;
		display: grid;
		grid-template-columns: subgrid;
		align-items: var(--columns-alignment);

		margin-top: var(--SPACE-XXL);

		row-gap: var(--SPACE-MD);

		> h1 {
			grid-row: 1;
			grid-column: main;

			font-size: var(--FONT-SIZE-XXL);
			font-weight: 300;
			line-height: 1;
		}

		> section.tags-wrapper {
			padding: var(--SPACE-MD) 0;
			grid-column: viewport;
			background-color: #f2f2f3;

			display: grid;
			grid-template-columns: subgrid;

			> div.tags-container {
				grid-column: main;

				display: grid;
				grid-template-columns: repeat(4, 1fr);
				grid-auto-flow: row dense;
				column-gap: var(--SPACE-MD);

				@media (max-width: 62.5em) {
					grid-template-columns: repeat(3, 1fr);
				}

				@media (max-width: 31.25em) {
					grid-template-columns: repeat(2, 1fr);
				}

				> div {
					display: flex;
					flex-direction: column;
					row-gap: 0.25rem;
				}

				h2 {
					font-size: var(--FONT-SIZE-SM);
				}

				h3 {
					font-size: var(--FONT-SIZE-XS);
					text-transform: uppercase;
					letter-spacing: 0.05em;
				}
			}
		}

		> section.body {
			grid-column: eighth-start 1 / eighth-end 4;

			@media (max-width: 62.5em) {
				grid-column: third-start 1 / third-end 2;
			}
			@media (max-width: 31.25em) {
				grid-column: main;
			}
		}

		> figure {
			grid-column: eighth-start 6 / eighth-end 8;

			@media (max-width: 62.5em) {
				grid-column: third-start 3 / third-end 3;
			}
			@media (max-width: 31.25em) {
				grid-column: main;
			}

			margin: 0;
			padding: 0;

			position: relative;

			> img {
				width: 100%;
				height: auto;

				position: sticky;
				top: calc(var(--GRID-CELL) * 1.75); 
			}
		}
	}
</style>