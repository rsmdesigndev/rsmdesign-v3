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

	afterNavigate(() => {
		// Schedule the dismiss FIRST so a throw later in this handler
		// (e.g. an unsupported scrollTo option) can't leave the loader stuck.
		loading.finish();

		setTimeout(updateHeaderSize, 0);

		// Reset scroll while the loader is still covering, so the new page
		// reveals at the top without a visible scroll animation. Wrapped so
		// older Safari rejecting "instant" can't break the dismiss.
		try {
			window.scrollTo({ top: 0, behavior: 'smooth' });
			// Annoying kludge to ensure WhileScrollingInView animations trigger on navigate
			window.scrollTo({ top: 10, behavior: 'smooth' })

			setTimeout( () => {
				window.scrollTo({ top: 0, behavior: 'instant' })
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
