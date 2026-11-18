import { sanitizeSearchText, type FeedFilters, type FilterItem } from "$lib/cms/dataFeed/dataFeedFilters";
import { COUNTRY_REGIONS } from "$lib/cms/dataFeed/dataFeedGlobeGeodata";

export type GlobeFeedItem = {
	id?: string | number | null;
	slug?: string | null;
	project_title?: string | null;
	location?: string | null;
	grid_image?: { filename_disk?: string | null; title?: string | null } | null;
	project_description?: string | null;
	project_keywords?: string | null;
	collaborators?: string | null;
	services?: ({ services_id?: { id?: string | number | null; name?: string | null } | null } | null)[] | null;
	hidden_services?: ({ services_id?: { name?: string | null } | null } | null)[] | null;
	markets?: ({ markets_id?: { id?: string | number | null; name?: string | null } | null } | null)[] | null;
	hidden_markets?: ({ markets_id?: { name?: string | null } | null } | null)[] | null;
	project_location_city?: {
		id?: string | number | null;
		city_name?: string | null;
		state_province?: { state_province_name?: string | null } | null;
		country?: { country_name?: string | null } | null;
	} | null;
	project_location_lng?: number | string | null; // degrees; a numeric string is read as a number too
	project_location_lat?: number | string | null;
};

export type GlobeProject = {
	slug: string | null;
	title: string;
	location: string;
	image: { filename_disk?: string | null; title?: string | null } | null;
	longitude: number;
	latitude: number;
	serviceIds: string[];
	marketIds: string[];
	levels: string[]; // region, country, state/province, city
	searchText: string;
};

export type LocationLevel = {
	name: string;
	plural: string;
};

export const LOCATION_LEVELS: LocationLevel[] = [
	{ name: "Region", plural: "Regions" },
	{ name: "Country", plural: "Countries" },
	{ name: "State/province", plural: "States/Provinces" },
	{ name: "City", plural: "Cities" }
];

// One value or nothing per level
export type LocationSelection = (string | null)[];

export type LocationEntry = {
	level: number;
	value: string;
};

export const emptyLocationSelection = (): LocationSelection => LOCATION_LEVELS.map(() => null);

const warned: Set<string> = new Set();

const warnOnce = (message: string): void => {
	if (!warned.has(message)) {
		warned.add(message);
		console.warn(message);
	}
};

// A coordinate within ±limit degrees, or null for a missing or malformed one (MapLibre throws on a latitude past ±90)
const degrees = (value: number | string | null | undefined, limit: number): number | null => {
	const parsed: number = value === null || value === undefined || value === "" ? NaN : Number(value);

	return Number.isFinite(parsed) && Math.abs(parsed) <= limit ? parsed : null;
};

const idString = (id?: string | number | null): string => id === null || id === undefined ? "" : String(id);

const nonEmpty = (values: string[]): string[] => values.filter(Boolean);

const stripTags = (html?: string | null): string => (html ?? "").replace(/<[^>]+>/g, " ");

// Null without coordinates, which keeps the project off the globe and out of the sidebar
export const globeProjectFromFeedItem = (item: GlobeFeedItem): GlobeProject | null => {
	const longitude: number | null = degrees(item.project_location_lng, 180);
	const latitude: number | null = degrees(item.project_location_lat, 90);

	if (longitude === null || latitude === null) {
		warnOnce(`No coordinates for project ${item.slug || idString(item.id)}; set its project_location_lng and project_location_lat`);
		return null;
	}

	const city = item.project_location_city;
	const country: string = city?.country?.country_name ?? "";
	const region: string = COUNTRY_REGIONS[country] ?? "";

	if (country && !region) {
		warnOnce(`No region for ${country}; add it to COUNTRY_REGIONS`);
	}

	const state: string = city?.state_province?.state_province_name ?? "";
	const cityName: string = city?.city_name ?? "";
	const title: string = item.project_title ?? "";
	const location: string = item.location || [cityName, state, country === "United States of America" ? "" : country].filter(Boolean).join(", ");
	const services = item.services ?? [];
	const markets = item.markets ?? [];

	return {
		slug: item.slug ?? null,
		title,
		location,
		image: item.grid_image ?? null,
		longitude,
		latitude,
		serviceIds: nonEmpty(services.map(service => idString(service?.services_id?.id))),
		marketIds: nonEmpty(markets.map(market => idString(market?.markets_id?.id))),
		levels: [region, country, state, cityName],
		searchText: [
			title,
			stripTags(item.project_description),
			item.project_keywords ?? "",
			location,
			item.collaborators ?? "",
			...services.map(service => service?.services_id?.name ?? ""),
			...(item.hidden_services ?? []).map(service => service?.services_id?.name ?? ""),
			...markets.map(market => market?.markets_id?.name ?? ""),
			...(item.hidden_markets ?? []).map(market => market?.markets_id?.name ?? "")
		].join(" ").toLowerCase()
	};
};

