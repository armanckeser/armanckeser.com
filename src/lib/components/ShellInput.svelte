<!-- Modern shell-style command input with oh-my-posh inspired design -->
<script lang="ts">
import { commands, executeCommand } from "$lib/state/commands.svelte"
import { mode } from "mode-watcher"
import { cn } from "$lib/utils"

let input = $state("")
let selectedIndex = $state(0)
let inputRef = $state<HTMLInputElement>(null!)
let showSuggestions = $state(false)

const isDark = $derived($mode === "dark")

// Filter commands with fuzzy matching for better shell-like completion
const filteredCommands = $derived(
	commands
		.filter(cmd => {
			if (!input) return true
			const searchStr = input.toLowerCase()
			return (
				cmd.name.toLowerCase().includes(searchStr) ||
				cmd.aliases?.some(a => a.toLowerCase().includes(searchStr)) ||
				cmd.description.toLowerCase().includes(searchStr)
			)
		})
		.sort((a, b) => {
			// Prioritize exact matches and starts-with matches
			const aName = a.name.toLowerCase()
			const bName = b.name.toLowerCase()
			const searchStr = input.toLowerCase()
			if (aName === searchStr) return -1
			if (bName === searchStr) return 1
			if (aName.startsWith(searchStr) && !bName.startsWith(searchStr))
				return -1
			if (bName.startsWith(searchStr) && !aName.startsWith(searchStr))
				return 1
			return 0
		})
)

function handleKeyDown(e: KeyboardEvent) {
	switch (e.key) {
		case "ArrowDown":
			e.preventDefault()
			selectedIndex = (selectedIndex + 1) % filteredCommands.length
			break
		case "ArrowUp":
			e.preventDefault()
			selectedIndex =
				selectedIndex - 1 < 0
					? filteredCommands.length - 1
					: selectedIndex - 1
			break
		case "Enter":
			e.preventDefault()
			const command = filteredCommands[selectedIndex]
			if (command) {
				executeCommand(command.name)
				input = ""
				showSuggestions = false
			}
			break
		case "Tab":
			e.preventDefault()
			const selected = filteredCommands[selectedIndex]
			if (selected) {
				input = selected.name
				selectedIndex = 0
			}
			break
		case "Escape":
			showSuggestions = false
			break
		case "c":
			if (e.ctrlKey) {
				input = ""
				showSuggestions = false
			}
			break
	}
}

function selectCommand(command: string) {
	executeCommand(command)
	input = ""
	showSuggestions = false
	inputRef?.focus()
}
</script>

<div class="relative flex items-center gap-2 group flex-1 font-mono">
  <!-- Shell prompt -->
  <div class="flex items-center gap-1.5 text-[13px] shrink-0">
    <span class={isDark ? 'text-blue-400' : 'text-blue-600'}>❯</span>
  </div>

  <!-- Command input -->
  <div class="relative flex-1">
    <input
      bind:this={inputRef}
      bind:value={input}
      class={cn(
        'w-full min-w-[300px] bg-transparent',
        'text-[13px] leading-none tracking-tight',
        'focus:outline-none border-none focus:ring-0 px-0 py-[3px]',
        'placeholder:text-muted-foreground/30',
        isDark ? 'text-zinc-200' : 'text-zinc-800',
      )}
      placeholder="type a command..."
      spellcheck="false"
      autocomplete="off"
      onkeydown={handleKeyDown}
      onfocus={() => (showSuggestions = true)}
      onblur={() => setTimeout(() => (showSuggestions = false), 100)}
    />

    <!-- Command suggestions -->
    {#if showSuggestions && filteredCommands.length > 0}
      <div
        class={cn(
          'absolute top-full left-0 mt-1 z-50',
          'w-full max-w-[500px] overflow-hidden',
          'border-[1.5px] shadow-lg',
          isDark
            ? 'bg-[#1a1b26] border-zinc-700/50'
            : 'bg-[#fafafa] border-zinc-300/50',
        )}
      >
        <div class="max-h-[300px] overflow-y-auto py-1">
          {#each filteredCommands as command, i}
            <button
              class={cn(
                'w-full px-3 py-1.5 text-left',
                'flex items-center gap-4',
                isDark
                  ? [
                      'hover:bg-zinc-800/80',
                      selectedIndex === i && 'bg-zinc-800',
                    ]
                  : ['hover:bg-zinc-100', selectedIndex === i && 'bg-zinc-100'],
              )}
              onmousedown={() => selectCommand(command.name)}
            >
              <!-- Command name -->
              <span
                class={cn(
                  'font-medium flex-none',
                  isDark
                    ? [
                        'text-zinc-300',
                        selectedIndex === i && 'text-emerald-400',
                      ]
                    : [
                        'text-zinc-700',
                        selectedIndex === i && 'text-emerald-600',
                      ],
                )}
              >
                {command.name}
              </span>

              <!-- Command description -->
              <span
                class={cn(
                  'text-[11px] truncate opacity-70',
                  isDark ? 'text-zinc-400' : 'text-zinc-600',
                )}
              >
                {command.description}
              </span>
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  /* Simple block caret styling like the example */
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
