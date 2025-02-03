<script lang="ts">
import { page } from "$app/state"
import { cn } from "$lib/utils"

const segments = $derived(() => {
	const parts = page.url.pathname.split("/").filter(Boolean)
	let accumulatedPath = ""
	return parts.map((part: string, index: number) => {
		accumulatedPath += `/${part}`
		return {
			text: part,
			href: accumulatedPath,
			isLast: index === parts.length - 1,
		}
	})
})
</script>

<nav class="flex text-nowrap items-center space-x-2 font-mono text-sm">
  <div class="glass h-6 w-6 rounded-full p-1">
    <div class="h-full w-full rounded-full bg-emerald-500"></div>
  </div>
  <span class="text-muted-foreground">/</span>
  <a
    href="/"
    class={cn(
      'transition-colors hover:text-emerald-500',
      segments().length === 0 ? 'text-muted-foreground' : 'text-primary'
    )}>home</a
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
