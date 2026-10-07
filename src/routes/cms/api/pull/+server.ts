import { problem } from "$lib/server/studio/problem"
import { head, pull } from "$lib/server/studio/git"
import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"

export const prerender = false

export const POST: RequestHandler = async () => {
	const output = await pull().catch(e => {
		problem(502, String(e.stderr || e.message).slice(0, 400))
	})
	return json({ output, head: await head() })
}
