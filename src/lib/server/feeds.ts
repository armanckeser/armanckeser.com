import type { Book, Film } from "../shelf"

/**
 * Reads the public RSS feeds of Letterboxd and Goodreads. Neither service has
 * an open API, but both publish a member's activity as a feed, which needs no
 * key. The feeds are flat and regular, so they are read with a few patterns
 * rather than an XML parser.
 */

const MONTHS = "JanFebMarAprMayJunJulAugSepOctNovDec"

/** The body of each <item> in a feed. */
export function itemsOf(xml: string): string[] {
	return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => m[1])
}

const decode = (text: string) =>
	text
		.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
		.replace(/&#x([0-9a-f]+);/gi, (_, n) =>
			String.fromCodePoint(Number.parseInt(n, 16))
		)
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&(apos|#39);/g, "'")
		.replace(/&amp;/g, "&")

/** The text of one element of an item, with CDATA unwrapped. Empty if absent. */
export function fieldOf(item: string, tag: string): string {
	const match = item.match(
		new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`)
	)
	if (!match) return ""
	const cdata = match[1].match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/)
	return (cdata ? cdata[1] : decode(match[1])).trim()
}

/** "Tue, 29 Sep 2026 15:25:13 -0700" as the day it names, whatever the offset. */
function dayOf(rfc822: string): string | null {
	const match = rfc822.match(/(\d{1,2}) (\w{3}) (\d{4})/)
	if (!match) return null
	const month = MONTHS.indexOf(match[2]) / 3 + 1
	if (!Number.isInteger(month) || month < 1) return null
	return `${match[3]}-${String(month).padStart(2, "0")}-${match[1].padStart(2, "0")}`
}

/** Diary entries from a Letterboxd feed, most recently watched first. */
export function parseFilms(xml: string): Film[] {
	return (
		itemsOf(xml)
			.map((item): Film | null => {
				const title = fieldOf(item, "letterboxd:filmTitle")
				const watched = fieldOf(item, "letterboxd:watchedDate")
				// Lists and reviews without a watch date share the feed; they are not diary entries.
				if (!title || !watched) return null
				const rating = Number.parseFloat(
					fieldOf(item, "letterboxd:memberRating")
				)
				const year = Number.parseInt(
					fieldOf(item, "letterboxd:filmYear"),
					10
				)
				return {
					title,
					year: Number.isNaN(year) ? null : year,
					rating: Number.isNaN(rating) ? null : rating,
					rewatch: fieldOf(item, "letterboxd:rewatch") === "Yes",
					watched,
					href: fieldOf(item, "link"),
					poster:
						fieldOf(item, "description").match(
							/<img src="([^"]+)"/
						)?.[1] ?? null,
				}
			})
			.filter((film): film is Film => film !== null)
			// The feed is in the order things were logged, which is not always the order they were watched.
			.sort((a, b) => b.watched.localeCompare(a.watched))
	)
}

/** The books on one Goodreads shelf, in the feed's order. */
export function parseBooks(xml: string, reading: boolean): Book[] {
	return itemsOf(xml).map((item): Book => {
		const rating = Number.parseInt(fieldOf(item, "user_rating"), 10)
		const cover = fieldOf(item, "book_large_image_url")
		return {
			title: fieldOf(item, "title"),
			author: fieldOf(item, "author_name").replace(/\s+/g, " "),
			// Goodreads writes "not rated" as 0.
			rating: rating > 0 ? rating : null,
			reading,
			read: reading ? null : dayOf(fieldOf(item, "user_read_at")),
			href: `https://www.goodreads.com/book/show/${fieldOf(item, "book_id")}`,
			// Books without a cover get a shared placeholder, which is worse than none.
			cover: cover && !cover.includes("nophoto") ? cover : null,
		}
	})
}

async function get(url: string): Promise<string> {
	const res = await fetch(url, {
		headers: {
			"User-Agent": "armanckeser.com (personal site build)",
			Accept: "application/rss+xml, application/xml, text/xml",
		},
		signal: AbortSignal.timeout(15_000),
	})
	if (!res.ok) throw new Error(`${url} answered ${res.status}`)
	return res.text()
}

export async function fetchFilms(member: string): Promise<Film[]> {
	return parseFilms(await get(`https://letterboxd.com/${member}/rss/`))
}

/** What is being read now, then what was finished, most recent first. */
export async function fetchBooks(userId: string): Promise<Book[]> {
	const shelf = (name: string, sort = "") =>
		get(
			`https://www.goodreads.com/review/list_rss/${userId}?shelf=${name}${sort}`
		)
	const [reading, read] = await Promise.all([
		shelf("currently-reading"),
		shelf("read", "&sort=date_read&order=d"),
	])
	return [
		...parseBooks(reading, true),
		...parseBooks(read, false)
			.filter(book => book.read)
			.sort((a, b) => (b.read ?? "").localeCompare(a.read ?? "")),
	]
}
