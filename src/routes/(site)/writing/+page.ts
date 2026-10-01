import { getPosts } from "$lib/posts"
import type { PageLoad } from "./$types"

export const load: PageLoad = async ({ data }) => {
	return {
		posts: getPosts(),
		minutes: data.minutes,
	}
}
