<!-- Combined terminal header with shell prompt functionality -->
<script lang="ts">
import { toggleMode } from "mode-watcher"
import { GitBranch, ChevronUp, Clock, Computer } from "lucide-svelte"
import ShellInput from "./ShellInput.svelte"
import Breadcrumbs from "./Breadcrumbs.svelte"
import { cn } from "$lib/utils"

type GitInfo = {
	ahead: number
	modified: number
	untracked: number
}

// Static configuration
const GIT_INFO: GitInfo = $state({
	ahead: 1,
	modified: 0,
	untracked: 0,
})

// Time management
let currentTime = $state<string>("")
let timeInterval = $state<ReturnType<typeof setInterval>>()

// Lifecycle management
$effect(() => {
	const updateTime = () => {
		currentTime = new Date().toLocaleTimeString("en-US", {
			hour12: false,
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		})
	}

	updateTime() // Initial call
	timeInterval = setInterval(updateTime, 1000)

	return () => {
		timeInterval && clearInterval(timeInterval)
	}
})
</script>

<header
  class={cn(
    'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur',
    'supports-[backdrop-filter]:bg-background/75 overflow-visible',
    'transition-colors duration-300 ease-in-out',
  )}
  aria-label="Application header"
>
  <div class="container flex h-14 items-center px-4 sm:px-8">
    <div
      class="flex w-full flex-row gap-2 font-mono text-sm lg:items-center lg:gap-4"
    >
      <!-- Left section -->
      <div class="flex w-full items-start gap-2 md:flex-1">
        <div
          class="flex shrink-0 items-center gap-2 text-muted-foreground"
          aria-label="Current location"
        >
          <Computer class="h-4 w-4" aria-hidden="true" />
          <span class="text-emerald-500" aria-hidden="true">│</span>
          <Breadcrumbs />
        </div>
        <div class="hidden flex-1 md:block">
          <ShellInput />
        </div>
      </div>

      <!-- Right section -->
      <div class="ml-auto flex items-center gap-2">
        <div
          class="flex items-center gap-2 text-yellow-500 dark:text-yellow-400"
        >
          <GitBranch class="h-4 w-4" aria-hidden="true" />
          <button
            class="transition-colors hover:text-emerald-500"
            onclick={toggleMode}
            aria-label="Toggle theme"
          >
            <span class="dark:hidden">stable</span>
            <span class="hidden dark:inline">nightly</span>
          </button>

          <!-- Git status indicators -->
          <div class="hidden items-center gap-1 md:flex">
            {#if GIT_INFO.ahead > 0}
              <ChevronUp class="h-3 w-3" aria-hidden="true" />
              <span>{GIT_INFO.ahead}</span>
            {/if}
            {#if GIT_INFO.modified > 0}
              <span class="text-red-400">!{GIT_INFO.modified}</span>
            {/if}
            {#if GIT_INFO.untracked > 0}
              <span class="text-blue-400">?{GIT_INFO.untracked}</span>
            {/if}
          </div>
        </div>

        <!-- Time display -->
        <div
          class="hidden items-center gap-2 md:flex"
          aria-live="off"
          aria-label="Current time"
        >
          <span class="text-emerald-500" aria-hidden="true">│</span>
          <Clock class="h-4 w-4" aria-hidden="true" />
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
