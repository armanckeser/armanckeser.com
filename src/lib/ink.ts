// A short, hand-picked list of hues keeps every post in tune with the rest.
const INKS = [28, 350, 262, 205, 158, 190, 12, 300]

/**
 * Each post gets one ink colour, picked from its path so it never changes
 * between builds: the same hue on its card, its line in a listing, and its page.
 */
export function inkHue(path: string): number {
	const hash = [...path].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)
	return INKS[hash % INKS.length]
}
