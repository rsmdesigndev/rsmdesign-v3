<script lang="ts" context="module">
	export type CardRowData = {
		change_background_color?: boolean | null;
		section_background_color?: string | null;
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
	import { animate, AnimateTrigger } from "$lib/animate";
	import CardColumn, { type CardColumnData } from "./CardColumn.svelte";
	import type { ProjectData } from "../index.svelte";

	export let data: CardRowData;
	export let projectData: ProjectData | null | undefined = undefined;
	export let rowNumber: number;

	let offsetDimensions: (number | string)[];

	let numCols: number = data.columns.length;
</script>

<svelte:head>
	{@html `<`+`style>:root{--bg-color-${rowNumber}:${data.section_background_color ?? '#' + Math.floor(Math.random()*16777215).toString(16)};}</style>`}
</svelte:head>

<template>
	<div id={`bg-color-${rowNumber}`}
		 class="bg-color"
		 style:--bg-color={data.section_background_color}
	/>

	<section
		class={`padding-top-${data.section_padding_top}
				padding-bottom-${data.section_padding_bottom}`}
		style:--columns-alignment={data.columns_alignment}
		use:animate={ { trigger: AnimateTrigger.WhileScrollingInView, targetSelector: `#bg-color-${rowNumber}`, animClass: "bg-color-animate" } }
	>
		{#each data.columns as data, i}
			<CardColumn {data} 
						{projectData} 
						columns={{numCols: numCols, currCol: i+1}}
						bind:offsetDimensions 
			/>
		{/each}
	</section>

	<div class="menu-bar" 
		 style:--bg-color={data.section_background_color}
	/>
</template>

<style lang="scss">
	div.bg-color,
	div.menu-bar {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
	}
	div.bg-color {
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
		z-index: 1;
	}

	div.menu-bar {
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
		z-index: 3;

		height: var(--SPACE-LG);
		margin-bottom: calc(-1 * var(--SPACE-LG));
	}

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

		grid-column: viewport;
		display: grid;
		grid-template-columns: subgrid;
		align-items: var(--columns-alignment);

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

	:global {
		.bg-color-animate {
			background: transparent;
			animation: bg-color-animate 1s linear forwards;
		}

		@keyframes bg-color-animate {
			0% {
				background: transparent;
			}
			25% {
				background: transparent;
			}
			50% {
				background: var(--bg-color);
			}
			100% {
				background: var(--bg-color);
			}
		}
	}
</style>