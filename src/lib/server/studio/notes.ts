/**
 * The notes repo: the private armanckeser.com-notes, cloned next to the site.
 * Notes save to their files as they're typed, like posts; this module turns
 * those files into commits. Once the notes have been quiet for a while it
 * commits, pulls whatever was pushed from elsewhere, and pushes.
 *
 * Only the folders the studio shows are ever staged. Nothing else in the repo
 * (finance/) is read or committed from here.
 */
import { execFile as execFileCb } from "node:child_process"
import { existsSync } from "node:fs"
import { mkdir } from "node:fs/promises"
import { dirname, join } from "node:path"
import { promisify } from "node:util"
import { NOTES_DIR, getRoom, isNote, loaded, onNoteWritten } from "./store"

const execFile = promisify(execFileCb)

const REPO = process.env.NOTES_REPO || "armanckeser/armanckeser.com-notes"
const TOKEN = process.env.GH_PAT || process.env.GITHUB_TOKEN
/** Commits and pushes on its own only on the home server, never from a laptop's dev server. */
const AUTO = process.env.STUDIO === "1"
const QUIET_MS = 45_000
const PULL_EVERY_MS = 3 * 60_000
// ":(glob)" so "*.md" means the top level only, not finance/*.md.
const STAGED = [":(glob)*.md", ":(glob)drafts/**", ":(glob)research/**"]

export type NotesSync = {
	available: boolean
	auto: boolean
	lastSync: string | null
	pending: boolean
	error: string | null
}

type State = NotesSync & {
	timer?: ReturnType<typeof setTimeout>
	interval?: ReturnType<typeof setInterval>
	queue: Promise<unknown>
	cloning?: Promise<boolean>
}

const g = globalThis as typeof globalThis & { __studioNotes?: State }
const state: State = (g.__studioNotes ??= {
	available: false,
	auto: AUTO,
	lastSync: null,
	pending: false,
	error: null,
	queue: Promise.resolve(),
})

async function git(...args: string[]): Promise<string> {
	const { stdout } = await execFile("git", args, {
		cwd: NOTES_DIR,
		maxBuffer: 16 * 1024 * 1024,
	})
	return stdout.trim()
}

function serial<T>(task: () => Promise<T>): Promise<T> {
	const run = state.queue.then(task, task)
	state.queue = run.catch(() => undefined)
	return run
}

/** Clones the notes repo the first time it's needed (on the home server). */
export function ensureNotes(): Promise<boolean> {
	if (existsSync(join(NOTES_DIR, ".git"))) {
		state.available = true
		startPulling()
		return Promise.resolve(true)
	}
	if (!TOKEN) return Promise.resolve(false)
	state.cloning ??= (async () => {
		try {
			await mkdir(dirname(NOTES_DIR), { recursive: true })
			await execFile("git", [
				"clone",
				"-q",
				`https://x-access-token:${TOKEN}@github.com/${REPO}.git`,
				NOTES_DIR,
			])
			await git(
				"config",
				"user.name",
				process.env.GIT_USER_NAME || "Armanc Keser"
			)
			await git(
				"config",
				"user.email",
				process.env.GIT_USER_EMAIL || "cms@armanckeser.com"
			)
			state.available = true
			state.lastSync = new Date().toISOString()
			startPulling()
			return true
		} catch (e) {
			state.error = `Couldn't clone the notes: ${String((e as Error).message).replace(/x-access-token:[^@]+@/, "")}`
			return false
		} finally {
			state.cloning = undefined
		}
	})()
	return state.cloning
}

/** A note's file changed: sync once things go quiet. */
export function noteWritten() {
	state.pending = true
	if (!AUTO) return
	clearTimeout(state.timer)
	state.timer = setTimeout(() => void syncNotes(), QUIET_MS)
}

function startPulling() {
	if (!AUTO || state.interval) return
	state.interval = setInterval(() => {
		// Never in the middle of someone's typing; the quiet sync pulls too.
		if (!state.pending) void syncNotes()
	}, PULL_EVERY_MS)
}

/** Commits what changed here, takes in what was pushed elsewhere, and pushes. */
export function syncNotes(message?: string): Promise<NotesSync> {
	return serial(async () => {
		if (!(await ensureNotes())) return status()
		clearTimeout(state.timer)
		try {
			await git("add", "-A", "--", ...STAGED)
			const staged = await git("diff", "--cached", "--name-only")
			if (staged) {
				const files = staged
					.split("\n")
					.map(f => f.replace(/\.(md|svx)$/, ""))
				await git(
					"commit",
					"-q",
					"-m",
					message ||
						`Studio: ${files.slice(0, 3).join(", ")}${files.length > 3 ? ` and ${files.length - 3} more` : ""}`
				)
			}
			const before = await git("rev-parse", "HEAD")
			await git("pull", "-q", "--rebase", "--autostash")
			if (
				staged ||
				(await git("rev-list", "--count", "@{u}..HEAD")) !== "0"
			) {
				await git("push", "-q")
			}
			// Pulled changes reach the open editors.
			if ((await git("rev-parse", "HEAD")) !== before) {
				for (const room of loaded())
					if (isNote(room.slug)) await getRoom(room.slug)
			}
			state.pending = false
			state.error = null
			state.lastSync = new Date().toISOString()
		} catch (e) {
			await git("rebase", "--abort").catch(() => "")
			state.error = String(
				(e as { stderr?: string }).stderr || (e as Error).message
			)
				.replace(/x-access-token:[^@]+@/, "")
				.trim()
				.slice(0, 300)
		}
		return status()
	})
}

export function status(): NotesSync {
	const { available, auto, lastSync, pending, error } = state
	return { available, auto, lastSync, pending, error }
}

/** Removes a note's file; the next sync commits the deletion. */
export async function removeNoteFile(path: string) {
	const { rm } = await import("node:fs/promises")
	await rm(path, { force: true })
	noteWritten()
}

onNoteWritten(noteWritten)
