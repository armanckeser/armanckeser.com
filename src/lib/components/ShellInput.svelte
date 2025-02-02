<!-- Shell-style command input with completions -->
<script lang="ts">
import { commands, executeCommand } from "$lib/state/commands.svelte"
import { mode } from "mode-watcher"
import { cn } from "$lib/utils"

let input = $state("")
let selectedIndex = $state(0)
let inputRef = $state<HTMLInputElement>(null!)
let showSuggestions = $state(false)

const promptChar = $derived($mode === "dark" ? "#" : "$")

const filteredCommands = $derived(
	commands.filter(
		cmd =>
			!input ||
			cmd.name.toLowerCase().includes(input.toLowerCase()) ||
			cmd.aliases?.some(a =>
				a.toLowerCase().includes(input.toLowerCase())
			)
	)
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
			}
			break
		case "Tab":
			e.preventDefault()
			const selected = filteredCommands[selectedIndex]
			if (selected) {
				input = selected.name
			}
			break
	}
}

function selectCommand(command: string) {
	executeCommand(command)
	input = ""
	inputRef?.focus()
}
</script>

<div class="relative font-mono group">
  <div class="flex items-center gap-2">
    <span class="text-emerald-500 dark:text-emerald-400">{promptChar}</span>
    <input
      bind:this={inputRef}
      bind:value={input}
      class="bg-transparent text-sm focus:outline-none w-[200px] placeholder:text-muted-foreground caret-emerald-500"
      placeholder="enter command..."
      onkeydown={handleKeyDown}
      onfocus={() => (showSuggestions = true)}
      onblur={() => setTimeout(() => (showSuggestions = false), 100)}
    />
  </div>

  {#if showSuggestions && filteredCommands.length > 0}
    <div
      class="absolute top-full left-0 mt-1 w-full max-w-[400px] font-mono text-sm bg-background border rounded-lg shadow-lg z-50 overflow-hidden"
      style="min-width: var(--input-width)"
    >
      <div class="max-h-[300px] overflow-y-auto">
        {#each filteredCommands as command, i}
          <button
            class={cn(
              'w-full px-4 py-2 text-left flex items-center justify-between gap-4',
              'hover:bg-muted/50 transition-colors',
              selectedIndex === i && 'bg-muted/50 text-emerald-500',
            )}
            onmousedown={() => selectCommand(command.name)}
          >
            <span class="font-medium">{command.name}</span>
            <span class="text-xs text-muted-foreground truncate">
              {command.description}
            </span>
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>
