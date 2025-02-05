<!-- Modern shell-style command input with oh-my-posh inspired design -->
<script lang="ts">
import { commands } from "$lib/terminal/commands"
import type { CommandHandler } from "$lib/terminal/types"
import { cn } from "$lib/utils"

class CommandState {
	ref = $state<HTMLDivElement>(null!)

	full_command = $state("")

	isFocused = $state(false)
	isComposing = $state(false)

	placeholder = $derived(this.isFocused ? "" : "type a command...")

	command = $derived(this.full_command.split(" ")[0])
	arguments = $derived(this.full_command.split(" ").slice(1))

	reset = () => {
		this.full_command = ""
		this.ref.textContent = ""
	}
}

class DropdownState {
	isVisible = $state(false)
	selectedIndex = $state(0)
	filteredCommands = $derived(
		Array.from(commands.entries()).filter(([command, handler]) =>
			command.startsWith(inputState.full_command)
		)
	)

	show = () => (this.isVisible = true)
	hide = () => (this.isVisible = false)
	reset = () => {
		this.selectedIndex = 0
		this.hide()
	}

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
const inputState = new CommandState()
const dropdown = new DropdownState()

function handleInput() {
	if (inputState.isComposing) return
	inputState.full_command = inputState.ref.textContent?.trim() || ""
}

function handleKeydown(e: KeyboardEvent) {
	if (inputState.isComposing) return

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
			inputState.ref.textContent = command
			// Move cursor to end of input
			const range = document.createRange()
			const selection = window.getSelection()
			range.selectNodeContents(inputState.ref)
			range.collapse(false)
			selection?.removeAllRanges()
			selection?.addRange(range)
			break
		}

		case "Enter": {
			e.preventDefault()
			const [, handler] =
				dropdown.filteredCommands[dropdown.selectedIndex]
			handler.execute(inputState.full_command)
			inputState.reset()
			dropdown.reset()
			break
		}
	}

	dropdown.clampIndex()
}

$effect(() => {
	if (inputState.isFocused) {
		inputState.placeholder = ""
	} else {
		inputState.placeholder = "type a command..."
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
			bind:this={inputState.ref}
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
				
				'empty:before:content-[attr(placeholder)] before:text-zinc-400',
				'before:opacity-100 focus:before:opacity-40',
			)}
			contenteditable="true"
			placeholder={inputState.placeholder}
			spellcheck={false}
			oninput={handleInput}
			onkeydown={handleKeydown}
			oncompositionstart={() => (inputState.isComposing = true)}
			oncompositionend={() => (inputState.isComposing = false)}
			onfocus={() => (inputState.isFocused = true)}
			onblur={() => {
				inputState.isFocused = false;
				dropdown.hide()
			}}
		></div>

		{#if dropdown.isVisible}
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
				{#each dropdown.filteredCommands as [command, handler], i}
					<button
						class={cn(
							// Layout
							"flex items-center w-full px-4 py-2",
							// Interaction
							"cursor-pointer transition-colors",
							// Hover state
							"hover:bg-accent/10 hover:text-accent-foreground",
							// Selected state
							i === dropdown.selectedIndex 
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
