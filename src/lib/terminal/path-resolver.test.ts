import { describe, it, expect } from "vitest"
import type { RouteManifest } from "./types"
import { resolveTerminalPath, type PathResolutionResult } from "./path-resolver"

describe("path-resolver", () => {
	const testManifest: RouteManifest = {
		writing: {
			isPage: true,
			path: "/writing",
			children: {
				hooked: {
					isPage: true,
					path: "/writing/hooked",
					children: {},
				},
				adhd: {
					isPage: true,
					path: "/writing/adhd",
					children: {},
				},
			},
		},
		about: {
			isPage: true,
			path: "/about",
			children: {},
		},
	}

	describe("resolveTerminalPath", () => {
		it("should resolve absolute paths", () => {
			const result = resolveTerminalPath(
				"/writing",
				"/about",
				testManifest
			)
			expect(result.success).toBe(true)
			expect(result.resolvedPath).toBe("/about")
		})

		it("should resolve relative paths", () => {
			const result = resolveTerminalPath(
				"/writing",
				"hooked",
				testManifest
			)
			expect(result.success).toBe(true)
			expect(result.resolvedPath).toBe("/writing/hooked")
		})

		it("should handle parent directory navigation", () => {
			const result = resolveTerminalPath(
				"/writing/hooked",
				"..",
				testManifest
			)
			expect(result.success).toBe(true)
			expect(result.resolvedPath).toBe("/writing")
		})

		it("should handle home directory", () => {
			const result = resolveTerminalPath(
				"/writing/hooked",
				"~",
				testManifest
			)
			expect(result.success).toBe(true)
			expect(result.resolvedPath).toBe("/")
		})

		it("should handle multiple segments", () => {
			const result = resolveTerminalPath(
				"/",
				"writing/hooked",
				testManifest
			)
			expect(result.success).toBe(true)
			expect(result.resolvedPath).toBe("/writing/hooked")
		})

		it("should fail for invalid paths", () => {
			const result = resolveTerminalPath(
				"/writing",
				"nonexistent",
				testManifest
			)
			expect(result.success).toBe(false)
			expect(result.error?.code).toBe("PATH_NOT_FOUND")
		})

		it("should handle current directory", () => {
			const result = resolveTerminalPath("/writing", ".", testManifest)
			expect(result.success).toBe(true)
			expect(result.resolvedPath).toBe("/writing")
		})

		it("should handle complex navigation", () => {
			const result = resolveTerminalPath(
				"/writing/hooked",
				"../adhd",
				testManifest
			)
			expect(result.success).toBe(true)
			expect(result.resolvedPath).toBe("/writing/adhd")
		})

		it("should prevent navigation above root", () => {
			const result = resolveTerminalPath("/", "..", testManifest)
			expect(result.success).toBe(false)
			expect(result.error?.code).toBe("INVALID_PATH")
		})

		it("should handle trailing slashes", () => {
			const result = resolveTerminalPath(
				"/writing/",
				"/about/",
				testManifest
			)
			expect(result.success).toBe(true)
			expect(result.resolvedPath).toBe("/about")
		})
	})
})
