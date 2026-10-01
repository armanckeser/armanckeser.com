import { redirect } from "@sveltejs/kit"
import type { PageLoad } from "./$types"

// This post was first published under this address. Links to it still work.
export const load: PageLoad = () => {
	redirect(308, "/writing/restarting-fixes-windows")
}
