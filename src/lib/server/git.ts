import { execFile as execFileCb } from "node:child_process"
import { promisify } from "node:util"

const execFile = promisify(execFileCb)

function getRepoPath(): string {
	return process.env.REPO_PATH || process.cwd()
}

async function git(
	...args: string[]
): Promise<{ stdout: string; stderr: string }> {
	return execFile("git", args, { cwd: getRepoPath() })
}

export async function gitStatus(): Promise<string> {
	const { stdout } = await git("status", "--porcelain")
	return stdout
}

export async function gitPull(): Promise<string> {
	const { stdout } = await git("pull", "--rebase")
	return stdout
}

export async function gitAdd(files: string[]): Promise<void> {
	await git("add", ...files)
}

export async function gitCommit(message: string): Promise<void> {
	await git("commit", "-m", message)
}

export async function gitPush(): Promise<void> {
	await git("push")
}

export async function publishPost(
	filePath: string,
	commitMessage: string
): Promise<void> {
	await gitAdd([filePath])
	await gitCommit(commitMessage)
	await gitPush()
}

export async function deleteAndPush(
	filePath: string,
	commitMessage: string
): Promise<void> {
	await gitAdd([filePath])
	await gitCommit(commitMessage)
	await gitPush()
}

export async function triggerDeploy(token: string): Promise<void> {
	const response = await fetch(
		"https://api.github.com/repos/armanckeser/armanckeser.com/actions/workflows/deploy-pages.yml/dispatches",
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: "application/vnd.github.v3+json",
			},
			body: JSON.stringify({ ref: "main" }),
		}
	)

	if (!response.ok) {
		const text = await response.text()
		throw new Error(`Failed to trigger deploy: ${response.status} ${text}`)
	}
}
