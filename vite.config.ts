import { realpathSync } from "node:fs"
import { sveltekit } from "@sveltejs/kit/vite"
import { type Plugin, searchForWorkspaceRoot } from "vite"
import topLevelAwait from "vite-plugin-top-level-await"
import wasm from "vite-plugin-wasm"
import { defineConfig } from "vitest/config"

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
				const reload = payload as {
					type?: string
					triggeredBy?: string
				}
				// Only edits to posts: anything else (new dependencies, config)
				// really does need every page reloaded.
				if (
					reload?.type === "full-reload" &&
					/[\\/]src[\\/]content[\\/]/.test(reload.triggeredBy ?? "")
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
			// No hot reload, and no websocket at all, behind the home server's
			// proxy: it closes every connection after 30 seconds, and Vite answers
			// a dropped websocket by reloading the page, which would reload the
			// studio twice a minute.
			// The preview reloads itself out of sight after each save instead.
			// STUDIO_HMR=1 turns it back on (if the proxy's timeout is lifted).
			// Hot-reload bookkeeping stays on (it's what makes a new post's
			// file routable without a restart); only the websocket goes.
			hmr: { overlay: false },
			...(process.env.STUDIO_HMR === "1" ? {} : { ws: false as const }),
			warmup: {
				clientFiles: [
					"./src/routes/cms/**/*.svelte",
					"./src/routes/(site)/writing/**/*.svelte",
				],
			},
		}),
	},
	// Bundled up front, so opening the studio the first time doesn't stop to
	// re-optimize and reload.
	optimizeDeps: {
		include: [
			"yjs",
			"y-protocols/awareness",
			"y-codemirror.next",
			"@codemirror/state",
			"@codemirror/view",
			"@codemirror/commands",
			"@codemirror/language",
			"@codemirror/lang-markdown",
			"@lezer/highlight",
			"bits-ui",
			"lucide-svelte",
			"svelte-sonner",
			"mode-watcher",
			"clsx",
			"devalue",
			"style-to-object",
		],
	},
	test: {
		include: ["src/**/*.{test,spec}.{js,ts}"],
	},
})
