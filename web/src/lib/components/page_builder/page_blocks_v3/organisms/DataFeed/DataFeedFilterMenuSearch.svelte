<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let value: string = "";
	export let placeholder: string = "Project name, location, etc…";
	export let autofocus: boolean = false;

	const dispatch = createEventDispatcher();

	function focusOnMount(node: HTMLElement) {
		if (autofocus) {
			node.focus();
		}
	}
</script>

<template>
	<form on:submit|preventDefault={() => dispatch("submit")}>
		<button type="submit" aria-label="Search button">
			<svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
				<rect width="10" height="2.25" transform="matrix(-0.707107 -0.707107 -0.707107 0.707107 20.6621 19.0703)" />
				<circle cx="6.875" cy="6.875" r="6.875" transform="matrix(-1 0 0 1 14.8125 1.0625)" stroke-width="2.125"/>
			</svg>
		</button>
		<input bind:value {placeholder} aria-label="Search bar" use:focusOnMount />
	</form>
</template>

<style lang="scss">
	form {
		display: flex;

		> button {
			width: auto;
			background: transparent;
			margin: 0;
			padding: 0.5rem;
			height: 100%;
			transition: background-color 0.3s ease;
			border: none;
			border-radius: 50%;
			font-weight: 300;
			font-size: var(--FONT-SIZE-XL);
			line-height: 0;
			cursor: pointer;
			> svg {
				height: var(--SPACE-SM);
				width: auto;
				rect {
					fill: var(--color-primary, var(--COLOR-BLACK));
					transition: fill 0.3s ease;
				}
				circle {
					stroke: var(--color-primary, var(--COLOR-BLACK));
					transition: stroke 0.3s ease;
				}
			}
			&:hover {
				> svg {
					rect {
						fill: var(--color-accent, var(--COLOR-ORANGE));
					}
					circle {
						stroke: var(--color-accent, var(--COLOR-ORANGE));
					}
				}
			}
		}

		> input {
			flex: 1 1 auto;
			background: none;
			border: none;
			border-bottom: 1px inset var(--color-tertiary);
			border-radius: 0;
			max-width: 100%;
			padding: 0.25rem 0.75rem;
			background-color: transparent;
			transition: background-color 0.2s ease;
			color: var(--color-primary);
			font-size: var(--FONT-SIZE-MD);
			font-weight: 300;
			caret-color: var(--COLOR-MID-GRAY);

			&::placeholder {
				color: var(--color-primary);
				font-size: var(--FONT-SIZE-MD);
				font-weight: 300;
			}

			&:focus {
				outline: none;
				background-color: var(--color-background);
				border-bottom: none;
				border-radius: 0.25rem;
			}
		}
	}
</style>