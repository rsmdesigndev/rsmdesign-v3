<script lang="ts">
	import type { ImageAssetRelation } from "$lib/cms";
	import { assetUrl } from "$lib/cms/assets";
	import { animate, AnimateTrigger } from "$lib/animate";
	import Card, { type CardData } from "../../molecules/Card.svelte";
	import Heading from "../../atoms/Heading.svelte";
	import Cta, { type CtaData } from "../../atoms/Cta.svelte";
	import Blockquote, { type BlockquoteData } from "../../atoms/Blockquote.svelte";
	
	export type dataFeedGridData = {
		feed_source?: string | null;
		feed_grid_columns?: number | null;
		feed_grid_style?: string | null;
		feed_grid_dynamic_start_position?: boolean | null;
		feed_grid_dynamic_images?: ImageAssetRelation[] | null;
		feed_cards?: CardData[] | null;
	};

	export let data: dataFeedGridData;
	export let feedData: any[] | null;
	export let rowNumber: number;
	export let gridNumber: number = 0;

	const itemHeading = {
		heading_type: "feed-item",
		heading_primary: "large",
		heading_size: data.feed_grid_columns === 1 ? (data.feed_grid_style === "banner" ? "xxxl" : "xxl") : "lg",
		heading_weight: data.feed_grid_style === "banner" ? "bold" : "regular",
		heading_has_small_text: data.feed_grid_columns === 1 ? false : true,
		heading_has_large_text: true,
		heading_has_superscript: false
	}

	let count = 0;
	const incrementCount = () => {
		count++; 
		console.log("incrementing count: " + count);
		return "";
	}
</script>

