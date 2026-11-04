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
	import { slide, fade, type TransitionConfig } from "svelte/transition";
	import { cubicOut } from "svelte/easing";

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
			background: "white",
			glowColor: "#ffffff",
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

	/* scroll-driven zoom */
	const ZOOM_STOPS: { scroll: number; zoom: number; cloudOpacity: number }[] = [
		{ scroll: 0, zoom: 6, cloudOpacity: 0.38 },
		{ scroll: 20, zoom: 2, cloudOpacity: 0.62 }, /* where the wrapper's top reaches the viewport's top, with its height at 400vh */
		{ scroll: 60, zoom: 7, cloudOpacity: 0 },
		{ scroll: 100, zoom: 12, cloudOpacity: 0 }
	];

	const SIDEBAR_COLLAPSED_BELOW_ZOOM = 3;
	const SIDEBAR_COLLAPSED_ABOVE_ZOOM = 9;

	/* linear interpolation between zoom stops */
	function getScrollValue(percentage: number, key: "zoom" | "cloudOpacity"): number {
		for (let i = 1; i < ZOOM_STOPS.length; i++) {
			const to = ZOOM_STOPS[i];
			if (percentage > to.scroll) continue;

			const from = ZOOM_STOPS[i - 1];
			return from[key] + ((percentage - from.scroll) / (to.scroll - from.scroll)) * (to[key] - from[key]);
		}

		return ZOOM_STOPS[ZOOM_STOPS.length - 1][key];
	}

	let scrollObserver: MutationObserver;

	/* hook into `data-scroll-percentage` from animate.ts */
	function applyScrollZoom(): void {
		const scrollPercentage = scrollWrapper.getAttribute("data-scroll-percentage");
		if (scrollPercentage === null) return;

		const zoom = getScrollValue(Number(scrollPercentage), "zoom");
		const top = scrollWrapper.getBoundingClientRect().top;
		globeOffset = getGlobeOffset(zoom, top);
		globe.jumpTo({ zoom, padding: { top: 2 * globeOffset } }); /* one camera update for both, so the markers reproject once */
		sidebarShown = top <= 0;
		applySidebarDefault(zoom < SIDEBAR_COLLAPSED_BELOW_ZOOM || zoom > SIDEBAR_COLLAPSED_ABOVE_ZOOM);
	}

	/* while the map's top edge is on screen, the globe sits as far below the middle as it takes for its top to clear the edge,
	   so neither the globe nor the glow above it is cut off there; it is back in the middle by the time the wrapper pins, or just after in a short view */
	const GLOBE_TOP_CLEARANCE = 0.1; /* of the globe's radius on screen: past the glow's 1/e distance, so the glow above the map shows in full */
	const GLOBE_OFFSET_EASE_OUT = 0.15; /* of the view's height: how far a view too short for the globe scrolls past the pin before it is back in the middle */

	let globeOffset = 0; /* half the map's top padding, which moves the globe down by that much */

	function getGlobeOffset(zoom: number, top: number = scrollWrapper.getBoundingClientRect().top): number {
		if (globe.getProjection()?.type !== "globe") return globeOffset;

		const height = globe.getContainer().clientHeight;
		/* quadratic, so the globe slows to a stop after the map pins rather than stopping with it */
		const ease = (1 - Math.min(1, Math.max(0, -top / (GLOBE_OFFSET_EASE_OUT * height)))) ** 2;
		if (ease === 0) return 0;

		/* the globe's radius on screen at that zoom: its radius in pixels is the scale at its center, doubling with each zoom level,
		   and maplibre's camera sits a focal length f from the globe's near surface, so it sees r = fR / √(f² + 2fR) of it */
		const center = globe.getCenter();
		const step = center.lat > 0 ? -0.1 : 0.1; /* degrees of latitude, toward the equator */
		const a = globe.project(center);
		const b = globe.project([center.lng, center.lat + step]);
		const R = (Math.hypot(b.x - a.x, b.y - a.y) / Math.abs((step * Math.PI) / 180)) * 2 ** (zoom - globe.getZoom());
		const f = height / 2 / Math.tan((globe.getVerticalFieldOfView() * Math.PI) / 360);
		const radius = (f * R) / Math.sqrt(f * f + 2 * f * R);

		/* rounded off where it reaches 0, so the globe doesn't change pace there */
		const needed = (1 + GLOBE_TOP_CLEARANCE) * radius - height / 2;
		const blend = GLOBE_TOP_CLEARANCE * radius;
		const full = needed <= -blend ? 0 : needed >= blend ? needed : (needed + blend) ** 2 / (4 * blend);

		return Math.round(Math.min(full * ease, height / 2) * 4) / 4;
	}

	/* after the projection or the map's size changes */
	function applyGlobeOffset(): void {
		const offset = getGlobeOffset(globe.getZoom());
		if (offset === globeOffset) return;

		globeOffset = offset;
		globe.setPadding({ top: 2 * offset });
	}

	function getCloudOpacity(): number {
		return getScrollValue(Number(scrollWrapper.getAttribute("data-scroll-percentage") ?? 0), "cloudOpacity");
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

		if (index !== null) {
			revealSidebarItem(index);
		}
	}

	/* an item keeps its image once opened, so it can slide closed with it */
	$: openedProjects = projects.map((): boolean => false);

	function activateProject(index: number): void {
		activeMarkerIndex = index;
		openedProjects[index] = true;
	}

	function onMarkerClick(index: number): void {
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
	type SidebarView = "results" | "filter" | "search" | "settings";

	let sidebarView: SidebarView = "results";
	let sidebarCollapsed = false;
	let sidebarShown = false; /* once the wrapper's top reaches the viewport's top, as the globe pins */
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
		sidebarCollapsed = false;
		locationStep = 0; /* the filter panel reopens at the first location step */
		keepMenuFocus();
	}

	function showResults(): void {
		sidebarView = "results";
		keepMenuFocus();
	}

	/* the collapsed menu is the results menu with its last two buttons stacked */
	function collapseSidebar(): void {
		sidebarView = "results";
		sidebarCollapsed = true;
		keepMenuFocus();
	}

	function expandSidebar(): void {
		sidebarCollapsed = false;
		keepMenuFocus();
	}

	/* only a threshold crossing applies the default, so the visitor's own toggle holds until the next one */
	let zoomDefaultCollapsed: boolean | undefined;

	function applySidebarDefault(collapsed: boolean): void {
		if (collapsed === zoomDefaultCollapsed) return;
		zoomDefaultCollapsed = collapsed;
		if (collapsed === sidebarCollapsed) return;

		/* only focus inside the sidebar moves, so scrolling never pulls it from elsewhere on the page */
		const focusInSidebar = sidebar.contains(document.activeElement);

		if (collapsed) sidebarView = "results";
		sidebarCollapsed = collapsed;
		if (focusInSidebar) keepMenuFocus();
	}

	/* the body slides up past its own top edge, as if under the menu */
	function slideUnderMenu(node: HTMLElement, { duration = 400 } = {}): TransitionConfig {
		const height = node.clientHeight;

		return {
			duration,
			easing: cubicOut,
			css: (t, u) => `transform: translateY(${-u * height}px); clip-path: inset(${u * height}px 0 0 0); opacity: ${t};`
		};
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

	function onSidebarHover(index: number): void {
		hoveredMarkerIndex = index;
	}

	/* movement, not mouseenter, starts the wait, so an item scrolled under a still pointer doesn't turn the globe */
	function onSidebarMove(index: number, e: MouseEvent): void {
		if (index === rotatedToIndex) return;
		if (index === pendingRotateIndex && Math.hypot(e.clientX - pendingRotatePoint.x, e.clientY - pendingRotatePoint.y) <= SIDEBAR_ROTATE_TOLERANCE) return;

		clearTimeout(hoverRotateTimer);
		pendingRotateIndex = index;
		pendingRotatePoint = { x: e.clientX, y: e.clientY };
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

		globe.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");

		/* maplibre opens the compact attribution once attributions load unless the compact class is already present */
		const attribution = globe.getContainer().querySelector(".maplibregl-ctrl-attrib")!;
		attribution.classList.add("maplibregl-compact");
		attribution.classList.remove("maplibregl-compact-show");

		globe.scrollZoom.disable();

		clouds = createGlobeClouds(globe, {
			texture: CLOUD_TEXTURE,
			period: CLOUD_PERIOD,
			repaintInterval: CLOUD_REPAINT_INTERVAL,
			getOpacity: getCloudOpacity
		});

		glow = createGlobeGlow(globe, { color: selectedTheme.glowColor, opacity: 0.8, width: 0.07, inner: 28, overflow: glowOverflow });

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
			scrollObserver.disconnect();
			viewObserver.disconnect();
			document.removeEventListener("visibilitychange", updateActivity);
			clearTimeout(hoverRotateTimer);
			stopReveal?.();
			clouds.destroy();
			markers?.destroy();
			globe.remove();
		};
	});
