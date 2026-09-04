<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { request } from "graphql-request";
	import { env } from "$env/dynamic/public";
	import { page } from "$app/stores";
	import { feedSourceConfig, generateQuery, type QuerySource } from "$lib/cms/dataFeed/dataFeedQueries";
	import { standardizeFilterPropertyNames, mergeFilterItems, sanitizeSearchText, feedFiltersToUrlParams,
			 filterMenuLabel, filterMenuHeading, filterMenuCollection,
			 type FeedFilters } from "$lib/cms/dataFeed/dataFeedFilters";
	import { slide, fade } from "svelte/transition";
	import Cta, { type CtaData } from "../../atoms/Cta.svelte";

	export let feedFilters: FeedFilters = [];
	export let feedSource: string = "Projects";
	export let searchText: string = "";
	export let feedView: "Grid" | "Table" | "Ticker Tape" = "Grid";

	// Load filters
	const loadFilters = async () => {
		for (const group of feedFilters) {
			const collection: string = filterMenuCollection(group.arrayOf);

			if (!collection) {
				continue;
			}

			const query = generateQuery(group.arrayOf as QuerySource);
			let response = await request(env.PUBLIC_DIRECTUS_API_URL, query);

			if (response) {
				group.filterItems = mergeFilterItems(
					standardizeFilterPropertyNames(group.arrayOf, response[collection]),
					group.filterItems
				);
				feedFilters = feedFilters;
			}
		}
	}

	onMount(() => {
		loadFilters();
	});

	const dispatch = createEventDispatcher();

	// Share
	const shareResetDelay: number = 3000;
	let shareStatus: string = "";
	let shareTimeout: any = null;

	$: shareParams = feedFiltersToUrlParams(feedFilters, searchText);

	async function shareFilters() {
		if (shareTimeout !== null) {
			clearTimeout(shareTimeout);
		}

		const shareUrl: string = `${$page.url.origin}${$page.url.pathname}${shareParams}`;

		try {
			await navigator.clipboard.writeText(shareUrl);
			shareStatus = "Link copied";
		} catch (error) {
			shareStatus = "Could not copy the link";
		}

		shareTimeout = setTimeout(() => shareStatus = "", shareResetDelay);
	}

	// Search
	const searchDelay: number = 300;
	let searchTimeout: any = null;
	let lastSearchTerm: string = "";

	$: debounceSearch(searchText);

	function debounceSearch(text: string) {
		clearSearchTimeout();
		searchTimeout = setTimeout(search, searchDelay);
	}

	function clearSearchTimeout() {
		if (searchTimeout !== null) {
			clearTimeout(searchTimeout);
			searchTimeout = null;
		}
	}

	function search() {
		clearSearchTimeout();

		const searchTerm: string = sanitizeSearchText(searchText);

		if (searchTerm === lastSearchTerm) {
			return;
		}

		lastSearchTerm = searchTerm;
		dispatch('updateFilters');
	}

	// Toggle filters
	$: alwaysOpen = feedSource === "Articles";
	$: searchable = Boolean(feedSourceConfig(feedSource)?.searchable);
	$: switchableView = feedSource === "Projects";
	$: showMenuBar = switchableView || searchable || !alwaysOpen;
	$: menuGroupCount = feedFilters.filter(group => filterMenuLabel(group.arrayOf)).length;

	$: openFilterMenu = "none";

	function toggleFilterMenu(filter: string) {
		if (openFilterMenu === filter) {
			openFilterMenu = "none";
		} else {
			openFilterMenu = filter;
		}
	}

	function toggleSearchMenu() {
		if (openFilterMenu === "search") {
			openFilterMenu = "none";
		} else {
			openFilterMenu = "search"
		}
	}

	function toggleFeedView(view: string) {
		if (view != feedView) {
			feedView = view;
			dispatch('updateFilters');
		}
	}

	const filterMenuCta = {
		cta_type: "link",
		cta_size: "md",
		cta_style: "light",
		cta_hover_highlight: "light"
	}

