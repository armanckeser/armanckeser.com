<!-- Modern shell-style command input with oh-my-posh inspired design -->
<script lang="ts">
import { commands, executeCommand } from "$lib/state/commands.svelte"
import { mode } from "mode-watcher"
import { cn } from "$lib/utils"
import { page } from "$app/state"
import { getPosts, getContentTree } from "$lib/utils/posts"

let input = $state("")
let placeholder = $state("type a command...")
let selectedIndex = $state(-1)
let inputRef = $state<HTMLDivElement>(null!)
let isFocused = $state(false)
let isComposing = $state(false)
let showSuggestions = $state(false)
let tabInitiated = $state(false)
let lastTabCommand = $state("")
let posts = getPosts()

const isDark = $derived($mode === "dark")
const currentPath = $derived(page.url.pathname)
const pathSuggestions = $derived(getPathSuggestions(input, currentPath))

const filteredCommands = $derived(() => {
	const [cmd, ...args] = input.trim().split(" ")

	// When just "cd" is typed, show all available paths
	if (cmd === "cd" && args.length === 0) {
		const paths = getAvailablePaths(currentPath)
		return paths.map(path => ({
			name: `cd ${path}`,
			description: `Navigate to ${path}`,
			action: () => executeCommand(`cd ${path}`),
		}))
	}

	// When "cd" with partial path is typed, filter paths
	if (cmd === "cd" && args.length > 0) {
		const partialPath = args.join(" ")
		const paths = getAvailablePaths(currentPath)
		return paths
			.filter(path => path.startsWith(partialPath))
			.map(path => ({
				name: `cd ${path}`,
				description: `Navigate to ${path}`,
				action: () => executeCommand(`cd ${path}`),
			}))
	}

	// For other commands, filter by command name
	return commands.filter(command =>
		command.name.toLowerCase().startsWith(cmd.toLowerCase())
	)
})

function handleInput() {
	if (isComposing) return
	input = inputRef.textContent?.trim() || ""
	if (input.length === 0) tabInitiated = false
	showSuggestions = input.length > 0 || tabInitiated
}

function handleKeydown(e: KeyboardEvent) {
	if (isComposing) return

	switch (e.key) {
		case "Tab": {
			e.preventDefault()

			// Initialize tab completion
			if (!tabInitiated) {
				tabInitiated = true
				showSuggestions = true

				// Store the current command for cycling
				lastTabCommand = input.split(" ")[0]

				// Get all available commands for cycling
				if (input.length === 0) {
					selectedIndex = 0
				} else if (input === "cd") {
					// Show all paths when just "cd" is typed
					selectedIndex = 0
				} else {
					selectedIndex = 0
				}
			} else {
				// Cycle through filtered commands
				selectedIndex = (selectedIndex + 1) % filteredCommands().length
			}

			// Update input with selected command
			if (filteredCommands()[selectedIndex]) {
				input = filteredCommands()[selectedIndex].name
			}
			break
		}

		case "Enter":
			e.preventDefault()
			if (executeCommand(input)) input = ""
			selectedIndex = -1
			showSuggestions = false
			tabInitiated = false
			lastTabCommand = ""
			break

		case " ":
		case "Backspace":
			// Reset tab completion when space or backspace is pressed
			tabInitiated = false
			lastTabCommand = ""
			break

		case "Escape":
			input = ""
			selectedIndex = -1
			showSuggestions = false
			tabInitiated = false
			lastTabCommand = ""
			break

		case "ArrowDown":
			e.preventDefault()
			showSuggestions = true
			selectedIndex = Math.min(
				filteredCommands.length - 1,
				selectedIndex + 1
			)
			break

		case "ArrowUp":
			e.preventDefault()
			showSuggestions = true
			selectedIndex = Math.max(0, selectedIndex - 1)
			break
	}
}

function syncCaretPosition() {
	if (!inputRef) return
	const range = document.createRange()
	const sel = window.getSelection()!
	range.selectNodeContents(inputRef)
	range.collapse(false)
	sel.removeAllRanges()
	sel.addRange(range)
}

$effect(() => {
	if (inputRef) {
		inputRef.textContent = input
		syncCaretPosition()
	}
})

$effect(() => {
	if (isFocused) {
		placeholder = ""
	} else {
		placeholder = "type a command..."
	}
})

function getPathSuggestions(input: string, currentPath: string) {
	const [_, ...cdArgs] = input.split(" ")
	const pathInput = cdArgs.join(" ")

	const base = currentPath === "/" ? "~" : currentPath
	const availablePaths = getAvailablePaths(base)

	return availablePaths
		.filter((path: string) => path.startsWith(pathInput))
		.map((path: string) => `cd ${path}`)
}

