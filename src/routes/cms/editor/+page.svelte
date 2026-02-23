<script lang="ts">
import { deserialize } from "$app/forms"
import FrontmatterForm from "$lib/components/cms/FrontmatterForm.svelte"
import PublishBar from "$lib/components/cms/PublishBar.svelte"
import TerminalHeader from "$lib/components/TerminalHeader.svelte"
import { cn, formatDate } from "$lib/utils"
import { Carta, MarkdownEditor } from "carta-md"
import "carta-md/default.css"
import { Eye, PenLine } from "lucide-svelte"

const carta = new Carta({ sanitizer: false })

let title = $state("")
let description = $state("")
let tags = $state("")
let date = $state(new Date().toISOString().split("T")[0])
let content = $state("")
let publishing = $state(false)
let saving = $state(false)

let activeTab = $state<"write" | "preview">("write")
let previewHtml = $state("")
let loadingPreview = $state(false)

async function fetchPreview(): Promise<void> {
	loadingPreview = true
	try {
		const formData = new FormData()
		formData.set("content", content)
		const response = await fetch("/cms/editor?/preview", {
			method: "POST",
			body: formData,
		})
		const result = deserialize(await response.text())
		if (result.type === "success" && result.data) {
			previewHtml = (result.data as { html: string }).html
		}
	} finally {
		loadingPreview = false
	}
}

function switchTab(tab: "write" | "preview"): void {
	activeTab = tab
	if (tab === "preview") {
		fetchPreview()
	}
}

const tagList = $derived(
	tags
		? tags
				.split(",")
				.map((t: string) => t.trim())
				.filter(Boolean)
		: []
)

async function submitForm(action: string): Promise<void> {
	const formData = new FormData()
	formData.set("title", title)
	formData.set("description", description)
	formData.set("tags", tags)
	formData.set("date", date)
	formData.set("content", content)

	const response = await fetch(`/cms/editor?/${action}`, {
		method: "POST",
		body: formData,
	})

	if (action === "publish" && response.redirected) {
		window.location.href = response.url
	}
}

async function handleSave(): Promise<void> {
	saving = true
	try {
		await submitForm("save")
	} finally {
		saving = false
	}
}

async function handlePublish(): Promise<void> {
	publishing = true
	try {
		await submitForm("publish")
	} finally {
		publishing = false
	}
}

// Auto-save to localStorage
$effect(() => {
	const draft = JSON.stringify({ title, description, tags, date, content })
	localStorage.setItem("cms-draft-new", draft)
})

// Restore draft on mount
$effect(() => {
	const saved = localStorage.getItem("cms-draft-new")
	if (saved) {
		try {
			const draft = JSON.parse(saved)
			title = draft.title ?? ""
			description = draft.description ?? ""
			tags = draft.tags ?? ""
			date = draft.date ?? new Date().toISOString().split("T")[0]
			content = draft.content ?? ""
		} catch {
			// ignore corrupt drafts
		}
	}

	return () => {}
})
</script>

<svelte:head>
	<title>New Post - CMS</title>
	<style>
		.anchor-link {
			opacity: 0;
			color: var(--color-accent);
			margin-left: 0.25rem;
			font-size: 0.75em;
			text-decoration: none;
			transition: opacity 0.2s ease;
			cursor: pointer;
		}
		h1:hover .anchor-link,
		h2:hover .anchor-link,
		h3:hover .anchor-link,
		h4:hover .anchor-link,
		h5:hover .anchor-link,
		h6:hover .anchor-link {
			opacity: 1;
		}
	</style>
</svelte:head>

