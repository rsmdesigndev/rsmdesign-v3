<script lang="ts">
	import { assetUrl } from "$lib/cms/assets";
  import Section from "$lib/components/Section.svelte";
  import DottedArrow from "$lib/components/DottedArrow.svelte";
	import DottedArrowHover from "$lib/components/DottedArrowHover.svelte";

  interface PageBlockSplitContentData {
    kicker: string;
    kicker_link: string;
    heading: string;
    dek: string;
    description: string;
    cta_text: string;
    cta_link: string;
    media_type: string;
    media_position: string;
    image: {
      filename_disk: string;
      title: string;
      description: string;
    }
    video: {
      filename_disk: string;
      title: string;
      description: string;
      type: string;
    }
    autoplay: boolean;
    loop: boolean;
    show_controls: boolean;
  }

  export let data = <PageBlockSplitContentData>{};
  export let order: number;
</script>

<Section order={order}>
  <div class="split-content" data-position={data.media_position}>
    <div class="split-content__content">
      {#if data.kicker}
        <div class="content__kicker">
          {#if data.kicker_link}
            <a href={data.kicker_link}>{data.kicker}</a>
          {:else}
            {data.kicker}
          {/if}
        </div>
      {/if}
      {#if data.heading}
        <h1 class="content__heading">{data.heading}</h1>
      {/if}
      {#if data.dek}
        <div class="content__dek">{data.dek}</div>
      {/if}
      {#if data.description}
        <div class="content__description">{@html data.description}</div>
      {/if}
      {#if data.cta_text && data.cta_link}
        <div class="content__cta">
          <DottedArrowHover href="{data.cta_link}" text_alignment={"right"}>
            <p>{data.cta_text} <DottedArrow /></p>
          </DottedArrowHover>
        </div>
      {/if}
    </div>
    <div class="split-content__media">
      {#if data.media_type === "image"}
        {#if data.image}
          <div class="media__image">
            <img
              src={assetUrl(data.image.filename_disk)}
              alt={data.image.description}
            />
          </div>
        {/if}
      {/if}
      {#if data.media_type === "video"}
        {#if data.video}
          <div class="media__video">
            <video
              autoplay={data.autoplay ?? false}
              loop={data.loop ?? false}
              controls={data.show_controls ?? false}
              muted={data.autoplay ?? false}
              playsinline={data.autoplay ?? false}
              width="100%"
              height="100%"
            >
              <source src={rawAssetUrl(data.video?.filename_disk)} type="{data.video?.type}" />
              <track kind="captions" />
            </video>
          </div>
        {/if}
      {/if}
    </div>
  </div>
</Section>

<style lang="scss">
  .split-content {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 24px;

    @media (min-width: 764px) {
      grid-template-columns: repeat(2, 1fr);

      &[data-position="right"] {
        .split-content__content {
          order: 1;
        }

        .split-content__media {
          order: 2;
        }
      }
    }

    &__content {
      order: 2;
      display: flex;
      flex-direction: column;
    }

    &__media {
      order: 1;
      position: relative;
    }

    .content {
      &__kicker {
        font-size: var(--FONT-SIZE-MD);
        line-height: 1;
        font-weight: 600;
        text-transform: uppercase;
        color: var(--COLOR-DIM-GRAY);
        margin: 12px 0px;

        > a {
          display: block;
          color: var(--COLOR-ORANGE);
        }
      }

      &__heading {
        font-size: var(--FONT-SIZE-XXL);
        line-height: 1.2;
      }

      &__dek {
        font-size: var(--FONT-SIZE-LG);
        line-height: 1.5;
        margin-bottom: 24px;
      }

      &__description {
        font-size: var(--FONT-SIZE-MD);
        line-height: 1.5;
      }

      &__cta {
        margin-top: auto;
      }
    }

    .media {
      &__image {
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      &__video {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
</style>