<script lang="ts">
import { page } from "$app/state"
import Footer from "$lib/components/Footer.svelte"
import ShellPrompt from "$lib/components/ShellPrompt.svelte"
import { roomOf, scrolled } from "$lib/room.svelte"

const { children } = $props()

const room = $derived(scrolled.room ?? roomOf(page.url.pathname))

// The document itself takes the room too, so the page behind everything (and
// what shows when a phone over-scrolls) is the room's colour, not the default.
$effect(() => {
	document.documentElement.dataset.room = room
})
</script>

<div class="room site flex min-h-screen w-full flex-col" data-room={room}>
	<ShellPrompt />
	<main id="main-content" class="flex-1" tabindex="-1">
		{@render children()}
	</main>
	<Footer />
</div>

<style>
	/* On the home page the room changes as you scroll; what frames the page
	   (header, footer) follows it over a moment rather than switching. */
	.site {
		transition: background-color 400ms ease;
	}
</style>
