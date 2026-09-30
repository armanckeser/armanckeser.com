import { goto } from "$app/navigation"
import { getPosts } from "$lib/posts"
import { type Project, projectHref } from "$lib/projects"
import { toggleMode } from "mode-watcher"

/** One line printed under the prompt. `href` makes it clickable. */
export type Line = {
	text: string
	tone?: "muted" | "error" | "accent"
	href?: string
}

export type Completion = { value: string; help?: string }

type Command = {
	help: string
	/** Candidates for the argument, given what has been typed so far. */
	complete?: (arg: string) => Completion[]
	run: (arg: string) => Line[] | Promise<Line[]>
}

// Projects come from the prerendered endpoint, fetched the first time the shell needs them.
let projectsPromise: Promise<Project[]> | undefined
export function loadProjects(): Promise<Project[]> {
	projectsPromise ??= fetch("/api/projects")
		.then(r => r.json())
		.then(d => (Array.isArray(d) ? d : []))
		.catch(() => [])
	return projectsPromise
}
let projects: Project[] = []
export const warmUp = () =>
	loadProjects().then(p => {
		projects = p
	})

const slugOf = (postPath: string) => postPath.split("/").pop() ?? postPath
const posts = () =>
	getPosts().map(p => ({
		slug: slugOf(p.slug),
		title: p.title,
		path: p.slug,
	}))

/** Every place `cd` can go, keyed the way you'd type it. */
function places(): Map<string, string> {
	const map = new Map<string, string>([
		["~", "/"],
		["/", "/"],
		["writing", "/writing"],
		["projects", "/#projects"],
		["privacy", "/privacy"],
		["terms", "/terms"],
	])
	for (const p of posts()) map.set(`writing/${p.slug}`, p.path)
	return map
}

const startsWith = (items: Completion[], arg: string) =>
	items.filter(c => c.value.toLowerCase().startsWith(arg.toLowerCase()))

export const commands: Record<string, Command> = {
	help: {
		help: "list commands",
		run: () =>
			Object.entries(commands)
				.filter(([, c]) => c.help)
				.map(([name, c]) => ({
					text: `${name.padEnd(8)}${c.help}`,
				})),
	},
	ls: {
		help: "list writing or projects",
		complete: arg =>
			startsWith([{ value: "writing" }, { value: "projects" }], arg),
		run: arg => {
			const dir = arg.replace(/^~?\/?|\/$/g, "")
			if (!dir)
				return [
					{
						text: "writing/  projects/  privacy  terms",
						tone: "accent",
					},
				]
			if (dir === "writing")
				return posts().map(p => ({ text: p.slug, href: p.path }))
			if (dir === "projects")
				return projects.map(p => ({
					text: `${p.name.padEnd(26)}${p.description}`,
					href: projectHref(p) ?? undefined,
				}))
			return [
				{
					text: `ls: ${arg}: No such file or directory`,
					tone: "error",
				},
			]
		},
	},
	cd: {
		help: "go to a page: cd writing/<post>",
		complete: arg =>
			startsWith(
				[...places().keys()]
					.filter(k => k !== "/")
					.map(value => ({ value })),
				arg
			),
		run: arg => {
			const target = places().get(arg.replace(/\/$/, "") || "~")
			if (!target)
				return [
					{
						text: `cd: no such file or directory: ${arg}`,
						tone: "error",
					},
				]
			goto(target)
			return []
		},
	},
	open: {
		help: "open a project: open <name>",
		complete: arg =>
			startsWith(
				projects.map(p => ({ value: p.name, help: p.title })),
				arg
			),
		run: arg => {
			const project = projects.find(p => p.name === arg)
			const href = project && projectHref(project)
			if (!href)
				return [
					{
						text: `open: no such project: ${arg || "(none)"}`,
						tone: "error",
					},
				]
			window.open(href, "_blank", "noopener")
			return [{ text: `opened ${href}`, tone: "muted", href }]
		},
	},
	theme: {
		help: "switch light and dark",
		run: () => {
			toggleMode()
			return []
		},
	},
	rss: {
		help: "the feed",
		run: () => {
			goto("/rss.xml")
			return []
		},
	},
	whoami: {
		help: "",
		run: () => [
			{ text: "armanc: an engineer, still learning", tone: "accent" },
		],
	},
}

/** Splits input into the command and its (single) argument. */
export function parse(input: string): {
	name: string
	arg: string
	hasArg: boolean
} {
	const trimmed = input.replace(/^\s+/, "")
	const space = trimmed.indexOf(" ")
	if (space === -1) return { name: trimmed, arg: "", hasArg: false }
	return {
		name: trimmed.slice(0, space),
		arg: trimmed.slice(space + 1).trim(),
		hasArg: true,
	}
}

/** What Tab could turn the input into. */
export function completionsFor(input: string): Completion[] {
	const { name, arg, hasArg } = parse(input)
	if (!hasArg)
		return Object.entries(commands)
			.filter(([n, c]) => c.help && n.startsWith(name))
			.map(([n, c]) => ({ value: n, help: c.help }))
	return commands[name]?.complete?.(arg) ?? []
}

export async function run(input: string): Promise<Line[]> {
	const { name, arg } = parse(input)
	if (!name) return []
	const command = commands[name]
	if (!command)
		return [
			{
				text: `zsh: command not found: ${name}  (try help)`,
				tone: "error",
			},
		]
	return command.run(arg)
}
