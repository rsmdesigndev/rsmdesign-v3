<script lang="ts" context="module">
	export type CardColumnData = {
		grid_col_start_units?: string | null;
		grid_col_start?: number | null;
		grid_col_end_units?: string | null;
		grid_col_end?: number | null;
		column_item_spacing?: string | null;
		column_padding_left?: string | null;
		column_padding_right?: string | null;
		column_sticky?: string | null;
		column_hidden_on_mobile?: boolean | null;
		column_interaction_on_scroll?: boolean | null;
		column_interaction_exclude_first_item?: boolean | null;
		column_interaction_active_highlight?: string | null;
		column_items?: ({ item?: ColumnItem | null } | null | undefined)[] | null | undefined;
	}

	export type ColumnItem =
		| ({ __typename: "page_blocks_v3_molecule_accordion" }		& AccordionData)
		| ({ __typename: "page_blocks_v3_organism_card_carousel" }	& CardCarouselData)
		| ({ __typename: "page_blocks_v3_molecule_card" }			& CardData)
		| ({ __typename: "page_blocks_v3_molecule_cta_list" }		& CtaListData)
		| ({ __typename: "page_blocks_v3_atom_spacer" }				& SpacerData)
		;

	export type BleedData = {
		left: boolean;
		right: boolean;
	} | null;
</script>

<script lang="ts">
	import { animate, AnimateTrigger } from "$lib/animate";
	import Accordion, { type AccordionData } from "../molecules/Accordion.svelte";
	import Card, { type CardData } from "../molecules/Card.svelte";
	import CardCarousel, { type CardCarouselData } from "./CardCarousel.svelte";
	import CtaList, { type CtaListData } from "../molecules/CtaList.svelte";
	import Spacer, { type SpacerData } from "../atoms/Spacer.svelte";
	import type { ProjectData } from "../index.svelte";
	
	export let data: CardColumnData;
	export let row: number;
	export let column: number;
	export let projectData: ProjectData | null | undefined = undefined;

	type ColumnsData = {
		numCols: number,
		currCol: number
	}
	export let columns: ColumnsData;

	const bleed: BleedData = {
		left: data.grid_col_start_units === "viewport" ? true : false,
		right: data.grid_col_end_units === "viewport" ? true : false
	}

	// Columns for tablet view
	let colStart: string;
	let colEnd: string;

	if (columns.currCol == 1) {
		if (data.grid_col_start_units === "viewport") {
			colStart = "viewport-start";
		} else {
			colStart = "main-start";
		}
	} else {
		if (data.grid_col_start_units === "sixth") {
			if (data.grid_col_end - data.grid_col_start == 6) {
				colStart = "third-start 1";
			} else if (data.grid_col_end - data.grid_col_start >= 3) {
				colStart = "third-start 2";
			} else if (data.grid_col_end - data.grid_col_start == 2) {
				colStart = "half-start 2";
			} else {
				colStart = "third-start 3";
			}
		} else {
			if (data.grid_col_end - data.grid_col_start == 7) {
				colStart = "third-start 1";
			} else if (data.grid_col_end - data.grid_col_start >= 4) {
				colStart = "third-start 2";
			} else if (data.grid_col_end - data.grid_col_start == 3) {
				colStart = "half-start 2";
			} else {
				colStart = "third-start 3";
			}
		}
	}

	if (data.grid_col_end_units === "viewport") {
		colEnd = "viewport-end";
	} else if (data.grid_col_end_units === "sixth") {
		if (columns.currCol == 2 || data.grid_col_end == 6) {
			colEnd = "main-end";
		} else if (data.grid_col_end - (data.grid_col_start ?? 1) >= 3) {
			colEnd = "third-end 2";
		} else if (data.grid_col_end - (data.grid_col_start ?? 1) == 2) {
			colEnd = "half-end 1";
		} else {
			colEnd = "third-end 1";
		}
	} else {
		if (columns.currCol == 2 || data.grid_col_end == 8) {
			colEnd = "main-end";
		} else if (data.grid_col_end - (data.grid_col_start ?? 1) >= 4) {
			colEnd = "third-end 2";
		} else if (data.grid_col_end - (data.grid_col_start ?? 1) == 3) {
			colEnd = "half-end 1";
		} else {
			colEnd = "third-end 1";
		}
	}

	let columnHeight: number;

	// Trigger interaction on scroll
	export let selectedItem: number;

	function selectItem(i: number) {
		selectedItem = i;
		//console.log("selected: " + i);
	}

	let isScrollItem: boolean = data.column_interaction_on_scroll;
	let excludeFirstItem: boolean = data.column_interaction_exclude_first_item;
	let activeHighlight: string = data.column_interaction_active_highlight;
