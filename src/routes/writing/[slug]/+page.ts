import { getPosts } from "$lib/posts"
import { error } from "@sveltejs/kit"
import type { PageLoad } from "./$types"

export const load: PageLoad = async ({ params }) => {
	try {
		const [post, posts] = await Promise.all([
			import(`../../../content/writing/${params.slug}.svx`),
			getPosts(),
		])

		return {
			content: post.default,
			posts,
			...post.metadata,
		}
	} catch (_e) {
		throw error(404, `Writing post "${params.slug}" not found`)
	}
}
