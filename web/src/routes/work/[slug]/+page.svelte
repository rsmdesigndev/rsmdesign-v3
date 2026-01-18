<script lang="ts">
	import type { PageData } from "./$types";
	import { assetUrl } from "$lib/cms/assets";
	import PageBlocks from "$lib/components/page_builder/page_blocks/index.svelte";
	import PageBlocksV3, { type ProjectData } from "$lib/components/page_builder/page_blocks_v3/index.svelte";
	import NextEntry, { EntryType } from "$lib/components/NextEntry.svelte";
	import SeoHead from "$lib/components/SeoHead.svelte";

	export let data: PageData;

	const projectData: ProjectData = {
		project_title: data.project.project_title,
		project_location_city: data.project.project_location_city.city_name,
		project_location_state: data.project.project_location_city.state_province.state_province_name,
		project_location_country: data.project.project_location_city.country.country_name,
		project_markets: data.project.markets,
		project_services: data.project.services,
		project_client: data.project.project_client,
		project_client_count?: data.project.project_client_count,
		project_developer: data.project.project_developer,
		project_developer_count?: data.project.project_developer_count,
		project_architect: data.project.project_architect,
		project_architect_count?: data.project.project_architect_count,
		project_landscape: data.project.project_landscape,
		project_landscape_count?: data.project.project_landscape_count,
		project_lighting: data.project.project_lighting,
		project_lighting_count?: data.project.project_lighting_count,
		project_fabricator: data.project.project_fabricator,
		project_fabricator_count?: data.project.project_fabricator_count,
		project_painter: data.project.project_painter,
		project_painter_count?: data.project.project_painter_count,
		project_sign_painter: data.project.project_sign_painter,
		project_sign_painter_count?: data.project.project_sign_painter_count,
		project_photographer: data.project.project_photographer,
		project_photographer_count?: data.project.project_photographer_count,
		project_other_collaborators: data.project.project_other_collaborators,
		project_other_collaborators_count?: data.project.project_other_collaborators_count,
	};
</script>

<SeoHead
	title={data.project.project_title ?? ""}
	description={data.project.seo_page_description ?? undefined}
	noindex={data.project.visibility === "draft"}
	slug={`work/${data.project.slug}`}
/>

