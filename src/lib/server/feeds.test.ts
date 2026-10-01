import { describe, expect, it } from "vitest"
import { posterAt, stars } from "../shelf"
import { fieldOf, itemsOf, parseBooks, parseFilms } from "./feeds"

const letterboxd = `<rss><channel><title>Letterboxd - Someone</title>
<item> <title>The Odyssey, 2026 - ★★★★★</title> <link>https://letterboxd.com/someone/film/the-odyssey/</link> <letterboxd:watchedDate>2026-09-04</letterboxd:watchedDate> <letterboxd:rewatch>No</letterboxd:rewatch> <letterboxd:filmTitle>The Odyssey</letterboxd:filmTitle> <letterboxd:filmYear>2026</letterboxd:filmYear> <letterboxd:memberRating>5.0</letterboxd:memberRating> <description><![CDATA[ <p><img src="https://a.ltrbxd.com/resized/film-poster/1/2/3-the-odyssey-0-600-0-900-crop.jpg?v=abc"/></p> <p>Watched on Friday.</p> ]]></description> </item>
<item> <title>Tom &amp; Jerry, 1992</title> <link>https://letterboxd.com/someone/film/tom-and-jerry/</link> <letterboxd:watchedDate>2026-09-27</letterboxd:watchedDate> <letterboxd:rewatch>Yes</letterboxd:rewatch> <letterboxd:filmTitle>Tom &amp; Jerry</letterboxd:filmTitle> <letterboxd:filmYear>1992</letterboxd:filmYear> <description><![CDATA[ <p>Watched on Sunday.</p> ]]></description> </item>
<item> <title>Favourite heists</title> <link>https://letterboxd.com/someone/list/favourite-heists/</link> <description><![CDATA[ <p>A list.</p> ]]></description> </item>
</channel></rss>`

const goodreads = `<rss><channel>
<item>
  <title><![CDATA[Deploy Empathy: A Practical Guide]]></title>
  <book_id>58612786</book_id>
  <book_large_image_url><![CDATA[https://i.gr-assets.com/books/1l/58612786._SX318_.jpg]]></book_large_image_url>
  <author_name>Michele   Hansen</author_name>
  <user_rating>4</user_rating>
  <user_read_at><![CDATA[Wed, 9 Sep 2026 00:00:00 -0700]]></user_read_at>
</item>
<item>
  <title><![CDATA[Traction]]></title>
  <book_id>22091581</book_id>
  <book_large_image_url><![CDATA[https://s.gr-assets.com/assets/nophoto/book/111x148.png]]></book_large_image_url>
  <author_name>Gabriel Weinberg</author_name>
  <user_rating>0</user_rating>
  <user_read_at><![CDATA[]]></user_read_at>
</item>
</channel></rss>`

describe("reading a feed", () => {
	it("test_items_of_returns_one_body_per_item", () => {
		expect(itemsOf(letterboxd)).toHaveLength(3)
	})

	it("test_field_of_unwraps_cdata_and_decodes_entities", () => {
		const [, entities] = itemsOf(letterboxd)
		const [cdata] = itemsOf(goodreads)
		expect(fieldOf(entities, "letterboxd:filmTitle")).toBe("Tom & Jerry")
		expect(fieldOf(cdata, "title")).toBe(
			"Deploy Empathy: A Practical Guide"
		)
	})

	it("test_field_of_is_empty_when_the_element_is_absent", () => {
		expect(fieldOf(itemsOf(letterboxd)[2], "letterboxd:filmTitle")).toBe("")
	})
})

describe("films", () => {
	const films = parseFilms(letterboxd)

	it("test_parse_films_skips_items_that_are_not_diary_entries", () => {
		expect(films.map(f => f.title)).not.toContain("Favourite heists")
		expect(films).toHaveLength(2)
	})

	it("test_parse_films_orders_by_watch_date_not_feed_order", () => {
		expect(films.map(f => f.watched)).toEqual(["2026-09-27", "2026-09-04"])
	})

	it("test_parse_films_reads_rating_rewatch_and_poster", () => {
		const [rewatched, rated] = films
		expect(rated).toMatchObject({
			title: "The Odyssey",
			year: 2026,
			rating: 5,
			rewatch: false,
			href: "https://letterboxd.com/someone/film/the-odyssey/",
		})
		expect(rated.poster).toContain("-0-600-0-900-crop.jpg")
		expect(rewatched).toMatchObject({
			rating: null,
			rewatch: true,
			poster: null,
		})
	})
})

describe("books", () => {
	it("test_parse_books_reads_rating_day_and_cover", () => {
		const [book] = parseBooks(goodreads, false)
		expect(book).toEqual({
			title: "Deploy Empathy: A Practical Guide",
			author: "Michele Hansen",
			rating: 4,
			reading: false,
			read: "2026-09-09",
			href: "https://www.goodreads.com/book/show/58612786",
			cover: "https://i.gr-assets.com/books/1l/58612786._SX318_.jpg",
		})
	})

	it("test_parse_books_treats_zero_rating_and_placeholder_cover_as_absent", () => {
		const [, book] = parseBooks(goodreads, false)
		expect(book).toMatchObject({ rating: null, read: null, cover: null })
	})

	it("test_parse_books_on_the_reading_shelf_have_no_finish_day", () => {
		const [book] = parseBooks(goodreads, true)
		expect(book).toMatchObject({ reading: true, read: null })
	})
})

describe("presentation helpers", () => {
	it("test_poster_at_rewrites_both_dimensions", () => {
		expect(posterAt("https://x/1-film-0-600-0-900-crop.jpg?v=1", 230)).toBe(
			"https://x/1-film-0-230-0-345-crop.jpg?v=1"
		)
	})

	it("test_stars_marks_a_half", () => {
		expect(stars(3.5)).toBe("★★★½")
		expect(stars(5)).toBe("★★★★★")
	})
})
