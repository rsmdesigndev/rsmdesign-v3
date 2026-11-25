<script lang="ts">
  import { onMount } from "svelte";
  import { gql, request } from "graphql-request";
  import { env } from "$env/dynamic/public";
  import Section from "$lib/components/Section.svelte";
  import { assetUrl } from "$lib/cms/assets";
	import DottedArrow from "$lib/components/DottedArrow.svelte";
	import DottedArrowHover from "$lib/components/DottedArrowHover.svelte";
  import { fade } from "svelte/transition";

  interface PageBlockArticleGridData {
    heading?: string;
    number_of_articles?: number;
    article_filters?: {
      slug?: string;
      name?: string;
    }
    article_half_grid?: boolean;
  }

  export let data = <PageBlockArticleGridData>{};
  export let order: number;

  let loaded = false;
  let articles: any[] = [];

  onMount(async () => {

    if (data.article_filters && data.number_of_articles) {
      const limit = data.number_of_articles;
      const filters = data.article_filters.name;

      const articlesQuery = gql`
        query NewsPosts($limit: Int, $filter: String) {
          news_posts(limit: $limit, sort: [ "-published_date" ], filter: {topics_list: {_eq: $filter}}) {
            slug
            post_title
            grid_image {
              filename_disk
              title
              description
            }
            article_preview
            topics {
            news_topics_id {
                name
              }
            }
          }
        }
      `;

      // Fetch news articles with filtered query
      let response = await request(env.PUBLIC_DIRECTUS_API_URL, articlesQuery, {
        limit: limit,
        filter: filters
      });
      
      if(response) {
        articles = response.news_posts;
        loaded = true;
      }
    }
  });
</script>
<Section 
	project={false}
	heading
	order={order}
  span_columns={1}
	col_units={data.article_half_grid ? "half" : "whole"}
	col_start={1}
    padding_left={"none"}
    padding_right={"none"}
	span_rows={1}
	padding_top={"md"}
    padding_top_override={true}
	anchor_id={""}
	row_alignment={"bottom"}
>
  {#if loaded}
    {#if articles.length > 0 && data.article_half_grid}
      <div class="half">
        {#if data.heading }
          <h2 class="xxxl fadeMove article-grid__heading">{data.heading}</h2>
        {/if}
        <ul class="article-grid article-grid--half">
          {#each articles as article, key}
            <li class={key === 0 ? "grid-item--feature" : "grid-item--stacked"}>
              <a href="/news/{article.slug}">
                <figure class="article-grid__figure">
                  <div class="article-grid__image-container">
                    <img
                      transition:fade={{ duration: 200 }}
                      src={assetUrl(article.grid_image.filename_disk)}
                      alt={article.grid_image.description}
                      class="article-grid__image"
                    />
                  </div>
                  <figcaption>
                    <h3 class="lg article-grid__title">{article.post_title}</h3>
                    <p class="article-grid__preview">{@html article.article_preview}</p>
                  </figcaption>
                </figure>
              </a>
            </li>
          {/each}
        </ul>
        <DottedArrowHover href="/news?topicFilter={data?.article_filters?.slug}#all-articles" text_alignment={"right"}>
          <p>View all {data?.article_filters?.name} articles <DottedArrow /></p>
        </DottedArrowHover>
      </div>
    {:else if articles.length > 0}
      {#if data.heading }
        <h2 class="xxxl fadeMove article-grid__heading">{data.heading}</h2>
      {/if}
      <ul class="article-grid">
        {#each articles as article}
          <li>
            <a href="/news/{article.slug}">
              <figure class="article-grid__figure">
                <div class="article-grid__image-container">
                  <img
                    transition:fade={{ duration: 200 }}
                    src={assetUrl(article.grid_image.filename_disk)}
                    alt={article.grid_image.description}
                    class="article-grid__image"
                  />
                </div>
                <figcaption>
                  <h3 class="lg article-grid__title">{article.post_title}</h3>
                  <p class="article-grid__preview">{@html article.article_preview}</p>
                </figcaption>
              </figure>
            </a>
          </li>
        {/each}
      </ul>
      <DottedArrowHover href="/news?topicFilter={data?.article_filters?.slug}#all-articles" text_alignment={"right"}>
        <p>More {data?.article_filters?.name} Articles <DottedArrow /></p>
      </DottedArrowHover>
    {/if}
  {:else}
    <ul class="article-grid">
      {#each Array(6) as _}
        <li class="article-grid__skeleton"></li>
      {/each}
    </ul>
  {/if}
</Section>

<style lang="scss">
  .article-grid {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: var(--GRID-CELL);

    @media screen and (min-width: 768px) {
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }

    &--half {
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(2, 1fr);
      align-items: stretch;
      align-content: stretch;
      margin-bottom: 48px;

      a, figure {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      a:hover {
        figcaption {
          .article-grid__title {
            opacity: 1;
            transform: translateY(0);
          }
        }
      }

      .article-grid__image-container {
        width: 100%;
        height: 100%;
        object-fit: cover;
        margin-bottom: 0;

        img {
          width: 100%;
          height: 100%;
        }
      }

      figcaption {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: grid;
        place-items: center;
        overflow: hidden;
        z-index: 4;

        .article-grid__title {
          text-align: center;
          padding: 12px;
          opacity: 0;
          transform: translateY(12px);
          color: var(--COLOR-BLACK);
          transition: all 0.75s 0.25s ease;
        }
        .article-grid__preview {
          display: none;
        }
      }
    }

    .grid-item--feature {
      grid-column: span 2;
      grid-row: span 2;
    }

    .grid-item--stacked {
      grid-column: span 1;
      grid-row: span 1;
    }

    a {
      position: relative;

      &:hover {
        .article-grid__image-container::after {
          opacity: 0.7;
        }

        .article-grid__image {
          transform: scale(1.1);
          transition: transform 1.25s ease;

          @media (max-width: 46.875em) {
            transform: scale(1);
          }
        }
      }
    }

    &__heading {
      margin-bottom: var(--GRID-CELL);
    }

    &__figure {
      width: 100%;
      padding: 0;
      margin: 0;
      overflow: hidden;
    }

    &__image-container {
      width: 100%;
      height: auto;
      aspect-ratio: 1/1;
      margin-bottom: 20px;
      position: relative;
      overflow: hidden;

      &::after {
        content: "";
        position: absolute;
        z-index: 2;
        top: 0;
        right: 0;
        width: 100%;
        height: 100%;
        background: #FFF;
        opacity: 0;
        transition: all 1.25s ease;
      }
    }

    &__image {
      width: 100%;
    }

    &__title {
      margin-bottom: 10px;
    }

    &__preview {
      font-size: 1rem;
      line-height: 1.5;
      margin-bottom: 20px;
      height: 3.125em;
      overflow: hidden;
      position: relative;
      z-index: 1;

      @media (max-width: 31.25em) {
        display: none;
      }

      &::after {
        content: "";
        position: absolute;
        z-index: 2;
        bottom: 0;
        right: 0;
        width: 50%;
        height: 1.562em;
        background: linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.667), rgba(255,255,255,1));
      }
    }

    &__skeleton {
      width: 100%;
      height: 200px;
      background-color: var(--COLOR-LIGHT-GRAY);
      margin-bottom: var(--GRID-CELL);
    }
  }
</style>