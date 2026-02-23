import { publishPost } from "$lib/server/git"
import { renderMarkdown } from "$lib/server/markdown"
import { savePost, slugify } from "$lib/server/posts"
import { fail, redirect } from "@sveltejs/kit"
import type { Actions } from "./$types"

export const actions: Actions = {
	save: async ({ request }) => {
		const formData = await request.formData()
		const title = formData.get("title") as string
		const description = formData.get("description") as string
		const tags = formData.get("tags") as string
		const date = formData.get("date") as string
		const content = formData.get("content") as string

		if (!title?.trim()) {
			return fail(400, { error: "Title is required" })
		}

		const slug = slugify(title)
		const tagList = tags
			? tags
					.split(",")
					.map(t => t.trim())
					.filter(Boolean)
			: undefined

		const filePath = await savePost(
			slug,
			{
				title,
				description: description || undefined,
				tags: tagList,
				date: date || new Date().toISOString().split("T")[0],
			},
			content || ""
		)

		return { slug, filePath, saved: true }
	},

	publish: async ({ request }) => {
		const formData = await request.formData()
		const title = formData.get("title") as string
		const description = formData.get("description") as string
		const tags = formData.get("tags") as string
		const date = formData.get("date") as string
		const content = formData.get("content") as string

		if (!title?.trim()) {
			return fail(400, { error: "Title is required" })
		}

		const slug = slugify(title)
		const tagList = tags
			? tags
					.split(",")
					.map(t => t.trim())
					.filter(Boolean)
			: undefined

		const filePath = await savePost(
			slug,
			{
				title,
				description: description || undefined,
				tags: tagList,
				date: date || new Date().toISOString().split("T")[0],
			},
			content || ""
		)

		await publishPost(filePath, `Add post: ${title}`)

		redirect(303, "/cms")
	},

	preview: async ({ request }) => {
		const formData = await request.formData()
		const content = formData.get("content") as string
		const html = await renderMarkdown(content || "")
		return { html }
	},
}
