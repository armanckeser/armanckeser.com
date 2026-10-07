import { execFile as execFileCb } from "node:child_process"
import { promisify } from "node:util"
import type { PostStatus } from "$lib/studio/types"
import { REPO_PATH } from "./store"

const execFile = promisify(execFileCb)

async function git(...args: string[]): Promise<string> {
	const { stdout } = await execFile("git", args, {
		cwd: REPO_PATH,
		maxBuffer: 16 * 1024 * 1024,
	})
	return stdout.trim()
}

/** Whether a post is only here, live as it is, or live with edits not yet published. */
export async function statusOf(
	path: string,
	published: boolean
): Promise<PostStatus> {
	const line = await git("status", "--porcelain", "--", path).catch(() => "")
	if (!published) return "draft"
	if (line.startsWith("??")) return "draft"
	return line ? "changed" : "published"
}

// One git operation at a time: two publishes racing would trip over the index.
let queue: Promise<unknown> = Promise.resolve()
function serial<T>(task: () => Promise<T>): Promise<T> {
	const run = queue.then(task, task)
	queue = run.catch(() => undefined)
	return run
}

/** Commits the given files and pushes them to main, which deploys the site. */
export function commitAndPush(
	paths: string[],
	message: string
): Promise<string> {
	return serial(async () => {
		await git("add", "--", ...paths)
		const staged = await git("diff", "--cached", "--name-only")
		if (staged) await git("commit", "-m", message, "--", ...paths)
		await git("pull", "--rebase", "--autostash").catch(() => "")
		await git("push", "origin", "HEAD:main")
		return git("rev-parse", "--short", "HEAD")
	})
}

/** Brings in what was pushed elsewhere: new components, posts edited in another clone. */
export function pull(): Promise<string> {
	return serial(() => git("pull", "--rebase", "--autostash"))
}

export function head(): Promise<string> {
	return git("log", "-1", "--format=%h %s")
}
