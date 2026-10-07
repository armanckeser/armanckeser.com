<script lang="ts">
const { data } = $props()
</script>

<svelte:head>
	<title>{data.title}</title>
</svelte:head>

<main class="h-full overflow-y-auto">
	<div class="mx-auto max-w-[46rem] px-5 py-12 sm:px-8">
		<!-- Same markup and type as a post's sheet, so the studio's preview works on it unchanged. -->
		<article class="sheet post note">
			<div class="prose-blog">
				{@html data.html}
			</div>
		</article>
	</div>
</main>

<style>
	.note :global(table) {
		display: block;
		overflow-x: auto;
		font-size: 0.875rem;
	}
</style>
