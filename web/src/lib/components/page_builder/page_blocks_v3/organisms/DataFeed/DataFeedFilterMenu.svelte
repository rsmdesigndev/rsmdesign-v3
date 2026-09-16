<script context="module" lang="ts">
	import { request } from "graphql-request";
	import { env } from "$env/dynamic/public";
	import { generateQuery, type QuerySource } from "$lib/cms/dataFeed/dataFeedQueries";
	import { standardizeFilterPropertyNames, filterMenuCollection,
			 type FilterItem, type FilterType } from "$lib/cms/dataFeed/dataFeedFilters";

	// Shared by every menu instance in the same session
	const loadedFilterItems: Record<string, Promise<FilterItem[]>> = {};

	// Cache the promise rather than the result, so concurrent menus share one request
	const loadFilterItems = (arrayOf: FilterType): Promise<FilterItem[]> => {
		if (!(arrayOf in loadedFilterItems)) {
			loadedFilterItems[arrayOf] = request(env.PUBLIC_DIRECTUS_API_URL, generateQuery(arrayOf as QuerySource))
				.then((response: any) => standardizeFilterPropertyNames(arrayOf, response?.[filterMenuCollection(arrayOf)] ?? []))
				.catch(error => {
					delete loadedFilterItems[arrayOf];
					console.warn(`Could not load the ${arrayOf} filter list:`, error);
					return [];
				});
		}

		return loadedFilterItems[arrayOf];
	};
</script>

<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { page } from "$app/stores";
	import { mergeFilterItems, sanitizeSearchText, feedFiltersToUrlParams,
			 filterMenuLabel, filterMenuHeading,
			 type FeedFilters } from "$lib/cms/dataFeed/dataFeedFilters";
	import { slide, fade } from "svelte/transition";
	import Cta, { type CtaData } from "../../atoms/Cta.svelte";

	export let feedFilters: FeedFilters = [];
	export let searchText: string = "";
	export let feedView: "Grid" | "Table" | "Ticker Tape" = "Grid";

	// Load filters
	const loadFilters = async () => {
		const menuGroups = feedFilters.filter(group => filterMenuCollection(group.arrayOf));

		await Promise.all(menuGroups.map(async group => {
			const filterItems = await loadFilterItems(group.arrayOf);

			if (filterItems.length > 0) {
				group.filterItems = mergeFilterItems(filterItems, group.filterItems);
				feedFilters = feedFilters;
			}
		}));
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

	let gridRadio: HTMLElement;
	let tableRadio: HTMLElement;

	$: gridChecked = feedView === "Grid";
	$: tableChecked = feedView === "Table";
	$: gridTabIndex = (gridChecked || !tableChecked) ? 0 : -1;
	$: tableTabIndex = tableChecked ? 0 : -1;

	function handleViewKeydown(e: KeyboardEvent) {
		if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
		e.preventDefault();
		const next = e.currentTarget === gridRadio ? "Table" : "Grid";
		toggleFeedView(next);
		(next === "Grid" ? gridRadio : tableRadio)?.focus();
	}

	const filterMenuCta = {
		cta_type: "link",
		cta_size: "md",
		cta_style: "light",
		cta_hover_highlight: "light"
	}

</script>

<template>
	<div 
		class="project-filter-menu-container"
	>
		<div>
			<div role="radiogroup" aria-label="Results view">
				<button 
					bind:this={gridRadio}
					class="button-icon button-grid"
					class:active={gridChecked}
					role="radio"
					aria-checked={gridChecked}
					tabindex={gridTabIndex}
					aria-label="Display results as a grid"
					on:click={() => toggleFeedView("Grid")}
					on:keydown={handleViewKeydown}
				>
					<span />
					<span />
					<span />
				</button>
				<button 
					bind:this={tableRadio}
					class="button-icon button-table"
					class:active={tableChecked}
					role="radio"
					aria-checked={tableChecked}
					tabindex={tableTabIndex}
					aria-label="Display results as a table"
					on:click={() => toggleFeedView("Table")}
					on:keydown={handleViewKeydown}
				>
					<span />
					<span />
					<span />
				</button>
			</div>
			<div>
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
				<span class="share-status" aria-live="polite">{shareStatus}</span>
			</div>
		</div>
		<div>
			<Cta button
				 data={ {...filterMenuCta, 
				 		 cta_icon_position: "left",
						 cta_text_light: "Search",
						 cta_icon: `${openFilterMenu === "search" ? "cancel" : "search"}`
					  } }
				 aria-expanded={openFilterMenu === "search" ? "true" : "false"}
				 on:click={toggleSearchMenu}
			/>
		</div>
	</div>
	{#if openFilterMenu != "none"}
		<div class="project-filters-wrapper" transition:slide={{ duration: 400 }}>
			<div class="project-filters-container">
				<div class="project-filters"
					 class:active={openFilterMenu != "none"}
				>
					{#each feedFilters as group}
						{#if filterMenuLabel(group.arrayOf) && (openFilterMenu === group.arrayOf || openFilterMenu === "all")}
							{#if group.filterItems.length > 0}
								<div in:fade={{ duration: 200, delay: 201 }}
									 out:fade={{ duration: 200 }}
									 class:project-filters-stacked={openFilterMenu === "all"}
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
				> span {
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
				&.active > span {
					background-color: var(--color-primary);
					&::before,
					&::after {
						background-color: var(--color-primary);
					}
				}

				&:hover > span {
					background-color: var(--color-accent);
					&::before,
					&::after {
						background-color: var(--color-accent);
					}
				}
			}
			&.button-grid {
				align-items: center;
				> span::before,
				> span::after {
					position: absolute;
					content: "";
					width: 2px;
					height: 2px;
					border-radius: 50%;
				}
				> span::before {
					left: -6px;
				}
				> span::after {
					left: 6px;
				}
			}
			&.button-table {
				width: 1.25rem;
				> span::after {
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