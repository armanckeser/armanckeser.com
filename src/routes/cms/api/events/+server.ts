import { eventStream } from "$lib/server/studio/sse"
import { agentWatching, listen } from "$lib/server/studio/store"
import type { RequestHandler } from "./$types"

export const prerender = false

/**
 * Everything that happens in the studio, as it happens. An agent holding this
 * open with ?as=claude is shown to the writer as listening.
 */
export const GET: RequestHandler = ({ request, url }) => {
	const agent = url.searchParams.get("as") === "claude"
	return eventStream(request, send => {
		if (agent) agentWatching(+1)
		send("hello", { agentWatching: agentWatching() })
		const stop = listen(event => send(event.type, event))
		return () => {
			stop()
			// The proxy closes the stream every 30 seconds and the agent comes
			// straight back; only an absence longer than that counts as leaving.
			if (agent) setTimeout(() => agentWatching(-1), 8000)
		}
	})
}
