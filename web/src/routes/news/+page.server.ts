import { gql } from "graphql-request";
import type { PageServerLoad } from "./$types";
import { cmsClient } from "$lib/cms";
import { RsmSlugDocument } from "$lib/__generated__/graphql";

export const _query = gql`
	query News($filter: news_posts_filter, $limit: Int) {
		news_page {
			seo_title
			seo_page_description
			news_page_blocks_v3 {
				item {
					__typename
					... on page_blocks_v3_organism_card_row {
						change_background_color
						section_background_color
						section_color_theme
						change_breadcrumbs
						section_anchor_text
						section_anchor_link
						section_padding_top
						section_padding_bottom
						columns_alignment
						columns {
							grid_col_start_units
							grid_col_start
							grid_col_end_units
							grid_col_end
							column_hidden_on_mobile
							column_interaction_on_scroll
							column_interaction_exclude_first_item
							column_interaction_active_highlight
							column_item_spacing
							column_padding_left
							column_padding_right
							column_sticky
							column_items {
								item {
									__typename
									... on page_blocks_v3_molecule_accordion {
										accordion_first_item_open
										accordion_heading_size
										accordion_items
									}
									... on page_blocks_v3_molecule_card {
										card_item_spacing
										card_link
										card_atoms {
											item {
												__typename
												... on page_blocks_v3_atom_blockquote {
													blockquote_size
													blockquote_text
													blockquote_has_attribution
													blockquote_attribution
													blockquote_has_citation
													blockquote_citation
													blockquote_link
												}
												... on page_blocks_v3_atom_cta {
													cta_type
													cta_icon
													cta_icon_position
													cta_style
													cta_hover_highlight
													cta_text_bold
													cta_text_light
													cta_link
												}
												... on page_blocks_v3_atom_heading {
													heading_type
													heading_primary
													heading_size
													heading_weight
													heading_has_small_text
													heading_small
													heading_has_large_text
													heading_large
													heading_has_superscript
													heading_superscript
												}
												... on page_blocks_v3_atom_media {
													media_type
													media_image {
														filename_disk
														title
														description
													}
													media_video_fallback_image {
														filename_disk
														title
														description
													}
													media_video_native {
														id
														title
														type
														filename_disk
													}
													media_video_source
													media_video_vimeo
													media_video_youtube
													media_slider {
														directus_files_id {
															filename_disk
															title
															description
														}
													}
													media_slider_autoplay
													media_slider_autoplay_interval
													media_slider_images_per_slide
													media_swiper {
														directus_files_id {
															filename_disk
															title
															description
														}
													}
													media_swiper_start_position
													media_caption
												}
												... on page_blocks_v3_atom_rich_text {
													rich_text_size
													rich_text_content
													rich_text_has_read_more
													rich_text_content_read_more
												}
												... on page_blocks_v3_atom_spacer {
													spacer_height
												}
											}
										}
									}
									... on page_blocks_v3_organism_card_carousel {
										carousel_autoplay
										carousel_autoplay_interval
										carousel_show_arrows
										carousel_cards {
											card_item_spacing
											card_link
											card_atoms {
												item {
													__typename
													... on page_blocks_v3_atom_blockquote {
														blockquote_size
														blockquote_text
														blockquote_has_attribution
														blockquote_attribution
														blockquote_has_citation
														blockquote_citation
														blockquote_link
													}
													... on page_blocks_v3_atom_cta {
														cta_type
														cta_icon
														cta_icon_position
														cta_style
														cta_hover_highlight
														cta_text_bold
														cta_text_light
														cta_link
													}
													... on page_blocks_v3_atom_heading {
														heading_type
														heading_primary
														heading_size
														heading_weight
														heading_has_small_text
														heading_small
														heading_has_large_text
														heading_large
														heading_has_superscript
														heading_superscript
													}
													... on page_blocks_v3_atom_media {
														media_type
														media_image {
															filename_disk
															title
															description
														}
														media_video_source
														media_video_vimeo
														media_video_youtube
														media_slider_autoplay
														media_slider_autoplay_interval
														media_slider_images_per_slide
														media_swiper_start_position
														media_caption
													}
													... on page_blocks_v3_atom_rich_text {
														rich_text_size
														rich_text_content
														rich_text_has_read_more
														rich_text_content_read_more
													}
													... on page_blocks_v3_atom_spacer {
														spacer_height
													}
												}
											}
										}
									}
									... on page_blocks_v3_molecule_cta_list {
										cta_list_size
										cta_list_hover_highlight
										cta_list_icon
										cta_list_source
										cta_list_has_heading
										cta_list_heading
										cta_list_heading_style
										cta_list_items {
											cta_style
											cta_hover_highlight
											cta_text_bold
											cta_text_light
											cta_link
										}
									}
									... on page_blocks_v3_atom_spacer {
										spacer_height
									}
								}
							}
						}
					}
					... on page_blocks_v3_organism_data_feed {
						change_background_color
						section_background_color
						section_color_theme
						change_breadcrumbs
						section_anchor_text
						section_anchor_link
						section_padding_top
						section_padding_bottom
						feed_source
						feed_show_filter_menu
						feed_filter_logic
						feed_filter_markets {
							markets_id {
								name
							}
						}
						feed_filter_services {
							services_id {
								name
							}
						}
						feed_filter_location_cities {
							locations_cities_id {
								city_name
							}
						}
						feed_filter_topics {
							news_topics_id {
								name
							}
						}
						feed_view
						feed_load_functionality
						feed_grid_columns
						feed_grid_rows_per_load
						feed_grid_style
						feed_grid_dynamic_start_position
						feed_table_style
						feed_table_image_position
						feed_table_items_per_load
						feed_cards {
							card_item_spacing
							card_atoms {
								item {
									__typename
									... on page_blocks_v3_atom_blockquote {
										blockquote_size
										blockquote_text
										blockquote_has_attribution
										blockquote_attribution
										blockquote_has_citation
										blockquote_citation
										blockquote_link
									}
									... on page_blocks_v3_atom_cta {
										cta_type
										cta_icon
										cta_icon_position
										cta_style
										cta_hover_highlight
										cta_text_bold
										cta_text_light
										cta_link
									}
									... on page_blocks_v3_atom_heading {
										heading_type
										heading_primary
										heading_size
										heading_weight
										heading_has_small_text
										heading_small
										heading_has_large_text
										heading_large
										heading_has_superscript
										heading_superscript
									}
									... on page_blocks_v3_atom_media {
										media_type
										media_image {
											filename_disk
											title
											description
										}
										media_video_source
										media_video_vimeo
										media_video_youtube
										media_slider {
											directus_files_id {
												filename_disk
												title
												description
											}
										}
										media_slider_images_per_slide
										media_swiper {
											directus_files_id {
												filename_disk
												title
												description
											}
										}
										media_caption
									}
									... on page_blocks_v3_atom_rich_text {
										rich_text_size
										rich_text_content
										rich_text_has_read_more
										rich_text_content_read_more
									}
									... on page_blocks_v3_atom_spacer {
										spacer_height
									}
								}
							}
						}
					}
					... on page_blocks_v3_organism_hero {
						hero_style
						hero_media_type
						hero_image {
							filename_disk
							title
							description
						}
						hero_video_source
						hero_video_native {
							id
							title
							type
							filename_disk
						}
						hero_video_native_mobile {
							id
							title
							type
							filename_disk
						}
						hero_video_vimeo
						hero_video_youtube
						hero_headline
					}
				}
			}
			news_use_page_blocks_v3
			use_page_blocks
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
						heading
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
						text_alignment
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
					... on page_block_article_grid {
						heading
						number_of_articles
						article_filters {
							slug
							name
						}
						article_half_grid
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
		news_topics(limit: -1, filter: { visibility: { _eq: "visible" } }) {
			slug
			name
		}
		news_posts(filter: $filter, sort: ["-published_date"], limit: $limit) {
			slug
			post_title
			grid_image {
				filename_disk
				title
				description
			}
			published_date
			article_preview
			topics {
				news_topics_id {
					name
				}
			}
			page_content(
				limit: 1
				filter: { item__page_block_rich_text: { content: { _nempty: true } } }
			) {
				item {
					__typename
					... on page_block_rich_text {
						id
						content
					}
				}
			}
		}
		slider_articles: news_posts(filter: { featured: { _eq: true }, visibility: { _eq: "visible" } }) {
			slug
			post_title
			hero_image {
				filename_disk
				title
				description
			}
		}
	}
`;

export const load: PageServerLoad = async ({ params }) => {
	const res = await cmsClient.News();

	console.log(res.news_page?.page_content);
	
	return {
		news_page: res.news_page,
		news_topics: res.news_topics,
		news_posts: res.news_posts,
		slider_articles: res.slider_articles
	}

	// return cmsClient.News({
	// 	filter: {
	// 		visibility: { _eq: "visible" }
	// 	}
	// });
};
