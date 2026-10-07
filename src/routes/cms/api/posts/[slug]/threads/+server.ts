import { actorOf, createThread, listThreads } from "$lib/server/studio/service"
import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"

export const prerender = false

export const GET: RequestHandler = async ({ params, url }) =>
	json(
		await listThreads(
			params.slug,
			url.searchParams.has("all") ? "all" : "open"
		)
	)

export const POST: RequestHandler = async ({ params, request, url }) =>
	json(
		await createThread(
			params.slug,
			await request.json(),
			actorOf(request, url)
		),
		{
			status: 201,
		}
	)
