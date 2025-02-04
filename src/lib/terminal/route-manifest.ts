import type { RouteManifest } from "./types"

type GlobResult = Record<string, unknown>

/**
 * Generates a route manifest by analyzing the SvelteKit route structure.
 * This runs at build time to create a map of all available routes.
 */
export function generateRouteManifest(): RouteManifest {
	// Import all page components using Vite's glob import
	const routes = import.meta.glob("/src/routes/**/+page.svelte", {
		eager: true,
	}) as GlobResult
	const manifest: RouteManifest = {}

	for (const path in routes) {
		// Convert route path to segments, removing src/routes and +page.svelte
		const routePath = path
			.replace(/\/src\/routes|(\+page\.svelte$)/g, "")
			.replace(/\[([^\]]+)\]/g, (_, param) => param) // Convert [slug] to slug for params
			.split("/")
			.filter(Boolean)

		let current = manifest
		let parentPath = ""

		// Build the path structure
		for (let i = 0; i < routePath.length; i++) {
			const segment = routePath[i]
			const isLastSegment = i === routePath.length - 1
			parentPath = parentPath ? `${parentPath}/${segment}` : segment

			if (!current[segment]) {
				const isParam = path.includes(`[${segment}]`)
				current[segment] = {
					isPage: isLastSegment,
					children: {},
					params: isParam ? [segment] : undefined,
					path: "/" + parentPath,
				}
			} else if (isLastSegment) {
				current[segment].isPage = true
				current[segment].path = "/" + parentPath
			}

			current = current[segment].children
		}
	}

	return manifest
}

/**
 * Validates a route manifest to ensure all paths are properly structured.
 * Useful for catching build-time issues.
 */
export function validateRouteManifest(manifest: RouteManifest): void {
	function validateNode(node: RouteManifest[string], path: string[]): void {
		if (node.isPage && node.path !== "/" + path.join("/")) {
			console.warn(
				`Path mismatch at ${path.join("/")}: expected ${node.path}`
			)
		}

		for (const [key, child] of Object.entries(node.children)) {
			validateNode(child, [...path, key])
		}
	}

	for (const [key, node] of Object.entries(manifest)) {
		validateNode(node, [key])
	}
}

/**
 * Gets all available paths from a route manifest.
 * Useful for debugging and testing.
 */
export function getAllPaths(manifest: RouteManifest): string[] {
	const paths: string[] = []

	function traverse(node: RouteManifest[string], path: string[]): void {
		if (node.isPage) {
			paths.push(node.path)
		}

		for (const [key, child] of Object.entries(node.children)) {
			traverse(child, [...path, key])
		}
	}

	for (const [key, node] of Object.entries(manifest)) {
		traverse(node, [key])
	}

	return paths
}
