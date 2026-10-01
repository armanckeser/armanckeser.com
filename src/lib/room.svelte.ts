/**
 * Which room of the site is on screen (see "Rooms" in app.css).
 *
 * Most pages live in one room, decided by their path. The home page walks
 * through all four, so there it is whichever one is under the header.
 */
export type Room = "code" | "writing" | "film" | "books"

/** The room a page lives in. Writing and the pages set like writing are paper. */
export function roomOf(pathname: string): Room {
	return /^\/(writing|privacy|terms)(\/|$)/.test(pathname)
		? "writing"
		: "code"
}

/** The room the home page has scrolled to. Null anywhere else. */
export const scrolled = $state<{ room: Room | null }>({ room: null })

/**
 * Keeps `scrolled.room` in step with the page: the room is the last band whose
 * top has passed under the header. Call from an effect; returns its cleanup.
 */
export function trackRooms(): () => void {
	const bands = [
		...document.querySelectorAll<HTMLElement>(".band[data-room]"),
	]
	let frame = 0

	function read() {
		frame = 0
		// A little below the header, so a room takes over as it arrives.
		const line = innerHeight * 0.3
		// The last room may be too short to ever reach that line, so the end of
		// the page counts as having arrived in it.
		const atEnd =
			scrollY + innerHeight >= document.documentElement.scrollHeight - 2
		const current = atEnd
			? bands.at(-1)
			: bands.findLast(band => band.getBoundingClientRect().top <= line)
		scrolled.room = (current?.dataset.room as Room | undefined) ?? "code"
	}

	function handleScroll() {
		frame ||= requestAnimationFrame(read)
	}

	read()
	addEventListener("scroll", handleScroll, { passive: true })
	addEventListener("resize", handleScroll, { passive: true })
	return () => {
		cancelAnimationFrame(frame)
		removeEventListener("scroll", handleScroll)
		removeEventListener("resize", handleScroll)
		scrolled.room = null
	}
}
