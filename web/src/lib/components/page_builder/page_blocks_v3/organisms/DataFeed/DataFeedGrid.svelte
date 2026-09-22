<script lang="ts">
	import { onMount } from 'svelte';
	import type { ImageAssetRelation } from "$lib/cms";
	import { assetUrl } from "$lib/cms/assets";
	import { animate, AnimateTrigger } from "$lib/animate";
	import Card, { type CardData } from "../../molecules/Card.svelte";
	import Heading from "../../atoms/Heading.svelte";
	import Cta from "../../atoms/Cta.svelte";
	import { feedGridLayout, type BreakpointNumbers } from "$lib/cms/dataFeed/dataFeedGridLayout";
	
	export type dataFeedGridData = {
		feed_source?: string | null;
		feed_grid_columns?: number | null;
		feed_grid_style?: string | null;
		feed_grid_parallax_direction?: string | null;
		feed_grid_image_drop_shadow?: boolean | null;
		feed_grid_dynamic_start_position?: boolean | null;
		feed_grid_dynamic_images?: ImageAssetRelation[] | null;
		feed_cards?: CardData[] | null;
	};

	export let data: dataFeedGridData;
	export let feedData: any[] | null;
	export let rowNumber: number;
	export let gridNumber: number = 0;
	export let itemParams: string = "";
	export let hasMoreItems: boolean = false;
	export let firstImageIndexes: BreakpointNumbers = {};

	$: startRight = String(data.feed_grid_dynamic_start_position) === "true";

	$: items = (data.feed_source === "Manual" ? data.feed_cards : feedData) ?? [];

	$: gridLayout = feedGridLayout(
		items.length,
		data.feed_grid_dynamic_images?.length ?? 0,
		{ columns: data.feed_grid_columns, style: data.feed_grid_style, startRight },
		hasMoreItems,
		firstImageIndexes
	);

	$: gridClasses = [
		data.feed_grid_columns === 2 ? "half" : (data.feed_grid_columns === 3 ? "third" : (data.feed_grid_columns === 4 ? "fourth" : "single-card")),
		`grid-style-${data.feed_grid_style}`,
		startRight ? "start-right" : "start-left"
	].join(" ");

	const itemHeading = {
		heading_type: "feed-item",
		heading_primary: "large",
		heading_size: data.feed_grid_columns === 1 ? "xxl" : "lg",
		heading_weight: "regular",
		heading_has_small_text: data.feed_grid_columns === 1 ? false : true,
		heading_has_large_text: true,
		heading_has_superscript: false
	}

	// inset slots are square and keep the grid image
	const usesHeroImage = (gridColumn?: string): boolean => Boolean(gridColumn?.includes("viewport-"));

	let innerWidth: number;
	let gridColumns: number = data.feed_grid_columns;

	onMount(() => {
		if (innerWidth <= 500) {
			gridColumns = 2;
		};
	});
</script>

<svelte:window bind:innerWidth />

