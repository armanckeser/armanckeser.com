/**
 * The studio's shared documents. Each post is one Yjs document that the
 * browser editor and the agent's API calls both change; this module holds them,
 * keeps the .svx file on disk in step with them (so the site's own dev server
 * renders every keystroke), and tells everyone listening what changed.
 *
 *   doc.getText("body")      everything after the frontmatter, scripts included
 *   doc.getMap("meta")       the frontmatter
 *   doc.getMap("threads")    comment threads, id -> Thread
 */
import {
	mkdir,
	readFile,
	readdir,
	rename,
	stat,
	writeFile,
} from "node:fs/promises"
import { join } from "node:path"
import {
	ACTORS,
	type Actor,
	type StudioEvent,
	type Thread,
	type ThreadView,
} from "$lib/studio/types"
import diff from "fast-diff"
import {
	Awareness,
	applyAwarenessUpdate,
	encodeAwarenessUpdate,
	removeAwarenessStates,
} from "y-protocols/awareness"
import * as Y from "yjs"
import { type Meta, parseSvx, serializeSvx } from "./svx"

export const REPO_PATH = process.env.REPO_PATH || process.cwd()
export const CONTENT_DIR = join(REPO_PATH, "src", "content", "writing")
export const DATA_DIR = process.env.STUDIO_DATA || join(REPO_PATH, ".studio")

export type Subscriber = {
	id: string
	send: (event: string, data: unknown) => void
	/** Awareness client ids this subscriber has spoken for, dropped when it leaves. */
	clients: Set<number>
}

export type Room = {
	slug: string
	doc: Y.Doc
	awareness: Awareness
	/** A second awareness standing for the agent, merged into the room's. */
	agent: Awareness
	agentTimer?: ReturnType<typeof setTimeout>
	subs: Set<Subscriber>
	persistTimer?: ReturnType<typeof setTimeout>
	/** The file as this module last wrote or read it, to notice edits made elsewhere. */
	lastFile: string | null
	lastMtime: number
	updatedAt: number
}

type Registry = {
	rooms: Map<string, Promise<Room>>
	listeners: Set<(event: StudioEvent) => void>
	watchers: number
}

// One registry per process, even when the dev server reloads this module.
const g = globalThis as typeof globalThis & { __studio?: Registry }
const registry: Registry = (g.__studio ??= {
	rooms: new Map(),
	listeners: new Set(),
	watchers: 0,
})

export const SLUG = /^[a-z0-9][a-z0-9-]{0,79}$/

export function svxPath(slug: string) {
	return join(CONTENT_DIR, `${slug}.svx`)
}

function binPath(slug: string) {
	return join(DATA_DIR, "docs", `${slug}.ydoc`)
}

export const b64 = {
	encode: (bytes: Uint8Array) => Buffer.from(bytes).toString("base64"),
	decode: (text: string) => new Uint8Array(Buffer.from(text, "base64")),
}

// ---------------------------------------------------------------- events

export function emit(event: StudioEvent) {
	for (const listener of registry.listeners) listener(event)
}

export function listen(listener: (event: StudioEvent) => void) {
	registry.listeners.add(listener)
	return () => registry.listeners.delete(listener)
}

/** Agent watchers: an agent holding the events stream open counts as listening. */
export function agentWatching(delta = 0): boolean {
	registry.watchers = Math.max(0, registry.watchers + delta)
	if (delta !== 0) {
		for (const room of loadedRooms())
			broadcast(room, "agent", { watching: registry.watchers > 0 })
	}
	return registry.watchers > 0
}

// ---------------------------------------------------------------- rooms

function loadedRooms(): Room[] {
	return [...registry.rooms.values()].flatMap(promise => {
		const room = (promise as Promise<Room> & { resolved?: Room }).resolved
		return room ? [room] : []
	})
}

export function getRoom(slug: string): Promise<Room> {
	if (!SLUG.test(slug)) return Promise.reject(new NotFound(slug))
	let promise = registry.rooms.get(slug) as
		| (Promise<Room> & { resolved?: Room })
		| undefined
	if (!promise) {
		const p = openRoom(slug) as Promise<Room> & { resolved?: Room }
		p.then(
			room => {
				p.resolved = room
			},
			() => registry.rooms.delete(slug)
		)
		registry.rooms.set(slug, p)
		promise = p
	}
	return promise.then(async room => {
		await refreshFromDisk(room)
		return room
	})
}

