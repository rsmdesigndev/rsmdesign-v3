<script lang="ts" context="module">
	export type CtaListData = {
		cta_list_size?: string | null;
		cta_list_hover_highlight?: string | null;
		cta_list_icon?: string | null;
		cta_list_source?: string | null;
		cta_list_has_heading?: boolean | null;
		cta_list_heading?: string | null;
		cta_list_heading_style?: string | null;
		cta_list_items?: CtaData[];
	}
</script>

<script lang="ts">
	import Cta, { type CtaData } from "../atoms/Cta.svelte";
	import type { ProjectData, ExpertiseData } from "../index.svelte";
	import type { BleedData } from "../organisms/CardColumn.svelte";

	export let data: CtaListData;
	export let projectData: ProjectData | null;
	export let expertiseData: ProjectData | null;
	export let bleed: BleedData | null;

	export let selectedItem: number;
	// TODO: implement item selection data binding

	//console.log(projectData);

	const sizeOverride: string = data.cta_list_size;
	const hoverOverride: string = data.cta_list_hover_highlight;
	const iconOverride: string = data.cta_list_icon;
	const collaboratorCta = {
		cta_type: "link",
		cta_size: "md",
		cta_icon: "none",
		cta_style: "both",
		cta_hover_highlight: "light"
	}
	const personCta = {
		cta_type: "link",
		cta_size: "md",
		cta_icon: "none",
		cta_style: "light",
		cta_hover_highlight: "light"
	}
	const buttonCta = {
		cta_type: "button",
		cta_icon: "arrow_right",
		cta_icon_position: "right"
	}
</script>

