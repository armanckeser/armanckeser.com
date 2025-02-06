<script lang="ts">
import "../app.css"
import { ModeWatcher } from "mode-watcher"
import ShellPrompt from "$lib/components/ShellPrompt.svelte"

const { children } = $props()
</script>

<ModeWatcher />

<ShellPrompt />
{@render children()}
