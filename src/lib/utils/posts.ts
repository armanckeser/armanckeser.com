import type { BlogPost } from "../../types"

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
			slug: `/${section}/${slug}`, // Auto-detect section from path
		}
	})

	return posts.sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
	)
}

export function getContentTree() {
	const posts = getPosts()
	const tree: Record<string, string[]> = {}

	for (const post of posts) {
		// Assuming post.slug is in the form "/section/slug"
		const parts = post.slug.split("/").filter(Boolean) // removes empty strings from leading '/'
		const section = parts[0]
		const postSlug = parts[1]
		if (!tree[section]) tree[section] = []
		tree[section].push(postSlug)
	}

	return tree
}
