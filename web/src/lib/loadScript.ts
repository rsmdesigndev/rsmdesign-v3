const scripts = new Map<string, Promise<void>>();

// Adds a third-party <script> to <head> once per visit
// Must call from onMount, since it needs `document`
export function loadScript(src: string): Promise<void> {
	let promise = scripts.get(src);
	if (!promise) {
		promise = new Promise<void>((resolve, reject) => {
			const script = document.createElement("script");
			script.src = src;
			script.onload = () => resolve();
			script.onerror = () => {
				scripts.delete(src);
				script.remove();
				reject(new Error(`Failed to load ${src}`));
			};
			document.head.append(script);
		});
		scripts.set(src, promise);
	}
	return promise;
}