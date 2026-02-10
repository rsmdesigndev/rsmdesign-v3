<script lang="ts" context="module">
	import type { PageBlockProjectsGridData } from "./PageBlockProjectsGrid.svelte";
	import type { PageBlockBlockQuoteData } from "./PageBlockBlockQuote.svelte";
	import type { PageBlockCtaData } from "./PageBlockCta.svelte";
	import type { PageBlockImageRowData } from "./PageBlockImageRow.svelte";
	import type { PageBlockRichTextData } from "./PageBlockRichText.svelte";
	import type { PageBlockVideoData } from "./PageBlockVideo.svelte";
	import type { PageBlockAccordionData } from "./PageBlockAccordion.svelte";
	import type { PageBlockCarouselData } from "./PageBlockCarousel.svelte";
	// import type { PageBlockArticleGridData } from "./PageBlockArticleGrid.svelte";
	import PageBlockBlockQuote from "./PageBlockBlockQuote.svelte";
	import PageBlockCta from "./PageBlockCta.svelte";
	import PageBlockImageRow from "./PageBlockImageRow.svelte";
	import RichText from "./PageBlockRichText.svelte";
	import PageBlockVideo from "./PageBlockVideo.svelte";
	import PageBlockAccordion from "./PageBlockAccordion.svelte";
	import PageBlockBeforeAfterSwiper, { type PageBlockBeforeAfterSwiperData } from "./PageBlockBeforeAfterSwiper.svelte";
	import PageBlockCtaList, { type PageBlockCtaListData } from "./PageBlockCtaList.svelte";
	import PageBlockAccordionWithSlider, { type PageBlockAccordionWithSliderData } from "./PageBlockAccordionWithSlider.svelte";
	import PageBlockCtaListWithSlider, { type PageBlockCtaListWithSliderData } from "./PageBlockCtaListWithSlider.svelte";
	import PageBlockCards, { type PageBlockCardsData } from "./PageBlockCards.svelte";
	import PageBlockHeading, { type PageBlockHeadingData } from "./PageBlockHeading.svelte";
	import PageBlockFeaturedPage, { type PageBlockFeaturedPageData } from "./PageBlockFeaturedPage.svelte";
	import PageBlockList, { type PageBlockListData } from "./PageBlockList.svelte";
	import PageBlockProjectsGrid from "./PageBlockProjectsGrid.svelte";
	import PageBlockSpacer from "./PageBlockSpacer.svelte";
	import PageBlockArticleGrid from "./PageBlockArticleGrid.svelte";

	export type LayoutFields = {
		span_columns?: number | null;
		col_units?: string | null;
		col_start?: number | null;
		padding_left?: string | null;
		padding_right?: string | null;
		span_rows?: number | null;
		padding_top?: string | null;
		anchor_id?: string | null;
	};

	export type PageBlock =
		| ({ __typename: "page_block_blockquote" } 				& PageBlockBlockQuoteData)
		| ({ __typename: "page_block_cta" } 	   				& PageBlockCta)
		| ({ __typename: "page_block_image_row" } 				& PageBlockImageRowData)
		| ({ __typename: "page_block_rich_text" } 				& PageBlockRichTextData)
		| ({ __typename: "page_block_projects_grid" } 			& PageBlockProjectsGridData)
		| ({ __typename: "page_block_video" } 					& PageBlockVideoData)
		| ({ __typename: "page_block_carousel" } 				& PageBlockCarouselData)
		| ({ __typename: "page_block_accordion" } 				& PageBlockAccordionData)
		| ({ __typename: "page_block_accordion_with_slider" } 	& PageBlockAccordionWithSliderData)
		| ({ __typename: "page_block_before_after_swiper" } 	& PageBlockBeforeAfterSwiperData)
		| ({ __typename: "page_block_cta_list" } 				& PageBlockCtaListData)
		| ({ __typename: "page_block_cta_list_with_slider" } 	& PageBlockCtaListWithSliderData)
		| ({ __typename: "page_block_cards" } 					& PageBlockCardsData)
		| ({ __typename: "page_block_list" } 					& PageBlockListData)
		| ({ __typename: "page_block_featured_page" } 			& PageBlockFeaturedPageData)
		| ({ __typename: "page_block_heading" } 				& PageBlockHeadingData)
		| ({ __typename: "page_block_article_grid" } & any)
		| ({ __typename: "page_block_spacer" });
</script>

<script lang="ts">
	import PageBlockCarousel from "./PageBlockCarousel.svelte";
	import PageBlockTestimonials from "./PageBlockTestimonials.svelte";
	import PageBlockSplitContent from "./PageBlockSplitContent.svelte";
	import PageBlockAdvancedProjectGrid from "./PageBlockAdvancedProjectGrid.svelte";

	export let content: ({ item?: PageBlock | null } | null | undefined)[] | null | undefined;

	export let project: boolean = false;
	export let news: boolean = false;
