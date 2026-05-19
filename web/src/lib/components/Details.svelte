<script lang="ts">
	import Section from "$lib/components/Section.svelte";
	import { slide, type EasingFunction } from "svelte/transition";
	import { sineInOut } from "svelte/easing";
	import { createEventDispatcher } from "svelte";
	import { animate, fadeScroll, moveScroll, fadeMoveScroll } from "$lib/animate";

	export let summary: string;
	export let duration = 300;
	export let easing: EasingFunction = sineInOut;
	export let defaultOpen = false;
	export let firstItem = false;

	const dispatch = createEventDispatcher();

	let isOpen = defaultOpen;

	function toggle() {
		isOpen = !isOpen;
		dispatch("toggle", isOpen);
	}
	
	export function open() {
		isOpen = true;
	}

	export function close() {
		isOpen = false;
	}
</script>

<template>
	<details open aria-expanded={isOpen} use:animate={fadeScroll}>
		<summary on:click|preventDefault={toggle}>
			{summary}
		</summary>
		{#if isOpen}
			<article class="rich-text" transition:slide={{ duration, easing }}>
				<slot />
			</article>
		{/if}
		<button class="reset" 
				class:open={isOpen} 
				aria-label="Expand content" 
				on:click={toggle}
		>
			›
		</button>
	</details>
</template>

<style lang="scss">
	details {
		box-sizing: border-box;
		position: relative;

		border-bottom: 1px solid var(--COLOR-BLACK);

		> summary {
			cursor: pointer;
			
			// hide the default arrow
			list-style: none;
			&::marker,
			&::-webkit-details-marker {
				display: none;
			}

			display: flex;
			align-items: center;
			justify-content: space-between;

			padding: var(--GRID-CELL) 0 0.5rem;

			font-size: var(--FONT-SIZE-LG);
			line-height: 1;
			font-weight: 600;

			> img {
				width: var(--GRID-CELL);
				margin-top: calc(var(--GRID-CELL) * 0.25);

				transition: transform 0.3s ease-in-out;

				&.open {
					transform: rotateX(180deg);
				}
			}
		}

		> article {
			margin: 0.5rem 0 calc(var(--GRID-CELL) * 0.667);
			width: 80%;
			max-width: 80ch;
		}

		> button {
			position: absolute;
			right: calc(var(--GRID-CELL) * -1);
			bottom: calc(var(--GRID-CELL) * -0.25);
			padding: var(--GRID-CELL);
			color: var(--COLOR-ORANGE);
			font-size: var(--FONT-SIZE-XXL);
			font-weight: 300;
			line-height: 0;
			rotate: 90deg;
			transform: translate(0.167em, 0);
			transition: transform 0.3s ease-in-out;

			&.open {
				transform: rotateY(180deg) translate(-0.167em, 0);
			}
		}
	}
</style>
