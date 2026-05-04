<script lang="ts">
	// Layout blocks
	export let header = false;
	export let images = false;
	export let video = false;
	export let list = false;
	//export let cta = false;
	export let projectsGrid = false;
	export let teamGrid = false;
	export let featuredPage = false;
	export let featuredPageVideo = false;
	export let carousel = false;

	// Page blocks
	export let heading = false;
	export let project = false;
	export let blockQuote = false;
	export let cta = false;
	export let imageRow = false;
	export let cards = false;
	export let richText = false;
	export let swiper = false;

	export let nextEntry = false;	

	// Layout fields
	export let grid: boolean = false;
	export let order: number;
	export let order_md: number | null;
	export let span_columns: number = 1;
	export let span_columns_md_override: number | null;
	export let col_units: string = "whole";
	export let col_start: number = 1;
	export let padding_left: string = "none";
	export let padding_right: string = "none";
	export let span_rows: number = 1;
	export let row_alignment: string = "";
	export let padding_top: string = "default";
	export let padding_top_override: boolean = false;
	export let anchor_id: string = "";

	let fullBleedRight = false;

	if (
		(col_units === "whole" && col_start + span_columns === 3) ||
		(col_units === "half" && col_start + span_columns === 4) ||
		(col_units === "third" && col_start + span_columns === 5) ||
		(col_units === "quarter" && col_start + span_columns === 6) ||
		(col_units === "sixth" && col_start + span_columns === 8) ||
		(col_units === "eighth" && col_start + span_columns === 10) ||
		(col_units === "ninth" && col_start + span_columns === 11) ||
		(col_units === "twelfth" && col_start + span_columns === 14)
	) {
		fullBleedRight = true;
	}

	let col_unit_number = 1;

	if (col_units === "half") {
		col_unit_number = 2;
	} else if (col_units === "third") {
		col_unit_number = 3;
	} else if (col_units === "quarter") {
		col_unit_number = 4;
	} else if (col_units === "sixth") {
		col_unit_number = 6;
	} else if (col_units === "eighth") {
		col_unit_number = 8;
	} else if (col_units === "ninth") {
		col_unit_number = 9;
	} else if (col_units === "twelfth") {
		col_unit_number = 12;
	}

	let order_lg;

	if (order != 0) {
		if (col_start > 1 && span_rows > 1) {
			order_lg = order - (1 + (span_rows - 1) * 2);
		} else {
			order_lg = order;
		}
	}

	let span_columns_md;

	if (span_columns_md_override) {
		span_columns_md = span_columns_md_override;
	} else if (span_columns / col_unit_number >= 0.5) {
		span_columns_md = 2;
	} else {
		span_columns_md = 1;
	}
</script>

<template>
	<section 
		class:project
		class:header
		class:heading
		class:images
		class:video
		class:list
		class:projectsGrid
		class:teamGrid
		class:featuredPage
		class:featuredPageVideo
		class:blockQuote
		class:cta
		class:imageRow
		class:cards
		class:carousel
		class:richText
		class:nextEntry
		class:grid
		class:swiper

		class="{col_units === 'full' ? 'full-bleed' : ''}
			   {col_start === 0 ? 'full-bleed-left' : ''}
			   {fullBleedRight ? 'full-bleed-right' : ''}
			   padding-left-{padding_left}
			   padding-right-{padding_right}
			   padding-top-{padding_top}
			   {padding_top_override ? 'padding-top-override' : ''}
			   {row_alignment === 'bottom' ? 'flex-justify-end' : ''}"

		style:--grid-column={`${col_units}-start ${col_start} / span ${span_columns} ${col_units}-end`}
		style:--span-columns-md={span_columns_md}
		style:--span-rows={span_rows}
		style:--order={order}
		style:--order-lg={order_lg}
		style:--order-md={order_md}

		id={anchor_id}
	>
		<slot />
	</section>
</template>

