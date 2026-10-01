import { letterboxd } from "$lib/config"
import snapshot from "$lib/data/films.json"
import { fetchFilms } from "$lib/server/feeds"
import type { Film } from "$lib/shelf"
import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"

export const prerender = true

const SHOWN = 24

// Read from Letterboxd when the site is built (daily). If the feed cannot be
// reached from the build machine, the last list that was committed stands in,
// so a blocked request costs freshness rather than the whole section.
export const GET: RequestHandler = async () => {
	let films: Film[] = snapshot
	try {
		const live = await fetchFilms(letterboxd)
		if (live.length) films = live
	} catch (error) {
		console.error("[Films] Letterboxd feed unavailable:", error)
	}
	return json(films.slice(0, SHOWN), {
		headers: { "Cache-Control": "public, max-age=3600" },
	})
}
