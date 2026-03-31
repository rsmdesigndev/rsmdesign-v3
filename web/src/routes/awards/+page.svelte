<script lang="ts">
	import SeoHead from "$lib/components/SeoHead.svelte";
	import type { PageData } from "./$types";
	import Section from "$lib/components/Section.svelte";
	import DottedArrow from "$lib/components/DottedArrow.svelte";
	import DottedArrowHover from "$lib/components/DottedArrowHover.svelte";
	import PageBlocksV3 from "$lib/components/page_builder/page_blocks_v3/index.svelte";

	export let data: PageData;
</script>

<SeoHead
	title={data.awards_page?.seo_title}
	description={data.awards_page?.seo_page_description}
/>

<template>
	{#if data.awards_page?.awards_use_page_blocks_v3}
		{#if data.awards_page.awards_page_blocks_v3}
			<PageBlocksV3 blocks={data.awards_page.awards_page_blocks_v3} />
		{:else}
			<div class="container">Page Blocks v3 selected, but no blocks added.</div>
		{/if}
	{:else}
		<div class="container">
			<figure>
				<img src="/img/awards/Awards_RSM-Design_Collage-of-Projects-2.jpg" alt="Collage of images of our award-winning environmental graphic design work" />
			</figure>
			<section class="awards-intro">
				<h1 class="xxxl">Environmental <br />Graphic Design Awards.</h1>
				<h2 class="md">AWARD-WINNING INTERNATIONAL DESIGN STUDIO SPECIALIZING IN ENVIRONMENTAL GRAPHICS, BRAND DEVELOPMENT, AND WAYFINDING</h2>
				<p>
					For over 28 years, RSM Design has created award-winning design solutions for the built environment. Through thoughtful collaborations with the world's leading architects, developers, and institutions, our design studios have engaged in a wide variety of distinguished projects. RSM Design intentionally seeks out unique and diverse design commissions that continually challenge our team toward greater innovation and excellence. This dedication to Principle-Centered Design has earned RSM Design industry recognition around the world.
				</p>
				<p>
					These accolades span our work in environmental graphic design, brand development, wayfinding, and placemaking across sectors, including healthcare, hospitality, retail, cultural institutions, and mixed-use developments, among others. Our multidisciplinary design approach is celebrated for its ability to transform ordinary places into extraordinary destination experiences. Each recognition affirms our belief that innovative design solutions improve the quality of the human experience and builds meaningful connections between people and places.
				</p>
			</section>
			<section class="awards-list">
				{#each data.awardsByYear as [year, awardYear]}
					<h3 class="xxl">{year}</h3>
					<ul>
						{#each awardYear as award}
							<li>
								<p>
									{#if award.project}
										<a href="/work/{award.project.slug}">{award.project.project_title} · {award.project_location}:</a>
									{:else}
										<strong>{award.project_name} · {award.project_location}:</strong>
									{/if}
									{award.award_designation ?? ""}
								</p>
							</li>
						{/each}
					</ul>
				{/each}
			</section>
			<Section 
				cta
				span_columns={data.span_columns}
				col_units={data.col_units}
				col_start={data.col_start}
				span_rows={data.span_rows}
			>
				<DottedArrowHover href="/work">
					<h4 class="xxxl heading">Latest projects.</h4>
					<p>View Our Work <DottedArrow /></p>
				</DottedArrowHover>
			</Section>
		</div>
	{/if}
</template>

<style lang="scss">
	.container {
		margin-top: var(--HEADER-HEIGHT);
	}
	section.awards-intro {
		grid-column: third-start 1 / span 2 third-end;
		margin-bottom: var(--GRID-CELL);

		h1 {
			margin-bottom: var(--GRID-CELL);
		}

		@media (max-width: 31.25em) {
			grid-column: span 1;
		}
	}

	section.awards-list {
		grid-column: whole;

		display: grid;
		grid-template-columns: repeat(6, 1fr);
		column-gap: calc(var(--GRID-CELL) / 2);

		@media (max-width: 62.5em) {
			grid-template-columns: 1fr;
		}

		margin-bottom: calc(var(--GRID-CELL) * 3);

		h3, ul {
			margin-top: calc(var(--GRID-CELL) * 1.5);
		}

		ul {
			grid-column: span 5;

			li {
				margin-bottom: 0;
				p {
					margin-bottom: 0.5em;
				}
				a {
					font-weight: 700;
				}
			}
		}
	}
</style>