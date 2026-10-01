import { excerptOf, readingMinutes } from "$lib/excerpt"
import { listPosts } from "$lib/server/posts"
import type { PageServerLoad } from "./$types"

// Read from the source on the server (at build time for the static site), so the
// post text reaches the page as data rather than inside the JavaScript bundle.
export const load: PageServerLoad = async () => {
	const posts = await listPosts()
	return {
		openings: Object.fromEntries(
			posts.map(p => [
				p.slug,
				{
					excerpt: excerptOf(p.content),
					minutes: readingMinutes(p.content),
				},
			])
		),
	}
}
