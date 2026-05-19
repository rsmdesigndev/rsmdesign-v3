<script lang="ts" context="module">
	import type { LayoutFields } from "./index.svelte";

	export type PageBlockListData = LayoutFields & {
		link_hover_effect?: string | null;
		heading_size?: string | null;
		text_size?: string | null;
		text_alignment?: string | null;
		section_heading?: string | null;
        items?: {
            text?: string | null;
            link?: string | null;
        }[] | null;
		list_columns?: number | null;
		view_more_text?: string | null;
		view_more_link?: string | null;
	};
</script>

<script lang="ts">
	import Section from "$lib/components/Section.svelte";
	import { animate, fadeMoveScroll } from "$lib/animate";
	export let data: PageBlockListData;
	export let order: number;
	export let project: boolean = false;
</script>

<Section 
	project={project}
	list
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
	{#if data.section_heading}
		<h3 class="{data.heading_size}
				   {data.text_alignment === "left" ? 'text-align-left' : 'text-align-right'}"
			 use:animate={fadeMoveScroll}
		>
			{data.section_heading}
		</h3>
	{/if}

	<ul class="{data.text_size}
			   {data.link_hover_effect === 'tracking' ? 'tracklist' : ''}
			   {data.text_alignment === "left" ? 'text-align-left' : 'text-align-right'}"
		style:--num-columns={data.list_columns}
	>
		{#each data.items as item}
			<li use:animate={fadeMoveScroll}>
				{#if item.link}
					<a href={item.link}>{item.text}</a>
				{:else}
					{item.text}
				{/if}
			</li>
		{/each}
	</ul>

	{#if data.view_more_link}
		<a href={data.view_more_link} 
		   class="view-all 
		   		  {data.text_alignment === "left" ? 'text-align-left' : 'text-align-right'}"
		   use:animate={fadeMoveScroll}
   		>
   			View all
   		</a>
	{/if}
</Section>

<style lang="scss">
	ul {
		columns: var(--num-columns);
		column-gap: calc(var(--GRID-CELL) * 0.5);

		&.tracklist {
			margin-top: var(--GRID-CELL);
			font-weight: 600;

			> li {
				margin-bottom: 0.5em;
				> a {
					transition: letter-spacing 0.2s ease, color 0.2s ease;

					&:hover {
						letter-spacing: 0.02em;
					}
				}
			}
		}
	}

	@media (max-width: 62.5em) {
		.text-align-right {
			text-align: left;
		}
	}

	a.view-all {
		margin-top: 1em;
	}
</style>