<script lang="ts" context="module">
	export type blockquoteData = {
		blockquote_size?: string | null;
		blockquote_text?: string | null;
		blockquote_has_attribution?: boolean | null;
		blockquote_attribution?: string | null;
		blockquote_has_citation?: boolean | null;
		blockquote_citation?: string | null;
		blockquote_link?: string | null;
	};
</script>

<script lang="ts">
	import Cta, { type CtaData } from "./Cta.svelte";
	import type { BleedData } from "../organisms/CardColumn.svelte";
	export let data: BlockquoteData;
	export let bleed: BleedData;
</script>

<template>
	<figure style:--grid-column-start={bleed.left ? "2" : "1"}
			style:--grid-column-end={bleed.right ? "-2" : "-1"}
	>
		<blockquote style:--font-size={`var(--FONT-SIZE-${data.blockquote_size?.toUpperCase()})`}
					style:--line-height={data.blockquote_size === "xl" ? "1.133" : "1"}
					cite={data.blockquote_link ?? ""}>
			{@html data.blockquote_text}
		</blockquote>
		{#if (data.blockquote_has_attribution && data.blockquote_attribution) || (data.blockquote_has_citation && data.blockquote_citation)}
			<figcaption>
				{#if data.blockquote_link}
					<Cta data={ { cta_icon: "arrow_right", 
								  cta_style: `${(data.blockquote_has_attribution && data.blockquote_has_citation) ? "both" : "bold"}`,
								  cta_text_bold: `${(data.blockquote_has_attribution && data.blockquote_attribution) ? 
													 data.blockquote_attribution : 
													 ((data.blockquote_has_citation && data.blockquote_citation) ? 
													 data.blockquote_citation : "Quote source")}`,
								  cta_text_light: `${(!data.blockquote_has_attribution && 
													   data.blockquote_has_citation && 
													   data.blockquote_citation) ? 
													   data.blockquote_citation : "Quote source"}`,
								  cta_link: data.blockquote_link
							  } }
					/>
				{:else}
					{#if data.blockquote_has_attribution && data.blockquote_attribution}
						{data.blockquote_attribution},
					{/if}
					{#if data.blockquote_has_citation && data.blockquote_citation}
						<cite>{data.blockquote_citation}</cite>
					{/if}
				{/if}
			</figcaption>
		{/if}
	</figure>
</template>

<style lang="scss">
	figure {
		grid-column: var(--grid-column-start) / var(--grid-column-end);
		margin: 0;
		padding: 0;

		> blockquote {
			margin: 0;
			padding: 0;

			font-size: var(--font-size);
			font-weight: 400;
			line-height: var(--line-height);

			:global {
				p:first-child::before {
					content: "“";
					margin-left: -0.4em;
				}
				p:last-child::after {
					content: "”";
				}
			}
		}

		> figcaption {
			font-weight: 700;

			> cite {
				font-weight: 300;
			}
		}
	}
</style>