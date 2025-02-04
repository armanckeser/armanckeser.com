import type { SvelteComponent } from "svelte"

export type RouteManifest = Record<
	string,
	{
		isPage: boolean
		children: RouteManifest
		params?: string[]
		path: string
	}
>

export type ContentNode = {
	slug: string
	title: string
	type: "page" | "section" | "post"
	children: ContentNode[]
	path: string
}

export type TerminalError = {
	code: string
	message: string
	details?: Record<string, unknown>
}

export type CommandResult = {
	success: boolean
	message?: string
	error?: TerminalError
	data?: unknown
}

export type CommandHandler = {
	execute: (args: string[]) => Promise<CommandResult> | CommandResult
	complete?: (input: string) => string[]
	help?: string
}

export type CommandRegistry = Map<string, CommandHandler>
