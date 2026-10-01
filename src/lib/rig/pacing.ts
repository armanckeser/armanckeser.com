import type { Pace } from "$lib/data/laptop-story"

export interface Painted {
	/** Milliseconds since the frame before. */
	dt: number
	/** Set when a stall starts with this frame: how long it will hold. */
	hold?: number
}

const between = ([lo, hi]: [number, number]) => lo + Math.random() * (hi - lo)

/**
 * Decides, on every animation frame, whether the screen gets a new picture.
 * The world behind the screen keeps its own clock; a slow or stalling pace
 * only means we look at it less often, which is what a low frame rate is.
 */
export function createPacer() {
	let last = 0
	let nextAt = 0
	let hitchAt = 0

	return {
		/** Forget the past, so a pause does not count as one long frame. */
		reset(now: number) {
			last = 0
			nextAt = now
			hitchAt = 0
		},

		tick(now: number, pace: Pace): Painted | null {
			// A millisecond of grace: the display's own clock jitters by about that.
			if (now < nextAt - 1) return null

			const dt = last ? Math.max(now - last, 1) : 1000 / pace.fps[1]
			last = now

			const interval = 1000 / between(pace.fps)
			// Keep to the schedule rather than to "now", so a fast display still
			// averages the stated rate. If we fell behind, start again from here.
			nextAt =
				nextAt + interval < now ? now + interval : nextAt + interval

			let hold: number | undefined
			if (pace.hitch) {
				if (!hitchAt) hitchAt = now + between(pace.hitch.gap)
				if (now >= hitchAt) {
					hold = between(pace.hitch.hold)
					nextAt += hold
					hitchAt = now + hold + between(pace.hitch.gap)
				}
			} else {
				hitchAt = 0
			}

			return { dt, hold }
		},
	}
}
