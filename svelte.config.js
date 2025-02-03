import adapter from "@sveltejs/adapter-static"
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte"
import { mdsvex } from "mdsvex"

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	extensions: [".svelte", ".svx", ".md"],
	preprocess: [
		vitePreprocess(),
		mdsvex({
			extensions: [".svx", ".md"],
			layout: {
				writing: "src/routes/writing/_layout.svelte",
			},
		}),
	],

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),
		paths: {
			base:
				process.env.NODE_ENV === "production"
					? "/sveltekit-github-pages"
					: "",
		},
	},
}

export default config
