import type { BlogPost } from "../../types"

export async function getPosts(): Promise<BlogPost[]> {
	const posts = await Promise.all(
		Object.entries(
			import.meta.glob<{ metadata: Omit<BlogPost, "slug"> }>(
				"/src/routes/blog/*.svx",
				{ eager: true }
			)
		).map(([path, post]) => {
			const slug = path.split("/").pop()?.replace(".svx", "") || ""
			return {
				...post.metadata,
				slug: `/blog/${slug}`,
			} as BlogPost
		})
	)

	return posts.sort(
		(a: BlogPost, b: BlogPost) =>
			new Date(b.date).getTime() - new Date(a.date).getTime()
	)
}
