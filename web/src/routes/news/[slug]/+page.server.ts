import { gql } from "graphql-request";
import type { PageServerLoad } from "./$types";
import { cmsClient } from "$lib/cms";
import { error } from "@sveltejs/kit";

export const _query = gql`
	query NewsPost($slug: String!) {
		news_posts(filter: { slug: { _eq: $slug }, visibility: { _neq: "archived" } }) {
			slug
			visibility
			post_title
			seo_page_description
			published_date
			topics {
				news_topics_id {
					name
				}
			}
			hero_image {
				title
				filename_disk
				description
			}
			hero_image_crop_attachment
			page_content {
				item {
					__typename
					... on page_block_accordion {
						span_columns
						col_units
						col_start
						padding_left
						padding_right
						span_rows
						padding_top
						anchor_id
						first_item_open
						one_at_a_time
						items
					}
					... on page_block_accordion_with_slider {
						padding_top
						anchor_id
						layout
						accordion_position
						slider_items {
							heading
							rich_text
							cta_text
							cta_link
							image {
								filename_disk
								title
								description
							}
						}
					}
					... on page_block_before_after_swiper {
						span_columns
						col_units
						col_start
						padding_left
						padding_right
						span_rows
						padding_top
						anchor_id
						images {
							directus_files_id {
								filename_disk
								title
								description
							}
						}
						swiper_start_position
					}
					... on page_block_blockquote {
						span_columns
						col_units
						col_start
						padding_left
						padding_right
						span_rows
						padding_top
						anchor_id
						attribution
						body
						citation
						font_size
					}
					... on page_block_cards {
						span_columns
						col_units
						col_start
						padding_left
						padding_right
						span_rows
						padding_top
						anchor_id
						cards_per_row
						row_divider_color
						card_padding_horizontal
						card_padding_vertical
						callout_size
						text_size
						text_padding
						text_alignment
						image_mask
						image_padding
						image_hover_effect
						cta_alignment
						card_items {
							image {
								filename_disk
								title
								description
							}
							callout
							callout_size_override
							rich_text
							cta_text
							cta_link
							cta_alignment_override
						}
					}
					... on page_block_carousel {
						id
						span_columns
						col_units
						col_start
						padding_left
						padding_right
						span_rows
						padding_top
						anchor_id
						images_per_slide
						animation
						animation_duration_ms
						autoplay
						autoplay_interval
						show_indexes
						show_arrows
						images {
							directus_files_id {
								filename_disk
								title
								description
							}
						}
					}
					... on page_block_cta {
						span_columns
						col_units
						col_start
						padding_left
						padding_right
						span_rows
						padding_top
						anchor_id
						heading_size
						heading
						text_size
						text_alignment
						link
						text
					}
					... on page_block_cta_list {
						span_columns
						col_units
						col_start
						padding_left
						padding_right
						span_rows
						padding_top
						anchor_id
						items
					}
					... on page_block_cta_list_with_slider {
						padding_top
						anchor_id
						layout
						list_position
						list_items {
							linkUrl
							linkText
							image {
								filename_disk
								title
								description
							}
						}
					}
					... on page_block_featured_page {
						span_columns
						col_units
						col_start
						span_rows
						padding_top
						anchor_id
						media_position
						background_image {
							filename_disk
							title
							description
						}
						background_image_mobile {
							filename_disk
							title
							description
						}
						youtube_id
						vimeo_id
						small_subheading
						large_primary_heading
						rich_text
						cta_text
						cta_link
						heading_only
						white_text
					}
					... on page_block_heading {
						span_columns
						col_units
						col_start
						padding_left
						padding_right
						span_rows
						row_alignment
						padding_top
						anchor_id
						type
						primary_heading
						small_heading
						large_heading
						superscript_text
					}
					... on page_block_image_row {
						span_columns
						col_units
						col_start
						padding_left
						padding_right
						span_rows
						padding_top
						anchor_id
						layout
						caption
						images {
							directus_files_id {
								title
								description
								filename_disk
							}
						}
						emptyColumn
						fullBleedColumns
					}
					... on page_block_list {
						span_columns
						col_units
						col_start
						padding_left
						padding_right
						span_rows
						padding_top
						anchor_id
						link_hover_effect
						heading_size
						text_size
						text_alignment
						section_heading
						items
						list_columns
						view_more_text
						view_more_link
					}
					... on page_block_projects_grid {
						padding_top
						anchor_id
						num_projects
						load_functionality
						grid_type
						show_filters
					}
					... on page_block_rich_text {
						span_columns
						col_units
						col_start
						padding_left
						padding_right
						span_rows
						padding_top
						anchor_id
						text_size
						content
					}
					... on page_block_spacer {
						id
					}
					... on page_block_video {
						span_columns
						col_units
						col_start
						padding_left
						padding_right
						span_rows
						padding_top
						anchor_id
						vimeo_id
						youtube_id
						native_video {
							id
							title
							type
							filename_disk
						}
						enable_autoplay
						enable_looping
						enable_controls
					}
					... on page_block_testimonial_carousel {
						heading
						testimonials {
							item {
								...on testimonials {
									quote_attribution
									quote_attribution_job_title
									company_name
									quote
									banner_image {
										title
										description
										filename_disk
									}
									associated_project {
										slug
										project_title
										location
									}
								}
							}
						}
					}
				}
			}
		}
	}
`;

export const load: PageServerLoad = async ({ params }) => {
	const res = await cmsClient.NewsPost({ slug: params.slug });

	if (res.news_posts.length === 0) {
		throw error(404);
	}

	return { news_post: res.news_posts[0] };
};
