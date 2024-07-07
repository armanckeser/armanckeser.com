<script lang="ts">
	import * as Alert from "$lib/components/ui/alert/index.js"
	import { Button } from "$lib/components/ui/button/index.js"
	import { Terminal } from "lucide-svelte"
	import Moon from "lucide-svelte/icons/moon"
	import Sun from "lucide-svelte/icons/sun"
	import { toggleMode } from "mode-watcher"
</script>

<header class="flex items-center justify-between gap-2 p-2">
	<Alert.Root>
		<Terminal class="h-4 w-4" />
		<Alert.Title class="font-mono">ENV=dev</Alert.Title>
	</Alert.Root>
	<Button onclick={toggleMode} variant="outline" size="icon">
		<Sun
			class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
		/>
		<Moon
			class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
		/>
		<span class="sr-only">Toggle theme</span>
	</Button>
</header>
