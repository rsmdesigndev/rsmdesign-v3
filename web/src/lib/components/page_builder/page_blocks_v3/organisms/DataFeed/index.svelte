<script lang="ts">
	import { onMount } from "svelte";
	import { animate, AnimateTrigger } from "$lib/animate";
	import { assetUrl } from "$lib/cms/assets";
	import { request } from "graphql-request";
	import { env } from "$env/dynamic/public";

	import DataFeedGrid from "./DataFeedGrid.svelte";
	import DataFeedTable from "./DataFeedTable.svelte";
	import Card, { type CardData } from "../../molecules/Card.svelte";

	// Types
	export type DataFeedData = {
		change_background_color?: boolean | null;
		section_background_color?: string | null;
		section_color_theme?: string | null;
		change_breadcrumbs?: boolean | null;
		section_anchor_text?: string | null;
		section_anchor_link?: string | null;
		feed_source?: string;
		feed_show_filter_menu?: boolean | null;
		feed_filter_logic?: string | null;
		feed_filter_markets?: {
			markets_id?: {
				name?: string | null
			}
		}[]
		feed_filter_services?: {
			services_id?: {
				name?: string | null
			}
		}[]
		feed_filter_location_cities?: {
			locations_cities_id?: {
				city_name?: string | null
			}
		}[]
		feed_filter_topics?: {
			news_topics_id?: {
				name?: string | null
			}
		}[]
		feed_view?: string | null;
		feed_load_functionality?: string | null;
		feed_grid_columns?: number | null;
		feed_grid_rows_per_load?: number | null;
		feed_grid_style?: string | null;
		feed_grid_dynamic_start_position?: boolean | null;
		feed_table_style?: string | null;
		feed_table_image_position?: string | null;
		feed_table_items_per_load?: number | null;
		feed_cards?: CardData[] | null;
	}

	// Props
	export let data: DataFeedData;
	export let previousTheme: string | null;
	export let rowNumber: number;

	// Stateful component variables
	$: feedData = [];
	let loaded = false;
	let numItems: number;
	$: loadOffset = 0;
	let loadTotalCount: number = 0;

	if (data.feed_view === "Grid") {
		if (data.feed_grid_style === "dynamic") {
			if (data.feed_grid_columns === 4) {
				let quotient: number = Math.floor(data.feed_grid_rows_per_load / 2);
				let remainder: number = data.feed_grid_rows_per_load % 2;
				numItems = (data.feed_grid_columns * data.feed_grid_rows_per_load) - (quotient + remainder);
			} else {
				// TODO: for 3-col dynamic: if rows == 1, subtract 1; if rows == 2, subtract 2; if rows = 3, subtract 2; 
				numItems = 14;
			}
		} else {
			numItems = data.feed_grid_columns * data.feed_grid_rows_per_load;
		}
	} else {
		numItems = data.feed_table_items_per_load;
	}

	let firstFilter: string;

	// Load more functionality
	const loadMore = async () => {
		switch (data.feed_source) {
			case "Projects": {
				let filters = [];

				// Extract services
				if (data.feed_filter_services && data.feed_filter_services.length > 0) {
					let services = [];
					for (let [i, item] of data.feed_filter_services.entries()) {
						if (item?.services_id?.name) {
							services.push(`"${item.services_id.name}"`);

							if (i === 0) {
								firstFilter = item.services_id.name;
							}
						}
					}
					filters.push(`{ services: { services_id: { name: { _in: [${services.join(",")}] } } } }`);
				}

				// Extract markets
				if (data.feed_filter_markets && data.feed_filter_markets.length > 0) {
					let markets = [];
					for (let item of data.feed_filter_markets) {
						if (item?.markets_id?.name) {
							markets.push(`"${item.markets_id.name}"`);
						}
					}
					filters.push(`{ markets: { markets_id: { name: { _in: [${markets.join(",")}] } } } }`);
				}

				// Extract cities
				if (data.feed_filter_location_cities && data.feed_filter_location_cities.length > 0) {
					let cities = [];
					for (let item of data.feed_filter_location_cities) {
						if (item?.locations_cities_id?.city_name) {
							cities.push(`"${item.locations_cities_id.city_name}"`);
						}
					}
					filters.push(`{ project_location_city: { city_name: { _in: [${cities.join(",")}] } } }`);
				}

				let query = `
					query Projects($limit: Int, $offset: Int) {
						projects(
							limit: $limit
							offset: $offset
							filter: {
								_and: [
									{ visibility: { _nin: ["draft", "archived"] } },
									{
										_${data.feed_filter_logic}: [
											${filters.join(",\n")}
										]
									}
								]
							}
						) {
							slug
							project_title
							location
							grid_image {
								filename_disk
								title
								description
							}
							hero_image {
								filename_disk
								title
								description
							}
						}
						projects_aggregated(
							filter: {
								_and: [
									{ visibility: { _nin: ["draft", "archived"] } },
									{
										_${data.feed_filter_logic}: [
											${filters.join(",\n")}
										]
									}
								]
							}
						) {
							count {
								id
							}
						}
					}
				`;

				let response = await request(env.PUBLIC_DIRECTUS_API_URL, query, {
					limit: numItems,
					offset: loadOffset,
				});

				if(response) {
					feedData.push(...response.projects);
					feedData = feedData;
					loaded = true;
					loadTotalCount = response.projects_aggregated?.[0]?.count?.id ?? 0;
				}

				if (filters.length > 0 && !firstFilter) {
					firstFilter = filters[0];
				}

				break;
			}
			case "Articles": {
				let filters = [];

				if (data.feed_filter_topics && data.feed_filter_topics.length > 0) {
					let topics = [];
					for (let [i, item] of data.feed_filter_topics.entries()) {
						if (item?.news_topics_id?.name) {
							topics.push(`"${item.news_topics_id.name}"`);

							if (i === 0) {
								firstFilter = item.news_topics_id.name;
							}
						}
					}
					filters.push(`{ topics_list: { _eq: ${topics.join(" ")} } }`);
				}

				let query = `
					query Articles($limit: Int, $offset: Int) {
						news_posts(
							limit: $limit
							offset: $offset
							sort: [ "-published_date" ]
							filter: {
								_${data.feed_filter_logic}: [
									${filters.join(",\n")}
								]
							}
						) {
							slug
							post_title
							published_date
							grid_image {
								filename_disk
								description
							}
							topics {
								news_topics_id {
									name
								}
							}
						}
						news_posts_aggregated(
							filter: {
								_${data.feed_filter_logic}: [
									${filters.join(",\n")}
								]
							})
						{
							count {
								id
							}
						}
					}
				`
				let response = await request(env.PUBLIC_DIRECTUS_API_URL, query, {
					limit: numItems,
					offset: loadOffset,
				});

				if(response) {
					feedData.push(...response.news_posts);
					feedData = feedData;
					loaded = true;
					loadTotalCount = response.news_posts_aggregated?.[0]?.count?.id ?? 0;
				}

				break;
			}
			case "Team": {
				break;
			}
			case "Awards": {
				break;
			}
			case "Testimonials": {
				break;
			}
			case "Manual": {
				break;
			}
		}

		loadOffset += numItems;
		console.log("load more")
	}

	/**
	 * Svelte action for infinite scroll functionality.
	 * Loads more projects when the bottom of the container is reached.
	 */
	function loadMoreOnIntersection(node: Element) {
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting && loadOffset < loadTotalCount) {
				console.log("load more on scroll");
				loadMore();
			}
		});
		observer.observe(node);
		return {
			destroy() {
				observer.disconnect();
			}
		};
	}

	/**
	 * Functions for carousel pagination functionality.
	 * Set each grid as a slide.
	 */

	let autoplay: boolean = data.feed_grid_columns === 1;
	let interval: number = 10000;

	let current: number = 0;
	let isAnimating: boolean = false;
	let animationDir: -1 | 0 | 1 = 0; // -1 for left, 1 for right
	let animationDuration: number = 200;
	let intervalId: any = null;

	$: currentDisplay = String(current+1);

	function next() {
		if (isAnimating) return;

		current += 1;
		if (loadOffset < loadTotalCount) {
			loadMore();
		} else {
			current = 0;
		}

		isAnimating = true;
		animationDir = 1;
		setTimeout(() => isAnimating = false, animationDuration - 100);

		if (autoplay) restartInterval();
	}

	function prev() {
		if (isAnimating) return;

		current -= 1;

		isAnimating = true;
		animationDir = -1;
		setTimeout(() => isAnimating = false, animationDuration - 100);

		if (autoplay) restartInterval();
	}

	$: pagesLoaded = loadOffset / numItems;
	$: pagesTotal = Math.ceil(loadTotalCount / numItems);

	$: isNextSlide = (i: number): boolean => {
		if (pagesTotal === 1) {
			return false;
		}
		
		return i === current + 1;
	}

	$: isPrevSlide = (i: number): boolean => {
		if (pagesTotal === 1) {
			return false;
		}

		return i === current - 1;
	}

	// Calculates the correct Z index for each slide so that
	// they dont overlap each other while animating.
	$: calcZIndex = (i: number): number => {
		if (i === current) {
			return 2;
		} else if (isNextSlide(i)) {
			if (animationDir === 1) {
				return 0;
			} else {
				return 1;
			}
		} else if (isPrevSlide(i)) {
			if (animationDir === -1) {
				return 0;
			} else {
				return 1;
			}
		} else {
			return 0;
		}
	}

	$: restartInterval = () => {
		if (intervalId !== null) {
			clearInterval(intervalId);
		}
		intervalId = setInterval(next, interval);
	}

	// Lifecycle
	onMount(async () => {
		loadMore();

		if (autoplay) {
			restartInterval();
			return () => clearInterval(intervalId);
		}
	});
