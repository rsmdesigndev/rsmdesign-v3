import type { LngLat, Map as MapLibreMap } from "maplibre-gl";

// markers on a canvas over the globe, with pointer hit-testing against the projected points
export type MarkerColors = {
	base: string;
	secondary: string;
	highlight: string;
	border?: string;
	blend: GlobalCompositeOperation;
	blur: boolean;
	sizeStops: MarkerSizeStops;
};

type MarkerSizeStop = { zoom: number; size: number };
export type MarkerSizeStops = [MarkerSizeStop, ...MarkerSizeStop[]];

export type MarkerLocation = {
	lngLat: LngLat;
	title: string;
};

export type GlobeMarkersOptions = {
	tooltip: HTMLElement;
	colors: MarkerColors;
	hitRadius: number; // px, the least a marker takes
	onHover: (index: number | null) => void;
	onClick: (index: number) => void;
	onProject?: (size: number) => void;
};

export type GlobeMarkers = {
	setLocations: (locations: MarkerLocation[]) => void;
	setMatches: (matches: boolean[], hideNonMatching: boolean) => void;
	setHighlight: (hovered: number | null, active: number | null) => void;
	setColors: (colors: MarkerColors) => void;
	reproject: () => void;
	pause: () => void;
	resume: () => void;
	destroy: () => void;
};

type MarkerPoint = {
	x: number;
	y: number;
	size: number;
	index: number;
};

const MARKER_BLUR_MAX = 1;
const MARKER_BLUR_ZOOM_MIN = 2;
const MARKER_BLUR_ZOOM_MAX = 6;

const MARKER_BORDER_WIDTH = 1.5;

// within these, the round trips below match MapLibre's private occlusion checks
const OCCLUSION_TOLERANCE_DEGREES = 0.001;
const SURFACE_TOLERANCE_PIXELS = 0.25;

const zoomFraction = (zoom: number, from: number, to: number): number => Math.min(1, Math.max(0, (zoom - from) / (to - from)));

const wrapDegrees = (degrees: number): number => ((degrees + 540) % 360) - 180;

// a hidden location's screen point unprojects to the front of the globe, so the round trip lands elsewhere
export function isLocationOccluded(map: MapLibreMap, lngLat: LngLat): boolean {
	const back: LngLat = map.unproject(map.project(lngLat));
	const scale: number = Math.cos((lngLat.lat + back.lat) / 2 * Math.PI / 180);

	return Math.hypot(wrapDegrees(back.lng - lngLat.lng) * scale, back.lat - lngLat.lat) > OCCLUSION_TOLERANCE_DEGREES;
}

// a screen point off the globe unprojects to the horizon, so it doesn't project back to itself
export function isPointOnGlobe(map: MapLibreMap, x: number, y: number): boolean {
	const again = map.project(map.unproject([x, y]));

	return Math.hypot(again.x - x, again.y - y) < SURFACE_TOLERANCE_PIXELS;
}