<style lang="scss">
	section {
		/* OLD VALUES FROM V2 SYSTEM */
		--SPACE-SM: calc(var(--GRID-CELL) / 4);
		--SPACE-MD: calc(var(--GRID-CELL) / 2);
		--SPACE-LG: var(--GRID-CELL);
		--SPACE-XL: calc(var(--GRID-CELL) * 2);
		--SPACE-XXL: calc(var(--GRID-CELL) * 4);
		--SPACE-XXXL: calc(var(--GRID-CELL) * 6);
		
		box-sizing: border-box;
		position: relative;
		grid-column: var(--grid-column);
		grid-row: span var(--span-rows);
		margin: calc(var(--GRID-CELL) / 2) var(--margin-right, 0) 0 var(--margin-left, 0);
		order: var(--order-lg);

		@media (max-width: 62.5em) {
			&:not(.project) {
				grid-column: span var(--span-columns-md);
				grid-row: span 1;
				order: var(--order-md, var(--order));
			}
		}
		@media (max-width: 31.25em) {
			grid-column: span 1;
			&:not(.project) {
				grid-column: span 1;
			}
		}

		display: flex;
		flex-direction: column;
		align-items: stretch;

		&.grid {
			display: grid;
		}

		&.full-bleed {
			--grid-column: whole;
			--margin-left: -5vw;
			--margin-right: -5vw;

			@media (max-width: 62.5em) {
				--margin-left: -2vw;
				--margin-right: -2vw;
			}
		}
		&.full-bleed-left {
			--margin-left: -5vw;
			@media (max-width: 62.5em) {
				--margin-left: -2vw;
			}
		}
		&.full-bleed-right {
			--margin-right: -5vw;
			@media (max-width: 62.5em) {
				--margin-right: -2vw;
			}
		}

		padding: 0;
		width: 100%;

		&.padding-top-none {
			padding-top: 0;
		}
		&.padding-left-sm {
			padding-left: var(--SPACE-SM);
			@media (max-width: 62.5em) {
				padding-left: 0;
			}
		}
		&.padding-right-sm {
			padding-right: var(--SPACE-SM);
			@media (max-width: 62.5em) {
				padding-right: 0;
			}
		}
		&.padding-top-sm {
			padding-top: var(--SPACE-SM);
			@media (max-width: 62.5em) {
				padding-: 0;
			}
		}
		&.padding-left-md {
			padding-left: var(--SPACE-MD);
			@media (max-width: 62.5em) {
				padding-left: 0;
			}
		}
		&.padding-right-md {
			padding-right: var(--SPACE-MD);
			@media (max-width: 62.5em) {
				padding-right: 0;
			}
		}
		&.padding-top-md {
			padding-top: var(--SPACE-MD);
		}
		&.padding-left-lg {
			padding-left: var(--SPACE-LG);
			@media (max-width: 62.5em) {
				padding-left: 0;
			}
		}
		&.padding-right-lg {
			padding-right: var(--SPACE-LG);
			@media (max-width: 62.5em) {
				padding-right: 0;
			}
		}
		&.padding-top-lg {
			padding-top: var(--SPACE-LG);
		}
		&.padding-left-xl {
			padding-left: var(--SPACE-XL);
			@media (max-width: 62.5em) {
				padding-left: 0;
			}
		}
		&.padding-right-xl {
			padding-right: var(--SPACE-XL);
			@media (max-width: 62.5em) {
				padding-right: 0;
			}
		}
		&.padding-top-xl {
			padding-top: var(--SPACE-XL);
		}
		&.padding-top-xxl {
			padding-top: var(--SPACE-XXL);
		}
		&.padding-top-xxxl {
			padding-top: var(--SPACE-XXXL);
		}
		&.padding-top-override {
			@media (max-width: 62.5em) {
				padding-top: 0;
			}
		}

		+ section {
			margin-top: calc(var(--GRID-CELL) / 2);
		}

		&.nextEntry {
			margin-top: calc(var(--GRID-CELL) * 3);
		}

		/*
		&.featuredPage {
			//height: 60vh;
			min-height: 40vw;
			@media (min-height: 75vw) {
				min-height: 60vh;
			}
		}
		*/

		&.featuredPageVideo {
			min-height: unset;
			@media (min-height: 75vw) {
				min-height: unset;
			}
		}

		&.imageRow {
			&.padding-top-default {
				height: calc(100% - var(--SPACE-MD));
			}
			&.padding-top-sm {
				height: calc(100% - var(--SPACE-SM));
			}
			&.padding-top-md {
				height: calc(100% - var(--SPACE-MD));
			}
			&.padding-top-lg {
				height: calc(100% - var(--SPACE-LG));
			}
			&.padding-top-xl {
				height: calc(100% - var(--SPACE-XL));
			}
			&.padding-top-xxl {
				height: calc(100% - var(--SPACE-XXL));
			}
			&.padding-top-xxxl {
				height: calc(100% - var(--SPACE-XXXL));
			}
		}

		&.carousel {
			align-self: start;
		}
	}
</style>