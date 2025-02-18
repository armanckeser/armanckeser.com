<script lang="ts">
import ShellPrompt from "$lib/components/ShellPrompt.svelte"
import { ModeWatcher } from "mode-watcher"
import "../app.css"

const { children } = $props()
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
  }
</style>
