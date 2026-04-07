<script lang="ts">
	import { assetUrl } from "$lib/cms/assets";
	import SeoHead from "$lib/components/SeoHead.svelte";
	import Section from "$lib/components/Section.svelte";
	import TeamGrid from "$lib/components/TeamGrid.svelte";
	import DottedArrow from "$lib/components/DottedArrow.svelte";
	import DottedArrowHover from "$lib/components/DottedArrowHover.svelte";
	import type { PageData } from "./$types";
	import PageBlocksV3 from "$lib/components/page_builder/page_blocks_v3/index.svelte";

	export let data: PageData;
</script>

<SeoHead
	title={data.team_page?.seo_title}
	description={data.team_page?.seo_page_description}
/>

<svelte:head>
	<style>
		:root {
			--bg-color: var(--COLOR-BLACK);
			--bg-scrim: none;
			--text-color: white;
		}
	</style>
</svelte:head>

<template>
	{#if data.team_page?.team_use_page_blocks_v3}
		{#if data.team_page.team_page_blocks_v3}
			<PageBlocksV3 blocks={data.team_page.team_page_blocks_v3} />
		{:else}
			<div class="container">Page Blocks v3 selected, but no blocks added.</div>
		{/if}
	{:else}
		<div class="container team-container">
			<Section
				teamGrid
				span_columns=1
				col_units="whole"
				col_start=1
				span_rows=1
			>
				<TeamGrid teamMembers={data.team.filter((member) => !!member.banner_grid_image_color)} />
			</Section>

			<Section
				header
				span_columns=5
				col_units="sixth"
				col_start=1
				span_rows=1
			>
				<h1 class="md">Team</h1>
				<h2 class="xxxl">Fearlessly authentic.</h2>
			</Section>

			<Section
				richText
				span_columns=1
				col_units="half"
				col_start=1
				span_rows=1
			>
				<p>The studio is a passionate team of designers from diverse creative backgrounds including graphic design, architecture, interior design, industrial design, and branding. Our design studio is dedicated to innovation where intellectual questioning and creative debate are encouraged. Challenging ourselves to discover each project’s unique spirit, we create narratives for places that engage people with their environment.</p>
			</Section>

			<section class="team grid-col-4">
				{#each data.team.sort((a, b) => a.sort_priority - b.sort_priority) as member}
					{#if member.has_profile_page}
						<a href="/team/{member.slug}">
							<figure>
								<img src={assetUrl(member.headshot?.filename_disk)} alt={member.headshot?.description} />
								<figcaption>
									<h3 class="sm">{member.name}</h3>
									{#if member.short_title}
										<p class="sm">{member.short_title}</p>
									{/if}
								</figcaption>
							</figure>
						</a>
					{:else}
						<figure>
							<img src={assetUrl(member.headshot?.filename_disk)} alt={member.headshot?.description} />
							<figcaption>
								<h3 class="sm">{member.name}</h3>
								{#if member.short_title}
									<p class="sm">{member.short_title}</p>
								{/if}
							</figcaption>
						</figure>
					{/if}
				{/each}
			</section>
			<section class="cta-section">
				<DottedArrowHover href="/careers">
					<h4 class="xxxl heading">Join our team.</h4>
					<p>Current Openings <DottedArrow /></p>
				</DottedArrowHover>
			</section>
		</div>
	{/if}
</template>

<style lang="scss">
	.team-container {
		:global {
			section.teamGrid + section.header {
				margin-top: calc(var(--GRID-CELL) * 3);
			}
		}
	}
	.team {
		margin-top: calc(var(--GRID-CELL) * 2);
		grid-column: whole;

		figure {
			margin: 0;
			padding: 0;

			> img {
				width: 100%;
				height: auto;
				aspect-ratio: 5 / 4;
				object-fit: cover;
				object-position: center top;
				margin-bottom: 0.5rem;
				transition: opacity 0.2s ease;
			}

			> figcaption {
				transition: opacity 0.2s ease;
				h3 {
					margin: 0;
				}
			}
		}

		> a {
			color: inherit;
			text-decoration: none;

			&:hover {
				> figure {
					> img {
						opacity: 0.9;
					}
					> figcaption {
						opacity: 0.618;

						> p {
							color: inherit;
						}
					}
				}
			}
		}
	}
	section.cta-section {
		grid-column: whole;
		margin-top: calc(var(--GRID-CELL) * 3);
	}
</style>
