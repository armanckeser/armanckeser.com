import * as config from "$lib/config"
import rehypeStringify from "rehype-stringify"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"

/**
 * A post's body as plain HTML for the RSS feed. Built from the markdown, not the
 * rendered page: interactive figures can't run in a feed reader, so each one
 * becomes a single line linking to the post, and wrapper components (Story)
 * keep their prose.
 */

// Components that render nothing a reader would miss (scroll markers).
const invisible = new Set(["Step"])

export async function feedHtml(
	markdown: string,
	link: string
): Promise<string> {
	const figure = `\n\n<p><em><a href="${link}">Interactive figure: open the post to see it.</a></em></p>\n\n`
	let body = markdown
		.replace(/<script[\s\S]*?<\/script>/g, "")
		// Self-closing components: figures become a link, markers disappear.
		.replace(/<([A-Z]\w*)\b[^>]*\/>/g, (_, name) =>
			invisible.has(name) ? "" : figure
		)
		// Wrapper components keep what's inside them.
		.replace(/<\/?[A-Z]\w*\b[^>]*>/g, "")
	// Several figures in a row read as one gap.
	while (body.includes(figure + figure))
		body = body.replace(figure + figure, figure)

	const html = String(
		await unified()
			.use(remarkParse)
			.use(remarkGfm)
			.use(remarkRehype, { allowDangerousHtml: true })
			.use(rehypeStringify, { allowDangerousHtml: true })
			.process(body)
	)
	// Feed readers resolve nothing against the site.
	return html.replace(/(href|src)="\/(?!\/)/g, `$1="${config.url}/`)
}
