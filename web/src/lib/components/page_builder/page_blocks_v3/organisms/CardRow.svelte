<script lang="ts" context="module">
	export type CardRowData = {
		section_background_color?: string | null;
		section_color_theme?: string | null;
		change_breadcrumbs?: boolean | null;
		section_anchor_text?: string | null;
		section_anchor_link?: string | null;
		section_padding_top?: string | null;
		section_padding_bottom?: string | null;
		columns_alignment?: string | null;
		columns?: CardColumnData[] | null;
	}
</script>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import CardColumn, { type CardColumnData } from "./CardColumn.svelte";
	import type { ProjectData, ExpertiseData } from "../index.svelte";

	export let data: CardRowData;
	export let projectData: ProjectData | null | undefined = undefined;
	export let expertiseData: ExpertiseData | null | undefined = undefined;
	export let rowNumber: number;

	// Color theme
	const dispatch = createEventDispatcher();

	function selectRowOnIntersection(node: Element) {
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				dispatch('selectRow');
			}
		}, { rootMargin: '-50% 0% -50% 0%' });
		observer.observe(node);
		return {
			destroy() {
				observer.disconnect();
			}
		};
	}

	// Data binding
	let numCols: number = data.columns.length;
	let selectedItem: number = 0;
</script>

<template>
	<section
		id={`row-${rowNumber}`}
		class={`padding-top-${data.section_padding_top}
				padding-bottom-${data.section_padding_bottom}`}
		style:--columns-alignment={data.columns_alignment}

		use:selectRowOnIntersection
	>
		{#each data.columns as data, i}
			<CardColumn {data} 
						row={rowNumber}
						column={i}
						{projectData}
						{expertiseData}
						columns={{numCols: numCols, currCol: i+1}}
						bind:selectedItem
			/>
		{/each}
	</section>
</template>

<style lang="scss">
	section {
		/* 
			Z-Indexes
			1: Background color
			2: Content
			3: Menu bar
			4: Logo
			5: Hero
			6: Breadcrumbs
			7: Menu overlay
			8: Menu button
		*/
		z-index: 2;
		position: relative;

		grid-column: viewport;
		display: grid;
		grid-template-columns: subgrid;
		align-items: var(--columns-alignment);

		@media (max-width: 31.25em) {
			row-gap: var(--SPACE-LG);
		}

		&.padding-top-sm {
			padding-top: var(--SPACE-SM);
		}
		&.padding-bottom-sm {
			padding-bottom: var(--SPACE-SM);
		}
		&.padding-top-md {
			padding-top: var(--SPACE-MD);
		}
		&.padding-bottom-md {
			padding-bottom: var(--SPACE-MD);
		}
		&.padding-top-lg {
			padding-top: var(--SPACE-LG);
		}
		&.padding-bottom-lg {
			padding-bottom: var(--SPACE-LG);
		}
		&.padding-top-xl {
			padding-top: var(--SPACE-XL);
		}
		&.padding-bottom-xl {
			padding-bottom: var(--SPACE-XL);
		}
		&.padding-top-xxl {
			padding-top: var(--SPACE-XXL);
		}
		&.padding-bottom-xxl {
			padding-bottom: var(--SPACE-XXL);
		}
		&.padding-top-xxxl {
			padding-top: var(--SPACE-XXXL);
		}
		&.padding-bottom-xxxl {
			padding-bottom: var(--SPACE-XXXL);
		}
	}
</style>