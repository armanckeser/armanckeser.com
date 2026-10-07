# armanckeser.com

Personal site and blog. SvelteKit, posts written as [mdsvex](https://mdsvex.pngwn.io/)
`.svx` files, deployed to GitHub Pages. Package manager is [bun](https://bun.sh).

```bash
bun install
bun run dev
```

## The studio

`/cms` is where posts get written: a shared editor that Claude and I both work in,
next to the post rendered by the site itself, with comments on any passage.

- **Write**: the post's source on the left (a CodeMirror editor over a Yjs document,
  so both of us type into the same text at once, with each other's cursors), and
  the real page on the right, interactive components and all. Edits reach the
  page through the dev server's hot reload.
- **Read**: just the rendered page. Select any passage on it to comment.
- **Comments** stay attached to their passage as the text around them changes.
  A thread where I spoke last is in Claude's inbox.
- **Publish** commits the post to `main` and pushes, which deploys the site.

It is agent-first: the page and Claude use the same HTTP API and nothing else, so
anything I can do in the page Claude can do with curl, and the other way round.
`GET /cms/api` describes every route; [AGENTS.md](AGENTS.md) is the guide.

### How it runs

The studio is this repo's own `vite dev`, run by the image in `Dockerfile` against a
clone of the repo in a volume on my home server (behind Cosmos, on the tailnet only).
The image carries only the dependencies; the code comes from the clone, which
`docker-entrypoint.sh` pulls on start. So:

- a new component pushed to `main` is in the studio after `POST /cms/api/pull`;
- a post is a draft while its file is untracked in the clone (`published: false`),
  and never reaches GitHub, which is public, until it's published;
- the shared documents (text, comments, history) live in `.studio/` in the clone.

`STUDIO=1` turns on the dev-server settings it needs (`vite.config.ts`). Cosmos
closes every connection after 30 seconds, so the studio's own sync reconnects and
resyncs, and hot reload is off (a dropped Vite websocket reloads the page): the
preview reloads itself out of sight after each save. If the route's timeout is
ever lifted, `STUDIO_HMR=1` turns hot reload back on. `CMS_TOKEN`, when set, is required
as a cookie (`?token=` once) or a bearer token.

To run it locally: `bun run dev` and open `localhost:5173/cms`. It edits the posts
in this working tree.

## Writing a post

Posts live in `src/content/writing/*.svx`. The filename becomes the slug. Frontmatter:

```yaml
---
title: "Post title"
description: "One line, used for the card and meta tags"
tags: [tag-one, tag-two]
date: "2026-07-25"
published: true
---
```

`published: false` keeps a post out of every production surface (listings, RSS,
sitemap, prerendered routes) while `vite dev` still shows it, which is how the studio
previews drafts. The studio writes this field for you.

Add `## Contents` as the first heading to get a table of contents, which `remark-toc`
fills in from the headings below it. Headings get slug ids and hover anchors
automatically.

Svelte components can be imported into a post for custom interactives, see
`sixth-year.svx` using `CommitmentGrid`.

## Rooms

The site is a terminal, and that stays its chrome everywhere (header, section labels,
small print). What it shows comes in four kinds, each with one material and one accent,
defined as token overrides under "Rooms" in `src/app.css`:

| Room | Shows | Material |
|---|---|---|
| `code` | projects, the home hero | cool grey, green |
| `writing` | posts, `/writing`, the policy pages | paper and ink, rust |
| `film` | what I watched | a dark cinema, a strip of film, amber |
| `books` | what I read | a reading room, books on a shelf, navy |

A page lives in one room, picked from its path in `src/lib/room.svelte.ts`. The home
page walks through all four as bands (`.room.band`), and the header takes the colours of
whichever is on screen. Anything new should go in the room it belongs to and read the
ordinary tokens (`bg-background`, `text-accent`), not bring its own palette.

## Films and books

`/api/films` and `/api/books` are built from the public RSS feeds of my Letterboxd diary
and Goodreads shelves (`src/lib/server/feeds.ts`), which need no key. The member name and
user id are in `src/lib/config.ts`. They are read when the site is built, so the daily
rebuild is what picks up a new film or book.

If a feed cannot be reached from the build machine, the endpoint serves the last list
committed in `src/lib/data/*.json` instead, so the section goes stale rather than
missing. To refresh those snapshots, run the dev server and save the endpoints' output:

```bash
curl localhost:5173/api/films > src/lib/data/films.json
curl localhost:5173/api/books > src/lib/data/books.json
```

## Deploying

Pushing to `main` triggers `.github/workflows/deploy-pages.yml`, which runs
`bun install --frozen-lockfile` and `bun run build`, then publishes `build/` to GitHub
Pages. There is nothing to do by hand.

Because the install is frozen, **a dependency bump that does not update `bun.lock`
breaks the deploy.** Dependabot only updates `package.json` and npm lockfiles, so after
merging one of its PRs, run `bun install` and commit the lockfile.

## The studio image

`.github/workflows/build-cms-image.yml` builds `ghcr.io/armanckeser/armanckeser-cms`
natively on arm64 whenever the dependencies, the Dockerfile or the entrypoint change
on `main` (or by hand). Cosmos updates the container from `:latest`. Publishing a
post needs no image: the studio pushes the post and the site deploys.

## Checks

```bash
bun run lint      # biome
bun run check     # svelte-check
```

`bun run test` runs vitest, which currently has no test files and therefore exits
non-zero. CI does not run it. Formatting is enforced on commit via husky and
lint-staged.

## Notes

Private planning material (content strategy, unfinished drafts, research notes) lives in
a separate private repo and is deliberately absent from this one, including its history.