<div class="flex flex-col h-full">
	<FrontmatterForm bind:title bind:description bind:tags bind:date />

	<!-- Tab bar -->
	<div class="flex border-b border-border bg-background px-4">
		<button
			type="button"
			class={cn(
				"font-mono text-sm px-3 py-2 border-b-2 -mb-px transition-colors",
				activeTab === "write"
					? "border-accent text-foreground font-semibold"
					: "border-transparent text-muted-foreground hover:text-foreground"
			)}
			onclick={() => switchTab("write")}
		>
			<span class="flex items-center gap-1.5">
				<PenLine class="h-3.5 w-3.5" />
				Write
			</span>
		</button>
		<button
			type="button"
			class={cn(
				"font-mono text-sm px-3 py-2 border-b-2 -mb-px transition-colors",
				activeTab === "preview"
					? "border-accent text-foreground font-semibold"
					: "border-transparent text-muted-foreground hover:text-foreground"
			)}
			onclick={() => switchTab("preview")}
		>
			<span class="flex items-center gap-1.5">
				<Eye class="h-3.5 w-3.5" />
				Preview
			</span>
		</button>
	</div>

	<div class="flex-1 min-h-0 overflow-hidden">
		<!-- Write tab: carta textarea only -->
		{#if activeTab === "write"}
			<div class="h-full carta-wrapper">
				<MarkdownEditor {carta} bind:value={content} mode="tabs" selectedTab="write" placeholder="Start writing..." />
			</div>
		{:else}
			<!-- Preview tab: exact same layout as the blog post page -->
			<div class="h-full overflow-y-auto">
				<article class="container mx-auto px-4 py-8 md:px-8 md:py-16">
					<div class="max-w-[85rem] mx-auto">
						<div class="flex-1 max-w-[65ch] lg:max-w-[75ch] xl:max-w-[85ch]">
							<TerminalHeader
								command="cat {title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'untitled'}.md"
								title={title || "Untitled"}
								description={description || undefined}
							/>

							<div class="prose-blog">
								{#if loadingPreview}
									<p class="text-muted-foreground font-mono text-sm">Rendering...</p>
								{:else}
									{@html previewHtml}
								{/if}
							</div>

							<!-- Terminal-style metadata footer -->
							<div class="font-mono text-sm border-t border-accent/20 pt-4 mt-8">
								<div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
									<span class="text-muted-foreground">LAST_MODIFIED:</span>
									<span>{formatDate(date)}</span>
									{#if tagList.length}
										<span class="text-muted-foreground">TAGS:</span>
										<div class="flex flex-wrap gap-2">
											{#each tagList as tag}
												<span class={cn("font-mono text-xs px-1.5 py-0.5 rounded", "bg-accent/10 text-accent")}>
													#{tag}
												</span>
											{/each}
										</div>
									{/if}
								</div>
							</div>
						</div>
					</div>
				</article>
			</div>
		{/if}
	</div>

	<PublishBar {publishing} {saving} onpublish={handlePublish} onsave={handleSave} />
</div>

<style>
	/* carta-editor fills our wrapper */
	.carta-wrapper :global(.carta-editor) {
		height: 100%;
		display: flex;
		flex-direction: column;
		border: none;
		border-radius: 0;
	}

	/* carta's internal .carta-wrapper grows in the flex column instead of being sized by 600px content */
	.carta-wrapper :global(.carta-editor > .carta-wrapper) {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		padding: 0;
	}

	/* .carta-container holds input + renderer */
	.carta-wrapper :global(.carta-container) {
		flex: 1;
		min-height: 0;
	}

	/* Override hardcoded height: 600px from default.css */
	.carta-wrapper :global(.carta-input) {
		height: 100% !important;
		overflow-y: auto !important;
	}

	.carta-wrapper :global(.carta-input-wrapper) {
		height: 100%;
		padding: 1.25rem 1.5rem;
	}

	/* Hide carta's own tab bar since we use our own */
	.carta-wrapper :global(.carta-toolbar) {
		display: none;
	}

	/* Match site colors */
	.carta-wrapper :global(textarea) {
		font-family: monospace;
		font-size: 0.875rem;
		line-height: 1.625;
		color: hsl(var(--foreground));
		caret-color: hsl(var(--accent));
		background: hsl(var(--background));
	}

	.carta-wrapper :global(textarea::placeholder) {
		color: hsl(var(--muted-foreground));
	}

	.carta-wrapper :global(textarea::selection) {
		background: hsl(var(--accent) / 0.2);
		color: hsl(var(--foreground));
	}
</style>
