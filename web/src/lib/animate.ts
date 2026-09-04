/* HOW TO USE THIS LIBRARY
 *
 * In your component’s <script> block, import the following from "$lib/animate":
 * - { animate } in order to use `use:animate` on your HTML elements;
 * - { fadeIn, moveIn, fadeMoveIn, fadeScroll, moveScroll, fadeMoveScroll }
 *     in order to use any of the reusable default animations;
 * - { AnimateTrigger } in order to define new animations within your component.
 *
 * You can customize the default animations using the following CSS custom properties.
 * Changes to these properties can be scoped to a component or an element based on
 * where you put them in your CSS.
 * - `--fade-from` and `--fade-to` define the initial and final values, respectively,
 *    of a fade animation. They each accepts a number from 0 to 1.
 * - `--moveX-from`, `--moveX-to`, `--moveY-from`, and `--moveY-to` define the initial
 *    and final values of a move animation, for the X and Y axes respectively. They
 *    accept absolute or relative <length> values (rem or px recommended).
 * - `--fade-duration` and `--move-duration` set the duration for a fade or move
 *    animation, respectively. They accept a <time> value, such as 0.3s or 300ms.
 * - `--fade-timing` and `--move-timing` set the timing function for a fade or move
 *    animation, respectively. They accept a timing function, without quotation marks.
 *    E.g. linear, ease, ease-in, ease-in-out.
 * 
 * If `targetSelector` is defined, the given animClass will be applied to the element 
 * found via `document.querySelector(targetSelector)`.
 * Otherwise, animClass will be applied to the element that this action is on.
 */

export enum AnimateTrigger {
	OnScrollIntoView,
	WhileScrollingInView,
	InitialPageLoad,
	PageTransition,
	DownOnly
}

export type AnimateOptions = {
	trigger: AnimateTrigger;
	animClass: string;
	targetSelector?: string;
	removeOutOfView?: boolean;
	intersectionOptions?: IntersectionObserverInit;
};

const PAGE_TRANSITION_TIMEOUT = 2000;

type ScrollSubscriber = {
	measure?(): void;
	apply?(): void;
};

const scrollSubscribers = new Set<ScrollSubscriber>();

let lastScrollPosition = 0;
let scrollingDown = true;

function handleWindowScroll(): void {
	const position = window.scrollY;
	scrollingDown = position > lastScrollPosition;
	lastScrollPosition = position;

	scrollSubscribers.forEach((subscriber) => subscriber.measure?.());
	scrollSubscribers.forEach((subscriber) => subscriber.apply?.());
}

function subscribeToScroll(subscriber: ScrollSubscriber): () => void {
	if (scrollSubscribers.size === 0) {
		window.addEventListener("scroll", handleWindowScroll, { passive: true });
	}

	scrollSubscribers.add(subscriber);

	return () => {
		scrollSubscribers.delete(subscriber);

		if (scrollSubscribers.size === 0) {
			window.removeEventListener("scroll", handleWindowScroll);
		}
	};
}

function sameOptions(a: AnimateOptions, b: AnimateOptions): boolean {
	return (
		a.trigger === b.trigger &&
		a.animClass === b.animClass &&
		a.targetSelector === b.targetSelector &&
		a.removeOutOfView === b.removeOutOfView &&
		a.intersectionOptions === b.intersectionOptions
	);
}

export function animate(element: HTMLElement, options: AnimateOptions) {
	let current = options;
	let instance = init(element, current);

	return {
		update(next: AnimateOptions) {
			if (sameOptions(current, next)) return;

			instance?.destroy();
			current = next;
			instance = init(element, current);
		},
		destroy() {
			instance?.destroy();
		}
	};
}

