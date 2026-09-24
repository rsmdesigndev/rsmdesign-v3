<script lang="ts">
	import { assetUrl } from "$lib/cms/assets";
	import Card, { type CardData } from "../../molecules/Card.svelte";
	import Heading from "../../atoms/Heading.svelte";

	export type dataFeedTickerTapeData = {
		feed_source?: string | null;
		feed_ticker_sizing?: string | null;
		feed_cards?: CardData[] | null;
	};

	export let data: dataFeedTickerTapeData;
	export let feedData: any[] | null;
	export let itemParams: string = "";

	const sizingGridColumns: { [sizing: string]: string } = {
		eighth: "eighth-start 1 / eighth-end 1",
		sixth: "sixth-start 1 / sixth-end 1",
		fourth: "eighth-start 1 / eighth-end 2"
	};

	$: gridColumn = sizingGridColumns[data.feed_ticker_sizing ?? "logo"];
	$: usesGridSizing = Boolean(gridColumn);

	let columnWidth: number = 0;

	$: items = (data.feed_source === "Manual" ? data.feed_cards : feedData) ?? [];

	$: copyCount = items.length ? Math.ceil(24 / items.length) + 1 : 0; // fills a viewport up to 24 items wide, plus the copy scrolling in

	let isPaused: boolean = false;
	let isHovered: boolean = false;
	let hasFocus: boolean = false;

	$: isAdvancing = !isPaused && !isHovered && !hasFocus;

	const togglePlayback = () => isPaused = !isPaused;
	const suspendOnHover = () => isHovered = true;
	const resumeOnLeave = () => isHovered = false;
	const suspendOnFocus = () => hasFocus = true;
	const resumeOnBlur = () => hasFocus = false;

	const itemHeading = {
		heading_type: "feed-item",
		heading_primary: "large",
		heading_size: "lg",
		heading_weight: "regular",
		heading_has_small_text: true,
		heading_has_large_text: true,
		heading_has_superscript: false
	}

	$: itemImage = (item: any) =>
		data.feed_source === "Manual" ? item.card_atoms?.find((atom: any) => atom?.item?.__typename === "page_blocks_v3_atom_media")?.item?.media_image
		: data.feed_source === "Team" ? item.headshot
		: item.grid_image;

	$: itemLink = (item: any): string | undefined =>
		data.feed_source === "Projects" ? `/work/${item.slug}${itemParams}`
		: data.feed_source === "Articles" ? `/news/${item.slug}${itemParams}`
		: data.feed_source === "Team" && item.has_profile_page ? `/team/${item.slug}${itemParams}`
		: undefined;

	function removeCopiesFromTabOrder(track: HTMLElement, tickerItems: any[]) {
		const removeFromTabOrder = () => track
			.querySelectorAll(":scope > :not(:first-child) :is(a[href], button, iframe, [tabindex])")
			.forEach(element => element.setAttribute("tabindex", "-1"));

		removeFromTabOrder();
		return {
			update: removeFromTabOrder
		};
	}
</script>

