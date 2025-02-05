<!-- Modern shell-style command input with oh-my-posh inspired design -->
<script lang="ts">
import { commands } from "$lib/terminal/commands"
import type { CommandHandler } from "$lib/terminal/types"
import { cn } from "$lib/utils"

// Input state
let input = $state("")
let placeholder = $state("type a command...")
let inputRef = $state<HTMLDivElement>(null!)
let isFocused = $state(false)
let isComposing = $state(false)

// Dropdown state
let isDropdownVisible = $state(false)
let filteredCommands = $state<[string, CommandHandler][]>([])
let selectedIndex = $state(0)

// FIXME: when the user selects text the after pseudo-element does not move to the selection

function handleInput() {
	if (isComposing) return
	input = inputRef.textContent?.trim() || ""
}

function handleKeydown(e: KeyboardEvent) {
	if (isComposing) return

	switch (e.key) {
		case "Tab": {
			e.preventDefault()
			if (!isDropdownVisible) {
				filteredCommands = Array.from(commands.entries())
				isDropdownVisible = true
			} else {
				// TODO: Handle selection
			}
			break
		}

		case "Enter":
			e.preventDefault()
			break

		case " ":
		case "Backspace":
			break

		case "Escape":
			break

		case "ArrowDown": {
			e.preventDefault()
			selectedIndex = Math.min(
				selectedIndex + 1,
				filteredCommands.length - 1
			)
			break
		}

		case "ArrowUp": {
			e.preventDefault()
			selectedIndex = Math.max(selectedIndex - 1, 0)
			break
		}
	}
}

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
  <div class="shrink-0 text-blue-600 dark:text-blue-400">
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
        // Layout and positioning
        'caret-container relative flex-1 outline-none',
        
        // Borders and focus states
        'border-0 focus:border-0 focus:ring-0 appearance-none ring-0',
        
        // Text colors
        'text-zinc-800 dark:text-zinc-200',
        
        // Placeholder styling
        'empty:before:content-[attr(placeholder)] before:text-zinc-400',
        'before:opacity-100 focus:before:opacity-40',
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
		isDropdownVisible = false;
      }}
    ></div>

    {#if isDropdownVisible}
      <div
        class={cn(
          // Positioning
          "absolute left-0 top-full z-50 mt-1",
          // Sizing
          "w-full overflow-hidden",
          // Borders and shadows
          "border border-border shadow-lg",
          // Background and text
          "bg-background font-mono text-sm"
        )}
      >
        {#each filteredCommands as [command, handler], i}
          <button
            class={cn(
              // Layout
              "flex items-center w-full px-4 py-2",
              // Interaction
              "cursor-pointer transition-colors",
              // Hover state
              "hover:bg-accent/10 hover:text-accent-foreground",
              // Selected state
              i === selectedIndex 
                ? "bg-accent/20 text-accent-foreground border-l-4 border-emerald-500" 
                : "bg-transparent",
              // Animation
              "duration-200 ease-in-out"
            )}
          >
            <span class="text-primary">{command}</span>
            <div class="flex-1 mx-2 border-b border-border"></div>
            <span class="text-right text-muted-foreground">{handler.help}</span>
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .caret-container {
    caret-color: transparent;
    min-height: 1.5em;
    white-space: nowrap;
    box-shadow: none;
    display: inline-block;
    line-height: 1.2em;
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
