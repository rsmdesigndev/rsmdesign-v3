<script lang="ts" context="module">
	import type { LayoutFields } from "./index.svelte";

	export type PageBlockHeadingData = LayoutFields & {
		row_alignment?: string | null;
		type?: string | null;
		primary_heading?: string | null;
		small_heading?: string | null;
		large_heading?: string | null;
		superscript_text?: string | null;
	};
</script>

<script lang="ts">
	import { onMount } from "svelte";
	import Section from "$lib/components/Section.svelte";
	import { animate, fadeMoveScroll, slideLeft, mainHeading } from "$lib/animate";
    export let data: PageBlockHeadingData;
    export let order: number;
    export let project: boolean = false;

	let heading: HTMLElement;
	let headingHeight: number;

	onMount(()=> {
		if (heading) {
			headingHeight = heading.offsetHeight;
		} else {
			headingHeight = 650;
		}
	});
</script>

<Section 
	project={project}
	heading
	order={order}
	span_columns={data.span_columns ?? 1}
	col_units={data.col_units ?? "whole"}
	col_start={data.col_start ?? 1}
    padding_left={data.padding_left ?? "none"}
    padding_right={data.padding_right ?? "none"}
	span_rows={data.span_rows ?? 1}
	padding_top={data.padding_top ?? "default"}
	anchor_id={data.anchor_id ?? ""}
	row_alignment={data.row_alignment ?? "bottom"}
>
	{#if data.type === "page"}
		{#if data.primary_heading === "large"}
			{#if data.small_heading}
				<h2 class="md" use:animate={fadeMoveScroll}>
					{data.small_heading}
				</h2>
			{/if}
			{#if data.large_heading}
				<h1 class="xxxl" use:animate={fadeMoveScroll}>
					{data.large_heading}
					{#if data.superscript_text}
						<sup>({data.superscript_text})</sup>
					{/if}
				</h1>
			{/if}
		{:else}
			{#if data.small_heading}
				<h1 class="md" use:animate={slideLeft}>
					{data.small_heading}
				</h1>
			{/if}
			{#if data.large_heading}
				<h2 class="xxxl" use:animate={mainHeading} bind:this={heading} style={`--maxHeight:${headingHeight}px`}>
					{data.large_heading}
					{#if data.superscript_text}
						<sup>({data.superscript_text})</sup>
					{/if}
				</h2>
			{/if}
		{/if}
	{:else}
		{#if data.primary_heading === "large"}
			{#if data.small_heading}
				<h3 class="md" use:animate={fadeMoveScroll}>
					{data.small_heading}
				</h3>
			{/if}
			{#if data.large_heading}
				<h2 class="xxxl" use:animate={fadeMoveScroll}>
					{data.large_heading}
					{#if data.superscript_text}
						<sup>({data.superscript_text})</sup>
					{/if}
				</h2>
			{/if}
		{:else}
			{#if data.small_heading}
				<h2 class="md" use:animate={fadeMoveScroll}>
					{data.small_heading}
				</h2>
			{/if}
			{#if data.large_heading}
				<h3 class="xxxl" use:animate={fadeMoveScroll}>
					{data.large_heading}
					{#if data.superscript_text}
						<sup>(&hairsp;{data.superscript_text}&hairsp;)</sup>
					{/if}
				</h3>
			{/if}
		{/if}
	{/if}
</Section>

<style lang="scss">
	.xxxl {
		white-space: pre-line;
	}
	.md {
		color: var(--COLOR-DIM-GRAY);
	}
	sup {
		font-size: 50%;
		margin-left: -0.167em;
	}
</style>