<script lang="ts" context="module">
	export type MediaData = {
		media_type?: string | null;
		media_image?: ImageAssetRelation | null;
		media_video_source?: string | null;
		media_video_vimeo?: string | null;
		media_video_youtube?: string | null;
		media_slider?: ImageAssetRelation[] | null;
		media_slider_autoplay?: boolean | null;
		media_slider_autoplay_interval?: number | null;
		media_slider_images_per_slide?: number | null;
		media_swiper?: ImageAssetRelation[] | null;
		media_caption?: string | null;
	}
</script>

<script lang="ts">
	import type { ImageAssetRelation } from "$lib/cms";
	import Image from "./Image.svelte";
	import Slider from "./Slider.svelte";
	import Swiper from "./Swiper.svelte";
	import Video from "./Video.svelte";

	export let data: MediaData;
</script>

<figure class:grid={data.media_type === "slider"}>
	{#if data.media_type === "image"}
		{#if data.media_image}
			<Image source={data.media_image} />
		{:else}
			Media type “image” selected, but no image was uploaded
		{/if}
	{:else if data.media_type === "video"}
		{#if data.media_video_vimeo || data.media_video_youtube}
			<Video 
				source={data.media_video_source}
				vimeo={data.media_video_vimeo} 
				youtube={data.media_video_youtube}
			/>
		{:else}
			Media type “video” selected, but no video link was provided
		{/if}
	{:else if data.media_type === "slider"}
		{#if data.media_slider}
			<Slider
				images={data.media_slider}
				images_per_slide={data.media_slider_images_per_slide} 
				autoplay={data.media_slider_autoplay}
				autoplay_interval={data.media_slider_autoplay_interval}
			/>
		{:else}
			Media type “slider” selected, but no images were uploaded
		{/if}
	{:else if data.media_type === "swiper"}
		{#if data.media_swiper}
			<Swiper 
				images={data.media_swiper}
				start_position={data.media_swiper_start_position}
			/>
		{:else}
			Media type “swiper” selected, but no images were uploaded
		{/if}
	{:else}
		No media type selected
	{/if}
	{#if data.media_caption}
		<figcaption>
			{@html data.media_caption}
		</figcaption>
	{/if}
</figure>

<style lang="scss">
	figure {
		grid-column: 1 / -1;
		margin: 0;
		padding: 0;
		overflow-x: hidden;

		> figcaption {
			font-size: var(--FONT-SIZE-SM);
		}

		&.grid {
			display: grid;
			grid-template-columns: 1fr 1fr;
		}
	}
</style>