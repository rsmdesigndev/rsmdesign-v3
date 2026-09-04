import { gql } from "graphql-request";
import type { PageServerLoad } from "./$types";
import { cmsClient } from "$lib/cms";
import { prefetchDataFeeds } from "$lib/cms/dataFeed/dataFeedPrefetch";
import { error } from "@sveltejs/kit";
import type { Projects_Filter } from "$lib/__generated__/graphql";

export const _query = gql`
	query RsmSlug($slug: String!) {
		misc(filter: { slug: { _eq: $slug }, visibility: { _neq: "archived" } }) {
			slug
			name
			overview
			grid_image {
				title
				description
				filename_disk
			}
			seo_page_description
			sub_services
			team_leaders {
				team_id {
					slug
					name
					short_title
				}
			}
			projects {
				projects_id {
					slug
					project_title
					project_title_short
					location
					grid_image {
						filename_disk
						title
						description
					}
				}
			}
		}
	}
`;

export const load: PageServerLoad = async ({ params }) => {
	const res = await cmsClient.RsmSlug({ slug: params.slug });

	if (res.misc.length === 0) {
		throw error(404);
	}

	return {
		page: res.misc[0]
	};
};
