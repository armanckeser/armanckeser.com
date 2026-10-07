import { realpathSync } from "node:fs"
import { sveltekit } from "@sveltejs/kit/vite"
import { type Plugin, searchForWorkspaceRoot } from "vite"
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

/**
 * In development a change that can't hot-swap reloads every open page. The
 * studio keeps its editor open across those: full reloads become a custom
 * event that only the site's own pages (the preview inside the studio) act on.
 * See the `studio:reload` listener in the (site) layout.
 */
function keepStudioOpen(): Plugin {
	return {
		name: "studio-keep-open",
		apply: "serve",
		configureServer(server) {
			const hot = server.environments?.client?.hot ?? server.ws
			const send = hot.send.bind(hot) as (...args: unknown[]) => void
			hot.send = ((...args: unknown[]) => {
				const [payload] = args
				if (
					payload &&
					typeof payload === "object" &&
					(payload as { type?: string }).type === "full-reload"
				) {
					return send({
						type: "custom",
						event: "studio:reload",
						data: payload,
					})
				}
				return send(...args)
			}) as typeof hot.send
		},
	}
}

export default defineConfig({
	plugins: [wasm(), topLevelAwait(), sveltekit(), keepStudioOpen()],
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
