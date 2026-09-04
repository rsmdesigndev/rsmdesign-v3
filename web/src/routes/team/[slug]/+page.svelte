<script lang="ts">
	import { assetUrl } from "$lib/cms/assets";
	import { formatDate } from "$lib/format";
	import SeoHead from "$lib/components/SeoHead.svelte";
	import DottedArrow from "$lib/components/DottedArrow.svelte";
	import DottedArrowHover from "$lib/components/DottedArrowHover.svelte";
	import type { PageData } from "./$types";
	import PageBlocksV3, { type ProjectData } from "$lib/components/page_builder/page_blocks_v3/index.svelte";

	export let data: PageData;
</script>

<SeoHead 
	title={data.team.name ?? ""} 
	description={data.team.seo_page_description ?? undefined} 
	noindex={!data.team.has_profile_page || data.team.visibility === "draft"}
/>

<svelte:head>
	<style>
		:root {
			--color-primary: white;
			--color-secondary: var(--COLOR-MID-GRAY);
			--color-tertiary: var(--COLOR-DIM-GRAY);
			--color-accent: var(--COLOR-ORANGE);
			--color-background: var(--COLOR-BLACK);
		}
	</style>
</svelte:head>

<template>
	{#if data.team.team_page_blocks_v3}
		<PageBlocksV3 blocks={data.team.team_page_blocks_v3} />
	{:else}
		<div class="container">Page Blocks v3 selected, but no blocks added.</div>
	{/if}
	{#if data.team.hubspot_tracking_scripts}
		{@html data.team.hubspot_tracking_scripts}
	{/if}
</template>

<style lang="scss">
	.container {
		margin-top: calc(var(--HEADER-HEIGHT) + var(--GRID-CELL));

		@media (max-width: 62.5em) {
			grid-template-columns: [whole-start half-start third-start quarter-start
						   sixth-start eighth-start ninth-start twelfth-start]
						   4fr
						  [twelfth-end ninth-end eighth-end sixth-end
						   quarter-end third-end half-end
						   half-start third-start quarter-start
						   sixth-start eighth-start ninth-start twelfth-start]
						   3fr
						  [twelfth-end ninth-end eighth-end sixth-end
						   quarter-end third-end half-end whole-end];
		}
		@media (max-width: 46.875em) {
			grid-template-columns: [whole-start half-start third-start quarter-start
						   sixth-start eighth-start ninth-start twelfth-start]
						   1fr
						  [twelfth-end ninth-end eighth-end sixth-end
						   quarter-end third-end half-end whole-end];
		}

		> figure.team-hero {
			grid-column: whole;
			display: grid;
			grid-template-columns: 1fr 2fr;
			column-gap: calc(var(--GRID-CELL) / 2);

			@media (max-width: 62.5em) {
				grid-column: span 2;
			}
			@media (max-width: 46.875em) {
				grid-column: span 1;
			}

			> img {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}
		}

		> section.team-name {
			grid-column: sixth-start 1 / span 5 sixth-end;

			@media (max-width: 62.5em) {
				grid-column: span 2;
			}
			@media (max-width: 46.875em) {
				grid-column: span 1;
			}

			> h2 {
				margin-top: 1em;
			}
		}

		> section.team-description {
			grid-column: half-start 1 / span 1 half-end;
			margin-bottom: calc(var(--GRID-CELL) * 3);

			@media (max-width: 62.5em) {
				grid-column: span 1;
			}
			@media (max-width: 46.875em) {
				padding-right: 20%;
			}
		}

		> section.lists {
			grid-column: twelfth-start 8 / span 5 twelfth-end;
			margin-bottom: calc(var(--GRID-CELL) * 3);

			@media (max-width: 62.5em) {
				grid-column: span 1;
			}
			@media (max-width: 46.875em) {
				padding-right: 20%;
			}

			li + li {
				margin-top: 0.25em; 
			}

			ul + h3 {
				margin-top: calc(var(--GRID-CELL) * 1.5);
			}
		}

		> section.articles-section {
			grid-column: half-start 1 / span 1 half-end;

			@media (max-width: 62.5em) {
				grid-column: span 1;
			}
			@media (max-width: 46.875em) {
				padding-right: 20%;
			}

			h2 {
				margin-bottom: calc(var(--GRID-CELL) * 2);
			}

			p {
				margin-bottom: 0.333em;
			}

			article {
				padding-bottom: calc(var(--GRID-CELL) / 2);
				margin-bottom: calc(var(--GRID-CELL) * 1.5);
				border-bottom: 2px solid var(--COLOR-MID-GRAY);
			}
		}

		> section.work-section {
			grid-column: twelfth-start 8 / span 5 twelfth-end;

			@media (max-width: 62.5em) {
				grid-column: span 1;
			}
			@media (max-width: 46.875em) {
				padding-right: 20%;
			}

			h2 {
				margin-bottom: calc(var(--GRID-CELL) * 2);
			}

			a {
				position: relative;
				&::after {
					content: "";
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					background-color: transparent;
					transition: background-color 0.3s ease;
				}

				&:hover::after {
					background-color: rgba(255,255,255,0.382);
				}
			}

			img {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}
		}
	}
</style>
