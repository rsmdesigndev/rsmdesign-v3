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
</script>

<template>
	<div class="accordion"
		 style:--grid-column-start={bleed.left ? "2" : "1"}
		 style:--grid-column-end={bleed.right ? "-2" : "-1"}
	>
		{#each data.accordion_items as item, i}
			<Details summaryText={item.item_heading}
					 summaryIcon="plus"
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