<script lang="ts">
	import { page } from "$app/stores";
	import {
		getNewsFiltersFromUrl,
		getProjectFiltersFromUrl,
		makeGraphqlNewsFilters,
		makeGraphqlProjectFilters,
		makeNewsFilterUrlParams,
		makeProjectFilterUrlParams
	} from "$lib/cms/filters";
	import { request } from "graphql-request";
	import { setContext, afterUpdate, onMount, tick } from 'svelte';
	import { env } from "$env/dynamic/public";
	import { afterNavigate, beforeNavigate, goto } from "$app/navigation";
	import { cmsClient, type ImageAsset } from "$lib/cms";
	import { assetUrl } from "$lib/cms/assets";

	export let headerHeight;
	export let navMenu;

	let logoHeight: number;

	let menuOpen: boolean = false;

	function toggleMenu() {
		menuOpen = !menuOpen;
	}
	function closeMenu() {
		menuOpen = false;
	}

	function onMenuButtonKeypress(event: KeyboardEvent) {
		if (event.code === "Space" || event.code === "Enter") {
			event.preventDefault();
			toggleMenu();
		}
	}

	// Breadcrumbs

	$: checkActiveRoute = (path: string): boolean => {
		return path == $page.url.pathname;
	};

	let navParentLink: string = "";
	let navParentText: string = "";
	let navParentCta: string = "Return to";

	//let showBreadcrumbs: boolean = true;

	afterNavigate(async () => {
		/*if ($page.url.pathname != "" && $page.url.pathname != "/") {
			root_links: for (let item of navMenu.nav_menu_links) {
				let link = item.nav_menu_links_id;
				if (link.link_path == $page.url.pathname) {
					// top-level navigation
					navParentLink = "/";
					navParentText = "Homepage";
					break root_links;
				}

				for (let childItem of link.link_children) {
					let childLink = childItem.nav_menu_links_child_id;
					if (childLink.link_path == $page.url.pathname) {
						navParentLink = link.link_path;
						navParentText = link.link_text;
						break root_links;
					}
				}
			}

			if (navParentLink == "") {
				navParentLink = "/";
				navParentText = "Homepage";
			}
		}*/

		if ($page.url.pathname.startsWith("/work") && $page.url.pathname != "/work") {
			navParentCta = "View more";
			let urlFilters = getProjectFiltersFromUrl($page.url.searchParams);

			let serviceSlugs = Array.from(urlFilters.serviceFilterSlugs);
			let marketSlugs = Array.from(urlFilters.marketFilterSlugs);

			console.log("url filters:", serviceSlugs[0]);

			let totalFilterCount = serviceSlugs.length + marketSlugs.length;
			if (totalFilterCount == 0) {
				navParentLink = "/work";
				navParentText = "Work";
			} else if (totalFilterCount == 1) {
				if (serviceSlugs.length > 0) {
					let serviceSlug = serviceSlugs[0];
					navParentLink = `/services/${serviceSlug}`;
					let response = await request(env.PUBLIC_DIRECTUS_API_URL, `
						query ServiceTitle {
						  services(filter:  {
						     slug: { _eq: "${serviceSlug}" }
						  }) {
						    name
						  }
						}
					`);
					navParentText = response.services[0].name;
				} else if (marketSlugs.length > 0) {
					let marketSlug = marketSlugs[0];
					navParentLink = `/markets/${marketSlug}`;
					let response = await request(env.PUBLIC_DIRECTUS_API_URL, `
						query MarketTitle {
						  markets(filter:  {
						     slug: { _eq: "${marketSlug}" }
						  }) {
						    name
						  }
						}
					`);
					navParentText = response.markets[0].name;
				}
			} else {
				navParentLink = `/work${makeProjectFilterUrlParams(urlFilters.serviceFilterSlugs, urlFilters.marketFilterSlugs)}`;
				navParentText = "Work";
			}
		}

		if ($page.url.pathname.startsWith("/services")) {
			navParentLink = "/expertise";
			navParentCta = "View more";
			navParentText = "Services";
		}

		if ($page.url.pathname.startsWith("/markets")) {
			navParentLink = "/expertise#markets";
			navParentCta = "View more";
			navParentText = "Markets";
		}
	});

	// Menu item selection
	let innerWidth: number;
	let selectedItem: number = 0;

	function selectItemOnMouseover(i: number) {
		if (innerWidth > 1000) {
			selectedItem = i; // only fire on screen width > 62.5em
		}
	}
	function selectItemOnClick(i: number, link: string, linkDirectly: boolean) {
		if (selectedItem === i || linkDirectly) {
			goto(link);
			closeMenu();
		} else {
			selectedItem = i;
		}
	}


	// Search

	type SearchResult = {
		title: string;
		subtitle: string;
		image: ImageAsset;
		link: string;
		class?: string;
	};

	let query = "";
	let searching = false;
	let error = "";
	let searchResults: SearchResult[] = [];

	function clearSearch() {
		searchResults = [];
		query = "";
	}

	async function search() {
		searching = true;
		try {
			const url = new URL($page.url);
			url.searchParams.set("query", query);
			history.replaceState(history.state, "", url);

			const res = await cmsClient.Search({ query });

			const results = [];

			// Projects
			for (const project of res.projects) {
				results.push({
					title: project.project_title ?? "",
					subtitle: `Project`,
					image: project.grid_image as ImageAsset,
					link: `/work/${project.slug}`
				});
			}

			// Markets
			for (const market of res.markets) {
				results.push({
					title: market.name ?? "",
					subtitle: `Market Overview`,
					image: market.grid_image as ImageAsset,
					link: `/markets/${market.slug}`
				});
			}

			// Services
			for (const service of res.services) {
				results.push({
					title: service.name ?? "",
					subtitle: `Service Overview`,
					image: service.grid_image as ImageAsset,
					link: `/services/${service.slug}`
				});
			}

			// Studio Locations
			for (const studioLocation of res.studio_locations) {
				results.push({
					title: studioLocation.search_name ?? "",
					subtitle: `Studio Location`,
					image: studioLocation.grid_image as ImageAsset,
					link: `/offices/${studioLocation.slug}`
				});
			}

			// Geographical Regions
			for (const geographicalRegion of res.geographical_regions) {
				results.push({
					title: geographicalRegion.search_name ?? "",
					subtitle: `Geographical Region`,
					image: geographicalRegion.grid_image as ImageAsset,
					link: `/regions/${geographicalRegion.slug}`
				});
			}

			// News Posts
			for (const newsPost of res.news_posts) {
				results.push({
					title: newsPost.post_title ?? "",
					subtitle: `News Post`,
					image: newsPost.grid_image as ImageAsset,
					link: `/news/${newsPost.slug}`
				});
			}

			// Team Members
			for (const teamMember of res.team) {
				results.push({
					title: teamMember.name ?? "",
					subtitle: `Team Member`,
					image: teamMember.headshot as ImageAsset,
					link: `/team/${teamMember.slug}`
				});
			}

			searchResults = results;
		} catch (err) {
			console.error(err);
			error = "An error occurred while searching. Please try again later.";
			searchResults = [];
		} finally {
			searching = false;
		}
	}

	onMount(() => {
		if ($page.url.searchParams.has("query")) {
			query = $page.url.searchParams.get("query") ?? "";
			if (query) {
				search();
			}
		}
	});
