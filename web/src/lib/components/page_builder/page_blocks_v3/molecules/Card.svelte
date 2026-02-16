<script lang="ts" context="module">
	export type CardData = {
		card_item_spacing?: string | null;
		card_atoms?: ({ item?: CardAtom | null } | null | undefined)[] | null | undefined;
	}

	export type CardAtom =
		| ({ __typename: "page_blocks_v3_atom_blockquote" } & BlockquoteData)
		| ({ __typename: "page_blocks_v3_atom_cta" } 	   	& CtaData)
		| ({ __typename: "page_blocks_v3_atom_heading" } 	& HeadingData)
		| ({ __typename: "page_blocks_v3_atom_media" } 		& MediaData)
		| ({ __typename: "page_blocks_v3_atom_rich_text" } 	& RichTextData)
		| ({ __typename: "page_blocks_v3_atom_spacer" } 	& SpacerData)
		;
</script>

<script lang="ts">
	import type { BleedData } from "../organisms/CardColumn.svelte";
	import Blockquote, { type BlockquoteData } from "../atoms/Blockquote.svelte";
	import Cta, { type CtaData } from "../atoms/Cta.svelte";
	import Heading, { type HeadingData } from "../atoms/Heading.svelte";
	import Media, { type MediaData } from "../atoms/Media/index.svelte";
	import RichText, { type RichTextData } from "../atoms/RichText.svelte";
	import Spacer, { type SpacerData } from "../atoms/Spacer.svelte";
	
	export let data: CardData;
	export let bleed: BleedData;

	let headingHeight: number;
</script>

<template>
	<div class="card"
		 style:--row-gap={`var(--SPACE-${data.card_item_spacing?.toUpperCase()}`}
	>
		{#each data.card_atoms?.map((c) => c?.item) ?? [] as data}
			{#if data?.__typename === "page_blocks_v3_atom_blockquote"}
				<Blockquote {data} {bleed} />
			{:else if data?.__typename === "page_blocks_v3_atom_cta"}
				<Cta {data} {bleed} />
			{:else if data?.__typename === "page_blocks_v3_atom_heading"}
				<Heading {data} {bleed} bind:headingHeight />
			{:else if data?.__typename === "page_blocks_v3_atom_media"}
				<Media {data} />
			{:else if data?.__typename === "page_blocks_v3_atom_rich_text"}
				<RichText {data} {bleed} />
			{:else if data?.__typename === "page_blocks_v3_atom_spacer"}
				<Spacer {data} />
			{:else}
				No card atoms
			{/if}
		{/each}
	</div>
</template>

<style lang="scss">
	div.card {
		grid-column: 1 / -1;
		display: grid;
		grid-template-columns: subgrid;
		row-gap: var(--row-gap);
	}
</style>