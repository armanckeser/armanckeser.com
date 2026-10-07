import { actorOf, publish, unpublish } from "$lib/server/studio/service"
import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"

export const prerender = false

export const POST: RequestHandler = async ({ params, request, url }) => {
	const { message } = await request.json().catch(() => ({}))
	return json(await publish(params.slug, actorOf(request, url), message))
}

export const DELETE: RequestHandler = async ({ params, request, url }) =>
	json(await unpublish(params.slug, actorOf(request, url)))
