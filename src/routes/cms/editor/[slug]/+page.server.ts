import { deleteAndPush, publishPost } from "$lib/server/git"
import { renderMarkdown } from "$lib/server/markdown"
import { deletePost, getPost, savePost, slugify } from "$lib/server/posts"
import { error, fail } from "@sveltejs/kit"
import type { Actions, PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ params }) => {
	try {
		const post = await getPost(params.slug)
		return {
			post: {
				...post,
				tags: post.tags?.join(", ") ?? "",
			},
		}
	} catch {
		throw error(404)
	}
}

export const actions: Actions = {
	save: async ({ request, params }) => {
		const formData = await request.formData()
		const title = formData.get("title") as string
		const description = formData.get("description") as string
		const tags = formData.get("tags") as string
		const date = formData.get("date") as string
		const content = formData.get("content") as string
		const slugFromForm = (formData.get("slug") as string)?.trim()

		if (!title?.trim()) {
			return fail(400, { error: "Title is required" })
		}

		const slug = slugFromForm || slugify(title)
		const tagList = tags
			? tags
					.split(",")
					.map(t => t.trim())
					.filter(Boolean)
			: undefined

		if (slug !== params.slug) {
			await deletePost(params.slug)
		}

		const filePath = await savePost(
			slug,
			{
				title,
				description: description || undefined,
				tags: tagList,
				date,
			},
			content || ""
		)

		return { slug, filePath, saved: true }
	},

	publish: async ({ request, params }) => {
		const formData = await request.formData()
		const title = formData.get("title") as string
		const description = formData.get("description") as string
		const tags = formData.get("tags") as string
		const date = formData.get("date") as string
		const content = formData.get("content") as string
		const slugFromForm = (formData.get("slug") as string)?.trim()

		if (!title?.trim()) {
			return fail(400, { error: "Title is required" })
		}

		const slug = slugFromForm || slugify(title)
		const tagList = tags
			? tags
					.split(",")
					.map(t => t.trim())
					.filter(Boolean)
			: undefined

		if (slug !== params.slug) {
			await deletePost(params.slug)
		}

		const filePath = await savePost(
			slug,
			{
				title,
				description: description || undefined,
				tags: tagList,
				date,
			},
			content || ""
		)

		await publishPost(filePath, `Update post: ${title}`)

		return { published: true, slug }
	},

	delete: async ({ params }) => {
		const filePath = await deletePost(params.slug)
		await deleteAndPush(filePath, `Delete post: ${params.slug}`)
		return { deleted: true }
	},

	preview: async ({ request }) => {
		const formData = await request.formData()
		const content = formData.get("content") as string
		const html = await renderMarkdown(content || "")
		return { html }
	},
}
