import { getPosts } from "$lib/posts"
import type { PageLoad } from "./$types"

export const load: PageLoad = async () => {
	const posts = await getPosts()

	// Sort posts by date, most recent first
	const sortedPosts = posts.sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
	)

	return {
		posts: sortedPosts,
	}
}
