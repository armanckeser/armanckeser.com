import type { RouteManifest } from "./types"

export type PathResolutionResult = {
	success: boolean
	resolvedPath?: string
	error?: {
		code: string
		message: string
	}
}

/**
 * Resolves a terminal path command to a valid route path
 * @param currentPath The current path in the terminal
 * @param targetPath The path to resolve (can be absolute or relative)
 * @param manifest The route manifest to validate against
 */
export function resolveTerminalPath(
	currentPath: string,
	targetPath: string,
	manifest: RouteManifest
): PathResolutionResult {
	// Normalize paths by removing trailing slashes
	currentPath = currentPath.replace(/\/$/, "")
	targetPath = targetPath.replace(/\/$/, "")

	// Handle special paths
	if (targetPath === "~" || targetPath === "/home") {
		return { success: true, resolvedPath: "/" }
	}

	if (targetPath === ".") {
		return { success: true, resolvedPath: currentPath }
	}

	// Split paths into segments
	const isAbsolute = targetPath.startsWith("/")
	const base = isAbsolute
		? []
		: currentPath === "/"
			? []
			: currentPath.split("/").filter(Boolean)
	const segments = targetPath.split("/").filter(Boolean)

	// Process path segments
	const resolvedSegments = segments.reduce<string[] | null>(
		(acc, segment) => {
			if (acc === null) return null
			if (segment === "..") {
				return acc.length === 0 ? null : acc.slice(0, -1)
			}
			if (segment === ".") {
				return acc
			}
			return [...acc, segment]
		},
		base
	)

	// Check if we tried to go above root
	if (resolvedSegments === null) {
		return {
			success: false,
			error: {
				code: "INVALID_PATH",
				message: "Cannot navigate above root directory",
			},
		}
	}

	// Build the resolved path
	const resolvedPath = "/" + resolvedSegments.join("/")

	// Validate the path exists in the manifest
	if (!isValidPath(resolvedPath, manifest)) {
		return {
			success: false,
			error: {
				code: "PATH_NOT_FOUND",
				message: `Path "${resolvedPath}" does not exist`,
			},
		}
	}

	return { success: true, resolvedPath }
}

/**
 * Checks if a path exists in the route manifest
 */
function isValidPath(path: string, manifest: RouteManifest): boolean {
	if (path === "/") return true

	const segments = path.split("/").filter(Boolean)
	let current = manifest

	for (const segment of segments) {
		if (!current[segment]) {
			return false
		}
		current = current[segment].children
	}

	return true
}