</script>

<template>
	<header style:--logo-height={logoHeight}>
		<div class="menu-bar" />

		<div class="logo-container" bind:offsetHeight={logoHeight} bind:offsetWidth={innerWidth}>
			<a class="logo" href="/" aria-label="Navigate to RSM Design homepage" on:click={closeMenu}>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 22.572">
					<title>RSM Design logotype</title>
					<g class="logotype" fill-rule="nonzero">
						<path d="M0 6.25h2.72v1.73h.04a3.47 3.47 0 0 1 4.2-1.84v2.63a5.56 5.56 0 0 0-1.32-.2l-.18-.02a2.75 2.75 0 0 0-2.74 2.74v5.84H0V6.25ZM14.5 9.27a2.47 2.47 0 0 0-2.13-1.11c-.72 0-1.58.34-1.58 1.15 0 1.95 5.86.37 5.86 4.6 0 2.59-2.46 3.49-4.68 3.49-1.6.1-3.15-.51-4.24-1.68l1.81-1.7a3.34 3.34 0 0 0 2.58 1.34c.8 0 1.82-.39 1.82-1.25 0-2.24-5.87-.47-5.87-4.62 0-2.43 2.17-3.5 4.37-3.5a4.7 4.7 0 0 1 3.87 1.64l-1.8 1.64ZM18.3 6.25h2.6v1.7h.03a3.46 3.46 0 0 1 3.34-1.97A3.32 3.32 0 0 1 27.67 8c.7-1.32 2.1-2.1 3.58-2.02 2.9 0 3.91 2.06 3.91 4.66v6.49h-2.71v-6.17c0-1.36-.41-2.53-2.02-2.53-1.7 0-2.34 1.4-2.34 2.8v5.9h-2.71v-6.49c0-1.33-.55-2.2-1.86-2.2-1.79 0-2.49 1.3-2.49 2.75v5.94H18.3V6.25ZM48.73 17.13h-1.5v-1.77h-.05a5.05 5.05 0 0 1-4.11 2.04h-.22a5.45 5.45 0 0 1-5.43-5.42v-.31a5.45 5.45 0 0 1 5.43-5.43l.22.01a5.05 5.05 0 0 1 4.11 2.04h.05V0h1.5v17.13Zm-5.66-1.09h.1a4.15 4.15 0 0 0 4.14-4.13l-.01-.09v-.08a4.15 4.15 0 0 0-4.13-4.13h-.2a3.95 3.95 0 0 0-3.92 3.93V12.11a3.95 3.95 0 0 0 3.93 3.93h.09ZM52.58 12.23a4 4 0 0 0 3.9 3.81 4 4 0 0 0 3.4-1.84l1.15.96a5.54 5.54 0 0 1-4.55 2.24h-.1a5.4 5.4 0 0 1-5.39-5.38V11.61a5.38 5.38 0 0 1 5.35-5.36c3.22.03 5.07 2.4 5.07 5.3v.68h-8.83Zm7.2-1.22.02-.2c0-1.76-1.45-3.2-3.21-3.2h-.25a3.75 3.75 0 0 0-3.71 3.4h7.16ZM69.53 9.04a2.47 2.47 0 0 0-2.29-1.43c-1.04 0-2.2.46-2.2 1.59 0 1 .7 1.36 2.09 1.67l1.52.37a3.04 3.04 0 0 1 2.58 2.9c0 2.3-2.06 3.26-4.13 3.26a4.64 4.64 0 0 1-4.07-2.06l1.29-.89c.58.99 1.64 1.6 2.78 1.59 1.22 0 2.5-.55 2.5-1.77 0-1.06-.91-1.43-2.02-1.7l-1.45-.34c-.72-.18-2.72-.76-2.72-2.78 0-2.2 1.93-3.2 3.92-3.2a3.69 3.69 0 0 1 3.54 1.9l-1.34.9ZM74.2 3.53c-.6 0-1.08-.5-1.1-1.09.02-.6.5-1.07 1.1-1.08.6 0 1.07.49 1.08 1.08 0 .6-.49 1.09-1.08 1.1Zm.74 13.6h-1.5V6.52h1.5v10.61ZM78.57 19.25a5.03 5.03 0 0 0 4.05 1.96c3.04 0 4.12-1.88 4.12-4.17v-1.91h-.04a4.57 4.57 0 0 1-3.97 2h-.14a5.4 5.4 0 0 1-5.38-5.38v-.19c0-2.9 2.4-5.3 5.31-5.3h.08a4.9 4.9 0 0 1 4.1 2.03h.04V6.52h1.5v10.52c0 2.31-.93 5.53-5.69 5.53-1.92.07-3.79-.71-5.09-2.14l1.1-1.18Zm4.21-3.49h.12a3.91 3.91 0 0 0 3.9-3.89v-.38c0-2.12-1.76-3.89-3.9-3.89l-.12.01a4.03 4.03 0 0 0-3.94 4v.16a4.03 4.03 0 0 0 3.94 4ZM92.34 6.52c.06.57.08 1.14.07 1.7h.05A4.28 4.28 0 0 1 96 6.25c2.7 0 3.99 1.52 3.99 4.15v6.73h-1.5v-5.87c0-2.36-.65-3.64-2.88-3.64-.3 0-3.21.2-3.21 4.07v5.44h-1.5V8.86c0-.57-.06-1.56-.1-2.33l1.53-.01Z"/>
					</g>
				</svg>
			</a>
		</div>

		<div class="nav-wrapper">
			<div class="nav-container">
				{#if navParentText != ""}
					<div class="menu-breadcrumbs">
						<a href={navParentLink}>
							{navParentCta} {navParentText}
						</a>
					</div>
				{/if}

				<button
					class="menu-button"
					class:active={menuOpen}
					aria-label="Toggle visibility of site menu"
					aria-pressed="false"
					tabindex="0"
					on:click={toggleMenu}
					on:keypress={onMenuButtonKeypress}
				>
					<div />
					<div />
					<div />
				</button>
			</div>
		</div>

		<div class="menu-wrapper" class:active={menuOpen}>
			<form on:submit|preventDefault={search}>
				{#if searchResults.length}
					<button aria-label="Clear search" on:click={clearSearch}>
						‹
					</button>
				{:else}
					<button type="submit" aria-label="Search button">
						<svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
							<rect width="10" height="2.25" transform="matrix(-0.707107 -0.707107 -0.707107 0.707107 20.6621 19.0703)" />
							<circle cx="6.875" cy="6.875" r="6.875" transform="matrix(-1 0 0 1 14.8125 1.0625)" stroke-width="2.125"/>
						</svg>
					</button>
				{/if}
				<input class:active={searchResults.length} placeholder="Search" aria-label="Search bar" bind:value={query} />
			</form>
			{#if searching}
				<div>Searching...</div>
			{:else if searchResults.length}
				<h2>Search results for “{query}”</h2>
				{#each searchResults as result}
					<a href={result.link} class="result">
						<figure>
							{#if result.image}
								<picture>
									<img src={assetUrl(result.image.filename_disk)} alt={result.image.description} />
								</picture>
							{/if}
							<figcaption>
								<span>{result.subtitle}</span>
								{result.title}
							</figcaption>
						</figure>
					</a>
				{/each}
			{:else}
				<nav style:--num-rows={navMenu.nav_menu_links.length}>
					{#each navMenu.nav_menu_links.map((c) => c?.nav_menu_links_id).filter(item => !!item.link_shows_in_menu) as item, i}
						<a
							href={item.link_path}
							class:active={selectedItem === i}
							on:mouseover|preventDefault={() => selectItemOnMouseover(i)}
							on:click|preventDefault={() => selectItemOnClick(i, item.link_path, !item.link_children.length)}
						>
							{item.link_text}
						</a>
						{#if item.link_children.length}
							<aside>
								{#each item.link_children.map((c) => c?.nav_menu_links_child_id) as child}
									<a href={child.link_path}>
										{child.link_text}
									</a>
									{#if child.link_media_image}
										<figure>
											<img 
												src={assetUrl(child.link_media_image.filename_disk)}
												alt={child.link_media_image.description}
											/>
										</figure>
									{/if}
								{/each}
							</aside>
						{/if}
						{#if item.link_media_image}
							<figure>
								<img 
									src={assetUrl(item.link_media_image.filename_disk)}
									alt={item.link_media_image.description}
								/>
							</figure>
						{/if}
					{/each}
				</nav>
			{/if}
		</div>
	</header>
</template>

<style lang="scss">
	header {
		display: contents;

		> div {
			position: sticky;
			top: 0;
			left: 0;
			width: 100%;

			height: calc(var(--GRID-CELL) * 1.75);
			margin-bottom: calc(-1 * calc(var(--GRID-CELL) * 1.75));
			//box-sizing: border-box;

			display: grid;
			grid-template-columns: var(--GRID-WRAPPER);

			pointer-events: none;

			/*	BACKGROUND
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
			// MENU BAR
			&.menu-bar {
				z-index: 3;
			}
			// LOGO
			&.logo-container {
				z-index: 4;
				//margin-top: calc(-1 * var(--SPACE-LG));
				margin-bottom: calc(-1px * var(--logo-height));
			}
			// BREADCRUMBS + MENU BUTTON
			&.nav-wrapper {
				z-index: 8;
			}
			// MENU WRAPPER
			&.menu-wrapper {
				z-index: 7;
			}
		}
	}

	div.menu-bar {
		background-color: var(--color-background, white);
		transition: background-color 0.3s ease;
	}

	div.logo-container {
		a.logo {
			grid-column: main;
			grid-row: 1;
			justify-self: start;
			align-self: center;

			pointer-events: auto;

			height: 1.25rem;
			width: 5rem;
			> svg {
				width: 100%;
				height: 94%;
				object-fit: contain;
				> .logotype {
					fill: var(--color-primary, var(--COLOR-BLACK));
					transition: fill 0.3s ease;
				}
			}

			&:hover > svg > .logotype {
				fill: var(--COLOR-ORANGE);
			}
		}
	}

	div.nav-container {
		grid-column: main;
		grid-row: 1;
		justify-self: end;
		align-self: center;

		pointer-events: auto;

		display: flex;
		column-gap: var(--SPACE-MD);

		font-size: var(--FONT-SIZE-SM);

		> div.menu-breadcrumbs > a {
			color: var(--color-primary, var(--COLOR-BLACK));
			transition: color 0.3s ease;
		}

		> button.menu-button {
			background: none;
			border: none;
			padding: 0;
			//margin: 0;
			align-self: center;

			//display: flex;
			flex-direction: column;
			justify-content: flex-end;

			cursor: pointer;

			--menu-button-width: calc(1rem * 20 / 16);

			width: var(--menu-button-width);

			> div {
				background-color: var(--color-primary, var(--COLOR-BLACK));

				width: 100%;
				height: calc(var(--menu-button-width) * 0.1);
				margin: calc(var(--menu-button-width) * 0.2) 0;

				transition: all 0.3s ease;

				&:first-of-type {
					margin-top: 0;
				}

				&:last-of-type {
					width: 62.5%;
					margin-bottom: 0;
				}
			}

			transition: transform 0.3s ease;

			&.active {
				--menu-button-transform: calc(var(--menu-button-width) * 3.333 / 16);
				//transform: translateX(var(--menu-button-transform));

				> div {
					background-color: white;
					width: 100%;

					&:first-of-type {
						transform: rotate(45deg) translateX(calc(var(--menu-button-transform)))
							translateY(calc(var(--menu-button-transform)));
					}
					&:nth-of-type(2) {
						transform: translateX(calc(var(--menu-button-transform) * 2));
						opacity: 0;
					}
					&:last-of-type {
						transform: rotate(-45deg) translateX(calc(var(--menu-button-transform)))
							translateY(calc(-1 * var(--menu-button-transform)));
					}
				}
			}

			&:hover > div,
			&.active:hover > div {
				background-color: var(--COLOR-ORANGE);
			}
		}
	}

	div.menu-wrapper {
		position: fixed;
		top: 0;
		width: 100vw;
		height: 0;
		opacity: 0;
		transition: height 0.3s ease, opacity 0.3s ease;

		&.active {
			visibility: visible;
			height: 100vh;
			opacity: 1;
		}

		background-color: var(--COLOR-BLACK);
		color: white;
		overflow-y: scroll;
		display: grid;
		grid-template-columns: var(--GRID-WRAPPER);
		row-gap: var(--SPACE-LG);
		align-content: start;

		pointer-events: auto;

		padding: 0;

		> div {
			grid-column: main;
		}

		> form {
			grid-column: eighth-start 1 / eighth-end 5;
			@media (max-width: 62.5em) {
				grid-column: third-start 1 / third-end 2;
			}
			grid-row: 1;
			display: flex;
			//width: 100%;
			height: calc(var(--GRID-CELL) * 1.75);
			align-items: center;

			> button {
				width: auto;
				background: transparent;
				margin: 0;
				padding: 0 0.5em 0 0;
				border: 0;
				border-radius: 0;
				color: white;
				transition: color 0.3s ease;
				font-weight: 300;
				font-size: var(--FONT-SIZE-XL);
				line-height: 0;
				> svg {
					margin-top: 0.111em;
					height: calc(var(--GRID-CELL) * 0.618);
					width: auto;
					rect {
						fill: white;
						transition: fill 0.3s ease;
					}
					circle {
						stroke: white;
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
				max-width: 100%;
				padding: 0;
				color: white;
				font-size: var(--FONT-SIZE-LG);
				caret-color: var(--COLOR-MID-GRAY);

				&::placeholder {
					color: white;
					font-size: var(--FONT-SIZE-LG);
				}

				&.active {
					color: var(--COLOR-ORANGE);
				}
			}
		}

		> h2 {
			grid-column: main;
			margin: 0 0 calc(-1 * var(--SPACE-MD));
			font-size: var(--FONT-SIZE-XXXL);
		}

		> a {
			&:nth-of-type(3n+1) {
				grid-column: sixth-start 1 / sixth-end 2;
			}
			&:nth-of-type(3n+2) {
				grid-column: sixth-start 3 / sixth-end 4;
			}
			&:nth-of-type(3n) {
				grid-column: sixth-start 5 / sixth-end 6;
			}

			@media (max-width: 62.5em) {
				&:nth-of-type(3n+1) {
					grid-column: third-start 1 / third-end 1;
				}
				&:nth-of-type(3n+2) {
					grid-column: third-start 2 / third-end 2;
				}
				&:nth-of-type(3n) {
					grid-column: third-start 3 / third-end 3;
				}
			}

			@media (max-width: 31.25em) {
				&:nth-of-type(n) {
					grid-column: main;
				}
			}

			> figure {
				margin: 0;
				padding: 0;
				display: grid;

				> picture {
					aspect-ratio: 1 / 1;
					overflow: hidden;
					margin-bottom: var(--SPACE-SM);

					> img {
						object-fit: cover;
						height: 100%;
						width: 100%;
						max-width: 100%;
						transform: scale(1);
						transition: transform 0.75s ease;
					}
				}

				> figcaption {
					font-size: var(--FONT-SIZE-LG);

					> span {
						display: block;
						font-size: var(--FONT-SIZE-SM);
						text-transform: uppercase;
						letter-spacing: 0.05em;
					}
				}
			}

			&:hover > figure > picture > img {
				transform: scale(1.05);

				@media (max-width: 46.875em) {
					transform: scale(1);
				}
			}
		}

		> nav {
			//margin-top: var(--SPACE-LG);
			grid-column: eighth-start 1 / eighth-end 5;
			@media (max-width: 62.5em) {
				grid-column: third-start 1 / third-end 2;
			}
			display: grid;
			grid-template-columns: subgrid;
			@media (max-width: 31.25em) {
				grid-column: main;
				grid-template-columns: 1fr var(--GRID-CELL) 1fr;
			}
			row-gap: var(--SPACE-SM);
			position: relative;

			> a {
				grid-column: eighth-start 1 / eighth-end 2;
				@media (max-width: 62.5em) {
					grid-column: third-start 1 / third-end 1;
				}
				@media (max-width: 31.25em) {
					grid-column: 1 / span 1;
				}
				font-size: var(--FONT-SIZE-XXL);
				color: var(--COLOR-DIM-GRAY);

				&:hover {
					color: var(--COLOR-ORANGE);
				}

				&.active {
					color: white;

					+ aside {
						opacity: 1;
					}
				}

				+ aside {
					opacity: 0;
					grid-row: 1 / var(--num-rows);
					grid-column: eighth-start 3 / eighth-end 5;
					@media (max-width: 62.5em) {
						grid-column: third-end 1 / half-end 1;
					}
					@media (max-width: 31.25em) {
						grid-column: 3 / span 1;
					}

					display: flex;
					flex-direction: column;
					row-gap: var(--SPACE-MD);

					padding-top: 0.333em;

					font-size: var(--FONT-SIZE-XL);
				}

				+ figure,
				+ aside + figure,
				+ aside > a + figure {
					position: fixed;
					top: 0;
					left: 0;
					width: 100vw;
					height: 100vh;
					margin: 0;
					pointer-events: none;

					display: grid;
					grid-template-columns: var(--GRID-WRAPPER);

					@media (max-width: 31.25em) {
						display: none;
					}

					opacity: 0;
					transition: opacity 0.3s ease;

					> img {
						width: 100%;
						height: 100%;
						object-fit: cover;
					}
				}
				+ figure {
					> img {
						grid-column: sixth-start 3 / viewport-end;
						@media (max-width: 62.5em) {
							grid-column: half-start 2 / viewport-end;
						}
					}
				}
				+ aside + figure,
				+ aside > a + figure {
					> img {
						grid-column: eighth-start 6 / viewport-end;
						@media (max-width: 62.5em) {
							grid-column: half-start 2 / viewport-end;
						}
					}
				}
				&:hover,
				+ aside > a:hover {
					+ figure,
					+ aside + figure {
						opacity: 1;
					}
				}
			}
		}
	}
</style>