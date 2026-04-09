<script lang="ts">
	import { animate, AnimateTrigger } from "$lib/animate";
</script>

<template>
	<section>
		{#each Array(9) as _, i}
			<figure
				id={`book-animation-item-${i}`}
				style:--position-in-grid-row={i < 3 || i > 5 ? `calc(mod(${i}, 3))` : `calc(3 - mod(${i}, 3))`}
				style:--animation-direction={i < 3 || i > 5 ? 1 : -1}
			>
				<div class="parallax-animation-trigger" 
					 use:animate={ { trigger: AnimateTrigger.WhileScrollingInView, targetSelector: `#book-animation-item-${i}`, animClass: "book-parallax-animate" } }
				/>
				<img src={`/img/book-parallax-animation/Book-${i < 8 ? i+1 : 1}.png`} />
			</figure>
		{/each}
	</section>
</template>

<style lang="scss">
	section {
		z-index: 2;
		position: relative;
		margin-top: var(--SPACE-XXL);

		grid-column: viewport;
		max-width: 100vw;
		overflow-x: hidden;
		display: grid;
		grid-template-columns: subgrid;
		align-content: start;

		@media (max-width: 31.25em) {
			grid-template-columns: [viewport-start]
								    2%
								   [third-start]
								    10fr
								   [third-end]
								    1fr
								   [third-start]
								    10fr
								   [third-end]
								    1fr
								   [third-start]
								    10fr
								   [third-end]
								    2%
								   [viewport-end];
		}

		row-gap: var(--SPACE-XL);

		> figure {
			position: relative;

			padding: 0;
			margin: 0;

			> .parallax-animation-trigger {
				position: absolute;
				top: 0;
				left: 0;
				height: 100%;
			}

			@media (min-width: 62.5em) {
				&:nth-of-type(3n+1) {
					grid-column: sixth-start 1 / sixth-end 2;
				}
				&:nth-of-type(3n+2) {
					grid-column: sixth-start 3 / sixth-end 4;
				}
				&:nth-of-type(3n) {
					grid-column: sixth-start 5 / sixth-end 6;
				}
			}

			@media (max-width: 62.5em) {
				&:nth-of-type(3n+1) {
					grid-column: third-start 1 / third-end 1;
				}
				&:nth-of-type(3n+2) {
					grid-column: third-start 2 / third-end 2;
				}
				&:nth-of-type(3n) {
					grid-column: third-start 3 / third-end 3;
				}
			}

			@media (max-width: 31.25em) {
				grid-column: main;
			}

			> img {
				width: 100%;
				filter: drop-shadow(var(--COLOR-DIM-GRAY) 0.5rem 0.5rem 1rem);
			}
		}
	}

	:global {
		.book-parallax-animate {
			foo: bar;
			animation: book-parallax-animate 1s linear forwards;
		}

		@keyframes book-parallax-animate {
			0% {
				transform: translate(calc(var(--SPACE-XL) * (1 + var(--position-in-grid-row)) * var(--animation-direction)), 0rem);
			}
			100% {
				transform: translate(calc(-1 * var(--SPACE-LG) * (3 - var(--position-in-grid-row)) * var(--animation-direction)), 0rem);
			}
		}
	}
</style>