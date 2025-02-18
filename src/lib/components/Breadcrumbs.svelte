<script lang="ts">
import { base } from "$app/paths"
import { page } from "$app/state"
import { cn } from "$lib/utils"
import { toggleMode } from "mode-watcher"

const segments = $derived(() => {
	const parts = page.url.pathname.split("/").filter(Boolean)
	let accumulatedPath = ""

	// Start with home as the first segment
	const allSegments = [
		{
			text: "home",
			href: `${base}/`,
			isLast: parts.length === 0,
		},
	]

	// Add remaining segments
	return allSegments.concat(
		parts.map((part: string, index: number) => {
			accumulatedPath += `/${part}`
			return {
				text: part,
				href: accumulatedPath,
				isLast: index === parts.length - 1,
			}
		})
	)
})
</script>

<nav class="flex items-center space-x-2 font-mono text-sm">
  <button
    class="group glass h-6 w-6 rounded-full p-1 transition-all duration-300 hover:bg-accent/10"
    onclick={toggleMode}
    aria-label="Toggle theme"
  >
	<div
	class="h-full w-full rounded-full bg-accent 
			transition-colors duration-300 
			group-hover:brightness-110"
	></div>
  </button>
  
  {#each segments() as segment, index}
    <span class="text-muted-foreground leading-none">/</span>
    <a
      href={segment.href}
      class={cn(
        'transition-colors leading-none py-1',
        segment.isLast
          ? 'text-muted-foreground'
          : 'border-b border-zinc-200 dark:border-zinc-800 text-primary hover:text-accent',
      )}
    >
      {segment.text}
    </a>
  {/each}
</nav>
