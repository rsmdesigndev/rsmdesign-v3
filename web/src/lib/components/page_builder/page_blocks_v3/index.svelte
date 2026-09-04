<script lang="ts" context="module">
	// export types
	export type PageBlockV3 =
		| ({ __typename: "page_blocks_v3_organism_data_feed" } 	& DataFeedData)
		| ({ __typename: "page_blocks_v3_organism_card_row" } 	& CardRowData)
		| ({ __typename: "page_blocks_v3_organism_hero" } 		& HeroData)
		| ({ __typename: "about_v3_logos_animation" })
		;

	type Market = {
		markets_id?: {
			slug?: string | null;
			name?: string | null;
			short_name?: string | null;
		} | null;
	}

	type Service = {
		services_id?: {
			slug?: string | null;
			name?: string | null;
			short_name?: string | null;
		} | null;
	}

	type Collaborator = {
		collaborators_id?: {
			collaborator_name?: string | null;
			collaborator_website?: string | null;
		} | null;
	} | null;

	type Person = {
		team_id?: {
			slug?: string | null;
			name?: string | null;
			short_title?: string | null;
		} | null;
	} | null;

	export type NextEntryData = {
		entryType?: "project" | "article" | null;
		slug?: string | null;
		cursor?: string | number | null;
	};

	export type ProjectData = {
		project_slug?: string | null;
		project_title?: string | null;
		project_location_city?: string | null;
		project_location_state?: string | null;
		project_location_country?: string | null;
		project_markets?: Market[] | null;
		project_services?: Service[] | null;
		project_client?: Collaborator[] | null;
		project_client_count?: number | null;
		project_developer?: Collaborator[] | null;
		project_developer_count?: number | null;
		project_architect?: Collaborator[] | null;
		project_architect_count?: number | null;
		project_landscape?: Collaborator[] | null;
		project_landscape_count?: number | null;
		project_lighting?: Collaborator[] | null;
		project_lighting_count?: number | null;
		project_fabricator?: Collaborator[] | null;
		project_fabricator_count?: number | null;
		project_painter?: Collaborator[] | null;
		project_painter_count?: number | null;
		project_sign_painter?: Collaborator[] | null;
		project_sign_painter_count?: number | null;
		project_photographer?: Collaborator[] | null;
		project_photographer_count?: number | null;
		project_other_collaborators?: Collaborator[] | null;
		project_other_collaborators_count?: number | null;
		project_awards?: any | null;
	} | null;

	export type NewsPostData = {
		post_slug?: string | null;
		post_title?: string | null;
		post_authors?: Person[] | null;
	}

	export type ExpertiseData = {
		team_leaders?: Person[] | null;
		sub_services?: any[] | null;
		office_director?: Person | null;
		address?: string | null;
		phone?: string | null;
		email?: string | null;
	}
</script>

<script lang="ts">
	// import components & types
	import CardRow, { type CardRowData } from "./organisms/CardRow.svelte";
	import DataFeed, { type DataFeedData } from "./organisms/DataFeed/index.svelte";
	import NextEntry from "./organisms/NextEntry.svelte";
	import Hero, { type HeroData } from "./organisms/Hero.svelte";
	import BookParallaxAnimation from "./one-off/BookParallaxAnimation.svelte";
	import LogosTickerTape from "./one-off/LogosTickerTape.svelte";

	export let blocks: ({ item?: PageBlockV3 | null } | null | undefined)[] | null | undefined;
	export let projectData: ProjectData | null | undefined = undefined;
	export let nextEntry: NextEntryData | null | undefined = undefined;
	export let expertiseData: ExpertiseData | null | undefined = undefined;

	const sectionColorThemes: string[] = blocks?.map((c) => c?.item?.section_color_theme ?? "light") ?? [];
	const sectionBackgroundColors: string[] = blocks?.map((c) => c?.item?.section_background_color ?? "white") ?? [];

	const entry: NextEntryData | undefined = nextEntry
		?? (projectData ? { entryType: "project", slug: projectData.project_slug } : undefined);

	// add theme for the NextEntry component
	if (entry?.entryType) {
		sectionColorThemes.push("dark");
		sectionBackgroundColors.push("var(--COLOR-BLACK)");
	}

	type Theme = {
		primary: string;
		secondary: string;
		tertiary: string;
		accent: string;
	};

	const themes: Record<string, Theme> = {
		light: {
			primary: "var(--COLOR-BLACK)",
			secondary: "var(--COLOR-MID-GRAY)",
			tertiary: "var(--COLOR-DIM-GRAY)",
			accent: "var(--COLOR-ORANGE)"
		},
		dark: {
			primary: "white",
			secondary: "var(--COLOR-MID-GRAY)",
			tertiary: "var(--COLOR-DIM-GRAY)",
			accent: "var(--COLOR-ORANGE)"
		},
		color: {
			primary: "white",
			secondary: "white",
			tertiary: "var(--COLOR-DIM-GRAY)",
			accent: "var(--COLOR-BLACK)"
		},
		neutral: {
			primary: "white",
			secondary: "var(--COLOR-BLACK)",
			tertiary: "var(--COLOR-DIM-GRAY)",
			accent: "var(--COLOR-BLACK)"
		}
	};

	/*
		Starts on the first section rather than on a hardcoded light theme, so a page
		opening on a dark section is server rendered dark instead of flashing light
		until the first observer callback lands.
	*/
	let currentSection: number = 0;

	$: theme = themes[sectionColorThemes[currentSection]] ?? themes.light;
	$: colorBackground = sectionBackgroundColors[currentSection] ?? "white";

	function changeTheme(i: number) {
		currentSection = i;
	}
