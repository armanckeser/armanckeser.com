import { readingMinutes } from "$lib/excerpt"
import { listPosts } from "$lib/server/posts"
import type { PageServerLoad } from "./$types"

// Reading times for this post and the ones listed after it, counted from the
// source at build time.
export const load: PageServerLoad = async () => {
	const posts = await listPosts()
	return {
		minutes: Object.fromEntries(
			posts.map(p => [p.slug, readingMinutes(p.content)])
		),
	}
}
