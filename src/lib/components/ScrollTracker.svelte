<script lang="ts">
import { browser } from "$app/environment"
import { onDestroy, onMount } from "svelte"

// Track whether user clicked a link to prevent unwanted updates
let userClickedAnchor = $state(false)
let timeoutId: ReturnType<typeof setTimeout>

function handleIntersection(entries: IntersectionObserverEntry[]) {
	// Don't update hash while user-initiated scrolling is happening
	if (userClickedAnchor) return

	// Find the first heading that's in view
	const visibleHeadings = entries.filter(entry => entry.isIntersecting)

	if (visibleHeadings.length > 0) {
		// Sort by Y position to get the topmost visible heading
		const sortedHeadings = [...visibleHeadings].sort(
			(a, b) => a.boundingClientRect.y - b.boundingClientRect.y
		)

		// Get the ID of the first visible heading
		const activeId = sortedHeadings[0].target.id

		// Update URL without triggering a navigation
		if (browser && activeId && window.location.hash !== `#${activeId}`) {
			history.replaceState(null, "", `#${activeId}`)
		}
	}
}

onMount(() => {
	if (!browser) return

	// Create an intersection observer
	const observer = new IntersectionObserver(handleIntersection, {
		rootMargin: "-100px 0px -66%", // Adjust these values as needed
		threshold: 0,
	})

	// Observe all headings
	const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6")
	headings.forEach(heading => observer.observe(heading))

	// Handle anchor clicks
	const handleAnchorClick = () => {
		userClickedAnchor = true

		// Reset after scrolling completes
		clearTimeout(timeoutId)
		timeoutId = setTimeout(() => {
			userClickedAnchor = false
		}, 500) // Adjust timeout as needed
	}

	// Add click listeners to anchor links
	const anchors = document.querySelectorAll('a[href^="#"]')
	anchors.forEach(anchor => {
		anchor.addEventListener("click", handleAnchorClick)
	})

	// Cleanup
	onDestroy(() => {
		if (!browser) return
		headings.forEach(heading => observer.unobserve(heading))
		anchors.forEach(anchor => {
			anchor.removeEventListener("click", handleAnchorClick)
		})
		clearTimeout(timeoutId)
	})
})
</script>

<!-- Component doesn't render anything, just handles scroll tracking --> 