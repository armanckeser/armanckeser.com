<script lang="ts">
import { onNavigate } from "$app/navigation"
import Footer from "$lib/components/Footer.svelte"
import ShellPrompt from "$lib/components/ShellPrompt.svelte"
import { ModeWatcher } from "mode-watcher"
import "../app.css"

const { children } = $props()

// Define custom view transition options
const viewTransitionOptions = {
	duration: 600, // ms
	easing: "cubic-bezier(0.16, 1, 0.3, 1)", // Smooth ease-out
}

// Handle view transitions with custom timing
onNavigate(navigation => {
	if (!document.startViewTransition) return

	return new Promise(resolve => {
		// Apply custom transition options
		const transition = document.startViewTransition(async () => {
			resolve()
			await navigation.complete
		})

		// Apply custom duration and easing if supported
		if (transition.ready) {
			transition.ready.then(() => {
				document.documentElement.style.setProperty(
					"--view-transition-duration",
					`${viewTransitionOptions.duration}ms`
				)
				document.documentElement.style.setProperty(
					"--view-transition-easing",
					viewTransitionOptions.easing
				)
			})
		}
	})
})
</script>

<ModeWatcher />

<a href="#main-content" class="skip-to-content">
	Skip to content
</a>

<div class="min-h-screen flex flex-col w-full">
	<ShellPrompt />
	<main id="main-content" class="flex-1" tabindex="-1">
		{@render children()}
	</main>
	<Footer />
</div>
