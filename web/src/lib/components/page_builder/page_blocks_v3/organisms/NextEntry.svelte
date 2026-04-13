<script lang="ts" context="module">
	export enum EntryType {
		Project = "Project",
		Article = "Article"
	}
</script>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { cmsClient } from "$lib/cms";
	import { afterNavigate } from "$app/navigation";
	import {
		getNewsFiltersFromUrl,
		getProjectFiltersFromUrl,
		makeGraphqlNewsFilters,
		makeGraphqlProjectFilters,
		makeNewsFilterUrlParams,
		makeProjectFilterUrlParams
	} from "$lib/cms/filters";
	import { page } from "$app/stores";

	import Heading from "../atoms/Heading.svelte";
	import Cta, { type CtaData } from "../atoms/Cta.svelte";

	export let project: boolean = false;
	export let entryType: EntryType;
	export let currentSlug: string;

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

	let loaded: boolean;
	let nextSlug: string;
	let nextTitle: string;

	let serviceFilterSlugs: Set<string> = new Set();
	let marketFilterSlugs: Set<string> = new Set();
	let topicFilterSlugs: Set<string> = new Set();

	function makeUrlParams(): string {
		if (entryType === EntryType.Project) {
			return makeProjectFilterUrlParams(serviceFilterSlugs, marketFilterSlugs);
		} else if (entryType === EntryType.Article) {
			return makeNewsFilterUrlParams(topicFilterSlugs);
		} else {
			throw new Error(`Invalid entryType: ${entryType}`);
		}
	}

	function makeNextUrl(): string {
		if (entryType === EntryType.Project) {
			return `/work/${nextSlug}${makeUrlParams()}`;
		} else if (entryType === EntryType.Article) {
			return `/news/${nextSlug}${makeUrlParams()}`;
		} else {
			throw new Error(`Invalid entryType: ${entryType}`);
		}
	}

	afterNavigate(async () => {
		loaded = false;

		if (entryType === EntryType.Project) {
			let urlProjectFilters = getProjectFiltersFromUrl($page.url.searchParams);
			serviceFilterSlugs = urlProjectFilters.serviceFilterSlugs;
			marketFilterSlugs = urlProjectFilters.marketFilterSlugs;

			const projectsRes = await cmsClient.NextProject({
				filter: makeGraphqlProjectFilters(serviceFilterSlugs, marketFilterSlugs)
			});

			const currentProjectIndex = projectsRes.projects.findIndex(
				(project) => project.slug === currentSlug
			);
			let nextProject;
			if (currentProjectIndex < projectsRes.projects.length - 1) {
				nextProject = projectsRes.projects[currentProjectIndex + 1];
			} else {
				// wrap around to the first project
				nextProject = projectsRes.projects[0];
			}

			nextSlug = nextProject.slug ?? "";
			nextTitle = nextProject.project_title ?? "";
		} else if (entryType === EntryType.Article) {
			let urlNewsFilters = getNewsFiltersFromUrl($page.url.searchParams);
			topicFilterSlugs = urlNewsFilters.topicFilterSlugs;

			const newsRes = await cmsClient.News({ filter: makeGraphqlNewsFilters(topicFilterSlugs) });

			const currentArticleIndex = newsRes.news_posts.findIndex(
				(article) => article.slug === currentSlug
			);
			let nextArticle;
			if (currentArticleIndex < newsRes.news_posts.length - 1) {
				nextArticle = newsRes.news_posts[currentArticleIndex + 1];
			} else {
				// wrap around to the first article
				nextArticle = newsRes.news_posts[0];
			}

			nextSlug = nextArticle.slug ?? "";
			nextTitle = nextArticle.post_title ?? "";
		}

		loaded = true;
	});
</script>

<template>
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
						 heading_large: loaded ? nextTitle : `Loading next ${entryType.toLowerCase()}`
					 } }
			/>

			<Cta 
				data={ { cta_type: "button",
						 cta_icon: "arrow_right", 
						 cta_style: "bold",
						 cta_text_bold: `View ${entryType.toLowerCase()}`,
						 cta_link: entryType === "Project" ? `/work/${nextSlug}` : `/news/${nextSlug}`
					 } }
			/>
		</article>
	</section>
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
