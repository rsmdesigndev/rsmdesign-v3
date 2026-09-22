import { filterIdToGraphql, filterStringToGraphql } from "$lib/cms/dataFeed/dataFeedFilters";
import { feedGridItemsPerLoad } from "$lib/cms/dataFeed/dataFeedGridLayout";

export type QuerySource = "projects" | "articles" | "team" | "awards" | "testimonials" | "careers" | "studios" | "services" | "markets" | "topics";

type FeedSourceConfig = {
	querySource: QuerySource;
	collection: string;
	cursorField?: string; // What the feed orders by for NextEntry component
	cursorDescending?: boolean;
	titleField?: string;
	routePrefix?: string;
}

const feedSourceConfigs: Record<string, FeedSourceConfig> = {
	Projects: {
		querySource: "projects",
		collection: "projects",
		cursorField: "sort",
		titleField: "project_title",
		routePrefix: "/work"
	},
	Articles: {
		querySource: "articles",
		collection: "news_posts",
		cursorField: "published_date",
		cursorDescending: true,
		titleField: "post_title",
		routePrefix: "/news"
	},
	Team: { querySource: "team", collection: "team" },
	Awards: { querySource: "awards", collection: "awards" },
	Testimonials: { querySource: "testimonials", collection: "testimonials" },
	Careers: { querySource: "careers", collection: "careers" },
	Studios: { querySource: "studios", collection: "studio_locations" }
};

export const feedSourceConfig = (
	feedSource?: string | null
): FeedSourceConfig | undefined => feedSource ? feedSourceConfigs[feedSource] : undefined;

export const feedAggregate = (collection: string): string => `${collection}_aggregated`;

// takes only the properties it reads, so needs no import from the component.
export const feedItemsPerLoad = (feed: {
	feed_view?: string | null;
	feed_load_functionality?: string | null;
	feed_grid_style?: string | null;
	feed_grid_columns?: number | null;
	feed_grid_rows_per_load?: number | null;
	feed_grid_dynamic_start_position?: boolean | null;
	feed_grid_dynamic_images?: unknown[] | null;
	feed_table_items_per_load?: number | null;
}, loadedItemCount: number = 0): number | undefined => {
	if (feed.feed_view !== "Grid") {
		return feed.feed_table_items_per_load ?? undefined;
	}

	const columns = feed.feed_grid_columns;
	const rows = feed.feed_grid_rows_per_load;

	if (feed.feed_grid_style === "dynamic") {
		if (columns === 3 || columns === 4) {
			// carousel pages each start the pattern over
			const appendsToGrid = feed.feed_load_functionality === "scroll" || feed.feed_load_functionality === "button";
			const config = { columns, style: feed.feed_grid_style, startRight: String(feed.feed_grid_dynamic_start_position) === "true" };

			return rows
				? feedGridItemsPerLoad(appendsToGrid ? loadedItemCount : 0, rows, feed.feed_grid_dynamic_images?.length ?? 0, config, appendsToGrid)
				: undefined;
		}

		return 14;
	}

	return columns && rows ? columns * rows : undefined;
};

// Need to check more than 2 entries that match the same cursor
// because multiple articles may share the same published_date
export const nextEntryFetchLimit: number = 5;

