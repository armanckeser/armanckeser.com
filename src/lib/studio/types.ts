/**
 * Shapes shared by the studio's server and browser. The same JSON goes to the
 * page and to an agent calling the API with curl.
 */

/** Who did something. The person writing, or the agent working with them. */
export type Actor = "armanc" | "claude"

export const ACTORS: Record<
	Actor,
	{ name: string; color: string; light: string }
> = {
	armanc: { name: "Armanc", color: "#2f6f8f", light: "#2f6f8f33" },
	claude: { name: "Claude", color: "#c2410c", light: "#c2410c33" },
}

export type Reply = {
	id: string
	author: Actor
	body: string
	createdAt: string
}

/**
 * A thread on a passage of the post. The passage is kept two ways: the quoted
 * text (readable, and how the rendered page finds it again) and positions in
 * the shared text that move with edits (how the editor finds it).
 */
export type Thread = {
	id: string
	quote: string
	/** Yjs relative positions, JSON-encoded. Null when the quote couldn't be placed. */
	anchor: { start: unknown; end: unknown } | null
	author: Actor
	body: string
	createdAt: string
	resolved: boolean
	replies: Reply[]
}

/** A thread as the API reports it: where its passage is now, and whose turn it is. */
export type ThreadView = Thread & {
	from: number | null
	to: number | null
	/** True when the last word is the writer's, so the agent owes an answer. */
	awaitingClaude: boolean
}

export type PostStatus = "draft" | "published" | "changed"

export type PostSummary = {
	slug: string
	title: string
	description?: string
	date: string
	status: PostStatus
	openThreads: number
	awaitingClaude: number
	words: number
	updatedAt: string
	url: string
}

export type Presence = {
	actor: Actor
	/** What the agent is doing right now, in a few words. */
	status?: string
}

export type StudioEvent =
	| {
			type: "thread"
			slug: string
			thread: ThreadView
			change: "created" | "replied" | "resolved" | "reopened" | "deleted"
	  }
	| { type: "edit"; slug: string; actor: Actor }
	| { type: "published"; slug: string; url: string; commit: string }
	| { type: "created"; slug: string }
	| { type: "deleted"; slug: string }
