<script lang="ts" context="module">
</script>

<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let summaryText: string = "Open";
	export let summaryTextOpen: string = summaryText;
	export let summaryIcon: string = "arrow_down";

	export let isOpen: boolean = false;

	export let isAccordionItem: boolean = false;
	export let headingSize: string = "md";

	let headingWeight: number = 700;

	switch (headingSize) {
		case "lg":
			headingWeight = 600;
			break;
		case "xl":
			headingWeight = 500;
			break;
	}

	let anchor: HTMLElement;
	let height: number;

	const dispatch = createEventDispatcher();

	function toggle() {
		isOpen = !isOpen;
		const anchorRect = anchor.getBoundingClientRect();

		// scroll back to anchor if expanded height pushes anchor out of viewport
		if (!isOpen && (anchorRect.bottom < 0 || anchorRect.top > window.innerHeight)) {
			window.scrollTo({
				top: anchor.offsetTop,
				behavior: 'smooth'
			})
		}

		dispatch("toggle", isOpen);
	}
</script>

<template>
	<details open 
			 aria-expanded={isOpen} 
			 bind:this={anchor}
			 class:isAccordionItem
			 class:open={isOpen}
			 style:--heading-size={`var(--FONT-SIZE-${headingSize.toUpperCase()})`}
			 style:--heading-weight={headingWeight}
	>
		<summary on:click|preventDefault={toggle}
				 class:open={isOpen}
		>
			{#if isOpen && summaryTextOpen}
				{summaryTextOpen}
			{:else}
				{summaryText}
			{/if}
			<span data-icon={summaryIcon}
				  class={`icon ${isOpen ? "open" : ""}`};
				  aria-hidden="true"
			/>
		</summary>

		<div class="details-body" 
			 class:open={isOpen}
			 style:--height={height}
			 style:--transition-speed={`${height / 1500}s`}
		>
			<div bind:offsetHeight={height}>
				<slot />
			</div>
		</div>
	</details>
</template>

<style lang="scss">
	details {
		display: flex;
		flex-direction: column;
		row-gap: var(--SPACE-MD);

		color: var(--color-details, var(--color-primary, inherit));
		transition: color 0.3s ease;

		&.isAccordionItem {
			padding-bottom: 0;
			transition: padding-bottom 0.3s ease;
			&:hover:not(.open) {
				padding-bottom: 0.25em;
			}

			border-bottom: 1px solid var(--color-secondary, var(--COLOR-MID-GRAY));
			
			> summary {
				justify-content: space-between;
				> span.icon {
					color: var(--color-secondary, var(--COLOR-MID-GRAY));
					transition: color 0.3s ease;
				}
				&.open > span.icon {
					color: var(--color-accent, var(--COLOR-ORANGE));
				}
			}
			&:hover > summary > span.icon {
				color: var(--color-accent, var(--COLOR-ORANGE));
			}
			
			> .details-body {
				&.open {
					padding-bottom: var(--SPACE-MD);
				}
				:global {
					p {
						font-size: inherit;
						color: var(--color-accordion, var(--color-primary, inherit));
						transition: color 0.3s ease;

						&:last-of-type {
							margin-bottom: 0;
						}

						strong {
							font-weight: 700;
						}
					}

					h3 {
						font-size: inherit;
						font-weight: 700;
						text-transform: uppercase;
						letter-spacing: 0.05em;
						color: var(--color-accordion, var(--color-primary, inherit));
						transition: color 0.3s ease;
						margin-bottom: 0.5em;
					}
					h4 {
						font-size: inherit;
						font-weight: 700;
						color: var(--color-accordion, var(--color-primary, inherit));
						transition: color 0.3s ease;
						margin-bottom: 1em;
					}
				}
			}
		}

		> summary {
			cursor: pointer;
			
			// hide the default arrow
			list-style: none;
			&::marker,
			&::-webkit-details-marker {
				display: none;
			}

			display: flex;
			flex-direction: row;
			align-items: center;

			font-size: var(--heading-size, var(--FONT-SIZE-MD));
			line-height: 1.333;
			font-weight: var(--heading-weight, 700);

			> span.icon {
				margin-left: calc(var(--GRID-CELL) / 3);
				align-self: stretch;
				display: inline-flex;
				align-content: center;
				max-height: 100%;

				&::after {
					display: inline;
					box-sizing: border-box;
					line-height: calc(var(--FONT-SIZE-MD) * 1.333);
				}

				&[data-icon="arrow_down"]::after {
					content: "›";
					width: calc(var(--FONT-SIZE-MD) * 1.333);
					height: var(--heading-size, var(--FONT-SIZE-LG));
					font-size: calc(var(--FONT-SIZE-MD) * sqrt(3));
					font-weight: 300;

					rotate: 90deg;
					transform: translate(0.3em, 0); // 0.3em is a magic number for this glyph
					transition: transform 0.2s ease-in-out;
				}
				&[data-icon="plus"]::after {
					content: "+";
					font-size: calc(var(--FONT-SIZE-MD) * 2);
					font-weight: 300;
				}
			}
			&.open {
				> span.icon[data-icon="arrow_down"]::after {
					transform: rotateY(180deg) translate(0.19em, 0); // 0.19em is a magic number for this glyph
				}
				> span.icon[data-icon="plus"]::after {
					content: "–";
					line-height: var(--FONT-SIZE-MD);
				}
			}
		}

		> .details-body {
			overflow: hidden;
			position: relative;
			height: 0;
			color: var(--color-details, var(--color-primary, inherit));
			transition: height 0.3s ease, color 0.3s ease;

			&::after {
				content: "";
				position: absolute;
				bottom: 0;
				width: 100%;
				height: var(--SPACE-XXL);
				background: linear-gradient(transparent, var(--color-background, white));
				transition: opacity 0.3s ease;
			}

			&.open {
				height: calc(var(--height) * 1px);
				transition: height var(--transition-speed) ease;

				&::after {
					opacity: 0;
					transition: opacity var(--transition-speed) ease;
				}
			}
		}
	}
</style>