<script lang="ts" context="module">
	export type CardRowData = {
		change_background_color?: boolean | null;
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
	import { animate, AnimateTrigger } from "$lib/animate";
	import CardColumn, { type CardColumnData } from "./CardColumn.svelte";
	import type { ProjectData } from "../index.svelte";

	export let data: CardRowData;
	export let projectData: ProjectData | null | undefined = undefined;
	export let previousTheme: string | null;
	export let rowNumber: number;

	let offsetDimensions: (number | string)[];

	let numCols: number = data.columns.length;
</script>

<svelte:head>
	{@html `<`+`style>:root{--color-background-${rowNumber}:${data.section_background_color ?? '#' + Math.floor(Math.random()*16777215).toString(16)};}</style>`}
</svelte:head>

<template>
	<div id={`bg-color-${rowNumber}`}
		 class="bg-color"
		 style:--color-background={data.section_background_color}
	/>

	<section
		id={`row-${rowNumber}`}
		class={`padding-top-${data.section_padding_top}
				padding-bottom-${data.section_padding_bottom}
				color-theme-${data.section_color_theme}
				previous-color-theme-${previousTheme}`}
		style:--columns-alignment={data.columns_alignment}
		style:--color-background={data.section_background_color}
		use:animate={ { trigger: AnimateTrigger.WhileScrollingInView, targetSelector: `#bg-color-${rowNumber}`, animClass: "bg-color-animate" } }
	>
		<div class="bg-color-trigger"
			 use:animate={ { trigger: AnimateTrigger.WhileScrollingInView, targetSelector: `#row-${rowNumber}`, animClass: "theme-switch-animate" } }
		/>
		<div class="bg-color-trigger"
			 use:animate={ { trigger: AnimateTrigger.WhileScrollingInView, targetSelector: `#menu-bar-${rowNumber}`, animClass: "bg-color-animate" } }
		/>
		{#each data.columns as data, i}
			<CardColumn {data} 
						row={rowNumber}
						column={i}
						{projectData} 
						columns={{numCols: numCols, currCol: i+1}}
						bind:offsetDimensions 
			/>
		{/each}
	</section>

	<div id={`menu-bar-${rowNumber}`}
		 class="menu-bar" 
		 style:--color-background={data.section_background_color}
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

		height: calc(var(--GRID-CELL) * 1.75);
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
		position: relative;

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

		> .bg-color-trigger {
			position: absolute;
			top: 0;
			left: 0;
			height: 100%;
			width: 100%;
		}

		&.color-theme-light {
			--theme-color-primary: var(--COLOR-BLACK);
			--theme-color-secondary: var(--COLOR-MID-GRAY);
			--theme-color-tertiary: var(--COLOR-DIM-GRAY);
			--theme-color-accent: var(--COLOR-ORANGE);
		}
		&.color-theme-dark {
			--theme-color-primary: white;
			--theme-color-secondary: var(--COLOR-MID-GRAY);
			--theme-color-tertiary: var(--COLOR-DIM-GRAY);
			--theme-color-accent: var(--COLOR-ORANGE);
		}
		&.color-theme-neutral {
			--theme-color-primary: var(--COLOR-BLACK);
			--theme-color-secondary: white;
			--theme-color-tertiary: var(--COLOR-DIM-GRAY);
			--theme-color-accent: var(--COLOR-ORANGE);
		}
		&.color-theme-color {
			--theme-color-primary: white;
			--theme-color-secondary: white;
			--theme-color-tertiary: var(--COLOR-DIM-GRAY);
			--theme-color-accent: var(--COLOR-BLACK);
		}
		&.previous-color-theme-light {
			--previous-theme-color-primary: var(--COLOR-BLACK);
			--previous-theme-color-secondary: var(--COLOR-MID-GRAY);
			--previous-theme-color-tertiary: var(--COLOR-DIM-GRAY);
			--previous-theme-color-accent: var(--COLOR-ORANGE);
		}
		&.previous-color-theme-dark {
			--previous-theme-color-primary: white;
			--previous-theme-color-secondary: var(--COLOR-MID-GRAY);
			--previous-theme-color-tertiary: var(--COLOR-DIM-GRAY);
			--previous-theme-color-accent: var(--COLOR-ORANGE);
		}
		&.previous-color-theme-neutral {
			--previous-theme-color-primary: var(--COLOR-BLACK);
			--previous-theme-color-secondary: white;
			--previous-theme-color-tertiary: var(--COLOR-DIM-GRAY);
			--previous-theme-color-accent: var(--COLOR-ORANGE);
		}
		&.previous-color-theme-color {
			--previous-theme-color-primary: white;
			--previous-theme-color-secondary: white;
			--previous-theme-color-tertiary: var(--COLOR-DIM-GRAY);
			--previous-theme-color-accent: var(--COLOR-BLACK);
		}
	}

	@property --color-primary {
		syntax: "<color>";
		inherits: true;
		initial-value: var(--COLOR-BLACK);
	}
	@property --color-secondary {
		syntax: "<color>";
		inherits: true;
		initial-value: var(--COLOR-MID-GRAY);
	}
	@property --color-tertiary {
		syntax: "<color>";
		inherits: true;
		initial-value: var(--COLOR-DIM-GRAY);
	}
	@property --color-accent {
		syntax: "<color>";
		inherits: true;
		initial-value: var(--COLOR-ORANGE);
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
				background: var(--color-background);
			}
			100% {
				background: var(--color-background);
			}
		}

		.theme-switch-animate {
			animation: theme-switch-animate 1s linear forwards;
		}

		// TODO: Find way to fix 'flips at 50%' behavior
		// See https://stackoverflow.com/questions/50661638/css-animate-custom-properties-variables
		// https://web.dev/blog/at-property-baseline
		@keyframes theme-switch-animate {
			0% {
				--color-primary: var(--previous-theme-color-primary, var(--COLOR-BLACK));
				--color-secondary: var(--previous-theme-color-secondary, var(--COLOR-MID-GRAY));
				--color-tertiary: var(--previous-theme-color-tertiary, var(--COLOR-DIM-GRAY));
				--color-accent: var(--previous-theme-color-accent, var(--COLOR-ORANGE));
			}
			25% {
				--color-primary: var(--previous-theme-color-primary, var(--COLOR-BLACK));
				--color-secondary: var(--previous-theme-color-secondary, var(--COLOR-MID-GRAY));
				--color-tertiary: var(--previous-theme-color-tertiary, var(--COLOR-DIM-GRAY));
				--color-accent: var(--previous-theme-color-accent, var(--COLOR-ORANGE));
			}
			50% {
				--color-primary: var(--theme-color-primary, var(--COLOR-BLACK));
				--color-secondary: var(--theme-color-secondary, var(--COLOR-MID-GRAY));
				--color-tertiary: var(--theme-color-tertiary, var(--COLOR-DIM-GRAY));
				--color-accent: var(--theme-color-accent, var(--COLOR-ORANGE));
			}
			100% {
				--color-primary: var(--theme-color-primary, var(--COLOR-BLACK));
				--color-secondary: var(--theme-color-secondary, var(--COLOR-MID-GRAY));
				--color-tertiary: var(--theme-color-tertiary, var(--COLOR-DIM-GRAY));
				--color-accent: var(--theme-color-accent, var(--COLOR-ORANGE));
			}
		}
	}
</style>