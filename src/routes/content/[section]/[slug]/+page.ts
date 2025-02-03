export const prerender = true

import { getContentTree } from "$lib/utils/posts"

export const entries = () => {
	const tree = getContentTree()
	// Return an array of route parameter objects for each section and slug
	return Object.entries(tree).flatMap(([section, slugs]) =>
		slugs.map(slug => ({ section, slug }))
	)
}

// You can add your load function or other page logic below
// export async function load({ params }) {
//   // Your load logic
// }
