<script lang="ts">
	import { ModeWatcher } from "mode-watcher"
	import "../../app.css"

	const { children } = $props()
</script>

<ModeWatcher />
<main class="min-h-dvh">
	{@render children()}
</main>
