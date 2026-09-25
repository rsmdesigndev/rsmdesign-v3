<script lang="ts" context="module">
	export type CardCarouselData = {
		carousel_autoplay?: boolean | null;
		carousel_autoplay_interval?: number | null;
		carousel_show_arrows?: boolean | null;
		carousel_cards_per_slide?: number | null;
		carousel_cards?: CardData[] | null;
		carousel_label?: string | null;
	}
</script>

<script lang="ts">
	import { onMount } from "svelte";
	import Card, { type CardData } from "../molecules/Card.svelte";
	import type { BleedData } from "./CardColumn.svelte";
	import { createCarousel, calcZIndex as zIndexFor,
	         isNextSlide as nextSlide, isPrevSlide as prevSlide } from "../scripts/carousel";

	export let data: CardCarouselData;
	export let row: number;
	export let column: number;
	export let colItem: number;
	export let bleed: BleedData;

	let cards: CardData[] = data.carousel_cards;
	let fullBleed: boolean = bleed.left && bleed.right;
	let animation: "fade" | "slide" = bleed.right && !fullBleed ? "slide" : "fade";
	export let selectedItem: number;
	export let stickyOnMobile: boolean = false;
	export let height: number | undefined = undefined;

	let cardsPerSlide: number = data.carousel_cards_per_slide;

	const carousel = createCarousel({
		getIndex: () => selectedItem,
		setIndex: (i) => (selectedItem = i),
		count: cards?.length ?? 0,
		perSlide: cardsPerSlide,
		autoplay: data.carousel_autoplay ?? true,
		interval: data.carousel_autoplay_interval ?? 10000
	});

	const { isPaused, canAutoplay, rotationEnabled, isAdvancing, animationDir } = carousel;
	const { next, prev, togglePlayback, suspend, resume } = carousel;
	const animationDuration = carousel.animationDuration;

	$: carousel.setCount(cards?.length ?? 0);
	$: carousel.setPerSlide(cardsPerSlide);

	$: isNextSlide = (i: number): boolean => nextSlide(i, selectedItem, cards?.length ?? 0);
	$: isPrevSlide = (i: number): boolean => prevSlide(i, selectedItem, cards?.length ?? 0);
	$: calcZIndex = (i: number): number => zIndexFor(i, selectedItem, cards?.length ?? 0, $animationDir);
	// cards peeking past the current slide count as hidden, so Tab stays on the current slide
	$: isHiddenSlide = (i: number): boolean => animation === "fade"
		? !(i === selectedItem || (i === 0 && selectedItem === -1))
		: i < selectedItem || i >= selectedItem + cardsPerSlide;

	$: arrowsAbove = !!data.carousel_show_arrows
		&& (data.carousel_arrow_style === "button" || data.carousel_arrow_style === "both");

	$: carouselLabel = data.carousel_label ?? "Card carousel";

	let carouselWidth: number;

	function updateCarouselWidth() {
		let carousel = document.querySelector<HTMLElement>(`#colItem-row-${row}-col-${column}-item-${colItem}`);
		if (carousel) {
			let carouselWidth = carousel.getBoundingClientRect().width;
		}
	}

	let innerWidth: number;

	onMount(() => {
		if (cardsPerSlide > 2 && innerWidth <= 500) {
			cardsPerSlide = 2;
		}
		return carousel.start();
	});
</script>

<svelte:window bind:innerWidth on:resize={() => setTimeout(updateCarouselWidth, 600)} />

