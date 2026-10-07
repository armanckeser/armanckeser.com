import { listNotes, listPosts, notesStatus } from "$lib/server/studio/service"
import { agentWatching } from "$lib/server/studio/store"
import type { PageServerLoad } from "./$types"

export const prerender = false

export const load: PageServerLoad = async () => {
	const [posts, notes] = await Promise.all([listPosts(), listNotes()])
	return {
		posts,
		notes,
		notesSync: notesStatus(),
		agentWatching: agentWatching(),
	}
}
