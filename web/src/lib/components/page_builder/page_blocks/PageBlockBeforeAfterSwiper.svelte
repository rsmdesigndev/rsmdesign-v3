<script lang="ts" context="module">
	import type { ImageAssetRelation } from "$lib/cms";

	export type PageBlockBeforeAfterSwiperData = LayoutFields & {
		images?: ImageAssetRelation[] | null;
        swiper_start_position?: "left" | "center" | "right" | null;
	};
</script>

<script lang="ts">
	import Details from "$lib/components/Details.svelte";
	import Section from "$lib/components/Section.svelte";
	import { sineInOut } from "svelte/easing";
	import type { LayoutFields } from "../layout_blocks/index.svelte";
	import { onMount } from "svelte";
	import { assetUrl } from "$lib/cms/assets";
    import { animate, fadeScroll } from "$lib/animate";

    export let data: PageBlockBeforeAfterSwiperData;
    export let order: number;
    export let project: boolean = false;

    let position: number;
    let dragging = false;
    let container: HTMLDivElement | null = null;

    onMount(() => {
        if (data.swiper_start_position === "left") {
            position = 15;
        } else if (data.swiper_start_position === "right") {
            position = 85;
        } else {
            position = 50;
        }
    });

    function onMouseDown(event: any) {
        dragging = true;
    }

    function onMouseUp(event: any) {
        dragging = false;
    }

    function onMouseMove(event: any) {
        if (dragging) {
            const containerRect = container?.getBoundingClientRect();
            const width = containerRect?.width ?? 0;
            const left = containerRect?.left ?? 0;
            position = (event.clientX - left) / width * 100;

            if (position > 99) {
                position = 99;
            } else if (position < 1) {
                position = 1;
            }
        }
    }

    let width: number;
</script>

<svelte:window on:mouseup={onMouseUp} on:mousemove={onMouseMove} />

<Section
    project={project}
    grid
    swiper
    order={order}
    span_columns={data.span_columns ?? 1}
    col_units={data.col_units ?? "whole"}
    col_start={data.col_start ?? 1}
    padding_left={data.padding_left ?? "none"}
    padding_right={data.padding_right ?? "none"}
    span_rows={data.span_rows ?? 1}
    padding_top={data.padding_top ?? "default"}
    anchor_id={data.anchor_id ?? ""}
>
    <figure bind:this={container} 
            class="before-after-container"
            use:animate={fadeScroll}
    >
        <div class="before" style:width="{position}%">
            <img style:width="{width}px"
                src={assetUrl(data.images?.[0]?.directus_files_id?.filename_disk)}
                alt={assetUrl(data.images?.[0]?.directus_files_id?.description)}
            />
        </div>
        <div class="after" bind:offsetWidth={width}>
            <img
                src={assetUrl(data.images?.[1]?.directus_files_id?.filename_disk)}
                alt={assetUrl(data.images?.[1]?.directus_files_id?.description)}
            />
        </div>
        <div
            class="handle"
            style:left="calc({position}% - var(--GRID-CELL) / 2)"
            on:mousedown={onMouseDown}
        >
            ‹&thinsp;›
        </div>
    </figure>
</Section>

<style lang="scss">
    .before-after-container {
        margin: 0;
        padding: 0;
        position: relative;
        overflow: hidden;
        user-select: none;
    }

    .before, .after {
        width: 100%;
        height: 100%;
        user-select: none;
        pointer-events: none;

        img {
            object-fit: cover;
            object-position: left center;
            width: 100%;
            height: 100%;
        }
    }

    .before {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        overflow: hidden;
        z-index: 1;
    }

    .handle {
        position: absolute;
        z-index: 1;
        bottom: calc(var(--GRID-CELL) * 3);
        border-radius: 50%;
        border: 2px solid white;
        width: var(--GRID-CELL);
        height: var(--GRID-CELL);
        box-sizing: border-box;
        font-size: var(--FONT-SIZE-XL);
        font-weight: 300;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        cursor: grab;
        padding-bottom: 5px;
        box-shadow: 0 0 10px rgba(12, 12, 12, 0.2);

        transition: background-color 0.3s ease;
        &:hover {
            background-color: var(--COLOR-ORANGE);
        }

        &::before, &::after {
            content: " ";
            display: block;
            width: 2px;
            background: #fff;
            height: 9999px;
            position: absolute;
            left: 50%;
            margin-left: -1px;
            z-index: 2;
        }

        &::before {
            bottom: 50%;
            margin-bottom: calc(var(--GRID-CELL) / 2);
            box-shadow: 0 0 10px rgb(12, 12, 12);
        }

        &::after {
            top: 50%;
            margin-top: calc(var(--GRID-CELL) / 2);
            box-shadow: 0 0 10px rgb(12, 12, 12);
        }
    }
</style>
