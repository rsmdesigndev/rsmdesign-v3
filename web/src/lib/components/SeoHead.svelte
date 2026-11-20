<script lang="ts">
	import { page } from "$app/stores";
	import type { ImageAsset } from "$lib/cms";
	import { assetUrl } from "$lib/cms/assets";

	const SITE_URL = "https://rsmdesign.com";
	const FALLBACK_IMAGE = "/img/social-share.jpg";
	const FALLBACK_IMAGE_ALT = "RSM Design";

	export let title: string;
	export let description: string =
		"RSM Design is a passionate team of designers, architects, and storytellers working at the intersection of graphics and architecture. Our projects ignite collaborations around the world, each bringing its own unique challenges. RSM Design embraces each new opportunity using creativity.";
	export let noindex: boolean = false;
	export let slug: string | null = "";
	export let image: ImageAsset | string | null | undefined = null;

	const absolute = (url: string) => new URL(url, SITE_URL).href;

	$: shareTitle = title || "RSM Design";
	$: pageUrl = slug ? `${SITE_URL}/${slug}` : absolute($page.url.pathname);
	$: showCanonical = !noindex && $page.status < 400;
	$: imageUrl = absolute(
		typeof image === "string"
			? image
			: image?.filename_disk
				? assetUrl(image.filename_disk)
				: FALLBACK_IMAGE
	);
	$: imageAlt = (typeof image === "object" && image?.description) || FALLBACK_IMAGE_ALT;
</script>

<svelte:head>
	<title>{title}&ensp;·&ensp;RSM Design</title>
	<meta name="description" content={description} />
	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{/if}
	{#if showCanonical}
		<link rel="canonical" href={pageUrl} />
	{/if}

	<!-- Social sharing (LinkedIn, iMessage, Slack, email previews) -->
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="RSM Design" />
	<meta property="og:title" content={shareTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={pageUrl} />
	<meta property="og:image" content={imageUrl} />
	<meta property="og:image:alt" content={imageAlt} />
	<meta name="twitter:card" content="summary_large_image" />

	<slot />
</svelte:head>