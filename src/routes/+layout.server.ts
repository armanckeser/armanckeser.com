import {
	generateRouteManifest,
	validateRouteManifest,
} from "$lib/terminal/route-manifest"
import type { LayoutServerLoad } from "./$types"

export const prerender = true

export const load: LayoutServerLoad = () => {
	const routeManifest = generateRouteManifest()

	// Validate manifest during development
	if (process.env.NODE_ENV === "development") {
		validateRouteManifest(routeManifest)
	}

	return {
		routeManifest,
	}
}
