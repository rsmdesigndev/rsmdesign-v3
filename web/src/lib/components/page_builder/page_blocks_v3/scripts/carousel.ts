import { writable, derived, get, type Readable, type Writable } from "svelte/store";

/**
 * Shared autoplay/stepping logic for CardCarousel and Media/Slider.
 *
 * The index stays owned by the component rather than living in a store here,
 * because CardCarousel's is an exported prop bound up to CardColumn while
 * Slider's is local. Passing getIndex/setIndex covers both without a two-way
 * store-to-prop sync.
 */

export type CarouselInit = {
	/** Read the component's current index. */
	getIndex: () => number;
	/** Write it back. Defined in the component so Svelte sees the assignment. */
	setIndex: (i: number) => void;
	/** Total number of items. */
	count: number;
	/**
	 * How many items are visible at once. Doubles as the number of positions
	 * reserved at the end before wrapping, so the last slide is always full,
	 * and as the threshold above which autoplay is worthwhile.
	 */
	perSlide?: number;
	autoplay?: boolean | null;
	interval?: number | null;
	animationDuration?: number;
};

export type Carousel = ReturnType<typeof createCarousel>;

export function createCarousel(init: CarouselInit) {
	const animationDuration = init.animationDuration ?? 200;
	const interval = init.interval ?? 10000;

	const isPaused: Writable<boolean> = writable(false);    // explicit, via the playback control
	const isSuspended: Writable<boolean> = writable(false); // transient, while hovered or focused
	const reduceMotion: Writable<boolean> = writable(false);
	const animationDir: Writable<-1 | 0 | 1> = writable(0);
	const count: Writable<number> = writable(init.count);
	const perSlide: Writable<number> = writable(init.perSlide ?? 1);
	const autoplay: Writable<boolean> = writable(!!init.autoplay);

	const canAutoplay: Readable<boolean> = derived(
		[autoplay, reduceMotion, count, perSlide],
		([$autoplay, $reduce, $count, $perSlide]) => $autoplay && !$reduce && $count > $perSlide
	);

	// rotationEnabled = the persistent user setting; drives the accessible name and aria-live.
	// isAdvancing = whether slides are actually moving right now; drives the visible glyph.
	const rotationEnabled: Readable<boolean> = derived(
		[canAutoplay, isPaused],
		([$can, $paused]) => $can && !$paused
	);
	const isAdvancing: Readable<boolean> = derived(
		[rotationEnabled, isSuspended],
		([$on, $susp]) => $on && !$susp
	);

	let isAnimating = false;
	let intervalId: ReturnType<typeof setInterval> | null = null;

	function stopInterval() {
		if (intervalId !== null) {
			clearInterval(intervalId);
			intervalId = null;
		}
	}

	function startInterval() {
		stopInterval();
		if (!get(canAutoplay) || get(isPaused)) return;
		intervalId = setInterval(() => {
			// Swallowed while hovered or focused, so the timer keeps its own schedule
			// and moving between the carousel and its arrows doesn't reset it.
			if (get(isSuspended)) return;
			step(1);
		}, interval);
	}

	function step(dir: -1 | 1) {
		if (isAnimating) return;

		const last = Math.max(0, get(count) - get(perSlide));
		let i = init.getIndex() + dir;
		if (i > last) i = 0;
		if (i < 0) i = last;
		init.setIndex(i);

		isAnimating = true;
		animationDir.set(dir);
		setTimeout(() => (isAnimating = false), animationDuration - 100);
		startInterval();
	}

	/** Call from onMount. Returns the teardown. */
	function start() {
		const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		reduceMotion.set(motionQuery.matches);

		const onMotionChange = (e: MediaQueryListEvent) => {
			reduceMotion.set(e.matches);
			startInterval();
		};
		motionQuery.addEventListener("change", onMotionChange);

		startInterval();

		return () => {
			motionQuery.removeEventListener("change", onMotionChange);
			stopInterval();
		};
	}

	return {
		isPaused,
		isSuspended,
		canAutoplay,
		rotationEnabled,
		isAdvancing,
		animationDir,
		animationDuration,

		next: () => step(1),
		prev: () => step(-1),
		togglePlayback: () => {
			isPaused.update((p) => !p);
			startInterval();
		},
		suspend: () => isSuspended.set(true),
		resume: () => isSuspended.set(false),

		/** Keep the controller in sync when the component's inputs change. */
		setCount: (n: number) => {
			count.set(n);
			startInterval();
		},
		setPerSlide: (n: number) => {
			perSlide.set(n);
			startInterval();
		},

		start
	};
}

/* ------------------------------------------------------------------ */
/* Stacking helpers. Pure functions of the index, so they take it as an
   argument rather than reading a store. Wrapping here is always by a
   single position, independent of perSlide.                           */
/* ------------------------------------------------------------------ */

export function isNextSlide(i: number, index: number, count: number): boolean {
	if (count === 1) return false;
	// if on the last slide, "next slide" would be the first slide
	if (index === count - 1) return i === 0;
	return i === index + 1;
}

export function isPrevSlide(i: number, index: number, count: number): boolean {
	if (count === 1) return false;
	// if on the first slide, "prev slide" would be the last slide
	if (index === 0) return i === count - 1;
	return i === index - 1;
}

export function calcZIndex(
	i: number,
	index: number,
	count: number,
	dir: -1 | 0 | 1
): number {
	if (i === index) return 2;
	if (isNextSlide(i, index, count)) return dir === 1 ? 0 : 1;
	if (isPrevSlide(i, index, count)) return dir === -1 ? 0 : 1;
	return 0;
}