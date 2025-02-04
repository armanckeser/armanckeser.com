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
	execute: Function
	complete?: (input: string) => string[]
	help?: string
}

export type CommandRegistry = Map<string, CommandHandler>
