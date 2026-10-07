<script lang="ts">
/**
 * One post, worked on together. The draft on the left, the page as it will be
 * published on the right, the conversation about it in the rail. Everything
 * here is live for both people in the room: you and Claude.
 */
import {
	ArrowLeft,
	ArrowUpRight,
	Check,
	MessageSquarePlus,
	PanelRight,
	SlidersHorizontal,
} from "lucide-svelte"
import { Popover } from "bits-ui"
import { onMount, untrack } from "svelte"
import { toast } from "svelte-sonner"
import Avatar from "$lib/components/studio/Avatar.svelte"
import Editor from "$lib/components/studio/Editor.svelte"
import Preview from "$lib/components/studio/Preview.svelte"
import Threads from "$lib/components/studio/Threads.svelte"
import { api } from "$lib/studio/api"
import { Collab } from "$lib/studio/collab.svelte"
import { threadViews } from "$lib/studio/threads"
import type { Actor, PostStatus, ThreadView } from "$lib/studio/types"

const { data } = $props()

// ------------------------------------------------------------ the shared document

const collab = new Collab(
	untrack(() => data.slug),
	"armanc"
)
let threads = $state<ThreadView[]>([])
let meta = $state<Record<string, unknown>>({})
let peers = $state<{ id: number; actor: Actor; status?: string | null }[]>([])
let status = $state<PostStatus>(untrack(() => data.status))

onMount(() => {
	let frame = 0
	const refresh = () => {
		frame ||= requestAnimationFrame(() => {
			frame = 0
			threads = threadViews(collab.doc)
			meta = collab.doc.getMap("meta").toJSON()
		})
	}
	collab.doc.on("update", refresh)
	const readPeers = () => {
		peers = [...collab.awareness.getStates().entries()]
			.filter(([id, s]) => id !== collab.doc.clientID && s?.user?.actor)
			.map(([id, s]) => ({
				id,
				actor: s.user.actor as Actor,
				status: s.status as string | null | undefined,
			}))
	}
	collab.awareness.on("change", readPeers)

	let statusTimer: ReturnType<typeof setTimeout>
	const offSaved = collab.on(event => {
		if (event !== "saved") return
		clearTimeout(statusTimer)
		statusTimer = setTimeout(async () => {
			status =
				(await api.status(collab.slug).catch(() => null))?.status ??
				status
		}, 600)
	})
	return () => {
		cancelAnimationFrame(frame)
		clearTimeout(statusTimer)
		offSaved()
		collab.destroy()
	}
})

const claude = $derived(peers.find(p => p.actor === "claude"))
const title = $derived(String(meta.title ?? data.title ?? ""))

// ------------------------------------------------------------ layout

type Mode = "write" | "read"
const stored = (key: string, fallback: string) => {
	try {
		return localStorage.getItem(`studio:${key}`) ?? fallback
	} catch {
		return fallback
	}
}
const store = (key: string, value: string) => {
	try {
		localStorage.setItem(`studio:${key}`, value)
	} catch {}
}

let mode = $state<Mode>("write")
let railOpen = $state(true)
let split = $state(0.5)
let wide = $state(true)

onMount(() => {
	mode = stored("mode", "write") as Mode
	railOpen = stored("rail", "1") === "1"
	split = Number(stored("split", "0.5")) || 0.5
	const query = matchMedia("(min-width: 1100px)")
	wide = query.matches
	if (!wide) railOpen = false
	const onChange = () => (wide = query.matches)
	query.addEventListener("change", onChange)
	return () => query.removeEventListener("change", onChange)
})

function setMode(next: Mode) {
	mode = next
	selection = null
	store("mode", next)
}

function toggleRail() {
	railOpen = !railOpen
	store("rail", railOpen ? "1" : "0")
}

let surface: HTMLDivElement
let dragging = $state(false)

function startDrag(event: PointerEvent) {
	const handle = event.currentTarget as HTMLElement
	handle.setPointerCapture(event.pointerId)
	dragging = true
	const box = surface.getBoundingClientRect()
	const move = (e: PointerEvent) => {
		split = Math.min(
			0.75,
			Math.max(0.28, (e.clientX - box.left) / box.width)
		)
	}
	const up = () => {
		dragging = false
		store("split", String(split))
		handle.removeEventListener("pointermove", move)
		handle.removeEventListener("pointerup", up)
	}
	handle.addEventListener("pointermove", move)
	handle.addEventListener("pointerup", up)
}

