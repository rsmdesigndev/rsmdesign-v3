import { writable } from "svelte/store";
import { browser } from "$app/environment";

export const MIN_LOAD_TIME_MS = 2000;
const SAFETY_TIMEOUT_MS = 15000;

export type LoaderVariant = "home" | "default";
export type LoaderStatus = "active" | "idle";

export interface LoaderState {
	status: LoaderStatus;
	/** Set during a navigation so the loader variant is pinned to the target page.
	 *  Null when idle — consumers derive variant from `$page` instead. */
	destinationPath: string | null;
}

export function variantFor(pathname: string): LoaderVariant {
	return pathname === "/" ? "home" : "default";
}

function createLoader() {
	const initial: LoaderState = {
		status: "active",
		destinationPath: null
	};

	const { subscribe, set, update } = writable<LoaderState>(initial);

	let activeSince = browser ? Date.now() : 0;
	let dismissTimer: ReturnType<typeof setTimeout> | null = null;
	let safetyTimer: ReturnType<typeof setTimeout> | null = null;

	function clearDismiss() {
		if (dismissTimer) {
			clearTimeout(dismissTimer);
			dismissTimer = null;
		}
	}

	function clearSafety() {
		if (safetyTimer) {
			clearTimeout(safetyTimer);
			safetyTimer = null;
		}
	}

	function dismissNow() {
		clearDismiss();
		clearSafety();
		update(() => ({ status: "idle", destinationPath: null }));
	}

	function start(toPath: string) {
		clearDismiss();
		clearSafety();
		activeSince = Date.now();
		set({ status: "active", destinationPath: toPath });
		// Safety net: if finish() never gets called (canceled nav, page error
		// during hydration, etc.), force dismiss so the loader can't sit forever.
		safetyTimer = setTimeout(dismissNow, SAFETY_TIMEOUT_MS);
	}

	function finish() {
		clearSafety();
		const elapsed = Date.now() - activeSince;
		const wait = Math.max(0, MIN_LOAD_TIME_MS - elapsed);
		clearDismiss();
		dismissTimer = setTimeout(dismissNow, wait);
	}

	return { subscribe, start, finish };
}

export const loading = createLoader();