export class NotFound extends Error {
	constructor(slug: string) {
		super(`No post called "${slug}"`)
	}
}

async function openRoom(slug: string): Promise<Room> {
	const doc = new Y.Doc()
	const [bin, file] = await Promise.all([
		readFile(binPath(slug)).catch(() => null),
		readFile(svxPath(slug), "utf-8").catch(() => null),
	])
	if (!bin && file === null) throw new NotFound(slug)

	if (bin) Y.applyUpdate(doc, new Uint8Array(bin), "load")

	const awareness = new Awareness(doc)
	awareness.setLocalState(null)
	const agent = new Awareness(new Y.Doc())
	agent.setLocalState(null)

	const room: Room = {
		slug,
		doc,
		awareness,
		agent,
		subs: new Set(),
		lastFile: null,
		lastMtime: 0,
		updatedAt: Date.now(),
	}

	if (file !== null) {
		const mtime = (await stat(svxPath(slug))).mtimeMs
		if (!bin) {
			const { meta, body, yaml, eol } = parseSvx(file)
			doc.transact(() => {
				doc.getText("body").insert(0, body)
				doc.getMap("raw").set("yaml", yaml)
				doc.getMap("raw").set("eol", eol)
				setMeta(doc, meta)
			}, "load")
		} else if (serialize(doc) !== file) {
			replaceFromFile(doc, file)
		}
		room.lastFile = file
		room.lastMtime = mtime
	}

	doc.on("update", (update: Uint8Array, origin: unknown) => {
		room.updatedAt = Date.now()
		broadcast(
			room,
			"update",
			{ update: b64.encode(update) },
			typeof origin === "string" ? origin : undefined
		)
		schedulePersist(room)
	})

	awareness.on(
		"update",
		(
			{ added, updated, removed }: Record<string, number[]>,
			origin: unknown
		) => {
			const changed = [...added, ...updated, ...removed]
			broadcast(
				room,
				"awareness",
				{
					update: b64.encode(
						encodeAwarenessUpdate(awareness, changed)
					),
				},
				typeof origin === "string" ? origin : undefined
			)
		}
	)

	if (!bin || file === null || serialize(doc) !== file) schedulePersist(room)
	return room
}

/** Picks up edits made to the file by something else: a git pull, an agent editing on disk. */
async function refreshFromDisk(room: Room) {
	const info = await stat(svxPath(room.slug)).catch(() => null)
	if (!info || info.mtimeMs === room.lastMtime) return
	const file = await readFile(svxPath(room.slug), "utf-8")
	room.lastMtime = info.mtimeMs
	if (file === room.lastFile) return
	room.lastFile = file
	if (serialize(room.doc) !== file) replaceFromFile(room.doc, file)
}

function replaceFromFile(doc: Y.Doc, file: string) {
	const { meta, body, yaml, eol } = parseSvx(file)
	doc.transact(() => {
		applyDiff(doc.getText("body"), body)
		doc.getMap("raw").set("yaml", yaml)
		doc.getMap("raw").set("eol", eol)
		setMeta(doc, meta)
	}, "disk")
}

export function serialize(doc: Y.Doc): string {
	// The frontmatter as last read from disk, patched only where the meta differs.
	const yaml = String(doc.getMap("raw").get("yaml") ?? "")
	const eol = String(doc.getMap("raw").get("eol") ?? "\n")
	return serializeSvx(
		yaml,
		readMeta(doc),
		doc.getText("body").toString(),
		eol
	)
}

export function readMeta(doc: Y.Doc): Meta {
	const meta = doc.getMap("meta").toJSON() as Meta
	return {
		...meta,
		title: String(meta.title ?? ""),
		date: String(meta.date ?? ""),
		published: meta.published !== false,
	}
}

