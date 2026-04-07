import { gql } from "graphql-request";
import type { PageServerLoad } from "./$types";
import { cmsClient } from "$lib/cms";
import { error } from "@sveltejs/kit";

export const _query = gql`
	query ExpertisePage {
		expertise_page {
			expertise_page_blocks_v3 {
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
						feed_grid_dynamic_images {
							directus_files_id {
								filename_disk
								title
								description
							}
						}
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
			expertise_use_page_blocks_v3
		}
		services(
			filter: { visibility: { _eq: "visible" } },
			sort: ["sort_priority"],
			limit: 9
		) {
			slug
			medium_name
			sub_services_truncated
		}

		markets(
			filter: { visibility: { _eq: "visible" } },
			sort: ["sort_priority"],
			limit: 18
		) {
			slug
			medium_name
			grid_image {
				title
				description
				filename_disk
			}
		}
	}
`;

export const load: PageServerLoad = async ({ params }) => {
	const res = await cmsClient.ExpertisePage();
	
	return {
		expertise_page: res.expertise_page,
		services: res.services,
		markets: res.markets
	}
};
