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
</script>

<template>
	{#each blocks?.map((c) => c?.item) ?? [] as data}
		{#if data?.__typename === "page_blocks_v3_organism_card_row"}
			<CardRow {data} {projectData} />
		{:else if data?.__typename === "page_blocks_v3_organism_data_feed"}
			<DataFeed {data} />
		{:else if data?.__typename === "page_blocks_v3_organism_hero"}
			<Hero {data} {projectData} project />
		{:else}
			No page content
		{/if}
	{/each}
</template>

<style lang="scss">
	
</style>