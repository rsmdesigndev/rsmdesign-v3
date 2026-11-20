<script lang="ts">
	import SeoHead from "$lib/components/SeoHead.svelte";
	import DottedArrow from "$lib/components/DottedArrow.svelte";
	import DottedArrowHover from "$lib/components/DottedArrowHover.svelte";
</script>

<SeoHead
	title="Contact Form Received"
	description="Thanks for reaching out."
	slug="contact-form-received"
>
</SeoHead>

<svelte:head>
	<style>
		:root {
			--bg-color: var(--COLOR-BLACK);
			--bg-scrim: none;
			--text-color: white;
			--accent-color: var(--COLOR-ORANGE);
			--midtone-color: var(--COLOR-DIM-GRAY);
		}
	</style>
</svelte:head>

<template>
	<div class="container">
		<section class="header-section">
			<h1 class="md gray">Form Received</h1>
			<h2 class="xxxl">Thanks for reaching out.</h2>
		</section>
		<section class="message-section">
			<p>We'll be in contact shortly! Check out our projects, articles, and social media for the latest at RSM Design</p>
		</section>
		<section class="additional-info">
			<nav>
				<DottedArrowHover href="/about">
					<p>About <DottedArrow /></p>
				</DottedArrowHover>
				<DottedArrowHover href="/work">
					<p>Work <DottedArrow /></p>
				</DottedArrowHover>
				<DottedArrowHover href="/news">
					<p>News <DottedArrow /></p>
				</DottedArrowHover>
			</nav>
			<div class="social-icons">
				<a href="https://www.linkedin.com/company/rsm-design" target="_blank">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 417 400">
						<g class="social-icon" fill-rule="nonzero">
							<path d="M416.667 245.03v154.045h-89.305V255.347c0-36.105-12.918-60.746-45.243-60.746-24.676 0-39.361 16.606-45.822 32.67-2.356 5.742-2.962 13.735-2.962 21.774v150.03H144s1.203-243.427 0-268.648h89.326v38.08c-.181.284-.417.592-.587.868h.587v-.868c11.868-18.279 33.063-44.391 80.503-44.391 58.776-.001 102.838 38.396 102.838 120.914ZM50.551.925C19.99.925 0 20.971 0 47.332c0 25.787 19.411 46.441 49.365 46.441h.597c31.154 0 50.528-20.65 50.528-46.441C99.903 20.971 81.116.925 50.551.925ZM5.306 399.075h89.301V130.427H5.306v268.648Z"/>
						</g>
					</svg>
				</a>
				<a href="https://www.instagram.com/rsmdesign" target="_blank">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 417 417">
						<g class="social-icon" fill-rule="nonzero">
							<path d="M208.332 37.538c55.627 0 62.216.213 84.186 1.215 20.312.927 31.342 4.32 38.684 7.173a64.543 64.543 0 0 1 23.954 15.584 64.561 64.561 0 0 1 15.585 23.954c2.853 7.341 6.247 18.372 7.173 38.685 1.002 21.968 1.215 28.557 1.215 84.186 0 55.628-.213 62.215-1.215 84.186-.927 20.312-4.321 31.342-7.173 38.684a69.025 69.025 0 0 1-39.539 39.538c-7.341 2.853-18.372 6.247-38.684 7.173-21.964 1.003-28.553 1.215-84.186 1.215-55.633 0-62.219-.212-84.186-1.215-20.312-.927-31.342-4.321-38.684-7.173a64.539 64.539 0 0 1-23.954-15.584 64.547 64.547 0 0 1-15.584-23.954c-2.854-7.341-6.247-18.372-7.174-38.684-1.002-21.968-1.214-28.558-1.214-84.186 0-55.629.212-62.216 1.214-84.186.927-20.313 4.32-31.343 7.174-38.685a64.565 64.565 0 0 1 15.585-23.955 64.555 64.555 0 0 1 23.955-15.584c7.341-2.853 18.372-6.247 38.684-7.173 21.968-1.002 28.557-1.215 84.186-1.215m0-37.537c-56.58 0-63.677.24-85.895 1.254-22.175 1.012-37.319 4.533-50.57 9.684a102.126 102.126 0 0 0-36.9 24.029 102.13 102.13 0 0 0-24.036 36.9c-5.146 13.252-8.667 28.395-9.675 50.571C.24 144.655 0 151.752 0 208.332c0 56.58.24 63.677 1.258 85.895 1.012 22.175 4.533 37.318 9.684 50.57a102.126 102.126 0 0 0 24.029 36.899 102.12 102.12 0 0 0 36.9 24.03c13.252 5.15 28.395 8.671 50.57 9.684 22.221 1.014 29.315 1.253 85.894 1.253 56.579 0 63.677-.239 85.895-1.253 22.175-1.013 37.319-4.534 50.57-9.684a106.578 106.578 0 0 0 60.929-60.929c5.151-13.252 8.672-28.396 9.684-50.57 1.014-22.221 1.254-29.316 1.254-85.895 0-56.579-.24-63.677-1.254-85.894-1.012-22.176-4.533-37.319-9.684-50.571A102.126 102.126 0 0 0 381.7 34.968a102.127 102.127 0 0 0-36.902-24.035c-13.253-5.146-28.396-8.667-50.571-9.675C272.009.24 264.912 0 208.332 0h.002Z"/>
							<path d="M208.332 101.351c-58.688 0-106.981 48.293-106.981 106.981 0 58.688 48.293 106.982 106.981 106.982 58.688 0 106.982-48.294 106.982-106.982S267.02 101.351 208.332 101.351Zm0 176.425c-38.095-.001-69.443-31.349-69.443-69.444s31.348-69.443 69.444-69.443c38.095 0 69.443 31.348 69.443 69.443 0 38.096-31.348 69.444-69.444 69.444Z"/>
							<circle cx="319.54" cy="97.124" r="24.999" />
						</g>
					</svg>
				</a>
				<a href="https://www.pinterest.com/rsmdesign/" target="_blank">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 325 418">
						<g class="social-icon" fill-rule="nonzero">
							<path d="M141.649 1.929C72.409 9.658 3.414 65.676.566 145.696c-1.79 48.858 12.083 85.512 58.581 95.804 20.178-35.596-6.509-43.447-10.658-69.198C31.443 66.775 170.207-5.19 242.823 68.483c50.241 51.015 17.167 207.962-63.87 191.649-77.619-15.581 37.996-140.512-23.961-165.043-50.363-19.934-77.132 60.981-53.252 101.174-13.994 69.117-44.139 134.248-31.934 220.939 39.582-28.721 52.926-83.722 63.869-141.082 19.893 12.082 30.511 24.653 55.896 26.605 93.607 7.242 145.883-93.444 133.109-186.319C311.33 34.067 229.154-7.834 141.649 1.929Z"/>
						</g>
					</svg>
				</a>
			</div>
		</section>
	</div>
</template>


<style lang="scss">
	section.header-section {
		margin-top: var(--GRID-CELL);
		grid-column: whole;
	}
	
	section.message-section {
		margin-top: 5rem;
		grid-column: whole;

		@media (max-width: 62.5em) {
				margin-top: 2.5rem;
		}
	}

	section.additional-info {
		p {
			&:hover {
				color: var(--COLOR-ORANGE);
			}
		}

		.social-icons {
			margin-top: 1.5em;
			display: flex;
			justify-content: flex-start;
			column-gap: 1em;

			a {
				display: flex;
				justify-content: flex-start;
				height: 1.75rem;
				width: 1.75rem;

				@media (max-width: 46.875em) {
					height: 1.5rem;
					width: 1.5rem;
				}

				@media (max-width: 31.25em) {
					height: 1rem;
					width: 1rem;
				}

				transition: opacity 0.3s ease;
				&:hover {
					opacity: 0.4;
				}

				svg {
					max-height: 100%;
					max-width: 100%;

					.social-icon {
						fill: var(--text-color, var(--COLOR-WHITE));
					}
				}
			}
		}
	}
</style>