<script lang="ts">
/**
 * The shared source of a post. CodeMirror over the Yjs text, so every keystroke
 * (yours or Claude's) lands for both of you, with each other's cursors and the
 * commented passages marked where they are.
 */
import { defaultKeymap, indentWithTab } from "@codemirror/commands"
import { markdown, markdownLanguage } from "@codemirror/lang-markdown"
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language"
import {
	EditorState,
	RangeSetBuilder,
	StateEffect,
	StateField,
} from "@codemirror/state"
import {
	Decoration,
	type DecorationSet,
	EditorView,
	keymap,
	placeholder,
} from "@codemirror/view"
import { tags as t } from "@lezer/highlight"
import { onMount } from "svelte"
import { yCollab, yUndoManagerKeymap } from "y-codemirror.next"
import * as Y from "yjs"
import type { Collab } from "$lib/studio/collab.svelte"
import { headingId } from "$lib/studio/threads"
import type { ThreadView } from "$lib/studio/types"

type Props = {
	collab: Collab
	threads: ThreadView[]
	active: string | null
	/** A passage was selected (or the selection went away). */
	onselect: (
		selection: {
			from: number
			to: number
			quote: string
			top: number
		} | null
	) => void
	onthread: (id: string) => void
	/** The heading the writer is under, so the preview can follow. */
	onheading: (id: string | null) => void
	oncomment: () => void
}

const {
	collab,
	threads,
	active,
	onselect,
	onthread,
	onheading,
	oncomment,
}: Props = $props()

let host: HTMLDivElement
let view: EditorView | undefined

// ------------------------------------------------------------ comment marks

const setMarks = StateEffect.define<DecorationSet>()
const marks = StateField.define<DecorationSet>({
	create: () => Decoration.none,
	update(value, tr) {
		for (const e of tr.effects) if (e.is(setMarks)) return e.value
		return value.map(tr.changes)
	},
	provide: f => EditorView.decorations.from(f),
})

function decorations(
	list: ThreadView[],
	current: string | null,
	length: number
): DecorationSet {
	const builder = new RangeSetBuilder<Decoration>()
	const ranges = list
		.filter(
			th =>
				!th.resolved &&
				th.from !== null &&
				th.to !== null &&
				(th.to as number) <= length
		)
		.sort((a, b) => (a.from as number) - (b.from as number))
	for (const th of ranges) {
		builder.add(
			th.from as number,
			th.to as number,
			Decoration.mark({
				class:
					th.id === current
						? "cm-thread cm-thread-active"
						: "cm-thread",
				attributes: { "data-thread": th.id, "data-author": th.author },
			})
		)
	}
	return builder.finish()
}

$effect(() => {
	// Read the props first so the effect re-runs when they change.
	const list = threads
	const current = active
	const v = view
	if (!v) return
	v.dispatch({
		effects: setMarks.of(decorations(list, current, v.state.doc.length)),
	})
})

// ------------------------------------------------------------ look

const ink = HighlightStyle.define([
	{
		tag: t.heading1,
		fontSize: "1.45em",
		fontWeight: "650",
		letterSpacing: "-0.01em",
	},
	{ tag: t.heading2, fontSize: "1.25em", fontWeight: "650" },
	{ tag: t.heading3, fontSize: "1.1em", fontWeight: "650" },
	{ tag: [t.heading4, t.heading5, t.heading6], fontWeight: "650" },
	{ tag: t.emphasis, fontStyle: "italic" },
	{ tag: t.strong, fontWeight: "650" },
	{ tag: t.strikethrough, textDecoration: "line-through" },
	{ tag: [t.link, t.url], color: "hsl(var(--accent))" },
	{ tag: t.monospace, fontFamily: "var(--studio-mono)", fontSize: "0.92em" },
	{
		tag: t.quote,
		color: "hsl(var(--muted-foreground))",
		fontStyle: "italic",
	},
	// The scaffolding (#, *, brackets, html and svelte tags) recedes so the words stand forward.
	{
		tag: [t.processingInstruction, t.meta, t.contentSeparator, t.labelName],
		color: "hsl(var(--muted-foreground) / 0.75)",
	},
	{
		tag: [t.angleBracket, t.tagName, t.attributeName, t.attributeValue],
		color: "hsl(var(--muted-foreground) / 0.8)",
		fontFamily: "var(--studio-mono)",
		fontSize: "0.9em",
	},
	{
		tag: [t.keyword, t.string, t.variableName, t.comment],
		color: "hsl(var(--muted-foreground) / 0.85)",
	},
])

