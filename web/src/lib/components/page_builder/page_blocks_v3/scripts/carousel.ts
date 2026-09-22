import { writable, derived, get, type Readable, type Writable } from "svelte/store";

export type CarouselInit = {
	// the component owns the index so Svelte tracks it, even as a bound prop
	getIndex: () => number;
	setIndex: (i: number) => void;
	count: number;
	perSlide?: number;
	autoplay?: boolean | null;
	interval?: number | null;
	animationDuration?: number;
};

export type Carousel = ReturnType<typeof createCarousel>;

export function createCarousel(init: CarouselInit) {
	const animationDuration = init.animationDuration ?? 200;
	const interval = init.interval ?? 10000;

	const isPaused: Writable<boolean> = writable(false);
	const isSuspended: Writable<boolean> = writable(false);
	const reduceMotion: Writable<boolean> = writable(false);
	const animationDir: Writable<-1 | 0 | 1> = writable(0);
	const count: Writable<number> = writable(init.count);
	const perSlide: Writable<number> = writable(init.perSlide ?? 1);
	const autoplay: Writable<boolean> = writable(!!init.autoplay);

	const canAutoplay: Readable<boolean> = derived(
		[autoplay, reduceMotion, count, perSlide],
		([$autoplay, $reduce, $count, $perSlide]) => $autoplay && !$reduce && $count > $perSlide
	);

	// the label follows the user's choice; the glyph also shows hover and focus holds
	const rotationEnabled: Readable<boolean> = derived(
		[canAutoplay, isPaused],
		([$can, $paused]) => $can && !$paused
	);
	const isAdvancing: Readable<boolean> = derived(
		[rotationEnabled, isSuspended],
		([$on, $susp]) => $on && !$susp
	);

	let isAnimating = false;
	// $: statements also run during a server render, where nothing clears the timer
	let isStarted = false;
	let intervalId: ReturnType<typeof setInterval> | null = null;

	function stopInterval() {
		if (intervalId !== null) {
			clearInterval(intervalId);
			intervalId = null;
		}
	}

	function startInterval() {
		stopInterval();
		if (!isStarted || !get(canAutoplay) || get(isPaused)) return;
		intervalId = setInterval(() => {
			// skipped, not stopped, so moving between slides and arrows keeps the schedule
			if (get(isSuspended)) return;
			step(1);
		}, interval);
	}

	function step(dir: -1 | 1) {
		if (isAnimating) return;

		// wrap early so the last slide stays full
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

	function start() {
		const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		reduceMotion.set(motionQuery.matches);

		const onMotionChange = (e: MediaQueryListEvent) => {
			reduceMotion.set(e.matches);
			startInterval();
		};
		motionQuery.addEventListener("change", onMotionChange);

		isStarted = true;
		startInterval();

		return () => {
			isStarted = false;
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

// Stacking helpers
export function isNextSlide(i: number, index: number, count: number): boolean {
	if (count === 1) return false;
	if (index === count - 1) return i === 0;
	return i === index + 1;
}

export function isPrevSlide(i: number, index: number, count: number): boolean {
	if (count === 1) return false;
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