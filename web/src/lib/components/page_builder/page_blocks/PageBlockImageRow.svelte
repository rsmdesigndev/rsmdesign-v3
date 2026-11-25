<script lang="ts" context="module">
	import type { ImageAssetRelation } from "$lib/cms";

	export type PageBlockImageRowData = {
		caption?: string | null;
		layout?: string | null;
		images?: ImageAssetRelation[] | null;
		emptyColumn?: string | null;
		fullBleedColumns?: string | null;
	};

	type ImageOrEmptyColumn = {
		isEmpty?: boolean;
		image?: ImageAssetRelation;
	};
</script>

<script lang="ts">
	import { onMount } from "svelte";
	import { assetUrl } from "$lib/cms/assets";
	import Section from "$lib/components/Section.svelte";
	import { animate, fadeScroll, fadeMoveScroll } from "$lib/animate";
	export let order: number;
	export let project: boolean = false;

	export let data: PageBlockImageRowData;

	function processColumns(images?: ImageAssetRelation[] | null): ImageOrEmptyColumn[] {
		if (!images || images.length === 0) {
			return [];
		}

		if (data.emptyColumn === "none") {
			return images.map(image => ({ image }));
		}

		if (data.layout === "fullWidth") {
			return [{ image: images[0] }];
		}

		if (data.layout === "halfToHalf" || data.layout === "oneToTwo" || data.layout === "twoToOne") {
			if (data.emptyColumn === "left") {
				return [
					{ isEmpty: true },
					{ image: images[0] },
				];
			} else if (data.emptyColumn === "right") {
				return [
					{ image: images[0] },
					{ isEmpty: true },
				]
			}
		}

		if (data.layout === "thirds") {
			if (data.emptyColumn === "left") {
				return [
					{ isEmpty: true },
					{ image: images[0] },
					{ image: images[1] },
				];
			} else if (data.emptyColumn === "center") {
				return [
					{ image: images[0] },
					{ isEmpty: true },
					{ image: images[1] },
				];
			} else if (data.emptyColumn === "right") {
				return [
					{ image: images[0] },
					{ image: images[1] },
					{ isEmpty: true },
				];
			}
		}

		return images.map(image => ({ image }));
	}

	onMount(() => {
		
	});
</script>

<Section 
	project={project}
	imageRow
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
	{#if data.images}
		<figure 
			class="{data.layout === 'fullWidth'  ? 'full-width'
				  : data.layout === 'halfToHalf' ? 'half-to-half'
				  : data.layout === 'oneToTwo'   ? 'one-to-two'
				  : data.layout === 'twoToOne'   ? 'two-to-one'
				  : data.layout === 'thirds' 	 ? 'thirds'
				  : 'full-width'}"
		>
			{#each processColumns(data.images) as column, i}
				{#if column.isEmpty}
					<!-- Column marked as empty -->
					<div />
				{:else}
					<img 
						src={assetUrl(column.image?.directus_files_id?.filename_disk)}
						alt={column.image?.directus_files_id?.description}
						use:animate={fadeScroll}
					/>
				{/if}
			{/each}
			{#if data.caption}
				<figcaption use:animate={fadeMoveScroll}>
					{@html data.caption}
				</figcaption>
			{/if}
		</figure>
	{/if}
</Section>

<style lang="scss">
	figure {
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr auto;
		column-gap: calc(var(--GRID-CELL) / 2);

		&.full-width {
			display: block;
		}
		&.half-to-half {
			grid-template-columns: 1fr 1fr;
		}
		&.one-to-two {
			grid-template-columns: 1fr 2fr;
		}
		&.two-to-one {
			grid-template-columns: 2fr 1fr;
		}
		&.thirds {
			grid-template-columns: 1fr 1fr 1fr;

			figcaption {
				grid-column: 1 / span 3;
			}
		}

		img {
			width: 100%;
			height: auto;
			object-fit: cover;
		}

		figcaption {
			margin-top: 0.5em;
			font-size: var(--FONT-SIZE-SM);
			color: var(--COLOR-DIM-GRAY);
			text-align: right;
		}

		&.half-to-half > figcaption,
		&.one-to-two > figcaption,
		&.two-to-one > figcaption {
			grid-column: 1 / span 2;
		}
	}

	:global {
		section.imageRow {
			height: 100%;

			> figure {
				position: sticky;
				top: calc(var(--HEADER-HEIGHT) + var(--GRID-CELL));
			}
		}
	}
</style>
