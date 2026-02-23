<script lang="ts">
import { formatDate } from "$lib/utils"
import { Clock, Edit, GitBranch, Trash2 } from "lucide-svelte"
import type { PageData } from "./$types"

const { data } = $props<{ data: PageData }>()
</script>

<svelte:head>
	<title>CMS - Posts</title>
</svelte:head>

<div class="px-4 py-6 max-w-2xl mx-auto">
	{#if data.gitStatus}
		<div class="mb-4 rounded-md border border-accent/20 bg-accent/5 px-3 py-2 font-mono text-xs text-muted-foreground flex items-center gap-2">
			<GitBranch class="h-3.5 w-3.5 text-accent" />
			<span>Uncommitted changes detected</span>
		</div>
	{/if}

	<h1 class="font-mono text-lg mb-6">Posts ({data.posts.length})</h1>

	<div class="space-y-2">
		{#each data.posts as post}
			<div class="group flex items-center justify-between rounded-lg border border-border p-3 hover:border-accent/30 transition-colors">
				<a href="/cms/editor/{post.slug}" class="flex-1 min-w-0">
					<div class="font-mono text-sm font-medium truncate">{post.title}</div>
					<div class="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
						<Clock class="h-3 w-3" />
						<span>{formatDate(post.date)}</span>
						{#if post.tags?.length}
							<span class="text-accent">
								{post.tags.map((tag: string) => `#${tag}`).join(" ")}
							</span>
						{/if}
					</div>
				</a>
				<div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
					<a
						href="/cms/editor/{post.slug}"
						class="p-2 rounded-md hover:bg-accent/10 text-muted-foreground hover:text-accent"
					>
						<Edit class="h-4 w-4" />
					</a>
					<form method="POST" action="/cms/editor/{post.slug}?/delete">
						<button
							type="submit"
							class="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
						>
							<Trash2 class="h-4 w-4" />
						</button>
					</form>
				</div>
			</div>
		{:else}
			<div class="text-center py-12 text-muted-foreground font-mono text-sm">
				No posts yet. Create your first one.
			</div>
		{/each}
	</div>
</div>
