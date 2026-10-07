import { problem } from "$lib/server/studio/problem"
import {
	actorOf,
	deleteDraft,
	getPost,
	replaceBody,
	updateMeta,
} from "$lib/server/studio/service"
import { getRoom, serialize } from "$lib/server/studio/store"
import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"

export const prerender = false

export const GET: RequestHandler = async ({ params, url }) => {
	if (url.searchParams.get("format") === "svx") {
		const room = await getRoom(params.slug).catch(() => {
			problem(404, `No post called "${params.slug}"`)
		})
		return new Response(serialize(room.doc), {
			headers: { "content-type": "text/plain; charset=utf-8" },
		})
	}
	return json(await getPost(params.slug))
}

export const PATCH: RequestHandler = async ({ params, request, url }) =>
	json(
		await updateMeta(
			params.slug,
			await request.json(),
			actorOf(request, url)
		)
	)

export const PUT: RequestHandler = async ({ params, request, url }) => {
	const { body } = await request.json()
	return json(await replaceBody(params.slug, body, actorOf(request, url)))
}

export const DELETE: RequestHandler = async ({ params }) => {
	await deleteDraft(params.slug)
	return new Response(null, { status: 204 })
}
