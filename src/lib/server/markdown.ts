import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeSlug from "rehype-slug"
import rehypeStringify from "rehype-stringify"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import remarkToc from "remark-toc"
import { unified } from "unified"

const processor = unified()
	.use(remarkParse)
	.use(remarkGfm)
	.use(remarkToc, { tight: true })
	.use(remarkRehype)
	.use(rehypeSlug)
	.use(rehypeAutolinkHeadings, {
		behavior: "append",
		content: {
			type: "element",
			tagName: "span",
			properties: { className: ["anchor-link"] },
			children: [{ type: "text", value: " #" }],
		},
	})
	.use(rehypeStringify)

export async function renderMarkdown(source: string): Promise<string> {
	const result = await processor.process(source)
	return String(result)
}
