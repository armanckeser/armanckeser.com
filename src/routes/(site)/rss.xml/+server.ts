import * as config from "$lib/config"
import { getPosts } from "$lib/posts"
import { absoluteUrl, escapeXml } from "$lib/seo"
import type { BlogPost } from "../../../types"

export const prerender = true

function toItem(post: BlogPost): string {
	const link = absoluteUrl(post.slug)
	const categories = (post.tags ?? [])
		.map(tag => `\n\t\t\t<category>${escapeXml(tag)}</category>`)
		.join("")

	return `\t\t<item>
			<title>${escapeXml(post.title)}</title>
			<description>${escapeXml(post.description ?? "")}</description>
			<link>${escapeXml(link)}</link>
			<guid isPermaLink="true">${escapeXml(link)}</guid>
			<pubDate>${new Date(post.date).toUTCString()}</pubDate>${categories}
		</item>`
}

export async function GET() {
	const posts = getPosts()
	const latest = posts.at(0)
	const lastBuildDate = latest
		? `\t\t<lastBuildDate>${new Date(latest.date).toUTCString()}</lastBuildDate>\n`
		: ""

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
	<channel>
		<title>${escapeXml(config.title)}</title>
		<description>${escapeXml(config.description)}</description>
		<link>${config.url}</link>
		<language>${config.language}</language>
		<atom:link href="${config.url}/rss.xml" rel="self" type="application/rss+xml"/>
${lastBuildDate}${posts.map(toItem).join("\n")}
	</channel>
</rss>
`

	return new Response(xml, {
		headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
	})
}
