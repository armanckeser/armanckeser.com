<script lang="ts">
import { onNavigate } from "$app/navigation"
import { ModeWatcher } from "mode-watcher"
import "../app.css"

const { children } = $props()

const viewTransitionOptions = {
	duration: 600,
	easing: "cubic-bezier(0.16, 1, 0.3, 1)",
}

onNavigate(navigation => {
	if (!document.startViewTransition) return

	return new Promise(resolve => {
		const transition = document.startViewTransition(async () => {
			resolve()
			await navigation.complete
		})

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

{@render children()}
