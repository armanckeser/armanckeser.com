import { building } from "$app/environment"

// In CMS mode (adapter-node), don't prerender — serve dynamically
// In static mode (adapter-static), prerender everything
const isCmsMode = building && !!process.env.BUILD_MODE

export const prerender = !isCmsMode
