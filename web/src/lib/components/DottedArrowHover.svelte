<script lang="ts" context="module">
	export const DOTTED_ARROW_CONTEXT = Symbol("DOTTED_ARROW_CONTEXT");

	export type DottedArrowContext = {
		currentDots: Writable<number>;
	};

	export function getDottedArrowContext() {
		return getContext<DottedArrowContext>(DOTTED_ARROW_CONTEXT);
	}
</script>

<script lang="ts">
	import { createEventDispatcher, getContext, setContext } from "svelte";
	import { writable, type Writable } from "svelte/store";
	import { animate, fadeScroll, fadeMoveScroll } from "$lib/animate";

	export let animFadeScroll: boolean = false;
	export let animFadeMoveScroll: boolean = false;

	let className: string = "";
	export { className as class };

	export let text_size: string = "";
	export let text_alignment: string = "";
	export let has_heading: boolean = false;
	export let bottom_aligned: boolean = false;

	export let list_item: boolean = false;

	export let style: string = "";
	export let href: string | undefined = undefined;
	export let target: string | undefined = undefined;

	/**
	 * The delay between each dot's appearance, in milliseconds.
	 */
	export let delay = 40;

	/**
	 * The number of dots to display.
	 */
	export let numDots = 3;

	const dispatch = createEventDispatcher();

	let currentDots = writable(0);
	setContext<DottedArrowContext>(DOTTED_ARROW_CONTEXT, { currentDots });

	let hovered = false;

	function addDot(dots: number): number {
		if (dots < numDots) {
			return dots + 1;
		} else {
			return numDots;
		}
	}

	function removeDot(dots: number): number {
		if (dots > 0) {
			return dots - 1;
		} else {
			return 0;
		}
	}

	function addDotRecursive() {
		if (hovered && $currentDots < numDots) {
			currentDots.update(addDot);
			setTimeout(() => {
				addDotRecursive();
			}, delay);
		}
	}

	function removeDotRecursive() {
		if (!hovered && $currentDots > 0) {
			currentDots.update(removeDot);
			setTimeout(() => {
				removeDotRecursive();
			}, delay);
		}
	}

	function onMouseEnter() {
		hovered = true;
		addDotRecursive();
		dispatch("mouseenter");
	}

	function onMouseLeave() {
		hovered = false;
		removeDotRecursive();
		dispatch("mouseleave");
	}
</script>

<template>
	{#if animFadeScroll}
		<a
			use:animate={fadeScroll}
			{href}
			{target}
			class:has-heading={has_heading}
			class="{className} dotted-arrow
				   {text_alignment === "left" ? 'flex-justify-start' : ''}
				   {text_alignment === "right" ? 'flex-justify-end' : ''}
				   {bottom_aligned ? 'flex-align-end' : ''}
				   {list_item ? 'list-item' : ''}"
			{style}
			on:click
			on:mouseenter={onMouseEnter}
			on:mouseleave={onMouseLeave}
		>
			<slot />
		</a>
	{:else if animFadeMoveScroll}
		<a
			use:animate={fadeMoveScroll}
			{href}
			{target}
			class:has-heading={has_heading}
			class="{className} dotted-arrow
				   {text_alignment === "left" ? 'flex-justify-start' : ''}
				   {text_alignment === "right" ? 'flex-justify-end' : ''}
				   {bottom_aligned ? 'flex-align-end' : ''}
				   {list_item ? 'list-item' : ''}"
			{style}
			on:click
			on:mouseenter={onMouseEnter}
			on:mouseleave={onMouseLeave}
		>
			<slot />
		</a>
	{:else}
		<a
			{href}
			{target}
			class:has-heading={has_heading}
			class="{className} dotted-arrow
				   {text_alignment === "left" ? 'flex-justify-start' : ''}
				   {text_alignment === "right" ? 'flex-justify-end' : ''}
				   {bottom_aligned ? 'flex-align-end' : ''}
				   {list_item ? 'list-item' : ''}"
			{style}
			on:click
			on:mouseenter={onMouseEnter}
			on:mouseleave={onMouseLeave}
		>
			<slot />
		</a>
	{/if}
</template>

<style lang="scss">
	a.dotted-arrow {
		z-index: 1;
		cursor: pointer;
		max-width: 100%;
		//min-height: 100%;
		position: relative;

		display: flex;
		align-items: baseline;
		justify-content: space-between;

		&.list-item {
			font-weight: 600;
			padding-bottom: 0.333em;
			border-bottom: 1px solid var(--COLOR-BLACK);

			&:not(:first-of-type) {
				padding-top: var(--GRID-CELL);
			}
		}

		&.flex-align-end {
			:global{
				> p:last-of-type,
				> span:last-child {
					margin-bottom: 0;
				}
			}
		}

		:global {
			+ a.dotted-arrow {
				margin-top: 0.25em;
			}
			p {
				max-width: 100%;

				> span {
					align-self: flex-end;
					margin-bottom: 0.333em;
				}
			}
			p:last-child {
				flex-shrink: 0;
				display: flex;
				font-weight: 600;
				margin-bottom: 0;

				&:not(:only-child) {
					min-width: 12.5em;
					justify-content: flex-end;
				}
			}
			*:not(:last-child) p:last-child {
				font-weight: 400;
				margin: 0 0 1em;
			}
			> span:last-child {
				margin-bottom: 1em;
			}
			> h4.heading {
				transition: opacity 0.3s ease;
			}
		}

		&:hover {
			color: inherit;
			:global(> h4.heading) {
				opacity: 0.618;
			}
		}
	}
</style>