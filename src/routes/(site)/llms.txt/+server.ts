import * as config from "$lib/config"
import { getPosts } from "$lib/posts"
import { absoluteUrl } from "$lib/seo"

export const prerender = true

/**
 * llms.txt: a flat, markdown index of the site for answer engines.
 *
 * robots.txt controls access; this controls comprehension. It exists so a model
 * summarising the site reads the real post list instead of inferring one from
 * navigation chrome.
 */
export async function GET() {
	const posts = getPosts()

	const body = `# ${config.title}

> ${config.description}. Written by ${config.author}, an engineer. Posts cover LLM-assisted engineering, single-user software, self-hosting and privacy, and systems and queueing theory applied to open source.

## Writing

${posts
	.map(
		post =>
			`- [${post.title}](${absoluteUrl(post.slug)}): ${post.description ?? ""} (published ${post.date})`
	)
	.join("\n")}

## Elsewhere

${config.profiles.map(profile => `- ${profile}`).join("\n")}

## Feeds

- [RSS](${absoluteUrl("/rss.xml")})
- [Sitemap](${absoluteUrl("/sitemap.xml")})
`

	return new Response(body, {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	})
}
