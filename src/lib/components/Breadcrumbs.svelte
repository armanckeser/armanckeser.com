<script lang="ts">
import { page } from "$app/state"

interface Segment {
	text: string
	href: string
	isLast: boolean
}

const props = $props<{
	path: string
	isPostPage: boolean
	title?: string
}>()

const segments = $derived(() => {
	const parts = props.path.split("/").filter(Boolean)
	let accumulatedPath = ""
	return parts.map((part: string, index: number) => {
		accumulatedPath += `/${part}`
		return {
			text: part === "blog" ? "writing" : part,
			href: accumulatedPath,
			isLast: index === parts.length - 1,
		}
	})
})
</script>

<nav class="flex items-center space-x-2 font-mono text-sm">
	<a href="/" class="text-primary transition-colors hover:text-emerald-500"
		>~</a
	>

	{#each segments() as segment, i}
		<span class="text-muted-foreground">/</span>
		{#if segment.isLast && props.isPostPage}
			<span class="text-muted-foreground">{props.title}</span>
		{:else}
			<a
				href={segment.href}
				class="text-primary transition-colors hover:text-emerald-500"
			>
				{segment.text}
			</a>
		{/if}
	{/each}
</nav>
