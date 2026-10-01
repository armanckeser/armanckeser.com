import { readingMinutes } from "$lib/excerpt"
import { listPosts } from "$lib/server/posts"
import type { PageServerLoad } from "./$types"

// Counted from the source at build time, so no post text ships for a number.
export const load: PageServerLoad = async () => {
	const posts = await listPosts()
	return {
		minutes: Object.fromEntries(
			posts.map(p => [p.slug, readingMinutes(p.content)])
		),
	}
}