export const globeProjectsFromFeedItems = (items?: GlobeFeedItem[] | null): GlobeProject[] =>
	(items ?? []).flatMap(item => {
		const project = globeProjectFromFeedItem(item);

		return project ? [project] : [];
	});

export const globeSearchTerm = (searchText?: string | null): string => sanitizeSearchText(searchText).toLowerCase();

// Only options some project carries, so none leads to an empty result
export const globeFilterOptions = (
	group: FeedFilters[number],
	projects: GlobeProject[]
): FilterItem[] => {
	const projectIds: string[] = group.arrayOf === "services"
		? projects.flatMap(project => project.serviceIds)
		: group.arrayOf === "markets" ? projects.flatMap(project => project.marketIds) : [];
	const ids: Set<string> = new Set(projectIds);

	return group.filterItems.filter(item => ids.has(idString(item.id)));
};

const matchesGroup = (filterIds: string[], projectIds: string[]): boolean =>
	filterIds.length === 0 || filterIds.some(id => projectIds.includes(id));

const matchesLocation = (project: GlobeProject, selection: LocationSelection, upToLevel: number): boolean =>
	selection.every((value, level) => level > upToLevel || value === null || project.levels[level] === value);

// The feed's other filters already shaped the query, so only these apply in the browser
export const globeProjectMatches = (
	project: GlobeProject,
	feedFilters: FeedFilters,
	selection: LocationSelection,
	searchTerm: string
): boolean => {
	for (const group of feedFilters) {
		if (group.arrayOf === "services" && !matchesGroup(group.filterIds, project.serviceIds)) {
			return false;
		}

		if (group.arrayOf === "markets" && !matchesGroup(group.filterIds, project.marketIds)) {
			return false;
		}
	}

	return matchesLocation(project, selection, LOCATION_LEVELS.length - 1)
		&& (searchTerm === "" || project.searchText.includes(searchTerm));
};

const distinctValues = (projects: GlobeProject[], level: number): string[] =>
	[...new Set(projects.map(project => project.levels[level]))].filter(Boolean).sort();

// The first step lists each region over its countries; later steps list one level within the selection so far
export const locationGroups = (
	projects: GlobeProject[],
	selection: LocationSelection,
	step: number
): LocationEntry[][] => {
	if (step === 0) {
		return distinctValues(projects, 0).map(region => [
			{ level: 0, value: region },
			...distinctValues(projects.filter(project => project.levels[0] === region), 1).map(country => ({ level: 1, value: country }))
		]);
	}

	const within: GlobeProject[] = projects.filter(project => matchesLocation(project, selection, step - 1));

	return [distinctValues(within, step).map(value => ({ level: step, value }))];
};

export const isLocationSelected = (selection: LocationSelection, entry: LocationEntry): boolean =>
	selection[entry.level] === entry.value;

// A country stands in for its region, so choosing either clears the other, and anything deeper
export const toggleLocation = (selection: LocationSelection, entry: LocationEntry): LocationSelection => {
	const wasSelected: boolean = isLocationSelected(selection, entry);
	const clearFrom: number = entry.level === 1 ? 0 : entry.level;
	const toggled: LocationSelection = selection.map((value, level) => level < clearFrom ? value : null);

	if (!wasSelected) {
		toggled[entry.level] = entry.value;
	}

	return toggled;
};

export const hasLocationSelection = (selection: LocationSelection): boolean => selection.some(value => value !== null);

// The next step is the first deeper level with more than one value, so a lone state or city is skipped
export const nextLocationStep = (
	projects: GlobeProject[],
	selection: LocationSelection,
	step: number
): { step: number; count: number } | null => {
	if (!hasLocationSelection(selection)) {
		return null;
	}

	const currentLevel: number = Math.max(step, 1);
	const within: GlobeProject[] = projects.filter(project => matchesLocation(project, selection, currentLevel));

	for (let level = currentLevel + 1; level < LOCATION_LEVELS.length; level++) {
		const count: number = distinctValues(within, level).length;

		if (count > 1) {
			return { step: level, count };
		}
	}

	return null;
};