import { describe, expect, it } from "vitest"
import {
	absoluteUrl,
	blogPostingJsonLd,
	breadcrumbJsonLd,
	clampDescription,
	escapeXml,
	serializeJsonLd,
} from "./seo"

const SITE = "https://armanckeser.com"

describe("absoluteUrl", () => {
	it("test_absolute_url_prefixes_origin_when_given_a_site_relative_path", () => {
		// Regression guarded: the post page shipped `<link rel="canonical">` with a
		// site-relative href, which Google explicitly recommends against and which
		// makes og:url unusable for every social scraper.
		expect(absoluteUrl("/writing/jellyfin-flow")).toBe(
			`${SITE}/writing/jellyfin-flow`
		)
	})

	it("test_absolute_url_adds_missing_leading_slash_when_path_is_bare", () => {
		expect(absoluteUrl("writing")).toBe(`${SITE}/writing`)
	})

	it("test_absolute_url_returns_input_unchanged_when_already_absolute", () => {
		// Negative case: double-prefixing would produce
		// https://armanckeser.comhttps://... and silently break canonicals.
		expect(absoluteUrl("https://github.com/armanckeser")).toBe(
			"https://github.com/armanckeser"
		)
		expect(absoluteUrl("http://example.com/x")).toBe("http://example.com/x")
	})
})

describe("escapeXml", () => {
	it("test_escape_xml_replaces_all_five_entities_when_value_contains_markup", () => {
		// Regression guarded: an unescaped `&` in a post title makes the RSS feed
		// invalid XML, and every reader drops the whole feed, not just that item.
		expect(escapeXml(`Tom & Jerry's <b>"quoted"</b>`)).toBe(
			"Tom &amp; Jerry&apos;s &lt;b&gt;&quot;quoted&quot;&lt;/b&gt;"
		)
	})

	it("test_escape_xml_escapes_ampersand_first_so_entities_are_not_double_escaped", () => {
		expect(escapeXml("<")).toBe("&lt;")
	})

	it("test_escape_xml_returns_input_unchanged_when_value_is_plain_text", () => {
		expect(escapeXml("Six Years Later")).toBe("Six Years Later")
	})
})

describe("serializeJsonLd", () => {
	it("test_serialize_json_ld_escapes_angle_brackets_when_value_contains_a_closing_script_tag", () => {
		// Regression guarded: a description containing `</script>` would close the
		// ld+json element early, dumping the rest of the payload into the DOM as
		// markup and invalidating the structured data.
		const serialized = serializeJsonLd({
			description: "use </script> carefully",
		})

		expect(serialized).toBe(
			'{"description":"use \\u003c/script> carefully"}'
		)
		expect(serialized).not.toContain("</script>")
	})

	it("test_serialize_json_ld_omits_undefined_values_when_field_is_absent", () => {
		expect(serializeJsonLd({ a: "x", b: undefined })).toBe('{"a":"x"}')
	})
})

describe("clampDescription", () => {
	it("test_clamp_description_returns_input_unchanged_when_within_limit", () => {
		const short =
			"What a queuing theory book says about open source backlogs"
		expect(clampDescription(short)).toBe(short)
	})

	it("test_clamp_description_truncates_at_a_word_boundary_when_over_limit", () => {
		// Regression guarded: descriptions past ~160 characters are cut by Google
		// mid-word, so the snippet ends on a fragment.
		const clamped = clampDescription("the quick brown fox jumps", 20)

		expect(clamped).toBe("the quick brown…")
		expect(clamped.length).toBeLessThanOrEqual(20)
	})

	it("test_clamp_description_hard_cuts_when_value_has_no_spaces", () => {
		// Negative case: a single 200-character token has no word boundary to fall
		// back to, so the length cap still has to hold.
		const clamped = clampDescription("x".repeat(200), 20)

		expect(clamped).toBe(`${"x".repeat(19)}…`)
	})
})

describe("blogPostingJsonLd", () => {
	const post = {
		title: "Making x.com links open xcancel automatically",
		description:
			"The network-level version needs your own certificate authority",
		date: "2026-07-25",
		tags: ["selfhosted", "privacy"],
		slug: "/writing/redirecting-x-com",
	}

	it("test_blog_posting_json_ld_uses_absolute_urls_for_every_identifier", () => {
		// Regression guarded: relative urls inside structured data are dropped by
		// the rich results parser, so the post never gets an Article entity.
		const node = blogPostingJsonLd(post)

		expect(node.url).toBe(`${SITE}/writing/redirecting-x-com`)
		expect(node.mainEntityOfPage).toEqual({
			"@type": "WebPage",
			"@id": `${SITE}/writing/redirecting-x-com`,
		})
		expect(node.image).toBe(`${SITE}/og.png`)
		expect(node.isPartOf).toEqual({
			"@type": "Blog",
			"@id": `${SITE}/writing`,
		})
	})

	it("test_blog_posting_json_ld_carries_headline_dates_and_keywords_from_frontmatter", () => {
		const node = blogPostingJsonLd(post)

		expect(node["@type"]).toBe("BlogPosting")
		expect(node.headline).toBe(
			"Making x.com links open xcancel automatically"
		)
		expect(node.datePublished).toBe("2026-07-25")
		expect(node.dateModified).toBe("2026-07-25")
		expect(node.keywords).toBe("selfhosted, privacy")
	})

	it("test_blog_posting_json_ld_names_the_author_with_sameas_profiles", () => {
		const node = blogPostingJsonLd(post)

		expect(node.author).toEqual({
			"@type": "Person",
			name: "Armanc Keser",
			url: SITE,
			sameAs: [
				"https://github.com/armanckeser",
				"https://www.linkedin.com/in/armanckeser/",
				"https://bsky.app/profile/armanckeser.com",
			],
		})
	})

	it("test_blog_posting_json_ld_falls_back_to_site_description_when_post_has_none", () => {
		// Negative case: an untitled description must not serialize as null, which
		// Search Console reports as an invalid Article field.
		const node = blogPostingJsonLd({ ...post, description: undefined })

		expect(node.description).toBe(
			"Personal blog and portfolio of Armanc Keser"
		)
	})

	it("test_blog_posting_json_ld_omits_keywords_when_post_has_no_tags", () => {
		const serialized = serializeJsonLd(
			blogPostingJsonLd({ ...post, tags: undefined })
		)

		expect(serialized).not.toContain("keywords")
	})
})

describe("breadcrumbJsonLd", () => {
	it("test_breadcrumb_json_ld_numbers_positions_from_one_with_absolute_items", () => {
		// Regression guarded: BreadcrumbList positions are 1-based; a 0-based list
		// is rejected outright and the SERP loses the breadcrumb trail.
		const node = breadcrumbJsonLd([
			{ name: "Home", path: "/" },
			{ name: "Writing", path: "/writing" },
			{ name: "Six Years Later", path: "/writing/sixth-year" },
		])

		expect(node.itemListElement).toEqual([
			{
				"@type": "ListItem",
				position: 1,
				name: "Home",
				item: `${SITE}/`,
			},
			{
				"@type": "ListItem",
				position: 2,
				name: "Writing",
				item: `${SITE}/writing`,
			},
			{
				"@type": "ListItem",
				position: 3,
				name: "Six Years Later",
				item: `${SITE}/writing/sixth-year`,
			},
		])
	})

	it("test_breadcrumb_json_ld_returns_an_empty_trail_when_given_no_entries", () => {
		expect(breadcrumbJsonLd([]).itemListElement).toEqual([])
	})
})
