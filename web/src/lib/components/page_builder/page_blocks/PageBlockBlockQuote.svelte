<script lang="ts" context="module">
	export type PageBlockBlockQuoteData = {
		attribution?: string | null;
		body?: string | null;
		citation?: string | null;
		font_size?: string | null;
	}
</script>

<script lang="ts">
	import Section from "$lib/components/Section.svelte";
	import { animate, fadeMoveScroll } from "$lib/animate";
	export let data: PageBlockBlockQuoteData;
	export let order: number;
	export let project: boolean = false;

</script>

<Section 
	project={project}
	blockQuote
	order={order}
	span_columns={data.span_columns ?? 1}
	col_units={data.col_units ?? "whole"}
	col_start={data.col_start ?? 1}
	padding_left={data.padding_left ?? "none"}
	padding_right={data.padding_right ?? "none"}
	span_rows={data.span_rows ?? 1}
	padding_top={data.padding_top ?? "default"}
	anchor_id={data.anchor_id ?? ""}
>
	<figure>
		<blockquote class={data.font_size ? data.font_size : "xl"} use:animate={fadeMoveScroll}>
			{@html data.body}
		</blockquote>
		{#if data.attribution || data.citation}
			<figcaption use:animate={fadeMoveScroll}>
				{#if data.attribution}
					{data.attribution}
				{/if}
				{#if data.citation}
					<cite>{data.citation}</cite>
				{/if}
			</figcaption>
		{/if}
	</figure>
</Section>

<style lang="scss">
	figure {
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;

		@media (max-width: 46.875em) {
			align-items: flex-start;
			text-align: left;
		}

		&::before,
		&::after {
			//width: 100%;
			display: block;
			position: relative;
			font-size: calc(var(--FONT-SIZE-XXXL) * 1.618);
			font-weight: 600;
			line-height: 0.333;
		}
		&::before {
			content: "“";
			margin: 0.167em 0;
		}
		&::after {
			content: "”";
			margin: 0.733em 0 -0.2em;
		}

		> blockquote {
			margin: 0;
			padding: 0;
			max-width: 75%;

			@media (max-width: 46.875em) {
				max-width: 80%;
			}
		}

		> figcaption {
			margin: var(--GRID-CELL) 0 -0.667em;
			font-weight: 600;
			text-transform: uppercase;
			letter-spacing: 0.05em;

			cite {
				display: block;
				font-weight: 400;
				text-transform: none;
				letter-spacing: 0;
			}
		}
	}
</style>