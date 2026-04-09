<script lang="ts">
	import { goto } from '$app/navigation';
	import { assetUrl } from "$lib/cms/assets";
	import { animate, AnimateTrigger } from "$lib/animate";
	import { formatDate } from "$lib/format";
	import Heading from "../../atoms/Heading.svelte";
	
	export type dataFeedTableData = {
		feed_source?: string | null;
		feed_table_style?: string | null;
		feed_table_image_position?: string | null;
		first_filter?: string | null;
	};

	export let data: dataFeedGridData;
	export let feedData: any[];

	//console.log("table style: " + data.feed_table_style);

	let imgHeight: number;
	let innerWidth: number;

	let selectedItem: number;
	let selectOnScroll: boolean = true;

	function selectItemOnMouseover(i: number) {
		if (innerWidth > 1000) {
			selectedItem = i; // only fire on screen width > 62.5em
		}
	}
	function deselectItemOnMouseout() {
		if (innerWidth > 1000) {
			selectedItem = -1; // only fire on screen width > 62.5em
		}
	}
	/*function selectItemOnClick(node: Element, i: number) {
		if (innerWidth > 1000 || selectedItem === i) {
			//goto(node.href);
			console.log("go to item " + i);
		}
		else {
			//node.scrollIntoView({ block: "center", behavior: "smooth" });
			console.log("scroll to item " + i);
		}
	}*/
	function selectItemOnIntersection(node: Element, i: number) {
		const observer = new IntersectionObserver(([entry]) => {
			if (selectOnScroll && entry.isIntersecting) {
				selectedItem = i;
				if (innerWidth > 1000) {
					selectOnScroll = false; // only set to false if screen width < 62.5em
				}
			}
		}, { rootMargin: '-50% 0% -50% 0%' });
		observer.observe(node);
		return {
			destroy() {
				observer.disconnect();
			}
		};
	}
	function deselectItemsOnIntersection(node: Element) {
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				selectedItem = -1;
				selectOnScroll = true;
				console.log("deselect on scroll");
			}
		}, { rootMargin: '-50% 0% -50% 0%' });
		observer.observe(node);
		return {
			destroy() {
				observer.disconnect();
			}
		};
	}
</script>

<svelte:window bind:innerWidth />