</script>

<svelte:head>
	{@html 
		`<style>
			:root {
				--color-primary: ${theme.primary};
				--color-secondary: ${theme.secondary};
				--color-tertiary: ${theme.tertiary};
				--color-accent: ${theme.accent};
				--color-background: ${colorBackground};
			}
		</style>`
	}
</svelte:head>

<template>
	{#each blocks?.map((c) => c?.item) ?? [] as data, i}
		{#if data?.__typename === "page_blocks_v3_organism_card_row"}
			<CardRow 
				{data} 
				{projectData} 
				{expertiseData}
				rowNumber={i} 
				on:selectRow={() => changeTheme(i)}
			/>
		{:else if data?.__typename === "page_blocks_v3_organism_data_feed"}
			<DataFeed 
				{data} 
				rowNumber={i} 
				on:selectFeed={() => changeTheme(i)}
			/>
		{:else if data?.__typename === "page_blocks_v3_organism_hero"}
			<Hero 
				{data} 
				{projectData} 
				on:selectHero={() => changeTheme(i)}
			/>
		{:else if data?.__typename === "about_v3_logos_animation"}
			<LogosTickerTape />
		{:else}
			No page content
		{/if}
	{/each}
	{#if entry?.entryType}
		<NextEntry 
			entryType={entry.entryType}
			currentSlug={entry.slug ?? ""} 
			currentCursor={entry.cursor}
			on:selectComponent={() => changeTheme(sectionColorThemes.length - 1)}
		/>
	{/if}
</template>

<style lang="scss">
	/*:global {
		@property --color-primary {
			syntax: "<color>";
			inherits: true;
			initial-value: var(--COLOR-BLACK);
		}
		@property --color-secondary {
			syntax: "<color>";
			inherits: true;
			initial-value: var(--COLOR-MID-GRAY);
		}
		@property --color-tertiary {
			syntax: "<color>";
			inherits: true;
			initial-value: var(--COLOR-DIM-GRAY);
		}
		@property --color-accent {
			syntax: "<color>";
			inherits: true;
			initial-value: var(--COLOR-ORANGE);
		}

		.color-theme-light {
			--theme-color-primary: var(--COLOR-BLACK);
			--theme-color-secondary: var(--COLOR-MID-GRAY);
			--theme-color-tertiary: var(--COLOR-DIM-GRAY);
			--theme-color-accent: var(--COLOR-ORANGE);
		}
		.color-theme-dark {
			--theme-color-primary: white;
			--theme-color-secondary: var(--COLOR-MID-GRAY);
			--theme-color-tertiary: var(--COLOR-DIM-GRAY);
			--theme-color-accent: var(--COLOR-ORANGE);
		}
		.color-theme-neutral {
			--theme-color-primary: var(--COLOR-BLACK);
			--theme-color-secondary: white;
			--theme-color-tertiary: var(--COLOR-DIM-GRAY);
			--theme-color-accent: var(--COLOR-ORANGE);
		}
		.color-theme-color {
			--theme-color-primary: white;
			--theme-color-secondary: white;
			--theme-color-tertiary: var(--COLOR-DIM-GRAY);
			--theme-color-accent: var(--COLOR-BLACK);
		}
		.previous-color-theme-light {
			--previous-theme-color-primary: var(--COLOR-BLACK);
			--previous-theme-color-secondary: var(--COLOR-MID-GRAY);
			--previous-theme-color-tertiary: var(--COLOR-DIM-GRAY);
			--previous-theme-color-accent: var(--COLOR-ORANGE);
		}
		.previous-color-theme-dark {
			--previous-theme-color-primary: white;
			--previous-theme-color-secondary: var(--COLOR-MID-GRAY);
			--previous-theme-color-tertiary: var(--COLOR-DIM-GRAY);
			--previous-theme-color-accent: var(--COLOR-ORANGE);
		}
		.previous-color-theme-neutral {
			--previous-theme-color-primary: var(--COLOR-BLACK);
			--previous-theme-color-secondary: white;
			--previous-theme-color-tertiary: var(--COLOR-DIM-GRAY);
			--previous-theme-color-accent: var(--COLOR-ORANGE);
		}
		.previous-color-theme-color {
			--previous-theme-color-primary: white;
			--previous-theme-color-secondary: white;
			--previous-theme-color-tertiary: var(--COLOR-DIM-GRAY);
			--previous-theme-color-accent: var(--COLOR-BLACK);
		}
	}*/
</style>