export function createGlobeMarkers(map: MapLibreMap, options: GlobeMarkersOptions): GlobeMarkers {
	const container: HTMLElement = map.getContainer();

	// the sidebar is the accessible representation of the same data, so the layer stays out of the a11y tree
	const layer: HTMLDivElement = document.createElement("div");
	layer.className = "marker-layer";
	layer.setAttribute("aria-hidden", "true");
	container.appendChild(layer);

	const canvas: HTMLCanvasElement = document.createElement("canvas");
	canvas.className = "marker-canvas";
	layer.appendChild(canvas);

	const context: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;

	let colors: MarkerColors = resolveColors(options.colors);
	let locations: MarkerLocation[] = [];
	let points: MarkerPoint[] = [];
	let visiblePoints: MarkerPoint[] = [];
	let isVisible: boolean[] = [];
	let matches: boolean[] = [];
	let hideNonMatching: boolean = false;
	let hovered: number | null = null;
	let active: number | null = null;
	let paused: boolean = false;
	let canvasFilter: string = "";

	// measured on resize and scroll, not per frame: reading layout after the canvas filter write forces a reflow
	let containerRect: DOMRect = container.getBoundingClientRect();

	function measure(): void {
		containerRect = container.getBoundingClientRect();
	}

	// canvas takes no var(), so each color goes through the layer's computed color first
	function resolveColors(next: MarkerColors): MarkerColors {
		const resolve = (color: string): string => {
			layer.style.color = color;
			return getComputedStyle(layer).color;
		};
		const resolved: MarkerColors = { ...next, base: resolve(next.base), secondary: resolve(next.secondary), highlight: resolve(next.highlight), border: next.border && resolve(next.border) };

		layer.style.color = "";
		return resolved;
	}

	function resizeCanvas(): void {
		const dpr: number = window.devicePixelRatio || 1;
		const width: number = Math.round(containerRect.width * dpr);
		const height: number = Math.round(containerRect.height * dpr);

		// setting the size resets the context, so only when it changed
		if (canvas.width === width && canvas.height === height) return;

		canvas.width = width;
		canvas.height = height;
		context.setTransform(dpr, 0, 0, dpr, 0, 0);
	}

	// linear between stops in rising zoom order, and held beyond the first and last
	function markerSize(): number {
		const stops: MarkerSizeStops = colors.sizeStops;
		const zoom: number = map.getZoom();

		for (let i = 1; i < stops.length; i++) {
			if (zoom > stops[i].zoom) continue;

			return stops[i - 1].size + zoomFraction(zoom, stops[i - 1].zoom, stops[i].zoom) * (stops[i].size - stops[i - 1].size);
		}

		return stops[stops.length - 1].size;
	}

	function markerBlur(): number {
		return MARKER_BLUR_MAX * (1 - zoomFraction(map.getZoom(), MARKER_BLUR_ZOOM_MIN, MARKER_BLUR_ZOOM_MAX));
	}

	function project(): void {
		const size: number = markerSize();

		visiblePoints = [];

		for (let i = 0; i < points.length; i++) {
			isVisible[i] = false;

			if (hideNonMatching && !matches[i]) continue;

			const projected = map.project(locations[i].lngLat);

			// outside the viewport, or on the far side of the globe
			if (
				projected.x < -size ||
				projected.x > containerRect.width + size ||
				projected.y < -size ||
				projected.y > containerRect.height + size ||
				isLocationOccluded(map, locations[i].lngLat)
			) continue;

			const point: MarkerPoint = points[i];
			point.x = projected.x;
			point.y = projected.y;
			point.size = size;

			isVisible[i] = true;
			visiblePoints.push(point);
		}

		options.onProject?.(size);
	}

	function paint(): void {
		const blur: number = colors.blur ? markerBlur() : 0;
		const filter: string = blur > 0 ? `blur(${blur}px)` : "";

		if (filter !== canvasFilter) {
			canvasFilter = filter;
			canvas.style.filter = filter;
		}

		context.clearRect(0, 0, containerRect.width, containerRect.height);
		context.globalAlpha = 1;
		context.globalCompositeOperation = colors.blend;

		const halfPixel: number = 0.5 / (window.devicePixelRatio || 1); // the fill fades into the border over a device pixel, as antialiasing would

		for (const point of visiblePoints) {
			let fill: string;

			if (point.index === hovered || point.index === active) {
				fill = colors.highlight;
			} else if (matches[point.index] ?? true) {
				fill = colors.base;
			} else {
				fill = colors.secondary;
			}

			const radius: number = point.size / 2;
			const outer: number = colors.border ? radius + MARKER_BORDER_WIDTH : radius;

			// one gradient fill rather than a fill and a stroke, so each marker blends whole and no seam opens inside the border
			if (colors.border) {
				const gradient: CanvasGradient = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, outer);

				gradient.addColorStop((radius - halfPixel) / outer, fill);
				gradient.addColorStop((radius + halfPixel) / outer, colors.border);
				context.fillStyle = gradient;
			} else {
				context.fillStyle = fill;
			}

			context.beginPath();
			context.arc(point.x, point.y, outer, 0, Math.PI * 2);
			context.fill();
		}
	}

	function updateTooltip(): void {
		const index: number | null = hovered ?? active;

		if (index === null || !isVisible[index]) {
			options.tooltip.style.display = "none";
			return;
		}

		const point: MarkerPoint = points[index];

		options.tooltip.textContent = locations[index].title;
		options.tooltip.style.left = `${containerRect.left + point.x}px`;
		options.tooltip.style.top = `${containerRect.top + point.y - point.size / 2}px`;
		options.tooltip.style.display = "block";
	}

	function repaint(): void {
		paint();
		updateTooltip();
	}

	function reproject(): void {
		if (paused) return;

		resizeCanvas();
		project();
		repaint();
	}

	// the nearest visible marker under the pointer, within a radius no smaller than a fingertip
	function hitTest(clientX: number, clientY: number): number | null {
		const x: number = clientX - containerRect.left;
		const y: number = clientY - containerRect.top;
		let nearest: number | null = null;
		let nearestDistance: number = Infinity;

		for (const point of visiblePoints) {
			const distance: number = Math.hypot(point.x - x, point.y - y);

			if (distance <= Math.max(point.size / 2, options.hitRadius) && distance < nearestDistance) {
				nearest = point.index;
				nearestDistance = distance;
			}
		}

		return nearest;
	}

	function onMouseMove(event: MouseEvent): void {
		const index: number | null = paused ? null : hitTest(event.clientX, event.clientY);

		container.classList.toggle("marker-hover", index !== null);

		if (index !== hovered) {
			options.onHover(index);
		}
	}

	function onMouseLeave(): void {
		container.classList.remove("marker-hover");

		if (hovered !== null) {
			options.onHover(null);
		}
	}

	function onClick(event: MouseEvent): void {
		const index: number | null = paused ? null : hitTest(event.clientX, event.clientY);

		if (index !== null) {
			options.onClick(index);
		}
	}

	function onMapResize(): void {
		measure();
		reproject();
	}

	container.addEventListener("mousemove", onMouseMove);
	container.addEventListener("mouseleave", onMouseLeave);
	container.addEventListener("click", onClick);
	window.addEventListener("scroll", measure, { passive: true });
	map.on("move", reproject);
	map.on("resize", onMapResize);

	return {
		setLocations(next: MarkerLocation[]): void {
			locations = next;
			points = next.map((_, index) => ({ x: 0, y: 0, size: 0, index }));
			isVisible = next.map(() => false);
			matches = next.map(() => true);
			hovered = null;
			active = null;
			reproject();
		},

		setMatches(next: boolean[], hide: boolean): void {
			matches = next;

			// culling changes which markers exist, dimming only how they look
			if (hide !== hideNonMatching || hide) {
				hideNonMatching = hide;
				reproject();
			} else {
				repaint();
			}
		},

		setHighlight(nextHovered: number | null, nextActive: number | null): void {
			hovered = nextHovered;
			active = nextActive;
			repaint();
		},

		setColors(next: MarkerColors): void {
			colors = resolveColors(next);
			reproject(); // project() sets the sizes, which the theme may have changed
		},

		reproject,

		pause(): void {
			paused = true;
		},

		resume(): void {
			paused = false;
			measure();
			reproject();
		},

		destroy(): void {
			container.removeEventListener("mousemove", onMouseMove);
			container.removeEventListener("mouseleave", onMouseLeave);
			container.removeEventListener("click", onClick);
			window.removeEventListener("scroll", measure);
			map.off("move", reproject);
			map.off("resize", onMapResize);
			layer.remove();
		}
	};
}