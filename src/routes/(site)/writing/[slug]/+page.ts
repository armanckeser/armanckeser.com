import { error } from "@sveltejs/kit"
import type { PageLoad } from "./$types"

export const load: PageLoad = async ({ params }) => {
	try {
		const post = await import(
			`../../../../content/writing/${params.slug}.svx`
		)

		return {
			content: post.default,
			meta: post.metadata,
		}
	} catch (_e) {
		throw error(404, `Writing post "${params.slug}" not found`)
	}
}
