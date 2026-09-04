<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";
	import type { ImageAssetRelation } from "$lib/cms";
	import { assetUrl } from "$lib/cms/assets";
	import { feedItemsPerLoad, generateQuery } from "$lib/cms/dataFeed/dataFeedQueries";
	import { feedFilterGroups, feedFiltersFromUrlParams, feedFiltersToUrlParams, filtersArrayToGraphql,
			 firstFilterName, sanitizeSearchText, searchTextFromUrlParams, searchToGraphql,
			 shouldApplyUrlFilters, type FeedFilters } from "$lib/cms/dataFeed/dataFeedFilters";
	import { request } from "graphql-request";
	import { env } from "$env/dynamic/public";
	import { page } from "$app/stores";
	import { browser } from "$app/environment";

	import DataFeedFilterMenu from "./DataFeedFilterMenu.svelte";
	import DataFeedGrid from "./DataFeedGrid.svelte";
	import DataFeedTable from "./DataFeedTable.svelte";
	import DataFeedTickerTape from "./DataFeedTickerTape.svelte";
	import type { CardData } from "../../molecules/Card.svelte";
	import Heading from "../../atoms/Heading.svelte";

	// Types
	export type DataFeedData = {
		section_background_color?: string | null;
		section_color_theme?: string | null;
		change_breadcrumbs?: boolean | null;
		section_anchor_text?: string | null;
		section_anchor_link?: string | null;
		section_padding_top?: string | null;
		section_padding_bottom?: string | null;
		feed_source?: string;
		feed_show_filter_menu?: boolean | null;
		feed_filter_logic?: string | null
		feed_items?: any[] | null
		feed_url_filtered?: boolean | null
		feed_total_count?: number | null;
		feed_filter_markets?: {
			markets_id?: {
				id?: string | null;
				filter_button_name?: string | null
			}
		}[]
		feed_filter_services?: {
			services_id?: {
				id?: string | null;
				filter_button_name?: string | null
			}
		}[]
		feed_filter_location_cities?: {
			locations_cities_id?: {
				id?: string | null;
				city_name?: string | null
			}
		}[]
		feed_filter_studio_locations?: {
			studio_locations_id?: {
				id?: string | null;
				location?: string | null
			}
		}[]
		feed_filter_design_team?: {
			team_id?: {
				id?: string | null;
				name?: string | null
			}
		}[]
		feed_filter_topics?: {
			news_topics_id?: {
				id?: string | null;
				name?: string | null
			}
		}[]
		feed_filter_authors?: {
			team_id?: {
				id?: string | null;
				name?: string | null
			}
		}[]
		feed_view?: string | null;
		feed_load_functionality?: string | null;
		feed_grid_columns?: number | null;
		feed_grid_rows_per_load?: number | null;
		feed_grid_style?: string | null;
		feed_grid_dynamic_start_position?: boolean | null;
		feed_grid_dynamic_images?: ImageAssetRelation[] | null;
		feed_grid_parallax_direction?: string | null;
		feed_grid_image_drop_shadow?: boolean | null;
		feed_table_style?: string | null;
		feed_table_image_position?: string | null;
		feed_table_items_per_load?: number | null;
		feed_cards?: CardData[] | null;
	}

	// Props
	export let data: DataFeedData;
	export let rowNumber: number;

	// Color theme
	const dispatch = createEventDispatcher();

	function selectFeedOnIntersection(node: Element) {
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				dispatch('selectFeed');
			}
		}, { rootMargin: '-50% 0% -50% 0%' });
		observer.observe(node);
		return {
			destroy() {
				observer.disconnect();
			}
		};
	}

	// Stateful component variables
	// Spread prefetched items instead of refetching
	let feedData: any[] = [...(data.feed_items ?? [])];
	let pages: any[][] = data.feed_items?.length ? [data.feed_items] : [];
	let loaded: boolean = pages.length > 0;
	let numItems: number | undefined;
	let loadOffset: number = 0;
	let loadTotalCount: number = data.feed_total_count ?? 0;
	let loadingPage: Promise<void> | null = null;
	let feedGeneration: number = 0;
	let feedView: "Grid" | "Table" | "Ticker Tape" = data.feed_view;

	// Shared with load, which has to request the same number of items
	numItems = feedItemsPerLoad(data);

	// A prefetched first page means the browser resumes at the second
	if (pages.length > 0) {
		loadOffset = numItems ?? 0;
	}

	// URL params apply if and only if the menu is shown and a recognised param is present
	const urlFilters: boolean = browser
		&& shouldApplyUrlFilters(data.feed_show_filter_menu, $page.url.searchParams);
	let feedFilters: FeedFilters = urlFilters
		? feedFiltersFromUrlParams(feedFilterGroups(data), $page.url.searchParams)
		: feedFilterGroups(data);
	$: firstFilter = firstFilterName(feedFilters);
	let searchText: string = urlFilters ? searchTextFromUrlParams($page.url.searchParams) : "";

	// Needed for next entry component
	$: feedItemParams = feedFiltersToUrlParams(feedFilters, searchText);

	function addPage(items: any[], generation: number) {
		if (generation !== feedGeneration) {
			return;
		}

		if (!items || items.length === 0) {
			return;
		}

		feedData.push(...items);
		feedData = feedData;
		pages.push(items);
		pages = pages;
	}

	// Load more functionality
	function loadMore(): Promise<void> {
		if (loadingPage === null) {
			const page: Promise<void> = fetchPage();
			loadingPage = page;

			page.then(
				() => {
					if (loadingPage === page) {
						loadingPage = null;
						prefetchNextPage();
					}
				},
				() => {
					if (loadingPage === page) {
						loadingPage = null;
					}
				}
			);
		}

		return loadingPage;
	}

	// Only for carousels
	function prefetchNextPage() {
		if (data.feed_load_functionality !== "carousel") {
			return;
		}

		if (pages.length > current + 1 || loadOffset >= loadTotalCount || !(numItems > 0)) {
			return;
		}

		loadMore();
	}

	async function fetchPage() {
		const generation: number = feedGeneration;
		switch (data.feed_source) {
			case "Projects": {
				let filters: string[] = filtersArrayToGraphql(feedFilters);
				let searchTerm: string = sanitizeSearchText(searchText);
				let searchFilter: string = searchToGraphql(searchTerm);

				let query = generateQuery("projects", filters, data.feed_filter_logic, searchFilter);

				let response = await request(env.PUBLIC_DIRECTUS_API_URL, query, {
					limit: numItems,
					offset: loadOffset,
					skipCount: loadOffset > 0,
					search: searchTerm,
				});

				if(response) {
					addPage(response.projects, generation);
					loaded = true;

					if (response.projects_aggregated) {
						loadTotalCount = response.projects_aggregated?.[0]?.count?.id ?? 0;
					}
				}

				break;
			}
			case "Articles": {
				let filters: string[] = filtersArrayToGraphql(feedFilters);
				let query = generateQuery("articles", filters);

				let response = await request(env.PUBLIC_DIRECTUS_API_URL, query, {
					limit: numItems,
					offset: loadOffset,
				});

				if(response) {
					addPage(response.news_posts, generation);
					loaded = true;
					loadTotalCount = response.news_posts_aggregated?.[0]?.count?.id ?? 0;
				}

				break;
			}
			case "Team": {
				let query = generateQuery("team");

				let response = await request(env.PUBLIC_DIRECTUS_API_URL, query, {
					limit: numItems,
					offset: loadOffset,
				});

				if(response) {
					addPage(response.team, generation);
					loaded = true;
					loadTotalCount = response.team_aggregated?.[0]?.count?.id ?? 0;
				}

				break;
			}
			case "Awards": {
				/*
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
				*/
				let query = generateQuery("awards");

				let response = await request(env.PUBLIC_DIRECTUS_API_URL, query, {
					limit: numItems,
					offset: loadOffset,
				});

				if(response) {
					addPage(response.awards, generation);
					loaded = true;
					loadTotalCount = response.awards_aggregated?.[0]?.count?.id ?? 0;
				}

				break;
			}
			case "Testimonials": {
				let query = generateQuery("testimonials");

				let response = await request(env.PUBLIC_DIRECTUS_API_URL, query, {
					limit: numItems,
					offset: loadOffset,
				});

				if(response) {
					addPage(response.testimonials, generation);
					loaded = true;
					loadTotalCount = response.testimonials_aggregated?.[0]?.count?.id ?? 0;
				}

				break;
			}
			case "Careers": {
				let query = generateQuery("careers");

				let response = await request(env.PUBLIC_DIRECTUS_API_URL, query, {
					limit: numItems,
					offset: loadOffset,
				});

				if(response) {
					addPage(response.careers, generation);
					loaded = true;
					loadTotalCount = response.careers_aggregated?.[0]?.count?.id ?? 0;
				}

				break;
			}
			case "Studios": {
				let query = generateQuery("studios");

				let response = await request(env.PUBLIC_DIRECTUS_API_URL, query, {
					limit: numItems,
					offset: loadOffset,
				});

				if(response) {
					addPage(response.studio_locations, generation);
					loaded = true;
					loadTotalCount = response.studio_locations_aggregated?.[0]?.count?.id ?? 0;
				}

				break;
			}
			case "Manual": {
				break;
			}
		}

		if (generation === feedGeneration) {
			loadOffset += numItems;
		}
	}

	function reload() {
		feedGeneration += 1;
		loadingPage = null;

		feedData = [];
		pages = [];
		current = 0;
		loaded = false;
		loadOffset = 0;
		loadTotalCount = 0;
		loadMore();
	}

	// Svelte action for infinite scroll functionality.
	function loadMoreOnIntersection(node: Element) {
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting && loadOffset < loadTotalCount) {
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

	// Carousel pagination functionality
	let autoplay: boolean = data.feed_grid_columns === 1;
	let interval: number = 10000;

	let current: number = 0;
	let isAnimating: boolean = false;
	let animationDir: -1 | 0 | 1 = 0; // -1 for left, 1 for right
	let animationDuration: number = 200;
	let intervalId: any = null;

	$: currentDisplay = String(current+1);

	async function next() {
		if (isAnimating) return;

		isAnimating = true;
		animationDir = 1;

		if (current >= pages.length - 1 && loadOffset < loadTotalCount) {
			await loadMore();
		}

		// Last page loops back to first page
		current = current < pages.length - 1 ? current + 1 : 0;
		prefetchNextPage();

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
		if (pages.length === 0) {
			loadMore();
		} else if (urlFilters && !data.feed_url_filtered) {
			reload();
		} else {
			prefetchNextPage();
		}

		if (autoplay) {
			restartInterval();
			return () => clearInterval(intervalId);
		}
	});
