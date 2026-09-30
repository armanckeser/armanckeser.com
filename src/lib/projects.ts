/**
 * A project is any of my repositories tagged `portfolio`. Each can carry two
 * images at fixed paths, which is what lets the site pick them up with no
 * per-project configuration:
 *
 * - `img/cover.png`: the still shown on the project's tile.
 * - `img/hero.gif`: the README demo, played on hover like a store trailer.
 *
 * A project without a cover is listed as a line of `ls -l` instead of a tile.
 */
export type Project = {
	/** The repository name, which is also what `open <name>` takes in the shell. */
	name: string
	title: string
	description: string
	/** Repository topics, minus `portfolio`. */
	topics: string[]
	stars: number
	/** The repository page, or null for a private repository a visitor cannot open. */
	url: string | null
	homepage: string | null
	updated: string
	cover: { src: string; width: number; height: number } | null
	preview: string | null
}

/** Where a click on the project should go: the running app if there is one. */
export const projectHref = (p: Pick<Project, "homepage" | "url">) =>
	p.homepage ?? p.url
