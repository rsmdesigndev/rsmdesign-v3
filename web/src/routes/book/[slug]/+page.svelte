<script lang="ts">
	import type { PageData } from "./$types";
	import { assetUrl } from "$lib/cms/assets";
	import PageBlocks from "$lib/components/page_builder/page_blocks/index.svelte";
	import NextEntry, { EntryType } from "$lib/components/NextEntry.svelte";
	import SeoHead from "$lib/components/SeoHead.svelte";
	import Section from "$lib/components/Section.svelte";
	import DottedArrow from "$lib/components/DottedArrow.svelte";
	import DottedArrowHover from "$lib/components/DottedArrowHover.svelte";
	// import BookForm from "$lib/components/BookForm.svelte";
	import KlaviyoBookForm from "$lib/components/KlaviyoBookForm.svelte";

	export let data: PageData;
</script>

<SeoHead
	title={data.book.title ?? ""}
	description={data.book.seo_page_description ?? undefined}
	noindex={data.book.visibility === "draft"}
/>

<template>
	<figure class="hero">
		<img
			src={assetUrl(data.book.hero_image?.filename_disk)}
			alt={data.book.hero_image?.description}
			class={data.book.hero_image_crop_attachment === "left"
				? "position-left"
				: data.book.hero_image_crop_attachment === "center_left"
				? "position-center-left"
				: data.book.hero_image_crop_attachment === "center"
				? ""
				: data.book.hero_image_crop_attachment === "center_right"
				? "position-center-right"
				: data.book.hero_image_crop_attachment === "right"
				? "position-right"
				: ""}
		/>
	</figure>
	<div class="container">
		<article>
			{#if data.book.tag}
				<h2 class="caps">{data.book.tag}</h2>
			{/if}
			{#if data.book.title}
				<h1 class="xxxl">{data.book.title}</h1>
			{/if}
			<div>{@html data.book.book_description}</div>
			<div class="lists grid-col-3">
				<div>
					<h3 class="md">Authors</h3>
					<p>{data.book?.authors}</p>
				</div>
				<div>
					<h3 class="md">Details</h3>
					<ul>
						{#if data.book.format}
							<li>{data.book.format}</li>
						{/if}
						{#if data.book.page_count}
							<li>{data.book.page_count} Pages</li>
						{/if}
						{#if data.book.weight}
							<li>{data.book.weight} Pounds</li>
						{/if}
					</ul>
				</div>
				<div>
					<h3 class="md">Purchase</h3>
					{#if data.book.visual_profile_books_link}
						<DottedArrowHover
							href={data.book?.visual_profile_books_link}
						>
							<p class="font-weight-400">Visual Profile Books <DottedArrow /></p>
						</DottedArrowHover>
					{/if}
					{#if data.book.amazon_link}
						<DottedArrowHover
							href={data.book?.amazon_link}
						>
							<p class="font-weight-400">Amazon <DottedArrow /></p>
						</DottedArrowHover>
					{/if}
				</div>
			</div>
		</article>
	</div>
	{#if data.book.page_content}
		<PageBlocks content={data.book.page_content} />
	{/if}
	<div class="container">
		<section class="form-section">
			<h2 class="lg">Download a PDF preview of the book</h2>
			<!-- <BookForm /> -->
			<KlaviyoBookForm />
		</section>
		<section class="cta-section" >
			<p class="caps margin-bottom-half-em">Purchase book</p>
			{#if data.book.amazon_link}
				<DottedArrowHover href={data.book.amazon_link}>
					{#if data.book.title}
						<h4 class="xxxl heading">{data.book.title}</h4>
					{/if}
					<p>Buy Now <DottedArrow /></p>
				</DottedArrowHover>
			{/if}
		</section>
	</div>
</template>

<style lang="scss">
	.container {
		grid-template-columns: var(--GRID-CONTAINER-PROJECTS);
		@media (max-width: 62.5em) {
			column-gap: 0;
		}
	}
	figure.hero {
		margin: 0 0 calc(var(--GRID-CELL) * 6);
		padding: 0;
		z-index: 5;
		grid-column: viewport;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		@media (max-width: 62.5em) {
			height: 133.333vw;
			max-height: 100vh;

			@media (max-height: 133.333vw) {
				height: 100vh;
			}
		}

		display: flex;
		align-items: center;
		justify-content: center;

		> div.hero-video {
			z-index: 5;
			position: relative;
			flex: 0 0 calc(100vh * 16 / 9);
			height: 0;
			padding-bottom: 100vh;

			@media (min-width: 177.777vh) {
				flex-basis: 100vw;
				padding-bottom: calc(100vw * 9 / 16);
			}

			@media (max-width: 62.5em) {
				flex-basis: calc(133.333vw * 16 / 9);
				padding-bottom: 133.333vw;

				@media (max-height: 133.333vw) {
					flex-basis: calc(100vh * 16 / 9);
					padding-bottom: 100vh;
				}

				@media (max-height: 56.25vw) {
					flex-basis: 100vw;
					padding-bottom: calc(100vw * 9 / 16);
				}
			}

			> iframe {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
			}
		}

		> img {
			width: 100%;
			height: 100%;
			object-fit: cover;
			&.position-left {
				object-position: 0% 50%;
			}
			&.position-center-left {
				object-position: 20% 50%;
			}
			&.position-center-right {
				object-position: 80% 50%;
			}
			&.position-right {
				object-position: 100% 50%;
			}
		}
	}

	article {
		grid-column: ninth-start 3 / span 5 ninth-end;
		margin: 0 0 calc(var(--GRID-CELL) * 6);

		@media (max-width: 93.75em) {
			grid-column: sixth-start 2 / span 4 sixth-end;
		}
		@media (max-width: 31.25em) {
			grid-column: span 1;
			width: 80%;
			padding-right: 20%;
			margin-bottom: calc(var(--GRID-CELL) * 3);
		}

		display: flex;
		flex-direction: column;

		h1 {
			margin-bottom: 0.333em;
		}
		h2 {
			font-size: var(--FONT-SIZE-MD);
			font-weight: 400;
			margin-bottom: 0.5em;
		}

		.lists {
			margin-top: var(--GRID-CELL);

			@media (max-width: 31.25em) {
				margin-top: calc(var(--GRID-CELL) * 3);
			}

			> div {
				margin-top: calc(var(--GRID-CELL) / 2);
				padding-right: var(--GRID-CELL);
			}

			> div > ul + h3 {
				margin-top: var(--GRID-CELL);
			}

			> div > ul > li {
				line-height: 1.167;
				margin-bottom: 0.333em;
			}
		}
	}

	section.form-section {
		grid-column: whole;
		margin: var(--GRID-CELL) 0 calc(var(--GRID-CELL) * 3);

		h2 {
			margin-bottom: var(--GRID-CELL);
		}
	}

	section.cta-section {
		grid-column: whole;
	}
</style>
