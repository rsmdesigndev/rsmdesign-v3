<script lang="ts">
	import { onMount } from "svelte";
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
		feed_grid_columns?: number;
		feed_grid_style?: string | null;
		feed_grid_rows_per_load?: number;
		feed_cards?: CardData[] | null;
	}

	// Props
	export let data: DataFeedData;

	// Stateful component variables
	$: feedData = [];
	let loaded = false;
	let numItems: number = 10;
	$: loadOffset = 0;
	let loadTotalCount: number = 0;

	if (data.feed_view === "Grid") {
		if (data.feed_grid_style === "dynamic") {
			numItems = 14;
		} else {
			numItems = data.feed_grid_columns * data.feed_grid_rows_per_load;
		}
	}

	// Load more functionality
	const loadMore = async () => {
		switch (data.feed_source) {
			case "Projects": {
				let filters = [];

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

				// Extract services
				if (data.feed_filter_services && data.feed_filter_services.length > 0) {
					let services = [];
					for (let item of data.feed_filter_services) {
						if (item?.services_id?.name) {
							services.push(`"${item.services_id.name}"`);
						}
					}
					filters.push(`{ services: { services_id: { name: { _in: [${services.join(",")}] } } } }`);
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
					console.log(response);
					feedData.push(...response.projects);
					feedData = feedData;
					loaded = true;
					loadTotalCount = response.projects_aggregated?.[0]?.count?.id ?? 0;
				}
				break;
			}
			case "Articles": {
				let filters = [];

				if (data.feed_filter_topics && data.feed_filter_topics.length > 0) {
					let topics = [];
					for (let item of data.feed_filter_topics) {
						if (item?.news_topics_id?.name) {
							topics.push(`"${item.news_topics_id.name}"`);
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
					console.log(response);
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

		console.log(feedData);
	}

	// Lifecycle
	onMount(async () => {
		loadMore();
	});
</script>

<template>
	<section class="padding-top-xl padding-bottom-none">
		{#key loaded}
			{#if !loaded}
				<p>Loading...</p>
			{:else if feedData.length === 0}
				<p>No projects match your query. Try another search or set of filters.</p>
			{:else}
				{#if data.feed_view === "Grid"}
					<DataFeedGrid {feedData}
						data={ { feed_source: data.feed_source,
								 feed_grid_columns: data.feed_grid_columns,
							     feed_grid_style: data.feed_grid_style
							 } }
					/>
				{:else}
					<DataFeedTable {feedData} />
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
			<button on:click={loadMore}>
				View More
			</button>
		{/if}
	</section>

</template>

<style lang="scss">
	section {
		grid-column: viewport;
		display: grid;
		grid-template-columns: subgrid;

		align-items: start;

		button {
			grid-column: main;
		}

		row-gap: var(--SPACE-XL);

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
</style>