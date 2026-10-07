import { building } from "$app/environment"
import { env } from "$env/dynamic/private"
import { problem } from "$lib/server/studio/problem"
import type { Handle } from "@sveltejs/kit"

/**
 * The studio is reachable only on the tailnet. If CMS_TOKEN is set it also
 * wants a token: a `cms_token` cookie (set by visiting any studio page with
 * ?token=…) or `Authorization: Bearer …` from the agent.
 */
export const handle: Handle = async ({ event, resolve }) => {
	// Never while prerendering the public site: the studio isn't part of it.
	const required =
		!building && event.url.pathname.startsWith("/cms")
			? env.CMS_TOKEN
			: undefined
	if (required) {
		const fromQuery = event.url.searchParams.get("token")
		const bearer = event.request.headers
			.get("authorization")
			?.replace(/^Bearer\s+/i, "")
		const given = bearer || fromQuery || event.cookies.get("cms_token")
		if (given !== required) problem(401, "Unauthorized")
		if (fromQuery) {
			event.cookies.set("cms_token", fromQuery, {
				path: "/",
				httpOnly: true,
				sameSite: "strict",
				maxAge: 60 * 60 * 24 * 365,
			})
		}
	}
	return resolve(event)
}
