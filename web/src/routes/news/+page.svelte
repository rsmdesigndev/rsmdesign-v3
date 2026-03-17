<script lang="ts">
	import { slide } from "svelte/transition";
	import type { PageData } from "./$types";
	import { page } from "$app/stores";
	import {
		getNewsFiltersFromUrl,
		makeGraphqlNewsFilters,
		makeNewsFilterUrlParams
	} from "$lib/cms/filters";
	import { onMount } from "svelte";
	import type { NewsQuery } from "$lib/__generated__/graphql";
	import { cmsClient } from "$lib/cms";
	import { assetUrl } from "$lib/cms/assets";
	import Slideshow from "$lib/components/Slideshow.svelte";
	import DottedArrow from "$lib/components/DottedArrow.svelte";
	import DottedArrowHover from "$lib/components/DottedArrowHover.svelte";
	import { fade } from "svelte/transition";
	import SeoHead from "$lib/components/SeoHead.svelte";
	import { formatDate } from "$lib/format";
	import PageBlocksV3, { type ProjectData } from "$lib/components/page_builder/page_blocks_v3/index.svelte";
	import PageBlocks from "$lib/components/page_builder/page_blocks/index.svelte";

	export let data: PageData;

	let loading = false;
	let posts: NewsQuery["news_posts"] = [];

	let topicsExpanded = false;
	let topicFilterSlugs = new Set<string>();

	async function reloadNewsPosts() {
		loading = true;
		try {
			const newsRes = await cmsClient.News({ filter: makeGraphqlNewsFilters(topicFilterSlugs) });
			posts = newsRes.news_posts;
		} catch (err) {
			console.error(err);
		} finally {
			loading = false;
		}
	}

	function toggleExpandTopics() {
		topicsExpanded = !topicsExpanded;
	}

	function toggleTopicFilter(slug?: string | null) {
		if (!slug) {
			return;
		}
		if (topicFilterSlugs.has(slug)) {
			topicFilterSlugs.delete(slug);
		} else {
			topicFilterSlugs.add(slug);
		}
		topicFilterSlugs = topicFilterSlugs;

		updateUrlParams();
		reloadNewsPosts();
	}

	function updateUrlParams() {
		const url = new URL($page.url);
		url.search = makeNewsFilterUrlParams(topicFilterSlugs, $page.url.searchParams);
		history.replaceState(history.state, "", url);
	}

	onMount(() => {
		posts = data.news_posts;
		console.log(posts);
		const urlFilters = getNewsFiltersFromUrl($page.url.searchParams);
		topicFilterSlugs = urlFilters.topicFilterSlugs;
		if (urlFilters.hasUrlFilter) {
			reloadNewsPosts();
		}
	});
</script>

<SeoHead
	title="News & Information"
	description="Learn about our industry, projects, studios, team members, press, and more. Read the latest news and information on our site today."
/>