</script>

<template>
	{#if showMenuBar}
		<div 
			class="project-filter-menu-container"
		>
			<div>
				{#if switchableView}
					<div>
						<button 
							class="button-icon button-grid"
							class:active={feedView === "Grid"}
							aria-pressed={feedView === "Grid"}
							aria-label="Display results as a grid"
							on:click={() => toggleFeedView("Grid")}
						>
							<div />
							<div />
							<div />
						</button>
						<button 
							class="button-icon button-table"
							class:active={feedView === "Table"}
							aria-pressed={feedView === "Table"}
							aria-label="Display results as a table"
							on:click={() => toggleFeedView("Table")}
						>
							<div />
							<div />
							<div />
						</button>
					</div>
				{/if}
				<div>
					{#if !alwaysOpen}
						{#each feedFilters as group}
							{#if filterMenuLabel(group.arrayOf)}
								<Cta button
									 data={ {...filterMenuCta, 
											 cta_text_light: filterMenuLabel(group.arrayOf),
											 cta_icon: `${openFilterMenu === group.arrayOf ? "arrow_up" : "arrow_down"}`
										  } }
									 aria-expanded={openFilterMenu === group.arrayOf ? "true" : "false"}
									 on:click={() => toggleFilterMenu(group.arrayOf)}
								/>
							{/if}
						{/each}
						{#if shareParams}
							<Cta button
								 data={ {...filterMenuCta, 
										 cta_text_light: "Share",
										 cta_icon: "none"
									  } }
								data-menu-control="share"
								 on:click={shareFilters}
							/>
						{/if}
						<Cta button
							 data={ {...filterMenuCta, 
									 cta_text_light: "Filter",
									 cta_icon: `${openFilterMenu === "all" ? "arrow_up" : "arrow_down"}`
								  } }
							 aria-expanded={openFilterMenu === "all" ? "true" : "false"}
							 on:click={() => toggleFilterMenu("all")}
						/>
					{/if}
					<span class="share-status" aria-live="polite">{shareStatus}</span>
				</div>
			</div>
			<div>
				<!-- Only project feeds -->
				{#if searchable}
					<Cta button
						 data={ {...filterMenuCta, 
						 		 cta_icon_position: "left",
								 cta_text_light: "Search",
								 cta_icon: `${openFilterMenu === "search" ? "cancel" : "search"}`
							  } }
						 aria-expanded={openFilterMenu === "search" ? "true" : "false"}
						 on:click={toggleSearchMenu}
					/>
				{/if}
			</div>
		</div>
	{/if}
	{#if alwaysOpen || openFilterMenu != "none"}
		<div class="project-filters-wrapper" transition:slide={{ duration: 400 }}>
			<div class="project-filters-container">
				<div class="project-filters"
					 class:active={alwaysOpen || openFilterMenu != "none"}
				>
					{#each feedFilters as group}
						{#if filterMenuLabel(group.arrayOf) && (alwaysOpen || openFilterMenu === group.arrayOf || openFilterMenu === "all")}
							{#if group.filterItems.length > 0}
								<div in:fade={{ duration: 200, delay: 201 }}
									 out:fade={{ duration: 200 }}
									 class:project-filters-stacked={openFilterMenu === "all" || (alwaysOpen && menuGroupCount > 1)}
								>
									<h2>{filterMenuHeading(group.arrayOf)}</h2>
									{#each group.filterItems as item}
										<div>
											<label class="filter-button">
												<input type="checkbox"
													   name={group.arrayOf}
													   value={item.id}
													   bind:group={group.filterIds}
													   on:change={() => dispatch('updateFilters')}
												/>
												<span class="filter-name">
													{item.name}
												</span>
											</label>
										</div>
									{/each}
								</div>
							{:else}
								<p>Loading…</p>
							{/if}
						{/if}
					{/each}
					{#if openFilterMenu === "search"}
						<div class="search">
							<form on:submit|preventDefault={search}>
								<button type="submit" aria-label="Search button">
									<svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
										<rect width="10" height="2.25" transform="matrix(-0.707107 -0.707107 -0.707107 0.707107 20.6621 19.0703)" />
										<circle cx="6.875" cy="6.875" r="6.875" transform="matrix(-1 0 0 1 14.8125 1.0625)" stroke-width="2.125"/>
									</svg>
								</button>
								<input bind:value={searchText} placeholder="Project name, location, etc…" aria-label="Search bar" autofocus />
							</form>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</template>

<style lang="scss">
	.project-filter-menu-container {
		margin-top: var(--SPACE-MD);
		grid-column: main;
		display: flex;
		justify-content: space-between;

		> div {
			flex: 0 0 auto;
			display: flex;
			align-items: flex-end;
			gap: var(--SPACE-LG);
			padding-bottom: 0.1em;

			> div {
				flex: 0 0 auto;
				display: flex;

				&:first-of-type {
					gap: var(--SPACE-MD);
					margin-bottom: 0.167em;
				}

				&:last-of-type {
					gap: calc(var(--GRID-CELL) * 1.5);
				}

				:global {
					button {
						display: flex;

						&:last-of-type {
							display: none;
						}

						@media (max-width: 62.5em) {
							display: none;

							&:last-of-type {
								display: flex;
							}

							&[data-menu-control="share"] {
								display: flex;
							}
						}
					}
				}
			}
		}

		button {
			border: none;
			border-radius: 0;
			background: transparent;
			padding: 0;
			cursor: pointer;

			&.button-icon {
				width: 1rem;
				height: 1rem;
				display: flex;
				flex-direction: column;
				gap: 4px;
				> div {
					position: relative;
					width: 2px;
					height: 2px;
					border-radius: 50%;
					background-color: var(--color-secondary);
					transition: background-color 0.3s ease;
					&::before,
					&::after {
						background-color: var(--color-secondary);
						transition: background-color 0.3s ease;
					}
				}
				&.active > div {
					background-color: var(--color-primary);
					&::before,
					&::after {
						background-color: var(--color-primary);
					}
				}

				&:hover > div {
					background-color: var(--color-accent);
					&::before,
					&::after {
						background-color: var(--color-accent);
					}
				}
			}
			&.button-grid {
				align-items: center;
				> div::before,
				> div::after {
					position: absolute;
					content: "";
					width: 2px;
					height: 2px;
					border-radius: 50%;
				}
				> div::before {
					left: -6px;
				}
				> div::after {
					left: 6px;
				}
			}
			&.button-table {
				width: 1.25rem;
				> div::after {
					position: absolute;
					left: 4px;
					top: 0.5px;
					content: "";
					width: 14px;
					height: 1px;
				}
			}
		}
	}
	.project-filters-wrapper {
		grid-column: viewport;

		display: grid;
		grid-template-columns: subgrid;

		transition: height 200ms ease;

		> .project-filters-container {
			margin-top: var(--SPACE-MD);
			padding: var(--SPACE-MD) 0;
			grid-column: viewport;
			background-color: #f2f2f3;

			display: grid;
			grid-template-columns: subgrid;

			> p {
				grid-column: main;
			}

			// Visually hidden but still announced
			.share-status {
				position: absolute;
				width: 1px;
				height: 1px;
				margin: -1px;
				padding: 0;
				border: 0;
				overflow: hidden;
				white-space: nowrap;
				clip-path: inset(50%);
			}

			.filter-button {
				position: relative;
				display: flex;
				align-items: baseline;

				font-family: var(--FONT-FAMILY-PROXIMA-NOVA);
				font-size: var(--FONT-SIZE-MD);
				font-weight: 300;
				line-height: 1.333;

				color: var(--color-cta, var(--color-primary, inherit));
				cursor: pointer;
				transition: color 0.3s ease;

				// Visually hidden but still focusable and announced
				input {
					position: absolute;
					width: 1px;
					height: 1px;
					margin: -1px;
					padding: 0;
					border: 0;
					overflow: hidden;
					white-space: nowrap;
					clip-path: inset(50%);
				}

				.filter-name {
					transition: color 0.3s ease;

					&::after {
						position: absolute;
						top: calc(50% - 0.1rem);
						left: -1rem;

						content: "";
						width: 0.33rem;
						height: 0.33rem;
						border-radius: 50%;
						border: 1px solid transparent;
						transition: border-color 0.3s ease, background-color 0.3s ease;
					}
				}

				input:checked + .filter-name::after {
					border-color: var(--color-primary);
					background-color: var(--color-primary);
				}

				&:hover .filter-name::after,
				&:hover input:checked + .filter-name::after {
					border-color: var(--color-primary);
					background-color: transparent;
				}

				input:focus-visible + .filter-name {
					outline: 2px solid var(--color-accent, var(--COLOR-ORANGE));
					outline-offset: 0.25rem;
				}
			}

			> .project-filters {
				grid-column: main;
				display: grid;
				grid-template-columns: subgrid;
				
				> div {
					grid-row: 1;
					grid-column: 1 / -1;
					display: grid;
					grid-template-columns: repeat(4, 1fr);
					grid-auto-flow: row dense;
					column-gap: var(--SPACE-MD);
					row-gap: 1rem;

					@media (max-width: 62.5em) {
						grid-template-columns: repeat(3, 1fr);
					}

					@media (max-width: 31.25em) {
						grid-template-columns: repeat(2, 1fr);
					}

					> h2 {
						display: none;
					}

					&.project-filters-stacked {
						grid-row: auto;

						> h2 {
							display: block;
							grid-column: 1 / -1;

							margin-bottom: 0.5rem;

							font-size: var(--FONT-SIZE-MD);
							font-weight: 500;
							line-height: 1.167;

							text-transform: uppercase;
							letter-spacing: 0.05em;
						}

						&:first-of-type {
							padding-bottom: calc(var(--SPACE-MD) + 0.5rem);
							border-bottom: 1px solid var(--color-secondary);
							margin-bottom: calc(var(--SPACE-MD) + 0.5rem);
						}
					}

					> p {
						font-size: var(--FONT-SIZE-SM);
						line-height: 1.333;
						margin-bottom: 0;
					}

					&.search {
						grid-template-columns: repeat(3, 1fr);
					}

					> form {
						grid-column: 2;
						display: flex;

						> button {
							width: auto;
							background: transparent;
							margin: 0;
							padding: 0.5rem;
							height: 100%;
							transition: background-color 0.3s ease;
							border: none;
							border-radius: 50%;
							font-weight: 300;
							font-size: var(--FONT-SIZE-XL);
							line-height: 0;
							> svg {
								height: var(--SPACE-SM);
								width: auto;
								rect {
									fill: var(--color-primary);
									transition: fill 0.3s ease;
								}
								circle {
									stroke: var(--color-primary);
									transition: stroke 0.3s ease;
								}
							}
							&:hover {
								> svg {
									rect {
										fill: var(--color-accent);
									}
									circle {
										stroke: var(--color-accent);
									}
								}
							}
						}

						> input {
							flex: 1 1 auto;
							background: none;
							border: none;
							border-bottom: 1px inset var(--color-tertiary);
							border-radius: 0;
							max-width: 100%;
							padding: 0.25rem 0.75rem;
							background-color: transparent;
							transition: background-color 0.2s ease;
							color: var(--color-primary);
							font-size: var(--FONT-SIZE-MD);
							font-weight: 300;
							caret-color: var(--COLOR-MID-GRAY);

							&::placeholder {
								color: var(--color-primary);
								font-size: var(--FONT-SIZE-MD);
								font-weight: 300;
							}

							&:focus {
								outline: none;
								background-color: var(--color-background);
								border-bottom: none;
								border-radius: 0.25rem;
							}

							&.active {
								color: var(--COLOR-ORANGE);
							}
						}
					}
				}
			}
		}
	}
</style>