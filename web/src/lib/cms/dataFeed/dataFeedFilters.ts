export type FilterItem = {
	id?: string | null;
	name?: string | null;
}

export type FeedFilters = {
	arrayOf: FilterType,
	filterItems: FilterItem[],
	filterIds: string[]
}[];

type FilterType = "services" | "markets" | "location_cities" | "studio_locations" | "design_team" | "topics" | "authors";

type FilterSourceItem = {
	[propertyName: string]: string | null | undefined;
}
type FilterSourceObject = {
	[relationProperty: string]: FilterSourceItem;
}

type FilterConfig = {
	relationProperty: string;
	nameProperty: string; // display name can be e.g. city_name or filter_button_name
	queryPath: string[]; // descending layers of the filter query
	menuLabel?: string;
	menuHeading?: string;
	menuCollection?: string;
}

const filterConfigs: Record<FilterType, FilterConfig> = {
	services: {
		relationProperty: "services_id",
		nameProperty: "filter_button_name",
		queryPath: ["services", "services_id", "id"],
		menuLabel: "Service",
		menuHeading: "Services",
		menuCollection: "services"
	},
	markets: {
		relationProperty: "markets_id",
		nameProperty: "filter_button_name",
		queryPath: ["markets", "markets_id", "id"],
		menuLabel: "Market",
		menuHeading: "Markets",
		menuCollection: "markets"
	},
	location_cities: {
		relationProperty: "locations_cities_id",
		nameProperty: "city_name",
		queryPath: ["project_location_city", "id"]
	},
	studio_locations: {
		relationProperty: "studio_locations_id",
		nameProperty: "location",
		queryPath: ["studio_locations", "studio_locations_id", "id"]
	},
	design_team: {
		relationProperty: "team_id",
		nameProperty: "name",
		queryPath: ["project_design_team", "team_id", "id"]
	},
	topics: {
		relationProperty: "news_topics_id",
		nameProperty: "name",
		queryPath: ["topics", "news_topics_id", "id"],
		menuLabel: "Topic",
		menuHeading: "Topics",
		menuCollection: "news_topics"
	},
	authors: {
		relationProperty: "team_id",
		nameProperty: "name",
		queryPath: ["authors", "team_id", "id"]
	}
};

const searchPaths: string[][] = [
	["project_title"],
	["project_description"],
	["project_keywords"],
	["location"],
	["collaborators"],
	["services", "services_id", "name"],
	["hidden_services", "services_id", "name"],
	["markets", "markets_id", "name"],
	["hidden_markets", "markets_id", "name"],
	["page_content", "item__page_block_rich_text", "content"]
];

// Under two characters a search matches too much to be worth running
const searchMinLength: number = 2;

export const filterMenuLabel = (arrayOf: FilterType): string => filterConfigs[arrayOf].menuLabel ?? "";

export const filterMenuHeading = (arrayOf: FilterType): string => filterConfigs[arrayOf].menuHeading ?? "";

export const filterMenuCollection = (arrayOf: FilterType): string => filterConfigs[arrayOf].menuCollection ?? "";

// Used on filter menu pages to simplify front-end logic
export const standardizeFilterPropertyNames = (
	arrayOf: FilterType,
	filtersArray: FilterSourceItem[]
): FilterItem[] => {
	const nameProperty: string = filterConfigs[arrayOf].nameProperty;

	return filtersArray
		.map(item => ({
			id: item?.id,
			name: item?.[nameProperty] ?? item?.name
		}))
		.filter(({ id }) => id);
};

export const filterObjectToArray = (
	arrayOf: FilterType,
	filtersObject?: FilterSourceObject[] | null
): FilterItem[] => {
	if (!filtersObject || filtersObject.length === 0) {
		return [];
	}

	const relationProperty: string = filterConfigs[arrayOf].relationProperty;
	const filtersArray: FilterSourceItem[] = filtersObject.map(item => item?.[relationProperty]);

	return standardizeFilterPropertyNames(arrayOf, filtersArray);
};

export const filterStringToGraphql = (item?: string | null): string => `"${item}"`;

export const filterIdToGraphql = (id?: string | null): string =>
	Number.isNaN(Number(id)) ? filterStringToGraphql(id) : `${id}`;

// Wraps a filter in its query path
const nestFilterInQueryPath = (
	queryPath: string[],
	filter: string
): string => {
	let filterString: string = filter;

	for (const property of [...queryPath].reverse()) {
		filterString = `{ ${property}: ${filterString} }`;
	}

	return filterString;
};

const filterArrayToGraphql = (
	arrayOf: FilterType,
	filterIds: string[]
): string => {
	if (!filterIds || filterIds.length === 0) {
		return "";
	}

	const queryIds: string = filterIds.map(filterIdToGraphql).join(",");

	return nestFilterInQueryPath(filterConfigs[arrayOf].queryPath, `{ _in: [${queryIds}] }`);
};

