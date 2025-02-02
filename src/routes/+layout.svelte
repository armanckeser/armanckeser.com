<script lang="ts">
import "../app.css"
import { ModeWatcher } from "mode-watcher"
import ShellPrompt from "$lib/components/ShellPrompt.svelte"

const { children } = $props()
</script>

<ModeWatcher />

<div class="flex min-h-dvh flex-col">
  <ShellPrompt />
  <main class="flex-1 container py-8">
    {@render children()}
  </main>
</div>
