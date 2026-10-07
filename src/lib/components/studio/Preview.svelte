<script lang="ts">
import { plainText } from "$lib/studio/threads"
import type { ThreadView } from "$lib/studio/types"
/**
 * The post as it will be published: the site's own page, from the site's own
 * dev server, interactive components and all. Edits arrive through Vite's hot
 * reload; if that ever goes quiet, a save that changes nothing on the page
 * reloads it in place.
 *
 * In read mode you can select text on the rendered page to comment on it, and
 * the commented passages are highlighted where they render.
 */
import { onMount } from "svelte"

type Props = {
	slug: string
	/** The page to show. Defaults to the post as the site renders it. */
	page?: string
	threads: ThreadView[]
	active: string | null
	/** When set, the preview follows the writer to this heading. */
	heading: string | null
	savedAt: number
	commenting: boolean
	onselect: (selection: { quote: string; top: number } | null) => void
	onthread: (id: string) => void
}

const {
	slug,
	page,
	threads,
	active,
	heading,
	savedAt,
	commenting,
	onselect,
	onthread,
}: Props = $props()

// Two frames: a reload happens in the hidden one and is swapped in when it's
// ready, so the page never flashes blank while you write.
const frames = $state<HTMLIFrameElement[]>([])
let current = $state(0)
let srcs = $state<string[]>([])
let loaded = $state(false)
let retries = $state(0)
let failed = $state(false)
let scrollY = 0
let observer: MutationObserver | undefined
const src = $derived(page ?? `/writing/${slug}?studio=1`)
const join = (url: string, param: string) =>
	`${url}${url.includes("?") ? "&" : "?"}${param}`

$effect(() => {
	srcs = [src, ""]
	current = 0
})

function win() {
	return frames[current]?.contentWindow as (Window & typeof globalThis) | null
}

/** Reloads the page out of sight and swaps it in once it has rendered. */
function reload() {
	const next = 1 - current
	srcs[next] = join(src, `v=${Date.now()}`)
}

function onload(index: number) {
	const w = frames[index]?.contentWindow as
		| (Window & typeof globalThis)
		| null
	if (!w || !srcs[index] || w.location.href === "about:blank") return
	// The first render of a post on the home server can outlast the proxy's
	// timeout; the dev server keeps compiling, so asking again soon works.
	// The page on screen stays until a good one is ready.
	if (!w.document.querySelector("article, main") && retries < 8) {
		retries++
		setTimeout(reload, 2500)
		return
	}
	retries = 0
	if (index !== current) {
		const old = current
		current = index
		// Blank the frame we left, unless a newer save is already loading into it.
		const left = srcs[old]
		setTimeout(() => {
			if (srcs[old] === left) srcs[old] = ""
		}, 50)
	}
	// The site's pages ask the studio to reload them (see the (site) layout).
	;(w as unknown as { __studioReload?: () => void }).__studioReload = reload
	setup(w)
}

function setup(w: Window & typeof globalThis) {
	const doc = w.document
	loaded = true
	failed = !doc.querySelector("article, main")
	const style = doc.createElement("style")
	style.textContent = `
		::highlight(studio-armanc) { background-color: rgb(47 111 143 / 0.18); text-decoration: underline 2px rgb(47 111 143 / 0.6); text-underline-offset: 3px; }
		::highlight(studio-claude) { background-color: rgb(194 65 12 / 0.16); text-decoration: underline 2px rgb(194 65 12 / 0.6); text-underline-offset: 3px; }
		::highlight(studio-active) { background-color: rgb(194 120 12 / 0.32); }
		html { scroll-behavior: auto !important; }
		/* Comment threads from the live site don't belong in a draft's preview. */
		.giscus, giscus-widget { display: none !important; }
	`
	doc.head.append(style)

	// A reload (a change that couldn't hot-swap) keeps the reader where they were.
	if (scrollY > 0) w.scrollTo(0, scrollY)
	w.addEventListener("scroll", () => (scrollY = w.scrollY), { passive: true })

	observer?.disconnect()
	observer = new w.MutationObserver(() => {
		queueMicrotask(paint)
	})
	const main = doc.querySelector("main") ?? doc.body
	observer.observe(main, {
		childList: true,
		subtree: true,
		characterData: true,
	})

	doc.addEventListener("mouseup", () => setTimeout(readSelection, 0))
	doc.addEventListener("keyup", e => {
		if (e.shiftKey) readSelection()
	})
	doc.addEventListener("click", e => {
		const hit = threadAt(e.clientX, e.clientY)
		if (hit) onthread(hit)
	})
	paint()
}

// ------------------------------------------------------------ text on the page

/** Every text node in the post body, with where each starts in the joined text. */
function textIndex() {
	const doc = win()?.document
	const root = doc?.querySelector("article") ?? doc?.querySelector("main")
	if (!doc || !root) return null
	const nodes: { node: Text; start: number }[] = []
	let joined = ""
	const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT)
	for (let n = walker.nextNode(); n; n = walker.nextNode()) {
		const parent = n.parentElement
		if (!parent || parent.closest("script, style, nav, .anchor-link"))
			continue
		nodes.push({ node: n as Text, start: joined.length })
		joined += n.nodeValue ?? ""
	}
	return { nodes, joined, doc }
}

