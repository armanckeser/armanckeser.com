import { goto } from "$app/navigation"
import type { CommandRegistry } from "./types"

export const commands: CommandRegistry = new Map()

// cd command implementation
commands.set("cd", {
	execute: async (path: string) => {
		goto(path)
	},
	complete: (_input: string) => {
		// TODO: Implement path completion
		return []
	},
	help: "Change current page. Usage: cd [path]",
})

commands.set("rss", {
	execute: async () => {
		goto("/rss.xml")
	},
	help: "Show RSS feed. Usage: rss",
})
