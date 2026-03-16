<script lang="ts" context="module">
	export type AccordionData = {
		accordion_data_bound?: boolean | null;
		accordion_first_item_open?: boolean | null;
		accordion_items?: AccordionItem[] | null;
	};

	type AccordionItem = {
		item_heading?: string | null;
		item_rich_text?: string | null;
	};
</script>

<script lang="ts">
	import type { BleedData } from "../organisms/CardColumn.svelte";
	import Details from "../atoms/Details.svelte";

	export let data: AccordionData;
	export let bleed: BleedData;

	// Trigger interaction on scroll
	export let selectedItem: number;

	if (!data.accordion_first_item_open) {
		selectedItem = -1;
	}

	function selectItem(i: number, isOpen: boolean) {
		if (isOpen) {
			selectedItem = i;
		}
	}
</script>

<template>
	<div class="accordion"
		 style:--grid-column-start={bleed.left ? "2" : "1"}
		 style:--grid-column-end={bleed.right ? "-2" : "-1"}
	>
		{#each data.accordion_items as item, i}
			<Details summaryText={item.item_heading}
					 summaryIcon="plus"
					 isOpen={selectedItem === i}
					 on:toggle={(e) => selectItem(i, e.detail.isOpen)}
			>
				{@html item.item_rich_text}
			</Details>
		{/each}
	</div>
</template>

<style lang="scss">
	.accordion {
		grid-column: var(--grid-column-start) / var(--grid-column-end);

		display: flex;
		flex-direction: column;
		row-gap: var(--SPACE-MD);
	}
</style>