<template>
	<div class="deselectionTrigger above"
		 use:deselectItemsOnIntersection
	/>
	{#if data.feed_table_style === "simple" && (data.feed_source === "Projects" || data.feed_source === "Articles")}
		<div class={`table-heading image-position-${data.feed_table_image_position}`}>
			{#if data.first_filter}
				<Heading 
					data={ { heading_type: "section",
							 heading_primary: "large",
							 heading_size: "xxxl",
							 heading_weight: "bold",
							 heading_has_small_text: false,
							 heading_has_large_text: true,
							 heading_has_superscript: false, 
							 heading_large: data.first_filter
						 } }
				/>
			{:else}
				<Heading 
					data={ { heading_type: "section",
							 heading_primary: "large",
							 heading_size: "xxxl",
							 heading_weight: "bold",
							 heading_has_small_text: false,
							 heading_has_large_text: true,
							 heading_has_superscript: false, 
							 heading_large: `Recent ${data.feed_source}`
						 } }
				/>
			{/if}
		</div>
	{/if}
	{#each feedData as item, i}
		<svelte:element 
			this={data.feed_source === "Awards" && item.project_name ? "div" : "a"}
			href={`/${
						data.feed_source === "Articles" ? "news" : 
						(data.feed_source === "Careers" ? "careers" : "work")
				  }/${
						data.feed_source === "Awards" && item.project ? 
							item.project.slug : item.slug
				  }`}
			class={`table-item
					table-style-${data.feed_table_style}
					${data.feed_source === "Studios" ? "table-item-studio" : ""}
					image-position-${data.feed_table_image_position}
				  `}
			class:active={selectedItem === i}
			on:mouseover|preventDefault={() => selectItemOnMouseover(i)}
			on:mouseout={() => deselectItemOnMouseout()}
			use:selectItemOnIntersection={i}
		><!-- TODO: add on:click|preventDefault={selectItemOnClick(i)} -->
			{#if data.feed_table_style === "simple"}
				{#if data.feed_source === "Projects" || data.feed_source === "Articles"}
					<div class="table-item-heading-container">
						{#if data.feed_source === "Projects"}
							{item.location}
						{:else if data.feed_source === "Articles"}
							{item.topics?.[0]?.news_topics_id?.name}
						{/if}
						<strong>
							{#if data.feed_source === "Projects"}
								{item.project_title}
							{:else if data.feed_source === "Articles"}
								{item.post_title}
							{/if}
						</strong>
					</div>
				{:else if data.feed_source === "Studios"}
					<article>
						<a href={`/studios/${item.slug}`}>
							{item.location}
						</a>
						<a href={`/team/${item.studio_contact_person.slug}`}>
							{item.studio_contact_person.name}
						</a>
						<p>
							{@html item.studio_contact_block}
						</p>
					</article>
				{/if}
			{:else}
				<!--
					Projects
						Col1: Project Title / Project Location
						Col2: Studio Location
						Col3: First Market + #
					Articles
						Col1: Post Title
						Col2: Date
						Col3: First Tag + #
					Awards
						Col1: Designation / Category (if applicable)
						Col2: Project Title / Project Location
						Col3: Year
				-->
				<div class="table-item-cols-container">
					<div class="table-item-col1">
						<strong>
							{#if data.feed_source === "Projects"}
								{item.project_title}
							{:else if data.feed_source === "Articles"}
								{item.post_title}
							{:else if data.feed_source === "Awards"}
								{item.award_body_designation}
							{:else if data.feed_source === "Careers"}
								{item.name}
							{/if}
						</strong>
						{#if data.feed_source === "Projects"}
							{item.location}
						{:else if data.feed_source === "Awards" && item.award_category}
							{item.award_category}
						{/if}
					</div>
					<div class="table-item-col2">
						{#if data.feed_source === "Projects"}
							{item.studio_locations?.[0]?.studio_locations_id?.location}
						{:else if data.feed_source === "Articles"}
							{formatDate(item.published_date, { fullMonth: false })}
						{:else if data.feed_source === "Awards"}
							<strong>
								{#if item.project}
									{item.project.project_title}
								{:else if item.project_name}
									{item.project_name}
								{:else}
									No project linked or entered
								{/if}
							</strong>
							{#if item.project}
								{item.project.location}
							{:else if item.project_name}
								{item.project_location}
							{:else}
								No project linked or entered
							{/if}
						{:else if data.feed_source === "Careers"}
							{#each item.studios as studio}
								<span>{studio.studio_locations_id.location}</span>
							{/each}
						{/if}
					</div>
				</div>
				<div class="table-item-col3">
					{#if data.feed_source === "Projects"}
					{:else if data.feed_source === "Articles"}
						{item.topics?.[0]?.news_topics_id?.name}
						{#if item.topics?.length > 1}
							<span title={item.topics.map((topic) => topic.news_topics_id.name).join("\n")}>+&nbsp;{item.topics?.length - 1}</span>
						{/if}
					{:else if data.feed_source === "Awards"}
						{item.year}
					{:else if data.feed_source === "Careers"}
						{item.years_experience} years
					{/if}
				</div>
			{/if}
		</svelte:element >
		<figure class={`table-style-${data.feed_table_style}
						image-position-${data.feed_table_image_position}
					  `}
		>
			{#if data.feed_table_style === "simple"}
				<picture>
					{#if data.feed_source === "Projects"}
						<source media="(min-width: 31.25em)" srcset={assetUrl(item.hero_image?.filename_disk)} />
					{/if}
					<img src={assetUrl(item.grid_image?.filename_disk)}
						 alt={item.grid_image?.title}
					/>
				</picture>
			{:else}
				<div bind:offsetWidth={imgHeight} />
				{#if data.feed_source === "Awards"}
					{#if item.project}
						<img style:--top={`calc(50vh - 1px * ${imgHeight} / 2)`}
							 src={assetUrl(item.project.grid_image?.filename_disk)}
							 alt={item.project.grid_image?.title}
						/>
					{/if}
				{:else}
					<img style:--top={`calc(50vh - 1px * ${imgHeight} / 2)`}
						 src={assetUrl(item.grid_image?.filename_disk)}
						 alt={item.grid_image?.title}
					/>
				{/if}
			{/if}
		</figure>
	{/each}
	<div class="deselectionTrigger below"
		 use:deselectItemsOnIntersection
	/>
</template>

<style lang="scss">
	.deselectionTrigger {
		width: 100%;
		height: 100vh;
		pointer-events: none;
		&.above {
			margin-top: -100vh;
		}
		&.below {
			margin-bottom: -100vh;
		}
	}
	.table-heading {
		//margin-top: var(--SPACE-XXXL);
		margin-bottom: var(--SPACE-MD);
		&.image-position-left,
		&.image-position-center {
			grid-column: eighth-start 6 / eighth-end 8;
			@media (max-width: 62.5em) {
				grid-column: half-start 2 / half-end 2;
			}
			@media (max-width: 31.25em) {
				grid-column: main;
			}
		}
		&.image-position-right {
			grid-column: eighth-start 1 / eighth-end 4;
			@media (max-width: 62.5em) {
				grid-column: half-start 1 / half-end 1;
			}
			@media (max-width: 31.25em) {
				grid-column: main;
			}
		}
	}
	.table-item {
		color: var(--color-tertiary, var(--COLOR-MID-GRAY));

		display: grid;
		grid-template-columns: subgrid;

		@media (max-width: 31.25em) {
			&.table-style-detailed {
				display: flex;
				justify-content: space-between;
			}
		}

		&.active {
			color: var(--color-primary, var(--COLOR-BLACK));

			+ figure > picture,
			+ figure > img {
				opacity: 1;
				transition-delay: 0.15s;
			}
		}

		&.table-style-simple {
			grid-column: viewport;
			padding: var(--SPACE-SM) 0;

			&.table-item-studio {
				grid-column: eighth-start 1 / eighth-end 2;
				@media (max-width: 62.5em) {
					grid-column: half-start 1 / half-end 1;
				}
				@media (max-width: 31.25em) {
					grid-column: main;
				}

				&:nth-of-type(2n) {
					grid-column: eighth-start 3 / eighth-end 4;
					@media (max-width: 62.5em) {
						grid-column: half-start 1 / half-end 1;
					}
					@media (max-width: 31.25em) {
						grid-column: main;
					}
				}

				> article {
					grid-column: 1 / -1;
					> a {
						display: block;

						&:first-child {
							font-weight: 600;
							margin-bottom: 0.5em;
						}
					}
				}
			}

			> .table-item-heading-container {
				font-size: var(--FONT-SIZE-XS);
				text-transform: uppercase;
				letter-spacing: 0.05em;
				> strong {
					display: block;
					font-size: var(--FONT-SIZE-LG);
					font-weight: 700;
					text-transform: none;
					letter-spacing: 0;
				}
			}

			&.image-position-left,
			&.image-position-center {
				> .table-item-heading-container {
					grid-column: eighth-start 6 / eighth-end 8;
					@media (max-width: 62.5em) {
						grid-column: half-start 2 / half-end 2;
					}
					@media (max-width: 31.25em) {
						grid-column: main;
					}
				}
			}
			&.image-position-right {
				> .table-item-heading-container {
					grid-column: eighth-start 1 / eighth-end 4;
					@media (max-width: 62.5em) {
						grid-column: half-start 1 / half-end 1;
					}
					@media (max-width: 31.25em) {
						grid-column: main;
					}
				}
			}
		}

		&.table-style-detailed {
			grid-column: main;
			padding: var(--SPACE-MD) 0;
			//margin-bottom: var(--SPACE-MD);
			border-top: 1px solid var(--color-secondary, var(--COLOR-MID-GRAY));

			&:last-of-type {
				border-bottom: 1px solid var(--color-secondary, var(--COLOR-MID-GRAY));
			}
			
			color: var(--color-secondary, var(--COLOR-MID-GRAY));

			font-size: var(--FONT-SIZE-MD);

			&.active {
				color: var(--color-primary, var(--COLOR-BLACK));
			}

			> .table-item-cols-container {
				display: flex;
				flex-direction: column;
				row-gap: var(--SPACE-SM);

				@media (min-width: 31.25em) {
					display: contents;
				}
			}

			.table-item-col1,
			.table-item-col2,
			> .table-item-col3 {
				display: flex;
				flex-direction: column;
				align-items: space-between;
				justify-content: center;

				@media (max-width: 31.25em) {
					justify-content: flex-start;
				}

				> strong {
					font-weight: 500;
				}
			}

			.table-item-col1 {
				grid-column: sixth-start 1 / sixth-end 2;
				@media (max-width: 62.5em) {
					grid-column: half-start 1 / half-end 1;
				}
				@media (max-width: 31.25em) {
					grid-column: main;
				}
			}

			.table-item-col2 {
				foo: bar;

				@media (max-width: 62.5em) {
					grid-column: half-start 2 / third-end 3;
					grid-row: 1;
				}
				@media (max-width: 31.25em) {
					grid-column: main;

					font-size: var(--FONT-SIZE-XS);
				}
			}

			> .table-item-col3 {
				foo: bar;
				@media (max-width: 62.5em) {
					grid-column: third-start 3 / third-end 3;
					grid-row: 1;
					align-items: flex-end;
				}
				@media (max-width: 31.25em) {
					grid-column: main;
				}

				> span {
					text-decoration: underline;
					text-decoration-style: dotted;
					text-decoration-skip: ink;
				}
			}

			@media (min-width: 62.5em) {
				&.image-position-left,
				&.image-position-center {
					foo: bar;

					.table-item-col2 {
						grid-column: sixth-start 5 / sixth-end 5;
					}
					> .table-item-col3 {
						grid-column: sixth-start 6 / sixth-end 6;
					}
				}
				&.image-position-right {
					foo: bar;

					.table-item-col2 {
						grid-column: eighth-start 4 / eighth-end 5;
					}
					> .table-item-col3 {
						grid-column: eighth-start 6 / eighth-end 6;
					}
				}
			}
		}
	}
	figure {
		z-index: 4;
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		pointer-events: none;

		margin: 0;
		padding: 0;

		display: grid;
		grid-template-columns: var(--GRID-WRAPPER);

		> div {
			height: 0;
		}

		&.table-style-simple > picture,
		&.table-style-detailed > img {
			width: 100%;
			position: sticky;
			top: var(--top);

			object-fit: cover;

			opacity: 0;
			transition: opacity 0.3s ease;
		}

		&.table-style-simple {
			foo: bar;

			> picture {
				top: 0;
				width: 100%;

				@media (min-width: 31.25em) {
					height: 100vh;
				}

				> img {
					max-width: 100%;
					height: 100%;
					//height: 100vh;
					object-fit: cover;
				}
			}

			&.image-position-left > picture,
			&.image-position-center > picture {
				grid-column: viewport-start / eighth-end 4;
				@media (max-width: 62.5em) {
					grid-column: viewport-start / half-end 1;
				}
			}

			&.image-position-right > picture {
				grid-column: eighth-start 5 / viewport-end;
				@media (max-width: 62.5em) {
					grid-column: half-start 2 / viewport-end;
				}
			}

			&.image-position-left > picture,
			&.image-position-center > picture,
			&.image-position-right > picture {
				@media (max-width: 31.25em) {
					grid-column: viewport;
					width: 40%;
					justify-self: end;
				}
			}
		}

		&.table-style-detailed {
			foo: bar; // why is this needed?

			&.image-position-left > img,
			&.image-position-center > img,
			&.image-position-left > div,
			&.image-position-center > div {
				grid-column: eighth-start 4 / eighth-end 5;
			}

			&.image-position-right > img,
			&.image-position-right > div {
				grid-column: eighth-start 7 / eighth-end 8;
			}

			&.image-position-left > img,
			&.image-position-center > img,
			&.image-position-right > img,
			&.image-position-left > div,
			&.image-position-center > div,
			&.image-position-right > div {
				@media (max-width: 62.5em) {
					grid-column: third-start 3 / viewport-end;
				}
				@media (max-width: 31.25em) {
					grid-column: viewport;
					width: 40%;
					justify-self: end;
				}
			}
		}
	}
</style>