<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";
	import type { ImageAssetRelation } from "$lib/cms";
	import { assetUrl } from "$lib/cms/assets";
	import { feedItemsPerLoad, generateQuery } from "$lib/cms/dataFeed/dataFeedQueries";
	import { feedGridFirstImageIndexes } from "$lib/cms/dataFeed/dataFeedGridLayout";
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
	import Cta from "../../atoms/Cta.svelte";
	import { createCarousel } from "../../scripts/carousel";

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
		feed_ticker_sizing?: string | null;
		feed_cards?: CardData[] | null;
	}

	// Props
	export let data: DataFeedData;
	export let rowNumber: number;

	const startRight: boolean = String(data.feed_grid_dynamic_start_position) === "true";
	const isFullBleed: boolean = data.feed_grid_columns === 1 && data.feed_grid_style === "banner";

	$: gridData = {
		feed_source: data.feed_source,
		feed_grid_columns: data.feed_grid_columns,
		feed_grid_style: data.feed_grid_style,
		feed_grid_parallax_direction: data.feed_grid_parallax_direction,
		feed_grid_dynamic_images: data.feed_grid_dynamic_images
	};

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
	let feedData: any[] = [...(data.feed_items ?? [])];
	let pages: any[][] = data.feed_items?.length ? [data.feed_items] : [];
	let loaded: boolean = pages.length > 0;
	let numItems: number | undefined;
	let loadOffset: number = 0;
	let loadTotalCount: number = data.feed_total_count ?? 0;
	let loadingPage: Promise<void> | null = null;
	let feedGeneration: number = 0;
	let feedView: "Grid" | "Table" | "Ticker Tape" = data.feed_view;

	numItems = feedItemsPerLoad(data);

	// A prefetched first page means the browser resumes at the second
	if (pages.length > 0) {
		loadOffset = numItems ?? 0;
	}

	// URL params apply if and only if the menu is shown and a recognized param is present
	const urlFilters: boolean = browser
		&& shouldApplyUrlFilters(data.feed_show_filter_menu, $page.url.searchParams);
	let feedFilters: FeedFilters = urlFilters
		? feedFiltersFromUrlParams(feedFilterGroups(data), $page.url.searchParams)
		: feedFilterGroups(data);
	$: firstFilter = firstFilterName(feedFilters);
	let searchText: string = urlFilters ? searchTextFromUrlParams($page.url.searchParams) : "";

	// Needed for next entry component
	$: feedItemParams = feedFiltersToUrlParams(feedFilters, searchText);

	function addPage(items: any[], generation: number, pageOffset: number) {
		if (generation !== feedGeneration) {
			return;
		}

		const isRefresh: boolean = pageOffset === 0 && pages.length > 0;
		// items published between loads shift offsets, so a page can repeat loaded items
		const loadedIds: string[] = feedData.slice(isRefresh ? pages[0].length : 0).map(item => item.id);
		items = items?.filter(item => item.id === undefined || !loadedIds.includes(item.id));

		if (!items || items.length === 0) {
			return;
		}

		if (isRefresh) {
			feedData.splice(0, pages[0].length, ...items);
			feedData = feedData;
			pages[0] = items;
			pages = pages;
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

	async function fetchPage(pageOffset: number = loadOffset) {
		const generation: number = feedGeneration;
		const pageItemCount: number | undefined = feedItemsPerLoad(data, pageOffset);
		switch (data.feed_source) {
			case "Projects": {
				let filters: string[] = filtersArrayToGraphql(feedFilters);
				let searchTerm: string = sanitizeSearchText(searchText);
				let searchFilter: string = searchToGraphql(data.feed_source, searchTerm);

				let query = generateQuery("projects", filters, data.feed_filter_logic, searchFilter);

				let response = await request(env.PUBLIC_DIRECTUS_API_URL, query, {
					limit: pageItemCount,
					offset: pageOffset,
					skipCount: pageOffset > 0,
					search: searchTerm,
				});

				if(response) {
					addPage(response.projects, generation, pageOffset);
					loaded = true;

					if (response.projects_aggregated) {
						loadTotalCount = response.projects_aggregated?.[0]?.count?.id ?? 0;
					}
				}

				break;
			}
			case "Articles": {
				let filters: string[] = filtersArrayToGraphql(feedFilters);
				let searchTerm: string = sanitizeSearchText(searchText);
				let searchFilter: string = searchToGraphql(data.feed_source, searchTerm);

				let query = generateQuery("articles", filters, data.feed_filter_logic, searchFilter);

				let response = await request(env.PUBLIC_DIRECTUS_API_URL, query, {
					limit: pageItemCount,
					offset: pageOffset,
					search: searchTerm,
				});

				if(response) {
					addPage(response.news_posts, generation, pageOffset);
					loaded = true;
					loadTotalCount = response.news_posts_aggregated?.[0]?.count?.id ?? 0;
				}

				break;
			}
			case "Team": {
				let query = generateQuery("team");

				let response = await request(env.PUBLIC_DIRECTUS_API_URL, query, {
					limit: pageItemCount,
					offset: pageOffset,
				});

				if(response) {
					addPage(response.team, generation, pageOffset);
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
					limit: pageItemCount,
					offset: pageOffset,
				});

				if(response) {
					addPage(response.awards, generation, pageOffset);
					loaded = true;
					loadTotalCount = response.awards_aggregated?.[0]?.count?.id ?? 0;
				}

				break;
			}
			case "Testimonials": {
				let query = generateQuery("testimonials");

				let response = await request(env.PUBLIC_DIRECTUS_API_URL, query, {
					limit: pageItemCount,
					offset: pageOffset,
				});

				if(response) {
					addPage(response.testimonials, generation, pageOffset);
					loaded = true;
					loadTotalCount = response.testimonials_aggregated?.[0]?.count?.id ?? 0;
				}

				break;
			}
			case "Careers": {
				let query = generateQuery("careers");

				let response = await request(env.PUBLIC_DIRECTUS_API_URL, query, {
					limit: pageItemCount,
					offset: pageOffset,
				});

				if(response) {
					addPage(response.careers, generation, pageOffset);
					loaded = true;
					loadTotalCount = response.careers_aggregated?.[0]?.count?.id ?? 0;
				}

				break;
			}
			case "Studios": {
				let query = generateQuery("studios");

				let response = await request(env.PUBLIC_DIRECTUS_API_URL, query, {
					limit: pageItemCount,
					offset: pageOffset,
				});

				if(response) {
					addPage(response.studio_locations, generation, pageOffset);
					loaded = true;
					loadTotalCount = response.studio_locations_aggregated?.[0]?.count?.id ?? 0;
				}

				break;
			}
			case "Manual": {
				break;
			}
		}

		if (generation === feedGeneration && pageOffset === loadOffset) {
			loadOffset += pageItemCount;
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
	function loadMoreOnIntersection(node: Element, loadedOffset: number) {
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting && loadOffset < loadTotalCount) {
				loadMore();
			}
		}, { rootMargin: "0px 0px 200% 0px" }); // two screens ahead
		observer.observe(node);
		return {
			// the observer only reports changes, so observing again re-checks a trigger still in reach
			update() {
				observer.unobserve(node);
				observer.observe(node);
			},
			destroy() {
				observer.disconnect();
			}
		};
	}

	// Carousel pagination functionality
	let current: number = 0;

	const carousel = createCarousel({
		getIndex: () => current,
		setIndex: showPage,
		count: 0,
		autoplay: data.feed_load_functionality === "carousel" && data.feed_grid_columns === 1,
		interval: 10000
	});

	const { isPaused, canAutoplay, rotationEnabled, isAdvancing, animationDir } = carousel;
	const { next, prev, togglePlayback, suspend, resume } = carousel;
	const animationDuration = carousel.animationDuration;

	$: currentDisplay = String(current+1);

	async function showPage(pageIndex: number) {
		if (pageIndex >= pages.length && loadOffset < loadTotalCount) {
			await loadMore();
		}

		current = pageIndex < pages.length ? pageIndex : 0;
		prefetchNextPage();
	}

	$: pagesTotal = Math.ceil(loadTotalCount / numItems);

	$: carousel.setCount(pagesTotal);

	const pageStartsRight = (pageIndex: number): boolean =>
		((data.feed_grid_columns === 4) && Boolean(data.feed_grid_rows_per_load % 4) && (pageIndex % 2)) ? !startRight : startRight;

	$: pageFirstImageIndexes = feedGridFirstImageIndexes(
		pages.map(pageData => pageData.length),
		data.feed_grid_dynamic_images?.length ?? 0,
		pages.map((_, pageIndex) => ({ columns: data.feed_grid_columns, style: data.feed_grid_style, startRight: pageStartsRight(pageIndex) }))
	);

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
			if ($animationDir === 1) {
				return 0;
			} else {
				return 1;
			}
		} else if (isPrevSlide(i)) {
			if ($animationDir === -1) {
				return 0;
			} else {
				return 1;
			}
		} else {
			return 0;
		}
	}

	// Lifecycle
	onMount(async () => {
		if (pages.length === 0) {
			loadMore();
		} else if (urlFilters && !data.feed_url_filtered) {
			reload();
		} else {
			// prerendered at build time, so the first page may be stale
			fetchPage(0);
			prefetchNextPage();
		}
	});

	onMount(() => carousel.start());
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
					bind:feedFilters
					bind:searchText
					bind:feedView
				/>
			</div>
		{/if}
		{#if data.feed_load_functionality === "carousel"}
			<div class="button-container"
				 class:buttons-centered={data.feed_grid_columns === 1 && data.feed_grid_style != "banner"}
			>
				{#if current > 0}
					<button class="carousel-button" aria-label="Load previous group of feed items" on:click={prev}
							on:mouseenter={suspend} on:mouseleave={resume}
							on:focus={suspend} on:blur={resume}
					>←</button>
				{/if}
				{#if $canAutoplay}
					<button class="carousel-button playback"
							class:paused={!$isAdvancing}
							type="button"
							aria-label={$isPaused ? "Start automatic slide rotation" : "Stop automatic slide rotation"}
							on:click={togglePlayback}
					/>
				{/if}
				{#if current < pagesTotal}
					<button class="carousel-button" aria-label="Load next group of feed items" on:click={next}
							on:mouseenter={suspend} on:mouseleave={resume}
							on:focus={suspend} on:blur={resume}
					>→</button>
				{/if}
			</div>
		{:else if data.feed_load_functionality === "all"}
		{/if}
		{#key loaded}
			{#if !loaded && data.feed_source != "Manual"}
				<p>Loading...</p>
			{:else if feedData.length === 0 && data.feed_source != "Manual"}
				<p>No results match your query. Try another search or set of filters.</p>
			{:else}
				{#if feedView === "Ticker Tape"}
					<DataFeedTickerTape
						itemParams={feedItemParams}
						{feedData}
						data={ { feed_source: data.feed_source,
								 feed_ticker_sizing: data.feed_ticker_sizing,
								 feed_cards: data.feed_cards
							 } }
					/>
				{:else if (feedView === "Grid" || data.feed_source === "Manual" || data.feed_source === "Team" || data.feed_source === "Testimonials") && (data.feed_source != "Awards" && data.feed_source != "Careers")}
					{#if data.feed_source === "Manual"}
						<div class="grid-container"
							 class:parallax-container={data.feed_grid_style === "parallax" && data.feed_grid_parallax_direction === "unidirectional"}
							 class:fullbleed={isFullBleed}
						>
							<DataFeedGrid 
								itemParams={feedItemParams}
								rowNumber={rowNumber}
								data={ { ...gridData,
										 feed_cards: data.feed_cards,
										 feed_grid_image_drop_shadow: data.feed_grid_image_drop_shadow,
										 feed_grid_dynamic_start_position: 
										 	((data.feed_grid_columns === 4) && Boolean(data.feed_grid_rows_per_load % 4))
										 	? 
										 		!startRight 
										 	: 
										 		startRight
									 } }
							/>
						</div>
					{:else if data.feed_load_functionality === "carousel"}
						<div class="carousel-slides"
							 role="group"
							 aria-roledescription="carousel"
							 aria-label={data.feed_source}
							 aria-live={$rotationEnabled ? "off" : "polite"}
							 aria-atomic="false"
						>
							{#each pages as pageData, i}
								<div class="grid-container carousel-slide"
									 role="group"
									 aria-roledescription="slide"
									 aria-label={`${i + 1} of ${pagesTotal}`}
									 inert={i !== current}
									 class:fullbleed={isFullBleed}
									 class:slide-next={isNextSlide(i)}
									 class:slide-prev={isPrevSlide(i)}
									 class:slide-active={i === current}
									 style:z-index={calcZIndex(i)}
									 style:transition={`opacity ${animationDuration}ms ease`}
									 on:mouseenter={suspend}
									 on:mouseleave={resume}
									 on:focusin={suspend}
									 on:focusout={resume}
								>
									<DataFeedGrid 
										itemParams={feedItemParams}
										rowNumber={rowNumber}
										gridNumber={i}
										feedData={pageData}
										firstImageIndexes={pageFirstImageIndexes[i]}
										data={ { ...gridData,
												 feed_grid_dynamic_start_position: pageStartsRight(i)
											 } }
									/>
								</div>
							{/each}
						</div>
					{:else}
						<div class="grid-container"
							 class:fullbleed={isFullBleed}
						>
							<DataFeedGrid 
								itemParams={feedItemParams}
								rowNumber={rowNumber}
								feedData={feedData}
								hasMoreItems={(data.feed_load_functionality === "scroll" || data.feed_load_functionality === "button") && loadOffset < loadTotalCount}
								data={ { ...gridData,
										 feed_grid_dynamic_start_position: startRight
									 } }
							/>
						</div>
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
				<button class="infinite-scroll" on:click={loadMore} use:loadMoreOnIntersection={loadOffset}
						aria-label="Load more feed items" 
				>
					View More
				</button>
			{:else if data.feed_load_functionality === "button"}
				<div class="view-more-container">
					<Cta button
						 data={ { cta_type: "button",
						 		  cta_text_bold: "View More",
								  cta_icon: "plus",
								  cta_hover_highlight: "bold"
						 } }
						 on:click={loadMore}
					/>
				</div>
			{/if}
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

		.carousel-slides {
			display: contents;
		}

		.grid-container {
			display: contents;

			&.carousel-slide {
				grid-column: viewport;
				display: grid;
				grid-template-columns: subgrid;
				align-content: start;
				row-gap: var(--SPACE-XL);

				position: relative;
				grid-row: 1;
				opacity: 0;
				transform: 0;
				&.slide-active {
					opacity: 1;
					z-index: 2;
				}

				@media (max-width: 31.25em) {
					row-gap: var(--SPACE-LG);

					&:not(.fullbleed) {
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
					}
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

					&.fullbleed {
						grid-column: viewport;
						grid-template-columns: subgrid;
					}
				}
				&.parallax-container {
					row-gap: var(--SPACE-XXL);
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
		align-self: start;

		margin-top: calc(-1 * var(--SPACE-LG));

		display: flex;
		justify-content: flex-end;
		gap: var(--SPACE-MD);

		&.buttons-centered {
			grid-column: eighth-start 1 / eighth-end 4;

			@media (max-width: 62.5em) {
				grid-column: half-start 1 / half-end 1;
			}

			justify-content: flex-end;

			margin-top: calc(-1.5 * var(--GRID-CELL));
		}
	}

	.view-more-container {
		grid-column: main;
	}

	button {
		border: none;
		box-shadow: none;
		background: transparent;
		font-family: "Inter", var(--FONT-FAMILY-PROXIMA-NOVA);

		&.infinite-scroll {
			position: absolute;
			bottom: 0;
			height: 0;
			overflow: hidden;
		}
		&.carousel-button {
			padding: 0;
			align-self: start;
			&:first-of-type:not(:last-of-type):not(.playback) {
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

			&.playback {
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 0.2em;
				width: 1em;
				height: 1em;
				flex-shrink: 0;
				align-self: center;
				margin: 0 -0.5em;
				line-height: 1;

				&::before,
				&::after {
					content: "";
					display: block;
					width: 2.5px;
					height: 0.5em;
					background: var(--color-secondary);
				}

				&.paused {
					gap: 0;
					margin: 0 -0.6em 0 -0.4em;

					&::before {
						width: 0;
						height: 0;
						background: none;
						border-top: 0.3em solid transparent;
						border-bottom: 0.3em solid transparent;
						border-left: 0.5em solid var(--color-secondary);
					}
					&::after {
						display: none;
					}
				}
			}
		}
	}
</style>