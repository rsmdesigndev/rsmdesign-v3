<script lang="ts" context="module">
	export type CardCarouselData = {
		carousel_autoplay?: boolean | null;
		carousel_autoplay_interval?: number | null;
		carousel_cards?: CardData[] | null;
	}
</script>

<script lang="ts">
	import { onMount } from "svelte";
	import Card, { type CardData } from "../molecules/Card.svelte";
	import type { BleedData } from "./CardColumn.svelte";

	export let data: CardCarouselData;
	export let row: number;
	export let column: number;
	export let colItem: number;
	export let bleed: BleedData;
	
	let cards: CardData[] = data.carousel_cards;
	let animation: "fade" | "slide" = bleed.right ? "slide" : "fade";
	let autoplay: boolean = data.carousel_autoplay ?? true;
	let interval: number = data.carousel_autoplay_interval ?? 10000;

	let current: number = 0;
	let isAnimating: boolean = false;
	let animationDir: -1 | 0 | 1 = 0; // -1 for left, 1 for right
	let animationDuration: number = 200;
	let intervalId: any = null;

	$: currentDisplay = String(current+1);

	function next() {
		if (isAnimating) return;

		current += 1;
		if (current > (cards?.length ?? 0) - 1) {
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
			current = (cards?.length ?? 0) - 1;
		}

		isAnimating = true;
		animationDir = -1;
		setTimeout(() => isAnimating = false, animationDuration - 100);

		if (autoplay) restartInterval();
	}

	$: isNextSlide = (i: number): boolean => {
		if (cards?.length === 1) {
			return false;
		}

		if (current === cards?.length - 1) {
			// if on the last slide, "next slide" would be the first slide
			return i === 0;
		}
		
		return i === current + 1;
	}

	$: isPrevSlide = (i: number): boolean => {
		if (cards?.length === 1) {
			return false;
		}
		
		if (current === 0) {
			// if on the first slide, "prev slide" would be the last slide
			return i === cards?.length - 1;
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
		intervalId = setInterval(next, interval);
	}

	let carouselWidth: number;

	function updateCarouselWidth() {
		let carousel = document.querySelector<HTMLElement>(`#carousel-${row}-${column}-${colItem}`);
		if (carousel) {
			let carouselWidth = carousel.getBoundingClientRect().width;
		}
	}

	onMount(() => {
		if (autoplay) {
			restartInterval();
			return () => clearInterval(intervalId);
		}
	});
</script>

<svelte:window on:resize={() => setTimeout(updateCarouselWidth, 600)} />

<template>
	<div id={`carousel-${row}-${column}-${colItem}`}
		 class="carousel-wrapper"
		 style:--grid-column-start={bleed.left ? "2" : "1"}
		 style:--grid-column-end={bleed.right ? "-2" : "-1"}
		 bind:offsetWidth={carouselWidth}
		 style:--carousel-card-width={carouselWidth + "px"}
	>
		<div class="carousel-container"
			 style:--grid-template-columns={animation === "fade" ? "1fr" : `repeat(${cards?.length ?? 1}, var(--carousel-card-width))`}
			 style:--carousel-width={animation === "fade" ? "100%" : 
			 	`calc(var(--carousel-card-width) + (var(--carousel-card-width) + var(--SPACE-MD)) * ${cards?.length - 1})`}
			 style:transform={(animation === "slide")
					? `translateX(calc(${current * -1} * (var(--carousel-card-width) + var(--SPACE-MD)))`
					: "none"
				}
			 style={`transition: transform ${animationDuration}ms ease`}
		>
			{#each data.carousel_cards as data, i}
				<div
					class={`card-wrapper anim-${animation}`}
					style={`transition: opacity ${animationDuration}ms ease`}
					class:slide-next={isNextSlide(i)}
					class:slide-prev={isPrevSlide(i)}
					class:slide-active={i === current}
					style:z-index={calcZIndex(i)}
				>
					<Card {data} 
						  bleed={ { left: false, 
									right: false 
								} } 
					/>
				</div>
			{/each}
		</div>
	</div>
	<button aria-label="Previous slide" on:click={prev}></button>
	<button aria-label="Next slide" on:click={next}></button>
</template>

<style lang="scss">
	.carousel-wrapper {
		grid-column: var(--grid-column-start) / var(--grid-column-end);
		grid-row: 1 / span 1;
		width: var(--carousel-card-width);

		> .carousel-container {
			width: var(--carousel-width);
			display: grid;
			grid-template-columns: var(--grid-template-columns);
			column-gap: var(--SPACE-MD);
			position: relative;

			//min-height: 500px;

			> .card-wrapper {
				grid-row: 1;
				z-index: 0;

				height: 100%;
				width: var(--carousel-card-width);

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

		width: 50%;
		//height: 100%;

		background: none;
		outline: none;
		border: none;
		box-shadow: none;

		&:first-of-type {
			grid-column: 1 / -1;
			cursor: url(/img/arrow-left.png) 32 32, auto;
		}
		&:last-of-type {
			grid-column: 1 / -1;
			justify-self: end;
			cursor: url(/img/arrow-right.png) 32 32, auto;
		}

		padding: 0;
		margin: 0;
	}
</style>