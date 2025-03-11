<script lang="ts">
import { base } from "$app/paths"
import { page } from "$app/state"
import * as Breadcrumb from "$lib/components/ui/breadcrumb"
import * as DropdownMenu from "$lib/components/ui/dropdown-menu"
import { toggleMode } from "mode-watcher"

const segments = $derived.by(() => {
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

<div class="flex items-center space-x-2 font-mono text-sm">
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
  
  <!-- Mobile PWD Dropdown -->
  <div class="sm:hidden">
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        class="inline-flex items-center justify-center rounded-md px-2 py-1 text-sm font-medium transition-colors hover:bg-accent/10 disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-accent/10"
      >
        pwd
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="start" class="w-[200px]">
        <DropdownMenu.Label class="font-mono">Current Path</DropdownMenu.Label>
        <DropdownMenu.Separator />
        {#each segments as segment}
          <DropdownMenu.Item>
            <a
              href={segment.href}
              class="flex w-full items-center"
            >
              {segment.text}
            </a>
          </DropdownMenu.Item>
        {/each}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </div>

  <!-- Desktop Breadcrumbs -->
  <div class="hidden sm:block">
    <Breadcrumb.Root>
      <Breadcrumb.List>
        {#each segments as segment}
          <Breadcrumb.Item>
            {#if segment.isLast}
              <Breadcrumb.Page class="text-muted-foreground">
                {segment.text}
              </Breadcrumb.Page>
            {:else}
              <Breadcrumb.Link
                href={segment.href}
                class="border-b border-zinc-200 dark:border-zinc-800 text-primary hover:text-accent transition-colors"
              >
                {segment.text}
              </Breadcrumb.Link>
            {/if}
          </Breadcrumb.Item>
          {#if !segment.isLast}
            <Breadcrumb.Separator>
              <span class="text-muted-foreground">/</span>
            </Breadcrumb.Separator>
          {/if}
        {/each}
      </Breadcrumb.List>
    </Breadcrumb.Root>
  </div>
</div>
