/**
 * Everything the studio can do, in one place. The page and the agent call the
 * same functions through the same HTTP routes; neither has a private way in.
 */
import { problem } from "$lib/server/studio/problem"
import type { Actor, PostSummary, Thread, ThreadView } from "$lib/studio/types"
import { commitAndPush, statusOf } from "./git"
import {
	ensureNotes,
	removeNoteFile,
	status as notesStatus,
	syncNotes,
} from "./notes"
import {
	NotFound,
	type Room,
	SLUG,
	agentPresence,
	anchorAt,
	applyDiff,
	emit,
	forget,
	getRoom,
	getThread,
	id,
	NOTE,
	docPath,
	isNote,
	listNoteIds,
	listSlugs,
	locate,
	noteId,
	persist,
	putThread,
	readMeta,
	setMeta,
	svxPath,
	threads,
	view,
} from "./store"
import { type Meta, slugify, today } from "./svx"

export const SITE = "https://armanckeser.com"

export function actorOf(request: Request, url: URL): Actor {
	const named =
		request.headers.get("x-studio-actor") ?? url.searchParams.get("as")
	return named === "armanc" ? "armanc" : "claude"
}

async function room(slug: string): Promise<Room> {
	try {
		return await getRoom(slug)
	} catch (e) {
		if (e instanceof NotFound) problem(404, e.message)
		throw e
	}
}

function words(body: string): number {
	return body
		.replace(/<script[\s\S]*?<\/script>/g, "")
		.replace(/<[^>]+>/g, " ")
		.split(/\s+/)
		.filter(w => /\w/.test(w)).length
}

/** A note's name: its title, else its first heading, else its file name. */
function noteTitle(r: Room): string {
	const meta = readMeta(r.doc)
	if (meta.title) return meta.title
	const heading = /^#\s+(.+)$/m.exec(r.doc.getText("body").toString())
	if (heading) return heading[1].trim()
	const file = r.slug.split("~").at(-1) ?? r.slug
	return file.replace(/\.(md|svx)$/, "").replace(/[-_]+/g, " ")
}

async function summary(r: Room): Promise<PostSummary> {
	const meta = readMeta(r.doc)
	const all = threads(r)
	const open = all.filter(t => !t.resolved)
	const note = isNote(r.slug)
	return {
		slug: r.slug,
		kind: note ? "note" : "post",
		folder: note
			? r.slug.split("~").length > 2
				? r.slug.split("~")[1]
				: ""
			: undefined,
		title: note ? noteTitle(r) : meta.title || r.slug,
		description: meta.description,
		date: meta.date,
		status: note ? "note" : await statusOf(svxPath(r.slug), meta.published),
		openThreads: open.length,
		awaitingClaude: open.filter(t => t.awaitingClaude).length,
		words: words(r.doc.getText("body").toString()),
		updatedAt: new Date(r.updatedAt).toISOString(),
		url: note ? "" : `${SITE}/writing/${r.slug}`,
	}
}

export async function listPosts(): Promise<PostSummary[]> {
	const slugs = await listSlugs()
	const rooms = await Promise.all(
		slugs.map(s => getRoom(s).catch(() => null))
	)
	const posts = await Promise.all(rooms.flatMap(r => (r ? [summary(r)] : [])))
	// Drafts first (that's where the work is), then newest first.
	const rank = { draft: 0, changed: 1, published: 2, note: 3 }
	return posts.sort(
		(a, b) =>
			rank[a.status] - rank[b.status] || b.date.localeCompare(a.date)
	)
}

export async function getPost(slug: string) {
	const r = await room(slug)
	return {
		...(await summary(r)),
		meta: readMeta(r.doc),
		body: r.doc.getText("body").toString(),
		threads: threads(r),
	}
}

export async function createPost(
	input: {
		title: string
		slug?: string
		body?: string
		description?: string
	},
	actor: Actor
) {
	const title = input.title?.trim()
	if (!title) problem(400, "A post needs a title")
	const slug = input.slug?.trim() || slugify(title)
	if (!SLUG.test(slug))
		problem(
			400,
			`"${slug}" can't be a slug: lowercase letters, digits and dashes`
		)
	if ((await listSlugs()).includes(slug))
		problem(409, `There is already a post called "${slug}"`)
	// Anything left from an earlier post of the same name (its comments) goes.
	await forget(slug)

	const { writeFile, mkdir } = await import("node:fs/promises")
	const { dirname } = await import("node:path")
	const { newSvx } = await import("./svx")
	const meta: Meta = {
		title,
		description: input.description || undefined,
		date: today(),
		published: false,
	}
	await mkdir(dirname(svxPath(slug)), { recursive: true })
	await writeFile(svxPath(slug), newSvx(meta, input.body ?? ""), {
		flag: "wx",
	})
	const r = await room(slug)
	if (actor === "claude") agentPresence(r, "Started this post")
	emit({ type: "created", slug })
	return summary(r)
}