export function setMeta(doc: Y.Doc, meta: Partial<Meta>, replace = true) {
	const map = doc.getMap("meta")
	for (const [key, value] of Object.entries(meta)) {
		if (value === undefined || value === null) {
			map.delete(key)
		} else if (JSON.stringify(map.get(key)) !== JSON.stringify(value)) {
			map.set(key, value)
		}
	}
	if (replace)
		for (const key of [...map.keys()]) if (!(key in meta)) map.delete(key)
}

/** Turns the text into `next` with the smallest edits, so cursors and comment anchors survive. */
export function applyDiff(
	text: Y.Text,
	next: string,
	offset = 0,
	current?: string
) {
	const before = current ?? text.toString()
	let index = offset
	for (const [op, chunk] of diff(before, next)) {
		if (op === diff.EQUAL) index += chunk.length
		else if (op === diff.DELETE) text.delete(index, chunk.length)
		else {
			text.insert(index, chunk)
			index += chunk.length
		}
	}
}

function schedulePersist(room: Room) {
	clearTimeout(room.persistTimer)
	// Written once typing pauses: each write re-renders the preview.
	room.persistTimer = setTimeout(() => void persist(room), 500)
}

export async function persist(room: Room) {
	clearTimeout(room.persistTimer)
	await mkdir(join(DATA_DIR, "docs"), { recursive: true })
	const bin = binPath(room.slug)
	await writeFile(`${bin}.tmp`, Y.encodeStateAsUpdate(room.doc))
	await rename(`${bin}.tmp`, bin)

	const file = serialize(room.doc)
	if (file !== room.lastFile) {
		await mkdir(CONTENT_DIR, { recursive: true })
		await writeFile(svxPath(room.slug), file, "utf-8")
		room.lastFile = file
		room.lastMtime = (await stat(svxPath(room.slug))).mtimeMs
		broadcast(room, "saved", { at: new Date().toISOString() })
	}
}

export function broadcast(
	room: Room,
	event: string,
	data: unknown,
	except?: string
) {
	for (const sub of room.subs) if (sub.id !== except) sub.send(event, data)
}

export function subscribe(room: Room, sub: Subscriber) {
	room.subs.add(sub)
	return () => {
		room.subs.delete(sub)
		if (sub.clients.size)
			removeAwarenessStates(room.awareness, [...sub.clients], sub.id)
	}
}

export function applyClientAwareness(
	room: Room,
	sub: Subscriber | undefined,
	update: Uint8Array,
	origin: string
) {
	if (sub) {
		// Remember which clients this connection speaks for, to clear them when it drops.
		const before = new Set(room.awareness.getStates().keys())
		applyAwarenessUpdate(room.awareness, update, origin)
		for (const id of room.awareness.getStates().keys())
			if (!before.has(id)) sub.clients.add(id)
	} else {
		applyAwarenessUpdate(room.awareness, update, origin)
	}
}

// ---------------------------------------------------------------- the agent's presence

/**
 * Shows the agent in the room: its name in the header, what it's doing, and a
 * cursor where it last changed the text. Fades after `ttl` without news.
 */
export function agentPresence(
	room: Room,
	status: string | null,
	at?: { from: number; to: number },
	ttl = 90_000
) {
	const text = room.doc.getText("body")
	const prev = room.agent.getLocalState() as Record<string, unknown> | null
	const cursor = at
		? {
				anchor: Y.relativePositionToJSON(
					Y.createRelativePositionFromTypeIndex(text, at.from)
				),
				head: Y.relativePositionToJSON(
					Y.createRelativePositionFromTypeIndex(text, at.to)
				),
			}
		: prev?.cursor
	room.agent.setLocalState({
		user: {
			name: ACTORS.claude.name,
			color: ACTORS.claude.color,
			colorLight: ACTORS.claude.light,
			actor: "claude",
		},
		status: status ?? prev?.status ?? null,
		cursor: cursor ?? null,
	})
	syncAgent(room)
	clearTimeout(room.agentTimer)
	room.agentTimer = setTimeout(() => {
		room.agent.setLocalState(null)
		syncAgent(room)
	}, ttl)
}

