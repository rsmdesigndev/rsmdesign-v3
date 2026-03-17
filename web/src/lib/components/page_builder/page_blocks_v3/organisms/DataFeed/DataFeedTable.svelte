<script lang="ts">
	import { assetUrl } from "$lib/cms/assets";
	import { animate, AnimateTrigger } from "$lib/animate";
	import Heading from "../../atoms/Heading.svelte";
	
	export type dataFeedTableData = {
		feed_source?: string | null;
		feed_table_style?: string | null;
		feed_table_image_position?: string | null;
		first_filter?: string | null;
	};

	export let data: dataFeedGridData;
	export let feedData: any[];

	console.log("table style: " + data.feed_table_style);

	const itemHeading = {
		heading_type: "feed-item",
		heading_primary: "large",
		heading_size: "lg",
		heading_weight: "bold",
		heading_has_small_text: true,
		heading_has_large_text: true,
		heading_has_superscript: false
	}
</script>

<template>
	{#if data.feed_table_style === "simple"}
		<div class={`table-heading image-position-${data.feed_table_image_position}`}>
			{#if data.first_filter}
				<Heading 
					data={ { heading_type: "section",
							 heading_primary: "large",
							 heading_size: "xxxl",
							 heading_weight: "bold",
							 heading_has_small_text: false,
							 heading_has_large_text: true,
							 heading_has_superscript: false, 
							 heading_large: data.first_filter
						 } }
				/>
			{:else}
				<Heading 
					data={ { heading_type: "section",
							 heading_primary: "large",
							 heading_size: "xxxl",
							 heading_weight: "bold",
							 heading_has_small_text: false,
							 heading_has_large_text: true,
							 heading_has_superscript: false, 
							 heading_large: `Recent ${data.feed_source}`
						 } }
				/>
			{/if}
		</div>
	{/if}
	{#each feedData as item, i}
		<a href="/work/{item.slug}"
		   class={`table-item
		   		   table-style-${data.feed_table_style}
		   		   image-position-${data.feed_table_image_position}
		   		 `}
		>
			{#if data.feed_table_style === "simple"}
				<div class="table-item-heading-container">
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
					{/if}
				</div>
			{:else}
				<div class="table-item-heading-container">
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
					{/if}
				</div>
			{/if}
		</a>
		<figure class={`table-style-${data.feed_table_style}
						image-position-${data.feed_table_image_position}
					  `}
		>
			{#if data.feed_table_style === "simple"}
				<img src={assetUrl(item.hero_image?.filename_disk)}
					 alt={item.hero_image?.title}
				/>
			{:else}
				<img src={assetUrl(item.grid_image?.filename_disk)}
					 alt={item.grid_image?.title}
				/>
			{/if}
		</figure>
	{/each}
</template>

<style lang="scss">
	.table-heading {
		margin-top: var(--SPACE-XXXL);
		margin-bottom: var(--SPACE-MD);
		&.image-position-left,
		&.image-position-center {
			grid-column: eighth-start 6 / eighth-end 8;
			@media (max-width: 62.5em) {
				grid-column: half-start 2 / half-end 2;
			}
			@media (max-width: 31.25em) {
				grid-column: main;
			}
		}
		&.image-position-right {
			grid-column: eighth-start 1 / eighth-end 4;
			@media (max-width: 62.5em) {
				grid-column: half-start 1 / half-end 1;
			}
			@media (max-width: 31.25em) {
				grid-column: main;
			}
		}
	}
	a.table-item {
		color: var(--color-primary, var(--COLOR-BLACK));

		&:hover {
			--color-heading: var(--color-accent, var(--COLOR-ORANGE));
		}

		@media (min-width: 31.25em) {
			&:hover {
				color: var(--color-accent, var(--COLOR-ORANGE));

				+ figure > img {
					opacity: 1;
					transition-delay: 0.15s;

					width: 100%;
				}
			}
		}

		grid-column: viewport;
		display: grid;
		grid-template-columns: subgrid;

		&:last-of-type {
			margin-bottom: var(--SPACE-XXXL);
		}

		&.table-style-simple {
			padding: var(--SPACE-SM) 0;

			&.image-position-left,
			&.image-position-center {
				> .table-item-heading-container {
					grid-column: eighth-start 6 / eighth-end 8;
					@media (max-width: 62.5em) {
						grid-column: half-start 2 / half-end 2;
					}
					@media (max-width: 31.25em) {
						grid-column: main;
					}
				}
			}
			&.image-position-right {
				> .table-item-heading-container {
					grid-column: eighth-start 1 / eighth-end 4;
					@media (max-width: 62.5em) {
						grid-column: half-start 1 / half-end 1;
					}
					@media (max-width: 31.25em) {
						grid-column: main;
					}
				}
			}
		}

		&.table-style-detailed {
			grid-column: main;
			padding: 0 var(--SPACE-LG);
			border-bottom: 1px solid var(--color-tertiary, var(--COLOR-DIM-GRAY));
			&.image-position-left,
			&.image-position-center {
				> .table-item-heading-container {
					grid-column: eighth-start 6 / eighth-end 8;
					@media (max-width: 62.5em) {
						grid-column: half-start 2 / half-end 2;
					}
					@media (max-width: 31.25em) {
						grid-column: main;
					}
				}
			}
			&.image-position-right {
				> .table-item-heading-container {
					grid-column: eighth-start 1 / eighth-end 4;
					@media (max-width: 62.5em) {
						grid-column: half-start 1 / half-end 1;
					}
					@media (max-width: 31.25em) {
						grid-column: main;
					}
				}
			}
		}
	}
	figure {
		z-index: 4;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		margin: 0;
		padding: 0;

		pointer-events: none;

		display: grid;
		grid-template-columns: var(--GRID-WRAPPER);

		> img {
			position: sticky;
			object-fit: cover;

			opacity: 0;
			transition: opacity 0.3s ease;
		}

		&.table-style-simple {
			position: fixed;
			top: 0;
			left: 0;
			width: 100vw;
			height: 100vh;
			> img {
				top: 0;
				width: 100%;
				height: 100vh;
			}

			&.image-position-left > img,
			&.image-position-center > img {
				grid-column: viewport-start / eighth-end 4;
			}

			&.image-position-right > img {
				grid-column: eighth-start 5 / viewport-end;
			}
		}
	}
</style>