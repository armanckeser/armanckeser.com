# armanckeser.com

Personal site and blog. SvelteKit, posts written as [mdsvex](https://mdsvex.pngwn.io/)
`.svx` files, deployed to GitHub Pages. Package manager is [bun](https://bun.sh).

```bash
bun install
bun run dev
```

## Two build modes

The same codebase builds two different things, switched by `BUILD_MODE`
(`svelte.config.js`):

| Command | Adapter | What it is |
|---|---|---|
| `bun run build` | `adapter-static` | The public site, prerendered, what ships to Pages |
| `bun run build:cms` | `adapter-node` | A server build that also serves the `/cms` editor routes |

The CMS is a small authoring UI over the same content directory. It runs as a container
on my home server rather than being exposed publicly, which is why it needs a Node
server while the public site does not.

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

Add `## Contents` as the first heading to get a table of contents, which `remark-toc`
fills in from the headings below it. Headings get slug ids and hover anchors
automatically.

**`published` is not enforced.** `getPosts()` in `src/lib/posts.ts` globs every `.svx`
under `src/content` and does not filter on the flag, so committing a file publishes it
regardless of what the frontmatter says. Drafts stay unpublished by being excluded from
git in `.git/info/exclude`, which is local to a clone and does not survive a fresh one.
If you clone this somewhere new, recreate those excludes before running `git add .`.

Svelte components can be imported into a post for custom interactives, see
`sixth-year.svx` using `CommitmentGrid`.

## Deploying

Pushing to `main` triggers `.github/workflows/deploy-pages.yml`, which runs
`bun install --frozen-lockfile` and `bun run build`, then publishes `build/` to GitHub
Pages. There is nothing to do by hand.

Because the install is frozen, **a dependency bump that does not update `bun.lock`
breaks the deploy.** Dependabot only updates `package.json` and npm lockfiles, so after
merging one of its PRs, run `bun install` and commit the lockfile.

## Releases

Tags and releases here are only for the CMS container image.
`.github/workflows/build-cms-image.yml` runs on a published release and pushes
`ghcr.io/armanckeser/armanckeser-cms`. Publishing a blog post needs no release, since
the CMS reads content from `REPO_PATH` at runtime rather than baking it into the image.

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
