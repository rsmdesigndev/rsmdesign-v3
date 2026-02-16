<script lang="ts">
	import type { PageData } from "./$types";
	import Header from "$lib/components/Header.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import { env } from "$env/dynamic/public";
	import { afterNavigate, beforeNavigate } from "$app/navigation";
	import { onMount } from "svelte";
	import { navigating } from "$app/stores";
	import { MIN_LOAD_TIME_MS, loading } from "$lib/loading";
	import Loading from "$lib/components/Loading.svelte";

	export let data: PageData;

	$: console.log("layout data", data);

	let headerHeight = "75px";
	let navigationTimeout: NodeJS.Timeout | null = null;

	function updateHeaderSize() {
		let header = document.querySelector<HTMLElement>("body > header");
		if (header) {
			let h = header.getBoundingClientRect().height;

			let mobileNav = document.querySelector<HTMLElement>("body > nav");
			if (mobileNav) {
				h += mobileNav.getBoundingClientRect().height;
			}

			headerHeight = h + "px";
		}
	}

	beforeNavigate((navigation) => {
		if (navigation.type !== "leave" && navigation.to?.url?.href != navigation.from?.url?.href) {
			loading.startNavigation();
			// clear previous timeout
			if (navigationTimeout) {
				clearTimeout(navigationTimeout);
			}
			navigationTimeout = setTimeout(() => {
				console.log("min load time surpassed", $navigating);
				if (!$navigating) {
					console.log("stopping navigation");
					loading.stopAnimation();
				}
			}, MIN_LOAD_TIME_MS);
		}
	});

	afterNavigate(() => {
		setTimeout(updateHeaderSize, 600);
		console.log("afterNavigation");
		loading.stopNavigation();

		// TODO: Try to get this working to give the animation script a navigation hook
		let navigate = new CustomEvent('navigate');
		window.dispatchEvent(navigate);

		// Annoying kludge to ensure WhileScrollingInView animations trigger on navigate
		window.scrollTo({
			top: 10,
			behavior: 'smooth'
		})

		setTimeout( () => {
			window.scrollTo({
				top: 0,
				behavior: 'smooth'
			})
		}, 150);
	});

	onMount(updateHeaderSize);
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
	<main style:--header-height={headerHeight}>
		<slot />
	</main>
	<Footer />
</template>

<style lang="scss">
	@use "../styles/theme";

	main {
		margin-top: calc(var(--header-height) * -1);
		position: relative;
	}
</style>
