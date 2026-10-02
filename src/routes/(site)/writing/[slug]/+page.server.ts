import { readingMinutes } from "$lib/excerpt"
import { discussionsOf } from "$lib/server/discussions"
import { listPosts } from "$lib/server/posts"
import type { PageServerLoad } from "./$types"

// Reading times for this post and the ones listed after it, counted from the
// source at build time, and the threads about it on HN and Lobsters as they
// stood when the site was built (daily).
export const load: PageServerLoad = async ({ params }) => {
	const [posts, discussions] = await Promise.all([
		listPosts(),
		discussionsOf(`/writing/${params.slug}`),
	])
	return {
		minutes: Object.fromEntries(
			posts.map(p => [p.slug, readingMinutes(p.content)])
		),
		discussions,
	}
}
