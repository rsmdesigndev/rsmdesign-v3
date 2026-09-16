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
	export let isActive: boolean = true;
	export let activeHighlight: string = "accent";
	export let isScrollItem: boolean = false;

	export let link: string | null = null;

	$: isExternal = !!link && link.includes("https://") && !link.includes("rsmdesign.com");
	$: hasSmall = !!(data.heading_has_small_text && data.heading_small);
	$: hasLarge = !!(data.heading_has_large_text && data.heading_large);
	$: hasSuperscript = !!(data.heading_has_superscript && data.heading_superscript);

	// Decide which slot is the heading, and which is a kicker, separate from display size
	$: primarySlot = (data.heading_primary === "small" && hasSmall) ? "small"
		: hasLarge ? "large"
		: hasSmall ? "small"
		: null;

	$: headingLevel = data.heading_type === "feed-item" ? "h3"
		: data.heading_type === "page" ? "h1"
		: "h2";

	$: linkSlot = link ? primarySlot : null;

	let weightLarge: number = 300;
	let weightSmall: number = 600;
	switch (data.heading_size) {
		case "xxxl":
			if (data.heading_weight === "bold") {
				weightLarge = 400;
				//weightSmall = 700;
			}
			break;
		case "xxl":
			if (data.heading_weight === "bold") {
				weightLarge = 400;
				//weightSmall = 600;
			} else {
				weightSmall = 500;
			}
			break;
		case "xl":
			if (data.heading_weight === "bold") {
				weightLarge = 500;
			} else if (data.heading_weight === "light") {
				weightLarge = 300;
				weightSmall = 500;
			} else {
				weightLarge = 400;
				weightSmall = 600;
			}
			break;
		case "lg":
			weightSmall = 500;
			if (data.heading_weight === "bold") {
				weightLarge = 600;
			} else {
				weightLarge = 500;
			}
			break;
	}
</script>

<div class="heading"
	 class:active={isActive}
	 class:scroll-item={isScrollItem}
	 style:--grid-column-start={bleed.left ? "2" : "1"}
	 style:--grid-column-end={bleed.right ? "-2" : "-1"}
	 style:--active-highlight={`var(--color-${activeHighlight}, var(--color-accent))`}
	 style:--color-heading-small={activeHighlight === "primary" ? "var(--color-secondary)" : "var(--color-heading)"}
>
	{#if hasSmall}
		<svelte:element 
			this={primarySlot === "small" ? headingLevel : "p"}
			class="heading-small"
			style:--font-size={`var(--FONT-SIZE-${data.heading_size === "lg" ? "XS" :
												 (data.heading_size === "xl" ? "SM" : "MD")})`}
			style:--font-weight={weightSmall}
			style:--line-height="1.333"
		>
			{#if linkSlot === "small"}
				<a class="stretched" data-card-link href={link}
				   data-sveltekit-preload-data="tap"
				   target={isExternal ? "_blank" : "_self"}
				   rel={isExternal ? "noopener" : undefined}
				>{data.heading_small}</a>
			{:else}
				{data.heading_small}
			{/if}
		</svelte:element>
	{/if}
	{#if hasLarge}
		<svelte:element 
			this={primarySlot === "large" ? headingLevel : "p"}
			class="heading-large"
			style:--font-size={`var(--FONT-SIZE-${data.heading_size?.toUpperCase()})`}
			style:--font-weight={weightLarge}
			style:--line-height={data.heading_size === "lg" ? "1.167" :
								(data.heading_size === "xl" ? "1.133" : "1")}

		>
			{#if linkSlot === "large"}
				<a class="stretched" data-card-link href={link}
				   data-sveltekit-preload-data="tap"
				   target={isExternal ? "_blank" : "_self"}
				   rel={isExternal ? "noopener" : undefined}
				>{data.heading_large}</a>
			{:else}
				{data.heading_large}
			{/if}
			{#if hasSuperscript}
				<sup>{data.heading_superscript}</sup>
			{/if}
		</svelte:element>
	{/if}
</div>

<style lang="scss">
	a.stretched {
		color: inherit;
		text-decoration: none;

		&::after {
			content: "";
			position: absolute;
			inset: 0;
			z-index: 1;
		}
	}

	.heading {
		grid-column: var(--grid-column-start) / var(--grid-column-end);
		color: var(--color-heading, var(--color-primary, var(--COLOR-BLACK)));
		opacity: 0.382;

		transition: all 0.3s ease;

		&.active {
			opacity: 1;

			&.scroll-item {
				.heading-large {
					color: var(--active-highlight);
				}
				.heading-small {
					color: var(--color-heading-small);
				}
			}
		}
		
		.heading-large, 
		.heading-small {
			margin: 0;
			font-size: var(--font-size);
			font-weight: var(--font-weight, 600);
			line-height: var(--line-height);

			transition: color 0.3s ease;

			display: flex;
			align-items: center;
			column-gap: calc(var(--GRID-CELL) / 3);
		}
		.heading-large {
			white-space: pre-line;
			@media (max-width: 62.5em) {
				white-space: normal;
			}
			> sup {
				font-size: 50%;
				font-weight: calc(var(--font-weight) + 100);
				color: var(--color-secondary);

			}
		}
		.heading-small {
			text-transform: uppercase;
			letter-spacing: 0.05em;
		}
	}
</style>