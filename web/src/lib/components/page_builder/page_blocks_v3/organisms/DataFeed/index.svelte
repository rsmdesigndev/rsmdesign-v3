<script lang="ts">
	import { onMount } from "svelte";
	import { assetUrl } from "$lib/cms/assets";
	import { request } from "graphql-request";
	import { env } from "$env/dynamic/public";
	import { projectGridQuery } from "$lib/cms/projectGridQueries";

	// Types
	export type CardGridData = {
		change_background_color?: boolean | null;
		section_background_color?: string | null;
		change_breadcrumbs?: boolean | null;
		section_anchor_text?: string | null;
		section_anchor_link?: string | null;
		feed_source?: string | null;
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
	}

	// Props
	export let data: CardGridData;
	export let order: number;

	// Stateful component variables
	let loaded = false;
	let projects: any[] = [];
	let displayCount: number = 6;
	let totalLimit: number = 24;
	let loadCount: number = 6;

	// Load more functionality
	const loadMore = () => {
		if (loadCount < totalLimit) {
			loadCount += displayCount;
		}
	}

	// Show less functionality
	const showLess = () => {
		loadCount = displayCount;
	}

  // Lifecycle
  onMount(async () => {
	// Data based variables
	let limit;
	let markets: string[] = [];
	let services: string[] = [];
	let queryVariables;

	// Set limit
	if (data.limit_posts_to !== null) {
	  limit = data.limit_posts_to;
	}

	// Calculate projects per row
	if (data.projects_per_row === 4) {
	  displayCount = 8;
	  loadCount = 8;
	}

	// Calculate total rows
	if (data.limit_posts_to) {
	  totalLimit = data.limit_posts_to;
	}

	// Extract markets
	if (data.feed_filter_markets) {
	  for (let item of data.feed_filter_markets) {
		if (item?.markets_id?.name) {
		  markets.push(item.markets_id.name);
		}
	  }
	}

	// Extract services
	if (data.feed_filter_services) {
	  for (let item of data.feed_filter_services) {
		if (item?.services_id?.name) {
		  services.push(item.services_id.name);
		}
	  }
	}

	// Determine filter levels and call correct query
	let projectsQuery: string = "";

	if (markets.length > 0 && services.length > 0) {
	  if (data.results_logic) {
		projectsQuery = "both";
	  } else {
		projectsQuery = "either";
	  }
	  queryVariables = {
		limit,
		markets,
		services
	  }
	} else if (markets.length > 0) {
	  projectsQuery = "market";
	  queryVariables = {
		limit,
		markets
	  }
	} else if (services.length > 0) {
	  projectsQuery = "service";
	  queryVariables = {
		limit,
		services
	  }
	} else {
	  projectsQuery = "default";
	  queryVariables = {
		limit
	  }
	}

	let response = await request(env.PUBLIC_DIRECTUS_API_URL, `${projectGridQuery(projectsQuery)}`, queryVariables);
	
	if(response) {
	  console.log(response);
	  projects = response.projects;
	  loaded = true;
	}
  });
</script>

