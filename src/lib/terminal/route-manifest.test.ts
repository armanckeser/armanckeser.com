import { describe, it, expect, vi } from "vitest"
import { generateRouteManifest, getAllPaths } from "./route-manifest"
import type { RouteManifest } from "./types"

describe("route-manifest", () => {
	// Mock Vite's import.meta.glob
	vi.mock("import.meta.glob", () => ({
		default: () => ({
			"/src/routes/+page.svelte": {},
			"/src/routes/writing/+page.svelte": {},
			"/src/routes/writing/[slug]/+page.svelte": {},
		}),
	}))

	describe("generateRouteManifest", () => {
		it("should generate correct manifest structure", () => {
			const manifest = generateRouteManifest()

			expect(manifest).toMatchObject({
				writing: {
					isPage: true,
					path: "/writing",
					children: {
						slug: {
							isPage: true,
							path: "/writing/slug",
							params: ["slug"],
							children: {},
						},
					},
				},
			})
		})

		it("should handle dynamic route parameters", () => {
			const manifest = generateRouteManifest()
			const slugNode = manifest.writing?.children?.slug
			expect(slugNode?.params).toEqual(["slug"])
			expect(slugNode?.isPage).toBe(true)
			expect(slugNode?.path).toBe("/writing/slug")
		})
	})

	describe("getAllPaths", () => {
		it("should return all valid paths", () => {
			const manifest: RouteManifest = {
				writing: {
					isPage: true,
					path: "/writing",
					children: {
						slug: {
							isPage: true,
							path: "/writing/slug",
							params: ["slug"],
							children: {},
						},
					},
				},
			}

			const paths = getAllPaths(manifest)
			expect(paths).toEqual(["/writing", "/writing/slug"])
		})
	})
})
