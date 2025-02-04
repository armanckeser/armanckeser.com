import { goto } from "$app/navigation"
import type { CommandRegistry } from "./types"

export const commands: CommandRegistry = new Map()

// cd command implementation
commands.set("cd", {
	execute: async (args: string[]) => {
		await goto("/")
		return
	},
	complete: (input: string) => {
		// TODO: Implement path completion
		return []
	},
	help: "Change the current directory. Usage: cd [path]",
})
