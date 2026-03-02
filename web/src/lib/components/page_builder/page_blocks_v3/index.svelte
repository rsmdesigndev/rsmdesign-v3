<script lang="ts" context="module">
	// export types
	export type PageBlockV3 =
		| ({ __typename: "page_blocks_v3_organism_data_feed" } 	& DataFeedData)
		| ({ __typename: "page_blocks_v3_organism_card_row" } 	& CardRowData)
		| ({ __typename: "page_blocks_v3_organism_hero" } 		& HeroData)
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

	export type ProjectData = {
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
	} | null;
</script>

<script lang="ts">
	// import components & types
	import CardRow, { type CardRowData } from "./organisms/CardRow.svelte";
	import DataFeed, { type DataFeedData } from "./organisms/DataFeed/index.svelte";
	import Hero, { type HeroData } from "./organisms/Hero.svelte";


	export let blocks: ({ item?: PageBlockV3 | null } | null | undefined)[] | null | undefined;
	export let projectData: ProjectData | null | undefined = undefined;

	const sectionColorThemes: string[] = blocks?.map((c) => c?.item?.section_color_theme);
</script>

<template>
	{#each blocks?.map((c) => c?.item) ?? [] as data, i}
		{#if data?.__typename === "page_blocks_v3_organism_card_row"}
			<CardRow {data} {projectData} previousTheme={sectionColorThemes[i-1]} rowNumber={i} />
		{:else if data?.__typename === "page_blocks_v3_organism_data_feed"}
			<DataFeed {data} rowNumber={i} />
		{:else if data?.__typename === "page_blocks_v3_organism_hero"}
			<Hero {data} {projectData} project />
		{:else}
			No page content
		{/if}
	{/each}
</template>

<style lang="scss">
	:global {
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
	}
</style>