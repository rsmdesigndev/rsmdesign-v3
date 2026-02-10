<script lang="ts" context="module">
	export type CardCarouselData = {
		carousel_cards?: CardData[] | null;
	}
</script>

<script lang="ts">
	import { onMount } from "svelte";
	import Card, { type CardData } from "../molecules/Card.svelte";
	import type { BleedData } from "./CardColumn.svelte";

	export let data: CardCarouselData;
	export let bleed: BleedData;

    export let interval = 5000;
    export let durationMs = 200;
    export let imagesPerSlide = 1;
    export let animation: "fade" | "slide" = "fade";
    export let autoplay = false;
    export let showIndexes = true;
    export let showArrows = true;

    let current = 0;
    let isAnimating = false;
    let animationDir = 0; // -1 for left, 1 for right
    let intervalId: any = null;

    function next() {
        if (isAnimating) return;

		current += 1;
		if (current > data.carousel_cards.count - 1) {
			current = 0;
		}

        isAnimating = true;
        animationDir = 1;
        setTimeout(() => isAnimating = false, durationMs - 100);

        if (autoplay) restartInterval();
	}

    function prev() {
        if (isAnimating) return;

        current -= 1;
        if (current < 0) {
            current = data.carousel_cards.count - 1;
        }

        isAnimating = true;
        animationDir = -1;
        setTimeout(() => isAnimating = false, durationMs - 100);

        if (autoplay) restartInterval();
    }

    $: isNextSlide = (i: number): boolean => {
        if (data.carousel_cards.count === 1) {
            return false;
        }

        if (current === data.carousel_cards.count - 1) {
            // if on the last slide, "next slide" would be the first slide
            return i === 0;
        }
        
        return i === current + 1;
    }

    $: isPrevSlide = (i: number): boolean => {
        if (data.carousel_cards.count === 1) {
            return false;
        }
        
        if (current === 0) {
            // if on the first slide, "prev slide" would be the last slide
            return i === data.carousel_cards.count - 1;
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

    onMount(() => {
        if (autoplay) {
            restartInterval();
            return () => clearInterval(intervalId);
        }
	});
</script>

<template>
    <div class="carousel">
        {#if showIndexes}
            <div class="indexes">
                {current+1} / {data.carousel_cards.count} 
            </div>
        {/if}

        {#if showArrows}
            <button class="arrow left" on:click={prev}>
                Prev &lt;
            </button>
        {/if}

        <div class="cards">
            {#each data.carousel_cards as data, i}
                <div
                    class={`card-wrapper anim-${animation}`}
                    style={`transition: transform ${durationMs}ms ease, opacity ${durationMs}ms ease`}
                    class:slide-next={isNextSlide(i)}
                    class:slide-prev={isPrevSlide(i)}
                    class:slide-active={i === current}
                    style:z-index={calcZIndex(i)}
                >
                    <Card data />
                </div>
            {/each}
        </div>

        {#if showArrows}
            <button class="arrow right" on:click={next}>
                Next &gt;
            </button>
        {/if}
    </div>
</template>

<style lang="scss">
    .carousel {
        display: flex;
        position: relative;
        height: 400px;
        width: 100%;
    }

    .arrow {
        flex-shrink: 0;
        z-index: 3;
    }

    .indexes {
        z-index: 3;
        display: flex;
        gap: 8px;
        position: absolute;
        bottom: 8px;
        right: 64px;
        color: white;
    }

    .index-marker {
        width: 8px;
        height: 8px;
    }

    .cards {
        flex: 1;
        height: 100%;
        position: relative;
        overflow: hidden;
        
    }

    .card-wrapper {
        height: 100%;
        width: 100%;
        position: absolute;
        overflow: hidden;

        &.anim-slide {
            &.slide-active {
                transform: translateX(0%);
                z-index: 2;
            }
            &.slide-next {
                transform: translateX(100%);
                z-index: 1;
            }
            &.slide-prev {
                transform: translateX(-100%);
                z-index: 0;
            }
        }
        &.anim-fade {
            opacity: 0;
            transform: 0;
            &.slide-active {
                opacity: 1;
                z-index: 2;
            }
        }
    }
</style>