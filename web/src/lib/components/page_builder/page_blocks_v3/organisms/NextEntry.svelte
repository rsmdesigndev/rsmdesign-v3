<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { request } from "graphql-request";
	import { env } from "$env/dynamic/public";
	import { afterNavigate } from "$app/navigation";
	import { page } from "$app/stores";
	import { feedSourceConfig, generateNextEntryQuery } from "$lib/cms/dataFeed/dataFeedQueries";
	import { feedFilterGroups, feedFiltersFromUrlParams, feedFiltersToUrlParams,
			 filtersArrayToGraphql, searchTextFromUrlParams, searchToGraphql,
			 type FeedFilters } from "$lib/cms/dataFeed/dataFeedFilters";
 
	import Heading from "../atoms/Heading.svelte";
	import Cta from "../atoms/Cta.svelte";
 
	export let entryType: "project" | "article";
	export let currentSlug: string;
	export let currentCursor: string | number | null = null;
 
	// Color theme
	const dispatch = createEventDispatcher();
 
	function selectComponentOnIntersection(node: Element) {
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				dispatch('selectComponent');
			}
		}, { rootMargin: '-50% 0% -50% 0%' });
		observer.observe(node);
		return {
			destroy() {
				observer.disconnect();
			}
		};
	}
 
	let loaded: boolean = false;
	let nextSlug: string = "";
	let nextTitle: string = "";
	let nextUrl: string = "";
 
	$: feedSource = entryType === "project" ? "Projects" : "Articles";
 
	// Reading URL params inside afterNavigate keeps them clear of prerendering
	afterNavigate(async () => {
		loaded = false;
 
		const source = feedSourceConfig(feedSource);
 
		if (!source?.titleField) {
			loaded = true;
			return;
		}
 
		const feedFilters: FeedFilters = feedFiltersFromUrlParams(
			feedFilterGroups({ feed_source: feedSource }),
			$page.url.searchParams
		);
		const searchTerm: string = searchTextFromUrlParams($page.url.searchParams);
 
		const query: string = generateNextEntryQuery({
			feedSource,
			filters: filtersArrayToGraphql(feedFilters),
			searchFilter: searchToGraphql(searchTerm),
			cursor: currentCursor,
			currentSlug
		});
 
		nextSlug = "";
		nextTitle = "";
		nextUrl = "";
 
		try {
			const response: any = await request(env.PUBLIC_DIRECTUS_API_URL, query, { search: searchTerm });
 
			// next is empty when the current entry is the last, so it wraps around to first
			const nextEntry = response?.next?.find(entry => entry.slug !== currentSlug) ?? response?.first?.[0];
 
			// A set holding only the current entry has no next entry to offer
			if (nextEntry && nextEntry.slug !== currentSlug) {
				nextSlug = nextEntry.slug ?? "";
				nextTitle = nextEntry[source.titleField] ?? "";
				nextUrl = `${source.routePrefix}/${nextSlug}${feedFiltersToUrlParams(feedFilters, searchTerm)}`;
			}
		} catch (error) {
			console.warn(`Could not load the next ${entryType}:`, error);
		}
 
		loaded = true;
	});
</script>

<template>
	{#if !loaded || nextSlug}
		<section use:selectComponentOnIntersection>
			<article>
				<Heading 
					data={ { heading_type: "feed-item",
							 heading_primary: "large",
							 heading_size: "xxxl",
							 heading_weight: "regular",
							 heading_has_small_text: true,
							 heading_has_large_text: true,
							 heading_has_superscript: false, 
							 heading_small: `Next ${entryType}`,
							 heading_large: loaded ? nextTitle : `Loading next ${entryType}`
						 } }
				/>
 
				<Cta 
					data={ { cta_type: "button",
							 cta_icon: "arrow_right", 
							 cta_style: "bold",
							 cta_text_bold: `View ${entryType}`,
							 cta_link: nextUrl
						 } }
				/>
			</article>
		</section>
	{/if}
</template>

<style lang="scss">
	section {
		/* 
			Z-Indexes
			1: Background color
			2: Content
			3: Menu bar
			4: Logo
			5: Hero
			6: Breadcrumbs
			7: Menu overlay
			8: Menu button
		*/
		z-index: 2;
		position: relative;

		grid-column: viewport;
		display: grid;
		grid-template-columns: subgrid;

		margin-top: var(--SPACE-XL);

		> article {
			grid-column: main;
			display: flex;
			flex-direction: column;
			row-gap: var(--SPACE-MD);
			align-items: flex-start;
		}
	}
</style>
