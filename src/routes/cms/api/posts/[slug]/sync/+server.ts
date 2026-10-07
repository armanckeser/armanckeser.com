import { problem } from "$lib/server/studio/problem"
import { applyClientAwareness, b64, getRoom } from "$lib/server/studio/store"
import { json } from "@sveltejs/kit"
import * as Y from "yjs"
import type { RequestHandler } from "./$types"

export const prerender = false

/** An editor's changes and cursor, applied here and passed on to everyone else. */
export const POST: RequestHandler = async ({ params, request }) => {
	const { client, update, awareness } = await request.json()
	if (typeof client !== "string") problem(400, "client is required")
	const room = await getRoom(params.slug).catch(() => {
		problem(404, `No post called "${params.slug}"`)
	})
	if (typeof update === "string")
		Y.applyUpdate(room.doc, b64.decode(update), client)
	if (typeof awareness === "string") {
		const sub = [...room.subs].find(s => s.id === client)
		applyClientAwareness(room, sub, b64.decode(awareness), client)
	}
	return json({ ok: true })
}
