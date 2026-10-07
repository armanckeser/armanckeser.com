<script lang="ts">
/**
 * Everything being written: the posts (drafts first, that's where the work
 * is) and the notes behind them (strategy, plans, post ideas, research). A
 * title typed at the top starts a new one; there's nothing else to fill in.
 */
import { goto, invalidateAll } from "$app/navigation"
import Avatar from "$lib/components/studio/Avatar.svelte"
import { api } from "$lib/studio/api"
import { ago } from "$lib/studio/threads"
import type { NotesSync, PostSummary } from "$lib/studio/types"
import { ArrowUpRight, MessageSquare } from "lucide-svelte"
import { onMount } from "svelte"
import { toast } from "svelte-sonner"

const { data } = $props()

type Tab = "posts" | "notes"
let tab = $state<Tab>("posts")
let title = $state("")
let folder = $state("")
let creating = $state(false)
let watching = $state(data.agentWatching)
let sync = $state<NotesSync>(data.notesSync)
let syncing = $state(false)

onMount(() => {
	try {
		tab = (localStorage.getItem("studio:tab") as Tab) || "posts"
	} catch {}
})

function show(next: Tab) {
	tab = next
	title = ""
	try {
		localStorage.setItem("studio:tab", next)
	} catch {}
}

const posts = $derived(data.posts as PostSummary[])
const notes = $derived(data.notes as PostSummary[])
const drafts = $derived(posts.filter(p => p.status === "draft"))
const live = $derived(posts.filter(p => p.status !== "draft"))
const waiting = $derived(
	[...posts, ...notes].reduce((n, p) => n + p.awaitingClaude, 0)
)

const postGroups = $derived([
	{ label: "Drafts", items: drafts },
	{ label: "Published", items: live },
])
const noteGroups = $derived([
	{ label: "Strategy and plans", items: notes.filter(n => !n.folder) },
	{ label: "Post ideas", items: notes.filter(n => n.folder === "drafts") },
	{ label: "Research", items: notes.filter(n => n.folder === "research") },
])

async function create(event: SubmitEvent) {
	event.preventDefault()
	if (!title.trim() || creating) return
	creating = true
	try {
		const made =
			tab === "posts"
				? await api.create(title)
				: await api.createNote(title, folder)
		await goto(`/cms/${made.slug}`)
	} catch (e) {
		toast.error((e as Error).message)
		creating = false
	}
}

async function syncNow() {
	syncing = true
	try {
		sync = await api.notesSync(true)
		if (sync.error) toast.error(sync.error)
		else await invalidateAll()
	} finally {
		syncing = false
	}
}

// Keep the lists current while open: comments and drafts arrive from Claude too.
$effect(() => {
	const source = new EventSource("/cms/api/events")
	let timer: ReturnType<typeof setTimeout>
	const refresh = () => {
		clearTimeout(timer)
		timer = setTimeout(() => invalidateAll(), 300)
	}
	source.addEventListener(
		"hello",
		e => (watching = JSON.parse((e as MessageEvent).data).agentWatching)
	)
	for (const type of ["thread", "created", "deleted", "published"])
		source.addEventListener(type, refresh)
	return () => {
		clearTimeout(timer)
		source.close()
	}
})
</script>

<svelte:head>
	<title>Studio</title>
</svelte:head>

