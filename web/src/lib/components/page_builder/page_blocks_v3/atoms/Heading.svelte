<script lang="ts" context="module">
	export type HeadingData = {
		heading_type?: string | null;
		heading_primary?: string | null;
		heading_size?: string | null;
		heading_weight?: string | null;
		heading_has_small_text?: boolean | null;
		heading_small?: string | null;
		heading_has_large_text?: boolean | null;
		heading_large?: string | null;
		heading_has_superscript?: boolean | null;
		heading_superscript?: string | null;
	};
</script>

<script lang="ts">
	import type { BleedData } from "../organisms/CardColumn.svelte";
	export let data: HeadingData;
	export let bleed: BleedData = {
		left: false,
		right: false
	};

	let weightLarge: number = 300;
	let weightSmall: number = 600;
	switch (data.heading_size) {
		case "xxxl":
			if (data.heading_weight === "bold") {
				weightLarge = 400;
				weightSmall = 700;
			}
			break;
		case "xxl":
			weightLarge = 400;
			weightSmall = 700;
			break;
		case "xl":
			if (data.heading_weight === "bold") {
				weightLarge = 500;
			} else {
				weightLarge = 400;
			}
			break;
		case "lg":
			if (data.heading_weight === "bold") {
				weightLarge = 700;
			} else {
				weightLarge = 500;
				weightSmall = 500;
			}
			break;
	}

	export let headingHeight: number;
	$: console.log(headingHeight);
</script>

<template>
	<div bind:offsetHeight={headingHeight}
		 class="heading"
		 style:--grid-column-start={bleed.left ? "2" : "1"}
		 style:--grid-column-end={bleed.right ? "-2" : "-1"}
	>
		{#if data.heading_has_small_text && data.heading_small}
			<svelte:element 
				this={data.heading_type === "gridItem" ? "h4" :
					 (data.heading_type === "page" && data.heading_primary === "small" ? "h1" : 
					 (data.heading_type === "page" || data.heading_primary === "small" ? "h2" : "h3"))}
				class="heading-small"
				style:--font-size={`var(--FONT-SIZE-${data.heading_size === "lg" ? "XS" :
													 (data.heading_size === "xl" ? "SM" : "MD")})`}
				style:--font-weight={weightSmall}
				style:--line-height="1.333"
			>
				{data.heading_small}
			</svelte:element>
		{/if}
		{#if data.heading_has_large_text && data.heading_large}
			<svelte:element 
				this={data.heading_type === "gridItem" ? "h3" :
					 (data.heading_type === "page" && data.heading_primary === "large" ? "h1" : 
					 (data.heading_type === "page" || data.heading_primary === "large" ? "h2" : "h3"))}
				class="heading-large"
				style:--font-size={`var(--FONT-SIZE-${data.heading_size?.toUpperCase()})`}
				style:--font-weight={weightLarge}
				style:--line-height={data.heading_size === "lg" ? "1.167" :
												(data.heading_size === "xl" ? "1.133" : "1")}

			>
				{data.heading_large}
				{#if data.heading_has_superscript && data.heading_superscript}
					<sup>(&hairsp;{data.heading_superscript}&hairsp;)</sup>
				{/if}
			</svelte:element>
		{/if}
	</div>
</template>

<style lang="scss">
	.heading {
		grid-column: var(--grid-column-start) / var(--grid-column-end);
		
		.heading-large, 
		.heading-small {
			font-size: var(--font-size);
			font-weight: var(--font-weight, 700);
			line-height: var(--line-height);
		}
		.heading-small {
			text-transform: uppercase;
			letter-spacing: 0.05em;
		}
	}
</style>