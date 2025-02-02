<!-- Combined terminal header with shell prompt functionality -->
<script lang="ts">
import { mode, toggleMode } from "mode-watcher"
import { GitBranch, ChevronUp, Clock, Computer } from "lucide-svelte"
import ShellInput from "./ShellInput.svelte"
import Breadcrumbs from "./Breadcrumbs.svelte"
import { cn } from "$lib/utils"

// Shell state
const gitInfo = $derived({
	branch: $mode === "dark" ? "nightly" : "stable",
	ahead: $mode === "dark" ? 1 : 0,
	modified: 0,
	untracked: 0,
})

let currentTime = $state(
	new Date().toLocaleTimeString("en-US", {
		hour12: false,
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	})
)

// Time update effect
$effect(() => {
	const interval = setInterval(() => {
		currentTime = new Date().toLocaleTimeString("en-US", {
			hour12: false,
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		})
	}, 1000)

	return () => clearInterval(interval)
})

function toggleTheme() {
	toggleMode()
}
</script>

<header
  class={cn(
    'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur',
    'supports-[backdrop-filter]:bg-background/75',
    'overflow-visible',
  )}
>
  <div class="container flex items-center h-14 px-4 sm:px-8">
    <div
      class="flex gap-2 flex-row lg:items-center lg:gap-4 font-mono text-sm w-full"
    >
      <!-- Left section -->
      <div class="flex items-start gap-2 w-full md:flex-1">
        <div class="flex items-center gap-2 text-muted-foreground shrink-0">
          <Computer class="h-4 w-4" />
          <span class="text-emerald-500">│</span>
          <Breadcrumbs />
        </div>
        <div class="hidden md:block flex-1">
          <ShellInput />
        </div>
      </div>

      <!-- Right section -->
      <div class="flex items-center gap-2 ml-auto">
        <div class="flex items-center gap-2 text-yellow-500">
          <GitBranch class="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
          <button
            class="hover:text-emerald-500 transition-colors"
            onclick={toggleTheme}
          >
            <span class="dark:hidden">stable</span>
            <span class="hidden dark:inline">nightly</span>
          </button>
          <!-- Hide git status details on mobile -->
          <div class="hidden md:flex items-center gap-1">
            {#if gitInfo.ahead > 0}
              <ChevronUp class="h-3 w-3" />
              <span>{gitInfo.ahead}</span>
            {/if}
          </div>
          {#if gitInfo.modified > 0}
            <span class="hidden md:inline text-red-400"
              >!{gitInfo.modified}</span
            >
          {/if}
          {#if gitInfo.untracked > 0}
            <span class="hidden md:inline text-blue-400"
              >?{gitInfo.untracked}</span
            >
          {/if}
        </div>

        <!-- Time display - hidden on mobile -->
        <div class="hidden md:flex items-center gap-2">
          <span class="text-emerald-500">│</span>
          <Clock class="h-4 w-4" />
          <span>{currentTime}</span>
        </div>
      </div>
    </div>
  </div>
</header>

<style>
  .glass {
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: background-color, color;
  }
</style>
