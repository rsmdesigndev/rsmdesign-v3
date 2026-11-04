import { request } from "graphql-request";
import { env } from "$env/dynamic/public";
import { generateQuery, type QuerySource } from "$lib/cms/dataFeed/dataFeedQueries";
import { standardizeFilterPropertyNames, filterMenuCollection,
		 type FilterItem, type FilterType } from "$lib/cms/dataFeed/dataFeedFilters";

// Shared by every menu instance in the same session
const loadedFilterItems: Record<string, Promise<FilterItem[]>> = {};

// Cache the promise rather than the result, so concurrent menus share one request
export const loadFilterItems = (arrayOf: FilterType): Promise<FilterItem[]> => {
	if (!(arrayOf in loadedFilterItems)) {
		loadedFilterItems[arrayOf] = request(env.PUBLIC_DIRECTUS_API_URL, generateQuery(arrayOf as QuerySource))
			.then((response: any) => standardizeFilterPropertyNames(arrayOf, response?.[filterMenuCollection(arrayOf)] ?? []))
			.catch(error => {
				delete loadedFilterItems[arrayOf];
				console.warn(`Could not load the ${arrayOf} filter list:`, error);
				return [];
			});
	}

	return loadedFilterItems[arrayOf];
};