export const generateNextEntryQuery = (options: {
	feedSource?: string | null;
	filters?: string[];
	filterLogic?: string | null;
	searchFilter?: string;
	cursor?: string | number | null;
	currentSlug?: string | null;
}): string => {
	const source = feedSourceConfig(options.feedSource);

	if (!source?.cursorField || !source.titleField) {
		return "";
	}

	const filterString: string = options.filters?.join(",\n") ?? "";
	const logic: string = options.filterLogic ?? "and";
	const searchFilter: string = options.searchFilter ?? "";
	const searchVariable: string = searchFilter ? "($search: String!)" : "";
	const searchClause: string = searchFilter ? `,\n${searchFilter}` : "";

	const descending: boolean = Boolean(source.cursorDescending);
	const direction: string = descending ? "-" : "";
	const after: string = descending ? "_lte" : "_gte";
	const sort: string = `["${direction}${source.cursorField}", "${direction}slug"]`;
	const currentSlug: string = filterStringToGraphql(options.currentSlug);

	// A project without a sort value wraps instead of breaking
	const cursorClause: string = options.cursor === null || options.cursor === undefined
		? `,\n\t\t\t\t\t\t\t\t{ slug: { _neq: ${currentSlug} } }`
		: `,\n\t\t\t\t\t\t\t\t{ ${source.cursorField}: { ${after}: ${filterIdToGraphql(String(options.cursor))} } }`;

	const visibility: string = `{ visibility: { _nin: ["draft", "archived"] } }`;

	const selection: string = `slug\n\t\t\t\t\t\t\t${source.titleField}`;

	return `query NextEntry${searchVariable} {
					next: ${source.collection}(
						filter: {
							_and: [
								${visibility},
								{
									_${logic}: [
										${filterString}
									]
								}${searchClause}${cursorClause}
							]
						}
						sort: ${sort}
						limit: ${nextEntryFetchLimit}
					) {
						${selection}
					}
					first: ${source.collection}(
						filter: {
							_and: [
								${visibility},
								{
									_${logic}: [
										${filterString}
									]
								}${searchClause}
							]
						}
						sort: ${sort}
						limit: 1
					) {
						${selection}
					}
				}
			`;
};

