<script lang="ts">
	import type { PageData } from "./$types";
	import { assetUrl } from "$lib/cms/assets";
	import SeoHead from "$lib/components/SeoHead.svelte";
	import PageBlocksV3, { type ProjectData } from "$lib/components/page_builder/page_blocks_v3/index.svelte";
	import Section from "$lib/components/Section.svelte";
	import DottedArrow from "$lib/components/DottedArrow.svelte";
	import DottedArrowHover from "$lib/components/DottedArrowHover.svelte";

	export let data: PageData;
</script>

<SeoHead
	title="Our Markets & Services"
	description="We provide branding, wayfinding, placemaking, environmental graphic design, and more in retail, civic, mixed-use, and residential spaces."
/>

<template>
	{#if data.expertise_page.expertise_use_page_blocks_v3}
		{#if data.expertise_page.expertise_page_blocks_v3}
			<PageBlocksV3 blocks={data.expertise_page.expertise_page_blocks_v3} />
		{:else}
			<div class="container">Page Blocks v3 selected, but no blocks added.</div>
		{/if}
	{:else}
		<div class="container">
			<Section
				header
				order=2
				span_columns=1
				col_units="whole"
				col_start=1
				span_rows=1
				anchor_id="services"
			>
				<h1 class="md gray">Expertise</h1>
				<h2 class="xxxl">Services.</h2>
			</Section>
			<section class="services-section grid-col-3" style="order: 4;">
				{#each data.services as service}
					<a href="/services/{service.slug}">
						<h3 class="xxl">{service.medium_name ?? service.slug}</h3>
						<ul>
							{#each service?.sub_services_truncated ?? [] as sub_service}
								<li>{sub_service.name}</li>
							{/each}
						</ul>
						<p class="arrow">·&hairsp;·&hairsp;·&hairsp;›</p>
					</a>
				{/each}
			</section>

			<Section
				header
				order=6
				span_columns=1
				col_units="whole"
				col_start=1
				span_rows=1
				anchor_id="markets"
			>
				<h2 class="xxxl">Markets.</h2>
			</Section>
			<section class="markets-section grid-col-3" style="order: 8;">
				{#each data.markets as market}
					<a href="/markets/{market.slug}">
						<figure>
							<img 
								src={assetUrl(market.grid_image?.filename_disk)} 
								alt={market.grid_image?.description}
							/>
							<figcaption>
								<h3>{market.medium_name ?? market.slug}</h3>
								<p class="arrow"><span>·&hairsp;·&hairsp;·&hairsp;</span>›</p>
							</figcaption>
						</figure>
					</a>
				{/each}
			</section>
			<Section
				cta
				order=12
				span_columns=1
				col_units="whole"
				col_start=1
				span_rows=1
			>
				<DottedArrowHover
					href="/work"
				>
					<h4 class="xxxl">Latest projects.</h4>
					<p>View Our Work <DottedArrow /></p>
				</DottedArrowHover>
			</Section>
		</div>
	{/if}
</template>

<style lang="scss">
	.container {
		margin-top: calc(var(--HEADER-HEIGHT) + var(--GRID-CELL));
		
		@media (max-width: 31.25em) {
			margin-top: var(--HEADER-HEIGHT);
		}
	}

	section.services-section {
		grid-column: whole;
		margin-top: calc(var(--GRID-CELL) * 3);

		@media (max-width: 31.25em) {
			margin-top: calc(var(--GRID-CELL) * 1.5);
		}

		a {
			position: relative;
			display: grid;
			grid-template-columns: 1fr;
			grid-template-rows: 1fr;
			justify-self: start;
			height: calc(10em + 10vw);

			@media (max-width: 31.25em) {
				justify-self: stretch;
				height: auto;
				min-height: calc(var(--GRID-CELL) * 1.75);
				border-bottom: 2px solid var(--COLOR-MID-GRAY);
				padding-bottom: calc(var(--GRID-CELL) / 2);

				&:not(:last-of-type) {
					margin-bottom: var(--GRID-CELL);
				}

				&::after {
					content: "›";
					position: absolute;
					right: 0;
					bottom: calc(var(--GRID-CELL) / 2);
					font-size: calc(var(--FONT-SIZE-XXL) * 2);
					line-height: 0.667;
					font-weight: 300;
					color: var(--COLOR-ORANGE);
				}
			}

			> h3 {
				grid-row: 1;
				grid-column: 1;
				max-width: 12ch;
				@media (max-width: 31.25em) {
					align-self: end;
				}
			}
			> ul {
				grid-row: 1;
				grid-column: 1;
				align-self: start;
				
				margin-top: calc(3em + 2vw);
				opacity: 0;
				transition: margin-top 0.4s ease, opacity 0.4s ease;

				@media (max-width: 31.25em) {
					display: none;
				}
			}
			> p.arrow {
				grid-row: 1;
				grid-column: 1;
				align-self: end;
				justify-self: end;
				font-weight: 300;
				font-size: var(--FONT-SIZE-XL);
				color: var(--COLOR-ORANGE);
				margin-right: calc(2em + 1vw);
				opacity: 0;
				transition: margin-right 0.4s ease, opacity 0.4s ease;

				@media (max-width: 31.25em) {
					display: none;
				}
			}

			&:hover {
				color: inherit;
				> ul {
					margin-top: calc(4em + 4vw);
					opacity: 1;
				}
				> p.arrow {
					margin-right: 0;
					opacity: 1;
				}
			}
		}
	}

	section.markets-section {
		grid-column: whole;
		margin: var(--GRID-CELL) 0 calc(var(--GRID-CELL) * 3);

		> a {
			color: inherit;

			> figure {
				display: grid;
				grid-template-columns: 1fr;
				grid-template-rows: 1fr;
				margin: 0;
				padding: 0;

				> img {
					grid-row: 1;
					grid-column: 1;
					width: 100%;
					height: auto;
					aspect-ratio: 1 / 1;
				}

				> figcaption {
					grid-row: 1;
					grid-column: 1;
					width: 100%;
					height: 100%;
					display: flex;
					flex-direction: column;
					align-items: flex-end;
					justify-content: flex-end;
					transition: background-color 0.3s ease;

					@media (max-width: 46.875em) {
						align-self: end;
						justify-self: end;
						width: auto;
						height: auto;
						flex-direction: row;
					}

					> h3 {
						font-size: var(--FONT-SIZE-LG);
						margin-bottom: calc(-1 * var(--FONT-SIZE-LG));
						margin-right: calc(var(--GRID-CELL));
						color: white;
						transition: margin-right 0.3s ease, color 0.3s ease;

						@media (max-width: 46.875em) {
							margin-bottom: calc(var(--GRID-CELL) / 2);
							margin-right: 0.5em;
						}
					}

					> p.arrow {
						font-weight: 300;
						font-size: var(--FONT-SIZE-XL);
						line-height: 1;
						color: var(--COLOR-ORANGE);
						margin-bottom: 0.5em;
						margin-right: calc(var(--GRID-CELL) + 1.25em + 1vw);
						opacity: 0;
						transition: margin-right 0.3s ease, opacity 0.3s ease;

						@media (max-width: 46.875em) {
							opacity: 1;
							margin-right: calc(var(--GRID-CELL) / 2);
							font-size: var(--FONT-SIZE-XXXL);
							margin-bottom: calc(var(--FONT-SIZE-LG) / 1.618);

							> span {
								display: none;
							}
						}
					}
				}
			}

			&:hover > figure > figcaption {
				background-color: rgba(255,255,255,0.618);

				@media (max-width: 46.875em) {
					background-color: transparent;
				}

				> h3 {
					margin-right: calc(var(--GRID-CELL) + 1.25em + 1vw);
					color: var(--COLOR-BLACK);

					@media (max-width: 46.875em) {
						margin-right: 0.5em;
						color: white;
					}
				}

				> p.arrow {
					margin-right: calc(var(--GRID-CELL));
					opacity: 1;

					@media (max-width: 46.875em) {
						margin-right: calc(var(--GRID-CELL) / 2);
					}
				}
			}
		}
	}
</style>
