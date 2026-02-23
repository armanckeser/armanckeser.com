<script lang="ts">
import Footer from "$lib/components/Footer.svelte"
import ShellPrompt from "$lib/components/ShellPrompt.svelte"

const { children } = $props()
</script>

<div class="min-h-screen flex flex-col w-full">
	<ShellPrompt />
	<main id="main-content" class="flex-1" tabindex="-1">
		{@render children()}
	</main>
	<Footer />
</div>
