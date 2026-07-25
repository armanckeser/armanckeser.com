import { dev } from "$app/environment"
import { base } from "$app/paths"
import type { BlogPost } from "../types"

/**
 * A post is visible unless it opts out with `published: false`.
 *
 * Drafts stay visible under `vite dev` so they can be previewed, and are kept
 * out of every production surface (listings, RSS, sitemap, prerendered routes).
 * Unfinished pages are a site-wide quality signal, not just a dead URL.
 */
export function isVisible(post: Pick<BlogPost, "published">): boolean {
	return dev || post.published !== false
}

export function getPosts(): BlogPost[] {
	const posts = Object.entries(
		import.meta.glob<{ metadata: BlogPost }>("/src/content/**/*.svx", {
			eager: true,
		})
	).map(([path, post]) => {
		// Extract file name from path and determine section
		const slugPart = path
			.replace("/src/content/", "")
			.replace(".svx", "")
			.split("/")
		const section = slugPart[0]
		const slug = slugPart[slugPart.length - 1]

		return {
			...post.metadata,
			slug: `${base}/${section}/${slug}`, // Auto-detect section from path
		}
	})

	return posts
		.filter(isVisible)
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
