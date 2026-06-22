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
 * If `targetSelector` is defined, the given animClass will be applied to the element found via `document.querySelector(targetSelector)`.
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

export function animate(element: HTMLElement, options: AnimateOptions) {
	let targetElement = element;

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
				observer.unobserve(element);
			}
		};
	} else if (options.trigger === AnimateTrigger.WhileScrollingInView) {
		targetElement.classList.add(options.animClass);
		targetElement.style.animationPlayState = "paused";

		function handleScroll(_event: Event) {
			const rect = element.getBoundingClientRect();

			if (rect.bottom < 0 || rect.top > window.innerHeight) {
				// out of view
			} else {
				const scrollPercentage = Math.min(
					1,
					Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight + rect.height))
				);
				const animationDuration = parseFloat(
					window.getComputedStyle(targetElement).getPropertyValue("animation-duration")
				);

				targetElement.style.animationDelay = `-${scrollPercentage * animationDuration}s`;
				targetElement.setAttribute("data-scroll-percentage", (scrollPercentage * 100).toFixed(1));
			}
		}

		window.addEventListener("scroll", handleScroll);
		window.addEventListener("load", handleScroll);
		// TODO: Figure out how to make this work on navigate 
		// without the kludge in src/routes/+layout.svelte
		// window.addEventListener("navigate", handleScroll);

		return {
			destroy() {
				window.removeEventListener("scroll", handleScroll);
				window.addEventListener("load", handleScroll);
				// window.addEventListener("navigate", handleScroll);
			}
		};
	} else if (options.trigger === AnimateTrigger.InitialPageLoad) {
		let classToAdd = options.animClass;

		function handlePageLoad(event: Event) {
			targetElement.classList.add(classToAdd);
		}

		window.addEventListener("load", handlePageLoad);
		// window.addEventListener("navigate", handlePageLoad);

		return {
			destroy() {
				window.removeEventListener("load", handlePageLoad);
				// window.addEventListener("navigate", handlePageLoad);
			}
		};
	} else if (options.trigger === AnimateTrigger.DownOnly)	{
		let lastScrollPosition = 0;
		let ticking = false;
		let scrollDown = true;

		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting && scrollDown) {
					targetElement.classList.add(options.animClass);
				} else if (options.removeOutOfView && !scrollDown) {
					targetElement.classList.remove(options.animClass);
				}
			});
		}, options.intersectionOptions);

		observer.observe(element);

		document.addEventListener("scroll", (event) => {
			if (!ticking) {
				window.requestAnimationFrame(() => {
					if (window.scrollY > lastScrollPosition) {
						scrollDown = true;
					} else {
						scrollDown = false;
						lastScrollPosition = window.scrollY;
					}
					ticking = false;
				});
		
				ticking = true;
			}
		});

		return {
			destroy() {
				observer.unobserve(element);
			}
		};
	} else {
		throw new Error("Invalid animate trigger");
	}
}

// Reusable animations
export const fadeIn = { trigger: AnimateTrigger.OnScrollIntoView, animClass: "fade" };
export const moveIn = { trigger: AnimateTrigger.OnScrollIntoView, animClass: "move" };
export const fadeMoveIn = { trigger: AnimateTrigger.OnScrollIntoView, animClass: "fadeMove" };
export const fadeMoveLeft = { trigger: AnimateTrigger.OnScrollIntoView, animClass: "fadeMoveLeft"}

export const fadeScroll = { trigger: AnimateTrigger.WhileScrollingInView, animClass: "fade" };
export const moveScroll = { trigger: AnimateTrigger.WhileScrollingInView, animClass: "move" };
export const fadeMoveScroll = {
	trigger: AnimateTrigger.DownOnly,
	animClass: "fadeMove"
};
export const slideLeft = { trigger: AnimateTrigger.DownOnly, animClass: "slideLeft", removeOutOfView: true }
export const mainHeading = { trigger: AnimateTrigger.DownOnly, animClass: "mainHeading", removeOutOfView: true}
export const secondaryHeading = { trigger: AnimateTrigger.DownOnly, animClass: "secondaryHeading", removeOutOfView: true}
export const mainParagraph = { trigger: AnimateTrigger.DownOnly, animClass: "mainParagraph", removeOutOfView: true}
