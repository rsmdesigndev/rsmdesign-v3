<script lang="ts" context="module">
</script>

<script lang="ts">
	import { onMount } from "svelte";
	import type { ImageAssetRelation } from "$lib/cms";
	import { assetUrl } from "$lib/cms/assets";
	import { animate, fadeScroll } from "$lib/animate";
	import { createCarousel, calcZIndex as zIndexFor } from "../../scripts/carousel";

	export let images: ImageAssetRelation[];
	export let images_per_slide: number | null;
	export let autoplay: boolean | null;
	export let autoplay_interval: number | null;
	export let label: string = "Image slider";

	let current: number = 0;

	const carousel = createCarousel({
		getIndex: () => current,
		setIndex: (i) => (current = i),
		count: images?.length ?? 0,
		perSlide: images_per_slide ?? 1,
		autoplay,
		interval: autoplay_interval
	});

	const { isPaused, canAutoplay, rotationEnabled, isAdvancing, animationDir } = carousel;
	const { next, prev, togglePlayback, suspend, resume } = carousel;
	const animationDuration = carousel.animationDuration;

	$: imagesPerSlide = images_per_slide ?? 1;
	$: slidePercentage = 100 / imagesPerSlide;

	$: currentDisplay = String(current+1);
	$: if (imagesPerSlide > 1) {
		currentDisplay = `${current+1}–${current+imagesPerSlide}`;
	}

	$: carousel.setCount(images?.length ?? 0);
	$: carousel.setPerSlide(imagesPerSlide);
	$: calcZIndex = (i: number): number => zIndexFor(i, current, images?.length ?? 0, $animationDir);

	onMount(() => carousel.start());
</script>

<template>
	<div class="slider-group"
		 role="group"
		 aria-roledescription="carousel"
		 aria-label={label}
	>
		{#if $canAutoplay}
			<button class="playback"
					class:paused={!$isAdvancing}
					type="button"
					aria-label={$isPaused ? "Start automatic slide rotation" : "Stop automatic slide rotation"}
					on:click={togglePlayback}
			/>
		{/if}
		<div class="images"
			 aria-live={$rotationEnabled ? "off" : "polite"}
			 aria-atomic="false"
			 on:mouseenter={suspend}
			 on:mouseleave={resume}
			 on:focusin={suspend}
			 on:focusout={resume}
			 style:--grid-template-columns={`repeat(${images.length}, 1fr)`}
			 style:--slide-width={`calc((100% - var(--SPACE-MD) * ${imagesPerSlide - 1}) / ${imagesPerSlide})`}
			 style:--slider-width={imagesPerSlide === images.length ? "100%" : 
			 	`calc(100% + (var(--slide-width) + var(--SPACE-MD)) * ${images.length - imagesPerSlide})`}
			 style:transform={(imagesPerSlide > 1) && (images.length > imagesPerSlide)
					? `translateX(calc(${current * -1 / 2} * (var(--slide-width) + var(--SPACE-MD))))`
					: "none"
				}
			 style={`transition: transform ${animationDuration}ms ease`}
		>
			{#each images ?? [] as image, i}
				<div class="slide-wrapper"
					 role="group"
					 aria-roledescription="slide"
					 aria-label={`${i + 1} of ${images?.length ?? 0}`}
				>
					<img
						src={assetUrl(image?.directus_files_id?.filename_disk)}
						alt={image?.directus_files_id?.description ?? `Slider image ${i} of ${images.length}`}
						class={`slide anim-${imagesPerSlide === 1 ? "fade" : "slide"}`}
						class:slide-active={i === current}
						style={`transition: opacity ${animationDuration}ms ease`}
						style:z-index={calcZIndex(i)}
					/>
				</div>
			{/each}
		</div>
		<button class="prev" aria-label="Previous slide" on:click={prev}
				on:mouseenter={suspend} on:mouseleave={resume}
				on:focus={suspend} on:blur={resume}
		></button>
		<button class="next" aria-label="Next slide" on:click={next}
				on:mouseenter={suspend} on:mouseleave={resume}
				on:focus={suspend} on:blur={resume}
		></button>
	</div>
</template>

<style lang="scss">
	.slider-group {
		grid-column: 1 / -1;
		grid-row: 1 / span 1;
		display: grid;
		grid-template-columns: 1fr 1fr;
		position: relative;
	}

	.slide-wrapper {
		display: contents;
	}

	.images {
		grid-column: 1 / -1;
		grid-row: 1 / span 1;
		width: var(--slider-width);

		display: grid;
		grid-template-columns: var(--grid-template-columns);
		column-gap: var(--SPACE-MD);
		position: relative;
		overflow: hidden;
		align-items: start;

		img {
			grid-row: 1;
			z-index: 0;

			width: 100%;
			height: auto;
			object-fit: contain;

			margin: 0;
			padding: 0;

			&.anim-fade {
				grid-column: 1;
				opacity: 0;
				transform: 0;
				&.slide-active {
					opacity: 1;
					z-index: 2;
				}
			}
		}
	}

	button {
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
		z-index: 2;
		
		grid-row: 1 / span 1;

		background: none;
		outline: none;
		border: none;
		box-shadow: none;

		&.prev {
			grid-column: 1 / span 1;
			cursor: url(/img/arrow-left.png) 32 32, auto;
		}
		&.next {
			grid-column: 2 / span 1;
			cursor: url(/img/arrow-right.png) 32 32, auto;
		}
		&.playback {
			position: absolute;
			right: 0;
			bottom: 0;
			z-index: 3;
			cursor: pointer;
			width: var(--SPACE-LG);
			height: var(--SPACE-LG);
			margin: var(--SPACE-SM);
			color: var(--color-primary, inherit);
			font-size: var(--FONT-SIZE-MD);
			line-height: 1;

			display: flex;
			align-items: center;
			justify-content: center;
			gap: 0.2em;

			&::before,
			&::after {
				content: "";
				display: block;
				width: 2.5px;
				height: 0.5em;
				background: var(--color-secondary);
			}

			&.paused {
				gap: 0;
				&::before {
					width: 0.5em;
					height: 0.6em;
					clip-path: polygon(0 0, 100% 50%, 0 100%);
				}
				&::after {
					display: none;
				}
			}
		}

		padding: 0;
		margin: 0;
	}
</style>