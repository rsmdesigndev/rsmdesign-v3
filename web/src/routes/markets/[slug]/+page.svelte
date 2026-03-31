<script lang="ts">
	import ProjectsGrid, {
		ProjectsGridType,
		ProjectsLoadFunctionality,
		setProjectGridContext
	} from "$lib/components/ProjectsGrid.svelte";
	import SeoHead from "$lib/components/SeoHead.svelte";
	import Section from "$lib/components/Section.svelte";
	import { assetUrl } from "$lib/cms/assets";
	import Slideshow from "$lib/components/Slideshow.svelte";
	import DottedArrow from "$lib/components/DottedArrow.svelte";
	import DottedArrowHover from "$lib/components/DottedArrowHover.svelte";
	import { fade } from "svelte/transition";
	import type { PageData } from "./$types";
	import PageBlocks from "$lib/components/page_builder/page_blocks/index.svelte";
	import PageBlocksV3, { type ProjectData } from "$lib/components/page_builder/page_blocks_v3/index.svelte";

	export let data: PageData;

	setProjectGridContext({
		filter: data.projectsFilter,
		projects: [...data.featuredProjects, ...data.projects],
		totalProjectsCount: data.projectsCount,
		view_more_name: data.market.view_more_name,
		filters: data.filters
	});
</script>

<SeoHead 
	title={data.market.name ?? ""} 
	description={data.market.seo_page_description ?? ""} 
	noindex={data.market.visibility === "draft"}
/>

<template>
	{#if data.market.markets_use_page_blocks_v3}
		{#if data.market.markets_page_blocks_v3}
			<PageBlocksV3 blocks={data.market.markets_page_blocks_v3} />
		{:else}
			<div class="container">Page Blocks v3 selected, but no blocks added.</div>
		{/if}
	{:else if data.market.use_page_blocks}
		<PageBlocks content={data.market.page_content} />
	{:else}
		<div class="container">
			<section class="slideshow-section">
				<Slideshow interval={5000} items={data.market.hero_images ?? []} let:item>
					<figure in:fade out:fade>
						<img
							src={assetUrl(item?.directus_files_id?.filename_disk)}
							alt={item?.directus_files_id?.description}
						/>
					</figure>
				</Slideshow>
			</section>

			<h1 class="xxxl">{data.market.name}</h1>
			<article class="overview">
				{@html data.market.overview}
			</article>
			<section class="lists">
				<h3 class="md">Services</h3>
				<ul>
					{#each data.market.sub_services as item}
						<li>
							{#if item.link}
								<a href={item.link}>{item.name}</a>
							{:else}
								{item.name}
							{/if}
						</li>
					{/each}
				</ul>
				<h3 class="md">Team Leaders</h3>
				<ul>
					{#each data.market.team_leaders ?? [] as item}
						{#if item?.team_id}
							<li>
								<a href="/team/{item.team_id.slug}">{item.team_id.name}, {item.team_id.short_title}</a>
							</li>
						{/if}
					{/each}
				</ul>
				<h3 class="md">Project Inquiry</h3>
				<DottedArrowHover
					href="/contact"
				>
					<p class="font-weight-400">Contact Us <DottedArrow /></p>
				</DottedArrowHover>
			</section>

			<section class="projects-section">
				<ProjectsGrid
					data={{
						grid_type: ProjectsGridType.Uniform,
						num_projects: 9,
						show_filters: false,
						load_functionality: ProjectsLoadFunctionality.LoadMoreButton
					}}
				/>
			</section>

			<section class="cta-section">
				<DottedArrowHover href="/contact">
					<h4 class="xxxl heading">Get in touch.</h4>
					<p>Contact Us <DottedArrow /></p>
				</DottedArrowHover>
			</section>
		</div>
	{/if}
</template>

<style lang="scss">
	.container {
		@media (max-width: 62.5em) {
			grid-template-columns: [whole-start half-start third-start quarter-start
						   sixth-start eighth-start ninth-start twelfth-start]
						   2fr
						  [twelfth-end ninth-end eighth-end sixth-end
						   quarter-end third-end half-end
						   half-start third-start quarter-start
						   sixth-start eighth-start ninth-start twelfth-start]
						   1fr
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
	}
	.slideshow-section {
		grid-column: whole;

		@media (max-width: 62.5em) {
			grid-column: span 2;
		}
		@media (max-width: 46.875em) {
			grid-column: span 1;
		}

		margin-bottom: calc(var(--GRID-CELL) * 3);

		img {
			width: 100%;
			height: auto;
			aspect-ratio: 17 / 9;
		}
	}
	h1 {
		grid-column: sixth-start 1 / span 5 sixth-end;

		@media (max-width: 62.5em) {
			grid-column: span 2;
		}
		@media (max-width: 46.875em) {
			grid-column: span 1;
		}

		margin-bottom: var(--GRID-CELL);
	}
	.overview {
		grid-column: half-start 1 / span 1 half-end;
		margin-bottom: calc(var(--GRID-CELL) * 3);

		@media (max-width: 62.5em) {
			grid-column: span 1;
		}

		:global(h2) {
			font-size: var(--FONT-SIZE-MD);
			text-transform: uppercase;
			letter-spacing: 0.05em;
			line-height: 1.333;
			margin-bottom: 0.5em;
		}

		:global(p > a) {
			color: #707070;
			&:hover {
				color: var(--COLOR-ORANGE);
			}
		}
	}
	.lists {
		grid-column: third-start 3 / span 1 third-end;
		margin-bottom: calc(var(--GRID-CELL) * 3);

		display: flex;
		flex-direction: column;

		@media (max-width: 62.5em) {
			grid-column: span 1;
		}

		li + li {
			margin-top: 0.25em; 
		}

		ul + h3,
		h3:not(:first-child) {
			margin-top: calc(var(--GRID-CELL) * 1.5);
		}
	}
	.projects-section {
		grid-column: whole;
		margin-bottom: calc(var(--GRID-CELL) * 3);
	}
	section.cta-section {
		grid-column: whole;
		margin-top: calc(var(--GRID-CELL) * 3);
	}
</style>
