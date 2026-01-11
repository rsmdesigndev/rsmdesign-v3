<script lang="ts" context="module">
	// export types
	export type PageBlockV3 =
		//| ({ __typename: "page_blocks_v3_organism_data_feed" } 	& DataFeedData)
		| ({ __typename: "page_blocks_v3_organism_card_row" } 	   	& CardRowData)
		| ({ __typename: "page_blocks_v3_organism_hero" } 			& HeroData)
		;

	type Collaborator = {
		collaborators_id?: {
			collaborator_name?: string | null;
			collaborator_website?: string | null;
		} | null;
	} | null;

	export type ProjectData = {
		project_client?: Collaborator[];
		project_client_count?: number;
		project_developer?: Collaborator[];
		project_developer_count?: number;
		project_architect?: Collaborator[];
		project_architect_count?: number;
		project_landscape?: Collaborator[];
		project_landscape_count?: number;
		project_lighting?: Collaborator[];
		project_lighting_count?: number;
		project_fabricator?: Collaborator[];
		project_fabricator_count?: number;
		project_painter?: Collaborator[];
		project_painter_count?: number;
		project_sign_painter?: Collaborator[];
		project_sign_painter_count?: number;
		project_photographer?: Collaborator[];
		project_photographer_count?: number;
		project_other_collaborators?: Collaborator[];
		project_other_collaborators_count?: number;
	} | null;
</script>

<script lang="ts">
	// import components & types
	import DataFeed, { type DataFeedData } from "./organisms/DataFeed.svelte";
	import CardRow, { type CardRowData } from "./organisms/CardRow.svelte";
	import Hero, { type HeroData } from "./organisms/Hero.svelte";


	export let blocks: ({ item?: PageBlockV3 | null } | null | undefined)[] | null | undefined;
	export let projectData: ProjectData;
</script>

<template>
	{#each blocks?.map((c) => c?.item) ?? [] as data}
		{#if data?.__typename === "page_blocks_v3_organism_card_carousel"}
			<!--
			<CardCarousel {data} />
			-->
		{:else if data?.__typename === "page_blocks_v3_organism_card_row"}
			<CardRow {data} {projectData} />
		{:else if data?.__typename === "page_blocks_v3_organism_data_feed"}
			<DataFeed {data} />
		{:else if data?.__typename === "page_blocks_v3_organism_hero"}
			<Hero {data} project />
		{:else}
			No page content
		{/if}
	{/each}
</template>

<style lang="scss">
	
</style>