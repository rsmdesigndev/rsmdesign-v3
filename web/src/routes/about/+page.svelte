<script lang="ts">
	import { assetUrl } from "$lib/cms/assets";
	import { fade } from "svelte/transition";
	import type { PageData } from "./$types";
	import SeoHead from "$lib/components/SeoHead.svelte";
	import Section from "$lib/components/Section.svelte";
	import TeamGrid from "$lib/components/TeamGrid.svelte";
	import DottedArrow from "$lib/components/DottedArrow.svelte";
	import DottedArrowHover from "$lib/components/DottedArrowHover.svelte";
	import PageBlocks from "$lib/components/page_builder/page_blocks/index.svelte";
	import PageBlocksV3 from "$lib/components/page_builder/page_blocks_v3/index.svelte";
	
	export let data: PageData;

	console.log(data.about.about_page_blocks_v3);

	let testimonialIndex = 0;
	$: currentTestimonial = data.testimonials[testimonialIndex];

	function nextTestimonial() {
		testimonialIndex += 1;
		if (testimonialIndex > data.testimonials.length - 1) {
			testimonialIndex = 0;
		}
	}

	function previousTestimonial() {
		testimonialIndex -= 1;
		if (testimonialIndex < 0) {
			testimonialIndex = data.testimonials.length - 1;
		}
	}
</script>

<SeoHead
	title="About Us"
	description="We are a passionate team of designers, architects, and storytellers working at the intersection of graphics and architecture. Learn about us."
/>

