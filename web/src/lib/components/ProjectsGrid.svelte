<script lang="ts" context="module">
	import type { FiltersQuery, ProjectsQuery, Projects_Filter } from "$lib/__generated__/graphql";
	import { cmsClient } from "$lib/cms";
	import { getContext, onMount, setContext } from "svelte";
	import DottedArrow from "./DottedArrow.svelte";
	import DottedArrowHover from "./DottedArrowHover.svelte";
	import { fade, slide } from "svelte/transition";
	import debounce from "lodash/debounce";
	import { page } from "$app/stores";

	export const PROJECT_GRID_CONTEXT = Symbol("Project Grid");
	export type ProjectGridContext = {
		filters?: FiltersQuery;
		projects: ProjectsQuery["projects"];
		totalProjectsCount: number;
		filter?: Projects_Filter;
		view_more_name?: string | null;
	};
	export const getProjectGridContext = () => getContext<ProjectGridContext>(PROJECT_GRID_CONTEXT);
	export const setProjectGridContext = (context: ProjectGridContext) =>
		setContext(PROJECT_GRID_CONTEXT, context);

	export type ProjectsGridData = {
		num_projects?: number | null;
		load_functionality?: ProjectsLoadFunctionality | string | null;
		grid_type?: ProjectsGridType | string | null;
		show_filters?: boolean | null;
		overlay_text_alignment?: string | null;
	};

	export enum ProjectsLoadFunctionality {
		None = "none",
		LoadMoreButton = "load_more_button",
		InfiniteScroll = "infinite_scroll"
	}

	export enum ProjectsGridType {
		Uniform = "uniform",
		Dynamic = "dynamic"
	}
</script>

