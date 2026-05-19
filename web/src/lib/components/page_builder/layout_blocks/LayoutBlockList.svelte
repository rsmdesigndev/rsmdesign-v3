<script lang="ts" context="module">
	import type { LayoutFields } from "./index.svelte";

	export type LayoutBlockListData = LayoutFields & {
		section_heading?: string | null;
        items?: {
            text?: string | null;
            link?: string | null;
        }[] | null;
		num_columns?: number | null;
		view_more_link?: string | null;
	};
</script>

<script lang="ts">
	import Section from "$lib/components/Section.svelte";
	export let data: LayoutBlockListData;
	export let order: number;
</script>

<Section 
	list
	order={order}
	span_columns={data.span_columns}
	col_units={data.col_units}
	col_start={data.col_start}
	span_rows={data.span_rows}
>
	{#if data.section_heading}
		<h3 class="{data.col_units === 'half' ? 'xxxl' : 'md'}">{data.section_heading}</h3>
	{/if}

	<ul class="{data.col_units === 'half' ? 'tracklist' : ''}"
		style:--num-columns={data.num_columns}
	>
		{#each data.items as item}
			<li>
				{#if item.link}
					<a href={item.link}>{item.text}</a>
				{:else}
					{item.text}
				{/if}
			</li>
		{/each}
	</ul>

	{#if data.view_more_link}
		<a href={data.view_more_link} class="view-all">View all</a>
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

	a.view-all {
		margin-top: 1em;
	}
</style>