</script>

<template>
	{#if data.column_sticky === "top"}
		<div class="sticky-animation-trigger" 
			 style:--column-height={columnHeight}
			 use:animate={ { trigger: AnimateTrigger.WhileScrollingInView, targetSelector: `#sticky-row-${row}-col-${column}`, animClass: "column-sticky-animate" } }
		/>
	{/if}
	<div bind:offsetHeight={columnHeight}
		 id={data.column_sticky === "top" ? `sticky-row-${row}-col-${column}` : ""}
		 class:is-sticky={data.column_sticky != "false"}
		 style:--display-on-mobile={data.column_hidden_on_mobile ? "none" : "grid"}
		 style:--top={data.column_sticky === "top" ? "var(--SPACE-LG)" :
		 			 (data.column_sticky === "center" ? `calc(50vh - 1px * ${columnHeight} / 2)` :
		 			  `calc(100vh - 1px * ${columnHeight} - var(--SPACE-MD))`
		 			 )}
		 class="column-container"
		 style:--grid-column={`${data.grid_col_start_units}-start ${data.grid_col_start_units != "viewport" ? data.grid_col_start : ""} / ${data.grid_col_end_units}-end ${data.grid_col_end_units != "viewport" ? data.grid_col_end : ""}`}
		 style:--grid-column-tablet={`${colStart} / ${colEnd}`}
		 style:--grid-column-mobile={data.grid_col_start_units === "viewport" ? "viewport" : "main"}
		 style:--row-gap={`var(--SPACE-${data.column_item_spacing?.toUpperCase()}`}
		 style:--padding-left={`var(--SPACE-${data.column_padding_left?.toUpperCase()}`}
		 style:--padding-right={`var(--SPACE-${data.column_padding_right?.toUpperCase()}`}
	>
		{#each data.column_items?.map((c) => c?.item) ?? [] as data, i}
			{#if data?.__typename === "page_blocks_v3_molecule_accordion"}
				<Accordion 
					{data}
					{bleed}
					bind:selectedItem
				/>
			{:else if data?.__typename === "page_blocks_v3_molecule_card"}
				<Card 
					{data}
					{bleed}
					isScrollItem={isScrollItem && !(excludeFirstItem && i === 0)}
					{excludeFirstItem}
					isActive={!isScrollItem || (excludeFirstItem && i === 0) || (selectedItem === (excludeFirstItem ? i - 1 : i))}
					{activeHighlight}
					on:selectItem={(e) => selectItem(i - e.detail.subtrahend)}
				/>
			{:else if data?.__typename === "page_blocks_v3_organism_card_carousel"}
				<CardCarousel 
					{data}
					{row}
					{column}
					colItem={i}
					{bleed}
					bind:selectedItem
				/>
			{:else if data?.__typename === "page_blocks_v3_molecule_cta_list"}
				<CtaList 
					{data}
					{projectData}
					{bleed}
					bind:selectedItem
				/>
			{:else if data?.__typename === "page_blocks_v3_atom_spacer"}
				<Spacer {data} />
			{:else}
				No items in column
			{/if}
		{/each}
	</div>
</template>

<style lang="scss">
	div.sticky-animation-trigger {
		position: absolute;
		top: calc(100vh - var(--SPACE-LG));
		left: 0;
		height: calc(100% - var(--SPACE-LG) - 1px * var(--column-height));
	}
	div.column-container {
		grid-column: var(--grid-column);

		@media (max-width: 62.5em) {
			grid-column: var(--grid-column-tablet);
		}
		@media (max-width: 31.25em) {
			grid-column: var(--grid-column-mobile);
			display: var(--display-on-mobile);
		}

		display: grid;
		grid-template-columns: subgrid;
		row-gap: var(--row-gap);
		
		padding-left: var(--padding-left);
		padding-right: var(--padding-right);
		padding-bottom: 0.25em;
		
		@media (max-width: 62.5em) {
			--padding-left: 0;
			--padding-right: 0;
		}

		overflow: hidden;

		&.is-sticky {
			@media (min-width: 31.25em) {
				position: sticky;
				top: var(--top);
			}
		}
	}

	:global {
		.is-sticky {
			&.column-sticky-animate {
				//animation: column-sticky-animate 1s linear forwards;
			}
		}

		@keyframes column-sticky-animate {
			0% {
				transform: translate(0rem, 0rem);
			}
			100% {
				transform: translate(0rem, calc(var(--SPACE-XXXL)));
			}
		}
	}
</style>