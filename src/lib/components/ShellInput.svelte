<!--
TODO: [ ] **Focus Effects**
  - Change background to screenlike background when focused

TODO: [ ] **Command Completion**
  - Show preview of completed command in muted text
  - Accept completion on:
    - Right arrow key
    - Tab key
    - Click/tap on suggestion
  - Handle partial matches
  - Support command history navigation
*/
-->
<script lang="ts">
import { commands } from "$lib/terminal/commands"
import { cn } from "$lib/utils"

class CommandState {
	ref = $state<HTMLDivElement>(null!)

	full_command = $state("")
	command = $derived(this.full_command.split(" ")[0])
	arguments = $derived(this.full_command.split(" ").slice(1))

	isComposing = $state(false)

	// Selection tracking
	offsets = $state({
		start: 0,
		end: 0,
	})
	hasSelection = $derived(this.offsets.start < this.offsets.end)
	needsBlinkingCursor = $derived(
		!this.hasSelection &&
			this.offsets.end === (this.ref?.textContent || "").length
	)

	reset = () => {
		this.full_command = ""
		this.ref.innerHTML = ""
		this.offsets = {
			start: 0,
			end: 0,
		}
	}

	updateSelection() {
		const sel = window.getSelection()
		if (!sel || !this.ref.contains(sel.anchorNode)) return

		const range = sel.getRangeAt(0)
		const preCaretRange = range.cloneRange()
		preCaretRange.selectNodeContents(this.ref)

		preCaretRange.setEnd(range.startContainer, range.startOffset)
		const preCaretRangeStart = preCaretRange.toString().length

		preCaretRange.setEnd(range.endContainer, range.endOffset)
		const preCaretRangeEnd = preCaretRange.toString().length

		if (preCaretRangeStart > preCaretRangeEnd) return

		this.offsets = {
			start: preCaretRangeStart,
			end: preCaretRangeEnd,
		}
	}
}

class DropdownState {
	commandState: CommandState
	isVisible = $state(false)
	selectedIndex = $state(0)
	filteredCommands = $derived(
		Array.from(commands.entries()).filter(([command]) =>
			command.startsWith(commandState.full_command)
		)
	)

	constructor(commandState: CommandState) {
		this.commandState = commandState
	}

	reset = () => {
		this.selectedIndex = 0
		this.hide()
	}

	show = () => (this.isVisible = true)
	hide = () => (this.isVisible = false)

	incrementIndex = () => {
		this.selectedIndex =
			(this.selectedIndex + 1) % this.filteredCommands.length
	}

	decrementIndex = () => {
		this.selectedIndex =
			(this.selectedIndex - 1 + this.filteredCommands.length) %
			this.filteredCommands.length
	}

	clampIndex = () => {
		this.selectedIndex = Math.max(
			0,
			Math.min(this.selectedIndex, this.filteredCommands.length - 1)
		)
	}
}

// State instances
const commandState = new CommandState()
const dropdown = new DropdownState(commandState)

$effect(() => {
	const update = () => commandState.updateSelection()
	document.addEventListener("selectionchange", update)
	return () => document.removeEventListener("selectionchange", update)
})

function handleKeydown(e: KeyboardEvent) {
	if (commandState.isComposing) return

	switch (e.key) {
		case "Tab":
		case "Shift+Tab":
		case "ArrowDown":
		case "ArrowUp": {
			e.preventDefault()
			if (!dropdown.isVisible) {
				dropdown.show()
				break
			}
			e.key === "Tab" || e.key === "ArrowDown"
				? dropdown.incrementIndex()
				: dropdown.decrementIndex()
			const command = dropdown.filteredCommands[dropdown.selectedIndex][0]
			commandState.ref.textContent = command
			// Move cursor to end of input
			const range = document.createRange()
			const selection = window.getSelection()
			range.selectNodeContents(commandState.ref)
			range.collapse(false)
			selection?.removeAllRanges()
			selection?.addRange(range)
			break
		}

		case "Enter": {
			e.preventDefault()
			const handler = commands.get(commandState.command)
			handler?.execute(...commandState.arguments)
			commandState.reset()
			dropdown.reset()
			break
		}
	}
	dropdown.clampIndex()
}
</script>

<div
  class="hidden sm:flex items-center gap-2 flex-1 font-mono text-sm max-w-[30rem]"
>
  <!-- Shell prompt -->
  <div class="shrink-0 text-blue-600 dark:text-blue-400">❯</div>

  <div class="flex flex-col">
    <div
      bind:this={commandState.ref}
      role="textbox"
      tabindex="-1"
      aria-haspopup="listbox"
      aria-controls="command-suggestions"
      class={cn(
        // Layout and positioning
        'caret-container relative flex-1 outline-none min-h-[1.5em] whitespace-nowrap text-nowrap block line-height-[1.2em]',

        'focus:[box-shadow:none]',

        // Text colors
        'text-foreground dark:text-foreground',

        // Placeholder
        'empty:before:content-[attr(placeholder)] before:text-muted-foreground',
        'before:opacity-100 empty:focus:before:content-[""]',

        // Cursor
        commandState.needsBlinkingCursor
          ? 'focus:after:inline'
          : 'focus:after:hidden  caret-accent',

        'focus:after:animate-[blink_1s_step-end_infinite] focus:after:content-[""] focus:after:absolute focus:after:top-[0.2em] focus:after:w-[0.6em] focus:after:h-[1.2em] focus:after:bg-accent',

        // Add these to prevent <br> insertion
        '[&>br]:hidden',
      )}
      contenteditable="true"
      placeholder="type a command..."
      spellcheck={false}
      onkeydown={handleKeydown}
      oncompositionstart={() => (commandState.isComposing = true)}
      oncompositionend={() => (commandState.isComposing = false)}
      onblur={() => {
        dropdown.hide();
        // to fix a stupid bug where the browser inserts a <br> when the input is empty
        if (commandState.ref.textContent?.trim() === '') {
          commandState.ref.innerHTML = '';
        }
      }}
      oninput={() => {
        commandState.full_command = commandState.ref.textContent?.trim() || '';
      }}
    ></div>
    {#if dropdown.isVisible}
      <div
        class={cn(
          'flex flex-col',
          // Positioning
          'absolute top-full z-50',
          // Sizing
          'w-[100vw] sm:min-w-[25rem] sm:max-w-40 overflow-y-auto overflow-x-auto',
          // Borders and shadows
          'border border-border shadow-lg',
          // Background and text
          'bg-background font-mono text-sm',
        )}
      >
        {#each dropdown.filteredCommands as [command, handler], i}
          <button
            class={cn(
              // Layout
              'flex items-center w-full px-4 py-2',
              // Interaction
              'cursor-pointer transition-colors',
              // Hover state
              'hover:bg-accent/10 hover:text-accent-foreground',
              // Selected state
              i === dropdown.selectedIndex
                ? 'bg-accent/20 text-accent-foreground border-l-4 border-accent'
                : 'bg-transparent',
              // Animation
              'duration-200 ease-in-out',
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
    box-shadow: none;
    caret-color: transparent;
  }

  div {
    scrollbar-width: none;
  }
</style>
