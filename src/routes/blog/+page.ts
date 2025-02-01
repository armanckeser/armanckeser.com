import { getPosts } from "$lib/utils/posts"
import type { PageLoad } from "./$types"

export const load: PageLoad = async () => {
	return {
		posts: await getPosts(),
	}
}
