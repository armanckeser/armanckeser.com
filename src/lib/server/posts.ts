import { readdir, readFile, writeFile, unlink } from "node:fs/promises"
import { join } from "node:path"
import matter from "gray-matter"
import type { PostFrontmatter, PostWithContent } from "../../types"

function getContentDir(): string {
	const repoPath = process.env.REPO_PATH || process.cwd()
	return join(repoPath, "src", "content", "writing")
}

export async function listPosts(): Promise<PostWithContent[]> {
	const contentDir = getContentDir()
	const files = await readdir(contentDir)
	const svxFiles = files.filter(file => file.endsWith(".svx"))

	const posts = await Promise.all(
		svxFiles.map(async file => {
			const filePath = join(contentDir, file)
			const raw = await readFile(filePath, "utf-8")
			const { data, content } = matter(raw)
			const slug = file.replace(".svx", "")

			return {
				title: data.title ?? "",
				date: data.date ?? "",
				description: data.description,
				tags: data.tags,
				published: data.published,
				slug,
				content,
			} satisfies PostWithContent
		})
	)

	return posts.sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
	)
}

export async function getPost(slug: string): Promise<PostWithContent> {
	const contentDir = getContentDir()
	const filePath = join(contentDir, `${slug}.svx`)
	const raw = await readFile(filePath, "utf-8")
	const { data, content } = matter(raw)

	return {
		title: data.title ?? "",
		date: data.date ?? "",
		description: data.description,
		tags: data.tags,
		published: data.published,
		slug,
		content,
	}
}

export async function savePost(
	slug: string,
	frontmatter: PostFrontmatter,
	content: string
): Promise<string> {
	const contentDir = getContentDir()
	const filePath = join(contentDir, `${slug}.svx`)

	const fileContent = matter.stringify(content, frontmatter)
	await writeFile(filePath, fileContent, "utf-8")

	return filePath
}

export async function deletePost(slug: string): Promise<string> {
	const contentDir = getContentDir()
	const filePath = join(contentDir, `${slug}.svx`)
	await unlink(filePath)
	return filePath
}

export function slugify(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
}
