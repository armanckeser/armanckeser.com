<script lang="ts">
import { page } from "$app/state"
import { FileText, Home, PenLine } from "lucide-svelte"

const { children } = $props()

const isEditing = $derived(page.url.pathname.includes("/cms/editor"))
</script>

<div class="h-dvh flex flex-col bg-background text-foreground">
	<nav class="shrink-0 border-b border-border bg-background/95 backdrop-blur">
		<div class="flex items-center justify-between px-4 h-14">
			<div class="flex items-center gap-3">
				<a href="/cms" class="font-mono text-sm text-accent flex items-center gap-2">
					<Home class="h-4 w-4" />
					<span class="hidden sm:inline">CMS</span>
				</a>
				{#if isEditing}
					<span class="text-muted-foreground">/</span>
					<span class="font-mono text-sm flex items-center gap-1.5">
						<PenLine class="h-3.5 w-3.5" />
						Editor
					</span>
				{/if}
			</div>
			<a
				href="/cms/editor"
				class="flex items-center gap-2 rounded-md bg-accent px-3 py-1.5 font-mono text-sm text-accent-foreground"
			>
				<FileText class="h-3.5 w-3.5" />
				New Post
			</a>
		</div>
	</nav>

	<main class="flex-1 min-h-0 overflow-hidden">
		{@render children()}
	</main>
</div>