</script>

<template>
	<div id={`bg-color-${rowNumber}`}
		 class="bg-color"
		 style:--color-background={data.section_background_color}
	/>

	<section id={`row-${rowNumber}`}
			 class={`padding-top-xl padding-bottom-none
					 ${data.feed_view}
					 color-theme-${data.section_color_theme}
					 previous-color-theme-${previousTheme}
				   `}
			 style:--color-background={data.section_background_color}
	>
		<div class="bg-color-trigger"
			 use:animate={ { trigger: AnimateTrigger.WhileScrollingInView, targetSelector: `#bg-color-${rowNumber}`, animClass: "bg-color-animate" } }
		/>
		<div class="bg-color-trigger"
			 use:animate={ { trigger: AnimateTrigger.WhileScrollingInView, targetSelector: `#row-${rowNumber}`, animClass: "theme-switch-animate" } }
		/>
		<div class="bg-color-trigger"
			 use:animate={ { trigger: AnimateTrigger.WhileScrollingInView, targetSelector: `#menu-bar-${rowNumber}`, animClass: "bg-color-animate" } }
		/>

		{#key loaded}
			{#if !loaded}
				<p>Loading...</p>
			{:else if feedData.length === 0}
				<p>No projects match your query. Try another search or set of filters.</p>
			{:else}
				{#if data.feed_view === "Grid"}
					{#each Array(pagesLoaded) as page, i}
						<div class="grid-container"
							 class:carousel-slide={data.feed_load_functionality === "carousel"}
							 class:slide-next={isNextSlide(i)}
							 class:slide-prev={isPrevSlide(i)}
							 class:slide-active={i === current}
							 style:z-index={calcZIndex(i)}
							 style:transition={data.feed_load_functionality === "carousel" ? `opacity ${animationDuration}ms ease` : ""}
						>
							<DataFeedGrid 
								rowNumber={rowNumber}
								gridNumber={i}
								feedData={ feedData.slice(i * numItems, i * numItems + numItems) }
								data={ { feed_source: data.feed_source,
										 feed_grid_columns: data.feed_grid_columns,
										 feed_grid_style: data.feed_grid_style,
										 feed_grid_dynamic_start_position: 
										 	((data.feed_grid_columns === 4) && Boolean(data.feed_grid_rows_per_load % 4) && (i % 2))
										 	? 
										 		!data.feed_grid_dynamic_start_position 
										 	: 
										 		data.feed_grid_dynamic_start_position
									 } }
							/>
						</div>
					{/each}

				{:else}
					<DataFeedTable
						{feedData}
						data={ { feed_source: data.feed_source,
								 feed_table_style: data.feed_table_style,
								 feed_table_image_position: data.feed_table_image_position,
								 first_filter: firstFilter
							 } }
					/>
				{/if}
			{/if}
		{/key}
		{#if data.cta_link}
			<a href={data.cta_link}>
				{#if data.cta_text}
					<span>{data.cta_text}</span>
				{:else}
					<span>View more projects</span>
				{/if}
			</a>
		{/if}
		{#if loadOffset < loadTotalCount}
			{#if data.feed_load_functionality === "scroll"}
				<!-- When this div is reached in the DOM, more projects will be loaded. -->
				<button class="infinite-scroll" on:click={loadMore} use:loadMoreOnIntersection>
					View More
				</button>
			{:else if data.feed_load_functionality === "button"}
				<button on:click={loadMore}>
					View More
				</button>
			{/if}
		{/if}
		{#if data.feed_load_functionality === "carousel"}
			<div class="button-container">
				{#if current > 0}
					<button class="carousel-button" aria-label="Previous group" on:click={prev}>←</button>
				{/if}
				{#if current < pagesTotal}
					<button class="carousel-button" aria-label="Next group" on:click={next}>→</button>
				{/if}
			</div>
		{:else if data.feed_load_functionality === "all"}
			<!-- link to main index page w/ filter(s) applied -->
		{/if}
	</section>

	<div id={`menu-bar-${rowNumber}`}
		 class="menu-bar" 
		 style:--color-background={data.section_background_color}
	/>
</template>

<style lang="scss">
	div.bg-color,
	div.menu-bar {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
	}
	div.bg-color {
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
		z-index: 1;
	}

	div.menu-bar {
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
		z-index: 3;

		height: calc(var(--GRID-CELL) * 1.75);
		margin-bottom: calc(-1 * var(--SPACE-LG));
	}
	
	section {
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
		z-index: 3;
		position: relative;

		grid-column: viewport;
		display: grid;
		grid-template-columns: subgrid;
		align-content: start;

		&.Grid {
			row-gap: var(--SPACE-XL);
		}
		&.Table {
			row-gap: 0;
			min-height: 100vh;
		}

		button {
			grid-column: main;
		}

		.grid-container {
			display: contents;

			&.carousel-slide {
				grid-column: viewport;
				display: grid;
				grid-template-columns: subgrid;
				row-gap: var(--SPACE-XL);

				position: relative;
				grid-row: 1;
				opacity: 0;
				transform: 0;
				&.slide-active {
					opacity: 1;
					z-index: 2;
				}
			}
		}

		&.padding-top-sm {
			padding-top: var(--SPACE-SM);
		}
		&.padding-bottom-sm {
			padding-bottom: var(--SPACE-SM);
		}
		&.padding-top-md {
			padding-top: var(--SPACE-MD);
		}
		&.padding-bottom-md {
			padding-bottom: var(--SPACE-MD);
		}
		&.padding-top-lg {
			padding-top: var(--SPACE-LG);
		}
		&.padding-bottom-lg {
			padding-bottom: var(--SPACE-LG);
		}
		&.padding-top-xl {
			padding-top: var(--SPACE-XL);
		}
		&.padding-bottom-xl {
			padding-bottom: var(--SPACE-XL);
		}
		&.padding-top-xxl {
			padding-top: var(--SPACE-XXL);
		}
		&.padding-bottom-xxl {
			padding-bottom: var(--SPACE-XXL);
		}
		&.padding-top-xxxl {
			padding-top: var(--SPACE-XXXL);
		}
		&.padding-bottom-xxxl {
			padding-bottom: var(--SPACE-XXXL);
		}

		> .bg-color-trigger {
			position: absolute;
			top: 0;
			left: 0;
			height: 100%;
			pointer-events: none;
		}
	}

	.button-container {
		grid-row: 1;
		grid-column: main;

		margin-top: calc(-1 * var(--SPACE-LG));

		display: flex;
		justify-content: flex-end;
		gap: var(--SPACE-MD);
	}

	button {
		border: none;
		box-shadow: none;
		background: transparent;

		&.infinite-scroll {
			height: 0;
			overflow: hidden;
			margin-top: calc(-1 * var(--SPACE-XXXL));
		}
		&.carousel-button {
			padding: 0;
			&:first-of-type:not(:last-of-type) {
				padding-right: var(--SPACE-SM)
			}
			&:last-of-type {
				padding-left: var(--SPACE-SM)
			}

			font-size: var(--FONT-SIZE-LG);
			color: var(--COLOR-SECONDARY);
			transition: color 0.3s ease;

			&:hover {
				color: var(--COLOR-ORANGE);
				cursor: pointer;
			}
		}
	}

	:global {
		.bg-color-animate {
			background: transparent;
			animation: bg-color-animate 1s linear forwards;
		}

		@keyframes bg-color-animate {
			0% {
				background: transparent;
			}
			25% {
				background: transparent;
			}
			33% {
				background: var(--color-background);
			}
			100% {
				background: var(--color-background);
			}
		}

		.theme-switch-animate {
			animation: theme-switch-animate 1s linear forwards;
		}

		// TODO: Find way to fix 'flips at 50%' behavior
		// See https://stackoverflow.com/questions/50661638/css-animate-custom-properties-variables
		// https://web.dev/blog/at-property-baseline
		@keyframes theme-switch-animate {
			0% {
				--color-primary: var(--previous-theme-color-primary, var(--COLOR-BLACK));
				--color-secondary: var(--previous-theme-color-secondary, var(--COLOR-MID-GRAY));
				--color-tertiary: var(--previous-theme-color-tertiary, var(--COLOR-DIM-GRAY));
				--color-accent: var(--previous-theme-color-accent, var(--COLOR-ORANGE));
			}
			25% {
				--color-primary: var(--previous-theme-color-primary, var(--COLOR-BLACK));
				--color-secondary: var(--previous-theme-color-secondary, var(--COLOR-MID-GRAY));
				--color-tertiary: var(--previous-theme-color-tertiary, var(--COLOR-DIM-GRAY));
				--color-accent: var(--previous-theme-color-accent, var(--COLOR-ORANGE));
			}
			33% {
				--color-primary: var(--theme-color-primary, var(--COLOR-BLACK));
				--color-secondary: var(--theme-color-secondary, var(--COLOR-MID-GRAY));
				--color-tertiary: var(--theme-color-tertiary, var(--COLOR-DIM-GRAY));
				--color-accent: var(--theme-color-accent, var(--COLOR-ORANGE));
			}
			100% {
				--color-primary: var(--theme-color-primary, var(--COLOR-BLACK));
				--color-secondary: var(--theme-color-secondary, var(--COLOR-MID-GRAY));
				--color-tertiary: var(--theme-color-tertiary, var(--COLOR-DIM-GRAY));
				--color-accent: var(--theme-color-accent, var(--COLOR-ORANGE));
			}
		}
	}
</style>