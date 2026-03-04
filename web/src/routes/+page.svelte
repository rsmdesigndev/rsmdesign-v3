<script lang="ts">
	import type { PageData } from "./$types";
	import PageBlocks from "$lib/components/page_builder/page_blocks/index.svelte";
	import PageBlocksV3, { type ProjectData } from "$lib/components/page_builder/page_blocks_v3/index.svelte";
	import { setProjectGridContext } from "$lib/components/ProjectsGrid.svelte";
	import { assetUrl } from "$lib/cms/assets";
	import Section from "$lib/components/Section.svelte";
	import Slideshow from "$lib/components/Slideshow.svelte";
	import DottedArrow from "$lib/components/DottedArrow.svelte";
	import DottedArrowHover from "$lib/components/DottedArrowHover.svelte";
	import { fade } from "svelte/transition";
	import SeoHead from "$lib/components/SeoHead.svelte";
	import { onMount } from "svelte";
	import VimeoPlayer from '@vimeo/player';

	export let data: PageData;
	let vimeoStatus: boolean = true;
	let vimeoPlayer: HTMLElement;
	let nativeVideo: HTMLVideoElement;
	let nativeMobileVideo: HTMLVideoElement;

	setProjectGridContext({
		projects: data.projects,
		totalProjectsCount: data.totalProjectsCount,
		filter: data.projectsFilter
	});

	onMount(async () => {
		if (data.homepage?.hero_video_id) {
			const player = new VimeoPlayer(vimeoPlayer);

			player.on('loaded', function() {
				console.log('Video has loaded.');
				vimeoStatus = true;
			});

			player.on('error', function() {
				console.log('Video failed to load.');
				vimeoStatus = false;
			});
		}

		if (data.homepage?.native_video?.filename_disk) {
			nativeVideo.play();
		}

		if (data.homepage?.native_video_mobile?.filename_disk) {
			nativeMobileVideo.play();
		}
	})
</script>

<SeoHead
	title={data.homepage?.seo_title ?? ""}
	description={data.homepage?.seo_description ?? undefined}
/>

