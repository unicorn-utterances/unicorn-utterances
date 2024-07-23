/* eslint-disable no-var */
import {
	fireEvent,
	findByText as findByTextFrom,
	queryByText as queryByTextFrom,
	render,
	waitFor,
	cleanup,
	queryByText,
	getByTestId,
} from "@testing-library/preact";
import SearchPage from "./search-page";
import type { ServerReturnType } from "./types";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MockCanonicalPost, MockPost } from "../../../__mocks__/data/mock-post";
import userEvent from "@testing-library/user-event";
import { MockCollection } from "../../../__mocks__/data/mock-collection";
import {
	MockPerson,
	MockPersonTwo,
} from "../../../__mocks__/data/mock-person";
import { buildSearchQuery } from "src/views/search/search";

const user = userEvent.setup();

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

afterEach(() => server.resetHandlers());

beforeEach(() => {
	cleanup();
	// Reset URL after each test
	window.history.replaceState({}, "", window.location.pathname);
});

afterAll(() => server.close());

function mockFetch(fn: (searchStr: string) => ServerReturnType) {
	server.use(
		http.get(`/api/search`, async ({ request }) => {
			const searchString = new URL(request.url).searchParams.get("query")!;
			return HttpResponse.json(fn(searchString));
		}),
	);
}

function mockFetchWithStatus(
	status: number,
	fn: (searchStr: string) => unknown,
) {
	server.use(
		http.get(`/api/search`, async ({ request }) => {
			const searchString = new URL(request.url).searchParams.get("query")!;
			return HttpResponse.json({ body: fn(searchString) }, { status });
		}),
	);
}