<template>
	{#each gridLayout.cells as cell (cell.image?.key ?? items[cell.itemIndex]?.id ?? cell.itemIndex)}
		{@const i = cell.itemIndex}
		{@const item = items[i]}
		{#if cell.image}
			<div class={`grid-item dynamic-image ${gridClasses} ${cell.image.classes}`}
				 style:--grid-column={cell.image.gridColumns.desktop}
				 style:--grid-column-tablet={cell.image.gridColumns.tablet}
				 style:--grid-column-mobile={cell.image.gridColumns.mobile}
			>
				<figure>
					<picture>
						<img src={assetUrl(data.feed_grid_dynamic_images?.[cell.image.index]?.directus_files_id.filename_disk)}
							 alt={data.feed_grid_dynamic_images?.[cell.image.index]?.directus_files_id.description}
						/>
					</picture>
				</figure>
			</div>
		{:else}
			<svelte:element 
				this={data.feed_source === "Projects" ? "a" :
					 (data.feed_source === "Articles" ? "a" :
					 (data.feed_source === "Team" && item.has_profile_page ? "a" : "div"))}
				href={data.feed_source === "Manual" ? undefined : `/${data.feed_source === "Projects" ? "work/" : (data.feed_source === "Articles" ? "news/" : (data.feed_source === "Team" ? "team/" : ""))}${item.slug}${itemParams}`}
				id={`row-${rowNumber}-grid-${gridNumber}-item-${i}`}
				class={`grid-item 
						${data.feed_source === "Team" ? "team" : ""}
						${data.feed_source === "Testimonials" ? "testimonial" : ""}
						${gridClasses}
						${gridLayout.itemClasses[i]}
					  `}
				style:--grid-column={gridLayout.itemGridColumns[i]?.desktop}
				style:--grid-column-tablet={gridLayout.itemGridColumns[i]?.tablet}
				style:--grid-column-mobile={gridLayout.itemGridColumns[i]?.mobile}
				style:--grid-item={i}
				style:--grid-columns={gridColumns}
				style:--position-in-grid-row={data.feed_grid_parallax_direction === "unidirectional" ? `calc(mod(${i}, var(--grid-columns)))` : (Math.floor(i / gridColumns) % 2 == 0 ? `calc(mod(${i}, var(--grid-columns)))` : `calc(var(--grid-columns) - mod(${i}, var(--grid-columns)))`)}
				style:--animation-direction={data.feed_grid_parallax_direction === "unidirectional" ? 1 : (Math.floor(i / gridColumns) % 2 == 0 ? 1 : -1)}
			>
				{#if data.feed_grid_style === "parallax"}
					<div class="parallax-animation-trigger"
						 use:animate={ { trigger: AnimateTrigger.WhileScrollingInView, targetSelector: `#row-${rowNumber}-grid-${gridNumber}-item-${i}`, animClass: "feed-grid-parallax-animate" } }
					/>
				{/if}
				{#if data.feed_source === "Manual"}
					<Card data={item} 
						  bleed={ { left: false, 
									right: false 
								} } 
						  isScrollItem={false}
						  isActive={true}
						  hasDropShadow={data.feed_grid_image_drop_shadow}
					/>
				{:else}
					<figure><!-- class:testimonial={data.feed_source === "Testimonials"}>-->
						<picture>
							{#if data.feed_source === "Team"}
								<img src={assetUrl(item.headshot?.filename_disk)}
									 alt={item.headshot?.title}
								/>
							<!--{:else if data.feed_source === "Testimonials"}
								<img src={assetUrl(item.banner_image?.filename_disk)}
									 alt={item.banner_image?.title}
								/>-->
							{:else if data.feed_grid_style === "dynamic"}
								{#if usesHeroImage(gridLayout.itemGridColumns[i]?.desktop)}
									<source media="not all and (max-width: 62.5em)" srcset={assetUrl(item.hero_image?.filename_disk)} />
								{/if}
								<img src={assetUrl(item.grid_image?.filename_disk)}
									 alt={item.grid_image?.title}
								/>
							{:else if data.feed_grid_style === "banner"}
								<img src={assetUrl(item.hero_image?.filename_disk)}
									 alt={item.hero_image?.title}
								/>
							{:else}
								<img src={assetUrl(item.grid_image?.filename_disk)}
									 alt={item.grid_image?.title}
								/>
							{/if}
						</picture>
						<figcaption>
							{#if data.feed_source === "Projects"}
								<Heading 
									data={ {...itemHeading, 
											heading_small: item.location,
											heading_large: item.project_title
										 } }
								/>
							{:else if data.feed_source === "Articles"}
								<Heading 
									data={ {...itemHeading, 
											heading_small: item.topics?.[0]?.news_topics_id?.name,
											heading_large: item.post_title
										 } }
								/>
							{:else if data.feed_source === "Team"}
								<Heading 
									data={ {...itemHeading, 
											heading_small: item.short_title,
											heading_large: item.name
										 } }
								/>
							<!--{:else if data.feed_source === "Testimonials"}
								<Blockquote 
									data={ { blockquote_size: "md",
											 blockquote_text: item.quote ?? "",
											 blockquote_has_attribution: true,
											 blockquote_attribution: `${item.quote_attribution ?? ""} \n`,
											 blockquote_has_citation: true,
											 blockquote_citation_newline: true,
											 blockquote_citation: `${item.quote_attribution_job_title ?? ""} \n${item.company_name ?? ""}`,
											 blockquote_link: null
										 } }
								/>-->
							{/if}
							{#if data.feed_grid_columns === 1 && data.feed_grid_style != "banner"}
								<!--<p class="headline">[Insert hero headline here lorem ipsum dolor sit amet.]</p>-->
								{#if data.feed_source === "Projects"}
									<Cta data={ { cta_type: "link",
												  cta_icon: "arrow_right", 
												  cta_style: "bold",
												  cta_text_bold: "View project",
												  cta_text_align: "right"
											  } }
									/>
								{/if}
							{/if}
						</figcaption>
					</figure>
				{/if}
			</svelte:element>
		{/if}
	{/each}
</template>

<style lang="scss">
	a.grid-item {
		> figure > picture {
			aspect-ratio: 1 / 1;
		}
		&:hover {
			> figure {
				> picture {
					> img {
						transform: scale(1.05);

						@media (max-width: 46.875em) {
							transform: scale(1);
						}
					}
				}
				> figcaption {
					--color-heading: var(--color-accent, var(--COLOR-ORANGE));
					transition: color 0.3s ease;
				}
			}
		}
	}
	.grid-item.team {
		> figure > picture {
			aspect-ratio: 1 / 1;
			
			> img {
				object-position: center top;
			}
		}
	}
	.grid-item {
		display: grid;
		grid-template-columns: subgrid;
		align-self: start;

		position: relative;

		> figure {
			grid-column: 1 / -1;
			padding: 0;
			margin: 0;

			display: grid;
			grid-template-columns: subgrid;

			> picture {
				grid-column: 1 / -1;
				margin: 0 0 var(--SPACE-SM);
				overflow: hidden;
				background-color: var(--COLOR-BG-LIGHT);

				> img {
					object-fit: cover;
					height: 100%;
					width: 100%;
					max-width: 100%;
					transform: scale(1);
					transition: transform 0.75s ease;
				}
			}

			> figcaption {
				grid-column: 1 / -1;
			}
		}

		&.single-card {
			> figure > picture {
				margin-bottom: 0;
			}

			&:not(.grid-style-banner), {
				grid-column: main;
				display: grid;
				grid-template-columns: subgrid;

				> figure {
					grid-column: main;
					display: grid;
					grid-template-columns: subgrid;
					align-items: start;

					> picture {
						margin: 0;
						grid-column: eighth-start 4 / eighth-end 7;

						@media (max-width: 62.5em) {
							grid-column: half-start 2 / half-end 2;
						}
					}

					> figcaption {
						grid-row: 1;
						grid-column: eighth-start 1 / eighth-end 3;

						@media (max-width: 62.5em) {
							grid-column: half-start 1 / half-end 1;
						}

						align-self: center;
						margin-bottom: var(--SPACE-LG);

						text-align: right;

						> p.headline {
							text-wrap: balance;
							margin-top: var(--SPACE-SM);
						}
					}
				}
			}

			&.grid-style-banner {
				grid-column: viewport;
				display: grid;
				grid-template-columns: subgrid;

				> figure {
					grid-column: viewport;
					display: grid;
					grid-template-columns: subgrid;
					position: relative;

					> picture {
						grid-row: 1;
						grid-column: viewport;
						justify-self: stretch;
						aspect-ratio: 2 / 1;
						min-height: 50vh;
					}

					> figcaption {
						position: sticky;
						bottom: var(--SPACE-MD);
						z-index: 2;
						grid-row: 1;
						grid-column: sixth-start 1 / sixth-end 5;
						align-self: end;
						margin-bottom: var(--SPACE-LG);
						--color-heading: var(--color-background, var(--COLOR-WHITE));
						transition: color 0.3s ease;

						@media (max-width: 62.5em) {
							grid-column: half-start 1 / half-end 1;
						}
					}
				}

				&::before, &::after {
					content: "";
					position: absolute;
					z-index: 2;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					background: linear-gradient(
						rgba(26,24,24,0) 0%,
						rgba(26,24,24,0.005) 10%,
						rgba(26,24,24,0.02) 20%,
						rgba(26,24,24,0.045) 30%,
						rgba(26,24,24,0.08) 40%,
						rgba(26,24,24,0.125) 50%,
						rgba(26,24,24,0.18) 60%,
						rgba(26,24,24,0.245) 70%,
						rgba(26,24,24,0.32) 80%,
						rgba(26,24,24,0.405) 90%,
						rgba(26,24,24,0.5) 100%
					);
					mix-blend-mode: hard-light;
				}
				&::after {
					z-index: 1;
					opacity: 0;
					transition: opacity 0.3s ease;
				}
			}

			&.grid-style-banner:hover {
				> figure {
					> picture {
						> img {
							transform: scale(1);
						}
					}
					> figcaption {
						//--color-heading: var(--color-secondary, var(--COLOR-MID-GRAY));
					}
				}
				&::after {
					opacity: 1;
				}
			}
		}

		&.half {
			grid-column: eighth-start 1 / eighth-end 4;

			&:nth-child(2n) {
				grid-column: eighth-start 5 / eighth-end 8;
			}

			@media (max-width: 62.5em) {
				grid-column: half-start 1 / half-end 1;

				&:nth-child(2n) {
					grid-column: half-start 2 / half-end 2;
				}
			}

			@media (max-width: 31.25em) {
				grid-column: main;

				&:nth-child(2n) {
					grid-column: main;
				}
			}

			&.testimonial {
				display: grid;
				grid-template-columns: subgrid;

				> figure {
					display: grid;
					grid-template-columns: subgrid;
					align-items: start;

					grid-column: 1 / -1;

					> picture {
						grid-column: eighth-start 1 / eighth-end 2;

						@media (max-width: 62.5em) {
							grid-column: 1 / -1;
						}

						> img {
							object-fit: contain;
						}
					}
					> figcaption {
						grid-row: 1;
						grid-column: eighth-start 3 / eighth-end 4;

						margin-bottom: 0;

						text-align: left;

						@media (max-width: 62.5em) {
							grid-column: 1 / -1;
						}
					}
				}
			}
		}

		@media not all and (max-width: 62.5em) {
			&.third,
			&.fourth {
				grid-column: var(--grid-column);

				&.desktop-fullbleed-left {
					figcaption {
						grid-column-start: 2;
					}
				}
				&.desktop-fullbleed-right {
					figcaption {
						grid-column-end: -2;
					}
				}
			}

			&.third {
				&.desktop-sticky {
					align-self: stretch;
					figure {
						align-self: start;
						position: sticky;
						top: calc(var(--GRID-CELL) * 1.75);
					}
				}
				&.desktop-fullbleed-left,
				&.desktop-fullbleed-right {
					picture {
						aspect-ratio: 3 / 2;
					}
				}
			}

			&.fourth {
				&.desktop-fullbleed-left,
				&.desktop-fullbleed-right {
					picture {
						aspect-ratio: 16 / 9;
					}
				}
			}

			&.desktop-hidden {
				display: none;
			}
		}

		@media (max-width: 62.5em) {
			@media not all and (max-width: 31.25em) {
				&.third,
				&.fourth {
					grid-column: var(--grid-column-tablet);

					&.tablet-fullbleed-left {
						figcaption {
							grid-column-start: 2;
						}
					}
					&.tablet-fullbleed-right {
						figcaption {
							grid-column-end: -2;
						}
					}
				}

				&.tablet-hidden {
					display: none;
				}
			}

			&:where(.half, .single-card).grid-style-dynamic {
				&:nth-child(10n+1) {
					grid-column: viewport-start / third-end 2;

					figcaption {
						grid-column-start: 2;
					}
				}
				&:nth-child(10n+2) {
					grid-column: third-start 3 / third-end 3;
				}
				&:nth-child(10n+3) {
					grid-column: third-start 1 / third-end 1;
				}
				&:nth-child(10n+4) {
					grid-column: third-start 2 / third-end 2;
				}
				&:nth-child(10n+5) {
					grid-column: third-start 3 / third-end 3;
				}
				&:nth-child(10n+6) {
					grid-column: third-start 1 / third-end 1;
				}
				&:nth-child(10n+7) {
					grid-column: third-start 2 / viewport-end;

					figcaption {
						grid-column-end: -2;
					}
				}
				&:nth-child(10n+8) {
					grid-column: third-start 1 / third-end 1;
				}
				&:nth-child(10n+9) {
					grid-column: third-start 2 / third-end 2;
				}
				&:nth-child(10n) {
					grid-column: third-start 3 / third-end 3;
				}
			}
		}

		@media (max-width: 31.25em) {
			&.single-card:not(.grid-style-banner),
			&.half {
				&:nth-child(2n+1),
				&.grid-style-dynamic:nth-child(2n+1) {
					grid-column: column-start 1 / column-end 1;
				}
				&:nth-child(2n),
				&.grid-style-dynamic:nth-child(2n) {
					grid-column: column-start 2 / column-end 2;
				}
			}

			// one card per row in slides, so none sits alone
			:global(.carousel-slide) > &.single-card:not(.grid-style-banner):not(.grid-style-dynamic) {
				grid-column: column-start 1 / column-end 2;

				> figure,
				> figure > picture,
				> figure > figcaption {
					grid-column: 1 / -1;
				}
			}

			&.third,
			&.fourth {
				grid-column: var(--grid-column-mobile);
			}

			&.mobile-hidden {
				display: none;
			}
		}

		&.grid-style-parallax {
			> .parallax-animation-trigger {
				position: absolute;
				top: 0;
				left: 0;
				height: 100%;
			}
		}
	}

	:global {
		.feed-grid-parallax-animate {
			animation: feed-grid-parallax-animate 1s linear forwards;

			--space-start: var(--SPACE-XL);
			--space-end: var(--SPACE-LG);

			@media (max-width: 31.25em) {
				--space-start: var(--SPACE-LG);
				--space-end: var(--SPACE-MD);
			}
		}

		@keyframes feed-grid-parallax-animate {
			0% {
				transform: translate(calc(var(--space-start) * (1 + var(--position-in-grid-row)) * var(--animation-direction)), 0rem);
			}
			100% {
				transform: translate(calc(-1 * var(--space-end) * (var(--grid-columns) - var(--position-in-grid-row)) * var(--animation-direction)), 0rem);
			}
		}
	}
</style>