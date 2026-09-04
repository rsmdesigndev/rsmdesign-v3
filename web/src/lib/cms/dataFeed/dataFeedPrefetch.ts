import { request } from "graphql-request";
import { env } from "$env/dynamic/public";
import { feedAggregate, feedItemsPerLoad, feedSourceConfig, generateQuery } from "$lib/cms/dataFeed/dataFeedQueries";
import { feedFilterGroups, filtersArrayToGraphql, searchToGraphql, searchTextFromUrlParams,
		 shouldApplyUrlFilters, feedFiltersFromUrlParams } from "$lib/cms/dataFeed/dataFeedFilters";

type FeedBlock = {
	item?: {
		__typename?: string | null;
		feed_source?: string | null;
		feed_filter_logic?: string | null;
		feed_show_filter_menu?: boolean | null;
		feed_view?: string | null;
		feed_grid_style?: string | null;
		feed_grid_columns?: number | null;
		feed_grid_rows_per_load?: number | null;
		feed_table_items_per_load?: number | null;
		feed_items?: any[] | null;
		feed_url_filtered?: boolean | null;
		feed_total_count?: number | null;
		[property: string]: any;
	} | null;
} | null;

const prefetchDataFeed = async (
	feed: NonNullable<FeedBlock>["item"],
	searchParams?: URLSearchParams | null
) => {
	if (!feed) {
		return;
	}

	const source = feedSourceConfig(feed.feed_source);

	// Manual feeds have no source
	if (!source) {
		return;
	}

	const fromUrl: boolean = shouldApplyUrlFilters(feed.feed_show_filter_menu, searchParams);
	const feedFilters = fromUrl
		? feedFiltersFromUrlParams(feedFilterGroups(feed), searchParams)
		: feedFilterGroups(feed);
	const searchTerm: string = fromUrl ? searchTextFromUrlParams(searchParams) : "";

	const filters: string[] = filtersArrayToGraphql(feedFilters);
	const query: string = generateQuery(
		source.querySource,
		filters,
		feed.feed_filter_logic,
		searchToGraphql(searchTerm)
	);

	try {
		const response: any = await request(env.PUBLIC_DIRECTUS_API_URL, query, {
			limit: feedItemsPerLoad(feed),
			offset: 0,
			skipCount: false,
			search: searchTerm
		});

		if (response) {
			feed.feed_items = response[source.collection] ?? [];
			
			// Mark feed for re-fetching if it was pre-rendered, to apply filters
			feed.feed_url_filtered = fromUrl;
			feed.feed_total_count = response[feedAggregate(source.collection)]?.[0]?.count?.id ?? 0;
		}
	} catch (error) {
		console.warn(`Could not prefetch the ${feed.feed_source} feed:`, error);
	}
};

// Attach the first page of feed results to the DataFeed page block
export const prefetchDataFeeds = async <Blocks extends FeedBlock[] | null | undefined>(
	blocks: Blocks,
	searchParams?: URLSearchParams | null
): Promise<Blocks> => {
	const feeds = (blocks ?? [])
		.filter(block => block?.item?.__typename === "page_blocks_v3_organism_data_feed")
		.map(block => prefetchDataFeed(block?.item, searchParams));

	await Promise.all(feeds);

	return blocks;
};