<svelte:head>
	{#each data.sliderProjects as project}
		{#if project.hero_image}
			<link rel="preload" as="image" href={assetUrl(project.hero_image.filename_disk)} />
		{/if}
	{/each}
</svelte:head>

<template>
	{#if data.homepage?.home_use_page_blocks_v3}
		{#if data.homepage.home_page_blocks_v3}
			<PageBlocksV3 blocks={data.homepage.home_page_blocks_v3} />
		{:else}
			<div class="container">Page Blocks v3 selected, but no blocks added.</div>
		{/if}
	{:else}
		{#if data.homepage?.native_video?.filename_disk}
			<figure class="hero">
				{#if data.homepage?.native_video_mobile?.filename_disk}
					<div class="hero-video hero-video--desktop">
						<video bind:this={nativeVideo} loop autoplay muted playsinline>
							<source src={assetUrl(data.homepage?.native_video?.filename_disk)} type="{data.homepage?.native_video?.type}" />
							<track kind="captions" />
						</video>
					</div>
				{:else}
					<div class="hero-video">
						<video bind:this={nativeVideo} loop autoplay muted playsinline>
							<source src={assetUrl(data.homepage?.native_video?.filename_disk)} type="{data.homepage?.native_video?.type}" />
							<track kind="captions" />
						</video>
					</div>
				{/if}
				{#if data.homepage?.native_video_mobile?.filename_disk}
					<div class="hero-video hero-video--mobile">
						<video bind:this={nativeMobileVideo} loop autoplay muted playsinline>
							<source src={assetUrl(data.homepage?.native_video_mobile?.filename_disk)} type="{data.homepage?.native_video_mobile?.type}" />
							<track kind="captions" />
						</video>
					</div>
				{/if}
			</figure>
		{:else if data.homepage?.hero_video_id}
			<figure class="hero">
				{#if !vimeoStatus}
					<img src={assetUrl(data.homepage?.video_fallback?.filename_disk)} alt={`RSM Design ${data.homepage?.seo_title}`} />
				{:else}
					<div class="hero-video">
						<iframe
							title="Video"
							src="https://player.vimeo.com/video/{data.homepage?.hero_video_id}?background=1"
							width="100%"
							height="100%"
							frameborder="0"
							allow="autoplay; fullscreen"
							allowfullscreen
							loading="lazy"
							bind:this={vimeoPlayer}
						/>
					</div>
				{/if}
			</figure>
		{:else}
			<section class="slideshow-section">
				<Slideshow fullBleed interval={5000} items={data.sliderProjects} let:item>
					<a href="/work/{item.slug}">
						<figure in:fade={{ delay: 300 }} out:fade={{ delay: 600 }}>
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
								<h3>{item.project_title}</h3>
								<p>{item.location}</p>
							</figcaption>
						</figure>
					</a>
				</Slideshow>
			</section>
		{/if}

		<PageBlocks content={data.homepage?.page_content} />

		{#if data.projectsInProgress.length}
			<section class="in-progress-section">
				<h2 class="xxxl">In progress.</h2>
				<div class="grid-col-3">
					{#each data.projectsInProgress as project}
						<a href="/work/{project.slug}">
							<figure>
								<img
									src={assetUrl(project.grid_image?.filename_disk)}
									alt={project.grid_image?.description}
								/>
								<figcaption>
									<h3 class="lg">{project.project_title}</h3>
									<p>{project.location}</p>
								</figcaption>
							</figure>
						</a>
					{/each}
				</div>
			</section>

			<section class="in-progress-cta">
				<DottedArrowHover text_alignment="right" href="/services/in-progress">
					<p>View Work in Progress <DottedArrow /></p>
				</DottedArrowHover>
			</section>
		{/if}
	{/if}
</template>

<style lang="scss">
	figure.hero {
		grid-column: viewport;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100vw;
		height: 100vh;
		padding: 0;
		margin: 0 0 calc(var(--GRID-CELL) * 6);
		z-index: 8;
		overflow: hidden;

		@media (min-width: 768px) {
			height: 133.333vw;
			max-height: 100vh;
			margin-bottom: calc(var(--GRID-CELL) * 3);

			@media (max-height: 133.333vw) {
				height: 100vh;
			}
		}


		> div.hero-video {
			position: relative;
			z-index: 8;

			&--mobile {
				display: block;
				width: auto;
				height: 100vh;
				aspect-ratio: 9/16;

				@media (min-width: 546px) {
					width: 100vw;
					height: auto;
					padding-bottom: calc(100vw * 16 / 9);
				}
			}

			&--desktop {
				display: none;
				flex: 0 0 calc(100vh * 16 / 9);
				height: 0;
				padding-bottom: 100vh;

				@media (min-width: 177.777vh) {
					flex-basis: 100vw;
					padding-bottom: calc(100vw * 9 / 16);
				}

				@media (max-width: 62.5em) {
					flex-basis: calc(133.333vw * 16 / 9);
					padding-bottom: 133.333vw;

					@media (max-height: 133.333vw) {
						flex-basis: calc(100vh * 16 / 9);
						padding-bottom: 100vh;
					}

					@media (max-height: 56.25vw) {
						flex-basis: 100vw;
						padding-bottom: calc(100vw * 9 / 16);
					}
				}
			}

			@media screen and (min-width: 768px) {
				&--desktop {
					display: block;
				}

				&--mobile {
					display: none;
				}
			}

			> iframe,
			> video {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
			}
		}
	}
	section.slideshow-section {
		grid-column: viewport;
		width: 100%;
		height: 100vh;
		margin-bottom: calc(var(--GRID-CELL) * 6);
	}
	section.in-progress-section {
		grid-column: container;
		width: 100%;
		max-width: 125rem;
		justify-self: center;

		h2 {
			margin-bottom: 1rem;
		}

		a {
			&:hover figcaption > h3 {
				color: var(--COLOR-ORANGE);
			}
			@media (max-width: 46.875em) {
				&:nth-of-type(3n) {
					grid-column: span 2;
					> figure > figcaption > h3 {
						font-size: var(--FONT-SIZE-XXL);
					}
					> figure > figcaption > p {
						font-size: var(--FONT-SIZE-MD);
					}
				}
			}
			@media (max-width: 31.25em) {
				&:nth-of-type(3n) {
					grid-column: span 1;
					> figure > figcaption > h3 {
						font-size: var(--FONT-SIZE-XL);
					}
					> figure > figcaption > p {
						font-size: var(--FONT-SIZE-SM);
					}
				}
			}
		}

		figure {
			padding: 0;
			margin: 0;

			> img {
				width: 100%;
				height: auto;
				aspect-ratio: 1/1;
				margin-bottom: 0.25rem;
			}

			> figcaption {
				> h3 {
					transition: color 0.3s ease;

					@media (max-width: 46.875em) {
						font-size: var(--FONT-SIZE-XL);
					}
				}
				> p {
					font-size: var(--FONT-SIZE-SM);
					font-weight: 700;
					color: var(--COLOR-MID-GRAY);
				}
			}
		}
	}

	section.in-progress-cta {
		grid-column: container;
		width: 100%;
		max-width: 125rem;
		justify-self: center;
	}
</style>
