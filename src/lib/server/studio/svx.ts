import matter from "gray-matter"

/** The frontmatter fields the studio edits. Anything else in a file is kept as is. */
export type Meta = {
	title: string
	description?: string
	tags?: string[]
	date: string
	published: boolean
	image?: string
	[key: string]: unknown
}

const FRONTMATTER = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/

/**
 * Splits a post file into its frontmatter (parsed, and as written) and
 * everything after it, byte for byte, so writing it back changes nothing.
 */
export function parseSvx(raw: string): {
	meta: Meta
	body: string
	yaml: string
	eol: string
	front: boolean
} {
	const match = FRONTMATTER.exec(raw)
	const eol = raw.includes("\r\n") ? "\r\n" : "\n"
	const yaml = match ? match[1].replace(/\r\n/g, "\n") : ""
	const body = match ? raw.slice(match[0].length) : raw
	return { meta: readYaml(yaml), body, yaml, eol, front: !!match }
}

export function readYaml(yaml: string): Meta {
	const data = yaml.trim() ? matter(`---\n${yaml}\n---\n`, {}).data : {}
	const out: Meta = {
		...data,
		title: String(data.title ?? ""),
		date: "",
		published: data.published !== false,
	}
	if (data.date instanceof Date)
		out.date = data.date.toISOString().slice(0, 10)
	else if (data.date) out.date = String(data.date)
	return out
}

function yamlValue(value: unknown): string {
	if (Array.isArray(value))
		return `[${value.map(v => yamlValue(v)).join(", ")}]`
	if (typeof value === "boolean" || typeof value === "number")
		return String(value)
	return JSON.stringify(String(value))
}

const empty = (v: unknown) =>
	v === undefined ||
	v === null ||
	v === "" ||
	(Array.isArray(v) && v.length === 0)

/**
 * Writes `meta` into the frontmatter as it was written, touching only the keys
 * that changed. Untouched lines (their quoting, order, comments) stay as they were.
 */
export function patchYaml(yaml: string, meta: Meta): string {
	const before = readYaml(yaml)
	const lines = yaml ? yaml.split("\n") : []
	const keyLine = (key: string) =>
		lines.findIndex(l => l.startsWith(`${key}:`))
	// A value may continue on indented lines below its key.
	const span = (at: number) => {
		let end = at + 1
		while (end < lines.length && /^\s+\S/.test(lines[end])) end++
		return end - at
	}
	const keys = new Set([...Object.keys(before), ...Object.keys(meta)])
	for (const key of keys) {
		const a = (before as Record<string, unknown>)[key]
		const b = (meta as Record<string, unknown>)[key]
		if (JSON.stringify(a ?? null) === JSON.stringify(b ?? null)) continue
		if (key === "published" && a === true && b === true) continue
		const at = keyLine(key)
		if (empty(b)) {
			if (at !== -1) lines.splice(at, span(at))
		} else if (at !== -1) {
			lines.splice(at, span(at), `${key}: ${yamlValue(b)}`)
		} else {
			lines.push(`${key}: ${yamlValue(b)}`)
		}
	}
	return lines.join("\n")
}

export function serializeSvx(
	yaml: string,
	meta: Meta,
	body: string,
	eol = "\n"
): string {
	const front = patchYaml(yaml, meta).split("\n").join(eol)
	return `---${eol}${front}${eol}---${eol}${body}`
}

/** A new post's file. */
export function newSvx(meta: Meta, body: string): string {
	return serializeSvx("", meta, body.startsWith("\n") ? body : `\n${body}`)
}

export function today(): string {
	return new Date().toISOString().slice(0, 10)
}

export function slugify(title: string): string {
	return title
		.toLowerCase()
		.normalize("NFKD")
		.replace(/\p{M}/gu, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 80)
}