<template>
	<div class="advanced-project-grid">
		<div class="advanced-project-grid__projects" data-layout={data.projects_per_row}>
			{#key loaded}
				{#if !loaded}
					<p>Loading...</p>
				{:else if projects.length === 0}
					<p>No projects match your query. Try another search or set of filters.</p>
				{:else}
					{#each projects.slice(0, loadCount) as project}
						<a class="grid-item"
						   href="/work/{project.slug}"
						>
							<figure>
								<img src={assetUrl(project.grid_image?.filename_disk)}
									 alt={project.grid_image?.title}
								/>
								<figcaption>
									<h3 class="xl">{project.project_title}</h3>
									<p>{project.location}</p>
								</figcaption>
							</figure>
						</a>
					{/each}
				{/if}
			{/key}
		</div>
		{#if data.cta_link}
			<a href={data.cta_link}>
				{#if data.cta_text}
					<span>{data.cta_text}</span>
				{:else}
					<span>View more projects</span>
				{/if}
			</a>
		{:else}
			{#if loadCount < totalLimit}
				<DottedArrowHover on:click={loadMore} text_alignment="right">
					<p>
						View More
						<DottedArrow />
					</p>
				</DottedArrowHover>
			{/if}
		{/if}
	</div>
</template>

<style lang="scss">
  .advanced-project-grid {
	display: flex;
	flex-flow: column nowrap;
	gap: 24px;

	&__heading {
	  text-align: left;
	}

	&__projects {
	  display: grid;
	  grid-template-columns: repeat(3, 1fr);
	  grid-gap: 24px;

	  &[data-layout="2"] {
		grid-template-columns: repeat(2, 1fr);
	  }

	  &[data-layout="4"] {
		grid-template-columns: repeat(4, 1fr);
	  }

	  &.dynamic {
		a.grid-item:nth-of-type(12n + 4),
		a.grid-item:nth-of-type(12n + 11) {
		  grid-column: span 2;
		  grid-row: span 2;

		  @media (max-width: 46.875em) {
			grid-column: span 1;
			grid-row: span 1;
		  }

		  > figure > figcaption > h3 {
			font-size: var(--FONT-SIZE-XXL);

			@media (max-width: 46.875em) {
			  font-size: var(--FONT-SIZE-XL);
			}
		  }
		  > figure > figcaption > p {
			font-size: var(--FONT-SIZE-LG);

			@media (max-width: 46.875em) {
			  font-size: var(--FONT-SIZE-SM);
			}
		  }
		}
	  }

	  > a.grid-item {
		@media (max-width: 46.875em) {
		  &:nth-of-type(5n) {
			grid-column: span 2;
			> figure > figcaption > h3 {
			  font-size: var(--FONT-SIZE-XXL);
			}
			> figure > figcaption > p {
			  font-size: var(--FONT-SIZE-MD);
			}
		  }
		}
		@media (max-width: 31.25em) {
		  &:nth-of-type(5n) {
			grid-column: span 1;
			> figure > figcaption > h3 {
			  font-size: var(--FONT-SIZE-XL);
			}
			> figure > figcaption > p {
			  font-size: var(--FONT-SIZE-SM);
			}
		  }
		}
		> figure {
		  padding: 0;
		  margin: 0;

		  display: grid;
		  grid-template-columns: 1fr;
		  grid-template-rows: 1fr;
		  overflow: hidden;

		  > img {
			grid-row: 1;
			grid-column: 1;
			width: 100%;
			height: auto;
			aspect-ratio: 1/1;
			margin-bottom: 0;
			position: relative;
			z-index: 1;
			transform: scale(1);
			transition: transform 1.25s ease;
		  }

		  > figcaption {
			grid-row: 1;
			grid-column: 1;
			padding: calc(var(--GRID-CELL) / 2);
			width: calc(100% - var(--GRID-CELL));
			height: calc(100% - var(--GRID-CELL));
			position: relative;
			z-index: 2;

			display: flex;
			flex-direction: column;
			align-items: flex-start;
			justify-content: flex-end;

			background-color: rgba(255, 255, 255, 0.7);
			color: var(--COLOR-BLACK);

			opacity: 0;
			transition: opacity 0.3s ease;

			@media (max-width: 46.875em) {
			  grid-row: 2;
			  opacity: 1;
			  padding: 0;
			  margin-top: 0.5rem;
			  width: unset;
			  height: unset;
			  background-color: transparent;
			  align-items: flex-start;
			  justify-content: flex-end;
			}

			> h3 {
			  width: 100%;
			  text-align: left;

			  @media (max-width: 46.875em) {
				transition: color 0.3s ease;
			  }
			}
			> p {
			  width: 100%;
			  text-align: left;
			  font-size: var(--FONT-SIZE-MD);
			  font-weight: 700;
			  margin-bottom: 0;

			  @media (max-width: 46.875em) {
				font-size: var(--FONT-SIZE-SM);
			  }
			}
		  }
		}

		&:hover {
		  > figure {
			> figcaption {
			  opacity: 1;
			  @media (max-width: 46.875em) {
				> h3 {
				  color: var(--COLOR-ORANGE);
				}
			  }
			}
			> img {
			  transform: scale(1.1);

			  @media (max-width: 46.875em) {
				transform: scale(1);
			  }
			}
		  }
		}
	  }
	}

	.load-controls {
	  display: flex;
	  gap: var(--SPACE-MD);
	  justify-content: flex-end;
	}

	.loadmore{
	  background: var(--COLOR-ORANGE);
	  width: fit-content;
	  padding: var(--SPACE-SM) var(--SPACE-MD);
	  border: 0;
	  color: #FFF;
	  font-size: var(--FONT-SIZE-SM);
	  cursor: pointer;
	  transition: background-color 0.3s ease;

	  &:hover {
		background: var(--COLOR-ORANGE-HOVER);
	  }

	  &:disabled {
		background: var(--COLOR-MID-GRAY);
		color: var(--COLOR-DIM-GRAY);
		cursor: not-allowed;
		opacity: 0.4;
	  }
	}

	.showLess {
	  background-color: transparent;
	  width: fit-content;
	  padding: var(--SPACE-SM) var(--SPACE-MD);
	  border: 1px solid var(--COLOR-ORANGE);
	  color: var(--COLOR-ORANGE);
	  font-size: var(--FONT-SIZE-SM);
	  cursor: pointer;
	  transition: all 0.3s ease;

	  &:hover {
		background: var(--COLOR-ORANGE);
		color: #FFF;
	  }
	}
  }
</style>
