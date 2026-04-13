<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";
	import type { ImageAssetRelation } from "$lib/cms";
	import { assetUrl } from "$lib/cms/assets";
	import { request } from "graphql-request";
	import { env } from "$env/dynamic/public";

	import DataFeedGrid from "./DataFeedGrid.svelte";
	import DataFeedTable from "./DataFeedTable.svelte";
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
		feed_grid_dynamic_images?: ImageAssetRelation[] | null;
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
							location
							markets {
								markets_id {
									name
									short_name
								}
							}
							project_location_city {
								city_name
								state_province {
									state_province_name
									state_province_abbreviation
								}
								country {
									country_name
									country_abbreviation
								}
							}
							studio_locations {
								studio_locations_id {
									slug
									location
								}
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
							post_title
							published_date
							grid_image {
								filename_disk
								description
							}
							hero_image {
								filename_disk
								title
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
								_and: [
									{ visibility: { _nin: ["draft", "archived"] } },
									{
										_${data.feed_filter_logic}: [
											${filters.join(",\n")}
										]
									}
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
				let query = `
					query Team($limit: Int, $offset: Int) {
						team(
							limit: $limit
							offset: $offset
							sort: ["sort_priority", "-banner_grid_image_sort"]
							filter: { 
								visibility: { _in: ["visible", "visibleInFeeds"] } 
							}
						) {
							slug
							name
							full_title
							short_title
							seo_page_description
							headshot {
								title
								description
								filename_disk
							}
							has_profile_page
						}
						team_aggregated(
							filter: {
								_and: [
									{ visibility: { _in: ["visible", "visibleInFeeds"] } }
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
					feedData.push(...response.team);
					feedData = feedData;
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
				let query = `
					query Awards($limit: Int, $offset: Int) {
						awards(
							limit: $limit
							offset: $offset
							sort: ["-year", "-awards_page_sort"]
							filter: { 
								visibility: { _nin: ["draft", "archived"] } 
							}
						) {
							award_body_designation
							award_category
							year
							awards_page_sort
							project_name
							project_location
							project {
								slug
								project_title
								location
								grid_image {
									filename_disk
									title
									description
								}
								project_location_city {
									city_name
									state_province {
										state_province_name
										state_province_abbreviation
									}
									country {
										country_name
										country_abbreviation
									}
								}
							}
						}
						awards_aggregated(
							filter: {
								_and: [
									{ visibility: { _nin: ["draft", "archived"] } }
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
					feedData.push(...response.awards);
					feedData = feedData;
					loaded = true;
					loadTotalCount = response.awards_aggregated?.[0]?.count?.id ?? 0;
				}

				break;
			}
			case "Testimonials": {
				let query = `
					query Testimonials($limit: Int, $offset: Int) {
						testimonials(
							limit: $limit
							offset: $offset
							filter: { 
								visibility: { _eq: "visible" } 
							}
						) {
							quote_attribution
							quote_attribution_job_title
							company_name
							quote
							banner_image {
								filename_disk
								title
								description
							}
							associated_project {
								slug
								project_title
								location
								grid_image {
									filename_disk
									title
									description
								}
							}
						}
						testimonials_aggregated(
							filter: {
								visibility: { _eq: "visible" } 
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
					feedData.push(...response.testimonials);
					feedData = feedData;
					loaded = true;
					loadTotalCount = response.testimonials_aggregated?.[0]?.count?.id ?? 0;
				}

				break;
			}
		case "Careers": {
				let query = `
					query Careers($limit: Int, $offset: Int) {
						careers(
							limit: $limit
							offset: $offset
							sort: ["sort"]
							filter: { 
								visibility: { _eq: "visible" } 
							}
						) {
							slug
							name
							grid_image {
								filename_disk
								title
								description
							}
							studios {
								studio_locations_id {
									location
								}
							}
							years_experience
						}
						careers_aggregated(
							filter: {
								visibility: { _eq: "visible" } 
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
					feedData.push(...response.careers);
					feedData = feedData;
					loaded = true;
					loadTotalCount = response.careers_aggregated?.[0]?.count?.id ?? 0;
				}

				break;
			}
		case "Studios": {
				let query = `
					query Studios($limit: Int, $offset: Int) {
						studio_locations(
							limit: $limit
							offset: $offset
							sort: ["sort_priority"]
							filter: { 
								visibility: { _eq: "visible" } 
							}
						) {
							slug
							location
							grid_image {
								filename_disk
								title
								description
							}
							studio_contact_person {
								slug
								name
							}
							studio_contact_block
						}
						studio_locations_aggregated(
							filter: {
								visibility: { _eq: "visible" } 
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
					feedData.push(...response.studio_locations);
					feedData = feedData;
					loaded = true;
					loadTotalCount = response.studio_locations_aggregated?.[0]?.count?.id ?? 0;
				}

				break;
			}
			case "Manual": {
				break;
			}
		}

		loadOffset += numItems;
		//console.log("load more")
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
	<section id={`row-${rowNumber}`}
			 class={`padding-top-${data.section_padding_top}
					 padding-bottom-${data.section_padding_bottom}
					 ${data.feed_view}
				   `}
			 class:tall={data.feed_view === "Grid" && data.feed_grid_style === "dynamic" && data.feed_grid_columns === 3}
			 style:--z-index={data.feed_view === "Table" && data.feed_table_style === "simple" ? "3" : "2"}
			 use:selectFeedOnIntersection
	>

		{#key loaded}
			{#if !loaded && data.feed_source != "Manual"}
				<p>Loading...</p>
			{:else if feedData.length === 0 && data.feed_source != "Manual"}
				<p>No results match your query. Try another search or set of filters.</p>
			{:else}
				{#if (data.feed_view === "Grid" || data.feed_source === "Manual" || data.feed_source === "Team" || data.feed_source === "Testimonials") && (data.feed_source != "Awards" && data.feed_source != "Careers")}
					{#if data.feed_source === "Manual"}
						<div class="grid-container">
							<DataFeedGrid 
								rowNumber={rowNumber}
								data={ { feed_source: data.feed_source,
										 feed_cards: data.feed_cards,
										 feed_grid_columns: data.feed_grid_columns,
										 feed_grid_style: data.feed_grid_style,
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
						{#if data.feed_view === "Grid" && data.feed_grid_style === "dynamic" && data.feed_grid_columns === 3}
							<div class="grid-heading">
								<Heading 
									data={ { heading_type: "page",
											 heading_primary: "large",
											 heading_size: "xxxl",
											 heading_weight: "regular",
											 heading_has_small_text: false,
											 heading_has_large_text: true,
											 heading_has_superscript: true, 
											 heading_large: data.feed_source,
											 heading_superscript: loadTotalCount
										 } }
								/>
							</div>
						{/if}
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
			<div class="button-container"
				 class:buttons-centered={data.feed_grid_columns === 1 && data.feed_grid_style != "banner"}
			>
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
		}
		&.Table {
			row-gap: 0;
			//min-height: 100vh;
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

		.grid-heading {
			grid-column: main;
			margin-bottom: var(--SPACE-MD);
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
		font: "Inter", var(--FONT-FAMILY-PROXIMA-NOVA);

		&.infinite-scroll {
			height: 0;
			overflow: hidden;
			margin-top: -100vh;
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