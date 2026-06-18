<script lang="ts" context="module">
</script>

<script lang="ts">
	import type { ImageAssetRelation } from "$lib/cms";
	import { assetUrl } from "$lib/cms/assets";

	export let source: ImageAssetRelation;
	export let isProject: boolean = false;
</script>

<template>
	<img
		src={assetUrl(source.filename_disk)}
		alt={source.description}
		class:unlimit-height-mobile={isProject}
	/>
</template>

<style lang="scss">
	img {
		width: 100%;
		background-color: var(--background-color);

		@media (max-width: 31.25em) {
			max-height: calc(100vh / 3);
			object-fit: cover;

			&.unlimit-height-mobile {
				max-height: unset;
			}
		}
	}
</style>