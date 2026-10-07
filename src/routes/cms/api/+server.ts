import type { RequestHandler } from "./$types"

export const prerender = false

/** The API, described for whoever calls it. An agent can start here with nothing else. */
const HELP = `armanckeser.com studio API. The page and the agent use the same routes.
Send "x-studio-actor: claude" (the default) or "armanc". JSON in, JSON out.

GET    /cms/api/posts                       every post: slug, title, status, open threads, words
POST   /cms/api/posts                       {title, slug?, body?, description?} new draft
GET    /cms/api/posts/:slug                 meta, body, threads (?format=svx for the raw file)
PATCH  /cms/api/posts/:slug                 {title?, description?, tags?, date?, image?}
DELETE /cms/api/posts/:slug                 delete a draft (published posts: unpublish first)
PUT    /cms/api/posts/:slug                 {body} replace the body; unchanged text keeps its comments
POST   /cms/api/posts/:slug/edits           {edits: [{find, replace, all?}]} exact find-and-replace
GET    /cms/api/posts/:slug/threads         open threads (?all=1 includes resolved)
POST   /cms/api/posts/:slug/threads         {body, quote?} comment, anchored to the quoted text
PATCH  /cms/api/posts/:slug/threads/:id     {reply?, resolved?}
DELETE /cms/api/posts/:slug/threads/:id
POST   /cms/api/posts/:slug/presence        {status, ttl?} say what you are doing; shows in the header
POST   /cms/api/posts/:slug/publish         {message?} commit and push to main, which deploys
DELETE /cms/api/posts/:slug/publish         back to draft
GET    /cms/api/notes                       the notes: strategy and plans, post ideas (drafts/), research/
POST   /cms/api/notes                       {title, folder?: ""|"drafts"|"research", body?} new note
GET    /cms/api/notes/sync                  where the notes repo stands; POST to commit, pull and push now
POST   /cms/api/posts/:id/promote           a post idea (notes~drafts~…) becomes a draft post
       A note's :id is its path in armanckeser.com-notes with ~ for /, after notes~
       (notes~GROWTH_STRATEGY.md, notes~drafts~hearth.svx). Every /posts/:id route
       above works on notes too, except publishing. Notes commit on their own.
GET    /cms/api/inbox                       threads where the writer spoke last, across all posts
GET    /cms/api/events?as=claude            server-sent events: thread, edit, created, published;
                                            while it is open the writer sees Claude as listening
POST   /cms/api/pull                        git pull, for components pushed from another clone

The rendered post, live as it is edited: /writing/:slug
`

export const GET: RequestHandler = () =>
	new Response(HELP, {
		headers: { "content-type": "text/plain; charset=utf-8" },
	})
