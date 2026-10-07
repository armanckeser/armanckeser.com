import { problem } from "$lib/server/studio/problem"
import { eventStream } from "$lib/server/studio/sse"
import {
	agentWatching,
	b64,
	getRoom,
	subscribe,
} from "$lib/server/studio/store"
import { encodeAwarenessUpdate } from "y-protocols/awareness"
import * as Y from "yjs"
import type { RequestHandler } from "./$types"

export const prerender = false

/**
 * One editor's live connection. It opens with the whole document and its state
 * vector (so after a reconnect the editor can send back whatever the server
 * lacks), then carries every change anyone else makes.
 */
export const GET: RequestHandler = async ({ params, request, url }) => {
	const client = url.searchParams.get("client")
	if (!client) problem(400, "client is required")
	const room = await getRoom(params.slug).catch(() => {
		problem(404, `No post called "${params.slug}"`)
	})
	return eventStream(request, send => {
		const sub = { id: client, send, clients: new Set<number>() }
		const states = [...room.awareness.getStates().keys()]
		send("init", {
			update: b64.encode(Y.encodeStateAsUpdate(room.doc)),
			vector: b64.encode(Y.encodeStateVector(room.doc)),
			awareness: states.length
				? b64.encode(encodeAwarenessUpdate(room.awareness, states))
				: null,
			agentWatching: agentWatching(),
		})
		return subscribe(room, sub)
	})
}