export async function updateMeta(
	slug: string,
	patch: Partial<Meta>,
	actor: Actor
) {
	const r = await room(slug)
	const allowed: Partial<Meta> = {}
	for (const key of [
		"title",
		"description",
		"tags",
		"date",
		"image",
	] as const) {
		if (key in patch)
			(allowed as Record<string, unknown>)[key] =
				patch[key] === "" ? undefined : patch[key]
	}
	r.doc.transact(() => setMeta(r.doc, allowed, false), actor)
	if (actor === "claude") agentPresence(r, "Edited the details")
	return readMeta(r.doc)
}

/** Replaces the whole body. Unchanged stretches stay put, so comments on them keep their place. */
export async function replaceBody(slug: string, body: string, actor: Actor) {
	if (typeof body !== "string") problem(400, "body must be a string")
	const r = await room(slug)
	const text = r.doc.getText("body")
	const before = text.toString()
	r.doc.transact(() => applyDiff(text, body), actor)
	if (actor === "claude") {
		const first = firstDifference(before, body)
		agentPresence(
			r,
			"Rewrote parts of the draft",
			first === null ? undefined : { from: first, to: first }
		)
	}
	emit({ type: "edit", slug, actor })
	return { body: text.toString() }
}

function firstDifference(a: string, b: string): number | null {
	if (a === b) return null
	let i = 0
	while (i < a.length && i < b.length && a[i] === b[i]) i++
	return i
}

export type Edit = { find: string; replace: string; all?: boolean }

/** Find-and-replace edits, applied in order. Each `find` must appear in the text as it is then. */
export async function editBody(slug: string, edits: Edit[], actor: Actor) {
	if (!Array.isArray(edits) || !edits.length)
		problem(400, "edits must be a non-empty list of { find, replace }")
	const r = await room(slug)
	const text = r.doc.getText("body")
	let source = text.toString()
	const missing = edits.filter(
		e => typeof e.find !== "string" || !e.find || !source.includes(e.find)
	)
	if (missing.length) {
		problem(
			409,
			`Not found in the post: ${missing.map(e => JSON.stringify(String(e.find).slice(0, 80))).join(", ")}`
		)
	}
	let last: { from: number; to: number } | undefined
	r.doc.transact(() => {
		for (const edit of edits) {
			let at = source.indexOf(edit.find)
			while (at !== -1) {
				applyDiff(text, edit.replace, at, edit.find)
				// applyDiff walks only the found span: diff(find, replace) offset by `at`.
				source = text.toString()
				last = { from: at, to: at + edit.replace.length }
				if (!edit.all) break
				at = source.indexOf(edit.find, at + edit.replace.length)
			}
		}
	}, actor)
	if (actor === "claude") agentPresence(r, "Edited the draft", last)
	emit({ type: "edit", slug, actor })
	return { body: text.toString(), applied: edits.length }
}

// ---------------------------------------------------------------- threads

export async function listThreads(
	slug: string,
	include: "open" | "all" = "open"
): Promise<ThreadView[]> {
	const r = await room(slug)
	const all = threads(r)
	return include === "all" ? all : all.filter(t => !t.resolved)
}

export async function createThread(
	slug: string,
	input: {
		body: string
		quote?: string
		from?: number
		to?: number
		near?: number
	},
	actor: Actor
) {
	const body = input.body?.trim()
	if (!body) problem(400, "A comment needs a body")
	const r = await room(slug)
	const source = r.doc.getText("body").toString()
	let range: { from: number; to: number } | null = null
	if (
		Number.isInteger(input.from) &&
		Number.isInteger(input.to) &&
		(input.to as number) > (input.from as number)
	) {
		range = {
			from: input.from as number,
			to: Math.min(input.to as number, source.length),
		}
	} else if (input.quote) {
		range = locate(source, input.quote, input.near)
	}
	const quote = range
		? source.slice(range.from, range.to)
		: (input.quote ?? "").trim()
	const thread: Thread = {
		id: id(),
		quote: quote.slice(0, 600),
		anchor: range ? anchorAt(r, range.from, range.to) : null,
		author: actor,
		body,
		createdAt: new Date().toISOString(),
		resolved: false,
		replies: [],
	}
	putThread(r, thread, actor)
	if (actor === "claude")
		agentPresence(r, "Left a comment", range ?? undefined)
	const v = view(r, thread)
	emit({ type: "thread", slug, thread: v, change: "created" })
	return v
}

