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
</script>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { goto } from '$app/navigation';
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

	let card: HTMLElement;

	function handleClick(_e: any) {
		if (isActive && data.card_link) {
			goto(data.card_link);
		}
		else if (isScrollItem) {
			card.scrollIntoView({ block: "center", behavior: "smooth" });
		}
	}

	const dispatch = createEventDispatcher();

	function selectItemOnIntersection(node: Element) {
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				dispatch('selectItem', {subtrahend: excludeFirstItem ? 1 : 0});
			}
		}, { rootMargin: '-50% 0% -50% 0%' });
		observer.observe(node);
		return {
			destroy() {
				observer.disconnect();
			}
		};
	}

	const conditionalSelectItemOnIntersection = isScrollItem ? selectItemOnIntersection : ()=>{};
</script>

<template>
	<svelte:element 
		this={data.card_link ? "a" : "div"} 
		href={data.card_link ?? ""}
		target={data.card_link?.includes("https://") && !data.cta_link?.includes("rsmdesign.com")
				? "_blank" : "_self"}
		use:conditionalSelectItemOnIntersection
		bind:this={card}
		on:click|preventDefault={handleClick}
		class={`card ${isActive ? "active" : ""}`}
		style:--row-gap={`var(--SPACE-${data.card_item_spacing?.toUpperCase()}`}
	>
		{#each data.card_atoms?.map((c) => c?.item) ?? [] as data}
			{#if data?.__typename === "page_blocks_v3_atom_blockquote"}
				<Blockquote {data} {bleed} {isActive} />
			{:else if data?.__typename === "page_blocks_v3_atom_cta"}
				<Cta {data} {bleed} {isActive} />
			{:else if data?.__typename === "page_blocks_v3_atom_heading"}
				<Heading {data} {bleed} {isActive} {isScrollItem} />
			{:else if data?.__typename === "page_blocks_v3_atom_media"}
				<Media {data} {isActive} />
			{:else if data?.__typename === "page_blocks_v3_atom_rich_text"}
				<RichText {data} {bleed} {isActive} />
			{:else if data?.__typename === "page_blocks_v3_atom_spacer"}
				<Spacer {data} />
			{:else}
				No card atoms
			{/if}
		{/each}
	</svelte:element>
</template>

<style lang="scss">
	.card {
		grid-column: 1 / -1;
		display: grid;
		grid-template-columns: subgrid;
		row-gap: var(--row-gap);
	}

	@property --column-scroll-transition-opacity {
		syntax: '<number>';
		inherits: false;
		initial-value: 0;
	}

	a.card {
		text-decoration: none;
		color: inherit;
	}
</style>