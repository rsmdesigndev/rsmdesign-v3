<script lang="ts">
	import type { PageData } from "./$types";
	import Header from "$lib/components/Header.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import { env } from "$env/dynamic/public";
	import { afterNavigate, beforeNavigate } from "$app/navigation";
	import { onMount } from "svelte";
	import { loading } from "$lib/loading";
	import Loading from "$lib/components/Loading.svelte";

	export let data: PageData;

	let headerHeight = "75px";

	function updateHeaderSize() {
		const header = document.querySelector<HTMLElement>("body > header");
		if (!header) return;

		let h = header.getBoundingClientRect().height;
		const mobileNav = document.querySelector<HTMLElement>("body > nav");
		if (mobileNav) h += mobileNav.getBoundingClientRect().height;

		headerHeight = h + "px";
	}

	beforeNavigate((navigation) => {
		if (navigation.type === "leave") return;
		if (!navigation.to) return;
		if (navigation.to.url.pathname === navigation.from?.url.pathname) return;

		loading.start(navigation.to.url.pathname);
	});

	afterNavigate(({ to }) => {
		// Schedule the dismiss FIRST so a throw later in this handler
		// (e.g. an unsupported scrollTo option) can't leave the loader stuck.
		loading.finish();

		setTimeout(updateHeaderSize, 0);

		// Reset scroll while the loader is still covering, so the new page
		// reveals at the top (or its #anchor) without a visible scroll animation. Wrapped so
		// older Safari rejecting "instant" can't break the dismiss.
		try {
			const anchorTarget = to?.url.hash ? document.getElementById(decodeURIComponent(to.url.hash.slice(1))) : null;
			const landingTop = () => anchorTarget ? anchorTarget.getBoundingClientRect().top + window.scrollY : 0;

			window.scrollTo({ top: landingTop(), behavior: 'smooth' });
			// Annoying kludge to ensure WhileScrollingInView animations trigger on navigate
			window.scrollTo({ top: landingTop() + 10, behavior: 'smooth' })

			setTimeout( () => {
				window.scrollTo({ top: landingTop(), behavior: 'instant' })
			}, 100);
		} catch {
			window.scrollTo(0, 0);
		}
	});

	onMount(() => {
		updateHeaderSize();
		// Dismiss the initial-load overlay (respects MIN_LOAD_TIME_MS floor).
		loading.finish();
	});
</script>

<svelte:head>
	{#if env.PUBLIC_NOINDEX === "true"}
		<meta name="robots" content="noindex, nofollow" />
	{/if}
</svelte:head>

<svelte:window on:resize={() => setTimeout(updateHeaderSize, 600)} />

<template>
	<Loading />
	<Header {headerHeight} navMenu={data.nav_menu} />
	<main
		style:--header-height={headerHeight}
		class:is-loading={$loading.status === "active"}
	>
		<slot />
	</main>
	<Footer navMenu={data.nav_menu} />
</template>

<style lang="scss">
	@use "../styles/theme";

	main {
		margin-top: calc(var(--header-height) * -1);
		position: relative;
	}

	main.is-loading {
		visibility: hidden;
	}
</style>