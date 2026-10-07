import { actorOf, changeThread } from "$lib/server/studio/service"
import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"

export const prerender = false

export const PATCH: RequestHandler = async ({ params, request, url }) =>
	json(
		await changeThread(
			params.slug,
			params.id,
			await request.json(),
			actorOf(request, url)
		)
	)

export const DELETE: RequestHandler = async ({ params, request, url }) => {
	await changeThread(
		params.slug,
		params.id,
		{ delete: true },
		actorOf(request, url)
	)
	return new Response(null, { status: 204 })
}
