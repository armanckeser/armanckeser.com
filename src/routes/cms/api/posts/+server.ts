import { actorOf, createPost, listPosts } from "$lib/server/studio/service"
import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"

export const prerender = false

export const GET: RequestHandler = async () => json(await listPosts())

export const POST: RequestHandler = async ({ request, url }) => {
	const input = await request.json().catch(() => ({}))
	return json(await createPost(input, actorOf(request, url)), { status: 201 })
}
