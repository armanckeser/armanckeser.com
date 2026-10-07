import { getPost } from "$lib/server/studio/service"
import type { PageServerLoad } from "./$types"

export const prerender = false

export const load: PageServerLoad = async ({ params }) => {
	const post = await getPost(params.slug)
	return {
		slug: post.slug,
		title: post.title,
		status: post.status,
		url: post.url,
	}
}
