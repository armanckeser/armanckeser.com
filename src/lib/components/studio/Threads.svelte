<script lang="ts">
/**
 * The conversation about the post: one card per commented passage, in the
 * order the passages appear. New comments start from a selection, in the
 * editor or on the rendered page.
 */
import { Check, CornerDownLeft, RotateCcw, Trash2 } from "lucide-svelte"
import { tick } from "svelte"
import { toast } from "svelte-sonner"
import { api } from "$lib/studio/api"
import { ago } from "$lib/studio/threads"
import { ACTORS, type ThreadView } from "$lib/studio/types"
import Avatar from "./Avatar.svelte"

type Draft = { quote: string; from?: number; to?: number } | null

type Props = {
	slug: string
	threads: ThreadView[]
	active: string | null
	draft: Draft
	agentWatching: boolean
	onactivate: (id: string | null) => void
	ondraftdone: () => void
}

let {
	slug,
	threads,
	active,
	draft,
	agentWatching,
	onactivate,
	ondraftdone,
}: Props = $props()

let show = $state<"open" | "resolved">("open")
let body = $state("")
let reply = $state("")
let busy = $state(false)
let composer = $state<HTMLTextAreaElement>()
let now = $state(Date.now())

$effect(() => {
	const timer = setInterval(() => (now = Date.now()), 30_000)
	return () => clearInterval(timer)
})

const open = $derived(threads.filter(th => !th.resolved))
const resolved = $derived(threads.filter(th => th.resolved))
const shown = $derived(show === "open" ? open : resolved)

$effect(() => {
	if (draft) {
		body = ""
		void tick().then(() => composer?.focus())
	}
})

async function submit() {
	if (!draft || !body.trim() || busy) return
	busy = true
	try {
		const thread = await api.comment(slug, { body, ...draft })
		body = ""
		ondraftdone()
		onactivate(thread.id)
		if (!thread.anchor)
			toast("Comment saved, but its passage wasn't found in the source")
	} catch (e) {
		toast.error(`Couldn't comment: ${(e as Error).message}`)
	} finally {
		busy = false
	}
}

async function answer(id: string) {
	if (!reply.trim() || busy) return
	busy = true
	try {
		await api.reply(slug, id, reply)
		reply = ""
	} catch (e) {
		toast.error(`Couldn't reply: ${(e as Error).message}`)
	} finally {
		busy = false
	}
}

async function setResolved(id: string, value: boolean) {
	try {
		await api.resolve(slug, id, value)
		if (value && active === id) onactivate(null)
	} catch (e) {
		toast.error((e as Error).message)
	}
}

async function remove(id: string) {
	try {
		await api.remove(slug, id)
		if (active === id) onactivate(null)
	} catch (e) {
		toast.error((e as Error).message)
	}
}

function keys(event: KeyboardEvent, send: () => void, cancel: () => void) {
	if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
		event.preventDefault()
		send()
	} else if (event.key === "Escape") {
		event.preventDefault()
		cancel()
	}
}

$effect(() => {
	if (!active) return
	void tick().then(() =>
		document
			.querySelector(`[data-card="${active}"]`)
			?.scrollIntoView({ block: "nearest", behavior: "smooth" })
	)
})
</script>

