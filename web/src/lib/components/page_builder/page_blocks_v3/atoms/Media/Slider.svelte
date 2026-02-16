<script lang="ts" context="module">
</script>

<script lang="ts">
	import { onMount } from "svelte";
	import type { ImageAssetRelation } from "$lib/cms";
	import { assetUrl } from "$lib/cms/assets";
	import { animate, fadeScroll } from "$lib/animate";

	export let images: ImageAssetRelation[];
	export let images_per_slide: number | null;
	export let autoplay: boolean | null;
	export let autoplay_interval: number | null;

	let current: number = 0;
	let isAnimating: boolean = false;
	let animationDir: -1 | 0 | 1 = 0; // -1 for left, 1 for right
	let animationDuration: number = 200;
	let intervalId: any = null;

	$: imagesPerSlide = images_per_slide ?? 1;
	$: slidePercentage = 100 / imagesPerSlide;

	$: currentDisplay = String(current+1);
	$: if (imagesPerSlide > 1) {
		currentDisplay = `${current+1}–${current+imagesPerSlide}`;
	}

	function next() {
		if (isAnimating) return;

		current += 1;
		if (current > (images?.length ?? 0) - imagesPerSlide) {
			current = 0;
		}

		isAnimating = true;
		animationDir = 1;
		setTimeout(() => isAnimating = false, animationDuration - 100);

		if (autoplay) restartInterval();
	}

	function prev() {
		if (isAnimating) return;

		current -= 1;
		if (current < 0) {
			current = (images?.length ?? 0) - imagesPerSlide;
		}

		isAnimating = true;
		animationDir = -1;
		setTimeout(() => isAnimating = false, animationDuration - 100);

		if (autoplay) restartInterval();
	}

	$: isNextSlide = (i: number): boolean => {
		if (images?.length === 1) {
			return false;
		}

		if (current === images?.length - 1) {
			// if on the last slide, "next slide" would be the first slide
			return i === 0;
		}
		
		return i === current + 1;
	}

	$: isPrevSlide = (i: number): boolean => {
		if (images?.length === 1) {
			return false;
		}
		
		if (current === 0) {
			// if on the first slide, "prev slide" would be the last slide
			return i === images?.length - 1;
		}

		return i === current - 1;
	}

	// Calculates the correct Z index for each slide so that
	// they dont overlap each other while animating.
	$: calcZIndex = (i: number): number => {
		if (i === current) {
			return 2;
		} else if (isNextSlide(i)) {
			if (animationDir === 1) {
				return 0;
			} else {
				return 1;
			}
		} else if (isPrevSlide(i)) {
			if (animationDir === -1) {
				return 0;
			} else {
				return 1;
			}
		} else {
			return 0;
		}
	}

	$: restartInterval = () => {
		if (intervalId !== null) {
			clearInterval(intervalId);
		}
		intervalId = setInterval(next, autoplay_interval);
	}

	onMount(() => {
		if (autoplay) {
			restartInterval();
			return () => clearInterval(intervalId);
		}
	});
</script>

<template>
	<div class="images"
		 style:--grid-template-columns={`repeat(${images.length}, 1fr)`}
		 style:--slide-width={`calc((100% - var(--SPACE-MD) * ${imagesPerSlide - 1}) / ${imagesPerSlide})`}
		 style:--slider-width={imagesPerSlide === images.length ? "100%" : 
		 	`calc(100% + (var(--slide-width) + var(--SPACE-MD)) * ${images.length - imagesPerSlide})`}
		 style:transform={(imagesPerSlide > 1) && (images.length > imagesPerSlide)
				? `translateX(calc(${current * -1 / 2} * (var(--slide-width) + var(--SPACE-MD)))`
				: "none"
			}
		 style={`transition: transform ${animationDuration}ms ease`}
	>
		{#each images ?? [] as image, i}
			<img
				src={assetUrl(image?.directus_files_id?.filename_disk)}
				alt={image?.directus_files_id?.description ?? `Slider image ${i} of ${images.length}`}
				class={`slide anim-${imagesPerSlide === 1 ? "fade" : "slide"}`}
				class:slide-active={i === current}
				style={`transition: opacity ${animationDuration}ms ease`}
				style:z-index={calcZIndex(i)}
			/>
		{/each}
	</div>
	<button aria-label="Previous slide" on:click={prev}></button>
	<button aria-label="Next slide" on:click={next}></button>
</template>

<style lang="scss">
	.images {
		grid-column: 1 / -1;
		grid-row: 1 / span 1;
		width: var(--slider-width);

		display: grid;
		grid-template-columns: var(--grid-template-columns);
		column-gap: var(--SPACE-MD);
		position: relative;
		overflow: hidden;

		img {
			grid-row: 1;
			z-index: 0;

			height: 100%;
			width: 100%;
			object-fit: cover;

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

		&:first-of-type {
			grid-column: 1 / span 1;
			cursor: url(/img/arrow-left.png) 32 32, auto;
		}
		&:last-of-type {
			grid-column: 2 / span 1;
			cursor: url(/img/arrow-right.png) 32 32, auto;
		}

		padding: 0;
		margin: 0;
	}
</style>