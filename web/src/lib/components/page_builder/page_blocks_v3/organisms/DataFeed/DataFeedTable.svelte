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

	//console.log("table style: " + data.feed_table_style);

	let imgHeight: number;

	let selectedItem: number;
	let selectOnScroll: boolean = true;

	function selectItemOnMouseover(i: number) {
		selectedItem = i;
	}
	function deselectItemOnMouseout() {
		selectedItem = -1;
	}
	function selectItemOnIntersection(node: Element, i: number) {
		const observer = new IntersectionObserver(([entry]) => {
			if (selectOnScroll && entry.isIntersecting) {
				selectedItem = i;
				selectOnScroll = false;
			}
		}, { rootMargin: '-50% 0% -50% 0%' });
		observer.observe(node);
		return {
			destroy() {
				observer.disconnect();
			}
		};
	}
	function deselectItemsOnIntersection(node: Element) {
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				selectedItem = -1;
				selectOnScroll = true;
				console.log("deselect on scroll");
			}
		}, { rootMargin: '-50% 0% -50% 0%' });
		observer.observe(node);
		return {
			destroy() {
				observer.disconnect();
			}
		};
	}
</script>

<template>
	<div class="deselectionTrigger above"
		 use:deselectItemsOnIntersection
	/>
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
		   class:active={selectedItem === i}
		   on:mouseover|preventDefault={() => selectItemOnMouseover(i)}
		   on:mouseout={() => deselectItemOnMouseout()}
		   use:selectItemOnIntersection={i}
		>
			{#if data.feed_table_style === "simple"}
				<div class="table-item-heading-container">
					{#if data.feed_source === "Projects"}
						{item.location}
					{:else if data.feed_source === "Articles"}
						{item.topics?.[0]?.news_topics_id?.name}
					{/if}
					<strong>
						{#if data.feed_source === "Projects"}
							{item.project_title}
						{:else if data.feed_source === "Articles"}
							{item.post_title}
						{/if}
					</strong>
				</div>
			{:else}
				<!--
					Projects
						Col1: Project Title / Project Location
						Col2: Studio Location
						Col3: First Market + #
					Articles
						Col1: Post Title
						Col2: Date
						Col3: First Tag + #
					Awards
						Col1: Designation / Category (if applicable)
						Col2: Project Title / Project Location
						Col3: Year
				-->
				<div class="table-item-col1">
					<strong>
						{#if data.feed_source === "Projects"}
							{item.project_title}
						{:else if data.feed_source === "Articles"}
							{item.post_title}
						{:else if data.feed_source === "Awards"}
							Award Designation
						{/if}
					</strong>
					{#if data.feed_source === "Projects"}
						{item.location}
					{:else if data.feed_source === "Awards"}
						Award Category
					{/if}
				</div>
				<div class="table-item-col2">
					{#if data.feed_source === "Projects"}
					{:else if data.feed_source === "Articles"}
						{item.topics?.[0]?.news_topics_id?.name}
					{:else if data.feed_source === "Awards"}
						<strong>Project Title</strong>
						Project Location
					{/if}
				</div>
				<div class="table-item-col3">
					{#if data.feed_source === "Projects"}
					{:else if data.feed_source === "Articles"}
						{item.topics?.[0]?.news_topics_id?.name}
						<span>+ #</span>
					{:else if data.feed_source === "Awards"}
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
				<div bind:offsetWidth={imgHeight} />
				<img style:--top={`calc(50vh - 1px * ${imgHeight} / 2)`}
					 src={assetUrl(item.grid_image?.filename_disk)}
					 alt={item.grid_image?.title}
				/>
			{/if}
		</figure>
	{/each}
	<div class="deselectionTrigger below"
		 use:deselectItemsOnIntersection
	/>
</template>

<style lang="scss">
	.deselectionTrigger {
		width: 100%;
		height: 100vh;
		pointer-events: none;
		&.above {
			margin-top: -100vh;
		}
		&.below {
			margin-bottom: -100vh;
		}
	}
	.table-heading {
		//margin-top: var(--SPACE-XXXL);
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
		color: var(--color-tertiary, var(--COLOR-MID-GRAY));

		@media (min-width: 31.25em) {
			&.active {
				color: var(--color-primary, var(--COLOR-BLACK));

				+ figure > img {
					opacity: 1;
					transition-delay: 0.15s;
				}
			}
		}

		display: grid;
		grid-template-columns: subgrid;

		&.table-style-simple {
			grid-column: viewport;
			padding: var(--SPACE-SM) 0;

			> .table-item-heading-container {
				font-size: var(--FONT-SIZE-XS);
				text-transform: uppercase;
				letter-spacing: 0.05em;
				> strong {
					display: block;
					font-size: var(--FONT-SIZE-LG);
					font-weight: 700;
					text-transform: none;
					letter-spacing: 0;
				}
			}

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
			padding: var(--SPACE-MD) 0;
			//margin-bottom: var(--SPACE-MD);
			border-bottom: 1px solid var(--color-secondary, var(--COLOR-MID-GRAY));
			color: var(--color-secondary, var(--COLOR-MID-GRAY));

			&.active {
				color: var(--color-primary, var(--COLOR-BLACK));
			}

			> .table-item-col1 {
				grid-column: sixth-start 1 / sixth-end 2;
				@media (max-width: 62.5em) {
					grid-column: half-start 1 / half-end 1;
				}
				@media (max-width: 31.25em) {
					grid-column: main;
				}
			}

			&.image-position-left,
			&.image-position-center {
				> .table-item-col2 {
					grid-column: sixth-start 5 / sixth-end 5;
					@media (max-width: 62.5em) {
						grid-column: half-start 2 / third-end 3;
						grid-row: 1;
					}
					@media (max-width: 31.25em) {
						grid-column: main;
					}
				}
				> .table-item-col3 {
					grid-column: eighth-start 8 / eighth-end 8;
					@media (max-width: 62.5em) {
						grid-column: third-start 3 / third-end 3;
						grid-row: 1;
						//TODO: align right
					}
					@media (max-width: 31.25em) {
						grid-column: main;
					}
				}
			}
			&.image-position-right {
				> .table-item-col2 {
					grid-column: eighth-start 4 / eighth-end 5;
					@media (max-width: 62.5em) {
						grid-column: half-start 2 / third-end 3;
						grid-row: 1;
					}
					@media (max-width: 31.25em) {
						grid-column: main;
					}
				}
				> .table-item-col3 {
					grid-column: eighth-start 6 / eighth-end 6;
					@media (max-width: 62.5em) {
						grid-column: third-start 3 / third-end 3;
						grid-row: 1;
						//TODO: align right
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
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		pointer-events: none;

		margin: 0;
		padding: 0;

		display: grid;
		grid-template-columns: var(--GRID-WRAPPER);

		> div {
			height: 0;
		}

		> img {
			width: 100%;
			position: sticky;
			top: var(--top);

			object-fit: cover;

			opacity: 0;
			transition: opacity 0.3s ease;
		}

		&.table-style-simple {
			foo: bar;

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

		&.table-style-detailed {
			foo: bar; // why is this needed?

			&.image-position-left > img,
			&.image-position-center > img,
			&.image-position-left > div,
			&.image-position-center > div {
				grid-column: eighth-start 4 / eighth-end 5;
			}

			&.image-position-right > img,
			&.image-position-right > div {
				grid-column: eighth-start 7 / eighth-end 8;
			}
		}
	}
</style>