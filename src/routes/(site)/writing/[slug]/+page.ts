import { base } from "$app/paths"
import { isVisible } from "$lib/posts"
import { error } from "@sveltejs/kit"
import type { BlogPost } from "../../../../types"
import type { PageLoad } from "./$types"

export const load: PageLoad = async ({ params }) => {
	let post: { default: unknown; metadata: Omit<BlogPost, "slug"> }
	try {
		post = await import(`../../../../content/writing/${params.slug}.svx`)
	} catch (_e) {
		throw error(404, {
			code: "NOT_FOUND",
			message: `Writing post "${params.slug}" not found`,
			path: `/writing/${params.slug}`,
		})
	}

	// Drafts are readable under `vite dev` and absent from production builds, so
	// an unfinished page can never be crawled or shared.
	if (!isVisible(post.metadata)) {
		throw error(404, {
			code: "NOT_FOUND",
			message: `Writing post "${params.slug}" not found`,
			path: `/writing/${params.slug}`,
		})
	}

	return {
		content: post.default,
		meta: {
			...post.metadata,
			slug: `${base}/writing/${params.slug}`,
		} satisfies BlogPost,
	}
}
