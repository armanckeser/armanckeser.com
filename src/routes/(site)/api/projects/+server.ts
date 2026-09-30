import { GH_PAT } from "$env/static/private"
import { Octokit } from "@octokit/rest"
import { json } from "@sveltejs/kit"
import { capitalCase } from "change-case"
import type { RequestHandler } from "./$types"

// capitalCase gets product names wrong ("Uscis", "Github"); these win.
const WORDS: Record<string, string> = {
	Uscis: "USCIS",
	Github: "GitHub",
	Youtube: "YouTube",
}

const titleOf = (name: string) =>
	capitalCase(name)
		.split(" ")
		.map(w => WORDS[w] ?? w)
		.join(" ")

/**
 * A repository is a project when it carries the `portfolio` topic. Private
 * repositories only appear when they have a homepage, since a visitor cannot
 * open the repository itself.
 */
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
		const projects = repos
			.filter(
				repo =>
					!repo.fork &&
					!repo.archived &&
					repo.topics?.includes("portfolio") &&
					(!repo.private || repo.homepage)
			)
			.map(repo => ({
				title: titleOf(repo.name),
				description: repo.description || "No description",
				stars: repo.stargazers_count,
				url: repo.private ? null : repo.html_url,
				updated: repo.pushed_at ?? repo.updated_at,
				language: repo.language,
				homepage: repo.homepage || null,
			}))
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
