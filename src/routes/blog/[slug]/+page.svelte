<script lang="ts">
	import type { PageData } from "./$types"

	const props = $props<{ data: PageData }>()
	const Component = $derived(props.data.content)
</script>

<svelte:component this={Component} />
