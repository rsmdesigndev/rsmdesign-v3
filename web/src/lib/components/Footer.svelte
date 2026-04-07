<script lang="ts">
	import { animate, AnimateTrigger } from "$lib/animate";
	import Cta, { type CtaData } from "./page_builder/page_blocks_v3/atoms/Cta.svelte";

	export let navMenu;

	const footerNavCta = {
		cta_type: "link",
		cta_size: "lg",
		cta_icon: "arrow_right",
		cta_icon_position: "left",
		cta_style: "light",
		cta_hover_highlight: "light"
	}
</script>

<template>
	<div id="bg-color-footer"
		 class="bg-color"
		 style:--color-background="#1a1818"
	/>

	<footer id="footer">
		<div class="bg-color-trigger"
			 use:animate={ { trigger: AnimateTrigger.WhileScrollingInView, targetSelector: "#bg-color-footer", animClass: "bg-color-animate" } }
		/>
		<div class="bg-color-trigger"
			 use:animate={ { trigger: AnimateTrigger.WhileScrollingInView, targetSelector: `#footer`, animClass: "footer-opacity-animate" } }
		/>
		<div class="bg-color-trigger"
			 use:animate={ { trigger: AnimateTrigger.WhileScrollingInView, targetSelector: "#menu-bar-footer", animClass: "bg-color-animate" } }
		/>

		<a class="footer-logo" href="/">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
				<g class="logomark" fill-rule="nonzero">
					<path d="M49.8 72.14c-3.72 0-6.92-.95-9.38-3.7l4.01-3.76c1.55 1.7 3.16 2.96 5.71 2.96 1.76 0 4.01-.86 4.01-2.76 0-4.96-12.98-1.05-12.98-10.23 0-5.36 4.81-7.76 9.67-7.76 3.21 0 6.62 1 8.57 3.66l-4 3.6a5.46 5.46 0 0 0-4.72-2.45c-1.6 0-3.5.75-3.5 2.55 0 4.31 12.97.8 12.97 10.18 0 5.7-5.46 7.71-10.37 7.71M38.72 53.05a12.07 12.07 0 0 0-2.9-.45 6.05 6.05 0 0 0-6.47 6.06v12.88h-6.02V47.5h6.02v3.8h.1a7.66 7.66 0 0 1 7.11-4.4 7.63 7.63 0 0 1 2.16.35zm53.46 23.8a54.3 54.3 0 0 0 1.8-3.02A13.87 13.87 0 0 0 95 70.12q.05-.37.1-.61V57.9c0-3-.9-5.6-4.46-5.6-3.76 0-5.16 3.1-5.16 6.2v13.03h-6.02V57.22c0-2.96-1.2-4.92-4.1-4.92-3.97 0-5.52 2.91-5.52 6.12v13.13h-6.01V47.49h5.7v3.76h.1A7.64 7.64 0 0 1 77 46.89c3.71 0 6.27 1.45 7.52 4.46a8.37 8.37 0 0 1 7.92-4.46c3.93 0 6.28 1.71 7.53 4.36.01-.42.04-.83.04-1.25A50 50 0 0 0 50 0 50 50 0 0 0 0 50a50 50 0 0 0 50 50 49.96 49.96 0 0 0 42.16-23.15z"/>
				</g>
			</svg>
		</a>

		<div class="footer-col1">
			<article>
				<a href="/project-inquiry">Project inquiries</a>
				<p>Stephanie Wills</p>
				<!--HubSpot Call-to-Action Code -->
				<span class="hs-cta-wrapper" id="hs-cta-wrapper-83a3f126-b26c-4061-81d0-9079a980aa15">
					<span class="hs-cta-node hs-cta-83a3f126-b26c-4061-81d0-9079a980aa15" id="hs-cta-83a3f126-b26c-4061-81d0-9079a980aa15">
						<!--[if lte IE 8]><div id="hs-cta-ie-element"></div><![endif]-->
						<a href="https://cta-redirect.hubspot.com/cta/redirect/8650991/83a3f126-b26c-4061-81d0-9079a980aa15" >
							stephanie@rsmdesign.com
						</a>
					</span>
					<script charset="utf-8" src="https://js.hscta.net/cta/current.js"></script>
					<script type="text/javascript"> hbspt.cta.load(8650991, '83a3f126-b26c-4061-81d0-9079a980aa15', {"region":"na1"}); </script>
				</span>
				<!-- end HubSpot Call-to-Action Code -->
				<a href="tel:+13032239845">303.223.9845</a>
			</article>

			<nav>
				{#each navMenu.nav_menu_links.map((c) => c?.nav_menu_links_id).filter(item => !!item.link_shows_in_footer) as item}
					<Cta data={ {...footerNavCta, 
									cta_text_light: item.link_text,
									cta_link: item.link_path
							  } }
					/>
				{/each}
			</nav>
		</div>

		<div class="footer-col2">
			<article>
				<a href="/offices/san-clemente">San Clemente</a>
				<p>160 Avenida Cabrillo <br/>San Clemente, CA 97672</p>
				<a href="tel:+19494929479">949.492.9479</a>
			</article>
			<article class="dallas">
				<a href="/offices/dallas">Dallas</a>
				<p>408 West 8th Street, Suite 206 <br/>Dallas, TX 75208</p>
				<a href="tel:+19729743690">972.974.3690</a>
			</article>
			<article>
				<a href="/offices/los-angeles">Los Angeles</a>
				<p>55 Auburn Avenue, Suite A <br/>Sierra Madre, CA 91024</p>
				<a href="tel:+12137059006">213.705.9006</a>
			</article>
			<article>
				<a href="/offices/new-york">New York</a>
				<p>36 East 23rd Street, Suite 10F <br/>New York, NY 10010</p>
				<a href="tel:+12129382793">212.938.2793</a>
			</article>
		</div>
					
		<div class="footer-bottom">
			<div class="social-icons">
				<a href="https://www.instagram.com/rsmdesign" target="_blank">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 417 417">
						<g class="social-icon" fill-rule="nonzero">
							<path d="M208.332 37.538c55.627 0 62.216.213 84.186 1.215 20.312.927 31.342 4.32 38.684 7.173a64.543 64.543 0 0 1 23.954 15.584 64.561 64.561 0 0 1 15.585 23.954c2.853 7.341 6.247 18.372 7.173 38.685 1.002 21.968 1.215 28.557 1.215 84.186 0 55.628-.213 62.215-1.215 84.186-.927 20.312-4.321 31.342-7.173 38.684a69.025 69.025 0 0 1-39.539 39.538c-7.341 2.853-18.372 6.247-38.684 7.173-21.964 1.003-28.553 1.215-84.186 1.215-55.633 0-62.219-.212-84.186-1.215-20.312-.927-31.342-4.321-38.684-7.173a64.539 64.539 0 0 1-23.954-15.584 64.547 64.547 0 0 1-15.584-23.954c-2.854-7.341-6.247-18.372-7.174-38.684-1.002-21.968-1.214-28.558-1.214-84.186 0-55.629.212-62.216 1.214-84.186.927-20.313 4.32-31.343 7.174-38.685a64.565 64.565 0 0 1 15.585-23.955 64.555 64.555 0 0 1 23.955-15.584c7.341-2.853 18.372-6.247 38.684-7.173 21.968-1.002 28.557-1.215 84.186-1.215m0-37.537c-56.58 0-63.677.24-85.895 1.254-22.175 1.012-37.319 4.533-50.57 9.684a102.126 102.126 0 0 0-36.9 24.029 102.13 102.13 0 0 0-24.036 36.9c-5.146 13.252-8.667 28.395-9.675 50.571C.24 144.655 0 151.752 0 208.332c0 56.58.24 63.677 1.258 85.895 1.012 22.175 4.533 37.318 9.684 50.57a102.126 102.126 0 0 0 24.029 36.899 102.12 102.12 0 0 0 36.9 24.03c13.252 5.15 28.395 8.671 50.57 9.684 22.221 1.014 29.315 1.253 85.894 1.253 56.579 0 63.677-.239 85.895-1.253 22.175-1.013 37.319-4.534 50.57-9.684a106.578 106.578 0 0 0 60.929-60.929c5.151-13.252 8.672-28.396 9.684-50.57 1.014-22.221 1.254-29.316 1.254-85.895 0-56.579-.24-63.677-1.254-85.894-1.012-22.176-4.533-37.319-9.684-50.571A102.126 102.126 0 0 0 381.7 34.968a102.127 102.127 0 0 0-36.902-24.035c-13.253-5.146-28.396-8.667-50.571-9.675C272.009.24 264.912 0 208.332 0h.002Z"/>
							<path d="M208.332 101.351c-58.688 0-106.981 48.293-106.981 106.981 0 58.688 48.293 106.982 106.981 106.982 58.688 0 106.982-48.294 106.982-106.982S267.02 101.351 208.332 101.351Zm0 176.425c-38.095-.001-69.443-31.349-69.443-69.444s31.348-69.443 69.444-69.443c38.095 0 69.443 31.348 69.443 69.443 0 38.096-31.348 69.444-69.444 69.444Z"/>
							<circle cx="319.54" cy="97.124" r="24.999" />
						</g>
					</svg>
				</a>
				<a href="https://www.linkedin.com/company/rsm-design" target="_blank">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 417 400">
						<g class="social-icon" fill-rule="nonzero">
							<path d="M416.667 245.03v154.045h-89.305V255.347c0-36.105-12.918-60.746-45.243-60.746-24.676 0-39.361 16.606-45.822 32.67-2.356 5.742-2.962 13.735-2.962 21.774v150.03H144s1.203-243.427 0-268.648h89.326v38.08c-.181.284-.417.592-.587.868h.587v-.868c11.868-18.279 33.063-44.391 80.503-44.391 58.776-.001 102.838 38.396 102.838 120.914ZM50.551.925C19.99.925 0 20.971 0 47.332c0 25.787 19.411 46.441 49.365 46.441h.597c31.154 0 50.528-20.65 50.528-46.441C99.903 20.971 81.116.925 50.551.925ZM5.306 399.075h89.301V130.427H5.306v268.648Z"/>
						</g>
					</svg>
				</a>
				<a href="https://www.pinterest.com/rsmdesign/" target="_blank">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 325 418">
						<g class="social-icon" fill-rule="nonzero">
							<path d="M141.649 1.929C72.409 9.658 3.414 65.676.566 145.696c-1.79 48.858 12.083 85.512 58.581 95.804 20.178-35.596-6.509-43.447-10.658-69.198C31.443 66.775 170.207-5.19 242.823 68.483c50.241 51.015 17.167 207.962-63.87 191.649-77.619-15.581 37.996-140.512-23.961-165.043-50.363-19.934-77.132 60.981-53.252 101.174-13.994 69.117-44.139 134.248-31.934 220.939 39.582-28.721 52.926-83.722 63.869-141.082 19.893 12.082 30.511 24.653 55.896 26.605 93.607 7.242 145.883-93.444 133.109-186.319C311.33 34.067 229.154-7.834 141.649 1.929Z"/>
						</g>
					</svg>
				</a>
			</div>
			<p class="footer-copyright">Copyright © 1997–{new Date().getFullYear()} RSM&nbsp;Design</p>
		</div>
	</footer>

	<div id="menu-bar-footer"
		 class="menu-bar" 
		 style:--color-background="#1a1818"
	/>
</template>
<style lang="scss">
	div.bg-color,
	div.menu-bar {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		pointer-events: none;
	}
	div.bg-color {
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
		z-index: 1;
	}
	div.menu-bar {
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
		z-index: 3;

		height: calc(var(--GRID-CELL) * 1.75);
		margin-bottom: calc(-1 * var(--SPACE-LG));
	}

	footer {
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
		z-index: 2;
		position: relative;

		width: 100%;
		display: grid;
		grid-template-columns: var(--GRID-WRAPPER);
		row-gap: var(--SPACE-LG);

		margin: var(--SPACE-LG) 0;

		> a.footer-logo {
			grid-column: main;

			display: block;
			width: var(--SPACE-LG);
			height: var(--SPACE-LG);
			//margin-bottom: var(--SPACE-LG);

			@media (max-width: 46.875em) {
				
			}

			> svg {
				width: 100%;
				height: 100%;
				object-fit: contain;
				> .logomark {
					fill: var(--color-primary, var(--COLOR-WHITE));
					transition: fill 0.3s ease;
				}
			}

			&:hover > svg > .logomark {
				fill: var(--COLOR-ORANGE);
			}
		}

		> .footer-col1 {
			grid-column: eighth-start 1 / eighth-end 4;
			display: grid;
			grid-template-columns: subgrid;
			row-gap: var(--SPACE-MD);

			@media (max-width: 62.5em) {
				grid-column: third-start 1 / third-start 2;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
			}
			@media (max-width: 46.875em) {
				grid-column: half-start 1 / half-end 1;
			}
			@media (max-width: 31.25em) {
				grid-column: main;
			}

			> article {
				grid-column: 1 / -1;

				> p, > a {
					margin-bottom: 0;
				}
				> p:first-of-type {
					margin: 0.75em 0 0.333em;
				}
			}

			> nav {
				align-self: end;
				grid-column: 1 / -1;
				display: grid;
				grid-template-columns: subgrid;
				row-gap: 1em;

				@media (max-width: 31.25em) {
					margin-top: var(--SPACE-MD);
				}

				:global {
					a:nth-of-type(2n+1) {
						grid-column: eighth-start 1 / eighth-end 2;
					}
					a:nth-of-type(2n) {
						grid-column: eighth-end 2 / eighth-end 4;
					}
				}

				@media (max-width: 62.5em) {
					display: flex;
					flex-wrap: wrap;
					column-gap: var(--GRID-CELL);

					:global {
						a {
							width: calc(50% - var(--GRID-CELL));

							/*@media (max-width: 46.875em) and (min-width: 31.25em) {
								width: 100%;
							}*/
						}
					}
				}
			}
		}
		> .footer-col2 {
			grid-column: eighth-start 5 / eighth-end 8;
			display: grid;
			grid-template-columns: subgrid;
			grid-template-rows: min-content 1fr;
			row-gap: var(--SPACE-LG);
			color: var(--color-primary, var(--COLOR-WHITE));

			@media (max-width: 62.5em) {
				grid-column: third-start 2 / third-end 3;
			}
			@media (max-width: 46.875em) {
				grid-column: half-start 2 / half-end 2;
				row-gap: var(--SPACE-MD);
			}
			@media (max-width: 31.25em) {
				grid-column: main;
				display: flex;
				flex-wrap: wrap;
				column-gap: var(--GRID-CELL);

				> article {
					width: calc(50% - var(--GRID-CELL));
				}

			}

			> article {
				> p {
					margin-bottom: 0.5em;

					@media (max-width: 46.875em) {
						display: none;
					}
				}
				> a:first-child {
					@media (max-width: 46.875em) {
						margin-bottom: 0;
					}
				}
				&:nth-of-type(2n+1) {
					grid-column: eighth-start 1 / eighth-end 2;

					@media (max-width: 62.5em) {
						grid-column: third-start 1 / third-end 1;
					}
					@media (max-width: 46.875em) {
						grid-column: 1 / -1;
					}
				}
				&:nth-of-type(2n) {
					grid-column: eighth-start 3 / eighth-end 4;

					@media (max-width: 62.5em) {
						grid-column: third-start 2 / third-end 2;
					}
					@media (max-width: 46.875em) {
						grid-column: 1 / -1;
					}
				}
			}
		}
		> div > article {
			color: var(--color-primary);
			font-size: var(--FONT-SIZE-MD);

			> p, > a {
				display: block;
				margin-bottom: 0;
			}

			> a:first-child {
				font-weight: 600;
				font-size: var(--FONT-SIZE-LG);
				margin-bottom: 0.5em;
			}
		}

		> .footer-bottom {
			grid-column: main;
			display: grid;
			grid-template-columns: subgrid;

			@media (max-width: 31.25em) {
				display: flex;
				flex-wrap: wrap;
				column-gap: var(--GRID-CELL);

				> .social-icons {
					width: calc(50% - var(--GRID-CELL));
				}
				> p.footer-copyright {
					width: 50%;
				}
			}

			border-top: 1px solid var(--color-primary);

			> .social-icons {
				grid-column: eighth-start 1 / eighth-end 6;
				@media (max-width: 62.5em) {
					grid-column: half-start 1 / half-end 1;
					column-gap: var(--SPACE-MD);
				}

				margin-top: 1em;
				display: flex;
				justify-content: flex-start;
				column-gap: calc(var(--GRID-CELL) * 1.5);

				> a {
					display: flex;
					justify-content: flex-end;
					height: calc(var(--GRID-CELL) * 2 / 3);
					width: calc(var(--GRID-CELL) * 2 / 3);

					@media (max-width: 46.875em) {
						height: calc(var(--GRID-CELL) / 2);
						width: calc(var(--GRID-CELL) / 2);
					}

					&:hover {
						> svg > g.social-icon {
							fill: var(--color-accent, var(--COLOR-ORANGE));
						}
					}

					> svg {
						max-height: 100%;
						max-width: 100%;

						> g.social-icon {
							transition: fill 0.3s ease;
							fill: var(--color-primary, var(--COLOR-WHITE));
						}
					}
				}
			}
			> p.footer-copyright {
				grid-column: eighth-start 7 / eighth-end 8;
				@media (max-width: 62.5em) {
					grid-column: third-start 3 / third-end 3;
				}

				margin: 1em 0 0;
				//min-width: 16.5em;
				font-size: var(--FONT-SIZE-SM);
				color: var(--color-primary, var(--COLOR-WHITE));

				@media (max-width: 46.875em) {
					font-size: var(--FONT-SIZE-XS);
				}
			}
		}

		/* BG COLOR SWITCH */
		--color-primary: white;
		--color-secondary: var(--COLOR-MID-GRAY);
		--color-tertiary: var(--COLOR-DIM-GRAY);
		--color-accent: var(--COLOR-ORANGE);

		> .bg-color-trigger {
			position: absolute;
			top: 0;
			left: 0;
			height: 100%;
			pointer-events: none;
		}
	}

	:global {
		.bg-color-animate {
			background: transparent;
			animation: bg-color-animate 1s linear forwards;
		}

		@keyframes bg-color-animate {
			0% {
				background: transparent;
			}
			25% {
				background: transparent;
			}
			33% {
				background: var(--color-background);
			}
			100% {
				background: var(--color-background);
			}
		}

		.footer-opacity-animate {
			opacity: 0;
			animation: footer-opacity-animate 1s linear forwards;
		}

		@keyframes footer-opacity-animate {
			0% {
				opacity: 0;
			}
			25% {
				opacity: 0;
			}
			33% {
				opacity: 1;
			}
			100% {
				opacity: 1;
			}
		}
	}
</style>