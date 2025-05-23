import adapter from "@sveltejs/adapter-static"
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte"
import { mdsvex } from "mdsvex"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeSlug from "rehype-slug"
import remarkToc from "remark-toc"

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	extensions: [".svelte", ".svx", ".md"],
	preprocess: [
		vitePreprocess(),
		mdsvex({
			extensions: [".svx", ".md"],
			remarkPlugins: [[remarkToc, { tight: true }]],
			rehypePlugins: [
				rehypeSlug,
				[
					rehypeAutolinkHeadings,
					{
						behavior: "append",
						content: {
							type: "element",
							tagName: "span",
							properties: { className: ["anchor-link"] },
							children: [{ type: "text", value: " #" }],
						},
					},
				],
			],
		}),
	],

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),
	},
}

export default config
