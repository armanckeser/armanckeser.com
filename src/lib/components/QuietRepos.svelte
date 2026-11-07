<!-- The 1,987 AI repos from 2025 behind "A quarter of last year's popular AI
     repos have gone quiet", as pulled on 2026-11-07. -->
<script lang="ts">
import data from "$lib/data/quiet-ai-repos-2025.json"

// Each row: owner/name, stars, created (YYYY-MM), archived (0/1), days since the last commit.
type Row = [string, number, string, number, number]
const rows = data as Row[]
const QUIET_DAYS = 182
const PAGE = 20

const isQuiet = (r: Row) => r[3] === 1 || r[4] > QUIET_DAYS

let query = $state("")
let quietOnly = $state(false)
let sortBy = $state<"stars" | "days">("stars")
let showAll = $state(false)

const visible = $derived.by(() => {
	const q = query.trim().toLowerCase()
	const filtered = rows.filter(
		(r) => (!q || r[0].toLowerCase().includes(q)) && (!quietOnly || isQuiet(r)),
	)
	return filtered.sort((a, b) => (sortBy === "stars" ? b[1] - a[1] : b[4] - a[4]))
})
const shown = $derived(showAll ? visible : visible.slice(0, PAGE))
const quietCount = $derived(visible.filter(isQuiet).length)
</script>

<figure class="quiet not-prose">
	<div class="controls font-mono">
		<input type="search" placeholder="Search repos" bind:value={query} aria-label="Search repos" />
		<label><input type="checkbox" bind:checked={quietOnly} /> Quiet only</label>
		<span class="count">{visible.length.toLocaleString()} repos, {quietCount.toLocaleString()} quiet</span>
	</div>

	<div class="scroll">
		<table>
			<thead class="font-mono">
				<tr>
					<th>Repo</th>
					<th class="num">
						<button class:active={sortBy === "stars"} onclick={() => (sortBy = "stars")}>Stars</button>
					</th>
					<th>Created</th>
					<th class="num">
						<button class:active={sortBy === "days"} onclick={() => (sortBy = "days")}>Last commit</button>
					</th>
				</tr>
			</thead>
			<tbody>
				{#each shown as r (r[0])}
					<tr class:quiet-row={isQuiet(r)}>
						<td><a href="https://github.com/{r[0]}" target="_blank" rel="noopener noreferrer">{r[0]}</a></td>
						<td class="num">{r[1].toLocaleString()}</td>
						<td>{r[2]}</td>
						<td class="num">{r[3] ? "archived" : `${r[4]} days ago`}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="foot font-mono">
		{#if visible.length > PAGE}
			<button onclick={() => (showAll = !showAll)}>
				{showAll ? `Show top ${PAGE}` : `Show all ${visible.length.toLocaleString()}`}
			</button>
		{/if}
		<a href="/data/quiet-ai-repos-2025.csv" download>Download CSV</a>
	</div>
</figure>

<style>
	.quiet {
		margin-block: 2rem;
		font-size: 0.875rem;
	}

	.controls,
	.foot {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem 1.25rem;
		font-size: 0.8rem;
		color: hsl(var(--ink-soft));
	}

	.controls {
		margin-bottom: 0.75rem;
	}

	.foot {
		justify-content: space-between;
		margin-top: 0.75rem;
	}

	input[type="search"] {
		flex: 1 1 12rem;
		min-width: 0;
		padding: 0.35rem 0.6rem;
		border: 1px solid hsl(var(--ink) / 0.2);
		border-radius: 0.375rem;
		background: transparent;
		color: hsl(var(--ink));
		font-size: 16px;
	}

	label {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.scroll {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th,
	td {
		padding: 0.4rem 0.6rem;
		text-align: left;
		border-bottom: 1px solid hsl(var(--ink) / 0.1);
		white-space: nowrap;
	}

	th {
		font-size: 0.75rem;
		font-weight: 500;
		color: hsl(var(--ink-soft));
	}

	.num {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	th button {
		color: inherit;
	}

	th button.active {
		color: hsl(var(--ink));
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	td a {
		color: hsl(var(--ink));
	}

	.quiet-row td:last-child {
		color: hsl(var(--accent));
	}

	.foot button,
	.foot a {
		color: hsl(var(--ink));
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