export const filtersArrayToGraphql = (
	filtersArray: FeedFilters
): string[] => {
	let filters: string[] = [];

	for (const filter of filtersArray) {
		const filterString: string = filterArrayToGraphql(filter.arrayOf, filter.filterIds);

		// Empty filters would leave dangling commas in the query
		if (filterString) {
			filters.push(filterString);
		}
	}

	return filters;
};

export const firstFilterName = (
	filtersArray: FeedFilters
): string | null | undefined => {
	const filter = filtersArray.find(({ filterIds }) => filterIds && filterIds.length > 0);

	return filter?.filterItems.find(({ id }) => id === filter.filterIds[0])?.name;
};

// Selections travel as ids, so a set of items has to be reduced to them
export const filterItemIds = (
	filterItems: FilterItem[]
): string[] => filterItems.flatMap(({ id }) => id ? [id] : []);

export const feedFilterGroup = (
	arrayOf: FilterType,
	filtersObject?: FilterSourceObject[] | null
) => {
	const filterItems: FilterItem[] = filterObjectToArray(arrayOf, filtersObject);

	return { arrayOf, filterItems, filterIds: filterItemIds(filterItems) };
};

// Valid filters for articles and projects feeds
export const feedFilterGroups = (feed: {
	feed_source?: string | null;
	feed_filter_services?: FilterSourceObject[] | null;
	feed_filter_markets?: FilterSourceObject[] | null;
	feed_filter_location_cities?: FilterSourceObject[] | null;
	feed_filter_studio_locations?: FilterSourceObject[] | null;
	feed_filter_design_team?: FilterSourceObject[] | null;
	feed_filter_topics?: FilterSourceObject[] | null;
	feed_filter_authors?: FilterSourceObject[] | null;
}): FeedFilters => feed.feed_source === "Articles"
	? [
		feedFilterGroup("topics", feed.feed_filter_topics),
		feedFilterGroup("authors", feed.feed_filter_authors)
	]
	: [
		feedFilterGroup("services", feed.feed_filter_services),
		feedFilterGroup("markets", feed.feed_filter_markets),
		feedFilterGroup("location_cities", feed.feed_filter_location_cities),
		feedFilterGroup("studio_locations", feed.feed_filter_studio_locations),
		feedFilterGroup("design_team", feed.feed_filter_design_team)
	];

// De-dupe on id when combining arrays of filter items
export const mergeFilterItems = (
	filterItems: FilterItem[],
	additionalItems: FilterItem[]
): FilterItem[] => {
	const merged: FilterItem[] = [...filterItems];

	for (const item of additionalItems) {
		if (!merged.some(({ id }) => id === item.id)) {
			merged.push(item);
		}
	}

	return merged;
};

// Strip wildcard characters to ensure valid $search variables
export const sanitizeSearchText = (searchText?: string | null): string => {
	const searchTerm: string = (searchText ?? "").replace(/[%_]/g, "").trim();

	return searchTerm.length >= searchMinLength ? searchTerm : "";
};

export const searchToGraphql = (searchTerm?: string | null): string => {
	if (!searchTerm) {
		return "";
	}

	const searchFilters: string[] = searchPaths.map(
		queryPath => nestFilterInQueryPath(queryPath, `{ _icontains: $search }`)
	);

	return `{ _or: [${searchFilters.join(",\n")}] }`;
};

const urlSearchParam: string = "search";
const filterTypes: FilterType[] = Object.keys(filterConfigs) as FilterType[];

export const hasUrlFilters = (
	searchParams?: URLSearchParams | null
): boolean => {
	if (!searchParams) {
		return false;
	}

	return searchParams.has(urlSearchParam) || filterTypes.some(filterType => searchParams.has(filterType));
};

// URL params apply if and only if the menu is shown and a recognised param is present
export const shouldApplyUrlFilters = (
	showFilterMenu?: boolean | null,
	searchParams?: URLSearchParams | null
): boolean => Boolean(showFilterMenu) && hasUrlFilters(searchParams);

const urlParamIds = (
	param?: string | null
): string[] => param ? param.split(",").map(id => id.trim()).filter(Boolean) : [];

export const feedFiltersFromUrlParams = (
	feedFilters: FeedFilters,
	searchParams?: URLSearchParams | null
): FeedFilters => feedFilters.map(group => ({
	...group,
	filterIds: urlParamIds(searchParams?.get(group.arrayOf))
}));

export const searchTextFromUrlParams = (
	searchParams?: URLSearchParams | null
): string => sanitizeSearchText(searchParams?.get(urlSearchParam));

export const feedFiltersToUrlParams = (
	feedFilters: FeedFilters,
	searchText?: string | null
): string => {
	const params: URLSearchParams = new URLSearchParams();

	for (const group of feedFilters) {
		if (group.filterIds && group.filterIds.length > 0) {
			params.set(group.arrayOf, group.filterIds.join(","));
		}
	}

	const searchTerm: string = sanitizeSearchText(searchText);

	if (searchTerm) {
		params.set(urlSearchParam, searchTerm);
	}

	// put back commas stripped by the sanitize function
	const query: string = params.toString().replace(/%2C/g, ",");

	return query ? `?${query}` : "";
};