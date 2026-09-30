<script lang="ts">
import {
	type Completion,
	type Line,
	completionsFor,
	parse,
	run,
	warmUp,
} from "$lib/terminal/commands"
import { cn } from "$lib/utils"

let input = $state<HTMLInputElement>()
let value = $state("")
let focused = $state(false)
/** What the last command printed. Cleared as soon as you type again. */
let output = $state<Line[]>([])
let selected = $state(-1)
/** Suggestions stay closed until you type or press Tab, so focusing is quiet. */
let suggesting = $state(false)
/** Bumped when the project list arrives, so `open` completions appear without another keystroke. */
let loaded = $state(0)

/**
 * While Tab or the arrows cycle through candidates, each one is written into the
 * prompt (as zsh does), and the list keeps coming from what was typed before cycling.
 */
let typed = $state<string | null>(null)

const suggestions = $derived<Completion[]>(
	suggesting && loaded >= 0 ? completionsFor(typed ?? value) : []
)
const panelOpen = $derived(
	focused && (output.length > 0 || suggestions.length > 0)
)

/** The input with the part being completed (the command, or its argument) replaced by `c`. */
function complete(from: string, c: Completion) {
	const { name, hasArg } = parse(from)
	return hasArg ? `${name} ${c.value}` : `${c.value} `
}

/** Accepts a candidate outright (a click, or the only match): the list moves on to what comes next. */
function apply(c: Completion) {
	value = complete(typed ?? value, c)
	typed = null
	selected = -1
	input?.focus()
}

function cycle(step: number) {
	const list = completionsFor(typed ?? value)
	if (!list.length) return
	suggesting = true
	if (list.length === 1) return apply(list[0])
	typed ??= value
	selected = (selected + step + list.length) % list.length
	value = complete(typed, list[selected])
}

async function submit() {
	const line = value
	value = ""
	typed = null
	suggesting = false
	selected = -1
	output = await run(line)
}

function onkeydown(e: KeyboardEvent) {
	if (e.isComposing) return
	switch (e.key) {
		case "Tab":
			e.preventDefault()
			cycle(e.shiftKey ? -1 : 1)
			break
		case "ArrowDown":
		case "ArrowUp":
			if (!suggestions.length) return
			e.preventDefault()
			cycle(e.key === "ArrowDown" ? 1 : -1)
			break
		case "Enter":
			e.preventDefault()
			submit()
			break
		case "Escape":
			if (panelOpen) {
				output = []
				suggesting = false
				typed = null
			} else {
				input?.blur()
			}
			break
	}
}

// "/" or Cmd/Ctrl+K from anywhere on the page, unless you're already typing somewhere.
function onGlobalKeydown(e: KeyboardEvent) {
	const target = e.target as HTMLElement
	const typing =
		target.isContentEditable ||
		/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)
	const shortcut =
		(e.key === "k" && (e.metaKey || e.ctrlKey)) ||
		(e.key === "/" && !typing)
	if (!shortcut || (typing && target !== input)) return
	e.preventDefault()
	input?.focus()
}
</script>

<svelte:window onkeydown={onGlobalKeydown} />

<div class="relative hidden w-full min-w-0 items-center gap-2 font-mono text-sm sm:flex">
  <span class="shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true">❯</span>
  <input
    bind:this={input}
    bind:value
    {onkeydown}
    oninput={() => {
      suggesting = true
      typed = null
      selected = -1
      output = []
    }}
    onfocus={() => {
      focused = true
      warmUp().then(() => loaded++)
    }}
    onblur={() => {
      focused = false
      suggesting = false
      output = []
    }}
    class="shell-input w-full min-w-0 bg-transparent text-foreground outline-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
    placeholder={focused ? "" : "type a command…"}
    aria-label="Command line. Type help for commands."
    aria-autocomplete="list"
    aria-controls="shell-panel"
    aria-expanded={panelOpen}
    autocomplete="off"
    autocapitalize="off"
    spellcheck="false"
  />

  {#if !focused}
    <kbd class="pointer-events-none shrink-0 rounded border border-border px-1.5 text-xs text-muted-foreground">/</kbd>
  {/if}

  {#if panelOpen}
    <!-- mousedown is cancelled so clicking a row doesn't blur the input and close the panel first. -->
    <div
      id="shell-panel"
      role="listbox"
      tabindex="-1"
      class="absolute left-0 top-[calc(100%+0.75rem)] z-50 max-h-[60vh] w-full min-w-[26rem] max-w-[40rem] overflow-y-auto rounded-md border border-border bg-background/95 py-1.5 shadow-lg backdrop-blur"
      onmousedown={e => e.preventDefault()}
    >
      {#if suggestions.length}
        {#each suggestions as s, i (s.value)}
          <button
            type="button"
            role="option"
            aria-selected={i === selected}
            class={cn(
              'flex w-full items-baseline gap-3 px-3 py-1 text-left',
              i === selected ? 'bg-accent/15 text-primary' : 'text-foreground hover:bg-accent/10',
            )}
            onclick={() => apply(s)}
          >
            <span>{s.value}</span>
            {#if s.help}<span class="truncate text-muted-foreground">{s.help}</span>{/if}
          </button>
        {/each}
      {:else}
        {#each output as line}
          {#if line.href}
            <a
              href={line.href}
              class="block whitespace-pre px-3 py-0.5 text-foreground hover:bg-accent/10 hover:text-accent"
              onclick={() => input?.blur()}
            >{line.text}</a>
          {:else}
            <p
              class={cn(
                'whitespace-pre px-3 py-0.5',
                line.tone === 'error' && 'text-red-500 dark:text-red-400',
                line.tone === 'muted' && 'text-muted-foreground',
                line.tone === 'accent' && 'text-accent',
              )}
            >{line.text}</p>
          {/if}
        {/each}
      {/if}
    </div>
  {/if}
</div>

<style>
  .shell-input {
    caret-color: hsl(var(--accent));
    caret-shape: block;
  }
</style>