<template>
	<div class="cta-list"
		 style:--grid-column-start={bleed.left ? "2" : "1"}
		 style:--grid-column-end={bleed.right ? "-2" : "-1"}
	>
		{#if data.cta_list_source === "manual"}
			{#if data.cta_list_has_heading}
				<h3 class={`heading heading-${data.cta_list_heading_style}`}
					style:--font-size={sizeOverride === "xxxl" ? "var(--FONT-SIZE-XL)" : `var(--FONT-SIZE-${sizeOverride?.toUpperCase()})`}
					style:--font-weight={sizeOverride === "xxxl" ? "500" : "700"}
					style:--line-height={sizeOverride === "lg" ? "1.167" : "1.333"}
				>
					{data.cta_list_heading}
				</h3>
			{/if}
			{#each data.cta_list_items as data}
				<Cta 
					{data} 
					{sizeOverride} 
					{hoverOverride} 
					{iconOverride} 
				/>
			{/each}
		{:else if data.cta_list_source === "expertise"}
			{#if expertiseData.team_leaders}
				<article>
					<h3 class={`heading heading-caps`}
						style:--font-size="var(--FONT-SIZE-MD)"
						style:--font-weight="700"
						style:--line-height="1.333"
					>
						Team leaders
					</h3>
					{#each expertiseData.team_leaders as team}
						<Cta data={ {...personCta, 
									 cta_text_light: team.team_id.name,
									 cta_link: `/team/${team.team_id.slug}`} 
								  }
							 {sizeOverride}
							 {hoverOverride}
							 {iconOverride}
						/>
					{/each}
				</article>
			{/if}
			{#if expertiseData.sub_services}
				<article>
					<h3 class={`heading heading-caps`}
						style:--font-size="var(--FONT-SIZE-MD)"
						style:--font-weight="700"
						style:--line-height="1.333"
					>
						Sub-services
					</h3>
					{#each expertiseData.sub_services as item}
						<Cta data={ {...personCta, 
									 cta_text_light: item.name,
									 cta_link: item.link ? item.link : ""
								  } }
							 {sizeOverride}
							 {hoverOverride}
							 {iconOverride}
						/>
					{/each}
				</article>
			{/if}
			{#if expertiseData}
				<Cta data={ {...buttonCta,
							 cta_text_bold: "Project inquiry",
							 cta_link: "/contact"
						  } }
				/>
			{/if}
		{:else}
			<article>
				<h3 class={`heading heading-caps`}
					style:--font-size="var(--FONT-SIZE-MD)"
					style:--font-weight="700"
					style:--line-height="1.333"
				>
					Project info
				</h3>
				{#if projectData.project_client_count > 0}
					{#each projectData.project_client.slice(0, projectData.project_client_count) as collaborator}
						<Cta data={ {...collaboratorCta, 
									 cta_text_bold: "Client", 
									 cta_text_light: collaborator.collaborators_id.collaborator_name,
									 cta_link: collaborator.collaborators_id.collaborator_website} 
								  }
							 {sizeOverride}
							 {hoverOverride}
							 {iconOverride}
						/>
					{/each}
				{/if}
				{#if projectData.project_developer_count > 0}
					{#each projectData.project_developer.slice(0, projectData.project_developer_count) as collaborator}
						<Cta data={ {...collaboratorCta, 
									 cta_text_bold: "Developer", 
									 cta_text_light: collaborator.collaborators_id.collaborator_name,
									 cta_link: collaborator.collaborators_id.collaborator_website} 
								  }
							 {sizeOverride}
							 {hoverOverride}
							 {iconOverride}
						/>
					{/each}
				{/if}
				{#if projectData.project_architect_count > 0}
					{#each projectData.project_architect.slice(0, projectData.project_architect_count) as collaborator}
						<Cta data={ {...collaboratorCta, 
									 cta_text_bold: "Architect", 
									 cta_text_light: collaborator.collaborators_id.collaborator_name,
									 cta_link: collaborator.collaborators_id.collaborator_website} 
								  }
							 {sizeOverride}
							 {hoverOverride}
							 {iconOverride}
						/>
					{/each}
				{/if}
				{#if projectData.project_landscape_count > 0}
					{#each projectData.project_landscape.slice(0, projectData.project_landscape_count) as collaborator}
						<Cta data={ {...collaboratorCta, 
									 cta_text_bold: "Landscape", 
									 cta_text_light: collaborator.collaborators_id.collaborator_name,
									 cta_link: collaborator.collaborators_id.collaborator_website} 
								  }
							 {sizeOverride}
							 {hoverOverride}
							 {iconOverride}
						/>
					{/each}
				{/if}
				{#if projectData.project_lighting_count > 0}
					{#each projectData.project_lighting.slice(0, projectData.project_lighting_count) as collaborator}
						<Cta data={ {...collaboratorCta, 
									 cta_text_bold: "Lighting", 
									 cta_text_light: collaborator.collaborators_id.collaborator_name,
									 cta_link: collaborator.collaborators_id.collaborator_website} 
								  }
							 {sizeOverride}
							 {hoverOverride}
							 {iconOverride}
						/>
					{/each}
				{/if}
				{#if projectData.project_fabricator_count > 0}
					{#each projectData.project_fabricator.slice(0, projectData.project_fabricator_count) as collaborator}
						<Cta data={ {...collaboratorCta, 
									 cta_text_bold: "Fabricator", 
									 cta_text_light: collaborator.collaborators_id.collaborator_name,
									 cta_link: collaborator.collaborators_id.collaborator_website} 
								  }
							 {sizeOverride}
							 {hoverOverride}
							 {iconOverride}
						/>
					{/each}
				{/if}
				{#if projectData.project_painter_count > 0}
					{#each projectData.project_painter.slice(0, projectData.project_painter_count) as collaborator}
						<Cta data={ {...collaboratorCta, 
									 cta_text_bold: "Painter", 
									 cta_text_light: collaborator.collaborators_id.collaborator_name,
									 cta_link: collaborator.collaborators_id.collaborator_website} 
								  }
							 {sizeOverride}
							 {hoverOverride}
							 {iconOverride}
						/>
					{/each}
				{/if}
				{#if projectData.project_sign_painter_count > 0}
					{#each projectData.project_sign_painter.slice(0, projectData.project_sign_painter_count) as collaborator}
						<Cta data={ {...collaboratorCta, 
									 cta_text_bold: "Sign Painter", 
									 cta_text_light: collaborator.collaborators_id.collaborator_name,
									 cta_link: collaborator.collaborators_id.collaborator_website} 
								  }
							 {sizeOverride}
							 {hoverOverride}
							 {iconOverride}
						/>
					{/each}
				{/if}
				{#if projectData.project_photographer_count > 0}
					{#each projectData.project_photographer.slice(0, projectData.project_photographer_count) as collaborator}
						<Cta data={ {...collaboratorCta, 
									 cta_text_bold: "Photographer", 
									 cta_text_light: collaborator.collaborators_id.collaborator_name,
									 cta_link: collaborator.collaborators_id.collaborator_website} 
								  }
							 {sizeOverride}
							 {hoverOverride}
							 {iconOverride}
						/>
					{/each}
				{/if}
				{#if projectData.project_other_collaborators_count > 0}
					{#each projectData.project_other_collaborators.slice(0, projectData.project_other_collaborators_count) as collaborator}
						<Cta data={ {...collaboratorCta, 
									 cta_text_bold: "Other", 
									 cta_text_light: collaborator.collaborators_id.collaborator_name,
									 cta_link: collaborator.collaborators_id.collaborator_website} 
								  }
							 {sizeOverride}
							 {hoverOverride}
							 {iconOverride}
						/>
					{/each}
				{/if}
			</article>
			{#if projectData.project_services?.length > 2}
				<article>
					<h3 class={`heading heading-caps`}
						style:--font-size="var(--FONT-SIZE-MD)"
						style:--font-weight="700"
						style:--line-height="1.333"
					>
						Additional services
					</h3>
					{#each projectData.project_services?.slice(2) as service}
						<Cta data={ {...collaboratorCta, 
									 cta_text_light: service.services_id.name,
									 cta_link: `/services/${service.services_id.slug}`
								  } }
							 {sizeOverride}
							 {hoverOverride}
							 {iconOverride}
						/>
					{/each}
				</article>
			{/if}
			{#if projectData.project_markets?.length > 2}
				<article>
					<h3 class={`heading heading-caps`}
						style:--font-size="var(--FONT-SIZE-MD)"
						style:--font-weight="700"
						style:--line-height="1.333"
					>
						Additional markets
					</h3>
					{#each projectData.project_markets?.slice(2) as market}
						<Cta data={ {...collaboratorCta, 
									 cta_text_light: market.markets_id.name,
									 cta_link: `/markets/${market.markets_id.slug}`
								  } }
							 {sizeOverride}
							 {hoverOverride}
							 {iconOverride}
						/>
					{/each}
				</article>
			{/if}
		{/if}
	</div>
</template>

<style lang="scss">
	.cta-list {
		grid-column: var(--grid-column-start) / var(--grid-column-end);
		display: flex;
		flex-direction: column;
		row-gap: var(--SPACE-MD);

		color: var(--color-primary, inherit);

		> article {
			//margin-bottom: var(--SPACE-MD);
			display: flex;
			flex-direction: column;
			row-gap: 0.5em;

			h3.heading {
				margin-bottom: 0;

				font-size: var(--font-size);
				font-weight: var(--font-weight);
				line-height: var(--line-height);

				&.heading-caps {
					text-transform: uppercase;
					letter-spacing: 0.05em;
				}
			}
		}
	}
</style>