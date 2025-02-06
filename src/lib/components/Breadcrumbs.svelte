<script lang="ts">
import { page } from "$app/state"
import { base } from "$app/paths"
import { cn } from "$lib/utils"

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

<nav class="flex text-nowrap items-center space-x-2 font-mono text-sm">
  <div class="glass h-6 w-6 rounded-full p-1">
    <div class="h-full w-full rounded-full bg-accent"></div>
  </div>
  
  {#each segments() as segment, index}
    <span class="text-muted-foreground">/</span>
    <a
      href={segment.href}
      class={cn(
        'transition-colors  border-zinc-200 dark:border-zinc-800',
        segment.isLast
          ? 'text-muted-foreground'
          : 'border-b text-primary hover:text-accent',
      )}
    >
      {segment.text}
    </a>
  {/each}
</nav>
