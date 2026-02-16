<script lang="ts" context="module">
	export type CtaData = {
		cta_type?: string | null;
		cta_icon?: string | null;
		cta_icon_position?: string | null;
		cta_style?: string | null;
		cta_hover_highlight?: string | null;
		cta_text_bold?: string | null;
		cta_text_light?: string | null;
		cta_link?: string | null;
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import type { BleedData } from "../organisms/CardColumn.svelte";

	export let data: CtaData;
	export let bleed: BleedData = {
		left: false,
		right: false
	};

	export let button: boolean = false;
	export let sizeOverride: string = "";
	export let hoverOverride: string = "";
	export let iconOverride: string = "";

	// Remove <p> tags from rich text fields
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
	});
</script>

<template>
	<svelte:element this={button ? "button" : 
						 (data.cta_link ? "a" : "p")}
					href={data.cta_link ?? ""}
					target={data.cta_link?.includes("https://") && !data.cta_link?.includes("rsmdesign.com")
							? "_blank" : "_self"}
					class={`cta ${!button && data.cta_type === "button" ? "button" : "link"}
							hover-highlight-${hoverOverride != "" ? hoverOverride : data.cta_hover_highlight}`}
					style:--grid-column-start={bleed.left ? "2" : "1"}
					style:--grid-column-end={bleed.right ? "-2" : "-1"}
					style:--flex-direction={data.cta_icon_position === "left" ? "row-reverse" : "row"}
					style:--font-size={`var(--FONT-SIZE-${sizeOverride != "" ? sizeOverride?.toUpperCase() : "MD"})`}
					style:--line-height={sizeOverride === "lg" ? "1.167" : "1.333"}
	>
		<span>
			{#if data.cta_style != "light" && data.cta_text_bold}
				<strong bind:this={boldText}
						class:colon={data.cta_style === "colon"}
						class:interpunct={data.cta_style === "interpunct"}
				>
					{@html data.cta_text_bold}
				</strong>
			{/if}
			{#if data.cta_style != "bold" && data.cta_text_light}
				<span bind:this={lightText}
					  class="light"
				>
					{@html data.cta_text_light}
				</span>
			{/if}
		</span>
		{#if data.cta_icon != "none"}
			<span data-icon={iconOverride != "" ? iconOverride : data.cta_icon}
				  class={`icon ${data.cta_icon_position === "left" ? "margin-right" : "margin-left"}`}
				  aria-hidden="true"
			/>
		{/if}
	</svelte:element>
</template>

<style lang="scss">
	.cta {
		grid-column: var(--grid-column-start) / var(--grid-column-end);
		display: flex;
		flex-direction: var(--flex-direction);
		align-items: baseline;

		margin-bottom: var(--FONT-SIZE-XS);

		font-size: var(--font-size);
		font-weight: 300;
		line-height: var(--line-height);

		strong {
			font-weight: 700;

			&.colon::after {
				content: ":";
				margin-left: 0.05em;
			}

			&.interpunct::after {
				content: "·";
				margin-left: 0.4em;
			}
		}

		strong,
		span.light {
			transition: color 0.3s ease;
		}
	}

	a.cta:hover {
		color: var(--COLOR-ORANGE);

		&.hover-highlight-none {
			color: inherit;
		}
		&.hover-highlight-bold {
			strong {
				color: var(--COLOR-ORANGE);
			}
			span.light {
				color: inherit;
			}
		}
		&.hover-highlight-light {
			strong {
				color: inherit;
			}
			span.light {
				color: var(--COLOR-ORANGE);
			}
		}

		span.icon[data-icon="arrow_left"]::after,
		span.icon[data-icon="arrow_right"]::after {
			background-color: var(--COLOR-ORANGE);
			color: white;
		}
	}

	button, a.button {

	}

	span.icon {
		&.margin-right {
			margin-right: calc(var(--GRID-CELL) / 4);
		}
		&.margin-left {
			margin-left: calc(var(--GRID-CELL) / 4);
		}

		&::after {
			display: inline-flex;
			box-sizing: border-box;
		}
		&[data-icon="arrow_left"]::after,
		&[data-icon="arrow_right"]::after {
			width: calc((var(--font-size) + var(--font-size) * var(--line-height)) / 2);
			height: calc((var(--font-size) + var(--font-size) * var(--line-height)) / 2);
			border: 1.5px solid var(--COLOR-ORANGE);
			border-radius: 50%;

			align-content: center;
			justify-content: center;

			font-size: calc(var(--font-size) * var(--line-height));
			line-height: calc(var(--font-size) * var(--line-height) / 1.618);
			color: var(--COLOR-ORANGE);

			transition: color 0.25s ease, background-color 0.25s ease;
		}
		&[data-icon="arrow_left"]::after {
			content: "‹";
			padding-right: 1px;
		}
		&[data-icon="arrow_right"]::after {
			content: "›";
			padding-left: 1px;
		}
		&[data-icon="arrow_up"]::after {
			content: "‹";
		}
		&[data-icon="arrow_down"]::after {
			content: "›";
		}
		&[data-icon="arrow_up"]::after,
		&[data-icon="arrow_down"]::after {
			rotate: 90deg;
			transform: translate(0.167em, 0);
			transition: transform 0.3s ease-in-out;
		}
		&[data-icon="arrow_up"].open::after,
		&[data-icon="arrow_down"].open::after {
			transform: rotateY(180deg) translate(-0.167em, 0);
		}
	}
</style>