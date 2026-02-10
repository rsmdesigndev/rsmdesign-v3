<script lang="ts" context="module">
</script>

<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let summaryText: string = "Open";
	export let summaryTextOpen: string = summaryText;
	export let summaryIcon: string = "arrow_down";
	export let defaultOpen = false;

	let isOpen: boolean = defaultOpen;
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

		<article class="rich-text" 
				 class:open={isOpen}
				 style:--height={height}
				 style:--transition-speed={`${height / 1500}s`}
		>
			<div bind:offsetHeight={height}>
				<slot />
			</div>
		</article>
	</details>
</template>

<style lang="scss">
	details {
		display: flex;
		flex-direction: column;
		row-gap: var(--SPACE-MD);

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

			font-size: var(--FONT-SIZE-MD);
			line-height: 1.333;
			font-weight: 700;

			> span.icon {
				margin-left: calc(var(--GRID-CELL) / 3);
				align-self: stretch;
				display: inline-flex;
				align-content: center;

				&::after {
					display: inline;
					box-sizing: border-box;
					line-height: calc(var(--FONT-SIZE-MD) * 1.333);
				}

				&[data-icon="arrow_down"]::after {
					content: "›";
					width: calc(var(--FONT-SIZE-MD) * 1.333);
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

		> article {
			overflow: hidden;
			height: 0;
			transition: height 0.3s ease;
			position: relative;

			&::after {
				content: "";
				position: absolute;
				bottom: 0;
				width: 100%;
				height: var(--SPACE-XXL);
				background: linear-gradient(transparent, white);
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