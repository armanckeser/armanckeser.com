<!-- src/routes/terminal-debug/+page.svelte -->
<script lang="ts">
import type { RouteManifest } from "$lib/terminal/types"
import { getAllPaths } from "$lib/terminal/route-manifest"
import { page } from "$app/stores"

const routeManifest = $page.data.routeManifest as RouteManifest
const paths = getAllPaths(routeManifest)

function formatManifest(manifest: RouteManifest, depth = 0): string {
	const indent = "  ".repeat(depth)
	let result = ""

	for (const [key, value] of Object.entries(manifest)) {
		result += `${indent}${key}:\n`
		result += `${indent}  isPage: ${value.isPage}\n`
		if (value.params) {
			result += `${indent}  params: ${value.params.join(", ")}\n`
		}
		if (Object.keys(value.children).length > 0) {
			result += `${indent}  children:\n`
			result += formatManifest(value.children, depth + 2)
		}
	}

	return result
}
</script>

<div class="p-4 space-y-8">
  <div class="space-y-2">
    <h1 class="text-2xl font-bold">Terminal Debug</h1>
    <p class="text-gray-600">Route manifest visualization for development</p>
  </div>

  <div class="space-y-4">
    <h2 class="text-xl font-semibold">Available Paths</h2>
    <ul class="list-disc pl-5 space-y-1">
      {#each paths as path}
        <li>{path}</li>
      {/each}
    </ul>
  </div>

  <div class="space-y-4">
    <h2 class="text-xl font-semibold">Route Manifest Structure</h2>
    <pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto whitespace-pre">
      {formatManifest(routeManifest)}
    </pre>
  </div>
</div> 