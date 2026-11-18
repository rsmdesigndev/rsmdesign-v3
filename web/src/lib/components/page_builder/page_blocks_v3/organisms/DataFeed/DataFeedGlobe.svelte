<script lang="ts" context="module">
	import type { GlobeFeedItem } from "$lib/cms/dataFeed/dataFeedGlobeFilters";

	export type dataFeedGlobeData = {
		feed_source?: string | null;
	};

	/* feed items over real locations_cities rows, for a page without a CMS feed behind it */
	export function generateDummyProjects(): GlobeFeedItem[] {
		const cities: [number, string, string, string, number, number][] = [
			[92,	"Los Angeles",		"California",		"United States of America",	-118.2437,	34.0522],
			[157,	"San Francisco",	"California",		"United States of America",	-122.4194,	37.7749],
			[169,	"Seattle",			"Washington",		"United States of America",	-122.3321,	47.6062],
			[138,	"Portland",			"Oregon",			"United States of America",	-122.6762,	45.5234],
			[39,	"Denver",			"Colorado",			"United States of America",	-104.9847,	39.7392],
			[35,	"Dallas",			"Texas",			"United States of America",	-96.8067,	32.7831],
			[72,	"Houston",			"Texas",			"United States of America",	-95.3633,	29.7633],
			[26,	"Chicago",			"Illinois",			"United States of America",	-87.6278,	41.8819],
			[126,	"Omaha",			"Nebraska",			"United States of America",	-95.9404,	41.2563],
			[9,		"Atlanta",			"Georgia",			"United States of America",	-84.3880,	33.7490],
			[112,	"Nashville",		"Tennessee",		"United States of America",	-86.7844,	36.1659],
			[99,	"Miami",			"Florida",			"United States of America",	-80.1937,	25.7743],
			[118,	"New York",			"New York",			"United States of America",	-74.0060,	40.7143],
			[18,	"Boston",			"Massachusetts",	"United States of America",	-71.0598,	42.3584],
			[196,	"Washington, DC",	"",					"United States of America",	-77.0364,	38.8951],
			[105,	"Montreal",			"",					"Canada",				-73.5542,	45.5089],
			[32,	"Cuernavaca",		"",					"Mexico",				-99.2308,	18.9261],
			[172,	"Solingen",			"",					"Germany",				7.0845,		51.1734],
			[41,	"Dubai",			"",					"United Arab Emirates",	55.2708,	25.2047],
			[110,	"Nanjing",			"",					"China",				118.7778,	32.0617]
		];

		const services = ["Branding", "Environmental Graphics", "Placemaking", "Signage", "Wayfinding"];
		const markets = ["Civic", "Healthcare", "Hospitality", "Mixed-Use", "Retail", "Workplace"];

		let seed = 123456789;

		// Use a seeded LCG so the same `pointsPerCity` always produces the same projects
		function random(): number {
			seed = (seed * 1664525 + 1013904223) >>> 0;
			return seed / 4294967296;
		}

		function pickNames(names: string[]): string[] {
			const first = names[Math.floor(random() * names.length)];
			const second = names[Math.floor(random() * names.length)];

			return random() < 0.5 || second === first ? [first] : [first, second];
		}

		const pointsPerCity = 40;
		const projects: GlobeFeedItem[] = [];

		cities.forEach(([id, city, state, country, lng, lat]) => {
			for (let i = 0; i < pointsPerCity; i++) {
				/* a fixed spiral around the city at the golden angle, so its dummies don't sit on one spot */
				const angle = i * 2.399963;
				const radius = Math.sqrt((i + 0.5) / pointsPerCity);

				projects.push({
					id: projects.length + 1,
					slug: `${city.toLowerCase().replace(/[^a-z]+/g, "-")}-project-${i + 1}`,
					project_title: `${city} Project ${i + 1}`,
					location: [city, state, country === "United States of America" ? "" : country].filter(Boolean).join(", "),
					services: pickNames(services).map((name) => ({ services_id: { id: services.indexOf(name) + 1, name } })),
					markets: pickNames(markets).map((name) => ({ markets_id: { id: markets.indexOf(name) + 11, name } })),
					project_location_city: { id, city_name: city, state_province: state ? { state_province_name: state } : null, country: { country_name: country } },
					project_location_lng: Number((lng + Math.cos(angle) * radius * 2.0).toFixed(6)),
					project_location_lat: Number((lat + Math.sin(angle) * radius * 1.4).toFixed(6))
				});
			}
		});

		return projects;
	}
</script>

