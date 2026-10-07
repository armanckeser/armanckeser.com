import * as Y from "yjs"
import type { Thread, ThreadView } from "./types"

/** Threads as they stand in the shared document, with where their passage is now. */
export function threadViews(doc: Y.Doc): ThreadView[] {
	const map = doc.getMap("threads")
	return [...map.values()]
		.map(raw => {
			const thread = raw as Thread
			let from: number | null = null
			let to: number | null = null
			if (thread.anchor) {
				const start = Y.createAbsolutePositionFromRelativePosition(
					Y.createRelativePositionFromJSON(thread.anchor.start),
					doc
				)
				const end = Y.createAbsolutePositionFromRelativePosition(
					Y.createRelativePositionFromJSON(thread.anchor.end),
					doc
				)
				if (start && end && end.index > start.index) {
					from = start.index
					to = end.index
				}
			}
			const last = thread.replies.at(-1)?.author ?? thread.author
			return {
				...thread,
				from,
				to,
				awaitingClaude: !thread.resolved && last === "armanc",
			}
		})
		.sort(
			(a, b) =>
				(a.from ?? Number.MAX_SAFE_INTEGER) -
					(b.from ?? Number.MAX_SAFE_INTEGER) ||
				a.createdAt.localeCompare(b.createdAt)
		)
}

/** A quote from the source as it reads on the rendered page: no markdown marks or link targets. */
export function plainText(markdown: string): string {
	return markdown
		.replace(/<[^>]+>/g, " ")
		.replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/[*_`~]+/g, "")
		.replace(/^#+\s*/gm, "")
		.replace(/^>\s?/gm, "")
		.replace(/\s+/g, " ")
		.trim()
}

/** Same ids rehype-slug gives headings on the site. */
export function headingId(text: string): string {
	return plainText(text)
		.toLowerCase()
		.replace(/[^\p{L}\p{M}\p{N}\p{Pc}\s-]/gu, "")
		.replace(/\s/g, "-")
}

export function ago(iso: string, now = Date.now()): string {
	const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000))
	if (s < 45) return "just now"
	const m = Math.round(s / 60)
	if (m < 60) return `${m}m`
	const h = Math.round(m / 60)
	if (h < 24) return `${h}h`
	const d = Math.round(h / 24)
	if (d < 30) return `${d}d`
	return new Date(iso).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
	})
}
