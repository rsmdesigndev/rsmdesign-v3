import { env } from "$env/dynamic/public";
import { request } from "graphql-request";
import type { LayoutLoad } from './$types';

export const prerender = env.PUBLIC_USE_SSR_ADAPTER === "true" ? false : "auto";

export const load: LayoutLoad = async () => {
    let query = `
        query Navigation {
          nav_menu {
            nav_menu_links {
              nav_menu_links_id {
                link_level
                link_path
                link_text
                link_shows_in_footer
                link_shows_in_menu
                link_media_image {
                  title
                  filename_disk
                  description
                }
                link_children {
                  nav_menu_links_child_id {
                    link_level
                    link_path
                    link_text
                    link_shows_in_footer
                    link_shows_in_menu
                    link_media_image {
                      title
                      filename_disk
                      description
                    }
                  }
                }
              }
            }
          }
        }
    `

    let res = await request(env.PUBLIC_DIRECTUS_API_URL, query);
    return res;
}
