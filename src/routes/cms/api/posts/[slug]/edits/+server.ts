import { actorOf, editBody } from "$lib/server/studio/service"
import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"

export const prerender = false

export const POST: RequestHandler = async ({ params, request, url }) => {
	const { edits } = await request.json()
	return json(await editBody(params.slug, edits, actorOf(request, url)))
}
