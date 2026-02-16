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
	import { afterNavigate, beforeNavigate } from "$app/navigation";

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

	$: checkActiveRoute = (path: string): boolean => {
		return path == $page.url.pathname;
	};

	let navParentLink: string = "";
	let navParentText: string = "";
	let navParentCta: string = "Return to";

	afterNavigate(async () => {
		if ($page.url.pathname != "" && $page.url.pathname != "/") {
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
		}

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
</script>

<template>
	<header style:--logo-height={logoHeight}>
		<div class="menu-bar" />

		<div class="logo-container" bind:offsetHeight={logoHeight}>
			<a class="logo" href="/" aria-label="Navigate to homepage">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 22.572">
					<g class="logotype" fill-rule="nonzero">
						<path d="M0 6.25h2.72v1.73h.04a3.47 3.47 0 0 1 4.2-1.84v2.63a5.56 5.56 0 0 0-1.32-.2l-.18-.02a2.75 2.75 0 0 0-2.74 2.74v5.84H0V6.25ZM14.5 9.27a2.47 2.47 0 0 0-2.13-1.11c-.72 0-1.58.34-1.58 1.15 0 1.95 5.86.37 5.86 4.6 0 2.59-2.46 3.49-4.68 3.49-1.6.1-3.15-.51-4.24-1.68l1.81-1.7a3.34 3.34 0 0 0 2.58 1.34c.8 0 1.82-.39 1.82-1.25 0-2.24-5.87-.47-5.87-4.62 0-2.43 2.17-3.5 4.37-3.5a4.7 4.7 0 0 1 3.87 1.64l-1.8 1.64ZM18.3 6.25h2.6v1.7h.03a3.46 3.46 0 0 1 3.34-1.97A3.32 3.32 0 0 1 27.67 8c.7-1.32 2.1-2.1 3.58-2.02 2.9 0 3.91 2.06 3.91 4.66v6.49h-2.71v-6.17c0-1.36-.41-2.53-2.02-2.53-1.7 0-2.34 1.4-2.34 2.8v5.9h-2.71v-6.49c0-1.33-.55-2.2-1.86-2.2-1.79 0-2.49 1.3-2.49 2.75v5.94H18.3V6.25ZM48.73 17.13h-1.5v-1.77h-.05a5.05 5.05 0 0 1-4.11 2.04h-.22a5.45 5.45 0 0 1-5.43-5.42v-.31a5.45 5.45 0 0 1 5.43-5.43l.22.01a5.05 5.05 0 0 1 4.11 2.04h.05V0h1.5v17.13Zm-5.66-1.09h.1a4.15 4.15 0 0 0 4.14-4.13l-.01-.09v-.08a4.15 4.15 0 0 0-4.13-4.13h-.2a3.95 3.95 0 0 0-3.92 3.93V12.11a3.95 3.95 0 0 0 3.93 3.93h.09ZM52.58 12.23a4 4 0 0 0 3.9 3.81 4 4 0 0 0 3.4-1.84l1.15.96a5.54 5.54 0 0 1-4.55 2.24h-.1a5.4 5.4 0 0 1-5.39-5.38V11.61a5.38 5.38 0 0 1 5.35-5.36c3.22.03 5.07 2.4 5.07 5.3v.68h-8.83Zm7.2-1.22.02-.2c0-1.76-1.45-3.2-3.21-3.2h-.25a3.75 3.75 0 0 0-3.71 3.4h7.16ZM69.53 9.04a2.47 2.47 0 0 0-2.29-1.43c-1.04 0-2.2.46-2.2 1.59 0 1 .7 1.36 2.09 1.67l1.52.37a3.04 3.04 0 0 1 2.58 2.9c0 2.3-2.06 3.26-4.13 3.26a4.64 4.64 0 0 1-4.07-2.06l1.29-.89c.58.99 1.64 1.6 2.78 1.59 1.22 0 2.5-.55 2.5-1.77 0-1.06-.91-1.43-2.02-1.7l-1.45-.34c-.72-.18-2.72-.76-2.72-2.78 0-2.2 1.93-3.2 3.92-3.2a3.69 3.69 0 0 1 3.54 1.9l-1.34.9ZM74.2 3.53c-.6 0-1.08-.5-1.1-1.09.02-.6.5-1.07 1.1-1.08.6 0 1.07.49 1.08 1.08 0 .6-.49 1.09-1.08 1.1Zm.74 13.6h-1.5V6.52h1.5v10.61ZM78.57 19.25a5.03 5.03 0 0 0 4.05 1.96c3.04 0 4.12-1.88 4.12-4.17v-1.91h-.04a4.57 4.57 0 0 1-3.97 2h-.14a5.4 5.4 0 0 1-5.38-5.38v-.19c0-2.9 2.4-5.3 5.31-5.3h.08a4.9 4.9 0 0 1 4.1 2.03h.04V6.52h1.5v10.52c0 2.31-.93 5.53-5.69 5.53-1.92.07-3.79-.71-5.09-2.14l1.1-1.18Zm4.21-3.49h.12a3.91 3.91 0 0 0 3.9-3.89v-.38c0-2.12-1.76-3.89-3.9-3.89l-.12.01a4.03 4.03 0 0 0-3.94 4v.16a4.03 4.03 0 0 0 3.94 4ZM92.34 6.52c.06.57.08 1.14.07 1.7h.05A4.28 4.28 0 0 1 96 6.25c2.7 0 3.99 1.52 3.99 4.15v6.73h-1.5v-5.87c0-2.36-.65-3.64-2.88-3.64-.3 0-3.21.2-3.21 4.07v5.44h-1.5V8.86c0-.57-.06-1.56-.1-2.33l1.53-.01Z"/>
					</g>
				</svg>
			</a>
		</div>

		<div class="nav-wrapper">
			<div class="nav-container">
				<div class="menu-breadcrumbs">
					<a href={navParentLink}>
						{navParentCta} {navParentText}
					</a>
				</div>

				<div
					class="menu-button"
					class:active={menuOpen}
					aria-label="Toggle menu"
					role="button"
					aria-pressed="false"
					tabindex="0"
					on:click={toggleMenu}
					on:keypress={onMenuButtonKeypress}
				>
					<div />
					<div />
					<div />
				</div>
			</div>
		</div>

		<nav class="menu-wrapper" class:active={menuOpen}>
			<ul>
				{#each navMenu.nav_menu_links as item}
					{@const link = item.nav_menu_links_id}
					<li><a class:active={checkActiveRoute(link.link_path)} href={link.link_path} on:click={toggleMenu}>{link.link_text}</a></li>
				{/each}
			</ul>
		</nav>
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
			&:first-of-type {
				z-index: 3;
			}
			// LOGO
			&:nth-of-type(2) {
				z-index: 4;
				//margin-top: calc(-1 * var(--SPACE-LG));
				margin-bottom: calc(-1px * var(--logo-height));
			}
			// BREADCRUMBS + MENU BUTTON
			&:last-of-type {
				z-index: 8;
			}
		}
		> nav.menu-wrapper {
			z-index: 7;
		}
	}

	div.menu-bar {
		background: var(--bg-color, white);
	}

	div.logo-container {
		a.logo {
			grid-column: main;
			grid-row: 1;
			justify-self: start;
			align-self: center;

			height: 1.25rem;
			width: 5rem;
			> svg {
				width: 100%;
				height: 94%;
				object-fit: contain;
				> .logotype {
					fill: var(--text-color, var(--COLOR-BLACK));
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

		display: flex;
		column-gap: var(--SPACE-MD);

		font-size: var(--FONT-SIZE-SM);

		> div.menu-button {
			align-self: center;

			//display: flex;
			flex-direction: column;
			justify-content: flex-end;

			cursor: pointer;

			--menu-button-width: calc(1rem * 20 / 16);

			width: var(--menu-button-width);

			> div {
				background-color: var(--text-color, var(--COLOR-BLACK));

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

	nav.menu-wrapper {
		position: absolute;
		top: 0;
		width: 100vw;
		height: 0;
		opacity: 0;
		transition: height 0.3s ease, opacity 0.3s ease;

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
		z-index: 7;

		&.active {
			visibility: visible;
			height: 100vh;
			opacity: 1;
		}

		background-color: var(--COLOR-BLACK);
		overflow-y: scroll;
		display: flex;
		justify-content: flex-start;
		align-items: center;

		padding: 0;
		@media (max-width: 62.5em) {
			padding: 0;
		}

		> ul {
			margin: 0 0 0 5vw;
			@media (max-width: 62.5em) {
				margin: 0 0 0 2vw;
			}
			> li {
				font-size: var(--FONT-SIZE-XXL);
				@media (max-width: 46.875em) {
					font-size: 2rem;
				}
				font-weight: 700;
				margin: 0.4em 0 0.4em -4vw;
				opacity: 0;
				transition: margin-left 0.6s ease, opacity 0.6s ease;
				a {
					color: white;
					transition: color 0.3s ease;
					&:hover {
						color: var(--COLOR-MID-GRAY);
					}

					position: relative;
					&::after {
						content: "›";
						position: absolute;
						top: calc(var(--FONT-SIZE-XXL) * 0.76);
						font-size: var(--FONT-SIZE-XXXL);
						@media (max-width: 46.875em) {
							top: calc(2rem * 0.76);
							font-size: 2.6rem;
						}
						font-weight: 300;
						line-height: 0;
						color: var(--COLOR-ORANGE);

						margin-left: 0;
						opacity: 0;
						transition: margin-left 0.3s, opacity 0.3s;
					}

					&:hover::after {
						margin-left: 0.333em;
						opacity: 1;
					}
				}
			}
		}

		&.active > ul > li {
			margin-left: 0;
			opacity: 1;

			@for $i from 1 through 10 {
				&:nth-of-type(#{$i}) {
					transition-delay: #{0.15 * $i}s;
				}
			}
		}
	}
</style>