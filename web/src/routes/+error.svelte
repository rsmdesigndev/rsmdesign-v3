<script lang="ts">
	import { page } from "$app/stores";
	import DottedArrowHover from "$lib/components/DottedArrowHover.svelte";
	import DottedArrow from "$lib/components/DottedArrow.svelte";
</script>

{#if $page.status === 404}
	<section class="c-404">
		<div class="c-404__flex-wrapper">
			<div class="c-404__inner-wrapper">
				<h1 class="c-404__heading">404</h1>
				<h3 class="c-404__subheading">Sorry, we couldn't find that page.</h3>
			</div>
			<!-- <a href="/work" class="c-404__link">View our work</a> -->
			<DottedArrowHover href="/work" text_alignment={"left"}>
				<p class="c-404__link">View our work<DottedArrow /></p>
			</DottedArrowHover>
		</div>
	</section>
{:else}
	<h2>Sorry, something's wrong on our end. Please try again soon.</h2>
{/if}

<style lang="scss">
	.c-404 {
		grid-column: 1 / span 3;
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		place-content: center;
		background: url('/img/RSM-Design_404-image.jpg') center center no-repeat;
		background-size: cover;
		width: 100%;
		height: calc(100vh - var(--HEADER-HEIGHT));
		padding: 24px;
		margin-top: var(--HEADER-HEIGHT);
		box-sizing: border-box;

		@media screen and (min-width: 768px) {
			grid-template-columns: repeat(12, 1fr);
		}

		&__flex-wrapper {
			grid-column: 1 / span 6;
			display: flex;
			flex-flow: column nowrap;
			gap: 24px;
			transform: translateY(-15%);

			@media screen and (min-width: 768px) {
				grid-column: 2 / span 8;
			}

			@media screen and (min-width: 1080px) {
				grid-column: 4 / span 6;
			}
		}

		&__inner-wrapper {
			display: flex;
			flex-flow: column nowrap;
		}

		&__heading {
			font-size: 160px;
			font-weight: 600;
			color: rgba(255, 255, 255, 0.8);
			line-height: 0.9;
			margin: 0;

			@media screen and (min-width: 768px) {
				font-size: 200px;
			}
		}

		&__subheading {
			font-size: 48px;
			color: rgba(255, 255, 255, 0.8);
			line-height: 1.2;
			max-width: 600px;
			margin: 0;
			text-wrap: balance;

			@media screen and (min-width: 768px) {
				font-size: 56px;
			}

			@media screen and (min-width: 1024px) {
				font-size: 64px;
			}
		}

		&__link {
			display: flex;
			font-size: 20px;
			font-weight: 600;
			letter-spacing: 1px;

			@media screen and (min-width: 768px) {
				font-size: 24px;
			}

			@media screen and (min-width: 1024px) {
				font-size: 28px;
			}
		}
	}
</style>