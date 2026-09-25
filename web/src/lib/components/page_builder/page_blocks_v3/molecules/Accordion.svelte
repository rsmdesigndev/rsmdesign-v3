<script lang="ts" context="module">
	export type AccordionData = {
		accordion_first_item_open?: boolean | null;
		accordion_heading_size?: string | null;
		accordion_items?: AccordionItem[] | null;
	};

	type AccordionItem = {
		item_heading?: string | null;
		item_rich_text?: string | null;
	};
</script>

<script lang="ts">
	import { onMount } from "svelte";
	import type { BleedData } from "../organisms/CardColumn.svelte";
	import Details, { holdInPlace } from "../atoms/Details.svelte";
	import { MOBILE_QUERY, LOW_TRIGGER_LINE, scrollToLowTriggerLine } from "../scripts/triggerLine";

	export let data: AccordionData;
	export let bleed: BleedData;
	export let scrollDrivenOnMobile: boolean = false;

	// Trigger interaction on scroll
	export let selectedItem: number;

	if (!data.accordion_first_item_open) {
		selectedItem = -1;
	}

	function selectItem(i: number, isOpen: boolean) {
		selectedItem = isOpen ? i : -1;
	}

	// Mobile: only the item on the trigger line is open, and it drives selectedItem
	let accordion: HTMLElement;
	let scrollDriven: boolean = scrollDrivenOnMobile
		&& typeof window !== "undefined"
		&& window.matchMedia(MOBILE_QUERY).matches;
	let openItem: number = selectedItem;

	function handleToggle(i: number, isOpen: boolean) {
		if (scrollDriven) {
			openItem = isOpen ? i : -1;
		} else {
			selectItem(i, isOpen);
		}
	}

	function alignTappedItem(e: MouseEvent) {
		const summary = (e.target as Element).closest("summary");
		if (scrollDriven && summary) scrollToLowTriggerLine(summary);
	}

	onMount(() => {
		if (!scrollDrivenOnMobile) return;

		const mobile = window.matchMedia(MOBILE_QUERY);
		const line = LOW_TRIGGER_LINE * 100;
		const observer = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				const i = [...accordion.children].indexOf(entry.target);
				if (i !== openItem) holdInPlace(entry.target);
				selectedItem = openItem = i;
			}
		}, { rootMargin: `-${line}% 0% -${100 - line}% 0%` });

		// also runs when the viewport crosses the mobile breakpoint
		function update() {
			scrollDriven = mobile.matches;
			openItem = selectedItem;
			observer.disconnect();
			if (scrollDriven) {
				for (const item of accordion.children) observer.observe(item);
			}
		}

		update();
		mobile.addEventListener("change", update);
		accordion.addEventListener("click", alignTappedItem, true);

		return () => {
			mobile.removeEventListener("change", update);
			accordion.removeEventListener("click", alignTappedItem, true);
			observer.disconnect();
		};
	});
</script>

<template>
	<div class="accordion"
		 bind:this={accordion}
		 style:--grid-column-start={bleed.left ? "2" : "1"}
		 style:--grid-column-end={bleed.right ? "-2" : "-1"}
	>
		{#each data.accordion_items as item, i}
			<Details summaryText={item.item_heading}
					 summaryIcon="arrow_down"
					 isAccordionItem
					 headingSize={data.accordion_heading_size}
					 isOpen={(scrollDriven ? openItem : selectedItem) === i}
					 on:toggle={(e) => handleToggle(i, e.detail.isOpen)}
			>
				{@html item.item_rich_text}
			</Details>
		{/each}
	</div>
</template>

<style lang="scss">
	.accordion {
		grid-column: var(--grid-column-start) / var(--grid-column-end);

		display: flex;
		flex-direction: column;
		row-gap: var(--SPACE-MD);
	}
</style>