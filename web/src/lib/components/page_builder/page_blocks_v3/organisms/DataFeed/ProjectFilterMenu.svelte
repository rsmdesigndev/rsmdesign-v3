<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { request } from "graphql-request";
	import { env } from "$env/dynamic/public";
	import { generateQuery } from "$lib/cms/dataFeed/dataFeedQueries";
	import { standardizeFilterPropertyNames, indexOfFilterItem, toggleFilterItem, type FilterItem } from "$lib/cms/dataFeed/dataFeedFilters";
	import { slide, fade } from "svelte/transition";
	import Cta, { type CtaData } from "../../atoms/Cta.svelte";

	export let serviceFilters: FilterItem[] = [];
	export let marketFilters: FilterItem[] = [];
	export let feedView: "Grid" | "Table" | "Ticker Tape" = "Grid";

	// Load filters
	$: services = [];
	$: markets = [];
	$: locations = [];
	$: collaborators = [];

	const loadFilters = async () => {
		const servicesQuery = generateQuery("services");
		const marketsQuery = generateQuery("markets");
		
		let servicesResponse = await request(env.PUBLIC_DIRECTUS_API_URL, servicesQuery);
		if (servicesResponse) {
			services.push(...servicesResponse.services);
			services = standardizeFilterPropertyNames("services", services);
		}

		let marketsResponse = await request(env.PUBLIC_DIRECTUS_API_URL, marketsQuery);
		if (marketsResponse) {
			markets.push(...marketsResponse.markets);
			markets = standardizeFilterPropertyNames("markets", markets);
		}
	}

	onMount(() => {
		loadFilters();
	});

	function search() {
		console.log("searched");
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

	const dispatch = createEventDispatcher();
	// Reactive so that the filter icons update whenever a filter is toggled
	$: indexOfFilter = (type: string, item: FilterItem): number => {
		if (type === "service") {
			return indexOfFilterItem(serviceFilters, item);
		} else if (type === "market") {
			return indexOfFilterItem(marketFilters, item);
		} else {
			return -1;
		}
	}

	function toggleFilter(type: string, item: FilterItem) {
		if (!item) {
			return;
		} else {
			if (type === "service") {
				serviceFilters = toggleFilterItem(serviceFilters, item);
			} else if (type === "market") {
				marketFilters = toggleFilterItem(marketFilters, item);
			}
			dispatch('updateFilters');
		}
	}

	function toggleFeedView(view: string) {
		if (view != feedView) {
			feedView = view;
			dispatch('updateFilters');
		}
	}

	// CTAs
	const filterMenuCta = {
		cta_type: "link",
		cta_size: "md",
		cta_style: "light",
		cta_hover_highlight: "light"
	}

	const filterCta = {
		cta_type: "link",
		cta_size: "sm",
		cta_style: "light",
		cta_hover_highlight: "light",
		cta_icon_position: "left"
	}
</script>

<template>
	<div 
		class="project-filter-menu-container"
	>
		<div>
			<div>
				<button 
					class="button-icon button-grid"
					class:active={feedView === "Grid"}
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
					aria-label="Display results as a table"
					on:click={() => toggleFeedView("Table")}
				>
					<div />
					<div />
					<div />
				</button>
			</div>
			<div>
				<Cta button
					 data={ {...filterMenuCta, 
							 cta_text_light: "Service",
							 cta_icon: `${openFilterMenu === "services" ? "arrow_up" : "arrow_down"}`
						  } }
					 on:click={() => toggleFilterMenu("services")}
				/>
				<Cta button
					 data={ {...filterMenuCta, 
							 cta_text_light: "Market",
							 cta_icon: `${openFilterMenu === "markets" ? "arrow_up" : "arrow_down"}`
						  } }
					 on:click={() => toggleFilterMenu("markets")}
				/>
				<!--<Cta button
					 data={ {...filterCta, 
							 cta_text_light: "Location",
							 cta_icon: `${openFilterMenu === "locations" ? "arrow_up" : "arrow_down"}`
						  } }
					 on:click={() => toggleFilterMenu("locations")}
				/>
				<Cta button
					 data={ {...filterCta, 
							 cta_text_light: "Collaborator",
							 cta_icon: `${openFilterMenu === "collaborators" ? "arrow_up" : "arrow_down"}`
						  } }
					 on:click={() => toggleFilterMenu("collaborators")}
				/>-->
				<Cta button
					 data={ {...filterMenuCta, 
							 cta_text_light: "Filter",
							 cta_icon: `${openFilterMenu === "all" ? "arrow_up" : "arrow_down"}`
						  } }
					 on:click={() => toggleFilterMenu("all")}
				/>
			</div>
		</div>
		<div>
			<Cta button
				 data={ {...filterMenuCta, 
				 		 cta_icon_position: "left",
						 cta_text_light: "Search",
						 cta_icon: `${openFilterMenu === "search" ? "cancel" : "search"}`
					  } }
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
					{#if openFilterMenu === "services" || openFilterMenu === "all"}
						{#if services}
							<div in:fade={{ duration: 200, delay: 201 }}
								 out:fade={{ duration: 200 }}
								 class:project-filters-stacked={openFilterMenu === "all"}
							>
								<h2>Services</h2>
								{#each services as item}
									<div>
										<Cta button
											 data={ {...filterCta, 
													 cta_text_light: item.name
												  } }
											 iconOverride={indexOfFilter("service", item) > -1 ? "dot_solid" : "dot_empty"}
											 on:click={() => toggleFilter("service", item)}
										/>
									</div>
								{/each}
							</div>
						{:else}
							<p>Loading…</p>
						{/if}
					{/if}
					{#if openFilterMenu === "markets" || openFilterMenu === "all"}
						{#if markets}
							<div in:fade={{ duration: 200, delay: 201 }}
								 out:fade={{ duration: 200 }}
								 class:project-filters-stacked={openFilterMenu === "all"}
							>
								<h2>Markets</h2>
								{#each markets as item}
									<div>
										<Cta button
											 data={ {...filterCta, 
													 cta_text_light: item.name,
													 cta_icon: `${indexOfFilter("market", item) > -1 ? "dot_solid" : "dot_empty"}`
												  } }
											 on:click={() => toggleFilter("market", item)}
										/>
									</div>
								{/each}
							</div>
						{:else}
							<p>Loading…</p>
						{/if}
					{/if}
					{#if openFilterMenu === "search"}
						<div class="search">
							<form on:submit|preventDefault={search}>
								<button type="submit" aria-label="Search button">
									<svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
										<rect width="10" height="2.25" transform="matrix(-0.707107 -0.707107 -0.707107 0.707107 20.6621 19.0703)" />
										<circle cx="6.875" cy="6.875" r="6.875" transform="matrix(-1 0 0 1 14.8125 1.0625)" stroke-width="2.125"/>
									</svg>
								</button>
								<input placeholder="Project name, location, etc…" aria-label="Search bar" autofocus />
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