/** Finds `quote` in the rendered text, ignoring differences in whitespace. */
function rangeOf(
	quote: string,
	index: NonNullable<ReturnType<typeof textIndex>>
): Range | null {
	const words = plainText(quote).split(" ").filter(Boolean)
	if (!words.length) return null
	const pattern = new RegExp(
		words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\s+")
	)
	const match = pattern.exec(index.joined)
	if (!match) return null
	const locate = (offset: number) => {
		let lo = 0
		let hi = index.nodes.length - 1
		while (lo < hi) {
			const mid = (lo + hi + 1) >> 1
			if (index.nodes[mid].start <= offset) lo = mid
			else hi = mid - 1
		}
		const { node, start } = index.nodes[lo]
		return { node, offset: Math.min(offset - start, node.length) }
	}
	const a = locate(match.index)
	const b = locate(match.index + match[0].length)
	const range = index.doc.createRange()
	range.setStart(a.node, a.offset)
	range.setEnd(b.node, b.offset)
	return range
}

const painted = new Map<string, Range>()

function paint() {
	const w = win()
	const index = textIndex()
	if (!w || !index || !("highlights" in w.CSS)) return
	painted.clear()
	const sets = {
		armanc: new w.Highlight(),
		claude: new w.Highlight(),
		active: new w.Highlight(),
	}
	for (const th of threads) {
		if (th.resolved || !th.quote) continue
		const range = rangeOf(th.quote, index)
		if (!range) continue
		painted.set(th.id, range)
		sets[th.author].add(range)
		if (th.id === active) sets.active.add(range)
	}
	w.CSS.highlights.set("studio-armanc", sets.armanc)
	w.CSS.highlights.set("studio-claude", sets.claude)
	w.CSS.highlights.set("studio-active", sets.active)
}

function threadAt(x: number, y: number): string | null {
	for (const [id, range] of painted) {
		for (const rect of range.getClientRects()) {
			if (
				x >= rect.left &&
				x <= rect.right &&
				y >= rect.top &&
				y <= rect.bottom
			)
				return id
		}
	}
	return null
}

function readSelection() {
	if (!commenting) return
	const w = win()
	const selection = w?.getSelection()
	const quote = selection?.toString().trim() ?? ""
	if (!w || !selection || !quote || selection.rangeCount === 0) {
		onselect(null)
		return
	}
	const rect = selection.getRangeAt(0).getBoundingClientRect()
	onselect({ quote: quote.replace(/\s+/g, " ").slice(0, 600), top: rect.top })
}

// ------------------------------------------------------------ following along

$effect(() => {
	// Repaint when threads or the active one change.
	void threads
	void active
	if (loaded) paint()
})

$effect(() => {
	const id = active
	if (!loaded || !id) return
	const range = painted.get(id)
	const w = win()
	if (!range || !w) return
	const rect = range.getBoundingClientRect()
	if (rect.top < 80 || rect.bottom > w.innerHeight - 40) {
		w.scrollTo({
			top: w.scrollY + rect.top - w.innerHeight / 3,
			behavior: "smooth",
		})
	}
})

$effect(() => {
	const id = heading
	const w = win()
	if (!loaded || !w || commenting) return
	if (!id) return
	const el = w.document.getElementById(id)
	if (el)
		w.scrollTo({
			top: w.scrollY + el.getBoundingClientRect().top - 96,
			behavior: "smooth",
		})
})

/**
 * A save updates the page in place: the post is rendered once by the server
 * and its article swapped into the page on screen. One request, no flash, the
 * reader stays put. Swapped-in components are rendered but not live, so once
 * typing rests the whole page is reloaded (out of sight) to bring them back,
 * no more than every 30 seconds: a dev-server reload fetches ~90 modules and
 * the proxy allows 500 requests a minute.
 */
let lastFull = Date.now()
let stale = false

async function swapArticle(): Promise<boolean> {
	const doc = win()?.document
	const live = doc?.querySelector("article.post")
	if (!doc || !live) return false
	try {
		const response = await fetch(join(src, `fresh=${Date.now()}`))
		if (!response.ok) return false
		const next = new DOMParser().parseFromString(
			await response.text(),
			"text/html"
		)
		const fresh = next.querySelector("article.post")
		if (!fresh) return false
		live.innerHTML = fresh.innerHTML
		paint()
		return true
	} catch {
		return false
	}
}

$effect(() => {
	if (!savedAt || !loaded) return
	const swap = setTimeout(async () => {
		// If the swap can't be done (the page didn't render), the full
		// reload below still comes.
		await swapArticle()
		stale = true
	}, 700)
	const rest = setTimeout(
		() => {
			if (!stale) return
			stale = false
			lastFull = Date.now()
			reload()
		},
		Math.max(8_000, lastFull + 30_000 - Date.now())
	)
	return () => {
		clearTimeout(swap)
		clearTimeout(rest)
	}
})

onMount(() => () => observer?.disconnect())
</script>

<div class="relative h-full w-full">
	{#each [0, 1] as index (index)}
		<iframe
			bind:this={frames[index]}
			src={srcs[index] || "about:blank"}
			title="Rendered post"
			class="absolute inset-0 h-full w-full border-0 bg-background"
			class:invisible={index !== current}
			aria-hidden={index !== current}
			inert={index !== current}
			onload={() => onload(index)}
		></iframe>
	{/each}
	{#if !loaded}
		<div class="absolute inset-0 grid place-items-center bg-background text-sm text-muted-foreground">
			<span class="studio-shimmer">{retries ? "Rendering the page for the first time…" : "Rendering the page…"}</span>
		</div>
	{:else if failed}
		<div class="absolute inset-x-0 top-0 border-b border-border bg-background/95 px-4 py-2 text-xs text-muted-foreground">
			The page didn't render. The last change may have left a component tag open.
		</div>
	{/if}
</div>
