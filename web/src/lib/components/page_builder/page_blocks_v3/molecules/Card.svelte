<script lang="ts" context="module">
	export type CardData = {
		card_item_spacing?: string | null;
		card_atoms?: ({ item?: CardAtom | null } | null | undefined)[] | null | undefined;
	}

	export type CardAtom =
		| ({ __typename: "page_blocks_v3_atom_blockquote" } & BlockquoteData)
		| ({ __typename: "page_blocks_v3_atom_cta" } 	   	& CtaData)
		| ({ __typename: "page_blocks_v3_atom_heading" } 	& HeadingData)
		| ({ __typename: "page_blocks_v3_atom_media" } 		& MediaData)
		| ({ __typename: "page_blocks_v3_atom_rich_text" } 	& RichTextData)
		| ({ __typename: "page_blocks_v3_atom_spacer" } 	& SpacerData)
		;

	export const MOBILE_QUERY = "(max-width: 31.25em)";
	export const LOW_TRIGGER_LINE = 0.75;
</script>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { BleedData } from "../organisms/CardColumn.svelte";
	import Blockquote, { type BlockquoteData } from "../atoms/Blockquote.svelte";
	import Cta, { type CtaData } from "../atoms/Cta.svelte";
	import Heading, { type HeadingData } from "../atoms/Heading.svelte";
	import Media, { type MediaData } from "../atoms/Media/index.svelte";
	import RichText, { type RichTextData } from "../atoms/RichText.svelte";
	import Spacer, { type SpacerData } from "../atoms/Spacer.svelte";
	
	export let data: CardData;
	export let bleed: BleedData;
	export let isScrollItem: boolean;
	export let excludeFirstItem: boolean;
	export let isActive: boolean = true;
	export let activeHighlight: string = "accent";
	export let hasDropShadow: boolean = false;
	export let isProject: boolean = false;
	export let lowTriggerOnMobile: boolean = false;

	let card: HTMLElement;

	$: cardLink = data.card_link ?? null;
	$: headingIndex = data.card_atoms?.findIndex(
		(c) => c?.item?.__typename === "page_blocks_v3_atom_heading"
	) ?? -1;

	function prefersReducedMotion() {
		return typeof window !== "undefined"
			&& window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
	}

	function lowTrigger(): boolean {
		return lowTriggerOnMobile && window.matchMedia(MOBILE_QUERY).matches;
	}

	function center(instant = false) {
		const behavior = (instant || prefersReducedMotion()) ? "auto" : "smooth";

		if (lowTrigger()) {
			window.scrollBy({
				top: card.getBoundingClientRect().top - (window.innerHeight * LOW_TRIGGER_LINE - 1),
				behavior
			});
			return;
		}

		card.scrollIntoView({
			block: "center",
			behavior
		});
	}

	function selectSelf() {
		dispatch('selectItem', {subtrahend: excludeFirstItem ? 1 : 0});
	}

	function handleClick(e: MouseEvent) {
		const interactive = (e.target as HTMLElement)?.closest?.(
			"a, button, input, select, textarea, label, [role='button']"
		);
		const isCardLink = interactive?.hasAttribute("data-card-link");
		if (interactive && !isCardLink) return;
		if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

		if (isScrollItem && !isActive) {
			e.preventDefault();
			selectSelf();
			center(true);
		}
	}

	function handleFocusIn() {
		if (!isScrollItem || isActive) return;
		selectSelf();
		center(true);
	}

	const dispatch = createEventDispatcher();

	function selectItemOnIntersection(node: Element) {
		const mobile = lowTriggerOnMobile ? window.matchMedia(MOBILE_QUERY) : null;
		let observer: IntersectionObserver | undefined;

		function observe() {
			const line = lowTrigger() ? LOW_TRIGGER_LINE : 0.5;
			observer?.disconnect();
			observer = new IntersectionObserver(([entry]) => {
				if (entry.isIntersecting) {
					selectSelf();
				}
			}, { rootMargin: `-${line * 100}% 0% -${(1 - line) * 100}% 0%` });
			observer.observe(node);
		}

		observe();
		mobile?.addEventListener("change", observe);

		return {
			destroy() {
				mobile?.removeEventListener("change", observe);
				observer?.disconnect();
			}
		};
	}

	const conditionalSelectItemOnIntersection = isScrollItem ? selectItemOnIntersection : ()=>{};
</script>

<template>
	<div
		use:conditionalSelectItemOnIntersection
		bind:this={card}
		on:click={handleClick}
		on:focusin={handleFocusIn}
		class={`card ${isActive ? "active" : ""} ${hasDropShadow ? "drop-shadow" : ""}`}
		style:--row-gap={`var(--SPACE-${data.card_item_spacing?.toUpperCase()})`}
	>
		{#each data.card_atoms?.map((c) => c?.item) ?? [] as data, i}
			{#if data?.__typename === "page_blocks_v3_atom_blockquote"}
				<Blockquote {data} {bleed} {isActive} />
			{:else if data?.__typename === "page_blocks_v3_atom_cta"}
				<Cta {data} {bleed} {isActive} />
			{:else if data?.__typename === "page_blocks_v3_atom_heading"}
				<Heading {data} {bleed} {isActive} {activeHighlight} {isScrollItem}
				         link={i === headingIndex ? cardLink : null} />
			{:else if data?.__typename === "page_blocks_v3_atom_media"}
				<Media {data} {isActive} {isProject} />
			{:else if data?.__typename === "page_blocks_v3_atom_rich_text"}
				<RichText {data} {bleed} {isActive} />
			{:else if data?.__typename === "page_blocks_v3_atom_spacer"}
				<Spacer {data} />
			{:else}
				No card atoms
			{/if}
		{/each}
	</div>
</template>

<style lang="scss">
	.card {
		position: relative;
		grid-column: 1 / -1;
		display: grid;
		grid-template-columns: subgrid;
		row-gap: var(--row-gap);

		&.drop-shadow {
			filter: drop-shadow(rgba(0,0,0,0.618) var(--SPACE-SM) var(--SPACE-SM) var(--SPACE-SM));
		}
	}

	@property --column-scroll-transition-opacity {
		syntax: '<number>';
		inherits: false;
		initial-value: 0;
	}
</style>