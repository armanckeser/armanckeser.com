import { goodreads } from "$lib/config"
import snapshot from "$lib/data/books.json"
import { fetchBooks } from "$lib/server/feeds"
import type { Book } from "$lib/shelf"
import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"

export const prerender = true

const SHOWN = 18

// Read from Goodreads when the site is built (daily), with the last committed
// list standing in if the feed cannot be reached. See /api/films.
export const GET: RequestHandler = async () => {
	let books: Book[] = snapshot
	try {
		const live = await fetchBooks(goodreads)
		if (live.length) books = live
	} catch (error) {
		console.error("[Books] Goodreads feed unavailable:", error)
	}
	return json(books.slice(0, SHOWN), {
		headers: { "Cache-Control": "public, max-age=3600" },
	})
}