function getAvailablePaths(currentPath: string): string[] {
	const contentTree = getContentTree()
	const base = currentPath === "/" ? "~" : currentPath

	// At root directory, show home aliases and sections
	if (base === "~") {
		return ["~", "/home", ...Object.keys(contentTree)]
	}

	// Split the current path
	const parts = base.split("/").filter(Boolean)

	// If we are in a section, list its slugs with navigation options
	if (parts.length === 1 && contentTree[parts[0]]) {
		return ["..", "~", "/home", ...contentTree[parts[0]]]
	}

	// If we are inside a post, show navigation options
	if (parts.length >= 2) {
		return ["..", "~", "/home"]
	}

	// Fallback to showing all options
	return ["~", "/home", ...Object.keys(contentTree)]
}
</script>

<div class="relative flex items-center gap-2 group flex-1 font-mono text-sm">
  <!-- Shell prompt -->
  <div class={cn('shrink-0', isDark ? 'text-blue-400' : 'text-blue-600')}>
    ❯
  </div>

  <!-- Input container with relative positioning -->
  <div class="relative flex-1 translate-y-[0.05em]">
    <div
      bind:this={inputRef}
      role="textbox"
      tabindex="0"
      aria-haspopup="listbox"
      aria-controls="command-suggestions"
      class={cn(
        'caret-container relative flex-1 outline-none',
        'border-0 focus:border-0 focus:ring-0',
        'empty:before:content-[attr(placeholder)] before:text-zinc-400',
        'focus:after:translate-y-[0.1em]',
        isDark ? 'text-zinc-200' : 'text-zinc-800',
        isFocused ? 'before:opacity-40' : 'before:opacity-100',
        'appearance-none ring-0',
      )}
      contenteditable="true"
      {placeholder}
      spellcheck={false}
      oninput={handleInput}
      onkeydown={handleKeydown}
      oncompositionstart={() => (isComposing = true)}
      oncompositionend={() => (isComposing = false)}
      onfocus={() => (isFocused = true)}
      onblur={() => {
        isFocused = false;
        showSuggestions = false;
        tabInitiated = false;
      }}
    ></div>

    <!-- Updated suggestions positioning and styling -->
    {#if showSuggestions && filteredCommands.length > 0}
      <ul
        id="command-suggestions"
        role="listbox"
        class={cn(
          'absolute left-0 top-full w-full mt-1 max-h-[50vh] overflow-y-auto',
          'font-mono rounded-lg border shadow-lg',
          'bg-white border-zinc-200 text-zinc-800',
          'dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-200',
          'divide-y divide-zinc-200/50 dark:divide-zinc-700/50',
          'backdrop-blur-sm',
        )}
      >
        {#each filteredCommands() as cmd, i (cmd.name)}
          <li
            role="option"
            aria-selected={i === selectedIndex}
            class={cn(
              'px-4 py-2 cursor-pointer flex justify-between items-center',
              'transition-colors group',
              i === selectedIndex
                ? 'bg-blue-50/80 dark:bg-zinc-800 ring-2 ring-blue-200 dark:ring-zinc-600'
                : 'hover:bg-zinc-100/80 dark:hover:bg-zinc-800',
              isDark ? 'text-zinc-100' : 'text-zinc-800',
            )}
            onmousedown={() => {
              input = cmd.name;
              executeCommand(cmd.name);
            }}
          >
            <div class="flex items-center gap-2">
              <span class="font-medium">{cmd.name}</span>
            </div>
            <span class="text-sm opacity-70">{cmd.description}</span>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>

<style>
  .caret-container {
    caret-color: transparent;
    min-height: 1.5em;
    white-space: pre;
    border: 0 !important;
    border-color: transparent !important;
    box-shadow: none !important;
  }

  .caret-container:focus::after {
    content: '';
    position: absolute;
    width: 0.6em;
    height: 1.2em;
    background: currentColor;
    animation: blink 1s step-end infinite;
  }

  @keyframes blink {
    0%,
    50% {
      opacity: 1;
    }
    51%,
    100% {
      opacity: 0;
    }
  }

  /* Scrollbar styling */
  div::-webkit-scrollbar {
    width: 8px;
  }

  div::-webkit-scrollbar-track {
    background: transparent;
  }

  div::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 20px;
    border: transparent;
  }

</style>
