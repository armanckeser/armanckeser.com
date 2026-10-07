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

const ORDER = ["title", "description", "tags", "date", "published", "image"]

/** Splits a post file into its frontmatter and everything after it. */
export function parseSvx(raw: string): { meta: Meta; body: string } {
	const { data, content } = matter(raw)
	return {
		meta: {
			...data,
			title: String(data.title ?? ""),
			date: data.date ? String(data.date) : today(),
			published: data.published !== false,
		},
		body: content.replace(/^\n/, ""),
	}
}

function yamlValue(value: unknown): string {
	if (Array.isArray(value))
		return `[${value.map(v => yamlValue(v)).join(", ")}]`
	if (typeof value === "boolean" || typeof value === "number")
		return String(value)
	return JSON.stringify(String(value))
}

/** Writes frontmatter in the order the existing posts use, then the body. */
export function serializeSvx(meta: Meta, body: string): string {
	const keys = [
		...ORDER.filter(k => k in meta),
		...Object.keys(meta).filter(k => !ORDER.includes(k)),
	]
	const lines = keys
		.filter(
			k =>
				meta[k] !== undefined &&
				meta[k] !== "" &&
				!(Array.isArray(meta[k]) && (meta[k] as unknown[]).length === 0)
		)
		.map(k => `${k}: ${yamlValue(meta[k])}`)
	return `---\n${lines.join("\n")}\n---\n\n${body.replace(/^\n+/, "")}`
}

export function today(): string {
	return new Date().toISOString().slice(0, 10)
}

export function slugify(title: string): string {
	return title
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[̀-ͯ]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 80)
}
