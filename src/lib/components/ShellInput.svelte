<!-- Modern shell-style command input with oh-my-posh inspired design -->
<script lang="ts">
import { commands, executeCommand } from "$lib/state/commands.svelte"
import { mode } from "mode-watcher"
import { cn } from "$lib/utils"

let input = $state("")
let placeholder = $state("type a command...")
let selectedIndex = $state(-1)
let inputRef = $state<HTMLDivElement>(null!)
let isFocused = $state(false)
let isComposing = $state(false)
let showSuggestions = $state(false)
let tabInitiated = $state(false)

const isDark = $derived($mode === "dark")
const filteredCommands = $derived(
	tabInitiated
		? commands // Show all commands when tab-initiated
		: input.length > 0
			? commands.filter(
					cmd =>
						cmd.name
							.toLowerCase()
							.startsWith(input.toLowerCase()) ||
						cmd.aliases?.some(a =>
							a.toLowerCase().startsWith(input.toLowerCase())
						)
				)
			: []
)

function handleInput() {
	if (isComposing) return
	input = inputRef.textContent?.trim() || ""
	if (input.length === 0) tabInitiated = false
	showSuggestions = input.length > 0 || tabInitiated
}

function handleKeydown(e: KeyboardEvent) {
	if (isComposing) return

	switch (e.key) {
		case "Tab":
			e.preventDefault()
			if (commands.length === 0) return

			if (input.length === 0 && !tabInitiated) {
				tabInitiated = true
				showSuggestions = true
				selectedIndex = 0
			} else {
				selectedIndex = (selectedIndex + 1) % filteredCommands.length
			}

			if (filteredCommands[selectedIndex]) {
				input = filteredCommands[selectedIndex].name
			}
			break

		case "Enter":
			e.preventDefault()
			if (executeCommand(input)) input = ""
			selectedIndex = -1
			showSuggestions = false
			break

		case "Escape":
			input = ""
			selectedIndex = -1
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
</script>

<div class="relative flex items-center gap-2 group flex-1 font-mono text-sm">
  <!-- Shell prompt -->
  <div class={cn('shrink-0', isDark ? 'text-blue-400' : 'text-blue-600')}>
    ❯
  </div>

  <!-- Input container with relative positioning -->
  <div class="relative flex-1">
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
        {#each filteredCommands as cmd, i (cmd.id)}
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
              {#if cmd.aliases && cmd.aliases.length > 0}
                <span class="text-xs opacity-60">
                  ({cmd.aliases.join(', ')})
                </span>
              {/if}
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
    margin-bottom: -0.6em;
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

  .caret-container:focus::before {
    opacity: 0.4; /* Dimmed placeholder when focused */
  }

  .caret-container:not(:empty):focus::before {
    content: none; /* Hide placeholder when focused and has content */
  }
</style>
