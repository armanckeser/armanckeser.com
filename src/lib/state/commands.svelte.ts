import { z } from "zod"
import { toggleMode } from "mode-watcher"
import { goto } from "$app/navigation"

export const CommandSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	action: z.function().args(z.array(z.string())).returns(z.void()),
	aliases: z.array(z.string()).optional(),
})

export type Command = z.infer<typeof CommandSchema>

export const commands: Command[] = []
export const commandHistory: string[] = []

export function registerCommand(command: Command) {
	commands.push(command)
}

export function executeCommand(input: string) {
	const [base, ...args] = input.trim().split(" ")
	const command = commands.find(
		cmd => cmd.name === base || cmd.aliases?.includes(base)
	)

	if (command) {
		command.action(args)
		commandHistory.push(input)
		return true
	}

	return false
}

// Register default commands
registerCommand({
	id: "theme-toggle",
	name: "toggle-theme",
	description: "Toggle between light and dark theme",
	action: (args: string[]) => {
		toggleMode()
	},
})

registerCommand({
	id: "cd",
	name: "cd",
	description: "Navigate to a different section",
	action: (args: string[]) => {
		const [path] = args
		if (!path) return

		if (path.startsWith("/")) {
			goto(path)
		} else {
			goto("/" + path)
		}
	},
})