</script>

<template>
	<div
		class="globe-scroll-wrapper"
		style:--background-color={selectedTheme.background}
		bind:this={scrollWrapper}
		use:animate={{ trigger: AnimateTrigger.WhileScrollingInView, animClass: "null" }}
	>
		<!-- the glow above the top of the map, past the canvas and the wrapper's clip and fade-out mask -->
		<div class="globe-glow-overflow" bind:this={glowOverflow}></div>
		<div
			class="globe-wrapper"
			bind:this={globeWrapper}
			use:animate={{ trigger: AnimateTrigger.WhileScrollingInView, animClass: "globe-fade-out" }}
		>
			<div class="globe-container" bind:this={globeContainer}></div>

			<div class="globe-marker-tooltip" role="tooltip" bind:this={tooltip}></div>
			<aside class="globe-sidebar" class:collapsed={sidebarCollapsed} class:shown={sidebarShown} data-theme={selectedTheme.sidebarTheme} bind:this={sidebar}>
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
							disabled={sidebarCollapsed}
							on:click={() => showSidebarView("search")}
						>Search</button>
					{/if}
					{#if sidebarView !== "settings"}
						<button
							type="button"
							disabled={sidebarCollapsed}
							on:click={() => showSidebarView("settings")}
						>Settings</button>
					{/if}
					{#if sidebarCollapsed}
						<div class="globe-sidebar-expand"
						 in:fade={{ duration: 200, delay: 200 }}
						 out:fade={{ duration: 200 }}
						>
							<Cta button sizeOverride="sm" hoverOverride="none"
								 data={ {...filterCta,
										 cta_text_light: "Expand sidebar",
										 cta_icon: "arrow_down"
									  } }
								 on:click={expandSidebar}
							/>
						</div>
					{/if}
				</div>
				{#if !sidebarCollapsed}
					<div class="globe-sidebar-collapsible" transition:slideUnderMenu>
						<div class="globe-sidebar-body" bind:this={sidebarBody}>
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
									{:else if sidebarView === "settings"}
										<div class="globe-sidebar-panel"
										 in:fade={{ duration: 200, delay: 201 }}
										 out:fade={{ duration: 200 }}
										>
											<div class="globe-sidebar-container">
												<div class="filter-group">
													<h2>Map theme</h2>
													{#each MAP_THEMES as theme}
														<div>
															<DataFeedFilterMenuItem sizeOverride="sm"
																data={ { item_name: theme.name,
																		 item_checked: theme === selectedTheme,
																		 input_type: "radio",
																		 input_name: "map-theme",
																		 input_value: theme.name
																	 } }
																on:change={() => selectTheme(theme)}
															/>
														</div>
													{/each}
												</div>
												<div class="filter-group">
													<h2>Markers</h2>
													<div>
														<DataFeedFilterMenuItem sizeOverride="sm"
															data={ { item_name: "Hide non-matching",
																	 item_checked: hideNonMatching
																 } }
															on:change={() => hideNonMatching = !hideNonMatching}
														/>
													</div>
												</div>
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
											on:mouseenter={() => onSidebarHover(index)}
											on:mousemove={(e) => onSidebarMove(index, e)}
											on:mouseleave={onSidebarLeave}
										>
											<button
												type="button"
												aria-expanded={index === activeMarkerIndex ? "true" : "false"}
												on:click={() => onSidebarClick(index)}
											>
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
						<div class="globe-sidebar-collapse">
							<Cta button sizeOverride="sm" hoverOverride="none"
								 data={ {...filterCta,
										 cta_text_light: "Collapse sidebar",
										 cta_icon: "arrow_up"
									  } }
								 on:click={collapseSidebar}
							/>
						</div>
					</div>
				{/if}
			</aside>
		</div>
	</div>
</template>

<style lang="scss">
	.globe-scroll-wrapper {
		position: relative;
		grid-column: viewport;
		display: grid;
		grid-template-columns: subgrid;
		align-content: start;
		height: 400vh; /* so it reaches the viewport's top at 20% of animate.ts's scroll percentage (one view's height of the five it scrolls through) */
	}
	.globe-glow-overflow {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 100%;
		height: 50vh; /* room for the glow above the map: up to about 26vh of a 900px-tall view, 44vh of a 600px one */
		pointer-events: none;
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
			display: flex;
			flex-direction: column;
			row-gap: calc(var(--GRID-CELL) / 2);
			z-index: 4;

			// transparent until the wrapper's top reaches the viewport's top; visibility waits out the fade, then takes the sidebar out of reach
			opacity: 0;
			visibility: hidden;
			transition: opacity 0.4s ease, visibility 0s linear 0.4s;

			&.shown {
				opacity: 1;
				visibility: visible;
				transition: opacity 0.4s ease, visibility 0s;
			}

			--sidebar-radius: calc(var(--GRID-CELL) / 8);

			// a squircle cuts about 0.57 times as deep into its corner as a round corner of the same radius
			@supports (corner-shape: squircle) {
				--sidebar-radius: calc(var(--GRID-CELL) / 8 * 1.75);
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
			--sidebar-stack-brightness-1: 0.9;
			--sidebar-stack-brightness-2: 0.8;

			// each gray is --COLOR-BLACK plus the light gray's distance from white
			&[data-theme="dark"] {
				--color-primary: white;
				--color-background: var(--COLOR-BLACK);
				--sidebar-surface: var(--COLOR-BLACK);
				--sidebar-surface-alt: #272524;
				--sidebar-card: #413e3d;
				--sidebar-rule: #353334;
				--sidebar-stack-brightness-1: 1.7; /* a darker stack wouldn't show against black */
				--sidebar-stack-brightness-2: 2.4;
				color-scheme: dark; /* dark scrollbars and focus rings */
			}

			.globe-sidebar-menu {
				position: relative;
				isolation: isolate; /* otherwise the negative z-indexes below drop beneath the menu and stop taking clicks */
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
					transition: transform 0.4s ease, filter 0.4s ease;

					&:hover {
						background: var(--sidebar-surface-alt);
					}

					// always under the first button, so they stay under it while sliding back out
					&:nth-child(2) {
						z-index: -1;
					}

					&:nth-child(3) {
						z-index: -2;
					}
				}

				> .globe-sidebar-expand {
					position: absolute;
					inset: 0 0 0 calc((100% - var(--GRID-CELL)) / 3 + var(--GRID-CELL) / 2);
				}
			}

			&.collapsed {
				pointer-events: none; /* the globe stays draggable where the results were */

				.globe-sidebar-menu {
					pointer-events: auto;

					> button:nth-child(2) {
						pointer-events: none;
						transform: translate(calc(-100% - var(--GRID-CELL) / 2 + var(--GRID-CELL) / 8), calc(var(--GRID-CELL) / 8));
						filter: brightness(var(--sidebar-stack-brightness-1));
					}

					> button:nth-child(3) {
						pointer-events: none;
						transform: translate(calc(-200% - var(--GRID-CELL) + var(--GRID-CELL) / 4), calc(var(--GRID-CELL) / 4));
						filter: brightness(var(--sidebar-stack-brightness-2));
					}
				}
			}

			.globe-sidebar-collapsible {
				flex: 1;
				min-height: 0; /* otherwise the results size it instead of scrolling */
				display: flex;
				flex-direction: column;
				row-gap: calc(var(--GRID-CELL) / 2);
			}

			.globe-sidebar-body {
				flex: 1;
				display: flex;
				flex-direction: column;
				overflow-y: scroll;
				// room for an enlarged item, which the scroll area would otherwise clip
				margin: calc(var(--GRID-CELL) / -10) calc(var(--GRID-CELL) / -10) 0;
				padding: calc(var(--GRID-CELL) / 10) calc(var(--GRID-CELL) / 10) 0;
			}

			.globe-sidebar-collapse {
				flex-shrink: 0;
				margin-bottom: calc(var(--GRID-CELL) / 2);
			}

			:global {
				.globe-sidebar-expand > button,
				.globe-sidebar-collapse > button {
					width: 100%;
					justify-content: center;
					padding: calc(var(--GRID-CELL) / 4) 0;
					border-radius: var(--sidebar-radius);
					corner-shape: squircle;
					background: var(--sidebar-surface);
					// the plain menu buttons' weight and height
					font-weight: 400;
					line-height: normal;
					cursor: pointer;

					&:hover {
						background: var(--sidebar-surface-alt);
					}
				}
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

				> button {
					display: flex;
					flex-direction: column;
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
					transition: padding-bottom 0.4s ease;

					> .sidebar-item-location {
						font-size: var(--FONT-SIZE-SM);
					}
					> .sidebar-item-title {
						font-size: var(--FONT-SIZE-LG);
					}
				}

				&.active > button {
					padding-bottom: calc(var(--GRID-CELL) / 4);
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
				font-family: system-ui, sans-serif;
				font-size: 13px;
			}
		}
	}

	:global {
		.globe-fade-out {
			// 1 - φt² for the first 61.8%, then φ²(1 - t)²: gradual over the globe, steeper into the background
			mask-image: linear-gradient(
				rgba(0,0,0,1) 100vh,
				rgba(0,0,0,0.984) calc(90vh + 10%),
				rgba(0,0,0,0.935) calc(80vh + 20%),
				rgba(0,0,0,0.854) calc(70vh + 30%),
				rgba(0,0,0,0.741) calc(60vh + 40%),
				rgba(0,0,0,0.595) calc(50vh + 50%),
				rgba(0,0,0,0.418) calc(40vh + 60%),
				rgba(0,0,0,0.382) calc(38.2vh + 61.8%),
				rgba(0,0,0,0.236) calc(30vh + 70%),
				rgba(0,0,0,0.105) calc(20vh + 80%),
				rgba(0,0,0,0.026) calc(10vh + 90%),
				rgba(0,0,0,0) 100%
			);
			mask-position: bottom;
			mask-repeat: no-repeat;
			animation: globe-fade-out 1s linear forwards;
		}

		@keyframes globe-fade-out {
			0% {
				mask-size: 100% 100%;
			}
			50% {
				mask-size: 100% 100%;
			}
			100% {
				mask-size: 100% calc(100% + 100vh);
			}
		}
	}
</style>