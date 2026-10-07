<script lang="ts">
import { mode } from "mode-watcher"
import { Toaster } from "svelte-sonner"
import "./studio.css"

const { children } = $props()

$effect(() => {
	document.documentElement.dataset.room = "writing"
})
</script>

<svelte:head>
	<meta name="robots" content="noindex" />
</svelte:head>

<Toaster
	theme={mode.current === "dark" ? "dark" : "light"}
	position="bottom-center"
	toastOptions={{ style: "font-family: var(--studio-sans); font-size: 13px; border-radius: 12px;" }}
/>

<div class="studio h-dvh bg-background text-foreground" data-room="writing">
	{@render children()}
</div>
