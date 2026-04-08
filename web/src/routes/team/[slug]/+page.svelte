<script lang="ts">
	import { assetUrl } from "$lib/cms/assets";
	import { formatDate } from "$lib/format";
	import SeoHead from "$lib/components/SeoHead.svelte";
	import DottedArrow from "$lib/components/DottedArrow.svelte";
	import DottedArrowHover from "$lib/components/DottedArrowHover.svelte";
	import type { PageData } from "./$types";
	import PageBlocksV3, { type ProjectData } from "$lib/components/page_builder/page_blocks_v3/index.svelte";

	export let data: PageData;
</script>

<SeoHead 
	title={data.team.name ?? ""} 
	description={data.team.seo_page_description ?? undefined} 
	noindex={!data.team.has_profile_page || data.team.visibility === "draft"}
/>

<svelte:head>
	<style>
		:root {
			--color-primary: white;
			--color-secondary: var(--COLOR-MID-GRAY);
			--color-tertiary: var(--COLOR-DIM-GRAY);
			--color-accent: var(--COLOR-ORANGE);
			--color-background: var(--COLOR-BLACK);
		}
	</style>
</svelte:head>

<template>
	{#if data.team.team_use_page_blocks_v3}
		{#if data.team.team_page_blocks_v3}
			<PageBlocksV3 blocks={data.team.team_page_blocks_v3} />
		{:else}
			<div class="container">Page Blocks v3 selected, but no blocks added.</div>
		{/if}
	{:else}
		<div class="container">
			<figure class="team-hero">
				<img 
					src={assetUrl(data.team.headshot?.filename_disk)}
					alt={data.team.headshot?.directus_files_id?.description}
				/>
				<img
					src={assetUrl(data.team.featured_image?.filename_disk)}
					alt={data.team.featured_image?.directus_files_id?.description}
				/>
			</figure>

			<section class="team-name">
				<h1 class="xxxl">{data.team.name}</h1>
				<h2 class="md gray">{data.team.full_title}</h2>
			</section>

			{#if data.team.bio}
				<section class="team-description">
					{@html data.team.bio}
				</section>
			{/if}

			<section class="lists">
				{#if data.team.education.length}
					<h3 class="md">Education</h3>
					<ul>
						{#each data.team.education as degree}
							{#if degree.name}
								<li>{degree.name}</li>
							{/if}
						{/each}
					</ul>
				{/if}
				{#if data.team.honors.length}
					<h3 class="md">Honors</h3>
					<ul>
						{#each data.team.honors as honor}
							{#if honor.name}
								<li>{honor.name}</li>
							{/if}
						{/each}
					</ul>
				{/if}
				{#if data.team.speaking_publications_topics.length}
					<h3 class="md">Speaking, publications & abstract topics</h3>
					<ul>
						{#each data.team.speaking_publications_topics as speech}
							<li>{speech.name}</li>
						{/each}
					</ul>
				{/if}
				{#if data.team.expertise.length}
					<h3 class="md">Expertise</h3>
					<ul>
						{#each data.team.expertise as expertise}
							<li>
								{#if expertise.link}
									<a href={expertise.link}>{expertise.name}</a>
								{:else}
									{expertise.name}
								{/if}
							</li>
						{/each}
					</ul>
				{/if}
				<h3 class="md">Contact</h3>
				<ul>
					{#if data.team.contact_phone_1}
						<li>
							<a href={"tel:" + data.team.contact_phone_1}>
								{data.team.contact_phone_1}
								{#if data.team.contact_phone_1_extension}
									x{data.team.contact_phone_1_extension}
								{/if}
							</a>
						</li>
					{/if}
					{#if data.team.contact_phone_2}
						<li>
							<a href={"tel:" + data.team.contact_phone_2}>
								{data.team.contact_phone_2} 
								{#if data.team.contact_phone_2_extension}
									x{data.team.contact_phone_2_extension}
								{/if}
							</a>
						</li>
					{/if}
					<li>
						{#if data.team.hubspot_tracking_url}
							<a href={data.team.hubspot_tracking_url} target="_blank">
								{data.team.contact_email}
							</a>
						{:else}
							<a href="mailto:{data.team.contact_email}" target="_blank">
								{data.team.contact_email}
							</a>
						{/if}
					</li>
					{#if data.team.linkedin_url}
						<li>
							<a href="{data.team.linkedin_url}">
								LinkedIn
							</a>
						</li>
					{/if}
				</ul>
			</section>

			{#if data.team.display_latest_articles}
				<section class="articles-section">
					<h2 class="xxxl">Latest Articles.</h2>
					{#each data.newsPosts as newsPost}
						<a href="/news/{newsPost.slug}">
							<article>
								{#if newsPost.published_date}
									<p>{formatDate(newsPost.published_date)}</p>
								{/if}
								<h3 class="lg">{newsPost.post_title ?? newsPost.slug}</h3>
							</article>
						</a>
					{/each}
					<DottedArrowHover href="/news" text_alignment="right">
						<p>All Articles <DottedArrow /></p>
					</DottedArrowHover>
				</section>
			{/if}

			<section class="work-section">
				<h2 class="xxxl">Recent Work.</h2>
				<div class="grid-col-2">
					{#each data.team.recent_projects ?? [] as project}
						{#if project}
							<a href="/work/{project?.projects_id?.slug}">
								<img
									src={assetUrl(project?.projects_id?.grid_image?.filename_disk)}
									alt={project?.projects_id?.grid_image?.description}
								/>
							</a>
						{/if}
					{/each}
				</div>
			</section>
		</div>
	{/if}
	{#if data.team.hubspot_tracking_scripts}
		{@html data.team.hubspot_tracking_scripts}
	{/if}
</template>

<style lang="scss">
	.container {
		margin-top: calc(var(--HEADER-HEIGHT) + var(--GRID-CELL));

		@media (max-width: 62.5em) {
			grid-template-columns: [whole-start half-start third-start quarter-start
						   sixth-start eighth-start ninth-start twelfth-start]
						   4fr
						  [twelfth-end ninth-end eighth-end sixth-end
						   quarter-end third-end half-end
						   half-start third-start quarter-start
						   sixth-start eighth-start ninth-start twelfth-start]
						   3fr
						  [twelfth-end ninth-end eighth-end sixth-end
						   quarter-end third-end half-end whole-end];
		}
		@media (max-width: 46.875em) {
			grid-template-columns: [whole-start half-start third-start quarter-start
						   sixth-start eighth-start ninth-start twelfth-start]
						   1fr
						  [twelfth-end ninth-end eighth-end sixth-end
						   quarter-end third-end half-end whole-end];
		}

		> figure.team-hero {
			grid-column: whole;
			display: grid;
			grid-template-columns: 1fr 2fr;
			column-gap: calc(var(--GRID-CELL) / 2);

			@media (max-width: 62.5em) {
				grid-column: span 2;
			}
			@media (max-width: 46.875em) {
				grid-column: span 1;
			}

			> img {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}
		}

		> section.team-name {
			grid-column: sixth-start 1 / span 5 sixth-end;

			@media (max-width: 62.5em) {
				grid-column: span 2;
			}
			@media (max-width: 46.875em) {
				grid-column: span 1;
			}

			> h2 {
				margin-top: 1em;
			}
		}

		> section.team-description {
			grid-column: half-start 1 / span 1 half-end;
			margin-bottom: calc(var(--GRID-CELL) * 3);

			@media (max-width: 62.5em) {
				grid-column: span 1;
			}
			@media (max-width: 46.875em) {
				padding-right: 20%;
			}
		}

		> section.lists {
			grid-column: twelfth-start 8 / span 5 twelfth-end;
			margin-bottom: calc(var(--GRID-CELL) * 3);

			@media (max-width: 62.5em) {
				grid-column: span 1;
			}
			@media (max-width: 46.875em) {
				padding-right: 20%;
			}

			li + li {
				margin-top: 0.25em; 
			}

			ul + h3 {
				margin-top: calc(var(--GRID-CELL) * 1.5);
			}
		}

		> section.articles-section {
			grid-column: half-start 1 / span 1 half-end;

			@media (max-width: 62.5em) {
				grid-column: span 1;
			}
			@media (max-width: 46.875em) {
				padding-right: 20%;
			}

			h2 {
				margin-bottom: calc(var(--GRID-CELL) * 2);
			}

			p {
				margin-bottom: 0.333em;
			}

			article {
				padding-bottom: calc(var(--GRID-CELL) / 2);
				margin-bottom: calc(var(--GRID-CELL) * 1.5);
				border-bottom: 2px solid var(--COLOR-MID-GRAY);
			}
		}

		> section.work-section {
			grid-column: twelfth-start 8 / span 5 twelfth-end;

			@media (max-width: 62.5em) {
				grid-column: span 1;
			}
			@media (max-width: 46.875em) {
				padding-right: 20%;
			}

			h2 {
				margin-bottom: calc(var(--GRID-CELL) * 2);
			}

			a {
				position: relative;
				&::after {
					content: "";
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					background-color: transparent;
					transition: background-color 0.3s ease;
				}

				&:hover::after {
					background-color: rgba(255,255,255,0.382);
				}
			}

			img {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}
		}
	}
</style>
