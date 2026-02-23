import { listPosts } from "$lib/server/posts"
import { gitStatus } from "$lib/server/git"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async () => {
	const [posts, status] = await Promise.all([listPosts(), gitStatus()])

	return { posts, gitStatus: status }
}
