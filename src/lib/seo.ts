import * as config from "$lib/config"
import type { BlogPost } from "../types"

type JsonLdNode = Record<string, unknown>

/**
 * Turn a site-relative path into an absolute URL.
 *
 * Canonical links, og:url, sitemap entries and JSON-LD identifiers all have to
 * be absolute: Google supports relative canonicals but explicitly recommends
 * against them, and a relative og:url is simply ignored by scrapers.
 */
export function absoluteUrl(path: string): string {
	if (path.startsWith("http://") || path.startsWith("https://")) return path
	const withLeadingSlash = path.startsWith("/") ? path : `/${path}`
	return `${config.url}${withLeadingSlash}`
}

/** Escape the five XML entities so titles survive RSS and sitemap output. */
export function escapeXml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;")
}

/**
 * Serialize a JSON-LD node for inlining in a script tag.
 *
 * `<` is escaped so a `</script>` sequence inside any string value cannot close
 * the surrounding script element.
 */
export function serializeJsonLd(node: JsonLdNode): string {
	return JSON.stringify(node).replace(/</g, "\\u003c")
}

/** Truncate a description to the pixel-safe meta description range. */
export function clampDescription(value: string, maxLength = 160): string {
	if (value.length <= maxLength) return value
	const cut = value.slice(0, maxLength - 1)
	const lastSpace = cut.lastIndexOf(" ")
	return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}

/** The site author as a schema.org Person, used as author and publisher. */
export function personNode(): JsonLdNode {
	return {
		"@type": "Person",
		name: config.author,
		url: config.url,
		sameAs: config.profiles,
	}
}

export function personJsonLd(): JsonLdNode {
	return {
		"@context": "https://schema.org",
		...personNode(),
		"@id": `${config.url}#person`,
	}
}

export function websiteJsonLd(): JsonLdNode {
	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		"@id": `${config.url}#website`,
		name: config.title,
		url: config.url,
		description: config.description,
		inLanguage: "en",
		author: personNode(),
	}
}

/**
 * BlogPosting node for a single post.
 *
 * `dateModified` defaults to the publication date: the site has no per-file
 * modification tracking, and a fabricated newer date erodes crawler trust.
 */
export function blogPostingJsonLd(post: BlogPost): JsonLdNode {
	const canonical = absoluteUrl(post.slug)
	return {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: post.title,
		description: post.description ?? config.description,
		url: canonical,
		mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
		datePublished: post.date,
		dateModified: post.date,
		image: absoluteUrl(config.ogImage),
		author: personNode(),
		publisher: personNode(),
		inLanguage: "en",
		keywords: post.tags?.join(", "),
		isPartOf: { "@type": "Blog", "@id": absoluteUrl("/writing") },
	}
}

/** Blog node for the writing index, listing every visible post. */
export function blogJsonLd(posts: BlogPost[]): JsonLdNode {
	return {
		"@context": "https://schema.org",
		"@type": "Blog",
		"@id": absoluteUrl("/writing"),
		url: absoluteUrl("/writing"),
		name: `${config.author} - writing`,
		description: config.description,
		inLanguage: "en",
		author: personNode(),
		blogPost: posts.map(post => ({
			"@type": "BlogPosting",
			headline: post.title,
			description: post.description,
			url: absoluteUrl(post.slug),
			datePublished: post.date,
		})),
	}
}

export function breadcrumbJsonLd(
	trail: Array<{ name: string; path: string }>
): JsonLdNode {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: trail.map((entry, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: entry.name,
			item: absoluteUrl(entry.path),
		})),
	}
}