describe("Search page", () => {
	test("Should show initial results", () => {
		const { getByText } = render(<SearchPage />);

		expect(getByText("What would you like to find?")).toBeInTheDocument();
	});

	test("Should show search results for posts", async () => {
		mockFetch(() => ({
			people: {},
			posts: [MockPost],
			totalPosts: 1,
			totalCollections: 0,
			collections: [],
		}));

		const { getByText, getByTestId } = render(<SearchPage />);
		const searchInput = getByTestId("search-input");
		await user.type(searchInput, MockPost.title);
		await user.type(searchInput, "{enter}");
		await waitFor(() => expect(getByText(MockPost.title)).toBeInTheDocument());
	});

	test("Should show search results for collections", async () => {
		mockFetch(() => ({
			people: {},
			posts: [],
			totalPosts: 0,
			totalCollections: 1,
			collections: [MockCollection],
		}));

		const { getByText, getByTestId } = render(<SearchPage />);
		const searchInput = getByTestId("search-input");
		await user.type(searchInput, MockCollection.title);
		await user.type(searchInput, "{enter}");
		await waitFor(() =>
			expect(getByText(MockCollection.title)).toBeInTheDocument(),
		);
	});

	test("Should show error screen when 500", async () => {
		mockFetchWithStatus(500, () => ({
			error: "There was an error fetching your search results.",
		}));
		const { getByText, getByTestId } = render(<SearchPage />);
		const searchInput = getByTestId("search-input");
		await user.type(searchInput, MockPost.title);
		await user.type(searchInput, "{enter}");
		await waitFor(() =>
			expect(
				getByText("There was an error fetching your search results."),
			).toBeInTheDocument(),
		);
	});

	test("Should show 'nothing found'", async () => {
		mockFetch(() => ({
			people: {},
			posts: [],
			totalPosts: 0,
			totalCollections: 0,
			collections: [],
		}));

		const { getByText, getByTestId } = render(<SearchPage />);
		const searchInput = getByTestId("search-input");
		await user.type(searchInput, "Asdfasdfasdf");
		await user.type(searchInput, "{enter}");
		await waitFor(() =>
			expect(getByText("No results found...")).toBeInTheDocument(),
		);
	});

	test("Remove collections header when none found", async () => {
		mockFetch(() => ({
			people: {},
			posts: [MockPost],
			totalPosts: 1,
			totalCollections: 0,
			collections: [],
		}));

		const { getByTestId, queryByTestId } = render(<SearchPage />);
		const searchInput = getByTestId("search-input");
		await user.type(searchInput, MockPost.title);
		await user.type(searchInput, "{enter}");
		await waitFor(() =>
			expect(getByTestId("articles-header")).toBeInTheDocument(),
		);
		expect(queryByTestId("collections-header")).not.toBeInTheDocument();
	});

	test("Remove posts header when none found", async () => {
		mockFetch(() => ({
			people: {},
			posts: [],
			totalPosts: 0,
			totalCollections: 1,
			collections: [MockCollection],
		}));

		const { getByTestId, queryByTestId } = render(<SearchPage />);
		const searchInput = getByTestId("search-input");
		await user.type(searchInput, MockCollection.title);
		await user.type(searchInput, "{enter}");
		await waitFor(() =>
			expect(getByTestId("collections-header")).toBeInTheDocument(),
		);
		expect(queryByTestId("articles-header")).not.toBeInTheDocument();
	});

	test("Filter by tag works on desktop sidebar", async () => {
		mockFetch(() => ({
			people: {},
			posts: [
				{ ...MockPost, tags: ["Angular"], title: "One blog post" },
				{ ...MockCanonicalPost, tags: [], title: "Two blog post" },
			],
			totalPosts: 2,
			totalCollections: 0,
			collections: [],
		}));

		const { getByTestId, queryByTestId, getByText } = render(<SearchPage />);

		const searchInput = getByTestId("search-input");
		await user.type(searchInput, "*");
		await user.type(searchInput, "{enter}");

		await waitFor(() => expect(getByText("One blog post")).toBeInTheDocument());
		await waitFor(() => expect(getByText("Two blog post")).toBeInTheDocument());

		const container = getByTestId("tag-filter-section-sidebar");

		const tag = await findByTextFrom(container, "Angular");

		await user.click(tag);
		await waitFor(() => expect(getByText("One blog post")).toBeInTheDocument());
		expect(queryByTestId("Two blog post")).not.toBeInTheDocument();
	});

	test("Filter by author works on desktop sidebar", async () => {
		mockFetch(() => ({
			people: {
				[MockPerson.id]: MockPerson,
				[MockPersonTwo.id]: MockPersonTwo,
			},
			posts: [
				{
					...MockPost,
					authors: [MockPerson.id],
					authorsMeta: [MockPerson],
					title: "One blog post",
				},
				{
					...MockCanonicalPost,
					authors: [MockPersonTwo.id],
					authorsMeta: [MockPersonTwo],
					title: "Two blog post",
				},
			],
			totalPosts: 2,
			totalCollections: 0,
			collections: [],
		}));

		const { getByTestId, getByText, queryByTestId } = render(<SearchPage />);

		const searchInput = getByTestId("search-input");
		await user.type(searchInput, "*");
		await user.type(searchInput, "{enter}");

		await waitFor(() => expect(getByText("One blog post")).toBeInTheDocument());
		await waitFor(() => expect(getByText("Two blog post")).toBeInTheDocument());

		const container = getByTestId("author-filter-section-sidebar");

		const author = await findByTextFrom(container, MockPerson.name);

		await user.click(author);
		await waitFor(() => expect(getByText("One blog post")).toBeInTheDocument());
		expect(queryByTestId("Two blog post")).not.toBeInTheDocument();
	});

	test("Filter by content type work on radio group buttons", async () => {
		mockFetch(() => ({
			people: {},
			posts: [{ ...MockPost, title: "One blog post" }],
			totalPosts: 1,
			totalCollections: 1,
			collections: [{ ...MockCollection, title: "One collection" }],
		}));

		const { getByTestId, getByText, getByLabelText, queryByTestId } = render(
			<SearchPage />,
		);

		const searchInput = getByTestId("search-input");
		await user.type(searchInput, "*");
		await user.type(searchInput, "{enter}");

		await waitFor(() => expect(getByText("One blog post")).toBeInTheDocument());
		await waitFor(() =>
			expect(getByText("One collection")).toBeInTheDocument(),
		);

		const container = getByTestId("content-to-display-group-topbar");

		const articles = await findByTextFrom(container, "Articles");

		await user.click(articles);
		await waitFor(() => expect(getByText("One blog post")).toBeInTheDocument());

		expect(queryByTestId("One collection")).not.toBeInTheDocument();

		const collections = await findByTextFrom(container, "Collections");

		await user.click(collections);

		await waitFor(() =>
			expect(getByText("One collection")).toBeInTheDocument(),
		);
		expect(queryByTestId("One blog post")).not.toBeInTheDocument();
	});

	test("Sort by date works on desktop radio group buttons", async () => {
		global.innerWidth = 2000;

		mockFetch(() => ({
			people: {},
			posts: [
				{
					...MockPost,
					published: "2022-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2022",
					title: "One blog post",
				},
				{
					...MockCanonicalPost,
					published: "2021-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2021",
					title: "Two blog post",
				},
			],
			totalPosts: 2,
			totalCollections: 0,
			collections: [],
		}));

		const { getByTestId, getByText } = render(<SearchPage />);

		const searchInput = getByTestId("search-input");
		await user.type(searchInput, "*");
		await user.type(searchInput, "{enter}");

		const container = getByTestId("sort-order-group-sidebar");

		const select =
			container instanceof HTMLSelectElement
				? container
				: container.querySelector("select")!;

		await user.selectOptions(select, "newest");

		await waitFor(() => {
			const html = document.body.innerHTML;
			const a = html.search("One blog post");
			const b = html.search("Two blog post");
			expect(a).toBeLessThan(b);
		});

		await waitFor(() => expect(getByText("One blog post")).toBeInTheDocument());
		expect(getByText("Two blog post")).toBeInTheDocument();

		await user.selectOptions(select, "oldest");

		await waitFor(() => {
			const html = document.body.innerHTML;
			const a = html.search("Two blog post");
			const b = html.search("One blog post");
			expect(a).toBeLessThan(b);
		});
	});

	test("Sort by date works on mobile radio group buttons", async () => {
		global.innerWidth = 500;
		mockFetch(() => ({
			people: {},
			posts: [
				{
					...MockPost,
					published: "2022-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2022",
					title: "One blog post",
				},
				{
					...MockCanonicalPost,
					published: "2021-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2021",
					title: "Two blog post",
				},
			],
			totalPosts: 2,
			totalCollections: 0,
			collections: [],
		}));

		const { getByTestId, getByText } = render(<SearchPage />);

		const searchInput = getByTestId("search-input");
		await user.type(searchInput, "*");
		await user.type(searchInput, "{enter}");

		const container = getByTestId("sort-order-group-topbar");

		const select =
			container instanceof HTMLSelectElement
				? container
				: container.querySelector("select")!;

		user.selectOptions(select, "newest");

		await waitFor(() => {
			const html = document.body.innerHTML;
			const a = html.search("One blog post");
			const b = html.search("Two blog post");
			expect(a).toBeLessThan(b);
		});

		await waitFor(() => expect(getByText("One blog post")).toBeInTheDocument());
		expect(getByText("Two blog post")).toBeInTheDocument();

		user.selectOptions(select, "oldest");

		await waitFor(() => {
			const html = document.body.innerHTML;
			const a = html.search("Two blog post");
			const b = html.search("One blog post");
			expect(a).toBeLessThan(b);
		});
	});

	test("Pagination - Changing pages to page 2 shows second page of results", async () => {
		// 6 posts per page
		mockFetch(() => ({
			people: {},
			posts: [
				{ ...MockPost, slug: `blog-post-1`, title: "One blog post" },
				{ ...MockPost, slug: `blog-post-2`, title: "Two blog post" },
				{ ...MockPost, slug: `blog-post-3`, title: "Three blog post" },
				{ ...MockPost, slug: `blog-post-4`, title: "Four blog post" },
				{ ...MockPost, slug: `blog-post-5`, title: "Five blog post" },
				{ ...MockPost, slug: `blog-post-6`, title: "Six blog post" },
				{ ...MockPost, slug: `blog-post-7`, title: "Seven blog post" },
				{ ...MockPost, slug: `blog-post-8`, title: "Eight blog post" },
				{ ...MockPost, slug: `blog-post-9`, title: "Nine blog post" },
				{ ...MockPost, slug: `blog-post-10`, title: "Ten blog post" },
				{ ...MockPost, slug: `blog-post-11`, title: "Eleven blog post" },
				{ ...MockPost, slug: `blog-post-12`, title: "Twelve blog post" },
			],
			totalPosts: 12,
			totalCollections: 0,
			collections: [],
		}));

		const { findByTestId, getByText, getByTestId, queryByText } = render(
			<SearchPage />,
		);

		const searchInput = getByTestId("search-input");
		await user.type(searchInput, "*");
		await user.type(searchInput, "{enter}");

		await waitFor(() => expect(getByText("One blog post")).toBeInTheDocument());
		await waitFor(() => expect(getByText("Six blog post")).toBeInTheDocument());

		await waitFor(() =>
			expect(queryByText("Seven blog post")).not.toBeInTheDocument(),
		);
		await waitFor(() =>
			expect(queryByText("Twelve blog post")).not.toBeInTheDocument(),
		);

		const container = await findByTestId("pagination");

		const page2 = await findByTextFrom(container, "2");

		await user.click(page2);

		await waitFor(() =>
			expect(getByText("Seven blog post")).toBeInTheDocument(),
		);
		await waitFor(() =>
			expect(getByText("Twelve blog post")).toBeInTheDocument(),
		);

		await waitFor(() =>
			expect(queryByText("One blog post")).not.toBeInTheDocument(),
		);
		await waitFor(() =>
			expect(queryByText("Six blog post")).not.toBeInTheDocument(),
		);
	});

	test("Pagination - Filters impact pagination", async () => {
		global.innerWidth = 2000;
		// 6 posts per page
		mockFetch(() => ({
			people: {
				[MockPerson.id]: MockPerson,
				[MockPersonTwo.id]: MockPersonTwo,
			},
			posts: [
				{
					...MockPost,
					authorsMeta: [MockPerson],
					authors: [MockPerson.id],
					slug: `blog-post-1`,
					title: "One blog post",
				},
				{
					...MockPost,
					authorsMeta: [MockPerson],
					authors: [MockPerson.id],
					slug: `blog-post-2`,
					title: "Two blog post",
				},
				{
					...MockPost,
					authorsMeta: [MockPerson],
					authors: [MockPerson.id],
					slug: `blog-post-3`,
					title: "Three blog post",
				},
				{
					...MockPost,
					authorsMeta: [MockPerson],
					authors: [MockPerson.id],
					slug: `blog-post-4`,
					title: "Four blog post",
				},
				{
					...MockPost,
					authorsMeta: [MockPersonTwo],
					authors: [MockPersonTwo.id],
					slug: `blog-post-5`,
					title: "Five blog post",
				},
				{
					...MockPost,
					authorsMeta: [MockPersonTwo],
					authors: [MockPersonTwo.id],
					slug: `blog-post-6`,
					title: "Six blog post",
				},
				{
					...MockPost,
					authorsMeta: [MockPersonTwo],
					authors: [MockPersonTwo.id],
					slug: `blog-post-7`,
					title: "Seven blog post",
				},
				{
					...MockPost,
					authorsMeta: [MockPersonTwo],
					authors: [MockPersonTwo.id],
					slug: `blog-post-8`,
					title: "Eight blog post",
				},
				{
					...MockPost,
					authorsMeta: [MockPersonTwo],
					authors: [MockPersonTwo.id],
					slug: `blog-post-9`,
					title: "Nine blog post",
				},
				{
					...MockPost,
					authorsMeta: [MockPersonTwo],
					authors: [MockPersonTwo.id],
					slug: `blog-post-10`,
					title: "Ten blog post",
				},
				{
					...MockPost,
					authorsMeta: [MockPersonTwo],
					authors: [MockPersonTwo.id],
					slug: `blog-post-11`,
					title: "Eleven blog post",
				},
				{
					...MockPost,
					authorsMeta: [MockPersonTwo],
					authors: [MockPersonTwo.id],
					slug: `blog-post-12`,
					title: "Twelve blog post",
				},
			],
			totalPosts: 12,
			totalCollections: 0,
			collections: [],
		}));

		const { findByTestId, getByText, getByTestId, queryByText } = render(
			<SearchPage />,
		);

		const searchInput = getByTestId("search-input");
		await user.type(searchInput, "*");
		await user.type(searchInput, "{enter}");

		const container = await findByTestId("pagination");

		await waitFor(() => expect(getByText("One blog post")).toBeInTheDocument());
		await waitFor(() =>
			expect(getByText("Four blog post")).toBeInTheDocument(),
		);

		expect(await findByTextFrom(container, "2")).toBeInTheDocument();

		const authorContainer = getByTestId("author-filter-section-sidebar");

		const author = await findByTextFrom(authorContainer, MockPerson.name);

		await user.click(author);

		await waitFor(() => expect(getByText("One blog post")).toBeInTheDocument());
		await waitFor(() =>
			expect(queryByText("Five blog post")).not.toBeInTheDocument(),
		);

		await waitFor(() =>
			expect(queryByTextFrom(container, "2")).not.toBeInTheDocument(),
		);
	});

	// Search page, sort order, etc
	test("Make sure that initial search props are not thrown away", async () => {
		mockFetch(() => ({
			people: {},
			posts: [
				{
					...MockPost,
					tags: ["angular"],
					authorsMeta: [MockPerson],
					authors: [MockPerson.id],
					slug: `blog-post-1`,
					title: "One blog post",
					published: "2019-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2019",
				},
				{
					...MockPost,
					tags: ["angular"],
					authorsMeta: [MockPerson],
					authors: [MockPerson.id],
					slug: `blog-post-2`,
					title: "Two blog post",
					published: "2019-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2019",
				},
				{
					...MockPost,
					tags: ["angular"],
					authorsMeta: [MockPerson],
					authors: [MockPerson.id],
					slug: `blog-post-3`,
					title: "Three blog post",
					published: "2019-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2019",
				},
				{
					...MockPost,
					tags: ["angular"],
					authorsMeta: [MockPerson],
					authors: [MockPerson.id],
					slug: `blog-post-4`,
					title: "Four blog post",
					published: "2019-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2019",
				},
				{
					...MockPost,
					tags: ["angular"],
					authorsMeta: [MockPerson],
					authors: [MockPerson.id],
					slug: `blog-post-5`,
					title: "Five blog post",
					published: "2019-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2019",
				},
				{
					...MockPost,
					tags: ["angular"],
					authorsMeta: [MockPerson],
					authors: [MockPerson.id],
					slug: `blog-post-6`,
					title: "Six blog post",
					published: "2019-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2019",
				},
				{
					...MockPost,
					tags: ["angular"],
					authorsMeta: [MockPerson],
					authors: [MockPerson.id],
					slug: `blog-post-7`,
					title: "Seven blog post",
					published: "2090-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2090",
				},
				{
					...MockPost,
					tags: ["react"],
					authorsMeta: [MockPerson],
					authors: [MockPerson.id],
					slug: `blog-post-8`,
					title: "Eight blog post",
					published: "2019-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2019",
				},
				{
					...MockPost,
					tags: ["angular"],
					authorsMeta: [MockPersonTwo],
					authors: [MockPersonTwo.id],
					slug: `blog-post-9`,
					title: "Nine blog post",
					published: "2019-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2019",
				},
				{
					...MockPost,
					tags: ["angular"],
					authorsMeta: [MockPerson],
					authors: [MockPerson.id],
					slug: `blog-post-10`,
					title: "Ten blog post",
					published: "2020-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2020",
				},
			],
			totalPosts: 10,
			totalCollections: 0,
			collections: [
				{
					...MockCollection,
					title: "One collection",
				},
			],
		}));

		const searchQuery = buildSearchQuery({
			searchQuery: "blog",
			searchPage: 2,
			display: "articles",
			filterTags: ["angular"],
			filterAuthors: [MockPerson.id],
			sort: "oldest",
		});

		window.location.assign(`?${searchQuery}`);

		const { getByTestId, getByText, queryByText } = render(<SearchPage />);

		// Persists search query
		const searchInput = getByTestId("search-input");
		expect(searchInput).toHaveValue("blog");

		// Persists page
		await waitFor(() =>
			expect(getByText("Seven blog post")).toBeInTheDocument(),
		);
		expect(queryByText("One blog post")).not.toBeInTheDocument();

		// Persists content type
		expect(queryByText("One collection")).not.toBeInTheDocument();

		// Persists tags
		expect(queryByText("Eight blog post")).not.toBeInTheDocument();

		// Persists authors
		expect(queryByText("Nine blog post")).not.toBeInTheDocument();

		// Persists sort order
		await waitFor(() => {
			const html = document.body.innerHTML;
			const a = html.search("Ten blog post");
			const b = html.search("Seven blog post");
			expect(a).toBeLessThan(b);
		});
	});

	test("Make sure that complete re-renders preserve tags, authors, etc", async () => {
		global.innerWidth = 2000;

		mockFetch(() => ({
			people: {
				[MockPerson.id]: MockPerson,
				[MockPersonTwo.id]: MockPersonTwo,
			},
			posts: [
				{
					...MockPost,
					tags: ["Angular"],
					authors: [MockPerson.id],
					title: "One blog post",
				},
				{
					...MockCanonicalPost,
					tags: [],
					authors: [MockPersonTwo.id],
					title: "Two blog post",
				},
			],
			totalPosts: 2,
			totalCollections: 0,
			collections: [],
		}));

		var { getByTestId, getByText } = render(<SearchPage />);

		var searchInput = getByTestId("search-input");
		await user.type(searchInput, "*");
		await user.type(searchInput, "{enter}");

		await waitFor(() => expect(getByText("One blog post")).toBeInTheDocument());
		await waitFor(() => expect(getByText("Two blog post")).toBeInTheDocument());

		var tagContainer = getByTestId("tag-filter-section-sidebar");

		const tag = await findByTextFrom(tagContainer, "Angular");

		await user.click(tag);

		var authorContainer = getByTestId("author-filter-section-sidebar");

		const author = await findByTextFrom(authorContainer, MockPerson.name);

		await user.click(author);

		await waitFor(() => expect(getByText("One blog post")).toBeInTheDocument());

		cleanup();

		// Re-render
		var { getByTestId, getByText } = render(<SearchPage />);

		var searchInput = getByTestId("search-input");
		await user.type(searchInput, "*");
		await user.type(searchInput, "{enter}");

		var tagContainer = getByTestId("tag-filter-section-sidebar");
		var authorContainer = getByTestId("author-filter-section-sidebar");

		expect(await findByTextFrom(tagContainer, "Angular")).toBeInTheDocument();
		expect(
			await findByTextFrom(authorContainer, MockPerson.name),
		).toBeInTheDocument();
	});

	test("Make sure that re-searches reset page to 1 and preserve tags, authors, etc", async () => {
		mockFetch(() => ({
			people: {},
			posts: [
				{
					...MockPost,
					slug: `blog-post-1`,
					title: "One blog post",
					tags: ["angular"],
					authors: [MockPerson.id],
					authorsMeta: [MockPerson],
					published: "2019-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2019",
				},
				{
					...MockPost,
					slug: `blog-post-2`,
					title: "Two blog post",
					tags: ["angular"],
					authors: [MockPerson.id],
					authorsMeta: [MockPerson],
					published: "2020-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2020",
				},
				{
					...MockPost,
					slug: `blog-post-3`,
					title: "Three blog post",
					tags: ["angular"],
					authors: [MockPerson.id],
					authorsMeta: [MockPerson],

					published: "2021-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2021",
				},
				{
					...MockPost,
					slug: `blog-post-4`,
					title: "Four blog post",
					tags: ["angular"],
					authors: [MockPerson.id],
					authorsMeta: [MockPerson],

					published: "2022-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2022",
				},
				{
					...MockPost,
					slug: `blog-post-5`,
					title: "Five blog post",
					tags: ["angular"],
					authors: [MockPerson.id],
					authorsMeta: [MockPerson],

					published: "2023-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2023",
				},
				{
					...MockPost,
					slug: `blog-post-6`,
					title: "Six blog post",
					tags: ["angular"],
					authors: [MockPerson.id],
					authorsMeta: [MockPerson],

					published: "2024-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2024",
				},
				{
					...MockPost,
					slug: `blog-post-7`,
					title: "Seven blog post",
					tags: ["angular"],
					authors: [MockPerson.id],
					authorsMeta: [MockPerson],

					published: "2025-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2025",
				},
				{
					...MockPost,
					slug: `blog-post-8`,
					title: "Eight blog post",
					tags: ["angular"],
					authors: [MockPerson.id],
					authorsMeta: [MockPerson],

					published: "2026-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2026",
				},
				{
					...MockPost,
					slug: `blog-post-9`,
					title: "Nine blog post",
					tags: ["angular"],
					authors: [MockPerson.id],
					authorsMeta: [MockPerson],

					published: "2027-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2027",
				},
				{
					...MockPost,
					slug: `blog-post-10`,
					title: "Ten blog post",
					tags: ["angular"],
					authors: [MockPerson.id],
					authorsMeta: [MockPerson],

					published: "2028-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2028",
				},
			],
			totalPosts: 10,
			totalCollections: 0,
			collections: [
				{
					...MockCollection,
					title: "One collection",
				},
			],
		}));

		const searchQuery = buildSearchQuery({
			searchQuery: "blog",
			searchPage: 2,
			display: "articles",
			filterTags: ["angular"],
			filterAuthors: [MockPerson.id],
			sort: "oldest",
		});

		window.location.assign(`?${searchQuery}`);

		const { getByTestId, getByText } = render(<SearchPage />);

		await waitFor(() => expect(getByText("Ten blog post")).toBeInTheDocument());

		const searchInput = getByTestId("search-input");
		expect(searchInput).toHaveValue("blog");

		await user.type(searchInput, "other");

		await waitFor(() => expect(getByText("One blog post")).toBeInTheDocument());

		// Since the search URL is debounced, it might update a while after the search results are visible
		await waitFor(() => {
			expect(window.location.search).toEqual(
				"?q=blogother&display=articles&filterTags=angular&filterAuthors=joe&sort=oldest",
			);
		});
	});

	test("Make sure that re-searches to empty string reset page, tags, authors, etc", async () => {
		mockFetch(() => ({
			people: {},
			posts: [
				{
					...MockPost,
					slug: `blog-post-1`,
					title: "One blog post",
					tags: ["angular"],
					authors: [MockPerson.id],
					authorsMeta: [MockPerson],
					published: "2019-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2019",
				},
				{
					...MockPost,
					slug: `blog-post-2`,
					title: "Two blog post",
					tags: ["angular"],
					authors: [MockPerson.id],
					authorsMeta: [MockPerson],
					published: "2020-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2020",
				},
				{
					...MockPost,
					slug: `blog-post-3`,
					title: "Three blog post",
					tags: ["angular"],
					authors: [MockPerson.id],
					authorsMeta: [MockPerson],

					published: "2021-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2021",
				},
				{
					...MockPost,
					slug: `blog-post-4`,
					title: "Four blog post",
					tags: ["angular"],
					authors: [MockPerson.id],
					authorsMeta: [MockPerson],

					published: "2022-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2022",
				},
				{
					...MockPost,
					slug: `blog-post-5`,
					title: "Five blog post",
					tags: ["angular"],
					authors: [MockPerson.id],
					authorsMeta: [MockPerson],

					published: "2023-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2023",
				},
				{
					...MockPost,
					slug: `blog-post-6`,
					title: "Six blog post",
					tags: ["angular"],
					authors: [MockPerson.id],
					authorsMeta: [MockPerson],

					published: "2024-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2024",
				},
				{
					...MockPost,
					slug: `blog-post-7`,
					title: "Seven blog post",
					tags: ["angular"],
					authors: [MockPerson.id],
					authorsMeta: [MockPerson],

					published: "2025-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2025",
				},
				{
					...MockPost,
					slug: `blog-post-8`,
					title: "Eight blog post",
					tags: ["angular"],
					authors: [MockPerson.id],
					authorsMeta: [MockPerson],

					published: "2026-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2026",
				},
				{
					...MockPost,
					slug: `blog-post-9`,
					title: "Nine blog post",
					tags: ["angular"],
					authors: [MockPerson.id],
					authorsMeta: [MockPerson],

					published: "2027-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2027",
				},
				{
					...MockPost,
					slug: `blog-post-10`,
					title: "Ten blog post",
					tags: ["angular"],
					authors: [MockPerson.id],
					authorsMeta: [MockPerson],

					published: "2028-01-01T00:00:00.000Z",
					publishedMeta: "January 1, 2028",
				},
			],
			totalPosts: 10,
			totalCollections: 0,
			collections: [
				{
					...MockCollection,
					title: "One collection",
				},
			],
		}));

		const searchQuery = buildSearchQuery({
			searchQuery: "blog",
			searchPage: 2,
			display: "articles",
			filterTags: ["angular"],
			filterAuthors: [MockPerson.id],
			sort: "oldest",
		});

		window.location.assign(`?${searchQuery}`);

		const { getByTestId, getByText } = render(<SearchPage />);

		await waitFor(() => expect(getByText("Ten blog post")).toBeInTheDocument());

		const searchInput = getByTestId("search-input");
		expect(searchInput).toHaveValue("blog");

		await user.clear(searchInput);

		await waitFor(() =>
			expect(getByText("What would you like to find?")).toBeInTheDocument(),
		);

		// Since the search URL is debounced, it might update a while after the search results are visible
		await waitFor(() => {
			expect(window.location.search).toEqual("?display=articles&sort=oldest");
		});
	});

	test("Back button should show last query", async () => {
		mockFetch(() => ({
			people: {},
			posts: [],
			totalPosts: 0,
			totalCollections: 0,
			collections: [],
		}));

		const { getByTestId, getByText } = render(<SearchPage />);

		const searchInput = getByTestId("search-input");
		await user.type(searchInput, "blog");

		await waitFor(() =>
			expect(getByText("No results found...")).toBeInTheDocument(),
		);

		await user.type(searchInput, "other");

		await waitFor(() => expect(window.location.search).toBe("?q=blogother"));

		history.back();

		await waitFor(() => expect(window.location.search).toBe("?q=blog"));
	});
});
