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

	export let data: PageData;

	setProjectGridContext({
		projects: data.page.projects?.map((project: any) => project.projects_id) ?? [],
		totalProjectsCount: data.page.projects?.length ?? 0,
	});
</script>

<SeoHead 
	title={data.page.name ?? ""} 
	description={data.page.seo_page_description ?? undefined} 
	noindex="true"
	slug={`rsm/${data.page.slug}`}
/>

<div class="container">
	<section class="hero-image-grid-section">
		<figure>
			<img src="/img/wbe/01-WBE-Design-Studio_Suzanne-Schwartz.jpg" alt="Headshot of Suzanna Redmond Schwartz, RSM Design Co-Founder and Principal" />
			<img src="/img/wbe/00-wbe-logo.png" alt="Women Owned" />
		</figure>
		<figure>
			<img src="/img/wbe/02-RSM-Design-Studio-Collaboration.jpg" alt="Senior Associate Jeffrey Hertzler and designer Emily Boelsems collaborate in the office." />
			<img src="/img/wbe/03-RSM-Design_Beacon-Park_Wayfinding-Signage.jpg" alt="Great Park Neighborhoods colorful pedestrian wayfinding flag directional signage." />
			<img src="/img/wbe/04-RSM-Design_Corten-Signage-Design.jpg" alt="Frisco Station amenity identity signage on artful corten pavilion." />
			<img src="/img/wbe/05-RSM-Design_AD-EX_3D-Signage-Design.jpg" alt="AD EX dimensional signage identity mounted to glass facade of architecture." />
			<img src="/img/wbe/07-RSM-Design_Monet-Ave_Placemaking-Design.jpg" alt="Shopping district outdoor seating, specialty bench, and airstream vendor." />
			<img src="/img/wbe/06-RSM-Design_Virgin-Hotel_Rooftop-Neon-Signage-Design.jpg" alt="Geometric hotel architecture with neon rooftop identity signage." />
		</figure>
		<figure>
			<img src="/img/wbe/08-RSM-Design_Monet-Ave_Custom-Bike-Locks-Design.jpg" alt="Custom and unique bike racks at Monet Avenue in Rancho Cucamonga." />
			<img src="/img/wbe/09-RSM-Design_River-Oaks_Business-Card-Branding.jpg" alt="River Oaks District business card logo and branding." />
			<img src="/img/wbe/10-RSM-Design-Harry-Kyle.jpg" alt="Principals Kyle Richter and Harry Mark lead a discovery workshop." />
			<img src="/img/wbe/11-RSM-Design_Pacmutual-Building_Gold-Wayfinding-Signage.jpg" alt="PacMutual Building gold level identity signage on marble wall." />
		</figure>
	</section>
	<section class="header-section">
		<h2 class="md gray">RSM Design</h2>
		<h1 class="xxxl">{data.page.name}</h1>
	</section>
	<article class="overview">
		{@html data.page.overview}
	</article>
	<section class="lists">
		<h3 class="md">Services</h3>
		<ul>
			{#each data.page.sub_services as item}
				{#if item?.name}
					<li>
						{#if item.link}
							<a href={item.link}>{item.name}</a>
						{:else}
							{item.name}
						{/if}
					</li>
				{/if}
			{/each}
		</ul>
		<h3 class="md">Team Leaders</h3>
		<ul>
			{#each data.page.team_leaders ?? [] as item}
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
	section.hero-image-grid-section {
		grid-column: whole;

		margin-bottom: calc(var(--GRID-CELL) * 3);

		display: grid;
		column-gap: calc(var(--GRID-CELL) / 4);
		grid-template-columns: repeat(3, 1fr);

		@media (max-width: 46.875em) {
			grid-template-columns: repeat(2, 1fr);

			> figure:last-of-type {
				display: none;
			}
		}

		> figure {
			width: 100%;
			margin: 0;
			padding: 0;

			display: grid;
			column-gap: calc(var(--GRID-CELL) / 4);
			row-gap: calc(var(--GRID-CELL) / 4);
			> img {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}

			&:first-of-type {
				grid-template-columns: 1fr;
				grid-template-rows: 1fr;

				> img {
					grid-column: 1;
					grid-row: 1;

					&:last-of-type {
						width: 25%;
						height: auto;
						align-self: start;
						justify-self: start;
						object-fit: contain;
						padding: calc(var(--GRID-CELL) / 3);
					}
				}
			}

			&:nth-of-type(2) {
				grid-template-columns: repeat(3, 1fr);
				grid-template-rows: repeat(4, 1fr);

				> img:first-of-type {
					grid-column: span 2;
				}
				> img:first-of-type,
				> img:nth-of-type(2),
				> img:nth-of-type(3),
				> img:nth-of-type(5) {
					grid-row: span 2;
				}
			}

			&:last-of-type {
				grid-template-columns: repeat(6, 1fr);
				grid-template-rows: 1fr 1fr;

				> img:first-of-type,
				> img:nth-of-type(2) {
					grid-column: span 3;
				}
				> img:nth-of-type(3) {
					grid-column: span 4;
				}
				> img:last-of-type {
					grid-column: span 2;
				}
			}
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
	section.header-section {
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
			margin-top: calc(var(--GRID-CELL) * 2);
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
