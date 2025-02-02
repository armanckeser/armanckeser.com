<script lang="ts">
import { page } from "$app/state"
import { Folder } from "lucide-svelte"
import { cn } from "$lib/utils"

const segments = $derived(() => {
	const parts = page.url.pathname.split("/").filter(Boolean)
	let accumulatedPath = ""
	return parts.map((part: string, index: number) => {
		accumulatedPath += `/${part}`
		return {
			text: part === "blog" ? "writing" : part,
			href: accumulatedPath,
			isLast: index === parts.length - 1,
		}
	})
})
</script>

<nav class="flex items-center space-x-2 font-mono text-sm">
  <Folder class="h-4 w-4 text-blue-400" />
  <a href="/" class="text-primary transition-colors hover:text-emerald-500">~</a
  >

  {#each segments() as segment}
    <span class="text-muted-foreground">/</span>
    <a
      href={segment.href}
      class={cn(
        'transition-colors',
        segment.isLast
          ? 'text-muted-foreground'
          : 'text-primary hover:text-emerald-500',
      )}
    >
      {segment.text}
    </a>
  {/each}
</nav>
