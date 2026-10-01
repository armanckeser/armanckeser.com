<!-- The stretch of a post the laptop keeps company with. It sits beside the
     text on a wide screen and pins above it, as a strip, on a narrow one, and
     takes the state of the last <Step> the reader has scrolled past. -->
<script lang="ts">
import { steps } from "$lib/data/laptop-story"
import { motion } from "$lib/rig/motion.svelte"
import type { Snippet } from "svelte"
import Laptop from "./Laptop.svelte"
import Screen from "./Screen.svelte"

const { children } = $props<{ children: Snippet }>()

let story: HTMLElement
let index = $state(0)
const step = $derived(steps[index])
const latest = $derived(step.readings.at(-1))

$effect(() => {
	const marks = [...story.querySelectorAll<HTMLElement>("[data-rig-step]")]
	let frame = 0

	function read() {
		frame = 0
		// A step takes over once its text is well into view.
		const line = innerHeight * 0.5
		const mark = marks.findLast(m => m.getBoundingClientRect().top <= line)
		const found = steps.findIndex(s => s.id === mark?.dataset.rigStep)
		index = Math.max(found, 0)
	}

	function onScroll() {
		frame ||= requestAnimationFrame(read)
	}

	read()
	addEventListener("scroll", onScroll, { passive: true })
	addEventListener("resize", onScroll)
	return () => {
		cancelAnimationFrame(frame)
		removeEventListener("scroll", onScroll)
		removeEventListener("resize", onScroll)
	}
})
</script>

<div class="story" bind:this={story}>
	<aside class="rig-track not-prose" aria-label="The laptop at this point in the story">
		<div class="rig">
			<div class="model">
				<Laptop {step} paused={motion.paused} />
			</div>
			<div class="strip">
				<Screen {step} detail="fps" paused={motion.paused} />
			</div>

			<div class="caption">
				<p class="when font-mono">{step.when}</p>
				<p class="title font-serif">{step.title}</p>
				<p class="reading font-mono">
					{#if latest}
						<span class:bad={latest.bad}>{latest.key} {latest.value}</span>
					{:else}
						not measuring yet
					{/if}
				</p>
				<div class="foot font-mono">
					<ol class="ticks" aria-hidden="true">
						{#each steps as s, i (s.id)}
							<li class:past={i < index} class:now={i === index}></li>
						{/each}
					</ol>
					<button type="button" onclick={() => (motion.paused = !motion.paused)}>
						{motion.paused ? "play" : "pause"}
					</button>
				</div>
			</div>
		</div>
	</aside>

	{@render children()}
</div>

<style>
	.story {
		position: relative;
	}

	/* Narrow: a strip pinned under the header, the screen at its left. */
	.rig-track {
		position: sticky;
		top: var(--header-height);
		z-index: 20;
		margin: 0 calc(var(--sheet-pad) * -1) 2rem;
		border-block: 1px solid hsl(var(--ink) / 0.14);
		background: hsl(var(--paper) / 0.94);
		backdrop-filter: blur(8px);
	}

	.rig {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		padding: 0.5rem var(--sheet-pad);
	}

	.model {
		display: none;
	}

	.strip {
		flex: none;
		width: 6.75rem;
		border-radius: 3px;
		overflow: hidden;
	}

	.caption {
		min-width: 0;
		flex: 1;
		color: hsl(var(--ink));
	}

	.when {
		color: hsl(var(--ink-soft));
		font-size: 0.625rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.title {
		overflow: hidden;
		font-size: 0.9375rem;
		font-weight: 600;
		line-height: 1.25;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.reading {
		overflow: hidden;
		color: hsl(var(--ink-soft));
		font-size: 0.6875rem;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.bad {
		color: hsl(var(--accent));
	}

	.ticks {
		display: none;
	}

	.foot {
		position: absolute;
		top: 0.4rem;
		right: var(--sheet-pad);
	}

	button {
		color: hsl(var(--ink-soft));
		font-size: 0.6875rem;
		letter-spacing: 0.04em;
		transition: transform 140ms var(--ease-out);
	}

	/* A bigger target than the word. */
	button::before {
		content: "";
		position: absolute;
		inset: -0.75rem;
	}

	button {
		position: relative;
	}

	button:active {
		transform: scale(0.96);
	}

	@media (hover: hover) and (pointer: fine) {
		button:hover {
			color: hsl(var(--accent));
		}
	}

	:global(.story :where(h2, h3)) {
		scroll-margin-top: 10rem;
	}

	/* Wide: the laptop itself, in the margin, keeping pace with the text. The
	   post route widens the sheet to make the room. */
	@media (min-width: 1180px) {
		@supports selector(:has(*)) {
			.rig-track {
				position: absolute;
				top: 0.5rem;
				bottom: 0;
				left: calc(100% + 2.5rem);
				z-index: auto;
				width: clamp(22rem, 100vw - 54rem, 27rem);
				margin: 0;
				border: 0;
				background: none;
				backdrop-filter: none;
			}

			.rig {
				position: sticky;
				top: calc(var(--header-height) + 2.5rem);
				display: block;
				padding: 0;
			}

			.model {
				display: block;
			}

			.strip {
				display: none;
			}

			.caption {
				margin-top: 0.5rem;
				padding-left: 0.25rem;
			}

			.title {
				margin-top: 0.3rem;
				font-size: 1.125rem;
				white-space: normal;
			}

			/* The screen itself is readable here, so the caption need not repeat it. */
			.reading {
				display: none;
			}

			.foot {
				position: static;
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-top: 1rem;
			}

			.ticks {
				display: flex;
				gap: 4px;
			}

			.ticks li {
				width: 1.1rem;
				height: 2px;
				background: hsl(var(--ink) / 0.16);
				transition: background-color 200ms ease;
			}

			.ticks .past {
				background: hsl(var(--ink) / 0.5);
			}

			.ticks .now {
				background: hsl(var(--accent));
			}

			:global(.story :where(h2, h3)) {
				scroll-margin-top: 6rem;
			}
		}
	}
</style>
