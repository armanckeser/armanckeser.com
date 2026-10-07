import { actorOf, promoteNote } from "$lib/server/studio/service"
import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"

export const prerender = false

/** A post idea in the notes' drafts/ becomes a draft post of the site. */
export const POST: RequestHandler = async ({ params, request, url }) =>
	json(await promoteNote(params.slug, actorOf(request, url)))
