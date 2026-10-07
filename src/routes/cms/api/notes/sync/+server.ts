import { notesStatus, syncNotes } from "$lib/server/studio/service"
import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"

export const prerender = false

/** Where the notes repo stands: last sync, unsynced edits, the last error. */
export const GET: RequestHandler = () => json(notesStatus())

/** Commit, pull and push the notes now instead of waiting for a quiet moment. */
export const POST: RequestHandler = async ({ request }) => {
	const { message } = await request.json().catch(() => ({}))
	return json(
		await syncNotes(typeof message === "string" ? message : undefined)
	)
}
