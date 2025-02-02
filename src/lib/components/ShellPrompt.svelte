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
      class="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-4 font-mono text-sm w-full"
    >
      <!-- Left section -->
      <div
        class="flex items-center gap-4 overflow-x-auto scrollbar-none flex-1"
      >
        <div class="flex items-center gap-2 text-muted-foreground shrink-0">
          <Computer class="h-4 w-4" />
          <span class="text-emerald-500">│</span>
        </div>
        <Breadcrumbs />
        <ShellInput />
      </div>

      <!-- Right section -->
      <div
        class="flex items-center gap-2 text-muted-foreground ml-auto shrink-0"
      >
        <div class="flex items-center gap-2 text-yellow-500 shrink-0">
          <GitBranch class="h-4 w-4" />
          <button
            class="hover:text-emerald-500 transition-colors"
            onclick={toggleTheme}
          >
            {gitInfo.branch}
          </button>
          {#if gitInfo.ahead > 0}
            <div class="flex items-center gap-1">
              <ChevronUp class="h-3 w-3" />
              <span>{gitInfo.ahead}</span>
            </div>
          {/if}
          {#if gitInfo.modified > 0}
            <span class="text-red-400">!{gitInfo.modified}</span>
          {/if}
          {#if gitInfo.untracked > 0}
            <span class="text-blue-400">?{gitInfo.untracked}</span>
          {/if}
          <span class="text-emerald-500">│</span>
        </div>

        <Clock class="h-4 w-4" />
        <span>{currentTime}</span>
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
