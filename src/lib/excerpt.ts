/**
 * The opening of a post as plain prose, for the page shown on its card: the
 * first paragraphs of body text, skipping the TLDR, headings, components and
 * code, with inline markdown reduced to its words.
 */
export function excerptOf(markdown: string, maxChars = 1100): string[] {
	const body = markdown
		.replace(/<script[\s\S]*?<\/script>/g, "")
		.replace(/```[\s\S]*?```/g, "")
	const paragraphs: string[] = []
	let length = 0
	for (const block of body.split(/\n\s*\n/)) {
		const text = block.trim()
		// Prose only: not a quote (the TLDR), heading, list, table, image or component.
		if (!text || /^(>|#|[-*+] |\d+\. |\||!\[|<)/.test(text)) continue
		const plain = text
			.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
			.replace(/`([^`]+)`/g, "$1")
			.replace(/(\*\*|__|\*|_)(\S[^*_]*?)\1/g, "$2")
			.replace(/\s+/g, " ")
		paragraphs.push(plain)
		length += plain.length
		if (length >= maxChars) break
	}
	return paragraphs
}

/** Minutes to read, at a steady 230 words a minute. */
export function readingMinutes(markdown: string): number {
	const words = markdown
		.replace(/<script[\s\S]*?<\/script>/g, "")
		.split(/\s+/)
		.filter(Boolean).length
	return Math.max(1, Math.round(words / 230))
}
