<!-- The result, before any of the explanation: the same laptop an hour apart. -->
<script lang="ts">
import { stepById } from "$lib/data/laptop-story"
import { motion } from "$lib/rig/motion.svelte"
import Laptop from "./Laptop.svelte"

const before = stepById("collapse")
const after = stepById("fixed")
</script>

<figure class="pair not-prose">
	<div class="laptops">
		<div>
			<Laptop step={before} detail="fps" paused={motion.paused} />
			<p class="when font-mono">{before.when}</p>
		</div>
		<div>
			<Laptop step={after} detail="fps" paused={motion.paused} />
			<p class="when font-mono">{after.when}</p>
		</div>
	</div>
	<figcaption class="font-serif">
		Both screens show the same scene at the same moment. The left one only
		gets redrawn twice a second.
		<button type="button" class="font-mono" onclick={() => (motion.paused = !motion.paused)}>
			{motion.paused ? "play" : "pause"}
		</button>
	</figcaption>
</figure>

<style>
	.pair {
		max-width: 52rem;
		margin: 0 auto 2.25rem;
	}

	.laptops {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
	}

	.when {
		margin-top: 0.15rem;
		color: hsl(var(--ink-soft));
		font-size: 0.6875rem;
		letter-spacing: 0.14em;
		text-align: center;
		text-transform: uppercase;
	}

	figcaption {
		max-width: 30rem;
		margin: 1rem auto 0;
		color: hsl(var(--ink-soft));
		font-size: 0.9375rem;
		font-style: italic;
		line-height: 1.5;
		text-align: center;
		text-wrap: balance;
	}

	button {
		position: relative;
		margin-left: 0.35em;
		color: hsl(var(--accent));
		font-size: 0.75rem;
		font-style: normal;
		transition: transform 140ms var(--ease-out);
	}

	button::before {
		content: "";
		position: absolute;
		inset: -0.75rem -0.5rem;
	}

	button:active {
		transform: scale(0.96);
	}
</style>
