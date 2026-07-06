import { cmsClient } from "$lib/cms";
import type { PageServerLoad } from "./$types";
import { gql } from "graphql-request";

export const _query = gql`
	query Dynamic {
		projects(limit: -1, filter: { visibility: { _neq: "archived" } }) {
			slug
		}
		news_posts(limit: -1, filter: { visibility: { _neq: "archived" } }) {
			slug
		}
		markets(limit: -1, filter: { visibility: { _neq: "archived" } }) {
			slug
		}
		services(limit: -1, filter: { visibility: { _neq: "archived" } }) {
			slug
		}
		team(limit: -1, filter: { visibility: { _neq: "archived" }, has_profile_page: { _eq: true } }) {
			slug
		}
		aeo_articles(limit: -1, filter: { visibility: { _neq: "feed" } }) {
			slug
		}
	}
`;

export const load: PageServerLoad = async ({ params }) => {
	const res = await cmsClient.Dynamic();
	return {
		projects: res.projects,
		newsPosts: res.news_posts,
		markets: res.markets,
		services: res.services,
		team: res.team,
		aeo_articles: res.aeo_articles
	};
};