<svelte:head>
	{#each data.testimonials as testimonial}
		{#if testimonial.banner_image}
			<link rel="preload" as="image" href={assetUrl(testimonial.banner_image.filename_disk)} />
		{/if}
	{/each}
</svelte:head>

{#if data.about.about_use_page_blocks_v3}
	{#if data.about.about_page_blocks_v3}
		<PageBlocksV3 blocks={data.about.about_page_blocks_v3} />
	{:else}
		<div class="container">Page Blocks v3 selected, but no blocks added.</div>
	{/if}
{:else if data.about.use_page_blocks}
	<PageBlocks content={data.about.page_content} />
{:else}
	<template>
		<div class="container">
			<Section header order={2} span_columns={2} col_units="third" col_start={1} span_rows={1}>
				<h1 class="md gray">About us</h1>
				<h2 class="xxxl">Principle Centered Design.</h2>
			</Section>
			<Section richText order={4} span_columns={1} col_units="half" col_start={1} span_rows={1}>
				<p>
					For over 25 years the multi-disciplinary team at RSM Design has created award-winning
					graphic connections with architecture. Our studios have collaborated with some of the
					world’s most noted architects, developers, and institutions to seamlessly combine branding,
					wayfinding, art, and graphics into the built environment. The designs span the spectrums of
					locations, scales, project types, and cultures to create unique experiences through the lens
					of environmental graphics. RSM Design is a certified <a href="/rsm/wbe-design-studio"
						>Women Business Enterprise (WBE)</a
					> and is certified nationally by the National Women Business Owners Corporation.
				</p>
				<DottedArrowHover href="/news/principle-centered-design" text_alignment="right">
					<p>Design Principles <DottedArrow /></p>
				</DottedArrowHover>
			</Section>
			<Section images order={6} span_columns={1} col_units="third" col_start={3} span_rows={2}>
				<figure class="about-image-container">
					<img
						src="/img/about/About-Img-SC-Studio.jpg"
						alt="RSM Design team members work collaboratively with color samples."
					/>
					<figcaption>San Clemente Studio</figcaption>
				</figure>
			</Section>
			<Section header order={8} span_columns={2} col_units="third" col_start={1} span_rows={1}>
				<h2 class="xxxl">Meet Our Team.</h2>
			</Section>
			<Section teamGrid order={10} span_columns={1} col_units="whole" col_start={1} span_rows={1}>
				<TeamGrid teamMembers={data.team.filter((member) => !!member.banner_grid_image_color)} link />
			</Section>
			<Section cta order={12} span_columns={1} col_units="whole" col_start={1} span_rows={1}>
				<DottedArrowHover href="/team" text_alignment="right">
					<p>Meet Our Team <DottedArrow /></p>
				</DottedArrowHover>
			</Section>
			<Section header order={14} span_columns={2} col_units="third" col_start={1} span_rows={1}>
				<h2 class="xxxl">Decades of Design.</h2>
			</Section>
			<Section richText order={16} span_columns={1} col_units="half" col_start={1} span_rows={1}>
				<p>
					Working out of their garage apartment, Suzanne and Martin began the San Clemente studio in
					1997 with one project from Walt Disney Imagineering. A nice project to begin with, but one
					that rapidly needed additional team members. Joined shortly by Harry, Stephanie and Cody,
					the team quickly grew in its collaborative spirit. That collaboration formally established
					Redmond Schwartz Mark Design in 1999 by merging with Harry’s architectural practice in
					Dallas… beginning two decades of working at the intersection of graphics and architecture.
				</p>

				<p>
					In 1999, the studio moved out of the garage apartment and purchased the San Clemente design
					studio. This location was the first building designed by Korean architect Richard Y. Lim, a
					protege of Frank Lloyd Wright. Lim’s wife worked as a seamstress for the Wright family to
					pay for the internship at Taliesin West. Built in 1948, the structure was the first
					modernist building in San Clemente.
				</p>
				<DottedArrowHover href="https://rsm-dev.webflow.io/our-story" text_alignment="right">
					<p>Our Story <DottedArrow /></p>
				</DottedArrowHover>
			</Section>
			<Section images order={18} span_columns={1} col_units="third" col_start={3} span_rows={2}>
				<figure class="about-image-container 2">
					<img
						src="/img/about/SuzMartinHarry-Img-Decades.jpg"
						alt="RSM Design’s three founding members: (from left to right) Suzanne, Martin, and Harry. "
					/>
				</figure>
			</Section>
			<Section header order={20} span_columns={2} col_units="third" col_start={1} span_rows={1}>
				<h2 class="xxxl">Clients & Collaborators.</h2>
			</Section>
			<section class="collaborator-logos grid-col-5" style="order: 22;">
				<img
					class="max-width-40"
					src="/img/about/collaborators/c01_RSM-Design_Collaborators_BIG-Logo.png"
					alt="BIG logo"
				/>
				<img
					class="max-width-50"
					src="/img/about/collaborators/c02_RSM-Design_Collaborators_Related-Logo-p-500.png"
					alt="Related logo"
				/>
				<img
					class="max-width-30"
					src="/img/about/collaborators/c03_RSM-Design_Collaborators_DS+R-Logo-p-500.png"
					alt="DS+R logo"
				/>
				<img
					class="max-width-50"
					src="/img/about/collaborators/c04_RSM-Design_Collaborators_OLIN-Logo-p-500.png"
					alt="OLIN logo"
				/>
				<img
					class="max-width-36"
					src="/img/about/collaborators/c05_RSM-Design_Collaborators_The-Star-Logo.svg"
					alt="The Star logo"
				/>
				<img
					class="max-width-50"
					src="/img/about/collaborators/c06_RSM-Design_Collaborators_Studio-MLA-Logo.png"
					alt="Studio MLA logo"
				/>
				<img
					class="max-width-40"
					src="/img/about/collaborators/c07_RSM-Design_Collaborators_OJB_Logo-p-500.png"
					alt="OJB logo"
				/>
				<img
					class="max-width-50"
					src="/img/about/collaborators/c08_RSM-Design_Collaborators_PGA-Logo.svg"
					alt="logo"
				/>
				<img
					class="max-width-50"
					src="/img/about/collaborators/c09_RSM-Design_Collaborators_One&Only-Logo.svg"
					alt="One&Only logo"
				/>
				<img
					class="max-width-50"
					src="/img/about/collaborators/c10_RSM-Design_Collaborators_OMA-Logo.png"
					alt="OMA logo"
				/>
			</section>
			<section class="collaborator-list grid-col-4" style="order: 24;">
				<div>
					<h3 class="xl">Corporate <br />& Workplace</h3>
					<ul>
						<li>Alexandria Real Estate</li>
						<li>Chemonics International</li>
						<li>Crow Family Holdings</li>
						<li>Hillwood</li>
						<li>Hines</li>
						<li>Irvine Company</li>
						<li>Ivanhóe Cambridge</li>
						<li>Pizza Hut / Yum International</li>
						<li>Rosewood Property Company</li>
						<li>State Farm Insurance</li>
					</ul>
					<h3 class="xl">Retail & Entertainment</h3>
					<ul>
						<li>Aldar Properties</li>
						<li>Brookfield Properties</li>
						<li>Caruso Affiliated</li>
						<li>Dacra Development</li>
						<li>Dallas Cowboys</li>
						<li>Emaar Development</li>
						<li>The Festival Companies</li>
						<li>L Catterton Read Estate</li>
						<li>Macerich</li>
						<li>Madison Marquette</li>
						<li>Majid Al Futtaim Group</li>
						<li>National Geographic Encounter</li>
						<li>Nike</li>
						<li>Portafolio Inmobiliario</li>
						<li>The Related Group</li>
						<li>Seritage Growth Properties</li>
						<li>Simon Property Group</li>
						<li>Sonae Sierra</li>
						<li>Taubman</li>
						<li>Triple Five</li>
						<li>Unibail-Rodamco-Westfield</li>
						<li>Walt Disney Imagineering</li>
					</ul>
				</div>
				<div>
					<h3 class="xl">Arts <br />& Culture</h3>
					<ul>
						<li>American Institute of Architects</li>
						<li>Balboa Park Conservancy</li>
						<li>Boy Scouts of America</li>
						<li>Buddy Holly Performing Arts</li>
						<li>Crow Collection of Asian Arts</li>
						<li>Dallas Holocaust and Human Rights Museum</li>
						<li>El Paso Children’s Museum</li>
						<li>Fort Worth Stockyards National Historic District</li>
						<li>Jewish Federation of Greater Los Angeles</li>
						<li>Museo Miraflores</li>
						<li>National Trust for Historic Preservation</li>
					</ul>
					<h3 class="xl">Hospitality</h3>
					<ul>
						<li>Aman Resorts</li>
						<li>Andaz Hotels by Hyatt</li>
						<li>Caesars Palace Entertainment</li>
						<li>Fairmont Hotels & Resorts</li>
						<li>Hyatt Corporation</li>
						<li>Intercontinental Hotels</li>
						<li>Jackson Hole Mountain Resort</li>
						<li>Omni Hotels & Resorts</li>
						<li>One & Only Resorts</li>
						<li>Ritz Carlton Resorts</li>
						<li>Royal Caribbean Cruises</li>
						<li>St. Regis Hotels</li>
						<li>The Venetian Resort Hotel Casino</li>
						<li>Viceroy Hotels & Resorts</li>
						<li>Virgin Hotels</li>
						<li>Walt Disney Hospitality</li>
					</ul>
					<h3 class="xl">Healthcare</h3>
					<ul>
						<li>Baylor Scott & White</li>
						<li>Dugoni School of Dentistry</li>
						<li>Kaiser Permanente</li>
						<li>Memorial Hermann Health System</li>
						<li>Parkland Memorial Hospital</li>
						<li>St. Joseph Healthcare</li>
						<li>Texas Medical Center</li>
					</ul>
				</div>
				<div>
					<h3 class="xl">Architecture <br />& Landscape</h3>
					<ul>
						<li>Arquitectonica</li>
						<li>Beyer Blinder Belle</li>
						<li>Belzberg Architects</li>
						<li>Benoy</li>
						<li>Bjarke Ingels Group (BIG)</li>
						<li>Diamond Schmitt Architects</li>
						<li>Diller Scofidio + Renfro</li>
						<li>Elkus Manfredi Architects</li>
						<li>Gensler</li>
						<li>Jerde</li>
						<li>Lake Flato Architects</li>
						<li>NBBJ</li>
						<li>Nelson Byrd Woltz</li>
						<li>OLIN</li>
						<li>Olson Kundig Architects</li>
						<li>OMA</li>
						<li>Safdie Rabines Architects</li>
						<li>Skidmore, Ownings & Merrill (SOM)</li>
						<li>Snøhetta</li>
						<li>SWA Group</li>
					</ul>
					<h3 class="xl">Institutional <br />& Civic</h3>
					<ul>
						<li>City of Aspen, CO</li>
						<li>City of Beverly Hills, CA</li>
						<li>City of Dallas, TX</li>
						<li>City of Honolulu, HI</li>
						<li>City of Huntington Beach, CA</li>
						<li>City of Las Vegas, NV</li>
						<li>City of Los Angeles, CA</li>
						<li>City of Miami, FL</li>
						<li>City of Newport Beach, CA</li>
						<li>City of San Diego, CA</li>
						<li>County of Los Angeles</li>
						<li>Kamehameha School District</li>
						<li>Lili’uokalani Trust</li>
						<li>Los Angeles Metro</li>
						<li>Miami Downtown Development Authority</li>
					</ul>
				</div>
				<div class="hidden-tablet">
					<h3 class="xl">Residential & Multi-Family</h3>
					<ul>
						<li>Brookfield Residential</li>
						<li>Crescent Communities</li>
						<li>Emaar MISR</li>
						<li>Five Point Communities</li>
						<li>Hillwood Communities</li>
						<li>Hines</li>
						<li>Lennar</li>
						<li>Post Properties</li>
						<li>Sotheby’s International Realty</li>
						<li>Tavistock</li>
						<li>Trammell Crow Residential Company</li>
					</ul>
					<h3 class="xl">Real Estate & Infrastructure</h3>
					<ul>
						<li>American Airlines</li>
						<li>Berkshire Hathaway</li>
						<li>British Petroleum</li>
						<li>Cadillac Fairview</li>
						<li>Cushman & Wakefield</li>
						<li>DeBartolo Development</li>
						<li>Delhi International Airport Limited</li>
						<li>Federal Realty Investment Trust</li>
						<li>Howard Hughes Corporation</li>
						<li>JBG Smith</li>
						<li>Jones Lang LaSalle (JLL)</li>
						<li>Kimco Realty</li>
						<li>Metropolitan Transportation Authority</li>
						<li>New World Development</li>
						<li>Swire Development</li>
						<li>Trammel Crow Company</li>
						<li>Witkoff</li>
					</ul>
				</div>
			</section>
			<Section cta order={26} span_columns={1} col_units="whole" col_start={1} span_rows={1}>
				<DottedArrowHover href="/collaborators" text_alignment="right">
					<p>View All Collaborators <DottedArrow /></p>
				</DottedArrowHover>
			</Section>
			<section class="awards-list" style="order: 28;">
				<h2 class="xxxl">Awards.</h2>
				{#each data.awardsByYear.slice(0, 5) as [year, awardYear]}
					<h3 class="xxl">{year}</h3>
					<ul>
						{#each awardYear as award}
							<li>
								<p>
									{#if award.project}
										<a href="/work/{award.project.slug}"
											>{award.project.project_title} · {award.project_location}:</a
										>
									{:else}
										<strong>{award.project_name} · {award.project_location}:</strong>
									{/if}
									{award.award_designation}
								</p>
							</li>
						{/each}
					</ul>
				{/each}
			</section>
			<Section cta order={30} span_columns={1} col_units="whole" col_start={1} span_rows={1}>
				<DottedArrowHover href="/awards" text_alignment="right">
					<p>View All Awards <DottedArrow /></p>
				</DottedArrowHover>
			</Section>
			<Section header order={32} span_columns={2} col_units="third" col_start={1} span_rows={1}>
				<h2 class="xxxl">Testimonials.</h2>
			</Section>
			<section class="testimonials" style="order: 34;">
				<div class="image">
					<nav class="arrows">
						<button
							class="reset"
							on:click={previousTestimonial}
							aria-label="View previous testimonial">›</button
						>
						<button class="reset" on:click={nextTestimonial} aria-label="View next testimonial"
							>›</button
						>
					</nav>

					{#key testimonialIndex}
						<figure in:fade out:fade>
							{#if currentTestimonial.banner_image}
								<img
									src={assetUrl(currentTestimonial.banner_image.filename_disk)}
									alt={currentTestimonial.banner_image.description}
								/>
							{/if}
							{#if currentTestimonial.associated_project}
								<figcaption>
									<h3>
										<a href="/work/{currentTestimonial.associated_project.slug}">
											{currentTestimonial.associated_project.project_title}
										</a>
									</h3>
									<p>{currentTestimonial.associated_project.location}</p>
								</figcaption>
							{/if}
						</figure>
					{/key}
				</div>
				{#key testimonialIndex}
					<figure class="quote" in:fade out:fade>
						<blockquote transition:fade>
							{@html currentTestimonial.quote}
						</blockquote>
						<figcaption>
							{currentTestimonial.quote_attribution}
							<cite>
								{currentTestimonial.quote_attribution_job_title} <br />
								{currentTestimonial.company_name}
							</cite>
						</figcaption>
					</figure>
				{/key}
			</section>
		</div>
	</template>
{/if}

<style lang="scss">
	.container {
		margin-top: calc(var(--HEADER-HEIGHT) + var(--GRID-CELL));
		grid-template-rows: auto 1fr;
		grid-auto-rows: auto;
	}
	figure.about-image-container {
		margin: 0;
		padding: 0;
		width: 100%;
		height: 100%;

		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;

		@media (max-width: 62.5em) {
			margin-top: var(--GRID-CELL);
		}

		img {
			grid-row: 1;
			grid-column: 1;
			align-self: end;

			width: 100%;
			height: auto;
			aspect-ratio: 1 / 1;
			object-fit: cover;

			@media (max-width: 62.5em) {
				align-self: start;
			}
		}
		figcaption {
			grid-row: 1;
			grid-column: 1;

			align-self: end;
			justify-self: end;
			padding: 0 calc(var(--GRID-CELL) / 2) calc(var(--GRID-CELL) / 2) 0;
			margin-bottom: 0;

			color: white;
			font-weight: 700;
		}
	}
	section.collaborator-logos {
		grid-column: whole;
		align-items: center;
		margin: calc(var(--GRID-CELL) * 3) 0;
		row-gap: calc(var(--GRID-CELL) * 3);

		@media (max-width: 46.875em) {
			grid-template-columns: repeat(3, 1fr);
			justify-items: center;

			> img:last-of-type {
				display: none;
			}
		}

		@media (max-width: 31.25em) {
			grid-template-columns: repeat(2, 1fr);

			> img:last-of-type {
				display: block;
			}
		}

		> img {
			width: 700px;

			&.max-width-30 {
				max-width: 30%;
			}
			&.max-width-36 {
				max-width: 30%;
			}
			&.max-width-40 {
				max-width: 40%;
			}
			&.max-width-50 {
				max-width: 50%;
			}
		}
	}

	section.collaborator-list {
		grid-column: whole;

		@media (max-width: 46.875em) {
			display: none;
		}

		h3 {
			margin-bottom: var(--GRID-CELL);
		}
		ul {
			margin-bottom: calc(var(--GRID-CELL) * 2);
		}

		@media (max-width: 62.5em) {
			grid-template-columns: repeat(3, 1fr);

			> div:last-of-type {
				display: none;
			}
		}
	}

	section.awards-list {
		grid-column: whole;

		display: grid;
		grid-template-columns: repeat(6, 1fr);
		column-gap: calc(var(--GRID-CELL) / 2);

		h2 {
			grid-column: span 6;

			@media (max-width: 62.5em) {
				grid-column: span 1;
			}
		}

		@media (max-width: 62.5em) {
			grid-template-columns: 1fr;
		}

		h3,
		ul {
			margin-top: calc(var(--GRID-CELL) * 1.5);
		}

		ul {
			grid-column: span 5;

			@media (max-width: 62.5em) {
				grid-column: span 1;
			}

			li {
				margin-bottom: 0;
				p {
					margin-bottom: 0.5em;
				}
				a {
					font-weight: 700;
				}
			}
		}
	}
	section.testimonials {
		grid-column: whole;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		column-gap: calc(var(--GRID-CELL) / 2);

		@media (max-width: 46.875em) {
			grid-template-columns: 1fr;
		}

		> div.image {
			align-self: start;
			grid-column: span 2;
			@media (max-width: 46.875em) {
				grid-column: span 1;
			}
			display: grid;
			grid-template-columns: 1fr;
			grid-template-rows: 1fr;

			> nav.arrows,
			> figure {
				grid-column: 1;
				grid-row: 1;
			}

			> nav.arrows {
				position: relative;
				z-index: 2;
				align-self: center;
				margin-bottom: var(--GRID-CELL);

				width: 100%;
				display: flex;
				justify-content: space-between;

				> button {
					font-size: var(--FONT-SIZE-XXXL);
					font-weight: 300;
					line-height: 0.5;
					color: white;
					transition: color 0.3s ease;

					&:hover {
						color: var(--COLOR-ORANGE);
					}

					padding: var(--GRID-CELL) calc(var(--GRID-CELL) / 2) var(--GRID-CELL) var(--GRID-CELL);

					&:first-of-type {
						transform: rotate(180deg) translate(0em, -0.1395em);
					}
				}
			}

			> figure {
				grid-row: 1;
				grid-column: 1;
				margin: 0;
				padding: 0;

				display: grid;
				grid-template-columns: 1fr;
				grid-template-rows: 1fr;

				overflow: hidden;

				> img {
					grid-column: 1;
					grid-row: 1;
					width: 100%;
					height: 100%;
					object-fit: cover;
				}

				> figcaption {
					grid-column: 1;
					grid-row: 1;
					align-self: end;
					justify-self: start;
					margin: 0 0 calc(var(--GRID-CELL) / 2) calc(var(--GRID-CELL) / 2);
					position: relative;
					z-index: 1;

					&::after {
						content: "";
						position: absolute;
						z-index: -1;
						top: calc(var(--GRID-CELL) * -1 / 2);
						left: calc(var(--GRID-CELL) * -1 / 2);
						width: calc(100% + var(--GRID-CELL));
						height: calc(100% + var(--GRID-CELL));
						background: rgba(0, 0, 0, 0.25);
						filter: blur(1rem);
					}

					color: white;
					transition: opacity 0.3s ease;

					> h3 {
						font-size: var(--FONT-SIZE-MD);
						text-transform: uppercase;
						letter-spacing: 0.05em;
					}

					> p {
						margin-bottom: 0;
					}

					:global(a) {
						color: white;
						transition: opacity 0.3s ease;
						&:hover {
							opacity: 0.618;
						}
					}
				}
			}
		}

		> figure.quote {
			grid-row: 1;
			grid-column: 3;
			@media (max-width: 46.875em) {
				grid-column: 1;
				grid-row: 2;
				margin-top: var(--GRID-CELL);
			}
			align-self: start;
			margin: 0;
			padding: 0;
			background: white;

			height: 100%;
			transition: height 0.2s ease;

			> blockquote {
				margin: 0 0 var(--GRID-CELL);
				padding: 0;
				font-style: italic;
			}

			> figcaption {
				font-weight: 700;

				> cite {
					font-weight: 400;
					font-style: normal;
					display: block;
				}
			}
		}
	}
</style>