const theme = EditorView.theme({
	"&": {
		height: "100%",
		fontSize: "16px",
		backgroundColor: "transparent",
		color: "hsl(var(--foreground))",
	},
	"&.cm-focused": { outline: "none" },
	".cm-scroller": {
		fontFamily: "var(--studio-serif)",
		lineHeight: "1.7",
		padding: "40px 0 45vh",
		overflowX: "hidden",
	},
	".cm-content": {
		maxWidth: "68ch",
		margin: "0 auto",
		padding: "0 28px",
		caretColor: "hsl(var(--foreground))",
	},
	".cm-line": { padding: "0" },
	".cm-cursor": {
		borderLeftWidth: "2px",
		borderLeftColor: "hsl(var(--foreground))",
	},
	"&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection":
		{
			backgroundColor: "hsl(var(--accent) / 0.18) !important",
		},
	".cm-placeholder": {
		color: "hsl(var(--muted-foreground) / 0.7)",
		fontStyle: "italic",
	},
	".cm-ySelectionInfo": {
		fontFamily: "var(--studio-sans)",
		fontSize: "11px",
		fontWeight: "550",
		padding: "1px 5px",
		borderRadius: "4px 4px 4px 0",
		opacity: "1",
		top: "-1.35em",
		transitionDelay: "0ms",
	},
})

// ------------------------------------------------------------ mount

onMount(() => {
	const text = collab.doc.getText("body")
	const undo = new Y.UndoManager(text)
	let selectTimer: ReturnType<typeof setTimeout> | undefined

	view = new EditorView({
		parent: host,
		state: EditorState.create({
			doc: text.toString(),
			extensions: [
				keymap.of([
					{ key: "Mod-Alt-m", run: () => (oncomment(), true) },
					{ key: "Mod-s", run: () => true, preventDefault: true },
					...yUndoManagerKeymap,
					indentWithTab,
					...defaultKeymap,
				]),
				markdown({ base: markdownLanguage }),
				syntaxHighlighting(ink),
				// Line breaks stay exactly as the shared text has them, so
				// positions here and in the Yjs text always agree.
				EditorState.lineSeparator.of("\n"),
				EditorView.lineWrapping,
				placeholder(
					"Start with the absurd, specific thing that happened."
				),
				theme,
				marks,
				yCollab(text, collab.awareness, { undoManager: undo }),
				EditorView.updateListener.of(update => {
					if (update.selectionSet || update.docChanged) {
						clearTimeout(selectTimer)
						selectTimer = setTimeout(() => report(update.view), 120)
					}
				}),
				EditorView.domEventHandlers({
					mousedown(event) {
						const mark = (event.target as HTMLElement).closest?.(
							"[data-thread]"
						) as HTMLElement | null
						if (mark?.dataset.thread) onthread(mark.dataset.thread)
						return false
					},
				}),
			],
		}),
	})
	view.dispatch({
		effects: setMarks.of(
			decorations(threads, active, view.state.doc.length)
		),
	})

	return () => {
		clearTimeout(selectTimer)
		undo.destroy()
		view?.destroy()
		view = undefined
	}
})

function report(v: EditorView) {
	const { from, to, head } = v.state.selection.main
	if (to > from) {
		const coords = v.coordsAtPos(from)
		const box = host.getBoundingClientRect()
		onselect({
			from,
			to,
			quote: v.state.sliceDoc(from, to),
			top: (coords?.top ?? box.top) - box.top,
		})
	} else {
		onselect(null)
	}
	// The nearest heading at or above the caret.
	const doc = v.state.doc
	for (let n = doc.lineAt(head).number; n >= 1; n--) {
		const line = doc.line(n).text
		const match = /^#{1,6}\s+(.+?)\s*#*$/.exec(line)
		if (match) {
			onheading(headingId(match[1]))
			return
		}
	}
	onheading(null)
}

/** Scrolls to a passage and selects it. */
export function reveal(from: number, to: number) {
	if (!view) return
	view.dispatch({
		selection: { anchor: from, head: to },
		effects: EditorView.scrollIntoView(from, { y: "center" }),
	})
}

export function focus() {
	view?.focus()
}
</script>

<div class="studio-editor h-full min-h-0" bind:this={host}></div>

<style>
	.studio-editor :global(.cm-editor) {
		height: 100%;
	}
	.studio-editor :global(.cm-thread) {
		background: hsl(var(--highlight-thread) / 0.16);
		border-bottom: 2px solid hsl(var(--highlight-thread) / 0.55);
		cursor: pointer;
		transition: background-color 120ms ease;
	}
	.studio-editor :global(.cm-thread[data-author="claude"]) {
		--highlight-thread: var(--claude);
	}
	.studio-editor :global(.cm-thread[data-author="armanc"]) {
		--highlight-thread: var(--armanc);
	}
	.studio-editor :global(.cm-thread-active) {
		background: hsl(var(--highlight-thread) / 0.3);
	}
</style>
