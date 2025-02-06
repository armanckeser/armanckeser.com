import { goto } from "$app/navigation"
import type { CommandRegistry } from "./types"

export const commands: CommandRegistry = new Map()

// cd command implementation
commands.set("cd", {
	execute: async (path: string) => {
		await goto(path)
		return
	},
	complete: (input: string) => {
		// TODO: Implement path completion
		return []
	},
	help: "Change current page. Usage: cd [path]",
})

commands.set("ls", {
	execute: async () => {
		// TODO: Implement ls command
		return []
	},
	complete: (input: string) => {
		// TODO: Implement path completion
		return []
	},
	help: "List possible pages. Usage: ls",
})
