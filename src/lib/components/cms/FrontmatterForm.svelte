<script lang="ts">
import { ChevronDown, ChevronUp } from "lucide-svelte"

let {
	title = $bindable(""),
	description = $bindable(""),
	tags = $bindable(""),
	date = $bindable(""),
}: {
	title: string
	description: string
	tags: string
	date: string
} = $props()

let collapsed = $state(false)
</script>

<div class="border-b border-border">
	<button
		type="button"
		class="flex w-full items-center justify-between px-4 py-2 font-mono text-xs text-muted-foreground"
		onclick={() => (collapsed = !collapsed)}
	>
		<span>FRONTMATTER</span>
		{#if collapsed}
			<ChevronDown class="h-3.5 w-3.5" />
		{:else}
			<ChevronUp class="h-3.5 w-3.5" />
		{/if}
	</button>

	{#if !collapsed}
		<div class="space-y-3 px-4 pb-4">
			<div>
				<label for="title" class="block font-mono text-xs text-muted-foreground mb-1">Title</label>
				<input
					id="title"
					name="title"
					type="text"
					bind:value={title}
					placeholder="Post title"
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>
			<div>
				<label for="description" class="block font-mono text-xs text-muted-foreground mb-1">Description</label>
				<input
					id="description"
					name="description"
					type="text"
					bind:value={description}
					placeholder="Short description"
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>
			<div class="flex gap-3">
				<div class="flex-1">
					<label for="tags" class="block font-mono text-xs text-muted-foreground mb-1">Tags (comma separated)</label>
					<input
						id="tags"
						name="tags"
						type="text"
						bind:value={tags}
						placeholder="svelte, web"
						class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>
				<div class="w-40">
					<label for="date" class="block font-mono text-xs text-muted-foreground mb-1">Date</label>
					<input
						id="date"
						name="date"
						type="date"
						bind:value={date}
						class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>
			</div>
		</div>
	{/if}
</div>
