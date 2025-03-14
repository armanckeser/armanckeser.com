<script lang="ts">
import { base } from "$app/paths"
import { page } from "$app/state"
import * as Breadcrumb from "$lib/components/ui/breadcrumb"
import { toggleMode } from "mode-watcher"

// Simple dropdown state
let isDropdownOpen = $state(false)

// Separate functions from assignments
function toggleDropdown() {
	isDropdownOpen = !isDropdownOpen
}

function closeDropdown() {
	isDropdownOpen = false
}

// Click outside to close dropdown
function handleClickOutside(event: MouseEvent) {
	const dropdown = document.getElementById("mobile-pwd-dropdown")
	const trigger = document.getElementById("mobile-pwd-trigger")

	if (
		dropdown &&
		!dropdown.contains(event.target as Node) &&
		trigger &&
		!trigger.contains(event.target as Node)
	) {
		closeDropdown()
	}
}

// Add/remove click outside listener based on dropdown state
$effect(() => {
	if (isDropdownOpen) {
		document.addEventListener("click", handleClickOutside)
	} else {
		document.removeEventListener("click", handleClickOutside)
	}

	return () => {
		document.removeEventListener("click", handleClickOutside)
	}
})

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
  
  <!-- Simple Custom Mobile PWD Dropdown -->
  <div class="relative lg:hidden">
    <button 
      id="mobile-pwd-trigger"
      class="border-b border-zinc-200 dark:border-zinc-800 text-primary hover:text-accent transition-colors"
      onclick={toggleDropdown}
      aria-haspopup="true"
      aria-expanded={isDropdownOpen}
    >
      pwd
    </button>
    
    {#if isDropdownOpen}
      <div 
        id="mobile-pwd-dropdown"
        class="absolute left-0 top-full z-50 mt-1 min-w-[200px] rounded-md border border-border bg-background py-1 shadow-md"
        role="menu"
      >
        <div class="px-2 py-1 text-xs font-semibold text-muted-foreground">Current Path</div>
        <div class="h-px bg-border my-1"></div>
        {#each segments as segment, index}
          <a
            href={segment.href}
            class="flex w-full items-center px-2 py-1.5 hover:bg-accent/10 text-sm font-mono"
            style="padding-left: calc(0.5rem + {index * 0.75}rem)"
            role="menuitem"
            onclick={closeDropdown}
          >
            {#if index > 0}
              <span class="mr-2 text-muted-foreground">└─</span>
            {/if}
            {segment.text}
          </a>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Desktop Breadcrumbs -->
  <div class="hidden lg:block">
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
