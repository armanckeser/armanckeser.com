/**
 * Server-sent events. Plain HTTP that survives the reverse proxy in front of
 * the studio, reconnects by itself, and is as easy to read with `curl -N` as
 * from the page.
 */
export function eventStream(
	request: Request,
	start: (send: (event: string, data: unknown) => void) => () => void
): Response {
	const encoder = new TextEncoder()
	let cleanup = () => {}
	let ping: ReturnType<typeof setInterval> | undefined
	let closed = false

	const stream = new ReadableStream<Uint8Array>({
		start(controller) {
			const write = (chunk: string) => {
				if (closed) return
				try {
					controller.enqueue(encoder.encode(chunk))
				} catch {
					close()
				}
			}
			const close = () => {
				if (closed) return
				closed = true
				clearInterval(ping)
				cleanup()
				try {
					controller.close()
				} catch {}
			}
			write("retry: 1500\n\n")
			cleanup = start((event, data) =>
				write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
			)
			ping = setInterval(() => write(": ping\n\n"), 15_000)
			request.signal.addEventListener("abort", close)
		},
		cancel() {
			closed = true
			clearInterval(ping)
			cleanup()
		},
	})

	return new Response(stream, {
		headers: {
			"content-type": "text/event-stream; charset=utf-8",
			"cache-control": "no-cache, no-transform",
			connection: "keep-alive",
			"x-accel-buffering": "no",
		},
	})
}
