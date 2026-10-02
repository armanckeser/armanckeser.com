import { describe, expect, it } from "vitest"
import {
	parseHackerNews,
	parseLobsters,
	pathOn,
	threadsFor,
} from "./discussions"

const hn = {
	hits: [
		{
			objectID: "41000001",
			title: "LLM Zero",
			url: "https://www.armanckeser.com/writing/llm-zero/?utm_source=hn",
			points: 312,
			num_comments: 140,
			created_at: "2026-08-02T14:00:00Z",
		},
		{
			objectID: "41000002",
			title: "LLM Zero (again)",
			url: "http://armanckeser.com/writing/llm-zero#intro",
			points: 1,
			num_comments: 0,
			created_at: "2026-08-05T09:00:00Z",
		},
		{
			objectID: "41000003",
			title: "Not mine",
			url: "https://notarmanckeser.com/writing/llm-zero",
			points: 50,
			num_comments: 10,
		},
		{ objectID: "41000004", title: "Ask HN: no url", url: null },
	],
}

const lobsters = [
	{
		title: "LLM Zero",
		url: "https://armanckeser.com/writing/llm-zero",
		score: 40,
		comment_count: 12,
		created_at: "2026-08-02T10:00:00.000-05:00",
		comments_url: "https://lobste.rs/s/abc123/llm_zero",
	},
	{
		title: "Sixth year",
		url: "https://armanckeser.com/writing/sixth-year",
		score: 1,
		comment_count: 0,
		short_id_url: "https://lobste.rs/s/def456",
	},
]

describe("pathOn", () => {
	it("ignores www, trailing slashes, queries and anchors", () => {
		expect(pathOn("https://www.armanckeser.com/writing/x/?a=1#b")).toBe(
			"/writing/x"
		)
		expect(pathOn("https://armanckeser.com")).toBe("/")
	})

	it("rejects other hosts and garbage", () => {
		expect(pathOn("https://notarmanckeser.com/writing/x")).toBeNull()
		expect(pathOn("not a url")).toBeNull()
	})
})

describe("finding threads", () => {
	const all = [...parseHackerNews(hn), ...parseLobsters(lobsters)]

	it("keeps only links to this site", () => {
		expect(all.map(t => t.href)).toEqual([
			"https://news.ycombinator.com/item?id=41000001",
			"https://news.ycombinator.com/item?id=41000002",
			"https://lobste.rs/s/abc123/llm_zero",
			"https://lobste.rs/s/def456",
		])
	})

	it("drops dead submissions when a live one exists, busiest first", () => {
		const threads = threadsFor(all, "/writing/llm-zero/")
		expect(threads.map(t => [t.site, t.points, t.comments])).toEqual([
			["Hacker News", 312, 140],
			["Lobsters", 40, 12],
		])
		expect(threads[0]).not.toHaveProperty("path")
	})

	it("keeps a quiet submission if it is the only one", () => {
		expect(threadsFor(all, "/writing/sixth-year")).toEqual([
			expect.objectContaining({ site: "Lobsters", points: 1 }),
		])
	})

	it("finds nothing for a post never shared", () => {
		expect(threadsFor(all, "/writing/jellyfin-flow")).toEqual([])
	})

	it("tolerates empty or malformed bodies", () => {
		expect(parseHackerNews({})).toEqual([])
		expect(parseLobsters({} as never)).toEqual([])
	})
})
