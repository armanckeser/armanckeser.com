<!-- Modern shell-style command input with oh-my-posh inspired design -->
<script lang="ts">
import { mode } from "mode-watcher"
import { cn } from "$lib/utils"

let input = $state("")
let placeholder = $state("type a command...")
let inputRef = $state<HTMLDivElement>(null!)
let isFocused = $state(false)
let isComposing = $state(false)
$inspect(`input: ${input}`)
$inspect(`isComposing: ${isComposing}`)

const isDark = $derived($mode === "dark")

function handleInput() {
	if (isComposing) return
	input = inputRef.textContent?.trim() || ""
}

function handleKeydown(e: KeyboardEvent) {
	if (isComposing) return

	switch (e.key) {
		case "Tab": {
			e.preventDefault()
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

		case "ArrowDown":
			break

		case "ArrowUp":
			break
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
      }}
    ></div>
  </div>
</div>

<style>
  .caret-container {
    caret-color: transparent;
    min-height: 1.5em;
    white-space: nowrap;
    border: 0 !important;
    border-color: transparent !important;
    box-shadow: none !important;
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
    margin-top: 0;
    vertical-align: top;
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
