<script lang="ts" context="module">
	export type HeroData = {
		hero_media_type?: string | null;
		hero_image?: ImageAssetRelation | null;
		hero_video_source?: string | null;
		hero_video_vimeo?: string | null;
		hero_video_youtube?: string | null;
		hero_headline?: string | null;
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import type { ImageAssetRelation } from "$lib/cms";
	import { assetUrl } from "$lib/cms/assets";
	import { animate, AnimateTrigger } from "$lib/animate";
	import type { ProjectData } from "../index.svelte";
	import Cta from "../atoms/Cta.svelte";

	export let data: HeroData;
	export let project: boolean = false;
	export let projectData: ProjectData;

	$: h1Height = 0;
	$: h3Height = 0;
	$: h1ContainerHeight = 0;
	$: h2Height = 0;
	$: headingsHeight = h3Height + h1ContainerHeight + h2Height;
	$: expertiseHeight = 0;

	const expertiseCta = {
		cta_type: "link",
		cta_size: "md",
		cta_icon: "none",
		cta_style: "space",
		cta_hover_highlight: "light"
	}

	// Remove <p> tags from hero headline
	let headline: HTMLElement;
	onMount(() => {
		if (data.hero_headline) {
			const paragraphsInHeadline = headline.querySelectorAll('p');
			headline.innerHTML = "";
			paragraphsInHeadline.forEach((paragraph) => {
				headline.append(paragraph.innerHTML);
			});
		}
	});
</script>

<section class="hero"
		 style:--expertise-height={expertiseHeight}
		 style:--headings-height={headingsHeight}
		 style:--h1-height={h1Height}
		 style:--h1-container-height={h1ContainerHeight}
		 style:--h2-height={h2Height}
		 style:--h3-height={h3Height}
>
	{#if data.hero_media_type === "Video"}
		<div class="video-wrapper">
			<div class="video-container">
				{#if data.hero_video_source === "vimeo"}
					<iframe
						title="Video"
						src={`https://player.vimeo.com/video/${data.hero_video_vimeo}?background=1`}
						height="100%"
						frameborder="0"
						allow="autoplay; fullscreen"
						allowfullscreen
						loading="lazy"
					/>
				{:else}
					<iframe
						title="Video"
						src={`https://www.youtube.com/embed/${data.hero_video_youtube}?controls=0&autoplay=1&mute=1&playsinline=1&loop=1`}
						height="100%"
						frameborder="0"
						allow="autoplay; fullscreen"
						allowfullscreen
						loading="lazy"
					/>
				{/if}
			</div>
		</div>
	{:else}
		<img
			src={assetUrl(data.hero_image?.filename_disk)}
			alt={data.hero_image?.description}
		/>
	{/if}
	{#if data.hero_headline}
		<div class="hero-scrim-top" />
	{/if}
	<div class="hero-scrim-bottom" />
	{#if project}
		<div class="project-details">
			{#if data.hero_media_type === "Video"}
				<div class="project-hero-animate"
					 use:animate={ { trigger: AnimateTrigger.WhileScrollingInView, targetSelector: ".video-wrapper", animClass: "hero-media-animate" } }
				/>
			{:else}
				<div class="project-hero-animate"
					 use:animate={ { trigger: AnimateTrigger.WhileScrollingInView, targetSelector: "img", animClass: "hero-media-animate" } }
				/>
			{/if}
			<div class="project-hero-animate"
				 use:animate={ { trigger: AnimateTrigger.WhileScrollingInView, targetSelector: "#project-hero-h3", animClass: "project-hero-h3" } }
			/>
			<div class="project-hero-animate"
				 use:animate={ { trigger: AnimateTrigger.WhileScrollingInView, targetSelector: "#project-hero-h1", animClass: "project-hero-h1" } }
			/>
			<div class="project-hero-animate"
				 use:animate={ { trigger: AnimateTrigger.WhileScrollingInView, targetSelector: "#project-hero-h2", animClass: "project-hero-h2" } }
			/>

			<div class="project-headings">
				<h3 bind:offsetHeight={h3Height}
					id="project-hero-h3" 
					class="lg lowercase"
				>
					{projectData.project_location_city},
					{#if projectData.project_location_state && (projectData.project_location_country === "United States of America")}
						{projectData.project_location_state}
					{:else if projectData.project_location_state}
						{projectData.project_location_state},
					{/if}
					{#if projectData.project_location_country != "United States of America"}
						{projectData.project_location_country}
					{/if}
				</h3>
				<div bind:offsetHeight={h1ContainerHeight}
					 class="project-hero-h1-container"
				>
					<h1 id="project-hero-h1" 
						class="xxxl" 
						bind:offsetHeight={h1Height}
					>
						{projectData.project_title}
					</h1>
				</div>
				<h2 bind:offsetHeight={h2Height}
					bind:this={headline}
					id="project-hero-h2" 
					class="xxxl"
				>
					{@html data.hero_headline}
				</h2>
			</div>

			<div bind:offsetHeight={expertiseHeight}
				 class="project-expertise"
			>
				{#if projectData.project_services.length > 0}
					<div class="project-type">
						<h3 class="lg lowercase">
							Project type
						</h3>
						{#each projectData.project_services.slice(0, 2) as service}
							<Cta data={ {...expertiseCta, 
										 cta_text_light: service.services_id.name,
										 cta_link: `/${service.services_id.slug}` 
									  } }
							/>
						{/each}
					</div>
				{/if}
				{#if projectData.project_markets.length > 0}
					<div class="project-sector">
						<h3 class="lg lowercase">
							Project sector
						</h3>
						{#each projectData.project_markets.slice(0, 2) as market}
							<Cta data={ {...expertiseCta, 
										 cta_text_light: market.markets_id.name,
										 cta_link: `/${market.markets_id.slug}` 
									  } }
							/>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{:else}
	{/if}
</section>

<style lang="scss">
	.hero {
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
		z-index: 5;
		
		grid-column: viewport;
		width: 100%;
		position: relative;
		margin-bottom: calc(var(--expertise-height) * 1px);

		.video-wrapper {
			width: 100vw;
			height: 100vh;

			position: sticky;
			top: 0;
			overflow-x: hidden;
			display: flex;
			align-items: center;
			justify-content: center;

			.video-container {
				//z-index: 5; // stack this on top of the header background
				height: 100%;
				flex: 1 0 calc(100vh * 16 / 9);

				@media (min-width: 177.777vh) {
					height: calc(100vw * 9 / 16);
					flex-basis: 100vw;
				}

				> iframe {
					height: 100%;
					width: 100%;
				}
			}
		}

		img {
			//z-index: 5; // stack this on top of the header background
			width: 100%;
			height: 100vh;
			object-fit: cover;
			position: sticky;
			top: 0;
		}

		.hero-scrim-top {
			//z-index: 5; // stack this on top of the header background
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 50vh;
			//0, 1, 4, 9, 16, 25, 36, 49, 64, 81, 100
			background: linear-gradient(
				rgba(26,24,24,0.5) 0%,
				rgba(26,24,24,0.405) 10%,
				rgba(26,24,24,0.32) 20%,
				rgba(26,24,24,0.245) 30%,
				rgba(26,24,24,0.18) 40%,
				rgba(26,24,24,0.125) 50%,
				rgba(26,24,24,0.08) 60%,
				rgba(26,24,24,0.045) 70%,
				rgba(26,24,24,0.02) 80%,
				rgba(26,24,24,0.005) 90%,
				rgba(26,24,24,0) 100%
			);
			mix-blend-mode: hard-light;
		}

		.hero-scrim-bottom {
			//z-index: 5; // stack this on top of the header background
			position: relative;
			width: 100%;
			height: 100vh;
			background: linear-gradient(
				transparent 0%,  
				white 100%
			);
			//0, 1, 4, 9, 16, 25, 36, 49, 64, 81, 100
			background: linear-gradient(
				rgba(255,255,255,0) 0%,
				rgba(255,255,255,0.01) 10%,
				rgba(255,255,255,0.04) 20%,
				rgba(255,255,255,0.09) 30%,
				rgba(255,255,255,0.16) 40%,
				rgba(255,255,255,0.25) 50%,
				rgba(255,255,255,0.36) 60%,
				rgba(255,255,255,0.49) 70%,
				rgba(255,255,255,0.64) 80%,
				rgba(255,255,255,0.81) 90%,
				rgba(255,255,255,1) 100%
			);
		}

		.project-details {
			//z-index: 5; // stack this on top of the header background
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;

			display: grid;
			grid-template-columns: var(--GRID-WRAPPER);

			> .project-hero-animate {
				position: absolute;
				top: 0;
				left: 0;
				height: 100%;
				width: 100%;
			}

			> .project-headings {
				grid-column: sixth-start 1 / sixth-end 4;
				@media (max-width: 62.5em) {
					grid-column: third-start 1 / third-end 2;
				}
				@media (max-width: 31.25em) {
					grid-column: main;
				}

				height: 100vh;
				box-sizing: border-box;
				padding-top: calc(var(--GRID-CELL) * 2);
				position: sticky;
				top: 0;
				//margin-bottom: calc(1px * var(--expertise-height));

				> h3 {
					color: white;
					margin-bottom: 0.15em;
				}

				> .project-hero-h1-container {
					position: relative;
					height: 50vh;
					height: calc(100vh - (var(--GRID-CELL) * 2 + (var(--h3-height) + var(--h2-height)) * 1px + var(--GRID-CELL) * 4));
					margin-bottom: 0.5em;

					> h1 {
						position: absolute;
						color: white;
					}
				}

				> h2 {
					opacity: 0;
					color: var(--COLOR-BLACK);
					width: clamp(100%, 22ch, 96vw);
				}
			}
			> .project-expertise {
				position: absolute;
				bottom: 0;
				grid-column: viewport;
				width: 100%;
				display: grid;
				grid-template-columns: var(--GRID-WRAPPER);
				padding-top: calc(var(--GRID-CELL) * 2);
				margin-bottom: calc(100vh - (var(--GRID-CELL) * 2 + (var(--headings-height) + var(--expertise-height)) * 1px));

				@media (max-width: 31.25em) {
					grid-column: main;
					display: flex;
					flex-direction: row;
					row-gap: var(--GRID-CELL);
				}

				> .project-type,
				> .project-sector {
					width: 100%;
					grid-row: 1;
				}

				> .project-type {
					grid-column: sixth-start 1 / sixth-end 2;

					@media (max-width: 62.5em) {
						grid-column: third-start 1 / third-end 1;
					}
				}

				> .project-sector {
					grid-column: sixth-start 3 / sixth-end 4;

					@media (max-width: 62.5em) {
						grid-column: third-start 2 / third-end 2;
					}
				}
			}
		}
	}

	:global {
		.hero-media-animate {
			animation: hero-media-animate 1s linear forwards;
		}

		@keyframes hero-media-animate {
			0% {
				opacity: 1;
			}
			50% {
				opacity: 1;
			}
			83.3% {
				opacity: 0;
			}
			100% {
				opacity: 0;
			}
		}

		h3.project-hero-h3 {
			animation: project-hero-h3 1s ease forwards;
		}

		@keyframes project-hero-h3 {
			0% {
				opacity: 1;
			}
			33.3% {
				opacity: 1;
			}
			50% {
				opacity: 0;
			}
			100% {
				opacity: 0;
			}
		}

		h1.project-hero-h1 {
			animation: project-hero-h1 1s ease forwards;
		}

		@keyframes project-hero-h1 {
			0% {
				top: 0;
				font-size: var(--FONT-SIZE-XXXL);
				font-weight: 400;
				color: white;
			}
			33.3% {
				top: 0;
				font-size: var(--FONT-SIZE-XXXL);
				font-weight: 400;
				color: white;
			}
			50% {
				color: white;
				font-weight: 400;
			}
			66.7% {
				top: calc((var(--h1-container-height) - var(--h1-height)) * 1px);
				font-size: var(--FONT-SIZE-LG);
				font-weight: 700;
				color: var(--COLOR-BLACK);
				transform: translate(0rem, 0rem);
			}
			100% {
				top: calc((var(--h1-container-height) - var(--h1-height)) * 1px);
				font-size: var(--FONT-SIZE-LG);
				font-weight: 700;
				color: var(--COLOR-BLACK);
				transform: translate(0rem, calc(var(--SPACE-LG) * -1));
			}
		}

		h2.project-hero-h2 {
			animation: project-hero-h2 1s ease forwards;
		}

		@keyframes project-hero-h2 {
			0% {
				opacity: 0;
			}
			33.3% {
				opacity: 0;
			}
			50% {
				opacity: 0;
			}
			66.7% {
				opacity: 1;
				transform: translate(0rem, 0rem);
			}
			100% {
				opacity: 1;
				transform: translate(0rem, calc(var(--SPACE-SM) * -1));
			}
		}
	}
</style>