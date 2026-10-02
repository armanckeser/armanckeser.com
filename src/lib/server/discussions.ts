import { url as siteUrl } from "$lib/config"

/**
 * Finds the threads on Hacker News and Lobsters that link to this site, so a
 * post can point readers at the conversation happening elsewhere. Both sites
 * publish their listings as JSON without a key: HN through Algolia's search,
 * Lobsters through its per-domain page. Each is asked once for every link to
 * the domain, and the threads are matched to posts by path.
 */

export type Discussion = {
	site: "Hacker News" | "Lobsters"
	/** The thread itself, not the submitted link. */
	href: string
	title: string
	points: number
	comments: number
	/** When it was submitted, as an ISO timestamp. */
	date: string
}

/** A thread as found, with the path on this site that it links to. */
export type Found = Discussion & { path: string }

const host = new URL(siteUrl).hostname

/**
 * The path a link points at on this site, or null if it points elsewhere.
 * Submitters add "www.", trailing slashes, query strings and anchors; none of
 * those make it a different post.
 */
export function pathOn(link: string): string | null {
	let parsed: URL
	try {
		parsed = new URL(link)
	} catch {
		return null
	}
	if (parsed.hostname.replace(/^www\./, "") !== host) return null
	return parsed.pathname.replace(/\/+$/, "") || "/"
}

type HnHit = {
	objectID: string
	title?: string
	url?: string | null
	points?: number | null
	num_comments?: number | null
	created_at?: string
}

/** Stories from an Algolia HN search, keyed by the path they link to. */
export function parseHackerNews(body: { hits?: HnHit[] }): Found[] {
	return (body.hits ?? []).flatMap((hit): Found[] => {
		const path = hit.url ? pathOn(hit.url) : null
		if (!path) return []
		return [
			{
				site: "Hacker News",
				href: `https://news.ycombinator.com/item?id=${hit.objectID}`,
				title: hit.title ?? "",
				points: hit.points ?? 0,
				comments: hit.num_comments ?? 0,
				date: hit.created_at ?? "",
				path,
			},
		]
	})
}

type LobstersStory = {
	title?: string
	url?: string
	score?: number
	comment_count?: number
	created_at?: string
	comments_url?: string
	short_id_url?: string
}

/** Stories from a Lobsters listing. */
export function parseLobsters(body: LobstersStory[]): Found[] {
	return (Array.isArray(body) ? body : []).flatMap((story): Found[] => {
		const href = story.comments_url ?? story.short_id_url
		const path = story.url ? pathOn(story.url) : null
		if (!href || !path) return []
		return [
			{
				site: "Lobsters",
				href,
				title: story.title ?? "",
				points: story.score ?? 0,
				comments: story.comment_count ?? 0,
				date: story.created_at ?? "",
				path,
			},
		]
	})
}

/**
 * The threads worth sending a reader to for one post, busiest first. A
 * submission nobody voted on or answered is not a discussion, so it is left
 * out unless it is the only place the post was ever shared.
 */
export function threadsFor(all: Found[], path: string): Discussion[] {
	const target = path.replace(/\/+$/, "") || "/"
	const matching = all.filter(d => d.path === target)
	const alive = matching.filter(d => d.comments > 0 || d.points > 1)
	return (alive.length ? alive : matching.slice(0, 1))
		.sort((a, b) => b.comments - a.comments || b.points - a.points)
		.map(({ path: _, ...d }) => d)
}

async function getJson<T>(url: string): Promise<T> {
	const res = await fetch(url, {
		headers: {
			"User-Agent": "armanckeser.com (personal site build)",
			Accept: "application/json",
		},
		signal: AbortSignal.timeout(15_000),
	})
	if (!res.ok) throw new Error(`${url} answered ${res.status}`)
	return res.json() as Promise<T>
}

async function fetchHackerNews(): Promise<Found[]> {
	const query = new URLSearchParams({
		query: host,
		restrictSearchableAttributes: "url",
		tags: "story",
		hitsPerPage: "1000",
	})
	return parseHackerNews(
		await getJson(`https://hn.algolia.com/api/v1/search?${query}`)
	)
}

async function fetchLobsters(): Promise<Found[]> {
	return parseLobsters(
		await getJson(`https://lobste.rs/domains/${host}.json`)
	)
}

/** Each source on its own, so one being down does not hide the other. */
async function fetchAll(): Promise<Found[]> {
	const results = await Promise.allSettled([
		fetchHackerNews(),
		fetchLobsters(),
	])
	return results.flatMap(result => {
		if (result.status === "fulfilled") return result.value
		console.error("[Discussions] source unavailable:", result.reason)
		return []
	})
}

// Every post is prerendered in the same build, so the two listings are asked
// for once and shared. The CMS server is long-lived, so it asks again hourly.
const TTL = 60 * 60 * 1000
let cache: { at: number; threads: Promise<Found[]> } | null = null

/** Threads elsewhere about the post at `path` (e.g. "/writing/llm-zero"). */
export async function discussionsOf(path: string): Promise<Discussion[]> {
	if (!cache || Date.now() - cache.at > TTL) {
		cache = { at: Date.now(), threads: fetchAll() }
	}
	return threadsFor(await cache.threads, path)
}
