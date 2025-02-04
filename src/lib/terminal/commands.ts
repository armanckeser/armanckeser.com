import type { CommandHandler, CommandRegistry, RouteManifest } from "./types"
import { resolveTerminalPath } from "./path-resolver"
import { goto } from "$app/navigation"

export function createCommandSystem(manifest: RouteManifest) {
	const commands: CommandRegistry = new Map()

	// cd command implementation
	commands.set("cd", {
		execute: async (args: string[]) => {
			const currentPath = window.location.pathname
			const targetPath = args[0] || "~"

			const result = resolveTerminalPath(
				currentPath,
				targetPath,
				manifest
			)

			if (!result.success) {
				return {
					success: false,
					error: result.error,
				}
			}

			await goto(result.resolvedPath)
			return {
				success: true,
				message: `Changed directory to ${result.resolvedPath}`,
			}
		},
		complete: (input: string) => {
			// TODO: Implement path completion
			return []
		},
		help: "Change the current directory. Usage: cd [path]",
	})

	return {
		execute: async (input: string) => {
			const [cmd, ...args] = input.trim().split(/\s+/)
			const handler = commands.get(cmd)

			if (!handler) {
				return {
					success: false,
					error: {
						code: "COMMAND_NOT_FOUND",
						message: `Command not found: ${cmd}`,
					},
				}
			}

			return handler.execute(args)
		},
		getCompletions: (input: string) => {
			const [cmd, ...args] = input.trim().split(/\s+/)
			const handler = commands.get(cmd)

			if (!handler?.complete) return []
			return handler.complete(args.join(" "))
		},
		getHelp: (cmd: string) => {
			const handler = commands.get(cmd)
			return handler?.help
		},
	}
}
