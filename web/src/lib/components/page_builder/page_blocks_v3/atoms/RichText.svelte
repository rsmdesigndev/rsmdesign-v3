<script lang="ts" context="module">
	export type RichTextData = {
		rich_text_size?: string | null;
		rich_text_content?: string | null;
		rich_text_has_read_more?: boolean | null;
		rich_text_content_read_more?: string | null;
	};
</script>

<script lang="ts">
	import type { BleedData } from "../organisms/CardColumn.svelte";
	import Details from "./Details.svelte";

	export let data: RichTextData;
	export let bleed: BleedData;
</script>

<template>
	<div class={`rich-text-v3 rich-text-${data.rich_text_size}`}
		 class:read-more={data.rich_text_has_read_more}
		 style:--grid-column-start={bleed.left ? "2" : "1"}
		 style:--grid-column-end={bleed.right ? "-2" : "-1"}
	>
		{@html data.rich_text_content}
		{#if data.rich_text_has_read_more}
			<Details summaryText="Read more"
					 summaryTextOpen="Read less"
					 summaryIcon="plus"
			>
				{#if data.rich_text_content_read_more}
					{@html data.rich_text_content_read_more}
				{:else}
					<p>“Read more” enabled, but no content provided.</p>
				{/if}
			</Details>
		{/if}
	</div>
</template>

<style lang="scss">
	.rich-text-v3 {
		grid-column: var(--grid-column-start) / var(--grid-column-end);
		font-weight: 300;

		:global {
			p {
				font-size: inherit;

				&:last-of-type {
					margin-bottom: 0;
				}
			}

			h3 {
				font-size: inherit;
				font-weight: 700;
				text-transform: uppercase;
				letter-spacing: 0.05em;
			}
			h4 {
				font-size: inherit;
				font-weight: 700;
			}
		}

		&.read-more {
			:global {
				p:last-of-type {
					margin-bottom: var(--SPACE-MD);
				}
			}
		}
	}
	.rich-text-sm {
		font-size: var(--FONT-SIZE-SM);
		line-height: 1.333;
	}
	.rich-text-md {
		font-size: var(--FONT-SIZE-MD);
		line-height: 1.333;
	}
	.rich-text-lg {
		font-size: var(--FONT-SIZE-LG);
		line-height: 1.167;
	}
	.rich-text-xl {
		font-size: var(--FONT-SIZE-XL);
		line-height: 1.133;
	}
</style>