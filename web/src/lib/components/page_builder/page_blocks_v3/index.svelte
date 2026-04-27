<script lang="ts" context="module">
	// export types
	export type PageBlockV3 =
		| ({ __typename: "page_blocks_v3_organism_data_feed" } 	& DataFeedData)
		| ({ __typename: "page_blocks_v3_organism_card_row" } 	& CardRowData)
		| ({ __typename: "page_blocks_v3_organism_hero" } 		& HeroData)
		| ({ __typename: "homepage_v3_book_animation" })
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
	}
</script>

<script lang="ts">
	// import components & types
	import CardRow, { type CardRowData } from "./organisms/CardRow.svelte";
	import DataFeed, { type DataFeedData } from "./organisms/DataFeed/index.svelte";
	import NextEntry, { EntryType } from "./organisms/NextEntry.svelte";
	import Hero, { type HeroData } from "./organisms/Hero.svelte";
	import BookParallaxAnimation from "./one-off/BookParallaxAnimation.svelte";
	import LogosTickerTape from "./one-off/LogosTickerTape.svelte";

	export let blocks: ({ item?: PageBlockV3 | null } | null | undefined)[] | null | undefined;
	export let projectData: ProjectData | null | undefined = undefined;
	export let expertiseData: ExpertiseData | null | undefined = undefined;

	const sectionColorThemes: string[] = blocks?.map((c) => c?.item?.section_color_theme ?? "light");
	const sectionBackgroundColors: string[] = blocks?.map((c) => c?.item?.section_background_color ?? "white");

	// add theme for NextEntry component on Projects
	if (projectData) {
		sectionColorThemes.push("dark");
		sectionBackgroundColors.push("var(--COLOR-BLACK)");
	}

	let colorPrimary: string = "var(--COLOR-BLACK)";
	let colorSecondary: string = "var(--COLOR-MID-GRAY)";
	let colorTertiary: string = "var(--COLOR-DIM-GRAY)";
	let colorAccent: string = "var(--COLOR-ORANGE)";
	let colorBackground: string = "white";

	function changeTheme(i: number) {
		colorBackground = sectionBackgroundColors[i];
		switch (sectionColorThemes[i]) {
			case "light":
				colorPrimary = "var(--COLOR-BLACK)";
				colorSecondary = "var(--COLOR-MID-GRAY)";
				colorTertiary = "var(--COLOR-DIM-GRAY)";
				colorAccent = "var(--COLOR-ORANGE)";
				break;
			case "dark":
				colorPrimary = "white";
				colorSecondary = "var(--COLOR-MID-GRAY)";
				colorTertiary = "var(--COLOR-DIM-GRAY)";
				colorAccent = "var(--COLOR-ORANGE)";
				break;
			case "color":
				colorPrimary = "white";
				colorSecondary = "white";
				colorTertiary = "var(--COLOR-DIM-GRAY)";
				colorAccent = "var(--COLOR-BLACK)";
				break;
			case "neutral":
				colorPrimary = "white";
				colorSecondary = "var(--COLOR-BLACK)";
				colorTertiary = "var(--COLOR-DIM-GRAY)";
				colorAccent = "var(--COLOR-BLACK)";
				break;
		}
	}
</script>

<svelte:head>
	{@html 
		`<style>
			:root {
				--color-primary: ${colorPrimary};
				--color-secondary: ${colorSecondary};
				--color-tertiary: ${colorTertiary};
				--color-accent: ${colorAccent};
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
		{:else if data?.__typename === "homepage_v3_book_animation"}
			<BookParallaxAnimation />
		{:else if data?.__typename === "about_v3_logos_animation"}
			<LogosTickerTape />
		{:else}
			No page content
		{/if}
	{/each}
	{#if projectData}
		<NextEntry 
			entryType={EntryType.Project} 
			currentSlug={projectData.project_slug ?? ""} 
			on:selectComponent={() => changeTheme(blocks.length)}
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