<aside class="flex h-full min-h-0 flex-col">
	<header class="flex h-11 shrink-0 items-center justify-between border-b border-border px-4">
		<div class="studio-tabs" role="tablist">
			<button role="tab" aria-selected={show === "open"} onclick={() => (show = "open")}>
				Open <span class="tabular-nums">{open.length || ""}</span>
			</button>
			<button role="tab" aria-selected={show === "resolved"} onclick={() => (show = "resolved")}>
				Resolved <span class="tabular-nums">{resolved.length || ""}</span>
			</button>
		</div>
	</header>

	<div class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
		{#if draft}
			<div class="studio-card studio-enter mb-3 border-[hsl(var(--armanc)/0.5)]">
				<blockquote class="studio-quote line-clamp-3">{draft.quote}</blockquote>
				<textarea
					bind:this={composer}
					bind:value={body}
					rows="3"
					class="studio-input mt-2"
					placeholder={agentWatching ? "Ask Claude, or leave a note…" : "Leave a note. Claude picks it up next time it looks…"}
					onkeydown={e => keys(e, submit, ondraftdone)}
				></textarea>
				<div class="mt-2 flex items-center justify-between">
					<span class="text-[11px] text-muted-foreground">⌘↵ to send · Esc to cancel</span>
					<button class="studio-btn studio-btn-primary" disabled={!body.trim() || busy} onclick={submit}>Comment</button>
				</div>
			</div>
		{/if}

		{#each shown as th (th.id)}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<div
				class="studio-card mb-2"
				class:studio-card-active={th.id === active}
				data-card={th.id}
				role="button"
				tabindex="0"
				onclick={() => onactivate(th.id)}
			>
				{#if th.quote}
					<blockquote class="studio-quote line-clamp-2" class:opacity-50={th.from === null && th.anchor !== null}>
						{th.quote}
					</blockquote>
				{/if}
				{#each [{ author: th.author, body: th.body, createdAt: th.createdAt, id: th.id }, ...th.replies] as message (message.id)}
					<div class="mt-2.5 flex gap-2">
						<Avatar actor={message.author} size={20} />
						<div class="min-w-0 flex-1">
							<div class="flex items-baseline gap-1.5 text-xs">
								<span class="font-medium">{ACTORS[message.author].name}</span>
								<span class="text-muted-foreground">{ago(message.createdAt, now)}</span>
							</div>
							<p class="mt-0.5 whitespace-pre-wrap break-words text-[13.5px] leading-relaxed">{message.body}</p>
						</div>
					</div>
				{/each}

				{#if th.awaitingClaude && th.id !== active}
					<p class="mt-2 text-[11px] text-muted-foreground">
						{agentWatching ? "Claude is listening" : "Waiting in Claude's inbox"}
					</p>
				{/if}

				{#if th.id === active}
					<div class="mt-3 flex items-end gap-2">
						<textarea
							bind:value={reply}
							rows="1"
							class="studio-input flex-1"
							placeholder="Reply…"
							onclick={e => e.stopPropagation()}
							onkeydown={e => keys(e, () => answer(th.id), () => onactivate(null))}
						></textarea>
						<button
							class="studio-icon-btn"
							title="Send (⌘↵)"
							disabled={!reply.trim() || busy}
							onclick={e => (e.stopPropagation(), answer(th.id))}
						>
							<CornerDownLeft class="h-3.5 w-3.5" />
						</button>
					</div>
					<div class="mt-2 flex items-center justify-between">
						{#if th.from === null}
							<span class="text-[11px] text-muted-foreground">
								{th.anchor ? "The passage was deleted" : "Not tied to a passage"}
							</span>
						{:else}
							<span></span>
						{/if}
						<div class="flex gap-1">
							<button class="studio-icon-btn" title="Delete" onclick={e => (e.stopPropagation(), remove(th.id))}>
								<Trash2 class="h-3.5 w-3.5" />
							</button>
							{#if th.resolved}
								<button class="studio-btn" onclick={e => (e.stopPropagation(), setResolved(th.id, false))}>
									<RotateCcw class="h-3.5 w-3.5" /> Reopen
								</button>
							{:else}
								<button class="studio-btn" onclick={e => (e.stopPropagation(), setResolved(th.id, true))}>
									<Check class="h-3.5 w-3.5" /> Resolve
								</button>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		{:else}
			{#if !draft}
				<div class="px-2 pt-10 text-center text-sm text-muted-foreground">
					{#if show === "open"}
						<p class="font-medium text-foreground">No open comments</p>
						<p class="mt-1.5 leading-relaxed">Select a passage, in the draft or on the page, and press <kbd>⌘⌥M</kbd> or the comment button.</p>
					{:else}
						<p>Nothing resolved yet.</p>
					{/if}
				</div>
			{/if}
		{/each}
	</div>
</aside>
