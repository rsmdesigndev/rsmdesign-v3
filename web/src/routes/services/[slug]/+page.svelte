<script lang="ts">
	import type { PageData } from "./$types";
	import LayoutBlocks from "$lib/components/page_builder/layout_blocks/index.svelte";
	import ProjectsGrid, {
		ProjectsGridType,
		ProjectsLoadFunctionality,
		setProjectGridContext
	} from "$lib/components/ProjectsGrid.svelte";
	import SeoHead from "$lib/components/SeoHead.svelte";
	import Section from "$lib/components/Section.svelte";
	import { assetUrl } from "$lib/cms/assets";
	import { formatDate } from "$lib/format";
	import Slideshow from "$lib/components/Slideshow.svelte";
	import DottedArrow from "$lib/components/DottedArrow.svelte";
	import DottedArrowHover from "$lib/components/DottedArrowHover.svelte";
	import { fade } from "svelte/transition";
	import PageBlocks from "$lib/components/page_builder/page_blocks/index.svelte";
	import PageBlocksV3, { type ExpertiseData } from "$lib/components/page_builder/page_blocks_v3/index.svelte";

	export let data: PageData;

	const expertiseData: ExpertiseData = {
		team_leaders?: data.service.team_leaders,
		sub_services?: data.service.sub_services
	};

	setProjectGridContext({
		projects: [...data.featuredProjects, ...data.projects],
		totalProjectsCount: data.totalProjectsCount,
		filter: data.projectsFilter,
		view_more_name: data.service.view_more_name
	});
</script>

<SeoHead
	title={data.service.name ?? ""}
	description={data.service.seo_page_description ?? undefined}
	noindex={data.service.visibility === "draft"}
/>

<template>
	{#if data.service.services_use_page_blocks_v3}
		{#if data.service.services_page_blocks_v3}
			<PageBlocksV3 blocks={data.service.services_page_blocks_v3} {expertiseData} />
		{:else}
			<div class="container">Page Blocks v3 selected, but no blocks added.</div>
		{/if}
	{:else if data.service.use_page_blocks}
		<PageBlocks content={data.service.page_content} />
	{:else}
		<div class="container">
			<section class="slideshow-section">
				<Slideshow interval={5000} items={data.service.hero_images ?? []} let:item>
					<figure in:fade out:fade>
						<img
							src={assetUrl(item?.directus_files_id?.filename_disk)}
							alt={item?.directus_files_id?.description}
						/>
					</figure>
				</Slideshow>
			</section>

			<h1 class="xxxl">{data.service.name}</h1>
			<article class="overview">
				{@html data.service.overview}
			</article>
			<section class="lists">
				<h3 class="md">Services</h3>
				<ul>
					{#each data.service.sub_services as item}
						<li>
							{#if item.link}
								<a href={item.link}>{item.name}</a>
							{:else}
								{item.name}
							{/if}
						</li>
					{/each}
				</ul>
				{#if data.service.team_leaders?.length}
					<h3 class="md">Team Leaders</h3>
					<ul>
						{#each data.service.team_leaders ?? [] as item}
							{#if item?.team_id}
								<li>
									<a href="/team/{item.team_id.slug}">{item.team_id.name}, {item.team_id.short_title}</a>
								</li>
							{/if}
						{/each}
					</ul>
				{/if}
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

			{#if data.service.related_articles?.length}
				<section class="articles-section">
					<h2 class="xxxl">Related Articles.</h2>
					<div class="articles-container">
						{#each data.service.related_articles ?? [] as article}
							{#if article}
								<DottedArrowHover
									href="/news/{article?.news_posts_id?.slug}"
								>
									{#if article.news_posts_id?.grid_image}
										<figure class="post-grid-image">
											<img 
												src={assetUrl(article.news_posts_id?.grid_image?.filename_disk)}
												alt={article.news_posts_id?.grid_image?.description} 
											/>
										</figure>
									{/if}
									<article class="post-text">
										<p class="kicker">
											<strong>{article.news_posts_id?.topics?.[0]?.news_topics_id?.name}</strong> {formatDate(article.news_posts_id?.published_date, { fullMonth: true })}
										</p>
										<h3 class="xxl">{article.news_posts_id?.post_title}</h3>
										{#if article.news_posts_id?.article_preview}
											<p class="article-preview">{article.news_posts_id.article_preview}</p>
										{/if}
										<p>Read more <DottedArrow /></p>
									</article>
								</DottedArrowHover>
							{/if}
						{/each}
					</div>
				</section>
			{/if}

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

	.articles-section {
		grid-column: whole;

		h2 {
			margin-bottom: var(--GRID-CELL);
		}
	}

	:global(div.articles-container > .dotted-arrow) {
		flex: 0 0 auto;
		display: grid;

		grid-template-columns: 1fr 3fr;
		@media (max-width: 46.875em) {
			grid-template-columns: 1fr 1fr;
		}

		column-gap: calc(var(--GRID-CELL) / 2);
		align-items: start;

		> figure.post-grid-image {
			margin: 0;
			padding: 0;
			width: 100%;
			align-self: flex-start;

			transition: opacity 0.2s ease;

			> img {
				width: 100%;
				height: auto;
				aspect-ratio: 1 / 1;
				object-fit: cover;
			}
		}

		> article.post-text {
			color: var(--COLOR-BLACK);
			border-top: 1px solid var(--COLOR-DIM-GRAY);
			padding-top: calc(var(--GRID-CELL) / 2);

			p.kicker > strong {
				text-transform: uppercase;
				letter-spacing: 0.05em;
				margin-right: 0.5em;

				@media (max-width: 31.25em) {
					display: block;
					margin-right: 0;
				}
			}

			h3 {
				transition: color 0.2s ease;
				margin-bottom: var(--GRID-CELL);
			}

			p.article-preview {
				height: 2.667em;
				overflow: hidden;
				position: relative;
				z-index: 1;

				@media (max-width: 31.25em) {
					display: none;
				}

				&::after {
					content: "";
					position: absolute;
					z-index: 2;
					bottom: 0;
					right: 0;
					width: 50%;
					height: 1.333em;
					background: linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.667), rgba(255,255,255,1));
				}
			}

			p:last-child:not(:only-child) {
				@media (max-width: 31.25em) {
					display: none;
				}
			}

		}

		&:hover {
			> figure.post-grid-image {
				opacity: 0.8;
			}
			> article.post-text {
				> h3 {
					color: var(--COLOR-MID-GRAY);
				}
				> p {
					color: var(--COLOR-BLACK);
				}
			}
		}
	}
	section.cta-section {
		grid-column: whole;
		margin-top: calc(var(--GRID-CELL) * 3);
	}
</style>