import { inbox } from "$lib/server/studio/service"
import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"

export const prerender = false

export const GET: RequestHandler = async () => json(await inbox())
