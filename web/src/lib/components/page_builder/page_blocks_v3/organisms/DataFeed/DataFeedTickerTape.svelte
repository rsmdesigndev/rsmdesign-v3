<script lang="ts">
	import type { ImageAssetRelation } from "$lib/cms";
	import { assetUrl } from "$lib/cms/assets";
	import Card, { type CardData } from "../../molecules/Card.svelte";

	export type dataFeedTickerTapeData = {
		feed_cards?: CardData[] | null;
	};

	export let data: dataFeedTickerTapeData;
</script>

<template>
	
</template>

<style lang="scss">

</style>