</script>

<div class="container" class:news class:project>
	{#each content?.map((c) => c?.item) ?? [] as data, i}
		{@const order = (i + 1) * 2}

		{#if data?.__typename === "page_block_image_row"}
			<PageBlockImageRow {data} {order} {project} />

		{:else if data?.__typename === "page_block_cta"}
			<PageBlockCta {data} {order} {project} />

		{:else if data?.__typename === "page_block_rich_text"}
			<RichText {data} {order} {project} />

		{:else if data?.__typename === "page_block_blockquote"}
			<PageBlockBlockQuote {data} {order} {project} />

		{:else if data?.__typename === "page_block_video"}
			<PageBlockVideo {data} {order} {project} />

		{:else if data?.__typename === "page_block_accordion"}
			<PageBlockAccordion {data} {order} {project} />

		{:else if data?.__typename === "page_block_accordion_with_slider"}
			<PageBlockAccordionWithSlider {data} {order} {project} />

		{:else if data?.__typename === "page_block_before_after_swiper"}
			<PageBlockBeforeAfterSwiper {data} {order} {project} />
			
		{:else if data?.__typename === "page_block_cta_list"}
			<PageBlockCtaList {data} {order} {project} />

		{:else if data?.__typename === "page_block_cta_list_with_slider"}
			<PageBlockCtaListWithSlider {data} {order} {project} />
		
		{:else if data?.__typename === "page_block_cards"}
			<PageBlockCards {data} {order} {project} />
		
		{:else if data?.__typename === "page_block_heading"}
			<PageBlockHeading {data} {order} {project} />

		{:else if data?.__typename === "page_block_featured_page"}
			<PageBlockFeaturedPage {data} {order} {project} />

		{:else if data?.__typename === "page_block_list"}
			<PageBlockList {data} {order} {project} />

		{:else if data?.__typename === "page_block_projects_grid"}
			<PageBlockProjectsGrid {data} {order} {project} />

		{:else if data?.__typename === "page_block_spacer"}
			<PageBlockSpacer {order} />

		{:else if data?.__typename === "page_block_carousel"}
			<PageBlockCarousel {data} {order} {project} />

		{:else if data?.__typename === "page_block_article_grid"}
			<PageBlockArticleGrid data={data} {order} />
		
		{:else if data?.__typename === "page_block_testimonial_carousel"}
			<PageBlockTestimonials {data} {order} />

		{:else if data?.__typename === "page_block_split_content"}
			<PageBlockSplitContent {data} {order} />

		{:else if data?.__typename === "page_block_advanced_project_grid"}
			<PageBlockAdvancedProjectGrid {data} {order} />
		{/if}
	{/each}
</div>

<style lang="scss">
	div.container {
		/* OLD VALUES FROM V2 SYSTEM */
		--SPACE-SM: calc(var(--GRID-CELL) / 4);
		--SPACE-MD: calc(var(--GRID-CELL) / 2);
		--SPACE-LG: var(--GRID-CELL);
		--SPACE-XL: calc(var(--GRID-CELL) * 2);
		--SPACE-XXL: calc(var(--GRID-CELL) * 4);
		--SPACE-XXXL: calc(var(--GRID-CELL) * 6);

		margin-bottom: var(--GRID-CELL);
		&:first-child {
			margin-top: calc(var(--HEADER-HEIGHT) + var(--GRID-CELL));
		}

		&.project {
			grid-template-columns: var(--GRID-CONTAINER-PROJECTS);
		}

		&.news {
			grid-column: main;
			display: grid;
			grid-template-columns: subgrid;

			:global {
				section.heading {
					grid-column: eighth-start 2 / eighth-end 7;

					@media (max-width: 62.5em) {
						grid-column: main;
					}
				}
				section.blockQuote,
				section.cta,
				section.richText {
					grid-column: eighth-start 2 / eighth-end 6;

					@media (max-width: 62.5em) {
						grid-column: third-start 1 / third-end 2;
					}

					@media (max-width: 31.25em) {
						grid-column: main;
					}
				}

				section.imageRow {
					grid-column: main;
					+ section.richText,
					+ section.blockQuote {
						margin-top: calc(var(--GRID-CELL) * 3);
					}
				}

				section.richText,
				section.blockQuote {
					+ section.imageRow {
						margin-top: calc(var(--GRID-CELL) * 3);
						height: calc(100% - var(--GRID-CELL) * 3);
					}
				}

				section.richText {
					> article > h2:last-child,
					> article > h3:last-child,
					> article > h4:last-child,
					> article > h5:last-child,
					> article > h6:last-child {
						margin-bottom: calc(var(--GRID-CELL) * -2.667);
					}
				}

				section.blockQuote {
					figure {
						align-items: flex-start;
						text-align: left;
					}
				}
			}
		}
	}
	:global {
		section {
			+ section.padding-top-default,
			+ section.padding-top-none {
				margin-top: calc(var(--GRID-CELL) / 2);
			}
		}
		section.heading {
			&.padding-top-default:not(:first-child) {
				margin-top: calc(var(--GRID-CELL) * 4);
			}
			+ section.padding-top-default.richText {
				margin-top: calc(var(--GRID-CELL) / 2);

				&.initial-heading {
					margin-top: var(--GRID-CELL);
				}
			}
			+ section.padding-top-default.projectsGrid {
				margin-top: calc(var(--GRID-CELL));
			}
			+ section.padding-top-default.featuredPage {
				margin-top: calc(var(--GRID-CELL) * 6);
			}
			+ section.padding-top-default.list {
				@media (max-width: 62.5em) {
					margin-top: var(--GRID-CELL);

					+ section.padding-top-default.cta {
						margin-top: var(--GRID-CELL);

						@media (max-width: 31.25em) {
							margin-top: calc(var(--GRID-CELL) / 2);
						}
					}
				}
			}
		}
		section.richText {
			/* > article > h2:last-child,
			 * > article > h3:last-child,
			 * > article > h4:last-child,
			 * > article > h5:last-child,
			 * > article > h6:last-child {
			 * 	 margin-bottom: calc(var(--GRID-CELL) * -5.667);
			 * }
			 */
			+ section.padding-top-default.imageRow {
				margin-top: calc(var(--GRID-CELL) * 6);
				height: calc(100% - var(--GRID-CELL) * 6);
			}
			+ section.padding-top-default.cta {
				margin-top: var(--GRID-CELL);
			}
			+ section.padding-top-default.projectsGrid {
				margin-top: calc(var(--GRID-CELL) * 4);
			}

			&.terminal-heading {
				+ section.padding-top-default.imageRow {
					margin-top: 1rem;
					height: calc(100% - 1rem);
				}
				+ section.padding-top-default.blockQuote {
					margin-top: calc(var(--GRID-CELL) * 4);
				}
			}
		}
		section.imageRow {
			+ section.padding-top-default.richText {
				margin-top: calc(var(--GRID-CELL) * 6);
			}
			+ section.padding-top-default.blockQuote {
				margin-top: calc(var(--GRID-CELL) * 2);
			}
		}
		section.video {
			+ section.padding-top-default.richText {
				margin-top: calc(var(--GRID-CELL) * 6);
			}
			+ section.padding-top-default.blockQuote {
				margin-top: calc(var(--GRID-CELL) * 2);
			}
		}
		section.padding-top-default.cards {
			margin-top: calc(var(--GRID-CELL) * 2);
		}
		section.cta {
			+ section.padding-top-default.imageRow {
				margin-top: calc(var(--GRID-CELL) * 3);
				height: calc(100% - var(--GRID-CELL) * 3);
			}
			+ section.padding-top-default.projectsGrid {
				margin-top: calc(var(--GRID-CELL) * 4);
			}
		}
		section.blockQuote {
			+ section.padding-top-default.imageRow {
				margin-top: calc(var(--GRID-CELL) * 2);
				height: calc(100% - var(--GRID-CELL) * 2);
			}
			+ section.padding-top-default.richText {
				margin-top: calc(var(--GRID-CELL) * 1.5);
			}
		}
		section.list {
			+ section.padding-top-default.projectsGrid {
				margin-top: calc(var(--GRID-CELL) * 4);
			}
		}

		section.projectsGrid {
			+ section.padding-top-default {
				margin-top: calc(var(--GRID-CELL) * 3);
			}
			+ section.padding-top-default.header {
				margin-top: calc(var(--GRID-CELL) * 2);
			}
			+ section.padding-top-default.featuredPage {
				margin-top: calc(var(--GRID-CELL) * 2);
			}
		}

		section.featuredPage {
			+ section.padding-top-default {
				margin-top: calc(var(--GRID-CELL) * 2);
			}
			+ section.padding-top-default.heading:not(:first-child) {
				margin-top: calc(var(--GRID-CELL) * 3);
			}
		}

		@media (max-width: 31.25em) {
			section.blockQuote, 
			section.richText,
			section.cta,
			section.cards {
				width: 80%;
			}
		}
	}
</style>