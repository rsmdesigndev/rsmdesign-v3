<script lang="ts">
	import SeoHead from "$lib/components/SeoHead.svelte";
	import ContactForm from "$lib/components/ContactForm.svelte";
	import type { PageData } from "./$types";
	// import KlaviyoForm from "$lib/components/KlaviyoForm.svelte";

	export let data: PageData;
</script>

<SeoHead
	title="Get in Touch"
	description="Looking for branding, wayfinding, signage, or environmental graphic design? Contact our experienced team of creatives to enhance your space."
>
	<!-- Stephanie email tracker -->
	<script type="text/javascript"> hbspt.cta.load(8650991, '83a3f126-b26c-4061-81d0-9079a980aa15', {"region":"na1"}); </script>
	<!-- Laura email tracker -->
	<script type="text/javascript"> hbspt.cta.load(8650991, '60fafa0c-e2f9-45fe-9b80-54f071884ff4', {"region":"na1"}); </script>
	<!-- Hello email tracker -->
	<script type="text/javascript"> hbspt.cta.load(8650991, 'bd2d00f4-56ac-411b-8cad-6c9ae166f68a', {"region":"na1"}); </script>
</SeoHead>

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
	<div class="container">
		<section class="header-section">
			<h1 class="md gray">Contact</h1>
			<h2 class="xxxl">Shoes optional, <br/>creativity a must.</h2>
		</section>
		<section class="studios-section">
			<h2 class="md gray">Studio Locations</h2>
			<div class="studios-container">
				{#each data.studioLocations as studioLocation}
					<article>
						<h3 class="xl">
							<a href="/offices/{studioLocation.slug}">
								{studioLocation.location}
							</a>
						</h3>
						{#if studioLocation.address}
							{@html studioLocation.address}
						{/if}
						{#if studioLocation.contact_phone}
							<a href={"tel:" + studioLocation.contact_phone} target="_blank">
								{studioLocation.contact_phone}
							</a>
						{/if}
						{#if studioLocation.contact_email}
							{#if studioLocation.hubspot_tracking_url}
								<a href={studioLocation.hubspot_tracking_url}>
									{studioLocation.contact_email}
								</a>
							{:else}
								<a href={"mailto:" + studioLocation.contact_email}>
									{studioLocation.contact_email}
								</a>
							{/if}
						{/if}
					</article>
				{/each}
			</div>
		</section>
		<section class="contact-section">
			<h2 class="md gray">Get in touch</h2>
			<div class="left">
				<h3 class="xl">Project Inquiry</h3>
				<article>
					<a href="/team/stephanie-wills">
						Stephanie Wills
					</a>
					<a href="https://cta-redirect.hubspot.com/cta/redirect/8650991/83a3f126-b26c-4061-81d0-9079a980aa15" target="_blank">
						stephanie@rsmdesign.com
					</a>
					<a href="tel:+13032239845" target="_blank">
						303.223.9845
					</a>
				</article>
				<article>
					<p>Laura Escarcega</p>
					<a href="https://cta-redirect.hubspot.com/cta/redirect/8650991/60fafa0c-e2f9-45fe-9b80-54f071884ff4" target="_blank">
						laura.e@rsmdesign.com
					</a>
					<a href="tel:+19494929479" target="_blank">
						949.492.9479 x118
					</a>
				</article>
				<article>
					<p>General Information</p>
					<a href="https://cta-redirect.hubspot.com/cta/redirect/8650991/bd2d00f4-56ac-411b-8cad-6c9ae166f68a" target="_blank">
						hello@rsmdesign.com
					</a>
				</article>
				{#if data.careers.length}
					<div class="careers-container">
						<h3 class="xl">
							<a href="/careers">Careers</a>
						</h3>
						<ul>
							{#each data.careers as career}
								<li>
									<a href="/careers/{career.slug}">
										{career.name}
									</a>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
			<div class="contact-form-container">
				<h3 class="xl">Contact Form</h3>
				<ContactForm />
				<!-- <KlaviyoForm /> -->
			</div>
		</section>
	</div>
	{#each data.studioLocations as studioLocation}
		{#if studioLocation.hubspot_tracking_scripts}
			{@html studioLocation.hubspot_tracking_scripts}
		{/if}
	{/each}
</template>


<style lang="scss">
	section.header-section {
		margin-top: var(--GRID-CELL);
		grid-column: whole;
	}
	section.studios-section {
		margin-top: calc(var(--GRID-CELL) * 3);
		grid-column: whole;

		article {
			margin-bottom: var(--GRID-CELL);
			h3 {
				margin-bottom: calc(var(--GRID-CELL) * 0.5);
			}

			a {
				display: block;
			}

			:global {
				p {
					margin-bottom: 0;
				}
			}
		}
	}
	.studios-container, .contact-section {
		display: grid;
		column-gap: calc(var(--GRID-CELL) / 2);

		grid-template-columns: repeat(4, 1fr);
		@media (max-width: 62.5em) {
			grid-template-columns: repeat(2, 1fr);
		}
		@media (max-width: 31.25em) {
			grid-template-columns: 1fr;
		}
	}
	section.contact-section {
		grid-column: whole;
		margin-top: calc(var(--GRID-CELL) * 3);

		> h2 {
			margin-bottom: 0; 
			grid-column: span 4;
			@media (max-width: 62.5em) {
				grid-column: span 2;
			}
			@media (max-width: 31.25em) {
				grid-column: span 1;
			}
		}

		h3 {
			margin-bottom: var(--GRID-CELL);
		}

		article {
			margin-bottom: calc(var(--GRID-CELL));

			> p {
				margin-bottom: 0;
			}

			> a {
				display: block;
			}
		}

		div.careers-container {
			margin-top: calc(var(--GRID-CELL) * 2);

			> h3 {
				margin-bottom: calc(var(--GRID-CELL) * 0.5);
			}

			li {
				margin-bottom: 1em;
			}
		}

		div.contact-form-container {
			grid-column: span 3;
			@media (max-width: 62.5em) {
				grid-column: span 1;
			}

			@media (max-width: 31.25em) {
				margin-top: calc(var(--GRID-CELL) * 2);
			}
		}
	}

</style>