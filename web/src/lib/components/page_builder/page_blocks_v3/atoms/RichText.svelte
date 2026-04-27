<script lang="ts" context="module">
	export type RichTextData = {
		rich_text_size?: string | null;
		rich_text_content?: string | null;
		rich_text_has_read_more?: boolean | null;
		rich_text_content_read_more?: string | null;
	};
</script>

<script lang="ts">
	import type { BleedData } from "../organisms/CardColumn.svelte";
	import Details from "./Details.svelte";

	export let data: RichTextData;
	export let bleed: BleedData;
	export let isActive: boolean = true;
</script>

<div class={`rich-text-v3 rich-text-${data.rich_text_size}`}
	 class:read-more={data.rich_text_has_read_more}
	 class:active={isActive}
	 style:--grid-column-start={bleed.left ? "2" : "1"}
	 style:--grid-column-end={bleed.right ? "-2" : "-1"}
>
	{@html data.rich_text_content}
	{#if data.rich_text_has_read_more}
		<Details summaryText="Read more"
				 summaryTextOpen="Read less"
				 summaryIcon="plus"
		>
			{#if data.rich_text_content_read_more}
				{@html data.rich_text_content_read_more}
			{:else}
				<p>“Read more” enabled, but no content provided.</p>
			{/if}
		</Details>
	{/if}
</div>

<style lang="scss">
	.rich-text-v3 {
		grid-column: var(--grid-column-start) / var(--grid-column-end);
		font-weight: 300;

		opacity: 0;
		transition: opacity 0.3s ease;
		&.active {
			opacity: 1;
		}

		:global {
			p {
				font-size: inherit;
				color: var(--color-rich-text, var(--color-primary, inherit));
				transition: color 0.3s ease;

				&:last-of-type {
					margin-bottom: 0;
				}

				strong {
					font-weight: 700;
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
				font-weight: 700;
				text-transform: uppercase;
				letter-spacing: 0.05em;
				color: var(--color-rich-text, var(--color-primary, inherit));
				transition: color 0.3s ease;
				margin-bottom: 0.5em;
			}
			h4 {
				font-size: inherit;
				font-weight: 700;
				color: var(--color-rich-text, var(--color-primary, inherit));
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

		&.read-more {
			:global {
				p:last-of-type {
					margin-bottom: var(--SPACE-MD);
				}
			}
		}
	}
	.rich-text-sm {
		font-size: var(--FONT-SIZE-SM);
		line-height: 1.333;
	}
	.rich-text-md {
		font-size: var(--FONT-SIZE-MD);
		line-height: 1.333;
	}
	.rich-text-lg {
		font-size: var(--FONT-SIZE-LG);
		line-height: 1.167;
	}
	.rich-text-xl {
		font-size: var(--FONT-SIZE-XL);
		line-height: 1.133;
	}
	.rich-text-xxl {
		font-size: var(--FONT-SIZE-XXL);
		line-height: 1;
	}
	.rich-text-xxxl {
		font-size: var(--FONT-SIZE-XXXL);
		line-height: 1;
	}
	.rich-text-xxxxl {
		font-size: 10vw;
		line-height: 0.8;
		margin-bottom: 0;
	}
</style>