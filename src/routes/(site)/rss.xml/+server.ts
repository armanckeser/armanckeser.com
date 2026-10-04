import * as config from "$lib/config"
import { getPosts } from "$lib/posts"
import { absoluteUrl, escapeXml } from "$lib/seo"
import { feedHtml } from "$lib/server/feed-html"
import { listPosts } from "$lib/server/posts"
import type { BlogPost } from "../../../types"

export const prerender = true

function toItem(post: BlogPost, body: string): string {
	const link = absoluteUrl(post.slug)
	const categories = (post.tags ?? [])
		.map(tag => `\n\t\t\t<category>${escapeXml(tag)}</category>`)
		.join("")

	return `\t\t<item>
			<title>${escapeXml(post.title)}</title>
			<description>${escapeXml(post.description ?? "")}</description>
			<content:encoded><![CDATA[${body.replaceAll("]]>", "]]]]><![CDATA[>")}]]></content:encoded>
			<link>${escapeXml(link)}</link>
			<guid isPermaLink="true">${escapeXml(link)}</guid>
			<pubDate>${new Date(post.date).toUTCString()}</pubDate>${categories}
		</item>`
}

export async function GET() {
	const posts = getPosts()
	// Full text for feed readers, from the markdown source (see feed-html.ts).
	const sources = new Map((await listPosts()).map(p => [p.slug, p.content]))
	const bodies = await Promise.all(
		posts.map(post => {
			const file = post.slug.split("/").pop() ?? ""
			return feedHtml(sources.get(file) ?? "", absoluteUrl(post.slug))
		})
	)
	const latest = posts.at(0)
	const lastBuildDate = latest
		? `\t\t<lastBuildDate>${new Date(latest.date).toUTCString()}</lastBuildDate>\n`
		: ""

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" version="2.0">
	<channel>
		<title>${escapeXml(config.title)}</title>
		<description>${escapeXml(config.description)}</description>
		<link>${config.url}</link>
		<language>${config.language}</language>
		<atom:link href="${config.url}/rss.xml" rel="self" type="application/rss+xml"/>
${lastBuildDate}${posts.map((post, i) => toItem(post, bodies[i])).join("\n")}
	</channel>
</rss>
`

	return new Response(xml, {
		headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
	})
}
