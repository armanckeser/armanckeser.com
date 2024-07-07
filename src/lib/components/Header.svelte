<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js"
	import { Terminal } from "lucide-svelte"
	import Moon from "lucide-svelte/icons/moon"
	import Sun from "lucide-svelte/icons/sun"
	import { toggleMode } from "mode-watcher"
</script>

<header class="flex justify-between gap-2 p-2">
	<Button disabled variant="outline" class="gap-2">
		<Terminal class="h-[1.2rem] w-[1.2rem]" />
		<span class="font-mono">ENV=dev</span>
	</Button>
	<Button class="aspect-square" onclick={toggleMode} variant="outline">
		<Sun
			class="absolute h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
		/>
		<Moon
			class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
		/>
		<span class="sr-only">Toggle theme</span>
	</Button>
</header>