<template>
	{#if data.feed_source === "Manual"}
		{#each data.feed_cards as card, i}
			<div
				id={`row-${rowNumber}-grid-${gridNumber}-item-${i}`}
				class={`grid-item 
						${data.feed_grid_columns === 3 ? "third" : 
						 (data.feed_grid_columns === 4 ? "fourth" : "single-card")}
						grid-style-${data.feed_grid_style}
						${data.feed_grid_dynamic_start_position === "true" ? "start-right" : "start-left"}
					  `}
				style:--grid-item={i}
				style:--grid-columns={data.feed_grid_columns}
			>
				{#if data.feed_grid_style === "parallax"}
					<div class="parallax-animation-trigger"
						 use:animate={ { trigger: AnimateTrigger.WhileScrollingInView, targetSelector: `#row-${rowNumber}-grid-${gridNumber}-item-${i}`, animClass: "feed-grid-parallax-animate" } }
					/>
				{/if}
				<Card data={card} 
					  bleed={ { left: false, 
								right: false 
							} } 
					  isScrollItem={false}
					  isActive={true}
				/>
			</div>
		{/each}
	{:else}
		{#each feedData as item, i}
			<!-- {#if data.feed_source === "Cards"}
				{#each data.feed_cards as card}
					<Card data={card.data} />
				{/each}
			{:else}
			-->
			{#if data.feed_source === "Team" && ((data.feed_grid_columns === 3 && (i % 14 === 0 || i % 14 === 10)) || (data.feed_grid_columns === 4 && (i % 14 === 2 || i % 14 === 7)))}
				<div class={`grid-item 
							${data.feed_grid_columns === 3 ? "third" : 
							 (data.feed_grid_columns === 4 ? "fourth" : "single-card")}
							grid-style-${data.feed_grid_style}
							${data.feed_grid_dynamic_start_position === "true" ? "start-right" : "start-left"}
						  `}
				>
					<figure>
						<picture>
							<img src={assetUrl(data.feed_grid_dynamic_images?.[count]?.filename_disk)}
								 alt={data.feed_grid_dynamic_images?.[count]?.title}
							/>
						</picture>
					</figure>
				</div>
				{incrementCount()}
			{:else}
				<svelte:element 
					this={data.feed_source === "Projects" ? "a" :
						 (data.feed_source === "Articles" ? "a" :
						 (data.feed_source === "Team" && item.has_profile_page ? "a" : "div"))}
					href={`/${data.feed_source === "Projects" ? "work/" : (data.feed_source === "Articles" ? "news/" : (data.feed_source === "Team" ? "team/" : "")) + item.slug}`}
					id={`row-${rowNumber}-grid-${gridNumber}-item-${i}`}
					class={`grid-item 
							${data.feed_grid_columns === 3 ? "third" : 
							 (data.feed_grid_columns === 4 ? "fourth" : "single-card")}
							grid-style-${data.feed_grid_style}
							${data.feed_grid_dynamic_start_position === "true" ? "start-right" : "start-left"}
						  `}
					style:--grid-item={i}
					style:--grid-columns={data.feed_grid_columns}
				>
					{#if data.feed_grid_style === "parallax"}
						<div class="parallax-animation-trigger"
							 use:animate={ { trigger: AnimateTrigger.WhileScrollingInView, targetSelector: `#row-${rowNumber}-grid-${gridNumber}-item-${i}`, animClass: "feed-grid-parallax-animate" } }
						/>
					{/if}
					<figure class:testimonial={data.feed_source === "Testimonials"}>
						<picture>
							{#if data.feed_source === "Team"}
								<img src={assetUrl(item.headshot?.filename_disk)}
									 alt={item.headshot?.title}
								/>
							{:else if data.feed_source === "Testimonials"}
								<img src={assetUrl(item.associated_project.grid_image?.filename_disk)}
									 alt={item.associated_project.grid_image?.title}
								/>
							{:else if data.feed_grid_style === "dynamic"}
								<source media="(max-width: 31.25em)" srcset={assetUrl(item.grid_image?.filename_disk)} />
								{#if data.feed_grid_columns === 3 && (i % 14 === 0 || i % 14 === 10)}
									<img src={assetUrl(item.hero_image?.filename_disk)}
										 alt={item.hero_image?.title}
									/>
								{:else if data.feed_grid_columns === 4}
									{#if data.feed_grid_dynamic_start_position}
										{#if (i % 10 === 1 || i % 10 === 5)}
											<source media="(max-width: 62.5em)" srcset={assetUrl(item.hero_image?.filename_disk)} />
										{:else}
											<source media="(max-width: 62.5em)" srcset={assetUrl(item.grid_image?.filename_disk)} />
										{/if}
										{#if (i % 14 === 2 || i % 14 === 7)}
											<img src={assetUrl(item.hero_image?.filename_disk)}
												 alt={item.hero_image?.title}
											/>
										{:else}
											<img src={assetUrl(item.grid_image?.filename_disk)}
												 alt={item.grid_image?.title}
											/>
										{/if}
									{:else}
										{#if (i % 10 === 0 || i % 10 === 6)}
											<source media="(max-width: 62.5em)" srcset={assetUrl(item.hero_image?.filename_disk)} />
										{:else}
											<source media="(max-width: 62.5em)" srcset={assetUrl(item.grid_image?.filename_disk)} />
										{/if}
										{#if (i % 14 === 0 || i % 14 === 9)}
											<img src={assetUrl(item.hero_image?.filename_disk)}
												 alt={item.hero_image?.title}
											/>
										{:else}
											<img src={assetUrl(item.grid_image?.filename_disk)}
												 alt={item.grid_image?.title}
											/>
										{/if}
									{/if}
								{:else}
									<img src={assetUrl(item.grid_image?.filename_disk)}
										 alt={item.grid_image?.title}
									/>
								{/if}
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
								{:else if data.feed_source === "Testimonials"}
									<Blockquote 
										data={ { blockquote_size: "lg",
												 blockquote_text: item.quote ?? "",
												 blockquote_has_attribution: true,
												 blockquote_attribution: `${item.quote_attribution ?? ""} \n`,
												 blockquote_has_citation: true,
												 blockquote_citation_newline: true,
												 blockquote_citation: `${item.quote_attribution_job_title ?? ""} \n${item.company_name ?? ""}`,
												 blockquote_link: null
											 } }
									/>
								{/if}
							{/if}
						</figcaption>
					</figure>
				</svelte:element>
			{/if}
		{/each}
	{/if}
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
				}
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

					&.testimonial {
						> picture {
							grid-column: eighth-start 1 / eighth-end 4;

							@media (max-width: 62.5em) {
								grid-column: half-start 1 / half-end 1;
							}
						}
						> figcaption {
							grid-row: 1;
							grid-column: eighth-start 5 / eighth-end 7;

							margin-bottom: 0;

							text-align: left;

							@media (max-width: 62.5em) {
								grid-column: half-start 2 / half-end 2;
							}
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

					> picture {
						grid-row: 1;
						grid-column: viewport;
						aspect-ratio: 2 / 1;
					}

					> figcaption {
						z-index: 2;
						grid-row: 1;
						grid-column: sixth-start 1 / sixth-end 4;
						align-self: end;
						margin-bottom: var(--SPACE-LG);
						--color-heading: var(--color-background, var(--COLOR-WHITE));

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

		@media (min-width: 62.5em) {
			&.third {
				&:nth-child(3n+1) {
					grid-column: sixth-start 1 / sixth-end 2;
				}
				&:nth-child(3n+2) {
					grid-column: sixth-start 3 / sixth-end 4;
				}
				&:nth-child(3n) {
					grid-column: sixth-start 5 / sixth-end 6;
				}

				&.grid-style-dynamic {
					&:nth-child(14n+1) {
						grid-column: viewport-start / sixth-end 4;

						picture {
							aspect-ratio: 3 / 2;
						}

						figcaption {
							grid-column-start: 2;
						}
					}
					&:nth-child(7n+2) {
						grid-column: sixth-start 5 / sixth-end 6;
					}
					&:nth-child(7n+3) {
						grid-column: sixth-start 1 / sixth-end 2;
					}
					&:nth-child(14n+4) {
						grid-column: sixth-start 3 / sixth-end 6;
					}
					&:nth-child(7n+5) {
						grid-column: sixth-start 1 / sixth-end 2;
					}
					&:nth-child(7n+6) {
						grid-column: sixth-start 3 / sixth-end 4;
					}
					&:nth-child(7n) {
						grid-column: sixth-start 5 / sixth-end 6;
					}
					&:nth-child(14n+8) {
						grid-column: sixth-start 1 / sixth-end 4;
					}
					&:nth-child(14n+11) {
						grid-column: sixth-start 3 / viewport-end;

						picture {
							aspect-ratio: 3 / 2;
						}

						figcaption {
							grid-column-end: -2;
						}
					}
				}
			}

			&.fourth {
				&:nth-child(4n+1) {
					grid-column: eighth-start 1 / eighth-end 2;
				}
				&:nth-child(4n+2) {
					grid-column: eighth-start 3 / eighth-end 4;
				}
				&:nth-child(4n+3) {
					grid-column: eighth-start 5 / eighth-end 6;
				}
				&:nth-child(4n) {
					grid-column: eighth-start 7 / eighth-end 8;
				}
				&.grid-style-dynamic {
					&:nth-child(7n+4) {
						grid-column: eighth-start 1 / eighth-end 2;
					}
					&:nth-child(7n+5) {
						grid-column: eighth-start 3 / eighth-end 4;
					}
					&:nth-child(7n+6) {
						grid-column: eighth-start 5 / eighth-end 6;
					}
					&:nth-child(7n) {
						grid-column: eighth-start 7 / eighth-end 8;
					}
					&.start-left {
						&:nth-child(14n+1) {
							grid-column: viewport-start / eighth-end 4;

							picture {
								aspect-ratio: 16 / 9;
							}

							figcaption {
								grid-column-start: 2;
							}
						}
						&:nth-child(14n+2) {
							grid-column: eighth-start 5 / eighth-end 6;
						}
						&:nth-child(14n+3) {
							grid-column: eighth-start 7 / eighth-end 8;
						}
						&:nth-child(14n+8) {
							grid-column: eighth-start 1 / eighth-end 2;
						}
						&:nth-child(14n+9) {
							grid-column: eighth-start 3 / eighth-end 4;
						}
						&:nth-child(14n+10) {
							grid-column: eighth-start 5 / viewport-end;

							picture {
								aspect-ratio: 16 / 9;
							}

							figcaption {
								grid-column-end: -2;
							}
						}
					}
					&.start-right {
						&:nth-child(14n+1) {
							grid-column: eighth-start 1 / eighth-end 2;
						}
						&:nth-child(14n+2) {
							grid-column: eighth-start 3 / eighth-end 4;
						}
						&:nth-child(14n+3) {
							grid-column: eighth-start 5 / viewport-end;

							picture {
								aspect-ratio: 16 / 9;
							}

							figcaption {
								grid-column-end: -2;
							}
						}
						&:nth-child(14n+8) {
							grid-column: viewport-start / eighth-end 4;

							picture {
								aspect-ratio: 16 / 9;
							}

							figcaption {
								grid-column-start: 2;
							}
						}
						&:nth-child(14n+9) {
							grid-column: eighth-start 5 / eighth-end 6;
						}
						&:nth-child(14n+10) {
							grid-column: eighth-start 7 / eighth-end 8;
						}
					}
				}
			}
		}

		@media (max-width: 62.5em) {
			&:nth-child(3n+1) {
				grid-column: third-start 1 / third-end 1;
			}
			&:nth-child(3n+2) {
				grid-column: third-start 2 / third-end 2;
			}
			&:nth-child(3n) {
				grid-column: third-start 3 / third-end 3;
			}

			&.grid-style-dynamic {
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
			&:nth-child(n),
			&.grid-style-dynamic:nth-child(n) {
				grid-column: main;
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
			--position-in-grid-row: calc(mod(var(--grid-item), var(--grid-columns)));
			@media (max-width: 62.5em) {
				--position-in-grid-row: calc(mod(var(--grid-item), 3));
			}
			@media (min-width: 31.25em) {
				animation: feed-grid-parallax-animate 1s linear forwards;
			}
		}

		@keyframes feed-grid-parallax-animate {
			0% {
				transform: translate(calc(var(--SPACE-XL) * (1 + var(--position-in-grid-row))), 0rem);
			}
			100% {
				transform: translate(calc(-1 * var(--SPACE-LG) * (var(--grid-columns) - var(--position-in-grid-row))), 0rem);
			}
		}
	}
</style>