export async function changeThread(
	slug: string,
	threadId: string,
	change: { reply?: string; resolved?: boolean; delete?: boolean },
	actor: Actor
) {
	const r = await room(slug)
	const thread = getThread(r, threadId)
	if (!thread) problem(404, `No thread ${threadId} on ${slug}`)

	if (change.delete) {
		r.doc.transact(() => r.doc.getMap("threads").delete(threadId), actor)
		emit({
			type: "thread",
			slug,
			thread: view(r, thread),
			change: "deleted",
		})
		return null
	}

	const next: Thread = { ...thread, replies: [...thread.replies] }
	let kind: "replied" | "resolved" | "reopened" = "replied"
	if (change.reply?.trim()) {
		next.replies.push({
			id: id(),
			author: actor,
			body: change.reply.trim(),
			createdAt: new Date().toISOString(),
		})
		// Answering a resolved thread brings it back.
		if (next.resolved && change.resolved === undefined)
			next.resolved = false
	}
	if (change.resolved !== undefined) {
		next.resolved = change.resolved
		kind = change.resolved ? "resolved" : "reopened"
	}
	putThread(r, next, actor)
	if (actor === "claude")
		agentPresence(
			r,
			kind === "replied" ? "Replied to a comment" : "Resolved a comment"
		)
	const v = view(r, next)
	emit({ type: "thread", slug, thread: v, change: kind })
	return v
}

/** Threads across every post whose last word is the writer's: the agent's to-do list. */
export async function inbox() {
	await ensureNotes()
	const slugs = [...(await listSlugs()), ...(await listNoteIds())]
	const out: { slug: string; title: string; threads: ThreadView[] }[] = []
	for (const slug of slugs) {
		const r = await getRoom(slug).catch(() => null)
		if (!r) continue
		const waiting = threads(r).filter(t => t.awaitingClaude)
		if (waiting.length)
			out.push({ slug, title: readMeta(r.doc).title, threads: waiting })
	}
	return out
}

export async function setPresence(
	slug: string,
	status: string | null,
	ttl?: number
) {
	const r = await room(slug)
	agentPresence(r, status, undefined, ttl)
}

// ---------------------------------------------------------------- publishing

export async function publish(slug: string, actor: Actor, message?: string) {
	if (isNote(slug))
		problem(
			409,
			"Notes aren't published. A post idea in drafts/ can be moved to posts first."
		)
	const r = await room(slug)
	const meta = readMeta(r.doc)
	if (!meta.title.trim())
		problem(400, "Give the post a title before publishing")
	const first = (await statusOf(svxPath(slug), meta.published)) === "draft"
	r.doc.transact(() => {
		setMeta(
			r.doc,
			{ published: true, date: first ? today() : meta.date },
			false
		)
	}, actor)
	await persist(r)
	const commit = await commitAndPush(
		[svxPath(slug)],
		message?.trim() ||
			(first ? `Publish: ${meta.title}` : `Update: ${meta.title}`)
	).catch(e => {
		problem(
			502,
			`Saved, but pushing to GitHub failed: ${String(
				e.stderr || e.message
			)
				.trim()
				.slice(0, 400)}`
		)
	})
	const url = `${SITE}/writing/${slug}`
	emit({ type: "published", slug, url, commit })
	return { commit, url, first }
}

/** Takes a post back to draft: it stays in the repo but leaves the site on the next deploy. */
export async function unpublish(slug: string, actor: Actor) {
	if (isNote(slug)) problem(409, "Notes aren't published.")
	const r = await room(slug)
	const meta = readMeta(r.doc)
	const live = (await statusOf(svxPath(slug), meta.published)) !== "draft"
	r.doc.transact(() => setMeta(r.doc, { published: false }, false), actor)
	await persist(r)
	// A draft that was never pushed stays off GitHub: the repo is public.
	if (!live) return { commit: null }
	const commit = await commitAndPush(
		[svxPath(slug)],
		`Unpublish: ${meta.title}`
	)
	return { commit }
}