<script lang="ts">
	import { assetUrl } from "$lib/cms/assets";
	import {
		getProjectFiltersFromUrl,
		makeGraphqlProjectFilters,
		makeProjectFilterUrlParams
	} from "$lib/cms/filters";
	import { animate, fadeScroll, fadeMoveScroll } from "$lib/animate";

	/**
	 * Data from the CMS for the ProjectGrid page block.
	 */
	export let data: ProjectsGridData;

	/**
	 * The project grid context should be populated by all pages with this component by using setProjectGridContext.
	 * This allows each page to pass its settings down to the project grid across page content.
	 *
	 * WARNING: The page's initial project load filter MUST be the same as what is set in ProjectGridContext,
	 * otherwise the "load more" functionality will load duplicate/missing/unwanted projects.
	 */
	let context = getProjectGridContext();

	let projects: ProjectsQuery["projects"] = [];

	let loading = false;
	let loadingMore = false;
	let loadOffset = 0;
	let totalProjectsCount = context.totalProjectsCount;

	let filtersExpanded = true; // change to `false` to make filter menu collapsible/expandable
	let serviceFilterSlugs: Set<string> = new Set();
	let marketFilterSlugs: Set<string> = new Set();

	let showSearch = false;
	let searchText = "";

	/**
	 * Request ID counter used to prevent race conditions.
	 * Each reload request should be assigned an ID by incrementing this variable.
	 * Only the results of the most recent request should be used.
	 */
	let latestReloadRequestId = 0;

	function updateUrlParams() {
		const url = new URL($page.url);
		url.search = makeProjectFilterUrlParams(
			serviceFilterSlugs,
			marketFilterSlugs,
			$page.url.searchParams
		);
		history.replaceState(history.state, "", url);
	}

	/**
	 * Reloads all projects using the latest selected filters and search text.
	 */
	async function reloadProjects() {
		console.log("reloading projects");

		let requestId = ++latestReloadRequestId;

		loading = true;
		try {
			projects = [];
			const projectsRes = await cmsClient.Projects({
				filter: data.show_filters
					? makeGraphqlProjectFilters(serviceFilterSlugs, marketFilterSlugs, searchText)
					: context.filter,
				limit: data.num_projects
			});
			// only use results if this is the most recent request
			if (requestId === latestReloadRequestId) {
				totalProjectsCount = projectsRes.projects_aggregated[0]?.count?.id ?? 0;
				loadOffset = projectsRes.projects.length;
				projects = projectsRes.projects;
			}
		} catch (err) {
			console.error(err);
		} finally {
			// only stop loading if this is the most recent request
			if (requestId === latestReloadRequestId) {
				loading = false;
			}
		}
	}

	/**
	 * Debounced project reload request.
	 * Prevents too many requests being sent at once while typing.
	 */
	const debouncedReload = debounce(() => reloadProjects(), 222);

	/**
	 * Loads more projects if there are any.
	 */
	async function loadMore() {
		if (loadingMore) return;

		loadingMore = true;
		try {
			const projectsRes = await cmsClient.Projects({
				filter: data.show_filters
					? makeGraphqlProjectFilters(serviceFilterSlugs, marketFilterSlugs, searchText)
					: context.filter,
				limit: data.num_projects,
				offset: loadOffset
			});
			loadOffset += projectsRes.projects.length;
			projects = projects.concat(projectsRes.projects);
		} catch (err) {
			console.error(err);
		} finally {
			loadingMore = false;
		}
	}

	/**
	 * Toggles the expansion of the filter options.
	 */
	function toggleExpandFilters() {
		filtersExpanded = !filtersExpanded;
	}

	/**
	 * Toggles a single market filter in the active filters and reloads the projects.
	 * @param slug The market slug to toggle.
	 */
	function toggleMarketFilter(slug?: string | null) {
		if (!slug) {
			return;
		}
		if (marketFilterSlugs.has(slug)) {
			marketFilterSlugs.delete(slug);
		} else {
			marketFilterSlugs.add(slug);
		}
		marketFilterSlugs = marketFilterSlugs;

		updateUrlParams();
		reloadProjects();
	}

	/**
	 * Toggles a single service filter in the active filters and reloads the projects.
	 * @param slug The service slug to toggle.
	 */
	function toggleServiceFilter(slug?: string | null) {
		if (!slug) {
			return;
		}
		if (serviceFilterSlugs.has(slug)) {
			serviceFilterSlugs.delete(slug);
		} else {
			serviceFilterSlugs.add(slug);
		}
		serviceFilterSlugs = serviceFilterSlugs;

		updateUrlParams();
		reloadProjects();
	}

	/**
	 * Displays the search bar.
	 */
	function expandSearch() {
		showSearch = true;
	}

	/**
	 * Svelte action for infinite scroll functionality.
	 * Loads more projects when the bottom of the container is reached.
	 */
	function loadMoreOnIntersection(node: Element) {
		const observer = new IntersectionObserver(([entry]) => {
			if (
				entry.isIntersecting &&
				!loadingMore &&
				!loading &&
				projects.length < totalProjectsCount
			) {
				console.log("loadMore");
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

	onMount(() => {
		const urlFilters = getProjectFiltersFromUrl($page.url.searchParams);
		serviceFilterSlugs = urlFilters.serviceFilterSlugs;
		marketFilterSlugs = urlFilters.marketFilterSlugs;
		if (urlFilters.hasUrlFilter) {
			reloadProjects();
		}

		projects = context.projects.slice(0, data.num_projects ?? 9);
		loadOffset = projects.length;
	});
</script>

<template>
	{#if data.show_filters}
		<div class="title-bar">
			<h1 class="xxxl">Work.</h1>
			<div>
				<!-- Un-comment out this button to make filter menu collapsible/expandable -->
				<!--<button class="reset" class:filtersExpanded on:click={toggleExpandFilters}>Filter</button>-->
				<button class="reset search-button" class:hidden={showSearch} on:click={expandSearch}>
					<img src="/img/search-icon.svg" alt="Search" />
				</button>
				{#if showSearch}
					<div class="search-container" transition:slide={{ duration: 400, axis: "x" }}>
						<input
							bind:value={searchText}
							on:input={debouncedReload}
							placeholder="Search (e.g. services, locations, etc)"
						/>
					</div>
				{/if}
			</div>
		</div>
	{/if}
	{#if data.show_filters && filtersExpanded}
		<section class="filters" transition:slide={{ duration: 400 }}>
			<div>
				<h2>Services</h2>
				<ul>
					{#each context.filters?.services ?? [] as service}
						<li
							class="filter-item"
							class:active={service.slug && serviceFilterSlugs.has(service.slug)}
							on:click={() => toggleServiceFilter(service.slug)}
							on:keydown={null}
							role="button"
						>
							{service.short_name}
						</li>
					{/each}
				</ul>
			</div>
			<div>
				<h2>Markets</h2>
				<ul class="markets">
					{#each context.filters?.markets ?? [] as market}
						<li
							class="filter-item"
							class:active={market.slug && marketFilterSlugs.has(market.slug)}
							on:click={() => toggleMarketFilter(market.slug)}
							on:keydown={null}
						>
							{market.short_name}
						</li>
					{/each}
				</ul>
			</div>
		</section>
	{/if}

	<div
		class="grid-col-3 projects-grid"
		class:overlay-text-centered={data.overlay_text_alignment === "centered"}
		class:dynamic={data.grid_type === ProjectsGridType.Dynamic}
	>
		{#if loading}{:else}
			{#each projects as project}
				<a
					class="grid-item"
					href="/work/{project.slug}{makeProjectFilterUrlParams(
						serviceFilterSlugs,
						marketFilterSlugs
					)}"
					use:animate={fadeScroll}
				>
					<figure>
						<img
							transition:fade={{ duration: 200 }}
							src={assetUrl(project.grid_image?.filename_disk)}
							alt={project.grid_image?.description}
						/>
						<figcaption>
							<h3 class="xl">{project.project_title}</h3>
							<p>{project.location}</p>
						</figcaption>
					</figure>
				</a>
			{:else}
				<p>No project match your query. Try another search or set of filters.</p>
			{/each}
		{/if}
	</div>
	{#if data.load_functionality === ProjectsLoadFunctionality.LoadMoreButton && projects.length < totalProjectsCount}
		<div class="load-more" use:animate={fadeMoveScroll}>
			{#if loadingMore}{:else}
				<DottedArrowHover on:click={loadMore} text_alignment="right">
					<p>
						View More {context.view_more_name ?? "Projects"}
						<DottedArrow />
					</p>
				</DottedArrowHover>
			{/if}
		</div>
	{/if}
	{#if data.load_functionality === ProjectsLoadFunctionality.InfiniteScroll && !loading}
		<!-- When this div is reached in the DOM, more projects will be loaded. -->
		<div id="infinite-scroll" use:loadMoreOnIntersection />
	{/if}
</template>

<style lang="scss">
	#infinite-scroll {
		position: absolute;
		bottom: 66.667vh;
	}
	.search-button {
		opacity: 1;
		transition: opacity 0.2s ease;
	}

	.hidden {
		opacity: 0;
	}

	.title-bar {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: 0.5rem;

		div {
			display: flex;
			justify-content: space-between;
			align-items: baseline;

			.search-container {
				input {
					width: 28.75vw;
				}
			}
		}

		button {
			margin: 0 0 0 calc(var(--GRID-CELL) * 3);
			font-weight: 600;
			position: relative;

			&:first-of-type:not(:last-of-type)::after {
				content: "›";
				position: absolute;
				display: inline-flex;
				color: var(--COLOR-ORANGE);
				font-size: 200%;
				font-weight: 300;
				line-height: 0.618;
				margin-left: 0.2em;
				transition: transform 0.3s ease;
			}

			&.filtersExpanded::after {
				transform: rotate(-90deg) translate(-0.1em, -0em);
			}

			&:last-of-type {
				width: 1em;
				height: 1em;

				img {
					width: 100%;
					height: 100%;
					object-fit: contain;
				}
			}
		}
	}

	.filters {
		padding: var(--GRID-CELL) 0;
		display: grid;
		grid-template-columns: 1fr 2fr;
		grid-auto-flow: column;
		column-gap: calc(var(--GRID-CELL) / 2);

		h2 {
			border-bottom: 1px solid var(--COLOR-DIM-GRAY);
			font-size: var(--FONT-SIZE-SM);
			margin-bottom: 0.75em;
		}

		.markets {
			grid-area: span 1 / span 2 / span 1 / span 2;
			column-count: 2;
		}

		ul > li {
			font-size: var(--FONT-SIZE-XS);
			font-weight: 600;
			text-transform: uppercase;
			letter-spacing: 0.05em;
			color: var(--COLOR-MID-GRAY);

			margin-bottom: 0.25em;

			cursor: pointer;

			transition: color 0.3s ease;

			&:hover {
				color: var(--COLOR-DIM-GRAY);
			}

			&.active {
				color: var(--COLOR-ORANGE);
			}
		}
	}

	.projects-grid {
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
						font-weight: 600;
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

		&.overlay-text-centered > a.grid-item > figure > figcaption {
			align-items: center;
			justify-content: center;

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
				text-align: center;
			}
			> p {
				width: 100%;
				font-size: var(--FONT-SIZE-MD);
				margin-bottom: 0;
				text-align: center;
			}
		}
	}

	.load-more {
		margin-top: 0.667em;
	}
</style>
