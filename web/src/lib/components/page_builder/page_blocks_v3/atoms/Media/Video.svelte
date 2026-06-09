<script lang="ts" context="module">
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import type { ImageAssetRelation } from "$lib/cms";
	import { assetUrl } from "$lib/cms/assets";
	export let source: string;
	export let vimeo: string | null;
	export let youtube: string | null;
	export let native: any | null;
	export let fallback: ImageAssetRelation | null;

	let videoNative: HTMLVideoElement;

	onMount(() => {
		if (native?.filename_disk) {
			videoNative.play();
		}
	});
</script>

<template>
	{#if source === "youtube" && youtube}
		<iframe
			title="Video"
			src="https://www.youtube.com/embed/{youtube}&autoplay=0&color=white&loop=1"
			width="100%"
			height="100%"
			frameborder="0"
			allow="fullscreen"
			allowfullscreen
			loading="lazy"
		/>
	{:else if source === "vimeo" && vimeo}
		<iframe
			title="Video"
			src="https://player.vimeo.com/video/{vimeo}"
			width="100%"
			height="100%"
			frameborder="0"
			allow="autoplay; fullscreen"
			allowfullscreen
			loading="lazy"
		/>
	{:else if source === "native" && native}
		{#if native?.filename_disk}
			<video 
				bind:this={videoNative} 
				autoplay
				loop 
				muted 
				playsinline 
				controls 
				preload="auto"
				poster={assetUrl(fallback?.filename_disk)}
			>
				<source src={assetUrl(native?.filename_disk)} type={native?.type} />
				<img src={assetUrl(fallback?.filename_disk)} title="Your browser does not support the <video> tag">
				<track kind="captions" />
			</video>
		{/if}
	{:else}
		No video link was provided
	{/if}
</template>

<style lang="scss">
	iframe,
	video {
		width: 100%;
		height: auto;
	}
	iframe {
		aspect-ratio: 16 / 9;
	}
</style>