// ------------------------------------------------------------ comments

let active = $state<string | null>(null)
let heading = $state<string | null>(null)
let editor = $state<Editor>()
/** A passage selected right now, offered for a comment. */
let selection = $state<{
	quote: string
	from?: number
	to?: number
	top: number
	where: Mode
} | null>(null)
/** The passage being commented on, once the writer asked to. */
let draft = $state<{ quote: string; from?: number; to?: number } | null>(null)

function startComment() {
	if (!selection) return
	draft = { quote: selection.quote, from: selection.from, to: selection.to }
	selection = null
	railOpen = true
}

function activate(id: string | null) {
	active = id
	if (!id) return
	const th = threads.find(t => t.id === id)
	if (th && th.from !== null && th.to !== null && mode === "write")
		editor?.reveal(th.from, th.to)
	if (!railOpen) railOpen = true
}

function onkey(event: KeyboardEvent) {
	const mod = event.metaKey || event.ctrlKey
	if (mod && event.key === "\\") {
		event.preventDefault()
		toggleRail()
	} else if (mod && event.altKey && event.code === "KeyM") {
		event.preventDefault()
		startComment()
	} else if (mod && event.key === "s") {
		event.preventDefault()
		toast("Everything saves as you type", { duration: 1600 })
	}
}

// ------------------------------------------------------------ details and publishing

let details = $state(false)
let publishOpen = $state(false)
let publishing = $state(false)
let metaTimer: ReturnType<typeof setTimeout>

function saveMeta(field: string, value: unknown) {
	clearTimeout(metaTimer)
	metaTimer = setTimeout(() => {
		api.meta(collab.slug, { [field]: value }).catch(e =>
			toast.error((e as Error).message)
		)
	}, 350)
}

const openThreads = $derived(threads.filter(t => !t.resolved).length)
const description = $derived(String(meta.description ?? ""))

async function publish() {
	publishing = true
	try {
		const result = await api.publish(collab.slug)
		status = "published"
		publishOpen = false
		toast.success(
			result.first
				? "Published. The site rebuilds in about two minutes."
				: "Changes published. Live in about two minutes.",
			{
				action: {
					label: "Open",
					onClick: () => window.open(result.url, "_blank"),
				},
				duration: 8000,
			}
		)
	} catch (e) {
		toast.error((e as Error).message, { duration: 10000 })
	} finally {
		publishing = false
	}
}

async function unpublish() {
	try {
		await api.unpublish(collab.slug)
		status = "draft"
		publishOpen = false
		toast("Back to draft. It leaves the site on the next deploy.")
	} catch (e) {
		toast.error((e as Error).message)
	}
}

const statusText = {
	draft: "Draft",
	published: "Published",
	changed: "Unpublished changes",
}
</script>

<svelte:window onkeydown={onkey} />
<svelte:head>
	<title>{title || "Untitled"} · Studio</title>
</svelte:head>