export const generateQuery = (
	source: QuerySource,
	filters?: string[],
	filterLogic?: string | null,
	searchFilter?: string
): string => {
	const filterString: string = filters?.join(",\n") ?? "";
	const logic: string = filterLogic ?? "and";

	const searchVariable: string = searchFilter ? ", $search: String!" : "";
	const searchClause: string = searchFilter ? `,\n${searchFilter}` : "";

	switch (source) {
		case "projects":
			return `query Projects($limit: Int, $offset: Int, $skipCount: Boolean!${searchVariable}) {
						projects(
							limit: $limit
							offset: $offset
							filter: {
								_and: [
									{ visibility: { _nin: ["draft", "archived"] } },
									{
										_${logic}: [
											${filterString}
										]
									}${searchClause}
								]
							}
						) {
							id
							slug
							project_title
							grid_image {
								filename_disk
								title
								description
							}
							hero_image {
								filename_disk
								title
								description
							}
							location
							markets {
								markets_id {
									name
									short_name
								}
							}
							project_location_city {
								city_name
								state_province {
									state_province_name
									state_province_abbreviation
								}
								country {
									country_name
									country_abbreviation
								}
							}
							studio_locations {
								studio_locations_id {
									slug
									location
								}
							}
						}
						projects_aggregated(
							filter: {
								_and: [
									{ visibility: { _nin: ["draft", "archived"] } },
									{
										_${logic}: [
											${filterString}
										]
									}${searchClause}
								]
							}
						) @skip(if: $skipCount) {
							count {
								id
							}
						}
					}
				`;
		case "articles":
			return `query Articles($limit: Int, $offset: Int${searchVariable}) {
						news_posts(
							limit: $limit
							offset: $offset
							sort: [ "-published_date" ]
							filter: {
								_and: [
									{ visibility: { _nin: ["draft", "archived"] } },
									{
										_and: [
											${filterString}
										]
									}${searchClause}
								]
							}
						) {
							id
							slug
							post_title
							published_date
							grid_image {
								filename_disk
								description
							}
							hero_image {
								filename_disk
								title
								description
							}
							topics {
								news_topics_id {
									name
								}
							}
						}
						news_posts_aggregated(
							filter: {
								_and: [
									{ visibility: { _nin: ["draft", "archived"] } },
									{
										_and: [
											${filterString}
										]
									}${searchClause}
								]
							})
						{
							count {
								id
							}
						}
					}
				`;
		case "team":
			return `query Team($limit: Int, $offset: Int) {
						team(
							limit: $limit
							offset: $offset
							sort: ["sort_priority", "-banner_grid_image_sort"]
							filter: { 
								visibility: { _in: ["visible", "visibleInFeeds"] } 
							}
						) {
							id
							slug
							name
							full_title
							short_title
							seo_page_description
							headshot {
								title
								description
								filename_disk
							}
							has_profile_page
						}
						team_aggregated(
							filter: {
								_and: [
									{ visibility: { _in: ["visible", "visibleInFeeds"] } }
								]
							})
						{
							count {
								id
							}
						}
					}
				`;
		case "awards":
			return `query Awards($limit: Int, $offset: Int) {
						awards(
							limit: $limit
							offset: $offset
							sort: ["-year", "-awards_page_sort"]
							filter: { 
								visibility: { _nin: ["draft", "archived"] } 
							}
						) {
							id
							award_body_designation
							award_category
							year
							awards_page_sort
							project_name
							project_location
							project {
								slug
								project_title
								location
								grid_image {
									filename_disk
									title
									description
								}
								project_location_city {
									city_name
									state_province {
										state_province_name
										state_province_abbreviation
									}
									country {
										country_name
										country_abbreviation
									}
								}
							}
						}
						awards_aggregated(
							filter: {
								_and: [
									{ visibility: { _nin: ["draft", "archived"] } }
								]
							})
						{
							count {
								id
							}
						}
					}
				`;
		case "testimonials":
			return `query Testimonials($limit: Int, $offset: Int) {
						testimonials(
							limit: $limit
							offset: $offset
							filter: { 
								visibility: { _eq: "visible" } 
							}
						) {
							id
							quote_attribution
							quote_attribution_job_title
							company_name
							quote
							banner_image {
								filename_disk
								title
								description
							}
							associated_project {
								slug
								project_title
								location
								grid_image {
									filename_disk
									title
									description
								}
							}
						}
						testimonials_aggregated(
							filter: {
								visibility: { _eq: "visible" } 
							})
						{
							count {
								id
							}
						}
					}
				`;
		case "careers":
			return `query Careers($limit: Int, $offset: Int) {
						careers(
							limit: $limit
							offset: $offset
							sort: ["sort"]
							filter: { 
								visibility: { _eq: "visible" } 
							}
						) {
							id
							slug
							name
							grid_image {
								filename_disk
								title
								description
							}
							studios {
								studio_locations_id {
									location
								}
							}
							years_experience
						}
						careers_aggregated(
							filter: {
								visibility: { _eq: "visible" } 
							})
						{
							count {
								id
							}
						}
					}
				`;
		case "studios":
			return `query Studios($limit: Int, $offset: Int) {
						studio_locations(
							limit: $limit
							offset: $offset
							sort: ["sort_priority"]
							filter: { 
								visibility: { _eq: "visible" } 
							}
						) {
							id
							slug
							location
							grid_image {
								filename_disk
								title
								description
							}
							studio_contact_person {
								slug
								name
							}
							studio_contact_block
						}
						studio_locations_aggregated(
							filter: {
								visibility: { _eq: "visible" } 
							})
						{
							count {
								id
							}
						}
					}
				`;
		case "services":
			return `query Services {
						services(filter: { visibility: { _nin: ["draft", "archived", "visibleExceptFilters"] } }) {
							id
							filter_button_name
						}
					}`
		case "markets":
			return `query Markets {
						markets(filter: { visibility: { _nin: ["draft", "archived", "visibleExceptFilters"] } }) {
							id
							filter_button_name
						}
					}`
		case "topics":
			return `query Topics {
						news_topics(filter: { visibility: { _nin: ["draft", "archived", "visibleExceptFilters"] } }) {
							id
							name
						}
					}`
		default:
			return "";
	}
};