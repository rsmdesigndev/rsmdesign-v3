<script lang="ts">
	import { assetUrl } from "$lib/cms/assets";
	import Card, { type CardData } from "../../molecules/Card.svelte";
	import Heading from "../../atoms/Heading.svelte";
	
	export type dataFeedGridData = {
		feed_source?: string | null;
		feed_grid_columns?: number | null;
		feed_grid_style?: string | null;
		feed_grid_dynamic_start_position?: boolean | null;
	};

	export let data: dataFeedGridData;
	export let feedData: any[];

	const cardHeading = {
		heading_type: "gridItem",
		heading_primary: "large",
		heading_size: "lg",
		heading_weight: "regular",
		heading_has_small_text: true,
		heading_has_large_text: true,
		heading_has_superscript: false
	}
</script>

<template>
	{#each feedData as item, i}
		<a href="/work/{item.slug}"
		   class={`grid-item 
		   		   ${data.feed_grid_columns === 3 ? "third" : "fourth"}
		   		   ${data.feed_grid_style === "dynamic" ? "dynamic" : ""}
		   		   ${data.feed_grid_dynamic_start_position === "left" ? "start-left" : "start-right"}
		   		`}
		   style:--grid-column-units={data.feed_grid_columns === 3 ? "sixth" : "eighth"}
		>
			<figure>
				<picture class="image-container">
					{#if data.feed_grid_style === "dynamic"}
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
					{:else}
						<img src={assetUrl(item.grid_image?.filename_disk)}
							 alt={item.grid_image?.title}
						/>
					{/if}
				</picture>
				<figcaption>
					<Heading 
						data={ {...cardHeading, 
								heading_small: item.location,
								heading_large: item.project_title} 
							 }
					/>
				</figcaption>
			</figure>
		</a>
		<!--<div class="column-container "
			 style:--grid-column-units={`${data.feed_grid_columns === 3 ? "sixth" : "eighth"}`}
		>
			Column
		</div>-->
	{/each}
</template>

<style lang="scss">
	a.grid-item {
		display: grid;
		grid-template-columns: subgrid;

		> figure {
			grid-column: 1 / -1;
			padding: 0;
			margin: 0;

			display: grid;
			grid-template-columns: subgrid;

			> picture.image-container {
				grid-column: 1 / -1;
				margin: 0 0 var(--SPACE-SM);

				> img {
					object-fit: cover;
					height: 100%;
					max-width: 100%;
				}
			}

			> figcaption {
				grid-column: 1 / -1;
			}
		}

		@media (min-width: 62.5em) {
			&.third {
				&:nth-of-type(3n+1) {
					grid-column: sixth-start 1 / sixth-end 2;
				}
				&:nth-of-type(3n+2) {
					grid-column: sixth-start 3 / sixth-end 4;
				}
				&:nth-of-type(3n) {
					grid-column: sixth-start 5 / sixth-end 6;
				}

				&.dynamic {
					&:nth-of-type(14n+1) {
						grid-column: viewport-start / sixth-end 4;

						picture.image-container {
							aspect-ratio: 3 / 2;
						}

						figcaption {
							grid-column-start: 2;
						}
					}
					&:nth-of-type(7n+2) {
						grid-column: sixth-start 5 / sixth-end 6;
					}
					&:nth-of-type(7n+3) {
						grid-column: sixth-start 1 / sixth-end 2;
					}
					&:nth-of-type(14n+4) {
						grid-column: sixth-start 3 / sixth-end 6;
					}
					&:nth-of-type(7n+5) {
						grid-column: sixth-start 1 / sixth-end 2;
					}
					&:nth-of-type(7n+6) {
						grid-column: sixth-start 3 / sixth-end 4;
					}
					&:nth-of-type(7n) {
						grid-column: sixth-start 5 / sixth-end 6;
					}
					&:nth-of-type(14n+8) {
						grid-column: sixth-start 1 / sixth-end 4;
					}
					&:nth-of-type(14n+11) {
						grid-column: sixth-start 3 / viewport-end;

						picture.image-container {
							aspect-ratio: 3 / 2;
						}

						figcaption {
							grid-column-end: -2;
						}
					}
				}
			}

			&.fourth {
				&:nth-of-type(4n+1) {
					grid-column: eighth-start 1 / eighth-end 2;
				}
				&:nth-of-type(4n+2) {
					grid-column: eighth-start 3 / eighth-end 4;
				}
				&:nth-of-type(4n+3) {
					grid-column: eighth-start 5 / eighth-end 6;
				}
				&:nth-of-type(4n) {
					grid-column: eighth-start 7 / eighth-end 8;
				}
				&.dynamic {
					&:nth-of-type(7n+4) {
						grid-column: eighth-start 1 / eighth-end 2;
					}
					&:nth-of-type(7n+5) {
						grid-column: eighth-start 3 / eighth-end 4;
					}
					&:nth-of-type(7n+6) {
						grid-column: eighth-start 5 / eighth-end 6;
					}
					&:nth-of-type(7n) {
						grid-column: eighth-start 7 / eighth-end 8;
					}
					&.start-left {
						&:nth-of-type(14n+1) {
							grid-column: viewport-start / eighth-end 4;

							picture.image-container {
								aspect-ratio: 16 / 9;
							}

							figcaption {
								grid-column-start: 2;
							}
						}
						&:nth-of-type(14n+2) {
							grid-column: eighth-start 5 / eighth-end 6;
						}
						&:nth-of-type(14n+3) {
							grid-column: eighth-start 7 / eighth-end 8;
						}
						&:nth-of-type(14n+8) {
							grid-column: eighth-start 1 / eighth-end 2;
						}
						&:nth-of-type(14n+9) {
							grid-column: eighth-start 3 / eighth-end 4;
						}
						&:nth-of-type(14n+10) {
							grid-column: eighth-start 5 / viewport-end;

							picture.image-container {
								aspect-ratio: 16 / 9;
							}

							figcaption {
								grid-column-end: -2;
							}
						}
					}
					&.start-right {
						&:nth-of-type(14n+1) {
							grid-column: eighth-start 1 / eighth-end 2;
						}
						&:nth-of-type(14n+2) {
							grid-column: eighth-start 3 / eighth-end 4;
						}
						&:nth-of-type(14n+3) {
							grid-column: eighth-start 5 / viewport-end;

							picture.image-container {
								aspect-ratio: 16 / 9;
							}

							figcaption {
								grid-column-end: -2;
							}
						}
						&:nth-of-type(14n+8) {
							grid-column: viewport-start / eighth-end 4;

							picture.image-container {
								aspect-ratio: 16 / 9;
							}

							figcaption {
								grid-column-start: 2;
							}
						}
						&:nth-of-type(14n+9) {
							grid-column: eighth-start 5 / eighth-end 6;
						}
						&:nth-of-type(14n+10) {
							grid-column: eighth-start 7 / eighth-end 8;
						}
					}
				}
			}
		}

		@media (max-width: 62.5em) {
			&:nth-of-type(3n+1) {
				grid-column: third-start 1 / third-end 1;
			}
			&:nth-of-type(3n+2) {
				grid-column: third-start 2 / third-end 2;
			}
			&:nth-of-type(3n) {
				grid-column: third-start 3 / third-end 3;
			}

			&.dynamic {
				&:nth-of-type(10n+1) {
					grid-column: viewport-start / third-end 2;

					figcaption {
						grid-column-start: 2;
					}
				}
				&:nth-of-type(10n+2) {
					grid-column: third-start 3 / third-end 3;
				}
				&:nth-of-type(10n+3) {
					grid-column: third-start 1 / third-end 1;
				}
				&:nth-of-type(10n+4) {
					grid-column: third-start 2 / third-end 2;
				}
				&:nth-of-type(10n+5) {
					grid-column: third-start 3 / third-end 3;
				}
				&:nth-of-type(10n+6) {
					grid-column: third-start 1 / third-end 1;
				}
				&:nth-of-type(10n+7) {
					grid-column: third-start 2 / viewport-end;

					figcaption {
						grid-column-end: -2;
					}
				}
				&:nth-of-type(10n+8) {
					grid-column: third-start 1 / third-end 1;
				}
				&:nth-of-type(10n+9) {
					grid-column: third-start 2 / third-end 2;
				}
				&:nth-of-type(10n) {
					grid-column: third-start 3 / third-end 3;
				}
			}
		}

		@media (max-width: 31.25em) {
			&:nth-of-type(n),
			&.dynamic:nth-of-type(n) {
				grid-column: main;
			}
		}
	}
</style>