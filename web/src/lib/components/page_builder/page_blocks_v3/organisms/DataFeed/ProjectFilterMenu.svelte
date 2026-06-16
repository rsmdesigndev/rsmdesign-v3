<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { request } from "graphql-request";
	import { env } from "$env/dynamic/public";
	import { slide, fade } from "svelte/transition";
	import Cta, { type CtaData } from "../../atoms/Cta.svelte";

	let filterView: "Grid" | "Table" = "Grid";
	$: filterMenuOpen = "none";
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

	function toggleFilterMenu(item: string) {
		if (item === filterMenuOpen) {
			filterMenuOpen = "none";
		} else {
			filterMenuOpen = item;
			loadFilters();
		}
	}

	export let serviceFilters: string[] = [];
	export let marketFilters: string[] = [];

	const dispatch = createEventDispatcher();
	function toggleFilter(type: string, item: string) {
		if (!item) {
			return;
		} else {
			const itemString: string = `"${item}"`;
			if (type === "service") {
				const index = serviceFilters.indexOf(itemString);
				if (index > -1) {
					serviceFilters.splice(index, 1);
				} else {
					serviceFilters.push(itemString);
				}
				serviceFilters = serviceFilters;
				dispatch('updateFilters');
			} else if (type === "market") {
				const index = marketFilters.indexOf(itemString);
				if (index > -1) {
					marketFilters.splice(index, 1);
				} else {
					marketFilters.push(itemString);
				}
				marketFilters = marketFilters;
				dispatch('updateFilters');
			}
		}
	}

	// Load more functionality
	$: services = [];
	let servicesLoaded: boolean = false;
	let servicesQuery = `
		query Services {
			services(filter: { visibility: { _nin: ["draft", "archived", "visibleExceptFilters"] } }) {
				filter_button_name
			}
		}
	`;

	$: markets = [];
	let marketsLoaded: boolean = false;
	let marketsQuery = `
		query Markets {
			markets(filter: { visibility: { _nin: ["draft", "archived", "visibleExceptFilters"] } }) {
				filter_button_name
			}
		}
	`;

	$: locations = [];
	$: collaborators = [];

	const loadFilters = async () => {
		switch (filterMenuOpen) {
			case "services": {
				if (!servicesLoaded) {
					let response = await request(env.PUBLIC_DIRECTUS_API_URL, servicesQuery);

					if (response) {
						services.push(...response.services);
						services = services;
					}

					servicesLoaded = true;
				}
				break;
			}
			case "markets": {
				if (!marketsLoaded) {
					let response = await request(env.PUBLIC_DIRECTUS_API_URL, marketsQuery);

					if (response) {
						markets.push(...response.markets);
						markets = markets;
					}

					marketsLoaded = true;
				}
				break;
			}
			case "locations": {}
			case "collaborators": {}
		}
	}

	function search() {
		console.log("searched");
	}
</script>