{#snippet row(item: PostSummary)}
	<li>
		<a
			href="/cms/{item.slug}"
			class="group flex items-start justify-between gap-4 rounded-xl px-3 py-3 transition-colors duration-150 hover:bg-foreground/[0.04]"
		>
			<div class="min-w-0">
				<p class="truncate font-[family-name:var(--studio-serif)] text-[17px] leading-snug text-foreground">{item.title}</p>
				<p class="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
					{#if item.status === "changed"}
						<span class="text-[hsl(var(--accent))]">Edited since publishing</span>
						<span>·</span>
					{/if}
					<span class="tabular-nums">{item.words.toLocaleString()} words</span>
					<span>·</span>
					<span>{item.status === "published" || item.status === "changed" ? item.date : `edited ${ago(item.updatedAt)}`}</span>
				</p>
			</div>
			<div class="flex shrink-0 items-center gap-3 pt-1 text-xs text-muted-foreground">
				{#if item.openThreads}
					<span class="flex items-center gap-1" title="{item.openThreads} open comments">
						<MessageSquare class="h-3.5 w-3.5" />
						<span class="tabular-nums">{item.openThreads}</span>
					</span>
				{/if}
				{#if item.awaitingClaude}
					<span title="{item.awaitingClaude} waiting for Claude"><Avatar actor="claude" size={16} /></span>
				{/if}
				{#if item.url && item.status !== "draft"}
					<span
						role="link"
						tabindex="-1"
						class="opacity-0 transition-opacity group-hover:opacity-100"
						title="Open the live page"
						onclick={e => {
							e.preventDefault()
							window.open(item.url, "_blank")
						}}
						onkeydown={() => {}}
					>
						<ArrowUpRight class="h-3.5 w-3.5" />
					</span>
				{/if}
			</div>
		</a>
	</li>
{/snippet}

<div class="h-full overflow-y-auto">
	<div class="mx-auto max-w-2xl px-5 pb-24 pt-10 sm:pt-16">
		<header class="flex items-center justify-between gap-4">
			<h1 class="font-mono text-sm text-muted-foreground">armanckeser.com / <span class="text-foreground">studio</span></h1>
			<div class="flex items-center gap-2 text-xs text-muted-foreground" title={watching ? "A Claude session is connected and sees new comments as you leave them" : "No Claude session is connected. Comments wait in its inbox (/cms/api/inbox)."}>
				<span class="relative inline-flex">
					<Avatar actor="claude" size={20} dim={!watching} />
					{#if watching}
						<span class="studio-pulse absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background"></span>
					{/if}
				</span>
				<span class="hidden sm:inline">{watching ? "Claude is listening" : "Claude is away"}</span>
				{#if waiting}
					<span class="text-foreground">· {waiting} waiting for it</span>
				{/if}
			</div>
		</header>

		<div class="mt-8 studio-segment" role="group" aria-label="Show">
			<button aria-pressed={tab === "posts"} onclick={() => show("posts")}>Posts</button>
			<button aria-pressed={tab === "notes"} onclick={() => show("notes")}>Notes</button>
		</div>

		<form class="mt-8 flex items-end gap-3" onsubmit={create}>
			<label class="sr-only" for="new-title">{tab === "posts" ? "New post title" : "New note title"}</label>
			<input
				id="new-title"
				bind:value={title}
				autocomplete="off"
				placeholder={tab === "posts" ? "A new post. Type its title and press Enter" : "A new note. Type its title and press Enter"}
				class="min-w-0 flex-1 border-0 border-b border-border bg-transparent pb-3 font-[family-name:var(--studio-serif)] text-2xl tracking-tight outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground/40"
			/>
			{#if tab === "notes"}
				<label class="sr-only" for="new-folder">Kind of note</label>
				<select id="new-folder" bind:value={folder} class="studio-input mb-2 w-auto shrink-0 py-1 text-xs">
					<option value="">Strategy or plan</option>
					<option value="drafts">Post idea</option>
					<option value="research">Research</option>
				</select>
			{/if}
		</form>

		{#each tab === "posts" ? postGroups : noteGroups as group (group.label)}
			{#if group.items.length}
				<section class="mt-12">
					<h2 class="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
						{group.label} <span class="tabular-nums">{group.items.length}</span>
					</h2>
					<ul class="-mx-3">
						{#each group.items as item (item.slug)}
							{@render row(item)}
						{/each}
					</ul>
				</section>
			{/if}
		{/each}

		{#if tab === "notes"}
			<footer class="mt-14 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-4 text-xs text-muted-foreground">
				{#if !sync.available}
					<span>The notes repo isn't connected here{sync.error ? `: ${sync.error}` : "."}</span>
				{:else}
					<span>
						Kept in <span class="font-mono text-foreground">armanckeser.com-notes</span>.
						{#if sync.error}
							<span class="text-[hsl(var(--destructive))]">Last sync failed: {sync.error}</span>
						{:else if sync.pending}
							Changes commit once you pause.
						{:else if sync.lastSync}
							Synced {ago(sync.lastSync)}.
						{/if}
					</span>
					<button class="underline-offset-2 hover:underline disabled:opacity-50" disabled={syncing} onclick={syncNow}>
						{#if syncing}<span class="studio-shimmer">Syncing</span>{:else}Sync now{/if}
					</button>
				{/if}
			</footer>
		{/if}
	</div>
</div>
