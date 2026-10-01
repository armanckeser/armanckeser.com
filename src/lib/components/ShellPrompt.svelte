<!-- The site's header, laid out as a shell prompt: where you are, a command
     line, and the branch you are on (which is the theme). -->
<script lang="ts">
import { cn } from "$lib/utils"
import { Clock, GitBranch } from "lucide-svelte"
import { toggleMode } from "mode-watcher"
import { tick } from "svelte"
import Cwd from "./Cwd.svelte"
import ShellInput from "./ShellInput.svelte"

// Empty until mounted: the page is prerendered, and a baked-in time would be wrong for everyone.
let currentTime = $state("")

$effect(() => {
	const updateTime = () => {
		currentTime = new Date().toLocaleTimeString("en-US", {
			hour12: false,
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		})
	}

	updateTime()
	const interval = setInterval(updateTime, 1000)
	return () => clearInterval(interval)
})

/** Switches theme. Where the browser can, the new theme opens out from the switch. */
function handleThemeSwitch(e: MouseEvent) {
	const root = document.documentElement
	if (
		!document.startViewTransition ||
		matchMedia("(prefers-reduced-motion: reduce)").matches
	) {
		toggleMode()
		return
	}

	const button = (e.currentTarget as HTMLElement).getBoundingClientRect()
	root.style.setProperty("--switch-x", `${button.left + button.width / 2}px`)
	root.style.setProperty("--switch-y", `${button.top + button.height / 2}px`)
	root.dataset.themeSwitch = ""
	document
		.startViewTransition(async () => {
			toggleMode()
			await tick()
		})
		.finished.finally(() => {
			delete root.dataset.themeSwitch
		})
}
</script>

<header
  class={cn(
    'site-header sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur',
    'supports-[backdrop-filter]:bg-background/75',
    'h-14 px-4 sm:px-8'
  )}
  aria-label="Application header"
>
  <div class="grid h-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 font-mono text-sm sm:grid-cols-3">
    <Cwd />

    <ShellInput />

    <div class="flex shrink-0 items-center gap-2 justify-self-end">
      <div class="flex items-center gap-2 text-highlight">
        <GitBranch class="h-4 w-4" aria-hidden="true" />
        <button
          class="switch rounded-md px-1.5 py-0.5 outline outline-[0.5px] outline-zinc-300 dark:outline-zinc-700"
          onclick={handleThemeSwitch}
          aria-label="Switch theme"
        >
          <span class="dark:hidden">stable</span>
          <span class="hidden dark:inline">nightly</span>
        </button>
      </div>

      <div
        class={cn("hidden items-center gap-2", currentTime && "lg:flex")}
        aria-live="off"
        aria-label="Current time"
      >
        <span class="text-accent" aria-hidden="true">│</span>
        <Clock class="h-4 w-4" aria-hidden="true" />
        <span class="tabular-nums">{currentTime}</span>
      </div>
    </div>
  </div>
</header>

<style>
  /* Its own layer in page transitions, so it holds still while pages change
     beneath it. During a theme switch it joins the page and is revealed with it. */
  .site-header {
    view-transition-name: header;
  }

  :global(html[data-theme-switch]) .site-header {
    view-transition-name: none;
  }

  .switch {
    position: relative;
    transition:
      transform 160ms var(--ease-out),
      color 150ms ease;
  }

  /* The label is small; the target is not. */
  .switch::after {
    content: "";
    position: absolute;
    inset: -0.75rem -0.5rem;
  }

  .switch:active {
    transform: scale(0.96);
  }

  @media (hover: hover) and (pointer: fine) {
    .switch:hover {
      color: hsl(var(--accent));
    }
  }
</style>