<script lang="ts">
	import { onMount, tick } from "svelte";
	import * as maplibregl from "maplibre-gl";
	import type { LngLat, Map as MapLibreMap, RasterTileSource, VectorTileSource } from "maplibre-gl";
	import "maplibre-gl/dist/maplibre-gl.css";
	import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
	import { animate, AnimateTrigger } from "$lib/animate";
	import { assetUrl } from "$lib/cms/assets";
	import { mergeFilterItems, filterMenuLabel, filterMenuCollection, type FeedFilters } from "$lib/cms/dataFeed/dataFeedFilters";
	import { loadFilterItems } from "$lib/cms/dataFeed/dataFeedFilterItems";
	import { globeProjectsFromFeedItems, globeProjectMatches, globeFilterOptions, globeSearchTerm,
			 locationGroups, toggleLocation, isLocationSelected, hasLocationSelection, nextLocationStep,
			 emptyLocationSelection, LOCATION_LEVELS, type GlobeProject, type LocationSelection } from "$lib/cms/dataFeed/dataFeedGlobeFilters";
	import { createGlobeClouds, type GlobeClouds } from "../../scripts/globeClouds";
	import { createGlobeGlow, type GlobeGlow } from "../../scripts/globeGlow";
	import { createGlobeMarkers, isPointOnGlobe, type GlobeMarkers, type MarkerColors, type MarkerLocation, type MarkerSizeStops } from "../../scripts/globeMarkers";
	import Cta from "../../atoms/Cta.svelte";
	import DataFeedFilterMenuItem from "./DataFeedFilterMenuItem.svelte";
	import DataFeedFilterMenuSearch from "./DataFeedFilterMenuSearch.svelte";
	import { slide, fade } from "svelte/transition";
	import { cubicInOut } from "svelte/easing";

	export let data: dataFeedGlobeData;
	export let feedData: any[] | null;
	export let feedFilters: FeedFilters = [];
	export let searchText: string = "";
	export let itemParams: string = "";

	/* map instance and element bindings */
	let globe: MapLibreMap;
	let globeContainer: HTMLDivElement;
	let globeWrapper: HTMLDivElement;
	let scrollWrapper: HTMLElement;

	/* map themes */
	type ThemeColor = "var(--COLOR-BLACK)" | "var(--COLOR-BG-LIGHT)" | "var(--COLOR-MID-GRAY)" | "var(--COLOR-DIM-GRAY)" | "var(--COLOR-ORANGE)" | "var(--COLOR-ORANGE-HOVER)" | "white";

	type MapTheme = {
		name: string;
		style: string;
		background: ThemeColor;
		glowColor?: `#${string}`; /* the rim around the globe, as #rrggbb; without one, no rim */
		sidebarTheme: "light" | "dark";
		markerColor: ThemeColor;
		markerColorSecondary: ThemeColor;
		markerBorder?: ThemeColor;
		markerBlend: "screen" | "multiply";
		markerBlur: boolean;
		markerSizeStops: MarkerSizeStops;
	};

	const MAP_THEMES: MapTheme[] = [
		{
			name: "Earth tones",
			style: "/files/EarthTones.json",
			background: "var(--COLOR-BLACK)",
			glowColor: "#80bfce",
			sidebarTheme: "light",
			markerColor: "white",
			markerColorSecondary: "var(--COLOR-BLACK)",
			markerBorder: "var(--COLOR-BLACK)",
			markerBlend: "screen",
			markerBlur: false,
			markerSizeStops: [
				{ zoom: 2, size: 4 },
				{ zoom: 10, size: 16 }
			]
		},
		{
			name: "Gray Land / Dark Water",
			style: "/files/GrayLand-DarkWater.json",
			background: "var(--COLOR-BLACK)",
			glowColor: "#cccccc",
			sidebarTheme: "light",
			markerColor: "var(--COLOR-ORANGE)",
			markerColorSecondary: "var(--COLOR-BLACK)",
			markerBlend: "screen",
			markerBlur: true,
			markerSizeStops: [
				{ zoom: 2, size: 4 },
				{ zoom: 10, size: 16 }
			]
		},
		{
			name: "Gray Land / Blue Water",
			style: "/files/GrayLand-BlueWater.json",
			background: "var(--COLOR-BLACK)",
			glowColor: "#cccccc",
			sidebarTheme: "light",
			markerColor: "var(--COLOR-ORANGE)",
			markerColorSecondary: "var(--COLOR-BLACK)",
			markerBlend: "screen",
			markerBlur: true,
			markerSizeStops: [
				{ zoom: 2, size: 4 },
				{ zoom: 10, size: 16 }
			]
		},
		{
			name: "Dark Land / Light Water",
			style: "/files/DarkLand-LightWater.json",
			background: "var(--COLOR-BG-LIGHT)",
			glowColor: "#ffffff",
			sidebarTheme: "light",
			markerColor: "var(--COLOR-ORANGE)",
			markerColorSecondary: "var(--COLOR-MID-GRAY)",
			markerBlend: "screen",
			markerBlur: true,
			markerSizeStops: [
				{ zoom: 2, size: 4 },
				{ zoom: 10, size: 16 }
			]
		},
		{
			name: "Orange Land / Dark Water",
			style: "/files/OrangeLand-DarkWater.json",
			background: "var(--COLOR-BLACK)",
			glowColor: "#ffffff",
			sidebarTheme: "light",
			markerColor: "white",
			markerColorSecondary: "var(--COLOR-MID-GRAY)",
			markerBlend: "multiply",
			markerBlur: true,
			markerSizeStops: [
				{ zoom: 2, size: 4 },
				{ zoom: 10, size: 16 }
			]
		}
	];

	let selectedTheme: MapTheme = MAP_THEMES[0];

	function markerColors(theme: MapTheme): MarkerColors {
		return {
			base: theme.markerColor,
			secondary: theme.markerColorSecondary,
			highlight: theme.markerColor === "var(--COLOR-ORANGE)" ? "white" : "var(--COLOR-BLACK)",
			border: theme.markerBorder,
			blend: theme.markerBlend,
			blur: theme.markerBlur,
			sizeStops: theme.markerSizeStops
		};
	}

	function selectTheme(theme: MapTheme): void {
		selectedTheme = theme;

		if (!globe) return;

		globe.setStyle(theme.style);
		glow.setColor(theme.glowColor);
		markers?.setColors(markerColors(theme));
	}

	/* restrict drag interaction to the globe disc */
	function pointerOnGlobe(e: MouseEvent | TouchEvent): boolean {
		const touch = "touches" in e ? e.touches[0] : null;
		const rect = globeContainer.getBoundingClientRect();
		const x = (touch ? touch.clientX : (e as MouseEvent).clientX) - rect.left;
		const y = (touch ? touch.clientY : (e as MouseEvent).clientY) - rect.top;

		return isPointOnGlobe(globe, x, y);
	}

	function blockOffGlobeDrag(e: MouseEvent | TouchEvent): void {
		if (!pointerOnGlobe(e)) {
			e.stopPropagation();
		}
	}

	/* scroll-driven zoom; padding is maplibre's camera padding, in px of the view: the globe centers in what it leaves, and a side a stop leaves out is 0 */
	type PaddingSide = "top" | "right" | "bottom" | "left";
	type ZoomStop = { scroll: number; zoom: number; cloudOpacity: number; padding?: Partial<Record<PaddingSide, number>> };

	/* the map fills the view at 50%, so the way out mirrors the way in */
	const ZOOM_STOPS: ZoomStop[] = [
		{ scroll: 0, zoom: 7, cloudOpacity: 0.38 },
		{ scroll: 50, zoom: 2, cloudOpacity: 0.62 },
		{ scroll: 100, zoom: 7, cloudOpacity: 0.38 }
	];

	/* linear interpolation between zoom stops */
	function getScrollValue(percentage: number, key: "zoom" | "cloudOpacity" | PaddingSide): number {
		const value = (stop: ZoomStop): number => (key === "zoom" || key === "cloudOpacity" ? stop[key] : stop.padding?.[key] ?? 0);

		for (let i = 1; i < ZOOM_STOPS.length; i++) {
			const to = ZOOM_STOPS[i];
			if (percentage > to.scroll) continue;

			const from = ZOOM_STOPS[i - 1];
			return value(from) + ((percentage - from.scroll) / (to.scroll - from.scroll)) * (value(to) - value(from));
		}

		return value(ZOOM_STOPS[ZOOM_STOPS.length - 1]);
	}

	let scrollObserver: MutationObserver;

	/* hook into `data-scroll-percentage` from animate.ts */
	function applyScrollZoom(): void {
		if (nativeZoom || !scrollWrapper.hasAttribute("data-scroll-percentage")) return;

		/* animate.ts's measure, unrounded, so the zoom doesn't step between its tenths of a percent */
		const { top, height } = scrollWrapper.getBoundingClientRect();
		const scrollPercentage = 100 * Math.min(1, Math.max(0, (window.innerHeight - top) / (window.innerHeight + height)));
		scrollPadding = { top: getScrollValue(scrollPercentage, "top"), right: getScrollValue(scrollPercentage, "right"), bottom: getScrollValue(scrollPercentage, "bottom"), left: getScrollValue(scrollPercentage, "left") };
		const scrollZoom = fitGlobeZoom(getScrollValue(scrollPercentage, "zoom"), top);
		/* leaving mode 2, the zoom eases from where it was */
		const zoomFrom = modeSwitch?.zoomFrom ?? null;
		const zoom = zoomFrom === null ? scrollZoom : fitGlobeZoom(zoomFrom + (scrollZoom - zoomFrom) * (modeSwitch?.t ?? 1), top, false);
		globeOffset = getGlobeOffset(zoom, top) * (1 - exploreShare);
		fitGlobeCanvas();
		globe.jumpTo({ zoom, padding: globePadding() }); /* one camera update for both, so the markers reproject once */
		exploreShown = !globeActive && (modeSwitch !== null || zoom < EXPLORE_SHOWN_BELOW_ZOOM);
	}

	/* while a map edge is on screen, the globe keeps far enough from it that neither globe nor glow is cut off */
	const GLOBE_EDGE_CLEARANCE = 0.1; /* of the globe's radius on screen: past the glow's 1/e distance, so the glow shows in full */
	const GLOBE_MIDDLE_EASE = 0.15; /* of the view's height: how far either side of filling the view the hold there eases off */
	const GLOBE_CANVAS_MAX = 4; /* views of height the canvas may grow to, well under WebGL's size limits */

	let globeOffset = 0; /* how far below the middle of the view the globe's center sits */
	let scrollPadding: Record<PaddingSide, number> = { top: 0, right: 0, bottom: 0, left: 0 }; /* the stops' padding at the last scroll update */
	let globeCanvasHeight = 0; /* the map container's height while it runs past the view, 0 at the view's own height */
	let globeCanvasAbove = false; /* the canvas runs up past the view's top on the way out, rather than down */
	let baseFov = 36.87; /* maplibre's default, read at mount; the view's camera keeps this focal length whatever the canvas's height */
	let fittedView = 0; /* the view's height the canvas was last fitted to */
	let fittingCanvas = false;

	/* the globe's on-screen radius at a zoom: R is the scale at its center, doubling per zoom level, seen from a focal length f as r = fR / √(f² + 2fR) */
	function globeRadiusAt(zoom: number, view: number): number {
		const center = globe.getCenter();
		const step = center.lat > 0 ? -0.1 : 0.1; /* degrees of latitude, toward the equator */
		const a = globe.project(center);
		const b = globe.project([center.lng, center.lat + step]);
		const R = (Math.hypot(b.x - a.x, b.y - a.y) / Math.abs((step * Math.PI) / 180)) * 2 ** (zoom - globe.getZoom());
		const f = view / 2 / Math.tan((baseFov * Math.PI) / 360);

		return (f * R) / Math.sqrt(f * f + 2 * f * R);
	}

	/* where the stops' padding puts the globe's center, from the view's top: maplibre's padded center, which it keeps on the canvas */
	function getPaddedCenter(view: number): number {
		return Math.min(view, Math.max(0, (scrollPadding.top + view - scrollPadding.bottom) / 2));
	}

	function getGlobeOffset(zoom: number, top: number = scrollWrapper.getBoundingClientRect().top): number {
		if (globe.getProjection()?.type !== "globe") return globeOffset;

		const view = globeWrapper.clientHeight;
		const padded = Math.round((getPaddedCenter(view) - view / 2) * 4) / 4;
		const radius = globeRadiusAt(zoom, view);
		const needed = (1 + GLOBE_EDGE_CLEARANCE) * radius - view / 2; /* how far from the middle, away from an edge, the center clears it */
		const blend = GLOBE_EDGE_CLEARANCE * radius;

		/* rounded off where it reaches 0, so the globe doesn't change pace there */
		const clear = (past: number): number => (past <= -blend ? 0 : past >= blend ? past : (past + blend) ** 2 / (4 * blend));
		const down = top > 0 ? clear(needed - padded) : 0; /* the map's top edge on screen */
		const up = window.innerHeight - top - view > 0 ? clear(needed + padded) : 0; /* its bottom edge */
		const cap = (GLOBE_CANVAS_MAX - 0.5) * view;

		return Math.round(Math.min(cap, Math.max(-cap, padded + down - up)) * 4) / 4;
	}

	/* the zoom held lower where the globe can't clear the map's edges: past the canvas's cap, and where the map fills the view */
	function fitGlobeZoom(zoom: number, top: number = scrollWrapper.getBoundingClientRect().top, middle: boolean = true): number {
		if (globe.getProjection()?.type !== "globe") return zoom;

		const view = globeWrapper.clientHeight;
		const f = view / 2 / Math.tan((baseFov * Math.PI) / 360);
		/* globeRadiusAt's r = fR / √(f² + 2fR), solved for R, which doubles per zoom level */
		const scale = (r: number) => (r * r + r * Math.sqrt(r * r + f * f)) / f;
		const zoomAt = (from: number, radius: number) => from + Math.log2(scale(radius) / scale(globeRadiusAt(from, view)));

		/* the radius whose offset reaches the cap; the zoom holds there only while an edge is on screen */
		const edges = top > 0 || window.innerHeight - top - view > 0;
		const largest = (GLOBE_CANVAS_MAX * view) / (1 + GLOBE_EDGE_CLEARANCE);
		let held = edges && globeRadiusAt(zoom, view) > largest ? zoomAt(zoom, largest) : zoom;

		const share = middle ? (1 - Math.min(1, Math.abs(top) / (GLOBE_MIDDLE_EASE * view))) ** 2 : 0;
		if (share > 0) {
			const height = scrollWrapper.offsetHeight;
			const filled = (100 * window.innerHeight) / (window.innerHeight + height); /* the scroll at which the map fills the view */
			const filledZoom = getScrollValue(filled, "zoom");
			const filledOffset = Math.min(view, Math.max(0, (getScrollValue(filled, "top") + view - getScrollValue(filled, "bottom")) / 2)) - view / 2;
			/* the largest radius that clears both edges from there, with room for the rounding off */
			const fits = (view / 2 - Math.abs(filledOffset)) / (1 + 2 * GLOBE_EDGE_CLEARANCE);
			const short = Math.max(0, filledZoom - zoomAt(filledZoom, fits));
			const scrolled = 100 * Math.min(1, Math.max(0, (window.innerHeight - top) / (window.innerHeight + height)));
			if (short > 0) held = Math.min(held, getScrollValue(scrolled, "zoom") - short * share);
		}

		return held;
	}

	/* maplibre keeps the globe's center on its canvas, so a center off the view needs a taller canvas, grown once per side */
	function fitGlobeCanvas(): void {
		const view = globeWrapper.clientHeight;
		const fits = Math.abs(globeOffset) <= view / 2;
		const above = globeOffset < 0;
		if (view === fittedView && (fits ? globeCanvasHeight === 0 : above === globeCanvasAbove && globeCanvasHeight >= view / 2 + Math.abs(globeOffset))) return;

		if (fits) {
			globeCanvasHeight = 0;
		} else {
			const filled = (100 * window.innerHeight) / (window.innerHeight + scrollWrapper.offsetHeight);
			const side = ZOOM_STOPS.filter((stop) => (above ? stop.scroll > filled : stop.scroll < filled)).map((stop) => stop.zoom);
			const sideZoom = Math.max(...side, getScrollValue(filled, "zoom"));
			const room = Math.max(Math.abs(globeOffset), (1 + GLOBE_EDGE_CLEARANCE) * globeRadiusAt(sideZoom, view) - view / 2);

			globeCanvasHeight = Math.ceil(Math.min(view / 2 + room, GLOBE_CANVAS_MAX * view));
		}

		globeCanvasAbove = above;
		globeContainer.style.height = globeCanvasHeight ? `${globeCanvasHeight}px` : "";
		/* so the grid row, and the sidebar in it, stay the view's height */
		globeContainer.style.marginTop = globeCanvasHeight && above ? `${view - globeCanvasHeight}px` : "";
		globeContainer.style.marginBottom = globeCanvasHeight && !above ? `${view - globeCanvasHeight}px` : "";

		fittedView = view;
		fittingCanvas = true;
		globe.resize();
		fittingCanvas = false;

		/* the same focal length as the view's own camera, so the canvas only runs further along the same picture */
		const height = globeCanvasHeight || view;
		globe.setVerticalFieldOfView((2 * Math.atan(height / 2 / (view / 2 / Math.tan((baseFov * Math.PI) / 360))) * 180) / Math.PI);
	}

	/* the globe's center goes down to the middle of the view plus the offset, and across by the stops' padding or the sidebar */
	function globePadding(): { top: number; bottom: number; left: number; right: number } {
		const view = globeWrapper.clientHeight;
		const height = globeCanvasHeight || view;
		const above = globeCanvasHeight && globeCanvasAbove ? height - view : 0; /* the canvas's run up past the view */
		const shift = 2 * (above + view / 2 + globeOffset) - height;
		const left = scrollPadding.left * (1 - exploreShare);
		const right = scrollPadding.right + (sidebarInset - scrollPadding.right) * exploreShare;

		return shift >= 0 ? { top: shift, bottom: 0, left, right } : { top: 0, bottom: -shift, left, right };
	}

	/* after the projection or the map's size changes */
	function applyGlobeOffset(): void {
		if (fittingCanvas) return;

		if (globeActive) measureSidebarInset(); /* the sidebar's width goes with the window's */

		if (nativeZoom) {
			globeOffset = 0;
			fitGlobeCanvas();
			globe.jumpTo({ padding: globePadding() });
			return;
		}

		const zoom = fitGlobeZoom(globe.getZoom()); /* a shorter view has room for less */
		globeOffset = getGlobeOffset(zoom) * (1 - exploreShare);
		fitGlobeCanvas();
		globe.jumpTo({ zoom, padding: globePadding() });
	}

	/* by the scroll in mode 1, by the zoom in mode 2, and eased from mode 2's on the way out */
	function getCloudOpacity(): number {
		if (nativeZoom) return getExploreCloudOpacity(globe.getZoom());

		const scrolled = getScrollValue(Number(scrollWrapper.getAttribute("data-scroll-percentage") ?? 0), "cloudOpacity");
		const from = modeSwitch?.cloudFrom ?? null;

		return from === null ? scrolled : from + (scrolled - from) * (modeSwitch?.t ?? 1);
	}

	/* modes: mode 1 scrolls past the globe; mode 2, from the Explore button, locks the page and hands the zoom to maplibre */
	type ExploreStop = { zoom: number; cloudOpacity: number };

	type ModeSwitch = {
		start: number;
		t: number; /* eased, 0 to 1 */
		shareFrom: number;
		shareTo: number;
		scrollFrom: number;
		scrollTo: number;
		/* eased from these to the scroll's zoom and clouds; null for the scroll's own */
		zoomFrom: number | null;
		cloudFrom: number | null;
	};

	const EXPLORE_STOPS: ExploreStop[] = [
		{ zoom: 2, cloudOpacity: 0.62 },
		{ zoom: 8, cloudOpacity: 0 }
	];
	const EXPLORE_MIN_ZOOM = 2;
	const EXPLORE_MAX_ZOOM = 14;
	const EXPLORE_SHOWN_BELOW_ZOOM = 4;
	const MODE_SWITCH_DURATION = 800;

	let globeActive = false; /* from the press that enters mode 2 to the one that leaves it */
	let nativeZoom = false; /* once the map has lined up with the view in mode 2 */
	let exploreShown = false;
	let exploreButton: HTMLButtonElement;
	let closeButton: HTMLButtonElement;
	let exploreShare = 0; /* how far the camera has moved from mode 1's place toward mode 2's, 0 to 1 */
	let sidebarInset = 0; /* mode 2's right padding */
	let modeSwitch: ModeSwitch | null = null;
	let modeSwitchFrame = 0;
	let pageStyle: { overflow: string; gutter: string } | null = null; /* the root's inline styles before the lock */

	/* linear interpolation between explore stops, held past either end */
	function getExploreCloudOpacity(zoom: number): number {
		const at = Math.max(zoom, EXPLORE_STOPS[0].zoom);

		for (let i = 1; i < EXPLORE_STOPS.length; i++) {
			const to = EXPLORE_STOPS[i];
			if (at > to.zoom) continue;

			const from = EXPLORE_STOPS[i - 1];
			return from.cloudOpacity + ((at - from.zoom) / (to.zoom - from.zoom)) * (to.cloudOpacity - from.cloudOpacity);
		}

		return EXPLORE_STOPS[EXPLORE_STOPS.length - 1].cloudOpacity;
	}

	/* the map lines up with the view as the sidebar comes in, then maplibre's zoom takes over */
	async function enterExplore(): Promise<void> {
		if (globeActive) return;

		const focusOnExplore = document.activeElement === exploreButton;

		globeActive = true;
		sidebarShown = true;
		exploreShown = false;
		lockPage();
		measureSidebarInset();

		/* pressed again partway out, the zoom eases on from where it is */
		const zoomFrom = modeSwitch && modeSwitch.zoomFrom !== null ? globe.getZoom() : null;
		startModeSwitch(1, window.scrollY + scrollWrapper.getBoundingClientRect().top, zoomFrom, null);

		/* the Explore button fades out of reach, and Close takes its place in the sidebar's menu */
		if (focusOnExplore) {
			await tick();
			closeButton.focus({ preventScroll: true });
		}
	}

	/* the camera eases from where mode 2 left it back to the scroll's place */
	async function leaveExplore(): Promise<void> {
		if (!globeActive) return;

		const zoom = globe.getZoom();
		const cloudOpacity = getCloudOpacity();
		const focusInSidebar = sidebar.contains(document.activeElement);

		globeActive = false;
		sidebarShown = false;
		exploreShown = true;
		setNativeZoom(false);
		unlockPage();
		startModeSwitch(0, window.scrollY, zoom, cloudOpacity);

		/* the sidebar fades out of reach, and the Explore button comes back */
		if (focusInSidebar) {
			await tick();
			exploreButton.focus({ preventScroll: true });
		}
	}

	function startModeSwitch(shareTo: number, scrollTo: number, zoomFrom: number | null, cloudFrom: number | null): void {
		cancelAnimationFrame(modeSwitchFrame);

		/* with reduced motion, all at once */
		const start = performance.now() - (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? MODE_SWITCH_DURATION : 0);
		modeSwitch = { start, t: 0, shareFrom: exploreShare, shareTo, scrollFrom: window.scrollY, scrollTo, zoomFrom, cloudFrom };
		stepModeSwitch();
	}

	function stepModeSwitch(): void {
		if (!modeSwitch) return;

		const progress = Math.min(1, (performance.now() - modeSwitch.start) / MODE_SWITCH_DURATION);
		const { shareFrom, shareTo, scrollFrom, scrollTo } = modeSwitch;
		modeSwitch.t = cubicInOut(progress);
		exploreShare = shareFrom + (shareTo - shareFrom) * modeSwitch.t;

		/* a locked page still scrolls from script */
		if (scrollTo !== scrollFrom) {
			const top = scrollFrom + (scrollTo - scrollFrom) * modeSwitch.t;
			try {
				window.scrollTo({ top, behavior: "instant" as ScrollBehavior });
			} catch {
				window.scrollTo(0, top); /* older Safari rejects "instant", as in +layout.svelte */
			}
		}

		applyScrollZoom();

		if (progress < 1) {
			modeSwitchFrame = requestAnimationFrame(stepModeSwitch);
			return;
		}

		modeSwitch = null;

		if (shareTo === 1) {
			setNativeZoom(true);
		} else {
			applyScrollZoom(); /* the Explore button goes by the zoom again */
		}
	}

	function setNativeZoom(on: boolean): void {
		nativeZoom = on;

		if (on) {
			globe.setMinZoom(Math.min(EXPLORE_MIN_ZOOM, globe.getZoom())); /* lower where the globe was held smaller to fit the view */
			globe.setMaxZoom(EXPLORE_MAX_ZOOM);
			/* around the center, where a project turned to stays */
			globe.scrollZoom.enable({ around: "center" });
			globe.touchZoomRotate.enable({ around: "center" });
			globe.cooperativeGestures.disable();
		} else {
			globe.scrollZoom.disable();
			globe.touchZoomRotate.enable();
			globe.cooperativeGestures.enable();
			globe.setMinZoom(null);
			globe.setMaxZoom(null);
		}
	}

	function lockPage(): void {
		if (pageStyle) return;

		const root = document.documentElement.style;
		pageStyle = { overflow: root.getPropertyValue("overflow"), gutter: root.getPropertyValue("scrollbar-gutter") };
		/* a scrollbar's room stays, so nothing beside it moves */
		if (window.innerWidth > document.documentElement.clientWidth) root.setProperty("scrollbar-gutter", "stable");
		root.setProperty("overflow", "hidden");
	}

	function unlockPage(): void {
		if (!pageStyle) return;

		const root = document.documentElement.style;
		root.setProperty("overflow", pageStyle.overflow);
		root.setProperty("scrollbar-gutter", pageStyle.gutter);
		pageStyle = null;
	}

	/* so in mode 2 the globe centers in what the sidebar leaves */
	function measureSidebarInset(): void {
		sidebarInset = Math.max(0, globeWrapper.getBoundingClientRect().right - sidebar.getBoundingClientRect().left);
	}

	function onWindowKeydown(e: KeyboardEvent): void {
		if (e.key === "Escape" && globeActive && !e.defaultPrevented) leaveExplore();
	}

	/* focus leaving the globe would otherwise land on the locked page behind it */
	function onScrollWrapperFocusOut(e: FocusEvent): void {
		const target = e.relatedTarget as Node | null;
		if (globeActive && target && !scrollWrapper.contains(target)) leaveExplore();
	}

	/* tile prefetch: until a tile arrives, maplibre draws a coarser level in its place, so the levels next to the view are fetched ahead into the browser cache */
	const prefetchedTiles = new Set<string>();
	let prefetchLevel = NaN;
	let prefetchCenter = "";

	function prefetchTiles(center: LngLat, zoom: number): void {
		const { clientWidth: width, clientHeight: height } = globe.getContainer();
		const sourceIds = new Set(globe.getLayersOrder().map((id) => globe.getLayer(id)!).filter((layer) => layer.source && !layer.isHidden(zoom)).map((layer) => layer.source));

		for (const id of sourceIds) {
			const source = globe.getSource<VectorTileSource | RasterTileSource>(id);
			if (!source?.tiles?.length) continue;

			/* the level maplibre loads at this zoom, and the on-screen width of one of its tiles */
			const level = Math.min((source.type === "vector" ? Math.floor : Math.round)(zoom + Math.log2(512 / source.tileSize)), source.maxzoom);
			if (level < source.minzoom) continue;

			const tileWidth = 512 * 2 ** (zoom - level);
			const count = 2 ** level;
			const x = ((center.lng + 180) / 360) * count;
			const y = ((1 - Math.log(Math.tan(Math.PI / 4 + (center.lat * Math.PI) / 360)) / Math.PI) / 2) * count;

			for (let tx = Math.floor(x - width / 2 / tileWidth); tx <= Math.floor(x + width / 2 / tileWidth); tx++) {
				for (let ty = Math.max(Math.floor(y - height / 2 / tileWidth), 0); ty <= Math.min(Math.floor(y + height / 2 / tileWidth), count - 1); ty++) {
					const wrappedX = ((tx % count) + count) % count;
					const url = source.tiles[(wrappedX + ty) % source.tiles.length].replace("{z}", String(level)).replace("{x}", String(wrappedX)).replace("{y}", String(source.scheme === "tms" ? count - 1 - ty : ty));
					if (prefetchedTiles.has(url)) continue;

					prefetchedTiles.add(url);
					/* the body is read so the whole response is cached */
					fetch(url, { priority: "low" } as RequestInit).then((response) => response.blob()).catch(() => prefetchedTiles.delete(url));
				}
			}
		}
	}

	/* runs once the view has loaded and the camera has stopped, so prefetching never competes with tiles needed now */
	function prefetchAround(): void {
		if (!inView || globe.isMoving() || !globe.isStyleLoaded()) return;

		const level = Math.floor(globe.getZoom());
		const center = globe.getCenter();
		const moved = String(center) !== prefetchCenter;
		if (!moved && level === prefetchLevel) return;

		/* both neighboring levels at first and after a turn or drag; then only the one the zoom is heading for */
		if (moved || level < prefetchLevel) prefetchTiles(center, level - 1);
		if (moved || level > prefetchLevel) prefetchTiles(center, level + 1);
		prefetchLevel = level;
		prefetchCenter = String(center);
	}

	/* data: the feed's projects, minus any without coordinates */
	$: projects = globeProjectsFromFeedItems(feedData);

	$: markerLocations = projects.map((project): MarkerLocation => ({
		lngLat: new maplibregl.LngLat(project.longitude, project.latitude),
		title: project.title
	}));

	/* filters: services and markets by id, the location by name; an empty selection matches everything */
	$: filterGroups = feedFilters.filter((group) => group.arrayOf === "services" || group.arrayOf === "markets");

	async function loadFilters(): Promise<void> {
		const menuGroups = feedFilters.filter((group) => filterMenuCollection(group.arrayOf));

		await Promise.all(menuGroups.map(async (group) => {
			const filterItems = await loadFilterItems(group.arrayOf);

			if (filterItems.length > 0) {
				group.filterItems = mergeFilterItems(filterItems, group.filterItems);
				feedFilters = feedFilters;
			}
		}));
	}

	function toggleFilterId(group: FeedFilters[number], id?: string | null): void {
		if (!id) return;

		group.filterIds = group.filterIds.includes(id)
			? group.filterIds.filter((filterId) => filterId !== id)
			: [...group.filterIds, id];
		feedFilters = feedFilters;
	}

	let locationSelection: LocationSelection = emptyLocationSelection();
	let locationStep = 0;

	let openFilter = "";

	function toggleFilter(name: string): void {
		openFilter = openFilter === name ? "" : name;
		locationStep = 0;
	}

	$: locationEntries = locationGroups(projects, locationSelection, locationStep);
	$: locationIsSelected = hasLocationSelection(locationSelection);
	$: nextLocation = nextLocationStep(projects, locationSelection, locationStep);

	let hideNonMatching = false; /* false dims non-matching markers, true culls them */

	$: searchTerm = globeSearchTerm(searchText);

	/* recomputed when the filters change rather than per frame */
	$: projectMatches = projects.map((project) => globeProjectMatches(project, feedFilters, locationSelection, searchTerm));

	$: matchCount = projectMatches.filter(Boolean).length;

	$: itemLink = (project: GlobeProject): string | undefined =>
		data.feed_source === "Projects" && project.slug ? `/work/${project.slug}${itemParams}` : undefined;

	/* markers */
	let markers: GlobeMarkers | undefined;
	let tooltip: HTMLDivElement;

	/* shared marker + sidebar state */
	let hoveredMarkerIndex: number | null = null;
	let activeMarkerIndex: number | null = null;

	$: markers?.setLocations(markerLocations);
	$: markers?.setMatches(projectMatches, hideNonMatching);
	$: markers?.setHighlight(hoveredMarkerIndex, activeMarkerIndex);

	function onMarkerHover(index: number | null): void {
		hoveredMarkerIndex = index;

		if (index !== null && activeMarkerIndex !== null && activeMarkerIndex !== index) {
			activeMarkerIndex = null;
		}

		/* the sidebar shows only in mode 2 */
		if (index !== null && globeActive) {
			revealSidebarItem(index);
		}
	}

	/* an item keeps its image once opened, so it can slide closed with it */
	$: openedProjects = projects.map((): boolean => false);

	function activateProject(index: number): void {
		activeMarkerIndex = index;
		openedProjects[index] = true;
	}

	/* in mode 1, a marker enters mode 2 with its project open */
	function onMarkerClick(index: number): void {
		enterExplore();
		activateProject(index);
		revealSidebarItem(index);
	}

	/* revealing a marker's item in the results */
	let sidebarBody: HTMLDivElement;
	let sidebarItems: HTMLDivElement[] = [];
	let stopReveal: (() => void) | undefined;

	/* nearest scrollTop that shows the whole enlarged item, or its top if it's taller than the list */
	function scrollTopToShow(item: HTMLElement): number {
		const room = parseFloat(getComputedStyle(sidebarBody).paddingTop); /* the enlarged edge, which the scroll area pads for */
		const offset = sidebarBody.scrollTop - sidebarBody.getBoundingClientRect().top;
		const { top, bottom } = item.getBoundingClientRect();
		const itemTop = top + offset - room;
		const itemBottom = bottom + offset + room;
		const visibleHeight = sidebarBody.clientHeight;
		let target = sidebarBody.scrollTop;

		if (itemTop < target || itemBottom - itemTop > visibleHeight) {
			target = itemTop;
		} else if (itemBottom > target + visibleHeight) {
			target = itemBottom - visibleHeight;
		}

		return Math.max(0, Math.min(target, sidebarBody.scrollHeight - visibleHeight));
	}

	function revealSidebarItem(index: number): void {
		stopReveal?.();

		/* a quarter of the remaining distance per 60fps frame, whatever the display's rate */
		const easing = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0.25;
		const start = performance.now();
		const input = new AbortController();
		let previous: number | undefined;
		let frame: number;

		function step(now: number): void {
			const item = sidebarItems[index];
			const elapsed = now - start;

			/* the open and close transitions take 0.4s; past two seconds something else is moving the list */
			if (!item || !sidebarBody || elapsed > 2000) {
				stop();
				return;
			}

			const distance = scrollTopToShow(item) - sidebarBody.scrollTop;
			const frames = previous === undefined ? 1 : (now - previous) / (1000 / 60);
			const share = elapsed > 1000 ? 1 : 1 - Math.pow(1 - easing, frames); /* after a second, the rest at once, for slow frame rates */
			previous = now;

			if (Math.abs(distance) >= 1) {
				/* scroll offsets round to whole pixels, so the last steps go the whole way */
				sidebarBody.scrollTop += Math.abs(distance * share) < 1 ? distance : distance * share;
			} else if (elapsed > 450) {
				stop();
				return;
			}

			frame = requestAnimationFrame(step);
		}

		/* the visitor scrolling, dragging or typing takes over */
		function stop(): void {
			cancelAnimationFrame(frame);
			input.abort();
			if (stopReveal === stop) stopReveal = undefined;
		}

		for (const type of ["wheel", "pointerdown", "keydown"]) {
			window.addEventListener(type, stop, { passive: true, signal: input.signal });
		}

		stopReveal = stop;
		frame = requestAnimationFrame(step);
	}

	/* sidebar: the menu buttons swap the results for one panel */
	type SidebarView = "results" | "filter" | "search";

	let sidebarView: SidebarView = "results";
	let sidebarShown = false; /* in mode 2 */
	let sidebar: HTMLElement;
	let sidebarMenu: HTMLDivElement;

	/* the pressed button often leaves with the old view, so focus falls back to the first menu button */
	async function keepMenuFocus(): Promise<void> {
		const pressed = document.activeElement;

		await tick();

		const active = document.activeElement;

		if (active === null || active === document.body || (active === pressed && sidebar?.contains(pressed))) {
			sidebarMenu?.querySelector("button")?.focus();
		}
	}

	function showSidebarView(view: SidebarView): void {
		sidebarView = view;
		locationStep = 0; /* the filter panel reopens at the first location step */
		keepMenuFocus();
	}

	function showResults(): void {
		sidebarView = "results";
		keepMenuFocus();
	}

	const filterCta = {
		cta_type: "link",
		cta_style: "light",
		cta_hover_highlight: "light"
	};

	const itemActionCta = {
		...filterCta,
		cta_icon_position: "left"
	};

	function rotateGlobeTo(center: LngLat): void {
		globe.easeTo({ center, duration: 800 });
	}

	/* the globe turns to a hovered item only once the pointer settles on it, so passing over the list leaves the globe where it is */
	const SIDEBAR_ROTATE_DELAY = 500;
	const SIDEBAR_ROTATE_TOLERANCE = 6; /* px a settled pointer may still drift */

	let hoverRotateTimer: number;
	let pendingRotateIndex: number | null = null;
	let pendingRotatePoint = { x: 0, y: 0 };
	let rotatedToIndex: number | null = null; /* the item the globe last turned to, so settling on it again doesn't restart the turn */
	let sidebarPointer = { x: 0, y: 0 }; /* where the pointer last was over an item, for when the list scrolls under it */

	/* an item the list scrolls under a still pointer gets mouseenter but no mousemove, so entering starts the wait too */
	function onSidebarHover(index: number, e: MouseEvent): void {
		hoveredMarkerIndex = index;
		onSidebarMove(index, e);
	}

	function onSidebarMove(index: number, e: MouseEvent): void {
		sidebarPointer = { x: e.clientX, y: e.clientY };
		waitToRotate(index);
	}

	/* the list scrolling under the pointer moves it over the item as moving the pointer would, so it starts the wait over */
	function onSidebarScroll(): void {
		if (pendingRotateIndex !== null) waitToRotate(pendingRotateIndex);
	}

	/* the pointer's drift is measured over the list's content, so the pointer moving and the list scrolling count alike */
	function waitToRotate(index: number): void {
		const point = { x: sidebarPointer.x, y: sidebarPointer.y + sidebarBody.scrollTop };

		if (index === rotatedToIndex) return;
		if (index === pendingRotateIndex && Math.hypot(point.x - pendingRotatePoint.x, point.y - pendingRotatePoint.y) <= SIDEBAR_ROTATE_TOLERANCE) return;

		clearTimeout(hoverRotateTimer);
		pendingRotateIndex = index;
		pendingRotatePoint = point;
		hoverRotateTimer = window.setTimeout(() => {
			pendingRotateIndex = null;
			rotatedToIndex = index;
			rotateGlobeTo(markerLocations[index].lngLat);
		}, SIDEBAR_ROTATE_DELAY);
	}

	function cancelSidebarRotate(): void {
		clearTimeout(hoverRotateTimer);
		pendingRotateIndex = null;
	}

	function onSidebarLeave(): void {
		hoveredMarkerIndex = null;
		rotatedToIndex = null;
		cancelSidebarRotate();
	}

	function onSidebarClick(index: number): void {
		cancelSidebarRotate();

		if (activeMarkerIndex === index) {
			activeMarkerIndex = null;
			return;
		}

		activateProject(index);
		rotatedToIndex = index;
		rotateGlobeTo(markerLocations[index].lngLat);
	}

	/* clouds */
	const CLOUD_TEXTURE = "/img/fair_clouds_2k_fade.jpg";
	const CLOUD_PERIOD = 2000000;
	const CLOUD_REPAINT_INTERVAL = 125; /* about one texel of movement */

	let clouds: GlobeClouds;
	let glow: GlobeGlow;
	let glowOverflow: HTMLDivElement;
	let glowOverflowBelow: HTMLDivElement;
	let glowRoomObserver: ResizeObserver;

	/* of the view's height: the farthest past the limb the glow falls to 1/e; it only narrows the large globe at either end */
	const GLOW_SPREAD = 0.06;

	/* the glow below the map stops at the page's end, so it adds no room to scroll into */
	function fitGlowBelow(): void {
		glowOverflowBelow.style.maxHeight = `${Math.max(0, document.body.getBoundingClientRect().bottom - scrollWrapper.getBoundingClientRect().bottom)}px`;
	}

	let inView = false;
	let viewObserver: IntersectionObserver;

	function updateActivity(): void {
		if (inView && !document.hidden) {
			clouds?.start();
			markers?.resume();
		} else {
			clouds?.stop();
			markers?.pause();
		}
	}

	/* lifecycle */
	onMount(() => {
		loadFilters();

		/* load globe */
		maplibregl.setWorkerUrl(workerUrl);

		globe = new maplibregl.Map({
			container: globeContainer,
			style: selectedTheme.style,
			center: [-118.30, 34.05],
			zoom: 3,
			attributionControl: false
		});

		baseFov = globe.getVerticalFieldOfView();
		globe.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");

		/* maplibre opens the compact attribution once attributions load unless the compact class is already present */
		const attribution = globe.getContainer().querySelector(".maplibregl-ctrl-attrib")!;
		attribution.classList.add("maplibregl-compact");
		attribution.classList.remove("maplibregl-compact-show");

		globe.scrollZoom.disable();
		globe.cooperativeGestures.enable(); /* mode 1: one finger scrolls the page past the globe, two move it */

		clouds = createGlobeClouds(globe, {
			texture: CLOUD_TEXTURE,
			period: CLOUD_PERIOD,
			repaintInterval: CLOUD_REPAINT_INTERVAL,
			getOpacity: getCloudOpacity
		});

		glow = createGlobeGlow(globe, { color: selectedTheme.glowColor, opacity: 0.8, width: 0.07, spread: () => GLOW_SPREAD * window.innerHeight, inner: 28, overflow: glowOverflow, overflowBelow: glowOverflowBelow });

		globe.on("style.load", () => {
			globe.setProjection({ type: "globe" });
			applyGlobeOffset();

			/* lighting: currently this does not provide surface shading;
			   it only illuminates the atmosphere */
			globe.setLight({
				anchor: "viewport",
				color: "white",
				intensity: 0.2,
				position: [1.5, 210, 30]
			});

			/* atmosphere */
			globe.setSky({
				"sky-color": "#062e2c",
				"horizon-color": "#3fe0c0",
				"fog-color": "#04302c",
				"sky-horizon-blend": 0.65,
				"atmosphere-blend": 0 /* off for the glow layer's rim: maplibre's atmosphere is blue-white and can't be tinted */
			});

			clouds.add();
			glow.add();
		});

		/* capture on the globe container so this runs before MapLibre's own
		   handlers, which are bound to the canvas container */
		globe.getContainer().addEventListener("mousedown", blockOffGlobeDrag as EventListener, true);
		globe.getContainer().addEventListener("touchstart", blockOffGlobeDrag as EventListener, true);

		globe.getContainer().addEventListener("mousemove", (e: MouseEvent) => {
			globe.getContainer().classList.toggle("off-globe", !pointerOnGlobe(e));
		});

		globe.on("sourcedata", prefetchAround); /* fires as each tile arrives */
		globe.on("resize", applyGlobeOffset);

		/* scroll-driven zoom */
		scrollObserver = new MutationObserver(applyScrollZoom);
		scrollObserver.observe(scrollWrapper, { attributeFilter: ["data-scroll-percentage"] });
		applyScrollZoom();

		viewObserver = new IntersectionObserver(([entry]) => {
			inView = entry.isIntersecting;
			updateActivity();
		});
		viewObserver.observe(globeWrapper);
		document.addEventListener("visibilitychange", updateActivity);

		glowRoomObserver = new ResizeObserver(fitGlowBelow);
		glowRoomObserver.observe(document.body);

		/* after load, so the markers and cloud texture don't compete with the initial tile requests */
		globe.on("load", () => {
			markers = createGlobeMarkers(globe, {
				tooltip,
				colors: markerColors(selectedTheme),
				hitRadius: 12,
				onHover: onMarkerHover,
				onClick: onMarkerClick
			});
			updateActivity();
			clouds.load();
		});

		/* teardown here rather than in onDestroy, which also runs on the server */
		return () => {
			cancelAnimationFrame(modeSwitchFrame);
			unlockPage();
			scrollObserver.disconnect();
			viewObserver.disconnect();
			document.removeEventListener("visibilitychange", updateActivity);
			glowRoomObserver.disconnect();
			clearTimeout(hoverRotateTimer);
			stopReveal?.();
			clouds.destroy();
			markers?.destroy();
			globe.remove();
		};
	});
