import { gql } from "graphql-request";
import type { PageServerLoad } from "./$types";
import { cmsClient } from "$lib/cms";
import { error } from "@sveltejs/kit";

export const _query = gql`
	query WorkSlug($slug: String!) {
		projects(filter: { slug: { _eq: $slug }, visibility: { _neq: "archived" } }
		) {
			slug
			client
			collaborators
			collaborator_new
			date_created
			date_updated
			design_awards
			hero_image_crop_attachment
			hero_video_id
			home_page_slider
			hero_image {
				title
				filename_disk
				description
			}
			grid_image {
				filename_disk
				title
				description
			}
			geographical_regions {
				geographical_regions_id {
					slug
				}
			}
			location
			markets {
				markets_id {
					slug
					name
					short_name
				}
			}
			non_linked_markets
			non_linked_services
			project_architect {
				collaborators_id {
					collaborator_name
					collaborator_website
				}
			}
			project_architect_count
			project_client {
				collaborators_id {
					collaborator_name
					collaborator_website
				}
			}
			project_client_count
			project_developer {
				collaborators_id {
					collaborator_name
					collaborator_website
				}
			}
			project_developer_count
			project_fabricator {
				collaborators_id {
					collaborator_name
					collaborator_website
				}
			}
			project_fabricator_count
			project_landscape {
				collaborators_id {
					collaborator_name
					collaborator_website
				}
			}
			project_landscape_count
			project_lighting {
				collaborators_id {
					collaborator_name
					collaborator_website
				}
			}
			project_lighting_count
			project_other_collaborators {
				collaborators_id {
					collaborator_name
					collaborator_website
				}
			}
			project_other_collaborators_count
			project_painter {
				collaborators_id {
					collaborator_name
					collaborator_website
				}
			}
			project_painter_count
			project_photographer {
				collaborators_id {
					collaborator_name
					collaborator_website
				}
			}
			project_photographer_count
			project_sign_painter {
				collaborators_id {
					collaborator_name
					collaborator_website
				}
			}
			project_sign_painter_count
			project_page_blocks_v3 {
				item {
					__typename
					... on page_blocks_v3_organism_card_row {
						change_background_color
						section_background_color
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
							column_item_spacing
							column_padding_left
							column_padding_right
							column_sticky
							column_items_data_bound
							column_items {
								item {
									__typename
									... on page_blocks_v3_molecule_accordion {
										accordion_first_item_open
										accordion_data_bound
										accordion_items
									}
									... on page_blocks_v3_molecule_card {
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
						change_breadcrumbs
						section_anchor_text
						section_anchor_link
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
					}
					... on page_blocks_v3_organism_hero {
						hero_media_type
						hero_image {
							filename_disk
							title
							description
						}
						hero_video_source
						hero_video_vimeo
						hero_video_youtube
						hero_headline
					}
				}
			}
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
			project_description
			project_location_city {
				city_name
				state_province {
					state_province_name
				}
				country {
					country_name
				}
			}
			project_opening_date
			project_title
			project_title_short
			project_use_page_blocks_v3
			seo_page_description
			services {
				services_id {
					slug
					name
					short_name
				}
			}
			slider_images {
				directus_files_id {
					filename_disk
					title
					description
				}
			}
			studio_locations {
				studio_locations_id {
					slug
					location
				}
			}
			visibility
		}
	}
`;

export const load: PageServerLoad = async ({ params }) => {
	const res = await cmsClient.WorkSlug({ slug: params.slug });

	if (res.projects.length === 0) {
		throw error(404);
	}

	return { project: res.projects[0] };
};
