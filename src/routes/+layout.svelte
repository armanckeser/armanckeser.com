<script lang="ts">
	import Header from "$lib/components/Header.svelte"

	import { ModeWatcher } from "mode-watcher"
	import "../app.css"

	const { children } = $props()
</script>

<ModeWatcher />
<div class="grid h-screen grid-rows-[auto_1fr] gap-2">
	<Header />
	<main>
		{@render children()}
	</main>
</div>
