import { goto } from "$app/navigation"
import { getPosts } from "$lib/posts"
import type { CommandRegistry } from "./types"

export const commands: CommandRegistry = new Map()

const posts = getPosts()
const postSlugs = posts.map(post => post.slug)

// Tree structure for navigation
const directoryTree = {
	writing: postSlugs,
}

// cd command implementation
commands.set("cd", {
	execute: async (path: string) => {
		goto(path)
	},
	complete: (input: string) => {
		const parts = input.split("/")
		let currentLevel: Record<string, string[]> | string[] = directoryTree
		const lastPart = parts.pop() || ""

		// Traverse the tree based on input path
		for (const part of parts) {
			if (typeof currentLevel !== "object" || Array.isArray(currentLevel))
				break

			if (currentLevel[part]) {
				currentLevel = currentLevel[part]
			} else {
				return []
			}
		}

		// Get completion options based on current level
		const options = Array.isArray(currentLevel)
			? currentLevel
			: Object.keys(currentLevel).map(k => `${k}/`)

		// Filter and sort matches
		return options
			.filter(opt => opt.startsWith(lastPart))
			.sort((a, b) => a.localeCompare(b))
	},
	help: "Change current page. Usage: cd [path]",
})

commands.set("rss", {
	execute: async () => {
		goto("/rss.xml")
	},
	help: "Show RSS feed. Usage: rss",
})
