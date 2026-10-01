<!-- The laptop, drawn in the page's ink and built from flat faces in 3D, so it
     can be lifted onto its riser and looked at from a little above. Its screen
     is the one thing on it that is not paper. -->
<script lang="ts">
import type { Step } from "$lib/data/laptop-story"
import { tilt } from "$lib/tilt"
import Screen from "./Screen.svelte"

const {
	step,
	detail = "full",
	paused = false,
} = $props<{
	step: Step
	detail?: "full" | "fps"
	paused?: boolean
}>()
</script>

<div class="stage" use:tilt={{ max: 5 }}>
	<div class="world" class:raised={step.raised} data-heat={step.heat}>
		<div class="camera">
			<div class="ground"></div>
			<div class="riser"></div>

			<div class="body">
				<div class="face deck"></div>
				<div class="face front"></div>
				<div class="face right"></div>

				<div class="hinge">
					<div class="face lid">
						<Screen {step} {detail} {paused} />
					</div>
				</div>

				<svg class="heat" viewBox="0 0 30 60" aria-hidden="true">
					<path d="M6 58c-5-7 5-11 0-18s5-11 0-18" />
					<path d="M15 58c-5-7 5-11 0-18s5-11 0-18" />
					<path d="M24 58c-5-7 5-11 0-18s5-11 0-18" />
				</svg>
			</div>
		</div>
	</div>
</div>

<style>
	.stage {
		container-type: inline-size;
		aspect-ratio: 100 / 84;
	}

	/* Every length is a share of the stage, so the model scales as one piece. */
	.world {
		--w: 80cqw;
		--d: calc(var(--w) * 0.6);
		--t: calc(var(--w) * 0.035);
		--bezel: calc(var(--w) * 0.022);
		--lid: calc((var(--w) - var(--bezel) * 2) * 0.625 + var(--bezel) * 2.6);
		--lift: calc(var(--d) * 0.1);

		--line: hsl(var(--ink) / 0.5);
		--shell: color-mix(in srgb, hsl(var(--paper)) 88%, hsl(var(--ink)));
		--shell-shade: color-mix(in srgb, hsl(var(--paper)) 74%, hsl(var(--ink)));

		position: relative;
		height: 100%;
		perspective: 230cqw;
		perspective-origin: 50% 30%;
	}

	.camera,
	.body,
	.hinge {
		position: absolute;
		transform-style: preserve-3d;
	}

	/* Seen from a little above and to the right, so the screen faces the text. */
	.camera {
		top: 73%;
		left: 50%;
		transform: rotateX(-13deg) rotateY(-19deg);
	}

	.face,
	.ground,
	.riser,
	.heat {
		position: absolute;
	}

	.face {
		border: 1px solid var(--line);
	}

	/* The body pivots on its front feet: lifting the rear is what the riser does. */
	.body {
		transform-origin: 0 calc(var(--t) / 2) calc(var(--d) / 2);
		transition: transform 700ms var(--ease-in-out);
	}

	.raised .body {
		transform: rotateX(-5.7deg);
	}

	.deck {
		width: var(--w);
		height: var(--d);
		margin: calc(var(--d) / -2) 0 0 calc(var(--w) / -2);
		transform: translateY(calc(var(--t) / -2)) rotateX(90deg);
		/* Keys, as a grid of fine lines, and the trackpad below them. */
		background:
			linear-gradient(var(--shell), var(--shell)) 50% 86% / 34% 27% no-repeat,
			linear-gradient(var(--line), var(--line)) 50% 87% / calc(34% + 2px) calc(27% + 2px) no-repeat,
			repeating-linear-gradient(90deg, transparent 0 6.2%, var(--line) 6.2% calc(6.2% + 1px), transparent 0 6.667%)
				50% 14% / 90% 46% no-repeat,
			repeating-linear-gradient(0deg, transparent 0 19%, var(--line) 19% calc(19% + 1px), transparent 0 20%)
				50% 14% / 90% 46% no-repeat,
			var(--shell);
	}

	.front {
		width: var(--w);
		height: var(--t);
		margin: calc(var(--t) / -2) 0 0 calc(var(--w) / -2);
		transform: translateZ(calc(var(--d) / 2));
		background: var(--shell-shade);
	}

	.right {
		width: var(--d);
		height: var(--t);
		margin: calc(var(--t) / -2) 0 0 calc(var(--d) / -2);
		transform: rotateY(90deg) translateZ(calc(var(--w) / 2));
		background: var(--shell-shade);
	}

	.hinge {
		transform: translate3d(0, calc(var(--t) / -2), calc(var(--d) / -2 + var(--t)));
	}

	.lid {
		width: var(--w);
		margin: calc(var(--lid) * -1) 0 0 calc(var(--w) / -2);
		height: var(--lid);
		padding: var(--bezel) var(--bezel) 0;
		border-radius: 1.2cqw 1.2cqw 0 0;
		background: hsl(40 6% 11%);
		transform-origin: 50% 100%;
		transform: rotateX(11deg);
	}

	/* A wedge under the rear, seen from its side. */
	.riser {
		width: var(--d);
		height: var(--lift);
		margin: calc(var(--t) / 2 - var(--lift)) 0 0 calc(var(--d) / -2);
		background: hsl(var(--accent));
		clip-path: polygon(6% 100%, 96% 100%, 96% 0, 80% 0);
		opacity: 0;
		transform: rotateY(90deg) translateZ(calc(var(--w) / 2 + 1px));
		transition: opacity 400ms ease;
	}

	.raised .riser {
		opacity: 1;
		transition-delay: 250ms;
	}

	.ground {
		width: calc(var(--w) * 1.16);
		height: calc(var(--d) * 1.3);
		margin: calc(var(--d) * -0.65) 0 0 calc(var(--w) * -0.58);
		background: radial-gradient(closest-side, rgb(0 0 0 / 0.22), transparent);
		transform: translateY(calc(var(--t) / 2 + 1px)) rotateX(90deg);
	}

	/* Hot air leaving at the rear corner. How much of it is the step's heat. */
	.heat {
		width: 7cqw;
		height: 14cqw;
		margin: -14cqw 0 0 0;
		fill: none;
		stroke: hsl(var(--accent));
		stroke-width: 1.6;
		stroke-linecap: round;
		opacity: 0;
		transform: translate3d(calc(var(--w) / 2 + 1cqw), calc(var(--t) * -1), calc(var(--d) / -2)) rotateY(19deg);
		transition: opacity 500ms ease;
	}

	[data-heat="1"] .heat {
		opacity: 0.3;
	}

	[data-heat="2"] .heat {
		opacity: 0.95;
	}

	@media (prefers-reduced-motion: no-preference) {
		.heat path {
			animation: rise 2.6s linear infinite;
		}

		.heat path:nth-child(2) {
			animation-delay: -0.9s;
		}

		.heat path:nth-child(3) {
			animation-delay: -1.7s;
		}

		[data-heat="2"] .heat path {
			animation-duration: 1.5s;
		}
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(18%);
		}
		30%,
		60% {
			opacity: 1;
		}
		to {
			opacity: 0;
			transform: translateY(-22%);
		}
	}
</style>
