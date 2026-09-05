<script lang="ts" context="module">
	import type { LayoutFields } from "./index.svelte";

	export type PageBlockVideoData = LayoutFields & {
		youtube_id?: string | null;
		vimeo_id?: string | null;
		native_video?: {
			id: string | null,
			title: string | null,
			filename_disk: string | null
			type: string | null,
		}
		enable_autoplay?: boolean | null;
		enable_looping?: boolean | null;
		enable_controls?: boolean | null;
	};
</script>

<script lang="ts">
	import Section from "$lib/components/Section.svelte";
	import { animate, fadeScroll } from "$lib/animate";
	import { assetUrl, rawAssetUrl } from "$lib/cms/assets";
	export let data: PageBlockVideoData;
	export let order: number;
	export let project: boolean = false;
</script>

<Section 
	project={project}
	video
	order={order}
	span_columns={data.span_columns ?? 1}
	col_units={data.col_units ?? "whole"}
	col_start={data.col_start ?? 1}
	padding_left={data.padding_left ?? "none"}
	padding_right={data.padding_right ?? "none"}
	span_rows={data.span_rows ?? 1}
	padding_top={data.padding_top ?? "default"}
	anchor_id={data.anchor_id ?? ""}
>

	{#if data.native_video?.filename_disk}
		<video 
			autoplay={data.enable_autoplay ?? false}
			loop={data.enable_looping ?? false}
			controls={data.enable_controls ?? false}
			muted={data.enable_autoplay ?? false}
			playsinline={data.enable_autoplay ?? false}
			width="100%"
			height="100%"
		>
			<source src={rawAssetUrl(data.native_video?.filename_disk)} type="{data.native_video?.type}" />
			<track kind="captions" />
		</video>
	{:else}
		<figure class="video" use:animate={fadeScroll}>
			{#if data.youtube_id}
				<iframe
					title="Video"
					src="https://www.youtube.com/embed/{data.youtube_id}"
					width="100%"
					height="100%"
					frameborder="0"
					allow="autoplay; fullscreen"
					allowfullscreen
					loading="lazy"
				/>
			{:else}
				<iframe
					title="Video"
					src="https://player.vimeo.com/video/{data.vimeo_id}"
					width="100%"
					height="100%"
					frameborder="0"
					allow="autoplay; fullscreen"
					allowfullscreen
					loading="lazy"
				/>
			{/if}
		</figure>
	{/if}
	
</Section>

<style lang="scss">
</style>