<template>
	{#if data.news_page.news_use_page_blocks_v3}
		{#if data.news_page.news_page_blocks_v3}
			<PageBlocksV3 blocks={data.news_page.news_page_blocks_v3} />
		{:else}
			<div class="container">Page Blocks v3 selected, but no blocks added.</div>
		{/if}
	{:else}
		<div class="container">
			{#if data?.news_page?.use_page_blocks}
				<h1 class="xxxl">News & Ideas</h1>
				<section class="slideshow-section">
					<Slideshow interval={5000} items={data.slider_articles} let:item>
						<a href="/news/{item.slug}">
							<figure class="featured-article" in:fade out:fade>
								<img
									src={assetUrl(item.hero_image?.filename_disk)}
									alt={item.hero_image?.description}
									class={item.hero_image_crop_attachment === "left"
										? "position-left"
										: item.hero_image_crop_attachment === "center_left"
										? "position-center-left"
										: item.hero_image_crop_attachment === "center"
										? ""
										: item.hero_image_crop_attachment === "center_right"
										? "position-center-right"
										: item.hero_image_crop_attachment === "right"
										? "position-right"
										: ""}
								/>
								<figcaption>
									<h2 class="xl">{item.post_title}</h2>
								</figcaption>
							</figure>
						</a>
					</Slideshow>
				</section>
				<section class="news-page-blocks">
					<PageBlocks content={data?.news_page?.page_content} />
				</section>
			{:else}
				<h1 class="xxxl">News.</h1>
				<section class="slideshow-section">
					<Slideshow interval={5000} items={data.slider_articles} let:item>
						<a href="/news/{item.slug}">
							<figure class="featured-article" in:fade out:fade>
								<img
									src={assetUrl(item.hero_image?.filename_disk)}
									alt={item.hero_image?.description}
									class={item.hero_image_crop_attachment === "left"
										? "position-left"
										: item.hero_image_crop_attachment === "center_left"
										? "position-center-left"
										: item.hero_image_crop_attachment === "center"
										? ""
										: item.hero_image_crop_attachment === "center_right"
										? "position-center-right"
										: item.hero_image_crop_attachment === "right"
										? "position-right"
										: ""}
								/>
								<figcaption>
									<h2 class="xxxl">{item.post_title}</h2>
								</figcaption>
							</figure>
						</a>
					</Slideshow>
				</section>
			{/if}
			<section class={`topics ${data?.news_page?.use_page_blocks ? "topics--whole" : ""}`}>
				<button class="reset" class:topicsExpanded on:click={toggleExpandTopics}>Topics</button>
				{#if topicsExpanded}
					<div transition:slide={{ duration: 400 }}>
						<ul class="filters">
							{#each data.news_topics as topic}
								<li
									class="filter-item"
									class:active={topic.slug && topicFilterSlugs.has(topic.slug)}
									on:click={() => toggleTopicFilter(topic.slug)}
									on:keydown={null}
									role="button"
								>
									{topic.name}
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</section>
			<section class="news-posts">
				{#if !loading}
					{#each posts as post}
						<DottedArrowHover
							href="/news/{post.slug}{makeNewsFilterUrlParams(
								topicFilterSlugs,
								$page.url.searchParams
							)}"
						>
							
							{#if post.grid_image}
								<figure class="post-grid-image">
									<img 
										src={assetUrl(post.grid_image.filename_disk)}
										alt={post.grid_image.description} 
									/>
								</figure>
							{/if}
							<article class="post-text">
								<p class="kicker">
									<strong>{post.topics?.[0]?.news_topics_id?.name ?? ""}</strong> {post.published_date ? formatDate(post.published_date, { fullMonth: true }) : ""}
								</p>
								<h3 class="xxl">{post.post_title}</h3>
								{#if post.article_preview}
									<p class="article-preview">{post.article_preview}</p>
								{:else}
									{@const pageContent = post?.page_content?.[0]?.item}
									<div class="article-preview">
										{#if pageContent?.__typename == "page_block_rich_text"}
											{@html pageContent.content?.replace(/<\/?[^>]+(>|$)/g, "")}
										{/if}
									</div>
								{/if}
								<p>Read more <DottedArrow /></p>
							</article>
						</DottedArrowHover>
					{/each}
				{/if}
			</section>
		</div>
	{/if}
</template>

<style lang="scss">
	h1 {
		grid-column: whole;
		margin: var(--GRID-CELL) 0 0.5rem;
	}

	section.news-page-blocks {
		grid-column: whole;
	}

	section.slideshow-section {
		grid-column: whole;
		margin-bottom: calc(var(--GRID-CELL) / 2);

		:global {
			.featured-article > figcaption {
				margin: 0 0 var(--GRID-CELL) var(--GRID-CELL);
			}

			.featured-article > figcaption > h2 {
				font-size: 22.5px;

				@media screen and (min-width: 768px) {
					font-size: 40px;
				}

				@media screen and (min-width: 1200px) {
					font-size: 80px;
				}
			}
		}
	}
	section.topics {
		grid-column: whole;

		&--whole {
			grid-column: whole;
			margin-top: calc(var(--GRID-CELL) / 2);
		}

		button {
			margin: 0;
			font-weight: 700;
			position: relative;

			&::after {
				content: "›";
				position: absolute;
				display: inline-flex;
				color: var(--COLOR-ORANGE);
				font-size: 200%;
				font-weight: 300;
				line-height: 0.618;
				margin-left: 0.2em;
				transition: transform 0.3s ease;
			}

			&.topicsExpanded::after {
				transform: rotate(-90deg) translate(-0.1em, -0em);
			}
		}

		ul {
			margin-top: 0.333em;
		}

		li.filter-item {
			font-size: var(--FONT-SIZE-XS);
			font-weight: 700;
			text-transform: uppercase;
			letter-spacing: 0.05em;

			margin-bottom: 0.167em;

			color: var(--COLOR-MID-GRAY);
			transition: color 0.2s ease;
			&:hover {
				cursor: pointer;
				color: var(--COLOR-DIM-GRAY);
			}
			&.active {
				color: var(--COLOR-ORANGE);
			}
		}
	}
	.filter-item {
		color: #a2a4a7;
		&:hover {
			color: #575757;
		}
		cursor: pointer;
		&.active {
			color: #ed4d29;
		}
	}
	section.news-posts {
		grid-column: whole;

		display: flex;
		flex-direction: column;
		//row-gap: calc(var(--GRID-CELL) / 2);
	}

	:global(section.news-posts > .dotted-arrow) {
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

			.article-preview {
				height: 2.667em;
				overflow: hidden;
				position: relative;
				z-index: 1;
				margin-bottom: 1em;

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
</style>