<template>
	<div id={`colItem-row-${row}-col-${column}-item-${colItem}`}
		 class={`carousel-wrapper ${fullBleed ? "carousel-width-full-bleed" : ""}`}
		 role="group"
		 aria-roledescription="carousel"
		 aria-label={carouselLabel}
		 style:--grid-column-start="1"
		 style:--grid-column-end={fullBleed ? "-1" : (bleed.right ? "-2" : "-1")}
		 style:--grid-column-mobile={fullBleed ? "1 / -1" : "main"}
		 class:sticky-on-mobile={stickyOnMobile}
		 bind:offsetWidth={carouselWidth}
		 bind:offsetHeight={height}
	>
		<div class={`button-container ${data.carousel_show_arrows ? "visible" : ""} ${arrowsAbove ? "visible-on-desktop" : ""}`}>
			{#if data.carousel_show_arrows}
				<button class="arrow prev" aria-label="Load previous slide" on:click={prev}
						on:mouseenter={suspend} on:mouseleave={resume}
						on:focus={suspend} on:blur={resume}
				>←</button>
				{#if $canAutoplay && arrowsAbove}
					<button class="arrow playback"
							class:paused={!$isAdvancing}
							type="button"
							aria-label={$isPaused ? "Start automatic slide rotation" : "Stop automatic slide rotation"}
							on:click={togglePlayback}
					/>
				{/if}
				<button class="arrow next" aria-label="Load next slide" on:click={next}
						on:mouseenter={suspend} on:mouseleave={resume}
						on:focus={suspend} on:blur={resume}
				>→</button>
			{/if}
		</div>
		<div class="carousel-container"
			 on:mouseenter={suspend}
			 on:mouseleave={resume}
			 on:focusin={suspend}
			 on:focusout={resume}
			 aria-live={$rotationEnabled ? "off" : "polite"}
			 aria-atomic="false"
			 style:--grid-template-columns={animation === "fade" ? "1fr" : `repeat(${cards?.length ?? 1}, var(--carousel-card-width))`}
			 style:--carousel-card-width={`calc((${carouselWidth + "px"} - var(--SPACE-MD) * ${cardsPerSlide - 1}) / ${cardsPerSlide})`}
			 style:--carousel-width={animation === "fade" ? "100%" : 
			 	`calc(${carouselWidth + "px"} + (var(--carousel-card-width) + var(--SPACE-MD)) * ${cards?.length - 1})`}
			 style:--animation-duration={animationDuration}
			 style:transform={(animation === "slide")
					? `translateX(calc(${selectedItem * -1} * (var(--carousel-card-width) + var(--SPACE-MD))))`
					: "none"
				}
			 style={`transition: transform ${animationDuration}ms ease`}
		>
			{#each data.carousel_cards as data, i}
				<div
					class={`card-wrapper anim-${animation}`}
					role="group"
					aria-roledescription="slide"
					aria-label={`${i + 1} of ${cards?.length ?? 0}`}
					inert={isHiddenSlide(i)}
					
					class:slide-next={isNextSlide(i)}
					class:slide-prev={isPrevSlide(i)}
					class:slide-active={i === selectedItem || (i === 0 && selectedItem === -1)}
					style:z-index={calcZIndex(i)}
				>
					<Card {data} 
						  bleed={ { left: bleed.left && bleed.right ? true : false, 
									right: bleed.left && bleed.right ? true : false 
								} } 
						  isScrollItem={false}
						  isActive={true}
					/>
				</div>
			{/each}
		</div>
		{#if $canAutoplay && !arrowsAbove}
			<button class="playback below"
					class:paused={!$isAdvancing}
					type="button"
					aria-label={$isPaused ? "Start automatic slide rotation" : "Stop automatic slide rotation"}
					on:click={togglePlayback}
			/>
		{/if}
	</div>
	{#if data.carousel_show_arrows && (data.carousel_arrow_style === "cursor" || data.carousel_arrow_style === "both")}
		<button class="cursor-arrow" aria-label="Load previous slide" on:click={prev}
				on:focus={suspend} on:blur={resume}
		></button>
		<button class="cursor-arrow" aria-label="Load next slide" on:click={next}
				on:focus={suspend} on:blur={resume}
		></button>
	{/if}
</template>

<style lang="scss">
	.carousel-wrapper {
		grid-column: var(--grid-column-start) / var(--grid-column-end);
		grid-row: 1 / span 1;
		width: 100%;
		// set position explicitly so svelte bindings don't set it inline, 
		// which would override the sticky functionality
		position: relative;
		
		@media (max-width: 31.25em) {
			grid-column: var(--grid-column-mobile);
			max-width: 92vw;

			&.carousel-width-full-bleed {
				max-width: 100vw;
			}
		}

		&.sticky-on-mobile {
			@media (max-width: 31.25em) {
				position: sticky;
				top: calc(var(--GRID-CELL) * 1.75);
				z-index: 2;
				background-color: var(--color-background, white);
				transition: background-color 0.3s ease;

				&::after {
					content: "";
					position: absolute;
					top: 100%;
					left: 0;
					right: 0;
					height: var(--SPACE-MD);
					background-color: inherit;
					-webkit-mask-image: linear-gradient(black, transparent);
					mask-image: linear-gradient(black, transparent);
					pointer-events: none;
				}

				:global {
					.card > :not(.media) {
						display: none;
					}
				}
			}
		}

		button.playback {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 0.2em;
			width: 1em;
			height: 1em;
			border: none;
			box-shadow: none;
			background: transparent;
			padding: 0;
			font-size: var(--FONT-SIZE-MD);
			line-height: 1;
			color: inherit;
			cursor: pointer;

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
					width: 0;
					height: 0;
					background: none;
					border-top: 0.3em solid transparent;
					border-bottom: 0.3em solid transparent;
					border-left: 0.5em solid var(--color-secondary);
				}
				&::after {
					display: none;
				}
			}

			&.below {
				margin-right: auto;
				margin-top: var(--SPACE-MD);
			}
		}

		> .carousel-container {
			width: var(--carousel-width);
			display: grid;
			grid-template-columns: var(--grid-template-columns);
			column-gap: var(--SPACE-MD);
			position: relative;

			transition: transform calc(var(--animation-duration) * 1ms) ease;

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

					transition: opacity calc(var(--animation-duration) * 1ms) ease;
					transition-delay: calc(var(--animation-duration) * 1ms);

					:global {
						* {
							color: rgba(0,0,0,0);
						}
					}

					&.slide-active {
						opacity: 1;
						transition-delay: 0s;

						z-index: 2;

						:global {
							* {
								color: unset;
							}
						}
					}
				}
			}
		}

		> .button-container {
			display: none;
			&.visible {
				display: flex;
			}

			margin-top: calc(-1 * var(--SPACE-SM));
			margin-bottom: var(--SPACE-SM);
			justify-content: flex-end;
			gap: var(--SPACE-MD);

			@media (min-width: 62.5em) {
				&.visible-on-desktop {
					position: absolute;
					width: 100%;
					margin-top: calc(-1.5 * var(--GRID-CELL));
				}
				&:not(.visible-on-desktop) {
					display: none;
				}
			}

			> .arrow {
				border: none;
				box-shadow: none;
				background: transparent;
				padding: 0;
				align-self: start;
				&.prev {
					padding-right: var(--SPACE-SM)
				}
				&.next {
					padding-left: var(--SPACE-SM)
				}
				&.playback {
					align-self: center;
					margin: 0 -0.5em;

					&.paused {
						margin: 0 -0.6em 0 -0.4em;
					}
				}

				font: "Inter", var(--FONT-FAMILY-PROXIMA-NOVA);
				font-size: var(--FONT-SIZE-LG);
				color: var(--color-secondary);
				transition: color 0.3s ease;

				&:hover {
					color: var(--color-accent);
					cursor: pointer;
				}
			}
		}
	}

	.cursor-arrow {
		display: none;
		@media (min-width: 62.5em) {
			display: inline;
		}
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