export type ContentNode = {
	slug: string
	title: string
	type: "page" | "section" | "post"
	children: ContentNode[]
	path: string
}

export type CommandHandler = {
	execute: Function
	complete?: (input: string) => string[]
	help?: string
}

export type CommandRegistry = Map<string, CommandHandler>