<div class="flex h-full flex-col">
	<!-- ------------------------------------------------------------ bar -->
	<header class="relative z-20 flex h-12 shrink-0 items-center gap-2 border-b border-border px-2 sm:px-3">
		<a href="/cms" class="studio-icon-btn" title="All posts"><ArrowLeft class="h-4 w-4" /></a>
		<div class="flex min-w-0 flex-1 items-baseline gap-2">
			<h1 class="truncate font-[family-name:var(--studio-serif)] text-[15px]">{title || "Untitled"}</h1>
			<span class="hidden shrink-0 text-xs text-muted-foreground sm:inline" class:text-[hsl(var(--accent))]={status === "changed"}>
				{statusText[status]}
			</span>
		</div>

		<div class="studio-segment" role="group" aria-label="View">
			<button aria-pressed={mode === "write"} onclick={() => setMode("write")}>Write</button>
			<button aria-pressed={mode === "read"} onclick={() => setMode("read")}>Read</button>
		</div>

		<div class="flex flex-1 items-center justify-end gap-1.5">
			<!-- Who's here, and what Claude is doing. -->
			<div class="mr-1 hidden items-center gap-2 md:flex">
				{#if claude}
					<span class="flex items-center gap-1.5 text-xs text-muted-foreground" title="Claude is in this post">
						<Avatar actor="claude" size={22} ring />
						{#if claude.status}<span class="max-w-[14rem] truncate">{claude.status}</span>{/if}
					</span>
				{:else}
					<span
						title={collab.agentWatching ? "Claude is listening: it sees comments as you leave them" : "Claude is away. Comments wait in its inbox."}
					>
						<Avatar actor="claude" size={22} dim />
					</span>
				{/if}
			</div>

			<span
				class="hidden w-16 text-right text-xs text-muted-foreground sm:inline"
				title={collab.connection === "live" ? "Every change is saved and shared as you make it" : "Reconnecting; changes are kept and sent when back"}
			>
				{#if collab.connection !== "live"}
					<span class="studio-shimmer">{collab.ready ? "Offline" : "Opening"}</span>
				{:else if collab.pending}
					Saving
				{:else}
					Saved
				{/if}
			</span>

			<Popover.Root bind:open={details}>
				<Popover.Trigger class="studio-icon-btn" title="Details"><SlidersHorizontal class="h-4 w-4" /></Popover.Trigger>
				<Popover.Portal>
					<Popover.Content class="studio-pop studio" sideOffset={8} align="end" data-room="writing">
						<div class="grid gap-3">
							<label class="studio-field">
								Title
								<input class="studio-input font-[family-name:var(--studio-serif)] text-[15px]" value={title} oninput={e => saveMeta("title", e.currentTarget.value)} />
							</label>
							<label class="studio-field">
								<span class="flex justify-between">Description <span class="tabular-nums" class:text-[hsl(var(--accent))]={description.length > 170}>{description.length}/160</span></span>
								<textarea class="studio-input" rows="3" value={description} oninput={e => saveMeta("description", e.currentTarget.value)}></textarea>
							</label>
							<label class="studio-field">
								Tags
								<input
									class="studio-input"
									value={Array.isArray(meta.tags) ? (meta.tags as string[]).join(", ") : ""}
									placeholder="windows, debugging"
									onchange={e =>
										saveMeta(
											"tags",
											e.currentTarget.value.split(",").map(s => s.trim()).filter(Boolean)
										)}
								/>
							</label>
							<div class="grid grid-cols-2 gap-3">
								<label class="studio-field">
									Date
									<input class="studio-input" type="date" value={String(meta.date ?? "")} onchange={e => saveMeta("date", e.currentTarget.value)} />
								</label>
								<div class="studio-field">
									Address
									<span class="truncate pt-2 font-mono text-[11px] text-foreground">/writing/{collab.slug}</span>
								</div>
							</div>
						</div>
					</Popover.Content>
				</Popover.Portal>
			</Popover.Root>

			<button class="studio-icon-btn relative" title="Comments (⌘\)" onclick={toggleRail} aria-pressed={railOpen}>
				<PanelRight class="h-4 w-4" />
				{#if openThreads && !railOpen}
					<span class="absolute right-0.5 top-0.5 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-[hsl(var(--accent))] px-0.5 text-[9px] font-semibold text-[hsl(var(--accent-foreground))]">{openThreads}</span>
				{/if}
			</button>

			<Popover.Root bind:open={publishOpen}>
				<Popover.Trigger class="studio-btn studio-btn-primary ml-1" disabled={status === "published"}>
					{status === "published" ? "Published" : status === "changed" ? "Publish changes" : "Publish"}
				</Popover.Trigger>
				<Popover.Portal>
					<Popover.Content class="studio-pop studio" sideOffset={8} align="end" data-room="writing">
						<p class="font-[family-name:var(--studio-serif)] text-[15px]">{title || "Untitled"}</p>
						<p class="mt-0.5 font-mono text-[11px] text-muted-foreground">armanckeser.com/writing/{collab.slug}</p>
						<ul class="mt-4 grid gap-2 text-[13px]">
							<li class="flex items-start gap-2">
								<Check class="mt-0.5 h-3.5 w-3.5 shrink-0 {description ? 'text-emerald-600' : 'text-muted-foreground/40'}" />
								<span class:text-muted-foreground={!description}>
									{description ? "Has a description for cards and search" : "No description: link cards will be bare"}
								</span>
							</li>
							<li class="flex items-start gap-2">
								<Check class="mt-0.5 h-3.5 w-3.5 shrink-0 {openThreads ? 'text-muted-foreground/40' : 'text-emerald-600'}" />
								<span class:text-muted-foreground={openThreads > 0}>
									{openThreads ? `${openThreads} open ${openThreads === 1 ? "comment" : "comments"}` : "No open comments"}
								</span>
							</li>
						</ul>
						<p class="mt-4 text-xs leading-relaxed text-muted-foreground">
							Commits the post to main and pushes. The site rebuilds and it's live in about two minutes.
						</p>
						<div class="mt-4 flex items-center justify-between">
							{#if status !== "draft"}
								<button class="text-xs text-muted-foreground underline-offset-2 hover:underline" onclick={unpublish}>Unpublish</button>
							{:else}
								<span></span>
							{/if}
							<button class="studio-btn studio-btn-primary" disabled={publishing} onclick={publish}>
								{#if publishing}<span class="studio-shimmer">Publishing</span>{:else}{status === "changed" ? "Publish changes" : "Publish now"}{/if}
							</button>
						</div>
					</Popover.Content>
				</Popover.Portal>
			</Popover.Root>
			{#if status !== "draft"}
				<a class="studio-icon-btn" href={data.url} target="_blank" rel="noreferrer" title="Open the live page"><ArrowUpRight class="h-4 w-4" /></a>
			{/if}
		</div>
	</header>

	<!-- ------------------------------------------------------------ surface -->
	<div class="flex min-h-0 flex-1">
		<div class="relative flex min-h-0 min-w-0 flex-1" bind:this={surface}>
			{#if mode === "write"}
				<div class="relative min-h-0 min-w-0" style:flex-basis={wide ? `${split * 100}%` : "100%"} style:flex-shrink="0">
					{#if collab.ready}
						<Editor
							bind:this={editor}
							{collab}
							{threads}
							{active}
							onselect={s => (selection = s ? { ...s, where: "write" } : null)}
							onthread={id => activate(id)}
							onheading={id => (heading = id)}
							oncomment={startComment}
						/>
					{:else}
						<div class="grid h-full place-items-center text-sm text-muted-foreground"><span class="studio-shimmer">Opening the draft…</span></div>
					{/if}
					{#if selection?.where === "write"}
						<button class="studio-float studio-btn right-3 shadow-sm" style:top="{Math.max(8, selection.top - 4)}px" onclick={startComment}>
							<MessageSquarePlus class="h-3.5 w-3.5" /> Comment
						</button>
					{/if}
				</div>
				{#if wide}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="studio-handle" data-dragging={dragging} onpointerdown={startDrag}></div>
					<div class="relative min-h-0 min-w-0 flex-1" class:pointer-events-none={dragging}>
						<Preview slug={collab.slug} {threads} {active} {heading} savedAt={collab.savedAt} commenting={false} onselect={() => {}} onthread={activate} />
					</div>
				{/if}
			{:else}
				<div class="relative min-h-0 min-w-0 flex-1">
					<Preview
						slug={collab.slug}
						{threads}
						{active}
						heading={null}
						savedAt={collab.savedAt}
						commenting={true}
						onselect={s => (selection = s ? { ...s, where: "read" } : null)}
						onthread={activate}
					/>
					{#if selection?.where === "read"}
						<button class="studio-float studio-btn right-4 shadow-sm" style:top="{Math.max(8, selection.top - 4)}px" onclick={startComment}>
							<MessageSquarePlus class="h-3.5 w-3.5" /> Comment
						</button>
					{/if}
				</div>
			{/if}
		</div>

		{#if railOpen}
			<div
				class="min-h-0 shrink-0 border-l border-border bg-[hsl(var(--foreground)/0.015)]"
				class:studio-rail-overlay={!wide}
				style:width="var(--rail)"
			>
				<Threads
					slug={collab.slug}
					{threads}
					{active}
					{draft}
					agentWatching={collab.agentWatching}
					onactivate={activate}
					ondraftdone={() => (draft = null)}
				/>
			</div>
		{/if}
	</div>
</div>

<style>
	.studio-rail-overlay {
		position: fixed;
		top: 3rem;
		right: 0;
		bottom: 0;
		z-index: 40;
		max-width: 100vw;
		background: hsl(var(--background));
		box-shadow: -12px 0 32px -12px hsl(var(--foreground) / 0.2);
		transition: transform 240ms var(--ease-sheet);
		@starting-style {
			transform: translateX(100%);
		}
	}
</style>
