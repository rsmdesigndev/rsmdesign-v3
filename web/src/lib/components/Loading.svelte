<script lang="ts">
	import { loading, variantFor } from "$lib/loading";
	import { page } from "$app/stores";

	$: variant = $loading.destinationPath
		? variantFor($loading.destinationPath)
		: variantFor($page.url.pathname);

	$: isActive = $loading.status === "active";
</script>

<div
	class="loader loader-{variant}"
	class:loader-active={isActive}
	aria-hidden={!isActive}
>
	{#if variant === "home"}
		<lottie-player
			autoplay
			mode="normal"
			src="/preloader/RSM_Web-Loading-Animation2.json"
			style="width: 480px"
		/>
	{:else}
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 22.572">
			<g class="preloader" fill-rule="nonzero">
				<path
					d="M0 6.25h2.72v1.73h.04a3.47 3.47 0 0 1 4.2-1.84v2.63a5.56 5.56 0 0 0-1.32-.2l-.18-.02a2.75 2.75 0 0 0-2.74 2.74v5.84H0V6.25ZM14.5 9.27a2.47 2.47 0 0 0-2.13-1.11c-.72 0-1.58.34-1.58 1.15 0 1.95 5.86.37 5.86 4.6 0 2.59-2.46 3.49-4.68 3.49-1.6.1-3.15-.51-4.24-1.68l1.81-1.7a3.34 3.34 0 0 0 2.58 1.34c.8 0 1.82-.39 1.82-1.25 0-2.24-5.87-.47-5.87-4.62 0-2.43 2.17-3.5 4.37-3.5a4.7 4.7 0 0 1 3.87 1.64l-1.8 1.64ZM18.3 6.25h2.6v1.7h.03a3.46 3.46 0 0 1 3.34-1.97A3.32 3.32 0 0 1 27.67 8c.7-1.32 2.1-2.1 3.58-2.02 2.9 0 3.91 2.06 3.91 4.66v6.49h-2.71v-6.17c0-1.36-.41-2.53-2.02-2.53-1.7 0-2.34 1.4-2.34 2.8v5.9h-2.71v-6.49c0-1.33-.55-2.2-1.86-2.2-1.79 0-2.49 1.3-2.49 2.75v5.94H18.3V6.25ZM48.73 17.13h-1.5v-1.77h-.05a5.05 5.05 0 0 1-4.11 2.04h-.22a5.45 5.45 0 0 1-5.43-5.42v-.31a5.45 5.45 0 0 1 5.43-5.43l.22.01a5.05 5.05 0 0 1 4.11 2.04h.05V0h1.5v17.13Zm-5.66-1.09h.1a4.15 4.15 0 0 0 4.14-4.13l-.01-.09v-.08a4.15 4.15 0 0 0-4.13-4.13h-.2a3.95 3.95 0 0 0-3.92 3.93V12.11a3.95 3.95 0 0 0 3.93 3.93h.09ZM52.58 12.23a4 4 0 0 0 3.9 3.81 4 4 0 0 0 3.4-1.84l1.15.96a5.54 5.54 0 0 1-4.55 2.24h-.1a5.4 5.4 0 0 1-5.39-5.38V11.61a5.38 5.38 0 0 1 5.35-5.36c3.22.03 5.07 2.4 5.07 5.3v.68h-8.83Zm7.2-1.22.02-.2c0-1.76-1.45-3.2-3.21-3.2h-.25a3.75 3.75 0 0 0-3.71 3.4h7.16ZM69.53 9.04a2.47 2.47 0 0 0-2.29-1.43c-1.04 0-2.2.46-2.2 1.59 0 1 .7 1.36 2.09 1.67l1.52.37a3.04 3.04 0 0 1 2.58 2.9c0 2.3-2.06 3.26-4.13 3.26a4.64 4.64 0 0 1-4.07-2.06l1.29-.89c.58.99 1.64 1.6 2.78 1.59 1.22 0 2.5-.55 2.5-1.77 0-1.06-.91-1.43-2.02-1.7l-1.45-.34c-.72-.18-2.72-.76-2.72-2.78 0-2.2 1.93-3.2 3.92-3.2a3.69 3.69 0 0 1 3.54 1.9l-1.34.9ZM74.2 3.53c-.6 0-1.08-.5-1.1-1.09.02-.6.5-1.07 1.1-1.08.6 0 1.07.49 1.08 1.08 0 .6-.49 1.09-1.08 1.1Zm.74 13.6h-1.5V6.52h1.5v10.61ZM78.57 19.25a5.03 5.03 0 0 0 4.05 1.96c3.04 0 4.12-1.88 4.12-4.17v-1.91h-.04a4.57 4.57 0 0 1-3.97 2h-.14a5.4 5.4 0 0 1-5.38-5.38v-.19c0-2.9 2.4-5.3 5.31-5.3h.08a4.9 4.9 0 0 1 4.1 2.03h.04V6.52h1.5v10.52c0 2.31-.93 5.53-5.69 5.53-1.92.07-3.79-.71-5.09-2.14l1.1-1.18Zm4.21-3.49h.12a3.91 3.91 0 0 0 3.9-3.89v-.38c0-2.12-1.76-3.89-3.9-3.89l-.12.01a4.03 4.03 0 0 0-3.94 4v.16a4.03 4.03 0 0 0 3.94 4ZM92.34 6.52c.06.57.08 1.14.07 1.7h.05A4.28 4.28 0 0 1 96 6.25c2.7 0 3.99 1.52 3.99 4.15v6.73h-1.5v-5.87c0-2.36-.65-3.64-2.88-3.64-.3 0-3.21.2-3.21 4.07v5.44h-1.5V8.86c0-.57-.06-1.56-.1-2.33l1.53-.01Z"
				/>
			</g>
		</svg>
	{/if}
</div>

<style lang="scss">
	.loader {
		position: fixed;
		inset: 0;
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;

		// Idle: fade out over 400ms, then snap visibility to hidden.
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
		transition: opacity 400ms ease, visibility 0s linear 400ms;
	}

	.loader-active {
		// Active: fade in over 150ms. Visibility flips immediately.
		opacity: 1;
		visibility: visible;
		pointer-events: auto;
		transition: opacity 150ms ease, visibility 0s;
	}

	.loader-home {
		background: var(--COLOR-BLACK);
	}

	.loader-default {
		background: white;
	}

	svg {
		width: 10rem;
		height: auto;

		g.preloader {
			fill: var(--COLOR-MID-GRAY);
		}
	}
</style>
