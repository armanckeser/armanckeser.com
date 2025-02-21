import { GITHUB_TOKEN } from "$env/static/private"
import { Octokit } from "@octokit/rest"
import { json } from "@sveltejs/kit"
import { capitalCase } from "change-case"
import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async () => {
	try {
		const octokit = new Octokit({ auth: GITHUB_TOKEN })

		const { data: repos } = await octokit.rest.repos.listForUser({
			username: "armanckeser",
			type: "owner",
			sort: "updated",
			direction: "desc",
			per_page: 100,
		})

		const projects = repos
			.filter(
				repo =>
					!repo.fork &&
					!repo.archived &&
					repo.topics?.[0] === "portfolio"
			)
			.map(repo => ({
				title: capitalCase(repo.name),
				description: repo.description || "No description",
				tag: repo.topics?.[0] || "app",
				stars: repo.stargazers_count,
				url: repo.html_url,
				updated: repo.updated_at,
				language: repo.language,
				has_demo: !!repo.homepage,
			}))
			.sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0))

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
