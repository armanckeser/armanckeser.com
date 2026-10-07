<script lang="ts">
/**
 * Every post, drafts first: that's where the work is. A title typed at the top
 * is a new draft; there's nothing else to fill in to start.
 */
import { goto, invalidateAll } from "$app/navigation"
import { ArrowUpRight, MessageSquare } from "lucide-svelte"
import { toast } from "svelte-sonner"
import Avatar from "$lib/components/studio/Avatar.svelte"
import { api } from "$lib/studio/api"
import { ago } from "$lib/studio/threads"
import type { PostSummary } from "$lib/studio/types"

const { data } = $props()

let title = $state("")
let creating = $state(false)
let watching = $state(data.agentWatching)

const drafts = $derived(
	data.posts.filter((p: PostSummary) => p.status === "draft")
)
const live = $derived(
	data.posts.filter((p: PostSummary) => p.status !== "draft")
)
const waiting = $derived(
	data.posts.reduce((n: number, p: PostSummary) => n + p.awaitingClaude, 0)
)

async function create(event: SubmitEvent) {
	event.preventDefault()
	if (!title.trim() || creating) return
	creating = true
	try {
		const post = await api.create(title)
		await goto(`/cms/${post.slug}`)
	} catch (e) {
		toast.error((e as Error).message)
		creating = false
	}
}

// Keep the list current while it's open: comments and drafts arrive from Claude too.
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
	for (const type of ["thread", "created", "published"])
		source.addEventListener(type, refresh)
	return () => {
		clearTimeout(timer)
		source.close()
	}
})

const statusLabel = {
	draft: "Draft",
	published: "Published",
	changed: "Edited since publishing",
}
</script>

<svelte:head>
	<title>Studio</title>
</svelte:head>

<div class="h-full overflow-y-auto">
	<div class="mx-auto max-w-2xl px-5 pb-24 pt-10 sm:pt-16">
		<header class="flex items-center justify-between">
			<div>
				<h1 class="font-mono text-sm text-muted-foreground">armanckeser.com / <span class="text-foreground">studio</span></h1>
			</div>
			<div class="flex items-center gap-2 text-xs text-muted-foreground" title={watching ? "A Claude session is connected and sees new comments as you leave them" : "No Claude session is connected. Comments wait in its inbox (/cms/api/inbox)."}>
				<span class="relative inline-flex">
					<Avatar actor="claude" size={20} dim={!watching} />
					{#if watching}
						<span class="studio-pulse absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background"></span>
					{/if}
				</span>
				{watching ? "Claude is listening" : "Claude is away"}
				{#if waiting}
					<span class="text-foreground">· {waiting} waiting for it</span>
				{/if}
			</div>
		</header>

		<form class="mt-10" onsubmit={create}>
			<label class="sr-only" for="new-title">New post title</label>
			<input
				id="new-title"
				bind:value={title}
				autocomplete="off"
				placeholder="A new post. Type its title and press Enter"
				class="w-full border-0 border-b border-border bg-transparent pb-3 font-[family-name:var(--studio-serif)] text-2xl tracking-tight outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground/40"
			/>
		</form>

		{#each [{ label: "Drafts", posts: drafts }, { label: "Published", posts: live }] as group (group.label)}
			{#if group.posts.length}
				<section class="mt-12">
					<h2 class="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
						{group.label} <span class="tabular-nums">{group.posts.length}</span>
					</h2>
					<ul class="-mx-3">
						{#each group.posts as post (post.slug)}
							<li>
								<a
									href="/cms/{post.slug}"
									class="group flex items-start justify-between gap-4 rounded-xl px-3 py-3 transition-colors duration-150 hover:bg-foreground/[0.04]"
								>
									<div class="min-w-0">
										<p class="truncate font-[family-name:var(--studio-serif)] text-[17px] leading-snug text-foreground">{post.title}</p>
										<p class="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
											{#if post.status === "changed"}
												<span class="text-[hsl(var(--accent))]">{statusLabel.changed}</span>
												<span>·</span>
											{/if}
											<span class="tabular-nums">{post.words.toLocaleString()} words</span>
											<span>·</span>
											<span>{post.status === "draft" ? `edited ${ago(post.updatedAt)}` : post.date}</span>
										</p>
									</div>
									<div class="flex shrink-0 items-center gap-3 pt-1 text-xs text-muted-foreground">
										{#if post.openThreads}
											<span class="flex items-center gap-1" title="{post.openThreads} open comments">
												<MessageSquare class="h-3.5 w-3.5" />
												<span class="tabular-nums">{post.openThreads}</span>
											</span>
										{/if}
										{#if post.awaitingClaude}
											<span title="{post.awaitingClaude} waiting for Claude"><Avatar actor="claude" size={16} /></span>
										{/if}
										{#if post.status !== "draft"}
											<span
												role="link"
												tabindex="-1"
												class="opacity-0 transition-opacity group-hover:opacity-100"
												title="Open the live page"
												onclick={e => {
													e.preventDefault()
													window.open(post.url, "_blank")
												}}
												onkeydown={() => {}}
											>
												<ArrowUpRight class="h-3.5 w-3.5" />
											</span>
										{/if}
									</div>
								</a>
							</li>
						{/each}
					</ul>
				</section>
			{/if}
		{/each}
	</div>
</div>
