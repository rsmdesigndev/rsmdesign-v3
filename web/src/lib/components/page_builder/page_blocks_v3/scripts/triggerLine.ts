// keep in sync with $BREAKPOINT-XS
export const MOBILE_QUERY = "(max-width: 31.25em)";
export const LOW_TRIGGER_LINE = 0.75;

export function triggerLine(lowOnMobile: boolean): number {
	return lowOnMobile && window.matchMedia(MOBILE_QUERY).matches ? LOW_TRIGGER_LINE : 0.5;
}

export function scrollToLowTriggerLine(element: Element, behavior: ScrollBehavior = "auto") {
	window.scrollBy({
		top: element.getBoundingClientRect().top - (window.innerHeight * LOW_TRIGGER_LINE - 1),
		behavior
	});
}

export function onTriggerLine(node: Element, onIntersect: () => void, lowOnMobile: boolean = true) {
	const mobile = window.matchMedia(MOBILE_QUERY);
	let observer: IntersectionObserver | undefined;

	function observe() {
		const line = triggerLine(lowOnMobile);
		observer?.disconnect();
		observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) onIntersect();
		}, { rootMargin: `-${line * 100}% 0% -${(1 - line) * 100}% 0%` });
		observer.observe(node);
	}

	observe();
	if (lowOnMobile) mobile.addEventListener("change", observe);

	return {
		destroy() {
			mobile.removeEventListener("change", observe);
			observer?.disconnect();
		}
	};
}