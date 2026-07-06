import { gql } from "graphql-request";
import type { PageServerLoad } from "./$types";
import { cmsClient } from "$lib/cms";
import { error } from "@sveltejs/kit";

export const _query = gql`
	query AeoSlug($slug: String!) {
		aeo_articles(filter: { slug: { _eq: $slug } }) {
			slug
			aeo_article_visibility
			aeo_article_heading
			aeo_article_body
			aeo_article_image {
				title
				filename_disk
				description
			}
			aeo_article_services {
				services_id {
					slug
					name
					short_name
				}
			}
			aeo_article_markets {
				markets_id {
					slug
					name
					short_name
				}
			}
			aeo_article_regions {
				geographical_regions_id {
					slug
					name
				}
			}
		}
	}
`;

export const load: PageServerLoad = async ({ params }) => {
	const res = await cmsClient.AeoSlug({ slug: params.slug });

	if (res.aeo_articles.length === 0) {
		throw error(404);
	}

	return {
		article: res.aeo_articles[0]
	};
};
