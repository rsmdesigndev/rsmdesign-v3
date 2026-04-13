<script lang="ts">
	import { animate, AnimateTrigger } from "$lib/animate";
</script>

<template>
	<section>
		<div class="ticker-container">
			{#each Array(99) as _, i}
				<img src={`/img/logos-ticker-tape/Logo-${(i % 10) + 1}.png`} />
			{/each}
		</div>
	</section>
</template>

<style lang="scss">
	section {
		z-index: 2;
		position: relative;
		margin-top: var(--SPACE-XXL);

		grid-column: viewport;
		width: 100vw;
		max-width: 100vw;
		height: var(--SPACE-LG);
		overflow-x: hidden;
		overflow-y: visible;

		position: relative;

		> .ticker-container {
			height: 100%;
			display: flex;
			column-gap: var(--SPACE-XL);

			position: absolute;
			left: 0;

			animation: 600s linear infinite forwards ticker-tape-animate;

			> img {
				display: block;
				width: auto;
				height: auto;
				max-width: var(--SPACE-XXL);
				max-height: var(--SPACE-LG);
				object-fit: contain;
			}
		}
	}

	@keyframes ticker-tape-animate {
		0% {
			transform: translate(0rem, 0rem);
		}
		100% {
			transform: translate(-100%, 0rem);
		}
	}
</style>