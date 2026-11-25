<script lang="ts" context="module">
	export type PageBlockCarouselData = LayoutFields & {
		images_per_slide?: number | null;
		animation?: "fade" | "slide" | null;
		animation_duration_ms?: number | null;
		autoplay?: boolean | null;
		autoplay_interval?: number | null;
		show_indexes?: boolean | null;
		show_arrows?: boolean | null;
		images?: ImageAssetRelation[] | null;
	};
</script>

<script lang="ts">
	import { onMount } from "svelte";
	import Section from "$lib/components/Section.svelte";
	import type { LayoutFields } from "../layout_blocks/index.svelte";
	import type { ImageAssetRelation } from "$lib/cms";
	import { assetUrl } from "$lib/cms/assets";
	import { animate, fadeScroll } from "$lib/animate";

	export let data: PageBlockCarouselData;
	export let order: number;
	export let order_md: number | null;
	export let project: boolean = false;
	export let current = 0;
	export let span_columns_md_override: number | null;

	let isAnimating = false;
	let animationDir = 0; // -1 for left, 1 for right
	let intervalId: any = null;

	$: imagesPerSlide = data.images_per_slide ?? 1;
	$: slidePercentage = 100 / imagesPerSlide;

	$: currentDisplay = String(current+1);
	$: if (imagesPerSlide > 1) {
		currentDisplay = `${current+1}–${current+imagesPerSlide}`;
	}

	function next() {
		if (isAnimating) return;

		current += 1;
		if (current > (data.images?.length ?? 0) - imagesPerSlide) {
			current = 0;
		}

		isAnimating = true;
		animationDir = 1;
		setTimeout(() => isAnimating = false, data.animation_duration_ms - 100);

		if (data.autoplay) restartInterval();
	}

	function prev() {
		if (isAnimating) return;

		current -= 1;
		if (current < 0) {
			current = (data.images?.length ?? 0) - imagesPerSlide;
		}

		isAnimating = true;
		animationDir = -1;
		setTimeout(() => isAnimating = false, data.animation_duration_ms - 100);

		if (data.autoplay) restartInterval();
	}

	$: isNextSlide = (i: number): boolean => {
		if (data.images?.length === 1) {
			return false;
		}

		if (current === data.images?.length - 1) {
			// if on the last slide, "next slide" would be the first slide
			return i === 0;
		}
		
		return i === current + 1;
	}

	$: isPrevSlide = (i: number): boolean => {
		if (data.images?.length === 1) {
			return false;
		}
		
		if (current === 0) {
			// if on the first slide, "prev slide" would be the last slide
			return i === data.images?.length - 1;
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
		intervalId = setInterval(next, data.autoplay_interval);
	}

	onMount(() => {
		if (data.autoplay) {
			restartInterval();
			return () => clearInterval(intervalId);
		}
	});
</script>

<Section 
	project={project}
	grid
	carousel
	order={order}
	order_md={order_md}
	span_columns={data.span_columns ?? 1}
	span_columns_md_override={span_columns_md_override}
	col_units={data.col_units ?? "whole"}
	col_start={data.col_start ?? 1}
	padding_left={data.padding_left ?? "none"}
	padding_right={data.padding_right ?? "none"}
	span_rows={data.span_rows ?? 1}
	padding_top={data.padding_top ?? "default"}
	anchor_id={data.anchor_id ?? ""}
>
	<div class="images"
		 style:--images-per-slide={data.images_per_slide ?? 1}
		 use:animate={fadeScroll}
	>
		{#each data.images ?? [] as image, i}
			<figure
				class="slide anim-{imagesPerSlide === 1 ? data.animation : "slide"}"
				class:slide-active={i === current}
				style="transition: transform {data.animation_duration_ms}ms ease, opacity {data.animation_duration_ms}ms ease"
				style:width="{slidePercentage}%"
				style:transform={imagesPerSlide > 1 || data.animation === "slide"
					? `translateX(${(i - current) * slidePercentage * imagesPerSlide}%)`
					: "none"
				}
				style:z-index={calcZIndex(i)}
				style:--padding-right={imagesPerSlide > 1 ? "calc(var(--GRID-CELL) / 2)" : "0"}
			>
				<img src={assetUrl(image?.directus_files_id?.filename_disk)} alt="" />
			</figure>
		{/each}
	</div>

	
	{#if data.show_arrows || data.show_indexes}
		<nav class="{data.col_units === 'whole' ? 'whole' : ''}"
			 use:animate={fadeScroll}
		>
			{#if data.show_arrows}
				<button class="reset" aria-label="Previous slide" on:click={prev}>
					‹
				</button>
			{/if}
			{#if data.show_indexes}
				<div class="indexes" aria-label="Image number">
					{currentDisplay}&thinsp;/&thinsp;{data.images?.length} 
				</div>
			{/if}
			{#if data.show_arrows}
				<button class="reset" aria-label="Next slide" on:click={next}>
					›
				</button>
			{/if}
		</nav>
	{/if}
</Section>

<style lang="scss">
	nav, .images {
		grid-column: 1 / span 1;
		grid-row: 1 / span 1;
		z-index: 3;
		color: var(--COLOR-DIM-GRAY);
	}

	.images {
		width: 100%;
		display: grid;
		position: relative;
		overflow: hidden;

		figure {
			grid-column: 1 / span 1;
			grid-row: 1 / span 1;
			z-index: 0;

			margin: 0;
			padding: 0 var(--padding-right) 0 0;

			&.anim-fade {
				opacity: 0;
				transform: 0;
				&.slide-active {
					opacity: 1;
					z-index: 2;
				}
			}


			img {
				height: 100%;
				width: 100%;
				object-fit: cover;
			}
		}
	}

	nav {
		align-self: end;
		justify-self: end;
		display: flex;
		align-items: flex-end;
		align-content: flex-end;
		justify-content: flex-end;

		font-size: var(--FONT-SIZE-XS);
		line-height: 1;

		> button {
			align-self: unset;
			width: 0.667em;

			font-size: var(--FONT-SIZE-XXL);
			line-height: calc(var(--FONT-SIZE-XS) * 1.167);
			font-weight: 300;
			color: var(--COLOR-ORANGE);
			transition: color 0.3s ease;

			&:hover {
				color: var(--COLOR-DIM-GRAY);
			}
		}

		> div {
			min-width: calc(var(--GRID-CELL) * .75);
			text-align: center;
		}

		margin: 0 0.5em 1em 0;
		position: relative;

		&::after {
			display: none;
			content: "";
			position: absolute;
			z-index: -1;
			top: -0.5em;
			left: -0.75em;						
			width: calc(100% + 1em);
			height: calc(100% + 1em);
			background: rgba(0,0,0,0.125);
			filter: blur(0.5em);
		}

		&.whole {
			@media (min-width: 62.5em) {
				align-self: unset;
				justify-self: unset;
				align-items: unset;
				align-content: unset;
				justify-content: unset;

				--side-margin: calc(var(--GRID-CELL) * 2);
				display: grid;
				grid-template-columns: var(--side-margin) calc(100% - var(--side-margin)) var(--side-margin);
				margin: 0 0 0 calc(var(--side-margin) * -1);

				> button {
					align-self: center;

					width: unset;
					height: calc(var(--side-margin) * 2);
					font-size: var(--FONT-SIZE-XXL);

					color: var(--COLOR-ORANGE);
					transition: color 0.3s ease;

					&:hover {
						color: var(--COLOR-DIM-GRAY);
					}
				}

				> div {
					justify-self: end;
					align-self: end;

					margin: 0 1em 0.667em 0;
					position: relative;

					font-size: var(--FONT-SIZE-SM);

					&::after {
						content: "";
						position: absolute;
						z-index: -1;
						top: -0.5em;
						left: -0.667em;						
						width: calc(100% + 1em);
						height: calc(100% + 1em);
						background: rgba(0,0,0,0.125);
						filter: blur(0.5em);
					}
				}

				&::after {
					display: none;
				}
			}
		}
	}
</style>