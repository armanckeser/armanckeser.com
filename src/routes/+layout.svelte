<script lang="ts">
import { onNavigate } from "$app/navigation"
import { ModeWatcher } from "mode-watcher"
import "../app.css"

const { children } = $props()

/** The file name of the post a path points at, if it points at one. */
const postOf = (pathname?: string) =>
	pathname?.match(/\/writing\/([^/]+)\/?$/)?.[1]

/**
 * The sheet standing for a post on the page being shown (its card's page on the
 * home page, its line in a listing), provided it is on screen to travel from or to.
 */
function sheetFor(post: string): HTMLElement | undefined {
	return [
		...document.querySelectorAll<HTMLElement>(
			`[data-sheet="${CSS.escape(post)}"]`
		),
	].find(el => {
		const { top, bottom, left, right, width } = el.getBoundingClientRect()
		return (
			width > 0 &&
			bottom > 0 &&
			top < innerHeight &&
			right > 0 &&
			left < innerWidth
		)
	})
}

onNavigate(navigation => {
	if (!document.startViewTransition) return

	// Opening a post from its sheet, or going back to it, is one sheet of paper
	// changing size: both ends share a transition name while the pages change.
	const opening = postOf(navigation.to?.url.pathname)
	const closing = postOf(navigation.from?.url.pathname)
	let sheet = opening && !closing ? sheetFor(opening) : undefined
	sheet?.style.setProperty("view-transition-name", "sheet")

	return new Promise(resolve => {
		const transition = document.startViewTransition(async () => {
			resolve()
			await navigation.complete
			if (closing && !opening) {
				sheet = sheetFor(closing)
				sheet?.style.setProperty("view-transition-name", "sheet")
			}
		})
		transition.finished.finally(() =>
			sheet?.style.removeProperty("view-transition-name")
		)
	})
})
</script>

<ModeWatcher />

<a href="#main-content" class="skip-to-content">
	Skip to content
</a>

{@render children()}