<template>
	<div class="project-filter-menu-container">
		<div>
			<div>
				<button 
					class="button-icon button-grid"
					class:active={filterView === "Grid"}
					aria-label="Display results as a grid"
				>
					<div />
					<div />
					<div />
				</button>
				<button 
					class="button-icon button-table"
					class:active={filterView === "Table"}
					aria-label="Display results as a table"
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
							 cta_icon: `${filterMenuOpen === "services" ? "arrow_up" : "arrow_down"}`
						  } }
					 on:click={() => toggleFilterMenu("services")}
				/>
				<Cta button
					 data={ {...filterMenuCta, 
							 cta_text_light: "Market",
							 cta_icon: `${filterMenuOpen === "markets" ? "arrow_up" : "arrow_down"}`
						  } }
					 on:click={() => toggleFilterMenu("markets")}
				/>
				<!--<Cta button
					 data={ {...filterCta, 
							 cta_text_light: "Location",
							 cta_icon: `${filterMenuOpen === "locations" ? "arrow_up" : "arrow_down"}`
						  } }
					 on:click={() => toggleFilterMenu("locations")}
				/>
				<Cta button
					 data={ {...filterCta, 
							 cta_text_light: "Collaborator",
							 cta_icon: `${filterMenuOpen === "collaborators" ? "arrow_up" : "arrow_down"}`
						  } }
					 on:click={() => toggleFilterMenu("collaborators")}
				/>-->
			</div>
		</div>
		<form on:submit|preventDefault={search}>
			<input placeholder="Search" aria-label="Search bar" />
			<button type="submit" aria-label="Search button">
				<svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect width="10" height="2.25" transform="matrix(-0.707107 -0.707107 -0.707107 0.707107 20.6621 19.0703)" />
					<circle cx="6.875" cy="6.875" r="6.875" transform="matrix(-1 0 0 1 14.8125 1.0625)" stroke-width="2.125"/>
				</svg>
			</button>
		</form>
	</div>
	{#if filterMenuOpen != "none"}
		<div class="project-filters-wrapper" transition:slide={{ duration: 400 }}>
			<div class="project-filters-container">
				<div class="project-filters"
					 class:active={filterMenuOpen === "markets"}				 
				>
					{#if filterMenuOpen === "services"}
						{#if servicesLoaded}
							<div in:fade={{ duration: 100, delay: 101 }}
								 out:fade={{ duration: 100 }}
							>
								{#each services as item}
									<div>
										<Cta button
											 data={ {...filterCta, 
													 cta_text_light: item.filter_button_name,
													 cta_icon: `${serviceFilters.indexOf(`"${item.filter_button_name}"`) > -1 ? "dot_solid" : "dot_empty"}`
												  } }
											 on:click={() => toggleFilter("service", item.filter_button_name)}
										/>
									</div>
								{/each}
							</div>
						{:else}
							<p>Loading…</p>
						{/if}
					{:else if filterMenuOpen === "markets"}
						{#if marketsLoaded}
							<div in:fade={{ duration: 100, delay: 101 }}
								 out:fade={{ duration: 100 }}
							>
								{#each markets as item}
									<div>
										<Cta button
											 data={ {...filterCta, 
													 cta_text_light: item.filter_button_name,
													 cta_icon: `${marketFilters.indexOf(`"${item.filter_button_name}"`) > -1 ? "dot_solid" : "dot_empty"}`
												  } }
											 on:click={() => toggleFilter("market", item.filter_button_name)}
										/>
									</div>
								{/each}
							</div>
						{:else}
							<p>Loading…</p>
						{/if}
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

		@media (max-width: 62.5em) {
			display: none;
		}

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

		> form {
			display: flex;
			//width: 100%;
			align-items: center;

			> button {
				width: auto;
				background: transparent;
				margin: 0;
				padding: 0;
				border: 0;
				border-radius: 0;
				color: var(--color-primary);
				transition: color 0.3s ease;
				font-weight: 300;
				font-size: var(--FONT-SIZE-XL);
				line-height: 0;
				> svg {
					margin-top: 0.111em;
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
					color: var(--COLOR-ORANGE);
					> svg {
						rect {
							fill: var(--COLOR-ORANGE);
						}
						circle {
							stroke: var(--COLOR-ORANGE);
						}
					}
				}
			}
			> input {
				background: none;
				border: none;
				border-bottom: 1px solid var(--color-primary);
				max-width: 100%;
				padding: 0;
				color: var(--color-primary);
				font-size: var(--FONT-SIZE-MD);
				font-weight: 300;
				caret-color: var(--COLOR-MID-GRAY);

				&::placeholder {
					color: var(--color-primary);
					font-size: var(--FONT-SIZE-MD);
					font-weight: 300;
				}

				&.active {
					color: var(--COLOR-ORANGE);
				}
			}
		}
	}
	.project-filters-wrapper {
		grid-column: viewport;

		display: grid;
		grid-template-columns: subgrid;

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
					grid-column: 1 / -1;
					display: grid;
					grid-template-columns: repeat(4, 1fr);
					grid-auto-flow: row dense;
					column-gap: var(--SPACE-MD);
					row-gap: 1rem;

					> p {
						font-size: var(--FONT-SIZE-SM);
						line-height: 1.333;
						margin-bottom: 0;
					}
				}
			}
		}
	}
</style>