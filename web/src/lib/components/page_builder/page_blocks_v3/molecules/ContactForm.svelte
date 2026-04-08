<script lang="ts">
	import { onMount } from "svelte";

	onMount(() => {
		(globalThis as any).hbspt.forms.create({
			target: ".contact-form",
			region: "na1",
			portalId: "8650991",
			formId: "2e023912-84d4-47b4-868e-022377eceee0"
		});

	})
</script>

<template>
	<div class="contact-form">
	</div>
</template>

<style lang="scss">
	.contact-form {
		display: contents;

		:global {
			form {
				width: 100%;
				display: grid;
				column-gap: calc(var(--GRID-CELL) / 2);
				grid-template-columns: 1fr 2fr;

				@media (max-width: 62.5em) {
					grid-template-columns: 1fr;
				}

				> div {
					grid-column: 1;
					width: 100%;
				}

				.hs-dependent-field ~ .hs-dependent-field,
				> div.hs_project_budget,
				> div.hs-message {
					grid-column: 2;

					@media (max-width: 62.5em) {
						grid-column: 1;
					}
				}

				> .hs-dependent-field ~ .hs-dependent-field {
					grid-row: 1; 
					@media (max-width: 62.5em) {
						grid-row: unset;
					}
				}
				> .hs-dependent-field ~ .hs-dependent-field ~ .hs-dependent-field {
					grid-row: 2 / 5;
					@media (max-width: 62.5em) {
						grid-row: unset;
					}
				}
				> div.hs_project_budget {
					grid-row: 5;
					@media (max-width: 62.5em) {
						grid-row: unset;
					}
				}
				> div.hs-message {
					grid-row: 6 / 8;
					@media (max-width: 62.5em) {
						grid-row: unset;
					}
				}

				label {
					font-weight: 400;
				}
				input,
				select,
				textarea {
					width: 100%;
					max-width: 100%;
					margin-bottom: 2em;
					padding: 0 0 0.25em;
					background-color: transparent;
					color: var(--COLOR-MID-GRAY);
					border: none;
					border-bottom: 1px solid var(--COLOR-MID-GRAY);
					border-radius: 0;

					&:focus {
						border-color: #3898ec;
						outline: 0;
					}
				}
				select {
					-moz-appearance: none; /* Firefox */
					-webkit-appearance: none; /* Safari and Chrome */
					appearance: none;

					> option {
						background-color: #2c2a2a;
						color: white;
					}
				}
				input[type=checkbox] {
					margin-right: 0.5em;
					width: 12px;
					height: 12px;
					background-color: var(--COLOR-MID-GRAY);
					border: 1px solid var(--COLOR-MID-GRAY);
					border-radius: 0;
					margin-bottom: 0;
				}
				textarea {
					margin: 0.25em 0 1em 0;
					border: 1px solid var(--COLOR-MID-GRAY);
					padding: 0.5em 0;
				}
				.hs_recaptcha {
					margin-bottom: 2em;
				}
				input[type=submit] {
					width: auto;
					background-color: var(--COLOR-DIM-GRAY);
					transition: background-color 0.2s;
					padding: 9px 15px;
					color: white;
					border: none;
					border-radius: 0;
					text-decoration: none;
					cursor: pointer;

					&:hover {
						background-color: #a2a4a7;
					}
				}
				.hs-error-msgs {
					margin: -1.75em 0 2em 0;
					color: var(--COLOR-ORANGE);
					font-style: italic;
				}
			}
		}
	}
</style>