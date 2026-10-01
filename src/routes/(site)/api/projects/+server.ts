import { GH_PAT } from "$env/static/private"
import { type Project, actionOf, kindOf } from "$lib/projects"
import { Octokit } from "@octokit/rest"
import { json } from "@sveltejs/kit"
import { capitalCase } from "change-case"
import type { RequestHandler } from "./$types"

const OWNER = "armanckeser"
const COVER = "img/cover.png"
const PREVIEW = "img/hero.gif"

// capitalCase gets product names wrong ("Uscis", "Github"); these win.
const WORDS: Record<string, string> = {
	Uscis: "USCIS",
	Github: "GitHub",
	Youtube: "YouTube",
}

// These lead the list, in this order; everything else follows by most recent push.
const PINNED = ["kumbara", "wishlist"]

const rank = (name: string) => {
	const i = PINNED.indexOf(name)
	return i === -1 ? PINNED.length : i
}

const titleOf = (name: string) =>
	capitalCase(name)
		.split(" ")
		.map(w => WORDS[w] ?? w)
		.join(" ")

const raw = (repo: string, path: string) =>
	`https://raw.githubusercontent.com/${OWNER}/${repo}/HEAD/${path}`

/** Width and height from a PNG's IHDR chunk, so tiles reserve their space before the image loads. */
async function pngSize(src: string) {
	const res = await fetch(src, { headers: { Range: "bytes=0-31" } })
	if (!res.ok) return null
	const bytes = new DataView(await res.arrayBuffer())
	if (bytes.byteLength < 24) return null
	return { width: bytes.getUint32(16), height: bytes.getUint32(20) }
}

export const GET: RequestHandler = async () => {
	try {
		const octokit = new Octokit({ auth: GH_PAT })

		const { data: repos } =
			await octokit.rest.repos.listForAuthenticatedUser({
				type: "owner",
				sort: "pushed",
				direction: "desc",
				per_page: 100,
			})

		const projects = await Promise.all(
			repos
				// Private repositories only appear when a visitor has somewhere to go.
				.filter(
					repo =>
						!repo.fork &&
						!repo.archived &&
						repo.topics?.includes("portfolio") &&
						(!repo.private || repo.homepage)
				)
				.map(async (repo): Promise<Project> => {
					// Images are served straight from GitHub, which only works for public repositories.
					const files = repo.private
						? []
						: await octokit.rest.repos
								.getContent({
									owner: OWNER,
									repo: repo.name,
									path: "img",
								})
								.then(r =>
									Array.isArray(r.data)
										? r.data.map(f => f.path)
										: []
								)
								.catch(() => [])
					const coverSrc = files.includes(COVER)
						? raw(repo.name, COVER)
						: null
					const size = coverSrc ? await pngSize(coverSrc) : null
					return {
						name: repo.name,
						title: titleOf(repo.name),
						description: repo.description || "No description",
						kind: kindOf(repo.topics ?? [], repo.homepage || null),
						action: actionOf(repo.topics ?? [], repo.homepage || null),
						stars: repo.stargazers_count ?? 0,
						url: repo.private ? null : repo.html_url,
						homepage: repo.homepage || null,
						updated: repo.pushed_at ?? repo.updated_at ?? "",
						cover:
							coverSrc && size
								? { src: coverSrc, ...size }
								: null,
						preview: files.includes(PREVIEW)
							? raw(repo.name, PREVIEW)
							: null,
					}
				})
		)
		// The sort is stable, so unpinned projects keep GitHub's order.
		projects.sort((a, b) => rank(a.name) - rank(b.name))
		return json(projects, {
			headers: {
				"Cache-Control": "public, max-age=3600",
			},
		})
	} catch (error) {
		console.error("[Projects] GitHub API error:", error)
		return json(
			{
				error: "Failed to load projects",
				details:
					error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		)
	}
}
