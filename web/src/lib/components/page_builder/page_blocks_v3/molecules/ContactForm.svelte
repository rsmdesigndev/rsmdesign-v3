<script lang="ts" context="module">
	export type ContactFormData = {
		form?: string | null;
		form_type?: string | null;
	};
</script>

<script lang="ts">
	import { onMount } from "svelte";
	import { loadScript } from "$lib/loadScript";
	import type { BleedData } from "../organisms/CardColumn.svelte";

	export let data: AccordionData;
	export let bleed: BleedData;

	let formString: string = "2e023912-84d4-47b4-868e-022377eceee0";

	if (data.form === "Book") {
		formString = "d6c9df29-b04b-4940-801c-e32db3bcc605";
	}

	onMount(() => {
		let destroyed = false;

		loadScript("https://js.hsforms.net/forms/v2.js").then(() => {
			// The visitor may have navigated away while the script loaded
			if (destroyed) return;
			(globalThis as any).hbspt.forms.create({
				target: ".form-container",
				region: "na1",
				portalId: "8650991",
				formId: formString
			});
		}, (error) => console.warn(error));

		return () => (destroyed = true);
	})
</script>

<template>
	<div class="form-container"
		 style:--grid-column-start={bleed.left ? "2" : "1"}
		 style:--grid-column-end={bleed.right ? "-2" : "-1"}
	>
	</div>
</template>

<style lang="scss">
	.form-container {
		grid-column: var(--grid-column-start) / var(--grid-column-end);
	}
</style>