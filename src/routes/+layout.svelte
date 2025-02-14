<script lang="ts">
import "../app.css"
import ShellPrompt from "$lib/components/ShellPrompt.svelte"
import { ModeWatcher } from "mode-watcher"

const { children } = $props()
</script>

<ModeWatcher />

<ShellPrompt />
{@render children()}
