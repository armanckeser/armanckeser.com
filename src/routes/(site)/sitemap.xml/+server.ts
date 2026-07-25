import { getPosts } from "$lib/posts"
import { absoluteUrl, escapeXml } from "$lib/seo"

export const prerender = true

/** Pages that are not posts. `lastmod` is omitted rather than faked. */
const STATIC_PATHS = ["/", "/writing", "/privacy", "/terms"]

type SitemapEntry = { path: string; lastmod?: string }

function toUrlElement(entry: SitemapEntry): string {
	const lastmod = entry.lastmod
		? `\n\t\t<lastmod>${escapeXml(entry.lastmod)}</lastmod>`
		: ""
	return `\t<url>\n\t\t<loc>${escapeXml(absoluteUrl(entry.path))}</loc>${lastmod}\n\t</url>`
}

export async function GET() {
	const entries: SitemapEntry[] = [
		...STATIC_PATHS.map(path => ({ path })),
		...getPosts().map(post => ({ path: post.slug, lastmod: post.date })),
	]

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(toUrlElement).join("\n")}
</urlset>
`

	return new Response(xml, {
		headers: { "Content-Type": "application/xml; charset=utf-8" },
	})
}
