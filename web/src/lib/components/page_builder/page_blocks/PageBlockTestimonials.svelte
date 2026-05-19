<script lang="ts">
  import { assetUrl } from "$lib/cms/assets";
  import { fade } from "svelte/transition";
  import Section from "$lib/components/Section.svelte";

  interface PageBlockTestimonialsData {
    heading: string;
    testimonials: any[];
  }

  export let data = <PageBlockTestimonialsData>{};
  export let order: number;

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

<svelte:head>
  {#if data.testimonials}
    {#each data.testimonials as testimonial}
      {#if testimonial.item.banner_image}
        <link rel="preload" as="image" href={assetUrl(testimonial.item.banner_image.filename_disk)} />
      {/if}
    {/each}
  {/if}
</svelte:head>

<Section
  order={order}
>
  <div class="testimonials-carousel">
    {#if data.heading}
      <h2 class="testimonials-carousel__heading">{data.heading}</h2>
    {/if}
    {#if data.testimonials}
      <section class="testimonials">
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
              {#if currentTestimonial.item.banner_image}
                <img
                  src={assetUrl(currentTestimonial.item.banner_image.filename_disk)}
                  alt={currentTestimonial.item.banner_image.description}
                />
              {/if}
              {#if currentTestimonial.item.associated_project}
                <figcaption>
                  <h3>
                    <a href="/work/{currentTestimonial.item.associated_project.slug}">
                      {currentTestimonial.item.associated_project.project_title}
                    </a>
                  </h3>
                  <p>{currentTestimonial.item.associated_project.location}</p>
                </figcaption>
              {/if}
            </figure>
          {/key}
        </div>
        {#key testimonialIndex}
          <figure class="quote" in:fade out:fade>
            <blockquote transition:fade>
              {@html currentTestimonial.item.quote}
            </blockquote>
            <figcaption>
              {currentTestimonial.item.quote_attribution}
              <cite>
                {currentTestimonial.item.quote_attribution_job_title} <br />
                {currentTestimonial.item.company_name}
              </cite>
            </figcaption>
          </figure>
        {/key}
      </section>
    {/if}
  </div>
</Section>

<style lang="scss">
  .testimonials-carousel {
    width: 100%;
    grid-column: 1 / -1;

    &__heading {
      font-size: var(--FONT-SIZE-XXL);
      margin-bottom: var(--SPACE-MD);
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
          font-weight: 600;

          > cite {
            font-weight: 400;
            font-style: normal;
            display: block;
          }
        }
      }
    }
  }
</style>