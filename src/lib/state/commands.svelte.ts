import { z } from "zod"
import { toggleMode } from "mode-watcher"
import { goto } from "$app/navigation"
import { page } from "$app/state"

export const CommandSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	action: z.function().args(z.array(z.string())).returns(z.void()),
})

export type Command = z.infer<typeof CommandSchema>

export const commands = [
	{
		id: "theme-toggle",
		name: "toggle-theme",
		description: "Toggle between light and dark theme",
		action: () => toggleMode(),
	},
	{
		id: "cd",
		name: "cd",
		description: "Navigate to a different section",
		action: (args: string[]) => {
			const [path] = args
			if (!path) return

			// Handle home directory aliases
			if (path === "~" || path === "/home") {
				goto("/")
				return
			}

			const basePath = page.url.pathname === "/" ? "~" : page.url.pathname
			const resolvedPath = resolvePath(basePath, path)
			goto(resolvedPath)
		},
	},
] satisfies Command[]

function resolvePath(base: string, input: string) {
	// Handle home directory aliases
	if (input === "~" || input === "/home") return "/"

	const normalizedBase = base.replace(/^~/, "")
	const pathSegments = [
		...normalizedBase.split("/").filter(Boolean),
		...input.split("/"),
	].reduce((acc, segment) => {
		segment === ".." ? acc.pop() : acc.push(segment)
		return acc
	}, [] as string[])

	return "/" + pathSegments.filter(Boolean).join("/")
}

export function executeCommand(input: string) {
	const [base, ...args] = input.trim().split(" ")
	const command = commands.find(cmd => cmd.name === base)

	if (command) {
		command.action(args)
		return true
	}

	return false
}
