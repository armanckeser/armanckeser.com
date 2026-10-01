/**
 * What is on the laptop's screen: a slow swim over a seabed, drawn small and
 * flattened to four shades of the terminal's green.
 *
 * The picture is a pure function of time. Nothing is stepped from frame to
 * frame, so painting it twice a second shows the same world as painting it
 * sixty times, only less often.
 */

const W = 224
const H = 140

// Darkest to lightest: the screen's own phosphor, whatever the site's theme.
const SHADES: [number, number, number][] = [
	[6, 15, 12],
	[13, 52, 37],
	[27, 122, 83],
	[96, 226, 168],
]

/** A cheap repeatable 0..1 for the nth thing in the scene. */
const hash = (n: number) => {
	const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
	return x - Math.floor(x)
}

const grey = (v: number) => {
	const c = Math.round(Math.max(0, Math.min(1, v)) * 255)
	return `rgb(${c},${c},${c})`
}

/** x wrapped into a strip wider than the screen, so things drift through. */
const wrap = (x: number, span: number) => ((x % span) + span) % span

export function createScene(canvas: HTMLCanvasElement) {
	canvas.width = W
	canvas.height = H
	const ctx = canvas.getContext("2d", { willReadFrequently: true })
	if (!ctx) return { draw() {} }

	function ridge(
		t: number,
		speed: number,
		base: number,
		amp: number,
		v: number,
		seed: number
	) {
		const shift = t * speed
		ctx!.fillStyle = grey(v)
		ctx!.beginPath()
		ctx!.moveTo(0, H)
		for (let x = 0; x <= W; x += 2) {
			const u = (x + shift) / W
			const y =
				base -
				amp *
					(0.55 * Math.sin(u * 2.1 + seed) +
						0.3 * Math.sin(u * 5.3 + seed * 2.7) +
						0.15 * Math.sin(u * 11.9 + seed * 5.1))
			ctx!.lineTo(x, y)
		}
		ctx!.lineTo(W, H)
		ctx!.fill()
	}

	function kelp(
		t: number,
		speed: number,
		floor: number,
		v: number,
		count: number,
		seed: number
	) {
		const span = W * 1.6
		ctx!.strokeStyle = grey(v)
		ctx!.lineWidth = 1.5
		for (let i = 0; i < count; i++) {
			const x = wrap(hash(seed + i) * span - t * speed, span) - W * 0.3
			const height = 22 + hash(seed + i * 3) * 34
			const sway = Math.sin(t * 0.9 + i * 1.7) * 5
			ctx!.beginPath()
			ctx!.moveTo(x, floor)
			ctx!.quadraticCurveTo(
				x + sway * 0.4,
				floor - height * 0.5,
				x + sway,
				floor - height
			)
			ctx!.stroke()
		}
	}

	function fish(t: number) {
		const span = W * 1.8
		for (let i = 0; i < 9; i++) {
			const depth = 0.5 + hash(40 + i) * 0.5
			const x =
				W * 1.3 -
				wrap(t * (26 + 30 * depth) + hash(60 + i) * span, span)
			const y = 34 + hash(80 + i) * 44 + Math.sin(t * 1.4 + i * 2.1) * 3
			const size = 2 + depth * 3.5
			ctx!.fillStyle = grey(1)
			ctx!.beginPath()
			ctx!.ellipse(x, y, size, size * 0.42, 0, 0, Math.PI * 2)
			ctx!.fill()
			const flick = Math.sin(t * 9 + i) * size * 0.3
			ctx!.beginPath()
			ctx!.moveTo(x + size * 0.8, y)
			ctx!.lineTo(x + size * 1.7, y - size * 0.5 + flick)
			ctx!.lineTo(x + size * 1.7, y + size * 0.5 + flick)
			ctx!.fill()
		}
	}

	function snow(t: number) {
		const span = W * 1.4
		ctx!.fillStyle = grey(0.85)
		for (let i = 0; i < 46; i++) {
			const depth = 0.3 + hash(200 + i) * 0.7
			const x =
				wrap(hash(300 + i) * span - t * 34 * depth, span) - W * 0.2
			const y = wrap(hash(400 + i) * H + t * 3 * depth, H)
			ctx!.fillRect(Math.round(x), Math.round(y), 1, 1)
		}
	}

	function bubbles(t: number) {
		ctx!.strokeStyle = grey(0.95)
		ctx!.lineWidth = 1
		for (let i = 0; i < 7; i++) {
			const span = W * 1.5
			const life = wrap(
				t * (0.16 + hash(500 + i) * 0.12) + hash(520 + i),
				1
			)
			const x =
				wrap(hash(540 + i) * span - t * 22, span) -
				W * 0.25 +
				Math.sin(t * 2 + i) * 2
			const y = H * 0.95 - life * H * 0.9
			ctx!.beginPath()
			ctx!.arc(x, y, 1 + hash(560 + i) * 1.6, 0, Math.PI * 2)
			ctx!.stroke()
		}
	}

	function draw(t: number) {
		// Water: deep below, and a lit layer above it whose edge rolls.
		ctx!.fillStyle = grey(1 / 3)
		ctx!.fillRect(0, 0, W, H)
		ctx!.fillStyle = grey(2 / 3)
		ctx!.beginPath()
		ctx!.moveTo(0, 0)
		for (let x = 0; x <= W; x += 2) {
			const u = (x + t * 9) / W
			ctx!.lineTo(
				x,
				H * 0.3 +
					5 * Math.sin(u * 6.3 + t * 0.5) +
					3 * Math.sin(u * 15.1 - t * 0.8)
			)
		}
		ctx!.lineTo(W, 0)
		ctx!.fill()

		ridge(t, 5, H * 0.66, 14, 0.12, 1.3)
		kelp(t, 12, H * 0.74, 0.12, 9, 900)
		ridge(t, 16, H * 0.8, 9, 0, 4.1)
		fish(t)
		snow(t)
		kelp(t, 34, H * 0.92, 0, 6, 950)
		bubbles(t)

		// Down to four flat shades: the water falls into bands, and a shaft of
		// light shows as a kink in where one band ends.
		const image = ctx!.getImageData(0, 0, W, H)
		const px = image.data
		for (let i = 0; i < px.length; i += 4) {
			const shade =
				SHADES[
					Math.min(
						SHADES.length - 1,
						Math.round((px[i] / 255) * (SHADES.length - 1))
					)
				]
			px[i] = shade[0]
			px[i + 1] = shade[1]
			px[i + 2] = shade[2]
		}
		ctx!.putImageData(image, 0, 0)
	}

	return { draw }
}
