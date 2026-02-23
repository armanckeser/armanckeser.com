<script lang="ts">
import { Loader2, Rocket, Save } from "lucide-svelte"

let {
	publishing = false,
	saving = false,
	onpublish,
	onsave,
}: {
	publishing: boolean
	saving: boolean
	onpublish: () => void
	onsave: () => void
} = $props()

const busy = $derived(publishing || saving)
</script>

<div class="sticky bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur px-4 py-3">
	<div class="flex items-center justify-between gap-3 max-w-2xl mx-auto">
		<button
			type="button"
			disabled={busy}
			onclick={onsave}
			class="flex items-center gap-2 rounded-md border border-input px-3 py-2 font-mono text-sm text-muted-foreground hover:text-foreground hover:border-accent/30 transition-colors disabled:opacity-50"
		>
			{#if saving}
				<Loader2 class="h-4 w-4 animate-spin" />
			{:else}
				<Save class="h-4 w-4" />
			{/if}
			Save Draft
		</button>
		<button
			type="button"
			disabled={busy}
			onclick={onpublish}
			class="flex items-center gap-2 rounded-md bg-accent px-4 py-2 font-mono text-sm text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50"
		>
			{#if publishing}
				<Loader2 class="h-4 w-4 animate-spin" />
				Deploying...
			{:else}
				<Rocket class="h-4 w-4" />
				Publish
			{/if}
		</button>
	</div>
</div>