<template>
	<div class="ticker-wrapper">
		{#if items.length}
			<button class="playback"
					class:paused={!isAdvancing}
					type="button"
					aria-label={isPaused ? "Start automatic scrolling" : "Stop automatic scrolling"}
					on:click={togglePlayback}
			/>
		{/if}
		<div class="ticker"
			 class:logos={!usesGridSizing}
			 style:--column-width={columnWidth}
		>
			{#if usesGridSizing}
				<div class="column-measure" aria-hidden="true">
					<div style:--grid-column={gridColumn} bind:offsetWidth={columnWidth} />
				</div>
			{/if}
			<div class="ticker-tape"
				 class:paused={!isAdvancing}
				 style:--item-count={items.length}
				 style:--copy-count={copyCount}
				 use:removeCopiesFromTabOrder={items}
				 on:mouseenter={suspendOnHover}
				 on:mouseleave={resumeOnLeave}
				 on:focusin={suspendOnFocus}
				 on:focusout={resumeOnBlur}
			>
				{#each Array(copyCount) as _, copyIndex}
					<div class="ticker-copy" aria-hidden={copyIndex > 0 ? "true" : undefined}>
						{#each items as item}
							{@const image = itemImage(item)}
							{@const link = itemLink(item)}
							{@const logoRatio = !usesGridSizing && image?.width && image?.height ? image.width / image.height : undefined}
							{#if data.feed_source === "Manual"}
								<div class="ticker-item"
									 class:sized-by-area={Boolean(logoRatio)}
									 style:--logo-ratio={logoRatio}
								>
									<Card data={item}
										  bleed={ { left: false,
													right: false
												} }
										  isScrollItem={false}
										  isActive={true}
									/>
								</div>
							{:else}
								<svelte:element
									this={link ? "a" : "div"}
									href={link}
									class="ticker-item"
									class:sized-by-area={Boolean(logoRatio)}
									style:--logo-ratio={logoRatio}
								>
									{#if usesGridSizing}
										<figure>
											<picture>
												<img src={assetUrl(image?.filename_disk)}
													 alt={image?.title}
												/>
											</picture>
											<figcaption>
												{#if data.feed_source === "Projects"}
													<Heading
														data={ {...itemHeading,
																heading_small: item.location,
																heading_large: item.project_title
															 } }
													/>
												{:else if data.feed_source === "Articles"}
													<Heading
														data={ {...itemHeading,
																heading_small: item.topics?.[0]?.news_topics_id?.name,
																heading_large: item.post_title
															 } }
													/>
												{:else if data.feed_source === "Team"}
													<Heading
														data={ {...itemHeading,
																heading_small: item.short_title,
																heading_large: item.name
															 } }
													/>
												{/if}
											</figcaption>
										</figure>
									{:else}
										<img src={assetUrl(image?.filename_disk)}
											 alt={image?.title}
										/>
									{/if}
								</svelte:element>
							{/if}
						{/each}
					</div>
				{/each}
			</div>
		</div>
	</div>
</template>

<style lang="scss">
	.ticker-wrapper {
		grid-column: viewport;
		display: grid;
		grid-template-columns: subgrid;
	}

	.playback {
		grid-row: 1;
		grid-column: main;
		justify-self: end;
		align-self: start;

		margin-top: calc(-1 * var(--SPACE-LG));

		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.2em;
		width: 1em;
		height: 1em;
		padding: 0;
		border: none;
		box-shadow: none;
		background: transparent;
		font-size: var(--FONT-SIZE-LG);
		line-height: 1;
		cursor: pointer;

		&::before,
		&::after {
			content: "";
			display: block;
			width: 2.5px;
			height: 0.5em;
			background: var(--color-secondary);
		}

		&.paused {
			gap: 0;

			&::before {
				width: 0;
				height: 0;
				background: none;
				border-top: 0.3em solid transparent;
				border-bottom: 0.3em solid transparent;
				border-left: 0.5em solid var(--color-secondary);
			}
			&::after {
				display: none;
			}
		}

		@media (prefers-reduced-motion: reduce) {
			display: none;
		}
	}

	.ticker {
		grid-row: 1;
		grid-column: viewport;
		position: relative;
		overflow-x: clip;

		> .column-measure {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 0;
			display: grid;
			grid-template-columns: var(--GRID-WRAPPER);
			visibility: hidden;

			> div {
				grid-column: var(--grid-column);

				@media (max-width: 62.5em) {
					grid-column: third-start 1 / third-end 1;
				}
			}
		}

		> .ticker-tape {
			display: flex;
			width: max-content;
			// no fill mode, so reduced motion leaves the first copy in view
			animation: ticker-tape-animate calc(var(--item-count) * 5.5s) linear infinite; // about 11 items a minute

			&.paused {
				animation-play-state: paused;
			}

			> .ticker-copy {
				display: flex;
				align-items: start;
				column-gap: var(--SPACE-MD);
				padding-right: var(--SPACE-MD);

				> .ticker-item {
					display: grid;
					width: calc(var(--column-width) * 1px);
				}
			}
		}

		figure {
			margin: 0;

			> picture {
				display: block;
				aspect-ratio: 1 / 1;
				margin-bottom: var(--SPACE-SM);
				overflow: hidden;
				background-color: var(--COLOR-BG-LIGHT);

				> img {
					display: block;
					width: 100%;
					height: 100%;
					object-fit: cover;
				}
			}
		}

		&.logos > .ticker-tape > .ticker-copy {
			align-items: center;
			column-gap: var(--SPACE-XL);
			padding-right: var(--SPACE-XL);

			> .ticker-item {
				width: auto;
			}

			:global {
				img {
					display: block;
					width: auto;
					height: var(--SPACE-LG);
					max-width: var(--SPACE-XXL);
					object-fit: contain;
				}
			}

			// each logo covers the area of a --SPACE-XL square, within the height limits
			> .sized-by-area {
				:global {
					img {
						height: clamp(var(--SPACE-MD), calc(var(--SPACE-XL) / sqrt(var(--logo-ratio))), var(--SPACE-XL));
						aspect-ratio: var(--logo-ratio);
						max-width: none;
					}
				}
			}
		}
	}

	@keyframes ticker-tape-animate {
		0% {
			transform: translate(0rem, 0rem);
		}
		100% {
			transform: translate(calc(-100% / var(--copy-count)), 0rem);
		}
	}
</style>