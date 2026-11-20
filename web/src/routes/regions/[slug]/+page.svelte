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

	export let data: PageData;

	setProjectGridContext({
		filter: data.projectsFilter,
		projects: [...data.featuredProjects, ...data.projects],
		totalProjectsCount: data.projectsCount,
		view_more_name: data.geographicalRegion.view_more_name
	});
</script>

<SeoHead
	title={data.geographicalRegion.name ?? ""}
	description={data.geographicalRegion.seo_page_description ?? undefined}
	noindex={data.geographicalRegion.visibility === "draft"}
	slug={`regions/${data.geographicalRegion.slug}`}
/>

{#if data.geographicalRegion.use_page_blocks}
	<PageBlocks content={data.geographicalRegion.page_content} />
{:else}
	<div class="container">
		<section class="slideshow-section">
			<Slideshow interval={5000} items={data.geographicalRegion.hero_images ?? []} let:item>
				<figure in:fade out:fade>
					<img
						src={assetUrl(item?.directus_files_id?.filename_disk)}
						alt={item?.directus_files_id?.description}
					/>
				</figure>
			</Slideshow>
		</section>

		<h1 class="xxxl">{data.geographicalRegion.name}</h1>
		<article class="overview">
			{@html data.geographicalRegion.overview}
		</article>
		<section class="lists lists-2-col">
			<div>
				<h3 class="md">Services</h3>
				<ul>
					{#each data.geographicalRegion.sub_services ?? [] as item}
						<li>
							{#if item?.services_id?.slug}
								<a href="/services/{item?.services_id?.slug}">{item?.services_id?.name}</a>
							{:else}
								{item?.services_id?.name}
							{/if}
						</li>
					{/each}
				</ul>
			</div>
			<div>
				<h3 class="md">Locations</h3>
				<ul>
					{#each data.geographicalRegion.project_locations ?? [] as location}
						{#if location?.name}
							<li>{location?.name}</li>
						{/if}
					{/each}
				</ul>
			</div>
			<div>
				<h3 class="md">Project Inquiry</h3>
				<DottedArrowHover
					href="/contact"
				>
					<p class="font-weight-400">Contact Us <DottedArrow /></p>
				</DottedArrowHover>
			</div>
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
		margin-bottom: calc(var(--GRID-CELL) * 3);
		grid-column: ninth-start 6 / span 4 ninth-end;

		@media (max-width: 62.5em) {
			grid-column: 1 / span 1;
		}

		display: grid;
		grid-template-columns: 1fr 1fr;
		align-content: start;

		li + li {
			margin-top: 0.25em; 
		}

		> div:last-of-type {
			grid-column: 2;
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
