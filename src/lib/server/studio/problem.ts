import { error } from "@sveltejs/kit"

const CODES: Record<number, string> = {
	400: "BAD_REQUEST",
	401: "UNAUTHORIZED",
	404: "NOT_FOUND",
	409: "CONFLICT",
	502: "UPSTREAM",
}

/** Stops the request with a status and a message meant to be read by a person or an agent. */
export function problem(status: number, message: string): never {
	throw error(status, { code: CODES[status] ?? "ERROR", message })
}
