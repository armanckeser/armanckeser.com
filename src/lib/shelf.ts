/**
 * What I have been watching and reading, as the home page shows it.
 *
 * Both lists come from the public feeds of the services I already log to
 * (Letterboxd and Goodreads), read at build time by $lib/server/feeds and
 * served as JSON from /api/films and /api/books.
 */
export type Film = {
	title: string
	year: number | null
	/** Out of five, in halves. Null when logged without a rating. */
	rating: number | null
	rewatch: boolean
	/** The day it was watched, as written: "2026-09-27". */
	watched: string
	/** My diary entry for it. */
	href: string
	/** The poster at the feed's size (600 wide). See `posterAt` for smaller ones. */
	poster: string | null
}

export type Book = {
	title: string
	author: string
	/** Out of five. Null when unrated. */
	rating: number | null
	/** On the currently-reading shelf. */
	reading: boolean
	/** The day it was finished ("2026-09-29"), if it has been. */
	read: string | null
	href: string
	cover: string | null
}

/**
 * Letterboxd's image host sizes a poster by its file name
 * (…-0-600-0-900-crop.jpg), so a smaller one is the same URL with other numbers.
 */
export function posterAt(poster: string, width: number): string {
	return poster.replace(
		/-0-\d+-0-\d+-crop/,
		`-0-${width}-0-${Math.round(width * 1.5)}-crop`
	)
}

/** "★★★½" for 3.5. Whole and half stars only, as both services rate. */
export function stars(rating: number): string {
	return "★".repeat(Math.floor(rating)) + (rating % 1 ? "½" : "")
}
