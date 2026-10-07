/**
 * The browser's end of a shared post. Changes go up as small POSTs and
 * everyone else's come down one event stream, so it works through any proxy
 * and picks up where it left off after a dropped connection: the server opens
 * every connection with its state vector, and the editor answers with whatever
 * the server is missing.
 */
import {
	Awareness,
	applyAwarenessUpdate,
	encodeAwarenessUpdate,
	removeAwarenessStates,
} from "y-protocols/awareness"
import * as Y from "yjs"
import { ACTORS, type Actor } from "./types"

const decode = (text: string) =>
	Uint8Array.from(atob(text), c => c.charCodeAt(0))
function encode(bytes: Uint8Array): string {
	let out = ""
	for (let i = 0; i < bytes.length; i += 0x8000)
		out += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
	return btoa(out)
}

export type Connection = "connecting" | "live" | "offline"

export class Collab {
	readonly doc = new Y.Doc()
	readonly awareness = new Awareness(this.doc)
	readonly client = crypto.randomUUID()

	connection = $state<Connection>("connecting")
	/** True once the first copy of the post has arrived. */
	ready = $state(false)
	/** Set when the server last wrote the file the preview renders. */
	savedAt = $state<number>(0)
	/** Unsent or unacknowledged changes. */
	pending = $state(false)
	agentWatching = $state(false)

	#source?: EventSource
	#live = false
	#dropTimer?: ReturnType<typeof setTimeout>
	#queue: Uint8Array[] = []
	#awarenessDirty = false
	#flushing = false
	#timer?: ReturnType<typeof setTimeout>
	#listeners = new Set<(event: string, data: unknown) => void>()

	constructor(
		readonly slug: string,
		actor: Actor = "armanc"
	) {
		const who = ACTORS[actor]
		this.awareness.setLocalStateField("user", {
			name: who.name,
			color: who.color,
			colorLight: who.light,
			actor,
		})

		this.doc.on("update", (update: Uint8Array, origin: unknown) => {
			if (origin === "remote") return
			this.#queue.push(update)
			this.#schedule()
		})
		this.awareness.on(
			"update",
			(
				{ added, updated, removed }: Record<string, number[]>,
				origin: unknown
			) => {
				if (origin === "remote") return
				if (
					[...added, ...updated, ...removed].includes(
						this.doc.clientID
					)
				) {
					this.#awarenessDirty = true
					this.#schedule()
				}
			}
		)
		this.#open()
		addEventListener("pagehide", this.#leave)
	}

	base() {
		return `/cms/api/posts/${encodeURIComponent(this.slug)}`
	}

	/** Other things the server announces on this post's stream ("saved", "agent"). */
	on(listener: (event: string, data: unknown) => void) {
		this.#listeners.add(listener)
		return () => this.#listeners.delete(listener)
	}

	#open() {
		const source = new EventSource(
			`${this.base()}/stream?client=${this.client}`
		)
		this.#source = source
		this.connection = "connecting"

		source.addEventListener("init", e => {
			const data = JSON.parse((e as MessageEvent).data)
			Y.applyUpdate(this.doc, decode(data.update), "remote")
			if (data.awareness)
				applyAwarenessUpdate(
					this.awareness,
					decode(data.awareness),
					"remote"
				)
			this.agentWatching = data.agentWatching
			// Whatever we have that the server doesn't: edits made while offline.
			const missing = Y.encodeStateAsUpdate(this.doc, decode(data.vector))
			if (missing.length > 2) this.#queue.push(missing)
			this.#awarenessDirty = true
			this.#schedule(0)
			this.#live = true
			clearTimeout(this.#dropTimer)
			this.connection = "live"
			this.ready = true
		})
		source.addEventListener("update", e => {
			Y.applyUpdate(
				this.doc,
				decode(JSON.parse((e as MessageEvent).data).update),
				"remote"
			)
		})
		source.addEventListener("awareness", e => {
			applyAwarenessUpdate(
				this.awareness,
				decode(JSON.parse((e as MessageEvent).data).update),
				"remote"
			)
		})
		source.addEventListener("saved", e => {
			this.savedAt = Date.now()
			this.#emit("saved", JSON.parse((e as MessageEvent).data))
		})
		source.addEventListener("deleted", () => {
			source.close()
			this.#emit("deleted", null)
		})
		source.addEventListener("agent", e => {
			this.agentWatching = JSON.parse((e as MessageEvent).data).watching
		})
		source.onerror = () => {
			// The proxy in front of the studio closes long requests now and then;
			// the stream comes straight back, so only a lasting drop is shown.
			this.#live = false
			clearTimeout(this.#dropTimer)
			this.#dropTimer = setTimeout(() => {
				if (this.#live) return
				this.connection =
					source.readyState === EventSource.CLOSED
						? "offline"
						: "connecting"
				// Others' cursors are stale until we're back.
				const others = [...this.awareness.getStates().keys()].filter(
					id => id !== this.doc.clientID
				)
				removeAwarenessStates(this.awareness, others, "remote")
			}, 4000)
			if (source.readyState === EventSource.CLOSED)
				setTimeout(() => this.#open(), 2000)
		}
	}

	#emit(event: string, data: unknown) {
		for (const l of this.#listeners) l(event, data)
	}

	#schedule(delay = 40) {
		this.pending = this.#queue.length > 0
		clearTimeout(this.#timer)
		this.#timer = setTimeout(() => void this.#flush(), delay)
	}

	async #flush() {
		if (this.#flushing || !this.#live) return
		if (!this.#queue.length && !this.#awarenessDirty) return
		this.#flushing = true
		const updates = this.#queue.splice(0)
		const sendAwareness = this.#awarenessDirty
		this.#awarenessDirty = false
		try {
			const response = await fetch(`${this.base()}/sync`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					client: this.client,
					update: updates.length
						? encode(Y.mergeUpdates(updates))
						: undefined,
					awareness: sendAwareness
						? encode(
								encodeAwarenessUpdate(this.awareness, [
									this.doc.clientID,
								])
							)
						: undefined,
				}),
				keepalive: true,
			})
			if (!response.ok) throw new Error(String(response.status))
		} catch {
			// Put them back; they go with the next flush or the next reconnect.
			this.#queue.unshift(...updates)
			this.#awarenessDirty ||= sendAwareness
			setTimeout(() => this.#schedule(0), 1500)
		} finally {
			this.#flushing = false
			this.pending = this.#queue.length > 0
			if (this.#queue.length || this.#awarenessDirty) this.#schedule()
		}
	}

	#leave = () => {
		removeAwarenessStates(this.awareness, [this.doc.clientID], "local")
		navigator.sendBeacon?.(
			`${this.base()}/sync`,
			new Blob(
				[
					JSON.stringify({
						client: this.client,
						awareness: encode(
							encodeAwarenessUpdate(this.awareness, [
								this.doc.clientID,
							])
						),
					}),
				],
				{ type: "application/json" }
			)
		)
	}

	destroy() {
		this.#leave()
		removeEventListener("pagehide", this.#leave)
		clearTimeout(this.#timer)
		this.#source?.close()
		this.awareness.destroy()
		this.doc.destroy()
	}
}
