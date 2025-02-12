import { base } from "$app/paths"
import type { BlogPost } from "../types"

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

	return posts.sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
	)
}
