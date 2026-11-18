<script lang="ts" context="module">
	export type DataFeedFilterMenuItemData = {
		item_name?: string | null;
		item_checked?: boolean | null;
		input_type?: "checkbox" | "radio" | null;
		input_name?: string | null;
		input_value?: string | null;
	};
</script>

<script lang="ts">
	export let data: DataFeedFilterMenuItemData;
	export let sizeOverride: string = "";
</script>

<template>
	<label class="filter-button"
		   class:small={sizeOverride === "sm"}
	>
		<input type={data.input_type ?? "checkbox"}
			   name={data.input_name ?? undefined}
			   value={data.input_value ?? undefined}
			   checked={data.item_checked ?? false}
			   on:change
		/>
		<span class="filter-name">
			{data.item_name}
		</span>
	</label>
</template>

<style lang="scss">
	.filter-button {
		position: relative;
		display: flex;
		align-items: baseline;

		font-family: var(--FONT-FAMILY-PROXIMA-NOVA);
		font-size: var(--FONT-SIZE-MD);
		font-weight: 300;
		line-height: 1.333;

		color: var(--color-cta, var(--color-primary, inherit));
		cursor: pointer;
		transition: color 0.3s ease;

		&.small {
			font-size: var(--FONT-SIZE-SM);
		}

		// Visually hidden but still focusable and announced
		input {
			position: absolute;
			width: 1px;
			height: 1px;
			margin: -1px;
			padding: 0;
			border: 0;
			overflow: hidden;
			white-space: nowrap;
			clip-path: inset(50%);
		}

		.filter-name {
			transition: color 0.3s ease;

			&::after {
				position: absolute;
				top: calc(50% - 0.1rem);
				left: -1rem;

				content: "";
				width: 0.33rem;
				height: 0.33rem;
				border-radius: 50%;
				border: 1px solid transparent;
				transition: border-color 0.3s ease, background-color 0.3s ease;
			}
		}

		input:checked + .filter-name::after {
			border-color: var(--color-primary, currentColor);
			background-color: var(--color-primary, currentColor);
		}

		&:hover .filter-name::after,
		&:hover input:checked + .filter-name::after {
			border-color: var(--color-primary, currentColor);
			background-color: transparent;
		}

		input:focus-visible + .filter-name {
			outline: 2px solid var(--color-accent, var(--COLOR-ORANGE));
			outline-offset: 0.25rem;
		}
	}
</style>