import { realpathSync } from "node:fs"
import { sveltekit } from "@sveltejs/kit/vite"
import { searchForWorkspaceRoot } from "vite"
import { defineConfig } from "vitest/config"
import topLevelAwait from "vite-plugin-top-level-await"
import wasm from "vite-plugin-wasm"

// The studio on the home server runs this dev server against a clone of the
// repo, behind a reverse proxy, with node_modules linked in from the image.
const studio = process.env.STUDIO === "1"

function linkedModules(): string[] {
	try {
		return [realpathSync("node_modules")]
	} catch {
		return []
	}
}

export default defineConfig({
	plugins: [wasm(), topLevelAwait(), sveltekit()],
	server: {
		fs: {
			allow: [searchForWorkspaceRoot(process.cwd()), ...linkedModules()],
		},
		...(studio && {
			host: "0.0.0.0",
			allowedHosts: true,
			// Writing a draft triggers a reload; the studio shows its own errors.
			hmr: { overlay: false },
			warmup: {
				clientFiles: [
					"./src/routes/cms/**/*.svelte",
					"./src/routes/(site)/writing/**/*.svelte",
				],
			},
		}),
	},
	test: {
		include: ["src/**/*.{test,spec}.{js,ts}"],
	},
})
