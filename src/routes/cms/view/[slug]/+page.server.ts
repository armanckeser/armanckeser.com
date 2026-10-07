import { renderNote } from "$lib/server/studio/service"
import type { PageServerLoad } from "./$types"

export const prerender = false

// A note rendered for the studio's preview pane, the way a post is by the site.
export const load: PageServerLoad = async ({ params }) =>
	renderNote(params.slug)
