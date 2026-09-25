<script lang="ts" context="module">
	// module-level so a new hold ends the one before it
	let stopActiveHold: (() => void) | undefined;

	// pinnedTop holds element there until the reader's input; without it, only layout shifts are undone
	export function holdInPlace(element: Element, pinnedTop?: number) {
		stopActiveHold?.();

		let documentTop = element.getBoundingClientRect().top + window.scrollY;
		const end = performance.now() + 450; // add buffer for the 0.3s transitions + margin of error
		const input = new AbortController();
		let frame: number;

		function step(now: number) {
			if (now > end || !element.isConnected) {
				stop();
				return;
			}

			const top = element.getBoundingClientRect().top;
			const drift = pinnedTop === undefined ? top + window.scrollY - documentTop : top - pinnedTop;
			if (Math.abs(drift) >= 0.5) {
				window.scrollBy(0, drift);
				documentTop += drift;
			}
			frame = requestAnimationFrame(step);
		}

		function stop() {
			cancelAnimationFrame(frame);
			input.abort();
			if (stopActiveHold === stop) stopActiveHold = undefined;
		}

		if (pinnedTop !== undefined) {
			for (const type of ["wheel", "pointerdown", "keydown"]) {
				window.addEventListener(type, stop, { passive: true, signal: input.signal });
			}
		}

		stopActiveHold = stop;
		frame = requestAnimationFrame(step);
	}
</script>

<script lang="ts">
	import { createEventDispatcher, onMount, tick } from "svelte";
	import { MOBILE_QUERY } from "../scripts/triggerLine";

	export let summaryText: string = "Open";
	export let summaryTextOpen: string = summaryText;
	export let summaryIcon: string = "arrow_down";

	export let isOpen: boolean = false;

	export let isAccordionItem: boolean = false;
	export let headingSize: string = "md";

	let headingWeight: number = 600;

	switch (headingSize) {
		/*case "lg":
			headingWeight = 600;
			break;*/
		case "xl":
			headingWeight = 500;
			break;
	}

	let anchor: HTMLElement;

	// renderOpen lags isOpen on close and leads it on open
	let renderOpen: boolean = isOpen;
	let expanded: boolean = isOpen;
	let closeTimer: ReturnType<typeof setTimeout>;
	let ready: boolean = false;

	const dispatch = createEventDispatcher();

	onMount(() => {
		ready = true;
		return () => clearTimeout(closeTimer);
	});

	$: applyOpenState(isOpen);

	async function applyOpenState(open: boolean) {
		clearTimeout(closeTimer);

		if (!ready) {
			renderOpen = open;
			expanded = open;
			return;
		}

		if (open) {
			renderOpen = true;
			await tick();
			requestAnimationFrame(() => (expanded = true));
		} else {
			expanded = false;
			closeTimer = setTimeout(finishClose, 400);
		}
	}

	function finishClose() {
		clearTimeout(closeTimer);
		if (!isOpen) renderOpen = false;
	}

	function onTransitionEnd(e: TransitionEvent) {
		if (e.propertyName === "grid-template-rows") finishClose();
	}

	function holdPosition() {
		if (!window.matchMedia(MOBILE_QUERY).matches) return;

		const summary = anchor.firstElementChild as HTMLElement;
		const { top, height } = summary.getBoundingClientRect();
		const inset = parseFloat(getComputedStyle(anchor).scrollMarginTop);
		holdInPlace(summary, Math.min(Math.max(top, inset), window.innerHeight - height));
	}

	function toggle() {
		isOpen = !isOpen;
		holdPosition();
		dispatch("toggle", { isOpen });
	}
</script>

<template>
	<details open={renderOpen}
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
				  class="icon"
				  aria-hidden="true"
			/>
		</summary>

		<!-- 
			Convert to blockquote (using <svelte:element> tag)
			add `cite` attribute to specify blockquote source,
			link back to AEO article page if applicable
		-->
		<div class="details-body" 
			 class:open={expanded}
			 on:transitionend={onTransitionEnd}
		>
			<div>
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
		// menu bar height, or --sticky-inset where more is stuck (see CardColumn)
		scroll-margin-top: var(--sticky-inset, calc(var(--GRID-CELL) * 1.75));

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
				max-width: 80ch;
				transition: grid-template-rows 0.4s ease, color 0.4s ease, padding-bottom 0.4s ease;
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

							+ ol, + ul {
								margin-top: 1em;
							}
						}

						strong {
							font-weight: 600;
						}

						> a {
							color: var(--color-accent, inherit);
							text-decoration: var(--color-accent) underline solid 1px;
							text-decoration-skip: ink;
							position: relative;

							&::before {
								content: "";
								position: absolute;
								left: 0;
								top: 0;
								height: 100%;
								background-color: var(--color-secondary);
								mix-blend-mode: multiply;
								width: 0;
								opacity: 0.2;
								transition: width 0.3s ease;
							}

							&:hover::before {
								//margin-left: 100%;
								width: 100%;
								transition: width 0.3s ease;
							}
						}
					}

					h3 {
						font-size: inherit;
						font-weight: 600;
						text-transform: uppercase;
						letter-spacing: 0.05em;
						color: var(--color-accordion, var(--color-primary, inherit));
						transition: color 0.3s ease;
						margin-bottom: 0.5em;
					}
					h4 {
						font-size: inherit;
						font-weight: 600;
						color: var(--color-accordion, var(--color-primary, inherit));
						transition: color 0.3s ease;
						margin-bottom: 1em;
					}

					ul, ol {
						list-style-position: outside;
						list-style-type: none;
						margin: 0 0 1em;
						padding: 0;

						> li {
							margin-left: calc(var(--GRID-CELL) * 2 / 3);

							&::before {
								content: "·";
								display: block;
								height: 0;
								font-weight: 500;
								margin: 0 calc(var(--GRID-CELL) * 2 / 3) 0 calc(var(--GRID-CELL) * -2 / 3);
							}
						}
					}

					ol {
						counter-reset: rsm-counter;

						> li {
							counter-increment: rsm-counter;

							&::before {
								content: counter(rsm-counter) ".";
								font-weight: 400;
							}
						}
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
			font-weight: var(--heading-weight, 600);

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
			color: var(--color-details, var(--color-primary, inherit));

			display: grid;
			grid-template-rows: 0fr;
			transition: grid-template-rows 0.3s ease, color 0.3s ease;

			> * {
				min-height: 0;
			}

			&::after {
				content: "";
				position: absolute;
				bottom: 0;
				width: 100%;
				height: var(--SPACE-XXL);
				background: linear-gradient(transparent, var(--color-background, white));
				transition: opacity 0.3s ease;
				pointer-events: none;
				z-index: 1;
			}

			&.open {
				grid-template-rows: 1fr;

				&::after {
					opacity: 0;
				}
			}
		}
	}
</style>