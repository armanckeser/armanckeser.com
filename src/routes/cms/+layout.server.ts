import { env } from "$env/dynamic/private"
import { error } from "@sveltejs/kit"
import type { LayoutServerLoad } from "./$types"

export const prerender = false

export const load: LayoutServerLoad = ({ cookies, url }) => {
	const requiredToken = env.CMS_TOKEN
	if (!requiredToken) return {}

	const providedToken =
		cookies.get("cms_token") || url.searchParams.get("token")
	if (providedToken !== requiredToken) {
		throw error(401)
	}
}
