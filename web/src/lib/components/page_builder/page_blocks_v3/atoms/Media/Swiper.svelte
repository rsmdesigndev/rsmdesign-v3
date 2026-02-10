<script lang="ts" context="module">
</script>

<script lang="ts">
	import { onMount } from "svelte";
	import { assetUrl } from "$lib/cms/assets";

	export let images: ImageAssetRelation[];
	export let start_position: string | null;

	let position: number;
	let dragging = false;
	let container: HTMLDivElement | null = null;

	onMount(() => {
		if (start_position === "left") {
			position = 15;
		} else if (start_position === "right") {
			position = 85;
		} else {
			position = 50;
		}
	});

	function onMouseDown(event: any) {
		dragging = true;
	}

	function onMouseUp(event: any) {
		dragging = false;
	}

	function onMouseMove(event: any) {
		if (dragging) {
			const containerRect = container?.getBoundingClientRect();
			const width = containerRect?.width ?? 0;
			const left = containerRect?.left ?? 0;
			position = (event.clientX - left) / width * 100;

			if (position > 99) {
				position = 99;
			} else if (position < 1) {
				position = 1;
			}
		}
	}

	let width: number;
</script>

<svelte:window on:mouseup={onMouseUp} on:mousemove={onMouseMove} />

<template>
	<div class="images"
		 bind:this={container} 
	>
		<div class="before" style:width="{position}%">
			<img style:width="{width}px"
				src={assetUrl(images?.[0]?.directus_files_id?.filename_disk)}
				alt={images?.[0]?.directus_files_id?.description ?? "Before image"}
			/>
		</div>
		<div class="after" bind:offsetWidth={width}>
			<img
				src={assetUrl(images?.[1]?.directus_files_id?.filename_disk)}
				alt={images?.[1]?.directus_files_id?.description ?? "After image"}
			/>
		</div>
		<div
			class="handle"
			style:left="calc({position}% - var(--GRID-CELL) / 2)"
			on:mousedown={onMouseDown}
		>
			‹&thinsp;›
		</div>
	</div>
</template>

<style lang="scss">
	.images {
		margin: 0;
		padding: 0;
		position: relative;
		overflow: hidden;
		user-select: none;
	}

	.before, .after {
		width: 100%;
		height: 100%;
		user-select: none;
		pointer-events: none;

		img {
			object-fit: cover;
			object-position: left center;
			width: 100%;
			height: 100%;
		}
	}

	.before {
		/* 
			Z-Indexes
			1: Background color
			2: Content
			3: Menu bar
			4: Logo
			5: Hero
			6: Breadcrumbs
			7: Menu overlay
			8: Menu button
		*/
		z-index: 2;
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		overflow: hidden;
	}

	.handle {
		/* 
			Z-Indexes
			1: Background color
			2: Content
			3: Menu bar
			4: Logo
			5: Hero
			6: Breadcrumbs
			7: Menu overlay
			8: Menu button
		*/
		z-index: 2;
		position: absolute;
		bottom: calc(var(--GRID-CELL) * 3);
		border-radius: 50%;
		border: 2px solid white;
		width: var(--GRID-CELL);
		height: var(--GRID-CELL);
		box-sizing: border-box;
		font-size: var(--FONT-SIZE-XL);
		font-weight: 300;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		cursor: grab;
		padding-bottom: 5px;
		box-shadow: 0 0 10px rgba(12, 12, 12, 0.2);

		background-color: rgba(26,24,24,0.5);
		transition: background-color 0.3s ease;
		&:hover {
			background-color: var(--COLOR-ORANGE);
		}

		&::before, &::after {
			content: " ";
			display: block;
			width: 2px;
			background: #fff;
			height: 9999px;
			position: absolute;
			left: 50%;
			margin-left: -1px;
			z-index: 2;
		}

		&::before {
			bottom: 50%;
			margin-bottom: calc(var(--GRID-CELL) / 2);
			box-shadow: 0 0 10px rgb(12, 12, 12);
		}

		&::after {
			top: 50%;
			margin-top: calc(var(--GRID-CELL) / 2);
			box-shadow: 0 0 10px rgb(12, 12, 12);
		}
	}
</style>