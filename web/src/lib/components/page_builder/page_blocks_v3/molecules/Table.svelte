<script lang="ts" context="module">
	export type TableData = {
		table_heading_size?: string | null;
		table_data_size?: string | null;
		table_first_row_header?: boolean | null;
		table_content?: string | null;
	};
</script>

<script lang="ts">
	import type { BleedData } from "../organisms/CardColumn.svelte";

	export let data: AccordionData;
	export let bleed: BleedData;

	/*// Remove <p> tags from rich text fields
	let boldText: HTMLElement;
	let lightText: HTMLElement;
	onMount(() => {
		if (data.cta_text_bold) {
			const paragraphsInBoldText = boldText.querySelectorAll('p');
			if (paragraphsInBoldText.length) {
				boldText.innerHTML = "";
				paragraphsInBoldText.forEach((paragraph) => {
					boldText.innerHTML += paragraph.innerHTML;
				});
			}
		}
		if (data.cta_text_light) {
			const paragraphsInLightText = lightText.querySelectorAll('p');
			if (paragraphsInLightText.length) {
				lightText.innerHTML = "";
				paragraphsInLightText.forEach((paragraph) => {
					lightText.innerHTML += paragraph.innerHTML;
				});
			}
		}
	});*/
</script>

<template>
	<div class="table"
		 style:--grid-column-start={bleed.left ? "2" : "1"}
		 style:--grid-column-end={bleed.right ? "-2" : "-1"}
	>
		{@html data.table_content}
	</div>
</template>

<style lang="scss">
	.accordion {
		grid-column: var(--grid-column-start) / var(--grid-column-end);
	}
</style>