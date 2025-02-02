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

const isDark = $derived($mode === "dark")
const filteredCommands = $derived(
	input.length > 0
		? commands.filter(
				cmd =>
					cmd.name.toLowerCase().startsWith(input.toLowerCase()) ||
					cmd.aliases?.some(a =>
						a.toLowerCase().startsWith(input.toLowerCase())
					)
			)
		: commands // Show all commands when empty
)

function handleInput() {
	if (isComposing) return
	input = inputRef.textContent?.trim() || ""
	showSuggestions = input.length > 0
}

function handleKeydown(e: KeyboardEvent) {
	if (isComposing) return

	switch (e.key) {
		case "Tab":
			e.preventDefault()
			if (filteredCommands.length === 0) return
			showSuggestions = true
			selectedIndex = (selectedIndex + 1) % filteredCommands.length
			input = filteredCommands[selectedIndex].name
			break

		case "Enter":
			e.preventDefault()
			if (executeCommand(input)) input = ""
			selectedIndex = -1
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

<div class="flex items-center gap-2 group flex-1 font-mono text-sm">
  <!-- Shell prompt -->
  <div class={cn('shrink-0', isDark ? 'text-blue-400' : 'text-blue-600')}>
    ❯
  </div>

  <!-- Input container with focus-based placeholder -->
  <div
    bind:this={inputRef}
    role="textbox"
    tabindex="0"
    aria-haspopup="listbox"
    aria-controls="command-suggestions"
    class={cn(
      'caret-container relative flex-1 outline-none border-0',
      'empty:before:content-[attr(placeholder)] before:text-zinc-400',
      isDark ? 'text-zinc-200' : 'text-zinc-800',
      isFocused ? 'before:opacity-40' : 'before:opacity-100',
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
    }}
  ></div>

  <!-- Enhanced TUI suggestions -->
  {#if showSuggestions}
    <ul
      id="command-suggestions"
      role="listbox"
      class="absolute left-0 top-full w-full mt-1 max-h-[50vh] overflow-y-auto bg-white dark:bg-zinc-800 rounded-md shadow-lg border border-zinc-200 dark:border-zinc-700"
    >
      {#each filteredCommands as cmd, i (cmd.id)}
        <li
          role="option"
          aria-selected={i === selectedIndex}
          class={cn(
            'px-3 py-2 cursor-pointer flex justify-between items-center',
            i === selectedIndex
              ? 'bg-blue-50 dark:bg-zinc-700'
              : 'hover:bg-zinc-50 dark:hover:bg-zinc-700',
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

<style>
  .caret-container {
    caret-color: transparent;
    min-height: 1.5em;
    white-space: pre;
    border: none !important;
  }

  .caret-container:focus::after {
    content: '';
    position: absolute;
    width: 0.6em;
    height: 1.2em;
    background: currentColor;
    animation: blink 1s step-end infinite;
    margin-bottom: -0.6em;
    border: none !important;
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
    opacity: 0.4 !important; /* Dimmed placeholder when focused */
  }

  .caret-container:not(:empty):focus::before {
    content: none !important; /* Hide placeholder when focused and has content */
  }

  /* Add focus state for the container */
  .caret-container:focus {
    outline: none !important;
    box-shadow: none !important;
    border: none !important;
  }
</style>
