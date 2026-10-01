<script lang="ts">
	import SeoHead from "$lib/components/SeoHead.svelte";
	import type { PageData } from "./$types";
	import PageBlocksV3 from "$lib/components/page_builder/page_blocks_v3/index.svelte";
	import TeamGrid from "$lib/components/TeamGrid.svelte";
	import DottedArrow from "$lib/components/DottedArrow.svelte";
	import DottedArrowHover from "$lib/components/DottedArrowHover.svelte";

	export let data: PageData;
</script>

<SeoHead
	title={`${data.career.name} · Careers`}
	description={data.career.seo_page_description ?? ""}
	noindex={data.career.visibility === "draft"}
/>

<template>
	{#if data.career.careers_page_blocks_v3.length}
		{#key data.career.slug}
			<PageBlocksV3 blocks={data.career.careers_page_blocks_v3} />
		{/key}
	{:else if data.career.job_description}
		<div class="container">
			<figure class="">
				<img src="/img/careers/Awards_RSM-Design_Collage-of-Projects.jpg" alt="A collage of RSM projects" />
			</figure>
			<section class="header-section">
				<h2 class="md gray">Careers at RSM</h2>
				<h1 class="xxxl">{data.career.name}</h1>
			</section>
			{#if data.career.job_description}
				<section class="job-description rich-text">
					{@html data.career.job_description}
				</section>
			{/if}
			<section class="careers-overview-section">
				<h1 class="xxxl">Fearlessly Authentic</h1>
				<p>The studio is a passionate team of designers from diverse creative backgrounds including graphic design, architecture, interior design, industrial design, and branding. Our design studio is dedicated to innovation where intellectual questioning and creative debate are encouraged. Challenging ourselves to discover each project’s unique spirit, we create narratives for places that engage people with their environment.</p>
			</section>
			<section class="current-openings-section">
				<h2 class="md gray">Current openings</h2>
				{#each data.careersList as careers}
					<article>
						<h3 class="xxl">
							<a href="/careers/{careers.slug}">{careers.name}</a>
						</h3>
						<p>{careers.seo_page_description}</p>
					</article>
				{/each}
			</section>

			<section class="cta-section">
				<DottedArrowHover href="/work" text_alignment="right">
					<p>View Our Work <DottedArrow /></p>
				</DottedArrowHover>
			</section>
		</div>
	{:else}
		<div class="container">Page Blocks v3 selected, but no blocks added.</div>
	{/if}
</template>

<style lang="scss">
	.container {
		margin-top: calc(var(--GRID-CELL) * 2.75);
	}

	section.header-section {
		grid-column: whole;
	}

	section.job-description {
		grid-column: half;
		margin-top: var(--GRID-CELL);
	}

	section.team-grid-section {
		grid-column: whole;
	}
	section.careers-overview-section {
		margin-top: calc(var(--GRID-CELL) * 2);
		grid-column: third-start 1 / span 2 third-end;

		> h1 {
			margin-bottom: var(--GRID-CELL);
		}
	}
	section.current-openings-section {
		margin-top: calc(var(--GRID-CELL) * 2);
		grid-column: third-start 1 / span 2 third-end;

		> article {
			&:not(:first-of-type) {
				margin-top: calc(var(--GRID-CELL) * 1.5);
			}
		}
	}
	section.cta-section {
		grid-column: whole;
		margin-top: calc(var(--GRID-CELL) * 3);
	}
</style>