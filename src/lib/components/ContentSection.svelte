<script lang="ts">
import type { Snippet } from "svelte"

const { title, subtitle, children } = $props<{
	title: string
	subtitle?: string
	children: Snippet
}>()
</script>

<section class="relative w-full space-y-6">
	<!-- Section Header -->
	<div class="space-y-3">
		<div class="flex items-center gap-3">
			<div class="h-px w-12 bg-emerald-500/20 md:w-16"></div>
			<h2
				class="font-mono text-xl font-medium tracking-tight text-primary md:text-2xl"
			>
				{title}
			</h2>
		</div>
		{#if subtitle}
			<p class="font-mono text-sm text-muted-foreground md:text-base">
				{subtitle}
			</p>
		{/if}
	</div>

	<!-- Content -->
	<div class="w-full">
		{@render children()}
	</div>
</section>