function syncAgent(room: Room) {
	const update = encodeAwarenessUpdate(room.agent, [room.agent.clientID])
	applyAwarenessUpdate(room.awareness, update, "claude")
}

// ---------------------------------------------------------------- threads

export function threads(room: Room): ThreadView[] {
	const map = room.doc.getMap("threads")
	return [...map.values()]
		.map(t => view(room, t as Thread))
		.sort(
			(a, b) =>
				(a.from ?? Number.MAX_SAFE_INTEGER) -
					(b.from ?? Number.MAX_SAFE_INTEGER) ||
				a.createdAt.localeCompare(b.createdAt)
		)
}

export function view(room: Room, thread: Thread): ThreadView {
	let from: number | null = null
	let to: number | null = null
	if (thread.anchor) {
		const start = Y.createAbsolutePositionFromRelativePosition(
			Y.createRelativePositionFromJSON(thread.anchor.start),
			room.doc
		)
		const end = Y.createAbsolutePositionFromRelativePosition(
			Y.createRelativePositionFromJSON(thread.anchor.end),
			room.doc
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
}

export function anchorAt(
	room: Room,
	from: number,
	to: number
): Thread["anchor"] {
	const text = room.doc.getText("body")
	return {
		start: Y.relativePositionToJSON(
			Y.createRelativePositionFromTypeIndex(text, from)
		),
		// The end sticks to the character before it, so typing right after the passage doesn't grow it.
		end: Y.relativePositionToJSON(
			Y.createRelativePositionFromTypeIndex(text, to, -1)
		),
	}
}

/**
 * Finds a quoted passage in the source. The quote may come from the rendered
 * page, where markdown marks and link targets are gone, so after an exact
 * search it tries again allowing those between words.
 */
export function locate(
	body: string,
	quote: string,
	near?: number
): { from: number; to: number } | null {
	const q = quote.trim()
	if (!q) return null
	const hits: number[] = []
	for (let i = body.indexOf(q); i !== -1; i = body.indexOf(q, i + 1))
		hits.push(i)
	if (hits.length) {
		const at =
			near === undefined
				? hits[0]
				: hits.reduce((a, b) =>
						Math.abs(b - near) < Math.abs(a - near) ? b : a
					)
		return { from: at, to: at + q.length }
	}
	const words = q
		.split(/\s+/)
		.filter(Boolean)
		.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
	if (!words.length) return null
	const between = String.raw`(?:\]\([^)]*\)|[\s*_\x60~>#\[\]])+`
	const pattern = new RegExp(words.join(between), "g")
	let best: { from: number; to: number } | null = null
	for (const match of body.matchAll(pattern)) {
		const hit = { from: match.index, to: match.index + match[0].length }
		if (
			!best ||
			(near !== undefined &&
				Math.abs(hit.from - near) < Math.abs(best.from - near))
		)
			best = hit
		if (near === undefined) break
	}
	return best
}

export function id() {
	return Math.random().toString(36).slice(2, 10)
}

export function putThread(room: Room, thread: Thread, actor: Actor) {
	room.doc.transact(
		() => room.doc.getMap("threads").set(thread.id, thread),
		actor
	)
}

export function getThread(room: Room, threadId: string): Thread | undefined {
	return room.doc.getMap("threads").get(threadId) as Thread | undefined
}

/**
 * Drops everything the studio holds about a post: its open connections, its
 * shared document and history. Used when a post is deleted, so a new post
 * under the same name starts clean.
 */
export async function forget(slug: string) {
	const promise = registry.rooms.get(slug)
	registry.rooms.delete(slug)
	const room = await promise?.catch(() => null)
	if (room) {
		clearTimeout(room.persistTimer)
		clearTimeout(room.agentTimer)
		broadcast(room, "deleted", { slug })
		room.doc.destroy()
	}
	const { rm } = await import("node:fs/promises")
	await rm(binPath(slug), { force: true })
}

export async function listSlugs(): Promise<string[]> {
	const files = await readdir(CONTENT_DIR).catch(() => [] as string[])
	return files
		.filter(f => f.endsWith(".svx"))
		.map(f => f.slice(0, -4))
		.filter(s => SLUG.test(s))
}
