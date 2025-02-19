import { goto } from "$app/navigation"
import type { CommandRegistry } from "./types"

export const commands: CommandRegistry = new Map()

export interface Completion {
	type: "command" | "suggestion"
	text: string
	help?: string
}

export function normalizeCommandInput(input: string): string {
	return input.replace(/\s+/g, " ")
}

export function get_completions(input: string): Completion[] {
	const [command, ...args] = normalizeCommandInput(input).split(" ")
	const currentInput = args.join(" ")

	// Handle command name completion
	if (!input.includes(" ")) {
		return Array.from(commands.entries())
			.filter(([cmd]) => cmd.startsWith(input))
			.map(([cmd, { help }]) => ({
				type: "command",
				text: cmd,
				help,
			}))
	}

	// Handle command-specific completion
	const handler = commands.get(command)
	if (!handler?.complete) return []

	return handler.complete(currentInput).map(opt => ({
		type: "suggestion",
		text: opt,
		help: "",
	}))
}

commands.set("cd", {
	execute: async (path?: string) => {
		if (!path || path === "~") {
			goto("/")
		} else {
			goto(path)
		}
	},
	complete: (_input: string) => {
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
