<!-- Combined terminal header with shell prompt functionality -->
<script lang="ts">
import { cn } from "$lib/utils"
import { ChevronUp, Clock, Computer, GitBranch } from "lucide-svelte"
import { toggleMode } from "mode-watcher"
import Breadcrumbs from "./Breadcrumbs.svelte"
import ShellInput from "./ShellInput.svelte"

// Time management
let currentTime = $state<string>("00:00:00")
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
    'supports-[backdrop-filter]:bg-background/75',
    'transition-colors duration-300 ease-in-out',
  )}
  aria-label="Application header"
>
  <div 
    class="container h-14 px-4 sm:px-8"
    style="padding-right: calc(var(--scrollbar-width) + 1rem)"
  >
    <!-- Switch to grid layout for better control -->
    <div class="grid h-full grid-cols-2 sm:grid-cols-3 justify-between items-center gap-4 font-mono text-sm">
      <!-- Left section with fixed width -->
      <div class="flex items-center gap-2 shrink-0">
        <a href="/" class="shrink-0" aria-label="Go to home">
          <Computer class="h-4 w-4" aria-hidden="true" />
        </a>
        <span class="text-accent shrink-0" aria-hidden="true">│</span>
        <Breadcrumbs />
      </div>

      <!-- Center section with shell input -->
      <ShellInput />

      <!-- Right section with fixed width -->
      <div class="flex items-center gap-2 shrink-0 justify-self-end">
        <div class="flex items-center gap-2 text-highlight dark:text-highlight">
          <GitBranch class="h-4 w-4" aria-hidden="true" />
          <button
            class="transition-colors hover:text-accent outline outline-[0.5px] outline-zinc-200 dark:outline-zinc-800 rounded-md px-1 py-0.5"
            onclick={toggleMode}
            aria-label="Toggle theme"
          >
            <span class="dark:hidden">stable</span>
            <span class="hidden dark:inline">nightly</span>
          </button>

          <!-- Git status indicators -->
          <div class="hidden whitespace-nowrap items-center gap-1 md:flex">
            <div class="flex items-center">
              <ChevronUp class="h-3 w-3 p-0" aria-hidden="true" />
              <span class="dark:hidden">0</span>
              <span class="hidden dark:inline">1</span>
            </div>
            <span class="text-red-400">!0</span>
            <span class="text-blue-400 ">?0</span>
          </div>
        </div>

        <!-- Time display -->
        <div
          class="hidden items-center gap-2 md:flex"
          aria-live="off"
          aria-label="Current time"
        >
          <span class="text-accent" aria-hidden="true">│</span>
          <Clock class="h-4 w-4" aria-hidden="true" />
          <span class="animate-fade-in">{currentTime}</span>
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