</script>

<template>
	<section id={`row-${rowNumber}`}
			 class={`padding-top-${data.section_padding_top}
					 padding-bottom-${data.section_padding_bottom}
					 ${feedView}
				   `}
			 class:tall={feedView === "Grid" && data.feed_grid_style === "dynamic" && data.feed_grid_columns === 3}
			 style:--z-index={feedView === "Table" && data.feed_table_style === "simple" ? "3" : "2"}
			 use:selectFeedOnIntersection
	>
		{#if data.feed_show_filter_menu && (data.feed_source === "Projects" || data.feed_source === "Articles")}
			<div class="project-filter-menu-wrapper">
				<div class="project-filter-menu-heading">
					<Heading 
						data={ { heading_type: "page",
								 heading_primary: "large",
								 heading_size: "xxxl",
								 heading_weight: "regular",
								 heading_has_small_text: false,
								 heading_has_large_text: true,
								 heading_has_superscript: true, 
								 heading_large: data.feed_source,
								 heading_superscript: `${loadTotalCount > 20 ? loadTotalCount : ""}`
							 } }
					/>
				</div>
				<DataFeedFilterMenu 
					on:updateFilters={reload}
					feedSource={data.feed_source}
					bind:feedFilters
					bind:searchText
					bind:feedView
				/>
			</div>
		{/if}
		{#key loaded}
			{#if !loaded && data.feed_source != "Manual"}
				<p>Loading...</p>
			{:else if feedData.length === 0 && data.feed_source != "Manual"}
				<p>No results match your query. Try another search or set of filters.</p>
			{:else}
				{#if feedView === "Ticker Tape" && data.feed_source === "Manual"}
					<DataFeedTickerTape data={ { feed_cards: data.feed_cards } } />
				{:else if (feedView === "Grid" || data.feed_source === "Manual" || data.feed_source === "Team" || data.feed_source === "Testimonials") && (data.feed_source != "Awards" && data.feed_source != "Careers")}
					{#if data.feed_source === "Manual"}
						<div class="grid-container">
							<DataFeedGrid 
								itemParams={feedItemParams}
								rowNumber={rowNumber}
								data={ { feed_source: data.feed_source,
										 feed_cards: data.feed_cards,
										 feed_grid_columns: data.feed_grid_columns,
										 feed_grid_style: data.feed_grid_style,
										 feed_grid_parallax_direction: data.feed_grid_parallax_direction,
										 feed_grid_image_drop_shadow: data.feed_grid_image_drop_shadow,
										 feed_grid_dynamic_start_position: 
										 	((data.feed_grid_columns === 4) && Boolean(data.feed_grid_rows_per_load % 4))
										 	? 
										 		!data.feed_grid_dynamic_start_position 
										 	: 
										 		data.feed_grid_dynamic_start_position
									 } }
							/>
						</div>
					{:else}
						{#each pages as pageData, i}
							<div class="grid-container"
								 class:carousel-slide={data.feed_load_functionality === "carousel"}
								 class:slide-next={isNextSlide(i)}
								 class:slide-prev={isPrevSlide(i)}
								 class:slide-active={i === current}
								 style:z-index={calcZIndex(i)}
								 style:transition={data.feed_load_functionality === "carousel" ? `opacity ${animationDuration}ms ease` : ""}
							>
								<DataFeedGrid 
									itemParams={feedItemParams}
									rowNumber={rowNumber}
									gridNumber={i}
									feedData={pageData}
									data={ { feed_source: data.feed_source,
											 feed_grid_columns: data.feed_grid_columns,
											 feed_grid_style: data.feed_grid_style,
											 feed_grid_parallax_direction: data.feed_grid_parallax_direction,
											 feed_grid_dynamic_images: data.feed_grid_dynamic_images,
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
					{/if}
				{:else}
					<DataFeedTable
						itemParams={feedItemParams}
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
				<button class="infinite-scroll" on:click={loadMore} use:loadMoreOnIntersection
						aria-label="Load more feed items" 
				>
					View More
				</button>
			{:else if data.feed_load_functionality === "button"}
				<button on:click={loadMore}
						aria-label="Load more feed items" 
				>
					View More
				</button>
			{/if}
		{/if}
		{#if data.feed_load_functionality === "carousel"}
			<div class="button-container"
				 class:buttons-centered={data.feed_grid_columns === 1 && data.feed_grid_style != "banner"}
			>
				{#if current > 0}
					<button class="carousel-button" aria-label="Load previous group of feed items" on:click={prev}>←</button>
				{/if}
				{#if current < pagesTotal}
					<button class="carousel-button" aria-label="Load next group of feed items" on:click={next}>→</button>
				{/if}
			</div>
		{:else if data.feed_load_functionality === "all"}
		{/if}
	</section>
</template>

<style lang="scss">
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
		z-index: var(--z-index);
		position: relative;

		grid-column: viewport;
		display: grid;
		grid-template-columns: subgrid;
		align-content: start;

		&.Grid {
			row-gap: var(--SPACE-XL);

			> .project-filter-menu-wrapper {
				margin-bottom: calc(-1 * var(--SPACE-LG));
			}
		}
		&.Table {
			row-gap: 0;

			> .project-filter-menu-wrapper {
				margin-bottom: var(--SPACE-MD);
			}
		}
		.project-filter-menu-wrapper {
			grid-column: viewport;
			

			display: grid;
			grid-template-columns: subgrid;

			> .project-filter-menu-heading {
				grid-column: main;
			}
		}

		&.tall {
			min-height: 200vh;
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

		button {
			grid-column: main;
		}

		> p {
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

			@media (max-width: 31.25em) {
				&:not(.carousel-slide) {
					display: grid;
					grid-column: main;
					grid-template-columns: 
						[column-start] 
						 1fr 
						[column-end] 
						 4vw
						[column-start] 
						 1fr 
						[column-end]
					;
					row-gap: var(--SPACE-LG);
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
	}

	.button-container {
		grid-row: 1;
		grid-column: main;

		margin-top: calc(-1 * var(--SPACE-LG));

		display: flex;
		justify-content: flex-end;
		gap: var(--SPACE-MD);

		&.buttons-centered {
			grid-column: eighth-start 1 / eighth-end 4;
			justify-content: flex-end;

			margin-top: calc(-1.5 * var(--GRID-CELL));
		}
	}

	button {
		border: none;
		box-shadow: none;
		background: transparent;
		font-family: "Inter", var(--FONT-FAMILY-PROXIMA-NOVA);

		&.infinite-scroll {
			height: 0;
			overflow: hidden;
			margin-top: -100vh;
			margin-bottom: 1000vh;
		}
		&.carousel-button {
			padding: 0;
			align-self: start;
			&:first-of-type:not(:last-of-type) {
				padding-right: var(--SPACE-SM)
			}
			&:last-of-type {
				padding-left: var(--SPACE-SM)
			}

			font-size: var(--FONT-SIZE-LG);
			color: var(--color-secondary);
			transition: color 0.3s ease;

			&:hover {
				color: var(--color-accent);
				cursor: pointer;
			}
		}
	}
</style>