import adapterNode from "@sveltejs/adapter-node"
import adapterStatic from "@sveltejs/adapter-static"
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte"
import { mdsvex } from "mdsvex"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeSlug from "rehype-slug"
import remarkToc from "remark-toc"

const isCmsMode = process.env.BUILD_MODE === "cms"

/** @type {import('@sveltejs/kit').Config} */
const config = {
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
		adapter: isCmsMode ? adapterNode() : adapterStatic(),
	},
}

export default config
