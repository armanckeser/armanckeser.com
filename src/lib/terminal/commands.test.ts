import { describe, it, expect, vi, beforeEach } from "vitest"
import { createCommandSystem } from "./commands"
import type { RouteManifest } from "./types"

// Mock $app/navigation
vi.mock("$app/navigation", () => ({
	goto: vi.fn(() => Promise.resolve()),
}))

// Mock window.location
const mockWindow = {
	location: {
		pathname: "/writing",
	},
}

vi.stubGlobal("window", mockWindow)

describe("command-system", () => {
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
			},
		},
	}

	beforeEach(() => {
		mockWindow.location.pathname = "/writing"
	})

	describe("cd command", () => {
		it("should change directory successfully", async () => {
			const system = createCommandSystem(testManifest)
			const result = await system.execute("cd hooked")

			expect(result.success).toBe(true)
			expect(result.message).toBe("Changed directory to /writing/hooked")
		})

		it("should handle invalid paths", async () => {
			const system = createCommandSystem(testManifest)
			const result = await system.execute("cd nonexistent")

			expect(result.success).toBe(false)
			expect(result.error?.code).toBe("PATH_NOT_FOUND")
		})

		it("should handle home directory", async () => {
			const system = createCommandSystem(testManifest)
			const result = await system.execute("cd ~")

			expect(result.success).toBe(true)
			expect(result.message).toBe("Changed directory to /")
		})
	})

	describe("command system", () => {
		it("should handle unknown commands", async () => {
			const system = createCommandSystem(testManifest)
			const result = await system.execute("unknown")

			expect(result.success).toBe(false)
			expect(result.error?.code).toBe("COMMAND_NOT_FOUND")
		})

		it("should provide help text", () => {
			const system = createCommandSystem(testManifest)
			const help = system.getHelp("cd")

			expect(help).toBe("Change the current directory. Usage: cd [path]")
		})
	})
})
