<script lang="ts">
	import type { PageData } from "./$types";

	export let data: PageData;
</script>

<svelte:head>
	<meta name="robots" content="noindex" />
</svelte:head>

<template>
	{#each data.projects as project}
		<a href={`/work/${project.slug}`}>{project.slug}</a>
	{/each}

	{#each data.newsPosts as newsPost}
		<a href={`/news/${newsPost.slug}`}>{newsPost.slug}</a>
	{/each}

	{#each data.markets as market}
		<a href={`/markets/${market.slug}`}>{market.slug}</a>
	{/each}

	{#each data.services as service}
		<a href={`/services/${service.slug}`}>{service.slug}</a>
	{/each}

	{#each data.team as team}
		<a href={`/team/${team.slug}`}>{team.slug}</a>
	{/each}

	{#each data.aeo_articles as aeo_article}
		<a href={`/aeo/${aeo_article.slug}`}>{aeo_article.slug}</a>
	{/each}

	<!--<a href="/work/great-park-neighborhoods">Great Park Neighborhoods</a>
	<a href="/markets/hotel-signage">Hotel Signage</a>
	<a href="/markets/resort-signage">Resort Signage</a>-->
</template>