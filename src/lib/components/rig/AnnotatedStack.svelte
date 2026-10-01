<!-- The kernel stack from the trace, each frame with what it means in words. -->
<script lang="ts">
const frames = [
	{
		fn: "dxgmms2.sys!VidMmWorkerThreadProc",
		share: "75.81%",
		means: "The kernel thread that manages GPU memory on behalf of every program.",
	},
	{
		fn: "dxgmms2.sys!VIDMM_GLOBAL::HandleTrimWnf",
		share: "75.28%",
		means: "Memory is tight (a game holding 7 of 8 GB will do it), so it asks processes to shrink.",
	},
	{
		fn: "ntkrnlmp.exe!NtUpdateWnfStateData",
		share: "74.68%",
		means: "It asks through WNF, the kernel's own publish and subscribe.",
	},
	{
		fn: "ntkrnlmp.exe!ExpWnfFindScopeInstance",
		share: "74.30%",
		means: "To publish, it has to find the right scope, and it finds it by walking a list",
	},
	{
		fn: "ntkrnlmp.exe!memcmp",
		share: "15.97%",
		means: "comparing one entry at a time.",
	},
]
</script>

<figure class="stack not-prose">
	<ol>
		{#each frames as frame, depth}
			<li style:--depth={Math.min(depth, 3)}>
				<code>{frame.fn}</code>
				<span class="share font-mono">{frame.share}</span>
				<p class="font-serif">{frame.means}</p>
			</li>
		{/each}
	</ol>
	<figcaption class="font-serif">
		Ten seconds of the System process, by share of its CPU time. Each line calls the one below it.
	</figcaption>
</figure>

<style>
	.stack {
		margin-block: 2rem;
	}

	/* The trace is the terminal showing through the paper. */
	ol {
		padding: 0.5rem 0;
		border: 1px solid hsl(var(--border));
		border-radius: 0.5rem;
		background: hsl(var(--background));
	}

	li {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 0.1rem 1rem;
		padding: 0.55rem 1.1rem 0.6rem calc(1.1rem + var(--depth) * 0.9rem);
	}

	code {
		padding: 0;
		background: none;
		overflow-wrap: anywhere;
		color: hsl(var(--foreground));
		font-family: theme("fontFamily.mono");
		font-size: 0.8125rem;
	}

	.share {
		color: hsl(var(--accent));
		font-size: 0.8125rem;
		font-variant-numeric: tabular-nums;
	}

	p {
		grid-column: 1 / -1;
		color: hsl(var(--muted-foreground));
		font-size: 0.9375rem;
		line-height: 1.45;
	}

	figcaption {
		margin-top: 0.9rem;
		color: hsl(var(--ink-soft));
		font-size: 0.9375rem;
		font-style: italic;
		line-height: 1.5;
	}

	@media (max-width: 639px) {
		ol {
			margin-inline: calc(var(--sheet-pad) * -1);
			border-inline-width: 0;
			border-radius: 0;
		}
	}
</style>