<template>
	{#if data.project.project_use_page_blocks_v3}
		{#if data.project.project_page_blocks_v3}
			<PageBlocksV3 blocks={data.project.project_page_blocks_v3} {projectData} />
		{:else}
			<div class="container">Page Blocks v3 selected, but no blocks added.</div>
		{/if}
	{:else}
		<figure class="hero">
			{#if data.project.hero_video_id}
				<div class="hero-video">
					<iframe
						title="Video"
						src="https://player.vimeo.com/video/{data.project.hero_video_id}?background=1"
						width="100%"
						height="100%"
						frameborder="0"
						allow="autoplay; fullscreen"
						allowfullscreen
						loading="lazy"
					/>
				</div>
			{:else}
				<img
					src={assetUrl(data.project.hero_image?.filename_disk)}
					alt={data.project.hero_image?.description}
					class={data.project.hero_image_crop_attachment === "left"
						? "position-left"
						: data.project.hero_image_crop_attachment === "center_left"
						? "position-center-left"
						: data.project.hero_image_crop_attachment === "center"
						? ""
						: data.project.hero_image_crop_attachment === "center_right"
						? "position-center-right"
						: data.project.hero_image_crop_attachment === "right"
						? "position-right"
						: ""}
				/>
			{/if}
		</figure>
		<div class="container">
			<article>
				<h2 class="caps">{data.project.location}</h2>
				<h1 class="xxxl">{data.project.project_title}</h1>
				<div>{@html data.project.project_description}</div>
				<div class="lists grid-col-3">
					<div>
						<h3 class="md">Markets</h3>
						<ul>
							{#each data.project?.markets ?? [] as market}
								{#if market?.markets_id}
									<li>
										<a href="/markets/{market?.markets_id?.slug}">{market?.markets_id?.short_name}</a>
									</li>
								{/if}
							{/each}
							{#each data.project?.non_linked_markets ?? [] as market}
								{#if market.name}
									<li>{market.name}</li>
								{/if}
							{/each}
						</ul>
					</div>
					<div>
						<h3 class="md">Services</h3>
						<ul>
							{#each data.project?.services ?? [] as service}
								{#if service?.services_id}
									<li>
										<a href="/services/{service?.services_id?.slug}"
											>{service?.services_id?.short_name}</a
										>
									</li>
								{/if}
							{/each}
							{#each data.project?.non_linked_services ?? [] as service}
								{#if service.name}
									<li>{service.name}</li>
								{/if}
							{/each}
						</ul>
					</div>
					<div>
						{#if data.project.design_awards?.length}
							<h3 class="md">Design Awards</h3>
							<ul>
								{#each data.project.design_awards ?? [] as award}
									{#if award.name}
										<li>{award.name}</li>
									{/if}
								{/each}
							</ul>
						{/if}
						{#if data.project.client?.length}
							<h3 class="md">Client</h3>
							<ul>
								{#each data.project.client ?? [] as client}
									{#if client.name}
										<li>
											{#if client.link}
												<a href={client.link}>{client.name}</a>
											{:else}
												{client.name}
											{/if}
										</li>
									{/if}
								{/each}
							</ul>
						{/if}
					</div>
				</div>
			</article>
		</div>
		{#if data.project.page_content}
			<PageBlocks content={data.project.page_content} project />
		{/if}
		<div class="container">
			{#if data.project.collaborator_new}
				<section class="collaborators">
					<h3 class="md">Collaborators:</h3>
					<p>
						{#each data.project.collaborator_new ?? [] as collaborator, i}
							{#if collaborator.collaborator}
								{#if collaborator.link}
									<a href={collaborator.link}>{collaborator.collaborator}{#if i < data.project.collaborator_new.length - 1},&nbsp;{/if}</a>
								{:else}
									<span>{collaborator.collaborator}{#if i < data.project.collaborator_new.length - 1},&nbsp;{/if}</span>
								{/if}
								
							{/if}
						{/each}
					</p>
				</section>
			{:else if data.project.collaborators}
				<section class="collaborators">
					<h3 class="md">Collaborators:</h3>
					<p>{data.project.collaborators}</p>
				</section>
			{/if}
			<NextEntry project entryType={EntryType.Project} currentSlug={data.project.slug ?? ""} />
		</div>
	{/if}
</template>

<style lang="scss">
	figure.hero {
		margin: 0 0 calc(var(--GRID-CELL) * 6);
		padding: 0;
		z-index: 8;
		grid-column: viewport;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		@media (max-width: 62.5em) {
			height: 133.333vw;
			max-height: 100vh;
			margin-bottom: calc(var(--GRID-CELL) * 3);

			@media (max-height: 133.333vw) {
				height: 100vh;
			}
		}

		display: flex;
		align-items: center;
		justify-content: center;

		> div.hero-video {
			z-index: 8;
			position: relative;
			flex: 0 0 calc(100vh * 16 / 9);
			height: 0;
			padding-bottom: 100vh;

			@media (min-width: 177.777vh) {
				flex-basis: 100vw;
				padding-bottom: calc(100vw * 9 / 16);
			}

			@media (max-width: 62.5em) {
				flex-basis: calc(133.333vw * 16 / 9);
				padding-bottom: 133.333vw;

				@media (max-height: 133.333vw) {
					flex-basis: calc(100vh * 16 / 9);
					padding-bottom: 100vh;
				}

				@media (max-height: 56.25vw) {
					flex-basis: 100vw;
					padding-bottom: calc(100vw * 9 / 16);
				}
			}

			> iframe {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
			}
		}

		> img {
			width: 100%;
			height: 100%;
			object-fit: cover;
			&.position-left {
				object-position: 0% 50%;
			}
			&.position-center-left {
				object-position: 20% 50%;
			}
			&.position-center-right {
				object-position: 80% 50%;
			}
			&.position-right {
				object-position: 100% 50%;
			}
		}
	}

	.container {
		grid-template-columns: var(--GRID-CONTAINER-PROJECTS);
		@media (max-width: 62.5em) {
			column-gap: 0;
		}
	}

	article {
		grid-column: ninth-start 3 / span 5 ninth-end;
		margin: 0 0 calc(var(--GRID-CELL) * 6);

		@media (max-width: 93.75em) {
			grid-column: sixth-start 2 / span 4 sixth-end;
		}
		@media (max-width: 31.25em) {
			grid-column: span 1;
			width: 80%;
			padding-right: 20%;
			margin-bottom: calc(var(--GRID-CELL) * 3);
		}

		display: flex;
		flex-direction: column;

		h1 {
			margin-bottom: 0.333em;
		}
		h2 {
			font-size: var(--FONT-SIZE-MD);
			font-weight: 400;
			margin-bottom: 0.5em;
		}

		.lists {
			margin-top: var(--GRID-CELL);

			@media (max-width: 31.25em) {
				margin-top: calc(var(--GRID-CELL) * 3);
			}

			> div {
				margin-top: calc(var(--GRID-CELL) / 2);
				padding-right: var(--GRID-CELL);
			}

			> div > ul + h3 {
				margin-top: var(--GRID-CELL);
			}

			> div > ul > li {
				line-height: 1.167;
				margin-bottom: 0.333em;
			}
		}
	}

	section.collaborators {
		grid-column: whole;
		display: flex;
		justify-content: flex-start;

		> h3 {
			margin-right: 0.5em;
		}

		a {
			color: var(--COLOR-ORANGE);

			&:hover {
				color: var(--COLOR-ORANGE-HOVER);
			}
		}
	}
</style>
