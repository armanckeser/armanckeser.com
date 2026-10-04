import { renderCard } from "$lib/server/og/card"
import { listPosts } from "$lib/server/posts"
import { error } from "@sveltejs/kit"
import type { EntryGenerator, RequestHandler } from "./$types"

// One PNG per published post, written into the static build. Seo.svelte points
// og:image here unless the post's frontmatter names its own `image`.
export const prerender = true

export const entries: EntryGenerator = async () =>
	(await listPosts())
		.filter(post => post.published !== false)
		.map(post => ({ slug: post.slug }))

export const GET: RequestHandler = async ({ params }) => {
	const post = (await listPosts()).find(p => p.slug === params.slug)
	if (!post)
		throw error(404, {
			code: "NOT_FOUND",
			message: `No post "${params.slug}"`,
			path: `/og/writing/${params.slug}.png`,
		})
	const png = await renderCard(post)
	return new Response(new Uint8Array(png), {
		headers: {
			"content-type": "image/png",
			"cache-control": "public, max-age=86400",
		},
	})
}
