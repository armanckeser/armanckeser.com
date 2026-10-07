import { listPosts } from "$lib/server/studio/service"
import { agentWatching } from "$lib/server/studio/store"
import type { PageServerLoad } from "./$types"

export const prerender = false

export const load: PageServerLoad = async () => ({
	posts: await listPosts(),
	agentWatching: agentWatching(),
})
