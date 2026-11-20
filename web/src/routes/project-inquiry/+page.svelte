<script lang="ts">
	import SeoHead from "$lib/components/SeoHead.svelte";
	import ContactForm from "$lib/components/ContactForm.svelte";
	// import KlaviyoForm from "$lib/components/KlaviyoForm.svelte";
</script>

<SeoHead
	title="Project Inquiry"
	description="RSM Design looks forward to hearing about your project and we will reach out quickly. Fill out the form or call us directly."
	slug="project-inquiry"
/>

<svelte:head>
	<style>
		:root {
			--bg-color: var(--COLOR-BLACK);
			--bg-scrim: none;
			--text-color: white;
			--accent-color: var(--COLOR-ORANGE);
			--midtone-color: var(--COLOR-DIM-GRAY);
		}
	</style>
</svelte:head>

<template>
	<div class="container">
		<h1 class="xxxl">Project Inquiry</h1>
		<section class="form-section">
			<ContactForm />
			<!-- <KlaviyoForm /> -->
		</section>
	</div>
</template>

<style lang="scss">
	div.container {
		margin-top: var(--SPACE-MD);
	}
	h1 {
		grid-column: whole;
		margin: var(--GRID-CELL) 0 calc(var(--GRID-CELL) * 2);
	}
	section.form-section {
		grid-column: whole;
		width: 80%;
	}
</style>