function init(element: HTMLElement, options: AnimateOptions) {
	let targetElement = element;
	let isRemoteTarget = false;

	if (options.targetSelector) {
		const el = document.querySelector<HTMLElement>(options.targetSelector);
		if (el === null) {
			// Throwing here strands the page lifecycle (afterNavigate stops
			// firing, loader gets stuck). Warn and no-op instead so a missing
			// selector on one route doesn't break navigation site-wide.
			console.warn(`animate: target selector not found: ${options.targetSelector}`);
			return;
		}
		targetElement = el;
		isRemoteTarget = true;
	}

	if (options.trigger === AnimateTrigger.OnScrollIntoView) {
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					targetElement.classList.add(options.animClass);
				} else if (options.removeOutOfView) {
					targetElement.classList.remove(options.animClass);
				}
			});
		}, options.intersectionOptions);

		observer.observe(element);

		return {
			destroy() {
				observer.disconnect();
				if (isRemoteTarget) targetElement.classList.remove(options.animClass);
			}
		};
	} else if (options.trigger === AnimateTrigger.WhileScrollingInView) {
		targetElement.classList.add(options.animClass);
		targetElement.style.animationPlayState = "paused";

		function readAnimationDuration(): number {
			return parseFloat(
				window.getComputedStyle(targetElement).getPropertyValue("animation-duration")
			);
		}

		let animationDuration = readAnimationDuration();

		let percentage = 0;
		let lastPercentage: number | null = null;

		function measure(): void {
			const rect = element.getBoundingClientRect();

			/* clamp to the endpoints when out of view, otherwise a fast scroll
			   past the element strands the attribute mid-range */
			if (rect.bottom < 0) {
				percentage = 1;
			} else if (rect.top > window.innerHeight) {
				percentage = 0;
			} else {
				percentage = Math.min(
					1,
					Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight + rect.height))
				);
			}
		}

		function apply(): void {
			if (percentage === lastPercentage) return;
			lastPercentage = percentage;

			targetElement.style.animationDelay = `-${percentage * animationDuration}s`;
			targetElement.setAttribute("data-scroll-percentage", (percentage * 100).toFixed(1));
		}

		function refresh(): void {
			measure();
			apply();
		}

		function handleResize(): void {
			animationDuration = readAnimationDuration();
			lastPercentage = null;
			refresh();
		}

		const unsubscribe = subscribeToScroll({ measure, apply });
		window.addEventListener("resize", handleResize, { passive: true });

		if (document.readyState === "complete") {
			refresh();
		} else {
			window.addEventListener("load", refresh);
		}

		// TODO: Figure out how to make this work on navigate 
		// without the kludge in src/routes/+layout.svelte

		return {
			destroy() {
				unsubscribe();
				window.removeEventListener("resize", handleResize);
				window.removeEventListener("load", refresh);
				
				if (isRemoteTarget) {
					targetElement.classList.remove(options.animClass);
					targetElement.style.animationPlayState = "";
					targetElement.style.animationDelay = "";
					targetElement.removeAttribute("data-scroll-percentage");
				}
			}
		};
	} else if (options.trigger === AnimateTrigger.InitialPageLoad) {
		function handlePageLoad() {
			targetElement.classList.add(options.animClass);
		}

		if (document.readyState === "complete") {
			handlePageLoad();
		} else {
			window.addEventListener("load", handlePageLoad);
		}

		return {
			destroy() {
				window.removeEventListener("load", handlePageLoad);
				if (isRemoteTarget) targetElement.classList.remove(options.animClass);
			}
		};
	} else if (options.trigger === AnimateTrigger.PageTransition) {
		let deferring = false;
		let replaying = false;

		function isPageTransition(e: MouseEvent): boolean {
			if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
			if (e.defaultPrevented) return false;

			const anchor = (e.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");

			if (!anchor) return true;

			if (anchor.hasAttribute("download")) return false;
			if (anchor.target !== "" && anchor.target !== "_self") return false;

			const url = new URL(anchor.href, location.href);

			if (url.protocol !== "http:" && url.protocol !== "https:") return false;

			return !(
				url.hash &&
				url.origin === location.origin &&
				url.pathname === location.pathname &&
				url.search === location.search
			);
		}

		function playAnimation(): Promise<unknown> {
			// remove, flush, re-add to restart the animation
			// so a cancelled navigation still animates on next click */
			targetElement.classList.remove(options.animClass);
			void targetElement.offsetWidth;
			targetElement.classList.add(options.animClass);

			return Promise.race([
				Promise.all(
					targetElement.getAnimations().map((animation) => animation.finished.catch(() => {}))
				),
				new Promise((resolve) => window.setTimeout(resolve, PAGE_TRANSITION_TIMEOUT))
			]);
		}

		function handleClick(e: MouseEvent): void {
			if (replaying) return;
			if (!isPageTransition(e)) return;

			e.preventDefault();
			e.stopPropagation();

			// swallow second click mid-animation
			if (deferring) return;
			deferring = true;

			const clicked = e.target as Element;

			playAnimation().then(() => {
				deferring = false;

				if (!clicked.isConnected) return;

				replaying = true;
				clicked.dispatchEvent(
					new MouseEvent("click", {
						bubbles: true,
						cancelable: true,
						composed: true,
						view: window
					})
				);
				replaying = false;
			});
		}

		element.addEventListener("click", handleClick, true);

		return {
			destroy() {
				element.removeEventListener("click", handleClick, true);
				if (isRemoteTarget) targetElement.classList.remove(options.animClass);
			}
		};
	} else if (options.trigger === AnimateTrigger.DownOnly)	{
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting && scrollingDown) {
					targetElement.classList.add(options.animClass);
				} else if (options.removeOutOfView && !scrollingDown) {
					targetElement.classList.remove(options.animClass);
				}
			});
		}, options.intersectionOptions);

		observer.observe(element);

		const unsubscribe = subscribeToScroll({});

		return {
			destroy() {
				observer.disconnect();
				unsubscribe();
				if (isRemoteTarget) targetElement.classList.remove(options.animClass);
			}
		};
	} else {
		throw new Error("Invalid animate trigger");
	}
}

// Reusable animations
export const fadeIn = { trigger: AnimateTrigger.OnScrollIntoView, animClass: "fade" } satisfies AnimateOptions;
export const moveIn = { trigger: AnimateTrigger.OnScrollIntoView, animClass: "move" } satisfies AnimateOptions;
export const fadeMoveIn = { trigger: AnimateTrigger.OnScrollIntoView, animClass: "fadeMove" } satisfies AnimateOptions;
export const fadeMoveLeft = { trigger: AnimateTrigger.OnScrollIntoView, animClass: "fadeMoveLeft"} satisfies AnimateOptions

export const fadeScroll = { trigger: AnimateTrigger.WhileScrollingInView, animClass: "fade" } satisfies AnimateOptions;
export const moveScroll = { trigger: AnimateTrigger.WhileScrollingInView, animClass: "move" } satisfies AnimateOptions;
export const fadeMoveScroll = {
	trigger: AnimateTrigger.DownOnly,
	animClass: "fadeMove"
} satisfies AnimateOptions;
export const slideLeft = { trigger: AnimateTrigger.DownOnly, animClass: "slideLeft", removeOutOfView: true } satisfies AnimateOptions
export const mainHeading = { trigger: AnimateTrigger.DownOnly, animClass: "mainHeading", removeOutOfView: true} satisfies AnimateOptions
export const secondaryHeading = { trigger: AnimateTrigger.DownOnly, animClass: "secondaryHeading", removeOutOfView: true} satisfies AnimateOptions
export const mainParagraph = { trigger: AnimateTrigger.DownOnly, animClass: "mainParagraph", removeOutOfView: true} satisfies AnimateOptions