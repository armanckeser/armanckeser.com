<script lang="ts">
import { onNavigate } from "$app/navigation"
import ShellPrompt from "$lib/components/ShellPrompt.svelte"
import { ModeWatcher } from "mode-watcher"
import "../app.css"

const { children } = $props()

// Handle view transitions
onNavigate(navigation => {
	if (!document.startViewTransition) return

	return new Promise(resolve => {
		document.startViewTransition(async () => {
			resolve()
			await navigation.complete
		})
	})
})
</script>

<ModeWatcher />

<div class="min-h-screen flex flex-col">
  <ShellPrompt />
  <main class="flex-1">
    {@render children()}
  </main>
</div>

<style>
  :global(html) {
    scrollbar-gutter: stable;
    overflow-y: scroll; /* Force scrollbar space allocation */
  }

  /* View Transitions */
  :global(::view-transition-old(root)),
  :global(::view-transition-new(root)) {
    animation: none;
    mix-blend-mode: normal;
  }

  :global(.dark::view-transition-old(root)) {
    z-index: 1;
  }
  :global(.dark::view-transition-new(root)) {
    z-index: 999;
  }

  :global(::view-transition-old(page)),
  :global(::view-transition-new(page)) {
    animation: none;
  }
</style>
