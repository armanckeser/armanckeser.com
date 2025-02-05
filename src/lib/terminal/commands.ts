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
	help: "Change the current directory. Usage: cd [path]",
})
