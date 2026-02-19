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
		column_items_data_bound?: boolean | null;
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

	export let offsetDimensions: (number | string)[];
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
	let colStartUnits: string = (data.grid_col_start_units === "viewport") ? "viewport" : "third";
	let colStart: number = columns.currCol;
	let colEndUnits: string = (data.grid_col_end_units === "viewport") ? "viewport" : "third";
	let colSpan: number = 0;

	if ((data.grid_col_end_units === "sixth" && data.grid_col_end - data.grid_col_start === 5) ||
		(data.grid_col_end_units === "eighth" && data.grid_col_end - data.grid_col_start === 7)) {
		colSpan = 3;
	} else if ((data.grid_col_end_units === "sixth" && data.grid_col_end - data.grid_col_start > 2) ||
			   (data.grid_col_end_units === "eighth" && data.grid_col_end - data.grid_col_start > 3)) {
		colSpan = 2;
	} else if ((data.grid_col_end_units === "sixth" && data.grid_col_end - data.grid_col_start === 2) ||
			   (data.grid_col_end_units === "eighth" && data.grid_col_end - data.grid_col_start === 3)) {
		colStartUnits = "half";
		colEndUnits = "half";
		colSpan = 1;
	} else {
		colSpan = 1;
		if (columns.currCol === 2) {
			colStart = 3;
		}
	}

	let columnHeight: number;
</script>

<template>
	{#if data.column_sticky === "top"}
		<div class="sticky-animation-trigger" 
			 style:--column-height={columnHeight}
			 use:animate={ { trigger: AnimateTrigger.WhileScrollingInView, targetSelector: `#column-sticky-${row}-${column}`, animClass: "column-sticky-animate" } }
		/>
	{/if}
	<div bind:offsetHeight={columnHeight}
		 id={data.column_sticky === "top" ? `column-sticky-${row}-${column}` : ""}
		 class:is-sticky={data.column_sticky != "false"}
		 style:--top={data.column_sticky === "top" ? "var(--SPACE-LG)" :
		 			 (data.column_sticky === "center" ? "calc(50vh - 1px * columnHeight / 2)" :
		 			  "calc(100vh - 1px * columnHeight - var(--SPACE-MD))"
		 			 )}
		 class="column-container"
		 style:--grid-column={`${data.grid_col_start_units}-start ${data.grid_col_start_units != "viewport" ? data.grid_col_start : ""} / ${data.grid_col_end_units}-end ${data.grid_col_end_units != "viewport" ? data.grid_col_end : ""}`}
		 style:--grid-column-tablet={`${colStartUnits}-start ${colStart} / ${colEndUnits}-end ${colStart - 1 + colSpan}`}
		 style:--grid-column-mobile={data.grid_col_start_units === "viewport" ? "viewport" : "main"}
		 style:--row-gap={`var(--SPACE-${data.column_item_spacing?.toUpperCase()}`}
		 style:--padding-left={`var(--SPACE-${data.column_padding_left?.toUpperCase()}`}
		 style:--padding-right={`var(--SPACE-${data.column_padding_right?.toUpperCase()}`}
	>
		{#each data.column_items?.map((c) => c?.item) ?? [] as data, i}
			{#if data?.__typename === "page_blocks_v3_molecule_accordion"}
				<Accordion {data} {bleed} />
			{:else if data?.__typename === "page_blocks_v3_molecule_card"}
				<Card {data} {bleed} />
			{:else if data?.__typename === "page_blocks_v3_organism_card_carousel"}
				<CardCarousel {data} {row} {column} colItem={i} {bleed} />
			{:else if data?.__typename === "page_blocks_v3_molecule_cta_list"}
				<CtaList {data} {projectData} {bleed} {offsetDimensions} />
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
		}

		display: grid;
		grid-template-columns: subgrid;
		row-gap: var(--row-gap);
		
		padding-left: var(--padding-left);
		padding-right: var(--padding-right);
		
		@media (max-width: 62.5em) {
			--padding-left: 0;
			--padding-right: 0;
		}

		overflow-x: hidden;

		&.is-sticky {
			position: sticky;
			top: var(--top);
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