/** Deletes a draft. Published posts are taken down with unpublish first, so nothing live vanishes by accident. */
export async function deleteDraft(slug: string) {
	if (isNote(slug)) {
		await room(slug)
		await forget(slug)
		await removeNoteFile(docPath(slug))
		emit({ type: "deleted", slug })
		return
	}
	const r = await room(slug)
	const meta = readMeta(r.doc)
	if ((await statusOf(svxPath(slug), meta.published)) !== "draft") {
		problem(409, "Only drafts can be deleted here. Unpublish it first.")
	}
	const { rm } = await import("node:fs/promises")
	await forget(slug)
	await rm(svxPath(slug), { force: true })
	emit({ type: "deleted", slug })
}

// ---------------------------------------------------------------- notes

export async function listNotes(): Promise<PostSummary[]> {
	await ensureNotes()
	const ids = await listNoteIds()
	const rooms = await Promise.all(ids.map(i => getRoom(i).catch(() => null)))
	const notes = await Promise.all(rooms.flatMap(r => (r ? [summary(r)] : [])))
	const order = { "": 0, drafts: 1, research: 2 } as Record<string, number>
	return notes.sort(
		(a, b) =>
			(order[a.folder ?? ""] ?? 9) - (order[b.folder ?? ""] ?? 9) ||
			a.title.localeCompare(b.title)
	)
}

/**
 * A new note. In drafts/ it's a post idea, kept like a post (.svx with
 * frontmatter) so it can become one; anywhere else it's plain markdown.
 */
export async function createNote(
	input: { title: string; folder?: string; body?: string },
	actor: Actor
) {
	if (!(await ensureNotes()))
		problem(502, "The notes repo isn't available here")
	const title = input.title?.trim()
	if (!title) problem(400, "A note needs a title")
	const folder =
		input.folder === "drafts" || input.folder === "research"
			? input.folder
			: ""
	const name = slugify(title)
	if (!name)
		problem(400, "That title has no letters or digits to name a file with")
	const ext = folder === "drafts" ? "svx" : "md"
	const path = folder ? `${folder}/${name}.${ext}` : `${name}.${ext}`
	const nid = noteId(path)
	if (!NOTE.test(nid)) problem(400, `Can't make a note at ${path}`)
	const { writeFile, mkdir } = await import("node:fs/promises")
	const { dirname } = await import("node:path")
	const { newSvx } = await import("./svx")
	const body = input.body ?? ""
	const file =
		ext === "svx"
			? newSvx({ title, date: today(), published: false }, body)
			: `# ${title}\n\n${body}`
	await mkdir(dirname(docPath(nid)), { recursive: true })
	await writeFile(docPath(nid), file, { flag: "wx" }).catch(() => {
		problem(409, `There is already a note at ${path}`)
	})
	await forget(nid)
	const r = await room(nid)
	if (actor === "claude") agentPresence(r, "Started this note")
	emit({ type: "created", slug: nid })
	return summary(r)
}

/** Turns a post idea in drafts/ into a draft post of the site, and takes it out of the notes. */
export async function promoteNote(nid: string, actor: Actor) {
	if (!nid.startsWith("notes~drafts~"))
		problem(409, "Only post ideas in drafts/ can become posts")
	const r = await room(nid)
	const slug = slugify(
		nid
			.split("~")
			.at(-1)
			?.replace(/\.(md|svx)$/, "") ?? ""
	)
	if (!SLUG.test(slug)) problem(400, `"${slug}" can't be a post slug`)
	if ((await listSlugs()).includes(slug))
		problem(409, `There is already a post called "${slug}"`)
	const { serialize } = await import("./store")
	const { writeFile } = await import("node:fs/promises")
	const { parseSvx, serializeSvx } = await import("./svx")
	// Same text, frontmatter kept, marked as a draft.
	const parsed = parseSvx(serialize(r.doc))
	const file = serializeSvx(
		parsed.yaml,
		{ ...parsed.meta, published: false, date: parsed.meta.date || today() },
		parsed.body
	)
	await forget(slug)
	await writeFile(svxPath(slug), file, { flag: "wx" })
	await forget(nid)
	await removeNoteFile(docPath(nid))
	emit({ type: "deleted", slug: nid })
	emit({ type: "created", slug })
	const post = await room(slug)
	if (actor === "claude") agentPresence(post, "Moved this in from the notes")
	return summary(post)
}

export async function renderNote(
	nid: string
): Promise<{ title: string; html: string }> {
	const r = await room(nid)
	const { renderMarkdown } = await import("../markdown")
	const body = r.doc.getText("body").toString()
	// Svelte script blocks and component tags in post ideas aren't prose.
	const prose = body.replace(/<script[\s\S]*?<\/script>/g, "")
	return { title: noteTitle(r), html: await renderMarkdown(prose) }
}

export { notesStatus, syncNotes }
