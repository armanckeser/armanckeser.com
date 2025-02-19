<!--
TODO: [ ] **Focus Effects**
  - Change background to screenlike background when focused

TODO: [ ] **Command Completion**
  - Show preview of completed command in muted text
  - Accept completion on:
    - Right arrow key
    - Click/tap on suggestion
  - Handle partial matches
*/
-->
<script lang="ts">
import {
	commands,
	get_completions,
	normalizeCommandInput,
} from "$lib/terminal/commands"
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

	updateFullCommand = (command?: string) => {
		if (command) {
			this.ref.textContent = command
		}
		this.full_command = normalizeCommandInput(this.ref.textContent || "")
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
	selectedIndex = $state(-1)

	filteredCompletions = $derived.by(() =>
		get_completions(commandState.full_command)
	)

	constructor(commandState: CommandState) {
		this.commandState = commandState
	}

	reset = () => {
		this.selectedIndex = -1
		this.hide()
	}

	show = () => {
		this.isVisible = true
	}
	hide = () => {
		this.isVisible = false
	}

	incrementIndex = () => {
		this.selectedIndex =
			(this.selectedIndex + 1) % this.filteredCompletions.length
	}

	decrementIndex = () => {
		this.selectedIndex =
			(this.selectedIndex - 1 + this.filteredCompletions.length) %
			this.filteredCompletions.length
	}

	clampIndex = () => {
		this.selectedIndex = Math.max(
			-1,
			Math.min(this.selectedIndex, this.filteredCompletions.length - 1)
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
		case "ArrowDown":
		case "ArrowUp": {
			e.preventDefault()
			if (!dropdown.isVisible) {
				dropdown.show()
				break
			}

			// Handle navigation
			if (e.shiftKey || e.key === "ArrowUp") {
				dropdown.decrementIndex()
			} else {
				dropdown.incrementIndex()
			}

			// Update command and cursor position
			const completion =
				dropdown.filteredCompletions[dropdown.selectedIndex]
			if (!completion) return
			if (completion.type === "command") {
				commandState.ref.innerHTML = completion.text
			} else {
				commandState.ref.innerHTML =
					commandState.command + " " + completion.text
			}
			const range = document.createRange()
			const sel = window.getSelection()
			range.selectNodeContents(commandState.ref)
			range.collapse(false)
			sel?.removeAllRanges()
			sel?.addRange(range)
			break
		}
		case "Enter": {
			e.preventDefault()
			commandState.updateFullCommand()
			const handler = commands.get(commandState.command)
			handler?.execute(...commandState.arguments)
			commandState.reset()
			dropdown.reset()
			break
		}
		case "Escape": {
			e.preventDefault()
			dropdown.hide()
			break
		}
		default: {
			commandState.updateFullCommand()
			dropdown.reset()
		}
	}
}
</script>

<!-- Shell input container -->
<div class="hidden sm:flex items-center gap-2 w-full min-w-0 font-mono text-sm">
  <!-- Shell prompt -->
  <div class="shrink-0 text-blue-600 dark:text-blue-400">❯</div>

  <div class="flex flex-col w-full min-w-0">
    <div
      bind:this={commandState.ref}
      role="textbox"
      tabindex="-1"
      aria-haspopup="listbox"
      aria-controls="command-suggestions"
      class={cn(
        // Layout and positioning
        'caret-container relative w-full min-w-0 outline-none min-h-[1.5em] whitespace-nowrap text-nowrap block line-height-[1.2em]',
        'focus:[box-shadow:none]',

        // Text colors
        'text-foreground dark:text-foreground',

        // Placeholder
        'empty:before:content-[attr(placeholder)] before:text-muted-foreground',
        'before:opacity-100 empty:focus:before:content-[""]',

        // Cursor
        commandState.needsBlinkingCursor
          ? 'focus:after:inline'
          : 'focus:after:hidden caret-accent',

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
        if (commandState.ref.textContent?.trim() === '') {
          commandState.ref.innerHTML = '';
        }
      }}
	  oninput={()=> {
		commandState.updateFullCommand();
	  }}
    ></div>
    {#if dropdown.isVisible}
      <div
        class={cn(
          'flex flex-col',
          // Positioning
          'absolute top-full z-50',
          // Sizing
          'w-full min-w-[25rem] max-w-[40rem] overflow-y-auto overflow-x-auto',
          // Borders and shadows
          'border border-border shadow-lg',
          // Background and text
          'bg-background font-mono text-sm',
        )}
      >
        {#each dropdown.filteredCompletions as { text, help, type }, i (text)}
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
              type === 'command' ? 'pl-4' : 'pl-6'
            )}
          >
            <span class="text-primary">{text}</span>
            {#if help}
              <div class="flex-1 mx-2 border-b border-border"></div>
              <span class="text-right text-muted-foreground">{help}</span>
            {/if}
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
