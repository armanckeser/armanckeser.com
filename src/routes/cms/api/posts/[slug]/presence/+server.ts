import { setPresence } from "$lib/server/studio/service"
import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"

export const prerender = false

export const POST: RequestHandler = async ({ params, request }) => {
	const { status, ttl } = await request.json().catch(() => ({}))
	await setPresence(
		params.slug,
		typeof status === "string" ? status.slice(0, 80) : null,
		Number(ttl) || undefined
	)
	return json({ ok: true })
}