</script>

<svelte:window on:keydown={onWindowKeydown} />

<template>
	<div
		class="globe-scroll-wrapper"
		class:active={globeActive}
		style:--background-color={selectedTheme.background}
		bind:this={scrollWrapper}
		use:animate={{ trigger: AnimateTrigger.WhileScrollingInView, animClass: "null" }}
		on:focusout={onScrollWrapperFocusOut}
	>
		<!-- the glow above the top of the map, past the canvas and the wrapper's clip -->
		<div class="globe-glow-overflow" bind:this={glowOverflow}></div>
		<!-- outside the map's clip, so it can stay below the header while the map runs up past the view -->
		<button
			type="button"
			class="globe-explore"
			class:shown={exploreShown}
			bind:this={exploreButton}
			on:click={enterExplore}
		>Explore</button>
		<div class="globe-wrapper" bind:this={globeWrapper}>
			<div class="globe-container" bind:this={globeContainer}></div>

			<div class="globe-marker-tooltip" role="tooltip" bind:this={tooltip}></div>
			<aside class="globe-sidebar" class:shown={sidebarShown} data-theme={selectedTheme.sidebarTheme} bind:this={sidebar}>
				<div class="globe-sidebar-menu" bind:this={sidebarMenu}>
					{#if sidebarView !== "results"}
						<button
							type="button"
							on:click={showResults}
						>← Back</button>
					{/if}
					{#if sidebarView !== "filter"}
						<button
							type="button"
							on:click={() => showSidebarView("filter")}
						>Filter</button>
					{/if}
					{#if sidebarView !== "search"}
						<button
							type="button"
							on:click={() => showSidebarView("search")}
						>Search</button>
					{/if}
					<button
						type="button"
						bind:this={closeButton}
						on:click={leaveExplore}
					>Close</button>
				</div>
				<div class="globe-sidebar-body" bind:this={sidebarBody} on:scroll={onSidebarScroll}>
					{#if sidebarView !== "results"}
						<div class="globe-sidebar-panels" transition:slide={{ duration: 400 }}>
							{#if sidebarView === "filter"}
								<div class="globe-sidebar-panel"
								 in:fade={{ duration: 200, delay: 201 }}
								 out:fade={{ duration: 200 }}
								>
									{#each filterGroups as group}
										<div class="globe-sidebar-filter">
											<Cta button
												 data={ {...filterCta,
														 cta_text_light: `Filter by ${filterMenuLabel(group.arrayOf)}`,
														 cta_icon: `${openFilter === group.arrayOf ? "arrow_up" : "arrow_down"}`
													  } }
												 aria-expanded={openFilter === group.arrayOf ? "true" : "false"}
												 on:click={() => toggleFilter(group.arrayOf)}
											/>
											{#if openFilter === group.arrayOf}
												<div class="globe-sidebar-container" transition:slide={{ duration: 400 }}>
													{#if group.filterItems.length > 0}
														<div class="filter-group">
															{#each globeFilterOptions(group, projects) as item}
																<div>
																	<DataFeedFilterMenuItem sizeOverride="sm"
																		data={ { item_name: item.name,
																				 item_checked: group.filterIds.includes(item.id ?? ""),
																				 input_name: group.arrayOf,
																				 input_value: item.id
																			 } }
																		on:change={() => toggleFilterId(group, item.id)}
																	/>
																</div>
															{/each}
														</div>
													{:else}
														<p>Loading…</p>
													{/if}
												</div>
											{/if}
										</div>
									{/each}
									<div class="globe-sidebar-filter">
										<Cta button
											 data={ {...filterCta,
													 cta_text_light: "Filter by Location",
													 cta_icon: `${openFilter === "Location" ? "arrow_up" : "arrow_down"}`
												  } }
											 aria-expanded={openFilter === "Location" ? "true" : "false"}
											 on:click={() => toggleFilter("Location")}
										/>
										{#if openFilter === "Location"}
											<div class="globe-sidebar-container" transition:slide={{ duration: 400 }}>
												<p>{locationStep === 0 ? "Select a region or country." : `Select a ${LOCATION_LEVELS[locationStep].name.toLowerCase()}.`}</p>
												{#each locationEntries as group}
													<div class="filter-group">
														{#each group as entry}
															<svelte:element this={entry.level === 0 ? "h2" : "div"}>
																<DataFeedFilterMenuItem sizeOverride="sm"
																	data={ { item_name: entry.value,
																			 item_checked: isLocationSelected(locationSelection, entry)
																		 } }
																	on:change={() => locationSelection = toggleLocation(locationSelection, entry)}
																/>
															</svelte:element>
														{/each}
													</div>
												{/each}
												{#if locationIsSelected}
													<div class="filter-actions">
														<Cta button
															 data={ {...filterCta,
																	 cta_text_light: `${matchCount} ${matchCount === 1 ? "Result" : "Results"} ✓`,
																	 cta_icon: "none"
																  } }
															 on:click={showResults}
														/>
														{#if nextLocation}
															<Cta button
																 data={ {...filterCta,
																		 cta_text_light: `${nextLocation.count} ${LOCATION_LEVELS[nextLocation.step].plural} →`,
																		 cta_icon: "none"
																	  } }
																 on:click={() => locationStep = nextLocation.step}
															/>
														{/if}
													</div>
												{/if}
											</div>
										{/if}
									</div>
								</div>
							{:else if sidebarView === "search"}
								<div class="globe-sidebar-panel"
								 in:fade={{ duration: 200, delay: 201 }}
								 out:fade={{ duration: 200 }}
								>
									<div class="globe-sidebar-container">
										<DataFeedFilterMenuSearch bind:value={searchText} autofocus on:submit={showResults} />
									</div>
								</div>
							{/if}
						</div>
					{:else}
						{#if matchCount === 0}
							<p class="globe-sidebar-empty">No results match your query. Try another search or set of filters.</p>
						{/if}
						{#each projects as project, index}
							{#if projectMatches[index]}
								{@const link = itemLink(project)}
								<div
									class="globe-sidebar-item"
									bind:this={sidebarItems[index]}
									class:hovered={index === hoveredMarkerIndex}
									class:active={index === activeMarkerIndex}
									on:mouseenter={(e) => onSidebarHover(index, e)}
									on:mousemove={(e) => onSidebarMove(index, e)}
									on:mouseleave={onSidebarLeave}
								>
									<button
										type="button"
										aria-expanded={index === activeMarkerIndex ? "true" : "false"}
										on:click={() => onSidebarClick(index)}
									>
										<!-- the open item's image replaces it; lazy, as most of the list is out of view, and decorative beside the title -->
										<span class="sidebar-item-thumb">
											{#if project.image?.filename_disk}
												<img src={assetUrl(project.image.filename_disk)} alt="" loading="lazy" decoding="async" />
											{/if}
										</span>
										<span class="sidebar-item-location">{project.location}</span>
										<span class="sidebar-item-title">{project.title}</span>
									</button>
									<div class="globe-sidebar-item-details">
										<div>
											{#if openedProjects[index]}
												{#if project.image?.filename_disk}
													<img src={assetUrl(project.image.filename_disk)} alt={project.image.title ?? ""} />
												{/if}
												<div class="globe-sidebar-item-action">
													<Cta button disabled sizeOverride="sm"
														 data={ {...itemActionCta,
																 cta_text_light: "Details",
																 cta_icon: "plus"
															  } }
													/>
												</div>
												{#if link}
													<div class="globe-sidebar-item-action">
														<Cta sizeOverride="sm"
															 data={ {...itemActionCta,
																	 cta_text_light: "View case study",
																	 cta_icon: "arrow_up_left",
																	 cta_link: link
																  } }
														/>
													</div>
												{/if}
											{:else if link}
												<!-- a plain link until the item first opens, so the server's markup links every project without a Cta per item -->
												<a href={link}>View case study</a>
											{/if}
										</div>
									</div>
								</div>
							{/if}
						{/each}
					{/if}
				</div>
			</aside>
		</div>
		<!-- and below its bottom, as it scrolls out -->
		<div class="globe-glow-overflow below" bind:this={glowOverflowBelow}></div>
	</div>
</template>

<style lang="scss">
	.globe-scroll-wrapper {
		position: relative;
		grid-column: viewport;
		display: grid;
		grid-template-columns: subgrid;
		align-content: start;
		height: 100vh; /* the map's own, so the map fills the view at animate.ts's 50% and scrolls through without pinning */
		--sidebar-radius: calc(var(--GRID-CELL) / 8); /* the sidebar's corners, and the Explore button's */

		// a squircle cuts about 0.57 times as deep into its corner as a round corner of the same radius
		@supports (corner-shape: squircle) {
			--sidebar-radius: calc(var(--GRID-CELL) / 8 * 1.75);
		}
	}
	.globe-glow-overflow {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 100%;
		height: 100vh; /* room for the glow past the map, which reaches most of a view's height from a globe much larger than the view */
		pointer-events: none;

		// below the map as it scrolls out; capped at the page's end in script
		&.below {
			top: 100%;
			bottom: auto;
		}
	}
	// where Show projects was, in the sidebar's menu row up to the page's container-end; in the light sidebar's colors
	.globe-explore {
		grid-column: eighth-start 7 / container-end;
		grid-row: 1;
		align-self: start;
		position: sticky; /* below the header while the map runs up past the view */
		top: calc(var(--GRID-CELL) * 1.75);
		z-index: 4; /* over the map's 3 */
		margin-top: calc(var(--GRID-CELL) * 1.75); /* the sidebar's own */
		margin-left: calc((var(--GRID-CELL) * 9.5 - var(--GRID-CELL)) / 3 + var(--GRID-CELL) / 2); /* past a menu button, a third of the sidebar's 9.5 cells less the gaps, and a gap */
		padding: calc(var(--GRID-CELL) / 4) 0;
		border: none;
		border-radius: var(--sidebar-radius);
		corner-shape: squircle;
		background: white;
		color: var(--COLOR-BLACK);
		font-family: inherit;
		font-size: var(--FONT-SIZE-SM);
		cursor: pointer;
		// visibility waits out the fade, then takes it out of reach
		opacity: 0;
		visibility: hidden;
		pointer-events: none; /* while it fades out over the sidebar's menu */
		transition: background-color 0.3s ease, opacity 0.4s ease, visibility 0s linear 0.4s;

		// the sidebar's columns there, and a third of their width
		@media (max-width: 62.5em) {
			grid-column: half-start 2 / container-end;
			margin-left: calc((100% - var(--GRID-CELL)) / 3 + var(--GRID-CELL) / 2);
		}

		@media (max-width: 31.25em) {
			grid-column: container;
		}

		&.shown {
			opacity: 1;
			visibility: visible;
			pointer-events: auto;
			transition: background-color 0.3s ease, opacity 0.4s ease, visibility 0s;
		}

		&:hover {
			background: #f2f2f3;
		}
	}
	.globe-wrapper {
		/*
			Z-Indexes
			1: Background color
			2: Content
			3: Menu bar
			4: Logo
			5: Hero
			6: Breadcrumbs
			7: Menu overlay
			8: Menu button
		*/
		z-index: 3;
		position: sticky;
		top: 0;

		grid-column: viewport;
		grid-row: 1; /* the Explore button shares its row */
		display: grid;
		grid-template-columns: subgrid;

		width: 100%;
		height: 100vh;
		overflow: hidden;
		background: var(--background-color);

		--tooltip-font: system-ui, sans-serif;
		--tooltip-font-size: 13px;
		--tooltip-font-weight: 600;
		--tooltip-color: #1a1a1a;
		--tooltip-bg: rgba(255, 255, 255, 0.96);
		--tooltip-padding: 6px 10px;
		--tooltip-radius: 6px;

		.globe-container {
			grid-column: viewport;
			grid-row: 1;
			width: 100%;
			height: 100%;
		}

		.globe-marker-tooltip {
			position: fixed;
			display: none;
			transform: translate(-50%, calc(-100% - 8px));
			pointer-events: none;
			z-index: 10001;
			font-family: var(--tooltip-font);
			font-size: var(--tooltip-font-size);
			font-weight: var(--tooltip-font-weight);
			color: var(--tooltip-color);
			background: var(--tooltip-bg);
			padding: var(--tooltip-padding);
			border-radius: var(--tooltip-radius);
			box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
			white-space: nowrap;
		}

		.globe-sidebar {
			grid-column: eighth-start 7 / viewport-end;
			grid-row: 1;
			margin: calc(var(--GRID-CELL) * 1.75) calc(var(--GRID-CELL) / 2) 0 0;
			height: calc(100% - var(--GRID-CELL) * 1.75);
			min-height: 0; /* otherwise the results size the grid row instead of scrolling */
			display: grid;
			grid-template-columns: subgrid;
			grid-template-rows: auto minmax(0, 1fr); /* the menu, then the results, which scroll rather than size the row */
			row-gap: calc(var(--GRID-CELL) / 2);
			z-index: 4;

			// the page grid has halves and thirds here, not eighths, and margins too narrow to run into
			@media (max-width: 62.5em) {
				grid-column: half-start 2 / container-end;
				margin-right: 0;
			}

			// and one column
			@media (max-width: 31.25em) {
				grid-column: container;
			}

			// transparent outside mode 2; visibility waits out the fade, then takes the sidebar out of reach
			opacity: 0;
			visibility: hidden;
			transition: opacity 0.4s ease, visibility 0s linear 0.4s;

			&.shown {
				opacity: 1;
				visibility: visible;
				transition: opacity 0.4s ease, visibility 0s;
			}

			// the sidebar's own theme colors, in place of the page section's
			--color-primary: var(--COLOR-BLACK);
			--color-secondary: var(--COLOR-MID-GRAY);
			--color-tertiary: var(--COLOR-DIM-GRAY);
			--color-accent: var(--COLOR-ORANGE);
			--color-background: white;
			--sidebar-surface: white;
			--sidebar-surface-alt: #f2f2f3;
			--sidebar-card: #d8d9da;
			--sidebar-rule: #e4e4e3;

			// each gray is --COLOR-BLACK plus the light gray's distance from white
			&[data-theme="dark"] {
				--color-primary: white;
				--color-background: var(--COLOR-BLACK);
				--sidebar-surface: var(--COLOR-BLACK);
				--sidebar-surface-alt: #272524;
				--sidebar-card: #413e3d;
				--sidebar-rule: #353334;
				color-scheme: dark; /* dark scrollbars and focus rings */
			}

			.globe-sidebar-menu {
				grid-column: 1 / -1;
				grid-row: 1;
				display: flex;
				flex-direction: row;
				column-gap: calc(var(--GRID-CELL) / 2);

				> button {
					flex: 1 1 0;
					padding: calc(var(--GRID-CELL) / 4) 0;
					border: none;
					border-radius: var(--sidebar-radius);
					corner-shape: squircle;
					background: var(--sidebar-surface);
					color: var(--color-primary);
					font-family: inherit;
					font-size: var(--FONT-SIZE-SM);
					cursor: pointer;

					&:hover {
						background: var(--sidebar-surface-alt);
					}
				}
			}

			.globe-sidebar-body {
				grid-column: 1 / -1;
				grid-row: 2;
				min-height: 0; /* otherwise the results size it instead of scrolling */
				display: flex;
				flex-direction: column;
				overflow-y: scroll;
				// room for an enlarged item, which the scroll area would otherwise clip
				margin: calc(var(--GRID-CELL) / -10) calc(var(--GRID-CELL) / -10) calc(var(--GRID-CELL) / 2); /* and half a cell clear of the view's bottom */
				padding: calc(var(--GRID-CELL) / 10) calc(var(--GRID-CELL) / 10) 0;
			}

			.globe-sidebar-panels {
				flex-shrink: 0; /* the results render below it while it slides closed */
				display: grid;

				// panels share one cell so switching between them cross-fades in place
				> .globe-sidebar-panel {
					grid-row: 1;
					grid-column: 1;
				}
			}

			.globe-sidebar-panel {
				display: flex;
				flex-direction: column;
				row-gap: calc(var(--GRID-CELL) / 2);
			}

			:global {
				.globe-sidebar-filter > button {
					width: 100%;
					justify-content: space-between;
					padding: calc(var(--GRID-CELL) / 2);
					border-radius: var(--sidebar-radius);
					corner-shape: squircle;
					background: var(--sidebar-surface-alt);
					cursor: pointer;

					&:not(:last-child) {
						border-radius: var(--sidebar-radius) var(--sidebar-radius) 0 0;
					}
				}
			}

			.globe-sidebar-container {
				padding: calc(var(--GRID-CELL) / 2);
				border-radius: var(--sidebar-radius);
				corner-shape: squircle;
				background: var(--sidebar-surface);
				color: var(--color-primary);

				> p {
					margin-bottom: 1rem;
					font-size: var(--FONT-SIZE-SM);
					line-height: 1.333;
				}
			}

			.globe-sidebar-filter > .globe-sidebar-container {
				border-radius: 0 0 var(--sidebar-radius) var(--sidebar-radius);
			}

			.filter-group {
				display: flex;
				flex-direction: column;
				row-gap: 0.5rem;
				padding-left: var(--SPACE-SM);

				> h2 {
					margin-bottom: 0.25rem;

					font-size: var(--FONT-SIZE-SM);
					font-weight: 500;
					line-height: 1.167;

					text-transform: uppercase;
					letter-spacing: 0.05em;

					:global {
						.filter-button {
							font-weight: inherit;
							line-height: inherit;
						}
					}
				}

				& + .filter-group {
					margin-top: calc(var(--SPACE-SM) + 0.5rem);
					border-top: 1px solid var(--color-secondary);
				}
			}

			.filter-actions {
				display: flex;
				justify-content: space-between;
				margin-top: calc(var(--SPACE-SM) + 0.5rem);
			}

			.globe-sidebar-empty {
				padding: calc(var(--GRID-CELL) / 2);
				margin: 0 0 calc(var(--GRID-CELL) / 2);
				border-radius: var(--sidebar-radius);
				corner-shape: squircle;
				background: var(--sidebar-surface);
				color: var(--color-primary);
				font-size: var(--FONT-SIZE-SM);
				line-height: 1.333;
			}

			.globe-sidebar-item {
				margin: 0 0 calc(var(--GRID-CELL) / 2);
				border-radius: var(--sidebar-radius);
				corner-shape: squircle;
				background: var(--sidebar-card);
				color: var(--color-primary);
				// the spread enlarges the item past its own box, so neither its text nor its neighbors move
				box-shadow: 0 0 0 0 var(--sidebar-surface);
				transition: background-color 0.3s ease, box-shadow 0.3s ease;

				&.hovered,
				&.active {
					background: var(--sidebar-surface);
					box-shadow: 0 0 0 calc(var(--GRID-CELL) / 10) var(--sidebar-surface);
				}

				// as tall as the location and a one-line title, at the body's line-height
				--sidebar-thumb-size: calc((var(--FONT-SIZE-SM) + var(--FONT-SIZE-MD)) * 1.333);

				> button {
					display: grid;
					grid-template-columns: var(--sidebar-thumb-size) 1fr;
					column-gap: calc(var(--GRID-CELL) / 2);
					width: 100%;
					margin: 0;
					padding: calc(var(--GRID-CELL) / 2);
					border: none;
					border-radius: inherit; /* so its focus ring keeps the card's corners */
					corner-shape: inherit;
					background: none;
					color: inherit;
					font: inherit;
					text-align: left;
					cursor: pointer;
					transition: padding-bottom 0.4s ease, grid-template-columns 0.4s ease, column-gap 0.4s ease;

					// at the top beside a title that wraps; its column closes as the item opens, so the image crops rather than squashes
					> .sidebar-item-thumb {
						grid-row: 1 / span 2;
						height: var(--sidebar-thumb-size);
						overflow: hidden;
						background: var(--sidebar-surface-alt); /* until the image loads, and for a project without one */
						transition: opacity 0.4s ease;

						> img {
							display: block;
							width: 100%;
							height: 100%;
							object-fit: cover;
						}
					}

					> .sidebar-item-location {
						grid-column: 2;
						font-size: var(--FONT-SIZE-SM);
					}
					> .sidebar-item-title {
						grid-column: 2;
						font-size: var(--FONT-SIZE-MD);
					}
				}

				&.active > button {
					grid-template-columns: 0px 1fr;
					column-gap: 0;
					padding-bottom: calc(var(--GRID-CELL) / 4);

					> .sidebar-item-thumb {
						opacity: 0;
					}
				}

				// visibility waits out the collapse, then takes the closed contents out of reach
				> .globe-sidebar-item-details {
					display: grid;
					grid-template-rows: 0fr;
					visibility: hidden;
					transition: grid-template-rows 0.4s ease, visibility 0s linear 0.4s;

					> div {
						min-height: 0;
						overflow: hidden;
						padding: 0 calc(var(--GRID-CELL) / 4);
					}

					img {
						display: block;
						width: 100%;
						aspect-ratio: 1;
						object-fit: cover;
					}
				}

				&.active > .globe-sidebar-item-details {
					grid-template-rows: 1fr;
					visibility: visible;
					transition: grid-template-rows 0.4s ease, visibility 0s;
				}

				.globe-sidebar-item-action {
					padding: calc(var(--GRID-CELL) / 4);

					& + .globe-sidebar-item-action {
						border-top: 1px solid var(--sidebar-rule);
					}

					:global {
						// text-sized, where the Cta's own plus is drawn at twice the MD size
						.cta span.icon[data-icon="plus"]::after,
						.cta span.icon[data-icon="arrow_up_left"]::after {
							width: auto;
							height: auto;
							font-size: inherit;
						}
						.cta span.icon[data-icon="arrow_up_left"]::after {
							content: "↖";
						}
						.cta:disabled {
							pointer-events: none; /* no hover highlight for the placeholder */
						}
					}
				}
			}
		}

		:global {
			.off-globe .maplibregl-canvas-container,
			.off-globe .maplibregl-canvas,
			.off-globe .maplibregl-canvas-container:active,
			.off-globe .maplibregl-canvas:active {
				cursor: default;
			}
			.marker-hover .maplibregl-canvas-container,
			.marker-hover .maplibregl-canvas {
				cursor: pointer;
			}
			.maplibregl-ctrl-bottom-left {
				z-index: 6; /* the opened attribution stays over the sidebar's 4 */
			}
			.maplibregl-ctrl-bottom-left .maplibregl-ctrl-attrib {
				margin: 0 0 calc(var(--GRID-CELL) / 2) calc(var(--GRID-CELL) / 2);

				&:not(.maplibregl-compact-show) {
					background-color: transparent; /* opened, the text keeps maplibre's white */
				}
			}
			.maplibregl-ctrl-bottom-left .maplibregl-ctrl-attrib-button {
				border: 2.5px solid var(--COLOR-MID-GRAY);
				background: none;
				color: var(--COLOR-MID-GRAY);

				&::after {
					content: "i";
					display: grid;
					place-items: center;
					height: 100%;
					font-family: var(--FONT-FAMILY-PROXIMA-NOVA);
					font-size: 19px;
					font-style: italic;
					font-weight: 600;
					line-height: 1;
				}
			}
			.marker-layer {
				position: absolute;
				inset: 0;
				isolation: isolate; /* isolate so markers only blend with each other, not with the canvas */
				pointer-events: none;
			}

			.marker-canvas {
				display: block;
				width: 100%;
				height: 100%;
				pointer-events: none;
			}

			.maplibregl-popup-content {
				padding: 8px 10px;
				font-family: var(--FONT-FAMILY-PROXIMA-NOVA);
				font-size: 13px;
			}
		}
	}
</style>