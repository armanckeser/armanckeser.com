/**
 * Leans a card toward the pointer, the way a card held by its far edge would.
 * The lean follows on a spring, so it has weight and settles instead of
 * snapping. Purely decorative: mouse only, and off under reduced motion.
 *
 * Also exposes the pointer's position as `--tilt-x` / `--tilt-y` (-1 to 1) so
 * what lies on the card can shift against it for depth.
 */
export function tilt(node: HTMLElement, { max = 3.5 } = {}) {
	if (
		!matchMedia("(hover: hover) and (pointer: fine)").matches ||
		matchMedia("(prefers-reduced-motion: reduce)").matches
	)
		return

	const STIFFNESS = 180
	const DAMPING = 22

	const target = { x: 0, y: 0 }
	const current = { x: 0, y: 0 }
	const velocity = { x: 0, y: 0 }
	let frame = 0
	let last = 0

	function step(now: number) {
		// Clamped so a background tab coming back does not fling the card.
		const dt = Math.min((now - last) / 1000, 1 / 30)
		last = now
		for (const axis of ["x", "y"] as const) {
			const force =
				STIFFNESS * (target[axis] - current[axis]) -
				DAMPING * velocity[axis]
			velocity[axis] += force * dt
			current[axis] += velocity[axis] * dt
		}

		const atRest =
			Math.abs(target.x - current.x) + Math.abs(target.y - current.y) <
				0.002 && Math.abs(velocity.x) + Math.abs(velocity.y) < 0.002
		if (atRest && target.x === 0 && target.y === 0) {
			node.style.removeProperty("transform")
			node.style.removeProperty("--tilt-x")
			node.style.removeProperty("--tilt-y")
			frame = 0
			return
		}

		// A wide card needs less angle to move its edges as far as a narrow one.
		const reach = Math.min(1, 520 / node.offsetWidth)
		node.style.transform = `perspective(1100px) rotateX(${(-current.y * max).toFixed(3)}deg) rotateY(${(current.x * max * reach).toFixed(3)}deg)`
		node.style.setProperty("--tilt-x", current.x.toFixed(3))
		node.style.setProperty("--tilt-y", current.y.toFixed(3))
		frame = requestAnimationFrame(step)
	}

	function start() {
		if (frame) return
		last = performance.now()
		frame = requestAnimationFrame(step)
	}

	function handlePointerMove(e: PointerEvent) {
		if (e.pointerType !== "mouse") return
		const rect = node.getBoundingClientRect()
		target.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
		target.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
		start()
	}

	function handlePointerLeave() {
		target.x = 0
		target.y = 0
		start()
	}

	node.addEventListener("pointermove", handlePointerMove)
	node.addEventListener("pointerleave", handlePointerLeave)

	return {
		destroy() {
			cancelAnimationFrame(frame)
			node.removeEventListener("pointermove", handlePointerMove)
			node.removeEventListener("pointerleave", handlePointerLeave)
		},
	}
}
