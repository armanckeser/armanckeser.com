/** The page's calls into the studio API, made as the writer. Same routes the agent uses. */
import type { PostSummary, ThreadView } from "./types"

async function call<T>(
	path: string,
	method = "GET",
	body?: unknown
): Promise<T> {
	const response = await fetch(`/cms/api${path}`, {
		method,
		headers: {
			"content-type": "application/json",
			"x-studio-actor": "armanc",
		},
		body: body === undefined ? undefined : JSON.stringify(body),
	})
	if (!response.ok) {
		const text = await response.text()
		let message = text
		try {
			message = JSON.parse(text).message ?? text
		} catch {}
		throw new Error(message || `${response.status}`)
	}
	return response.status === 204 ? (undefined as T) : response.json()
}

const post = (slug: string) => `/posts/${encodeURIComponent(slug)}`

export const api = {
	posts: () => call<PostSummary[]>("/posts"),
	create: (title: string) => call<PostSummary>("/posts", "POST", { title }),
	meta: (slug: string, patch: Record<string, unknown>) =>
		call(post(slug), "PATCH", patch),
	comment: (
		slug: string,
		input: {
			body: string
			quote?: string
			from?: number
			to?: number
			near?: number
		}
	) => call<ThreadView>(`${post(slug)}/threads`, "POST", input),
	reply: (slug: string, id: string, reply: string) =>
		call<ThreadView>(`${post(slug)}/threads/${id}`, "PATCH", { reply }),
	resolve: (slug: string, id: string, resolved: boolean) =>
		call<ThreadView>(`${post(slug)}/threads/${id}`, "PATCH", { resolved }),
	remove: (slug: string, id: string) =>
		call<void>(`${post(slug)}/threads/${id}`, "DELETE"),
	publish: (slug: string) =>
		call<{ commit: string; url: string; first: boolean }>(
			`${post(slug)}/publish`,
			"POST",
			{}
		),
	unpublish: (slug: string) =>
		call<{ commit: string | null }>(`${post(slug)}/publish`, "DELETE"),
	deleteDraft: (slug: string) => call<void>(post(slug), "DELETE"),
	status: (slug: string) => call<PostSummary & { body: string }>(post(slug)),
}
