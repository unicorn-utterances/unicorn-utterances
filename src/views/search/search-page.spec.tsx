/* eslint-disable no-var */
import { beforeAll, beforeEach, afterEach, afterAll, test, describe, expect, vi } from "vitest";
import {
	findByText as findByTextFrom,
	render,
	waitFor,
	cleanup,
} from "@testing-library/preact";
import { SearchPageBase } from "./search-page";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MockCanonicalPost, MockPost } from "../../../__mocks__/data/mock-post";
import userEvent from "@testing-library/user-event";
import { MockCollection } from "../../../__mocks__/data/mock-collection";
import { MockPerson, MockPersonTwo } from "../../../__mocks__/data/mock-person";
import { buildSearchQuery } from "src/views/search/search";
import { PersonInfo } from "types/PersonInfo";
import { PostInfo } from "types/PostInfo";
import { CollectionInfo } from "types/CollectionInfo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SearchClient, SearchContext } from "./orama";
import { ClientSearchParams, OramaClient } from "@oramacloud/client";

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

interface FnReply {
	posts: PostInfo[];
	totalPosts: number;
	collections: CollectionInfo[];
	totalCollections: number;
	tags?: Record<string, number>;
	authors?: Record<string, number>;
}

function mockOramaClient(partial: Partial<OramaClient>): OramaClient {
	return {
		search: vi.fn(),
		...partial,
	} as never as OramaClient;
}

function mockClients(fn: (searchStr: string) => FnReply): SearchContext {
	const postClient = mockOramaClient({
		search: vi.fn().mockImplementation(async (query: ClientSearchParams) => {
			const searchString = query.term!;
			const res = fn(searchString);
			const count = res.totalPosts;
			let id = 1;
			const hits =
				res.posts.map((post) => {
					return {
						id: ++id,
						score: 2,
						document: post,
					};
				}) || [];
			return {
				hits,
				count,
				facets: {
					tags: {
						count: 0,
						values: res.tags ?? {},
					},
					authors: {
						count: 0,
						values: res.authors ?? {},
					},
				},
				elapsed: { raw: 0, formatted: "0ms" },
			};
		}),
	});

	const collectionClient = mockOramaClient({
		search: vi.fn().mockImplementation(async (query: ClientSearchParams) => {
			const searchString = query.term!;
			const res = fn(searchString);
			const count = res.totalCollections;
			let id = 1;
			const hits =
				res.collections.map((collection) => {
					return {
						id: ++id,
						score: 2,
						document: collection,
					};
				}) || [];
			return {
				hits,
				count,
				facets: {
					tags: {
						count: 0,
						values: {},
					},
					authors: {
						count: 0,
						values: {},
					},
				},
				elapsed: { raw: 0, formatted: "0ms" },
			};
		}),
	});

	return { postClient, collectionClient };
}

function mockPeopleIndex(
	people: PersonInfo[],
) {
	server.use(
		http.get(`*/searchFilters.json`, async () => {
			return HttpResponse.json({
				people,
				tags: [
					{
						displayName: "Angular",
						id: "angular",
						image: "/stickers/angular.svg",
						shownWithBranding: true,
						totalPostCount: 32,
					}
				],
			});
		}),
	);
}

function SearchPage(props: { mockClients: SearchContext }) {
	const queryClient = new QueryClient();
	return (
		<SearchClient.Provider value={props.mockClients}>
			<QueryClientProvider client={queryClient}>
				<SearchPageBase />
			</QueryClientProvider>
		</SearchClient.Provider>
	);
}

describe("Search page", () => {
	test("Should show initial results", async () => {
		mockPeopleIndex([]);
		const clients = mockClients(() => ({
			people: [],
			posts: [],
			totalPosts: 0,
			totalCollections: 0,
			collections: [],
		}));

		const { getByText } = render(<SearchPage mockClients={clients} />);

		await waitFor(() =>
			expect(getByText("What would you like to find?")).toBeInTheDocument(),
		);
	});

	test("Should show search results for posts", async () => {
		mockPeopleIndex([]);
		const clients = mockClients(() => ({
			posts: [MockPost],
			totalPosts: 1,
			totalCollections: 0,
			collections: [],
		}));

		const { getByText, getByTestId } = render(<SearchPage mockClients={clients} />);
		const searchInput = getByTestId("search-input");
		await user.type(searchInput, MockPost.title);
		await user.type(searchInput, "{enter}");
		await waitFor(() => expect(getByText(MockPost.title)).toBeInTheDocument());
	});

	test("Should show search results for collections", async () => {
		mockPeopleIndex([]);
		const clients = mockClients(() => ({
			posts: [],
			totalPosts: 0,
			totalCollections: 1,
			collections: [MockCollection],
		}));

		const { getByText, getByTestId } = render(<SearchPage mockClients={clients} />);
		const searchInput = getByTestId("search-input");
		await user.type(searchInput, MockCollection.title);
		await user.type(searchInput, "{enter}");
		await waitFor(() =>
			expect(getByText(MockCollection.title)).toBeInTheDocument(),
		);
	});

	test("Should show error screen when 500", async () => {
		mockPeopleIndex([]);
		const clients = mockClients(() => { throw "oops"; });
		const { getByText, getByTestId } = render(<SearchPage mockClients={clients} />);
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
		mockPeopleIndex([]);
		const clients = mockClients(() => ({
			posts: [],
			totalPosts: 0,
			totalCollections: 0,
			collections: [],
		}));

		const { getByText, getByTestId } = render(<SearchPage mockClients={clients} />);
		const searchInput = getByTestId("search-input");
		await user.type(searchInput, "Asdfasdfasdf");
		await user.type(searchInput, "{enter}");
		await waitFor(() =>
			expect(getByText("No results found...")).toBeInTheDocument(),
		);
	});

	test("Remove collections header when none found", async () => {
		mockPeopleIndex([]);
		const clients = mockClients(() => ({
			people: [],
			posts: [MockPost],
			totalPosts: 1,
			totalCollections: 0,
			collections: [],
		}));

		const { getByTestId, queryByTestId } = render(<SearchPage mockClients={clients} />);
		const searchInput = getByTestId("search-input");
		await user.type(searchInput, MockPost.title);
		await user.type(searchInput, "{enter}");
		await waitFor(() =>
			expect(getByTestId("articles-header")).toBeInTheDocument(),
		);
		expect(queryByTestId("collections-header")).not.toBeInTheDocument();
	});

	test("Remove posts header when none found", async () => {
		mockPeopleIndex([]);
		const clients = mockClients(() => ({
			posts: [],
			totalPosts: 0,
			totalCollections: 1,
			collections: [MockCollection],
		}));

		const { getByTestId, queryByTestId } = render(<SearchPage mockClients={clients} />);
		const searchInput = getByTestId("search-input");
		await user.type(searchInput, MockCollection.title);
		await user.type(searchInput, "{enter}");
		await waitFor(() =>
			expect(getByTestId("collections-header")).toBeInTheDocument(),
		);
		expect(queryByTestId("articles-header")).not.toBeInTheDocument();
	});

	test("Filter by tag works on desktop sidebar", async () => {
		mockPeopleIndex([]);
		const clients = mockClients(() => ({
			posts: [
				{ ...MockPost, tags: ["Angular"], title: "One blog post" },
				{ ...MockCanonicalPost, tags: [], title: "Two blog post" },
			],
			totalPosts: 2,
			totalCollections: 0,
			collections: [],
			tags: { angular: 1 },
			authors: {},
		}));

		const { getByTestId, queryByTestId, getByText } = render(<SearchPage mockClients={clients} />);

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
		mockPeopleIndex([MockPerson, MockPersonTwo]);
		const clients = mockClients(() => ({
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

		const { getByTestId, getByText, queryByTestId } = render(<SearchPage mockClients={clients} />);

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
		mockPeopleIndex([]);
		const clients = mockClients(() => ({
			posts: [{ ...MockPost, title: "One blog post" }],
			totalPosts: 1,
			totalCollections: 1,
			collections: [{ ...MockCollection, title: "One collection" }],
		}));

		const { getByTestId, getByText, queryByTestId } = render(
			<SearchPage mockClients={clients} />,
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
		(global as { innerWidth: number }).innerWidth = 2000;

		mockPeopleIndex([]);
		const clients = mockClients(() => ({
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

		const { getByTestId } = render(<SearchPage mockClients={clients} />);

		const searchInput = getByTestId("search-input");
		await user.type(searchInput, "*");
		await user.type(searchInput, "{enter}");

		await waitFor(() =>
			expect(clients.postClient.search).toHaveBeenCalledTimes(1)
		);

		const container = getByTestId("sort-order-group-sidebar");

		const select =
			container instanceof HTMLSelectElement
				? container
				: container.querySelector("select")!;

		await user.selectOptions(select, "newest");

		await waitFor(() =>
			expect(clients.postClient.search).toHaveBeenCalledTimes(2)
		);
		expect(clients.postClient.search).toHaveBeenLastCalledWith(
			{
				term: "",
				limit: 6,
				offset: 0,
				sortBy: {
					property: "publishedTimestamp",
					order: "desc",
				},
				where: {
					authors: undefined,
					tags: undefined,
				},
				facets: expect.anything(),
			},
			expect.anything(),
		);

		await user.selectOptions(select, "oldest");

		await waitFor(() =>
			expect(clients.postClient.search).toHaveBeenCalledTimes(3)
		);
		expect(clients.postClient.search).toHaveBeenLastCalledWith(
			{
				term: "",
				limit: 6,
				offset: 0,
				sortBy: {
					property: "publishedTimestamp",
					order: "asc",
				},
				where: {
					authors: undefined,
					tags: undefined,
				},
				facets: expect.anything(),
			},
			expect.anything(),
		);
	});

	test("Sort by date works on mobile radio group buttons", async () => {
		(global as { innerWidth: number }).innerWidth = 500;

		mockPeopleIndex([]);
		const clients = mockClients(() => ({
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

		const { getByTestId } = render(<SearchPage mockClients={clients} />);

		const searchInput = getByTestId("search-input");
		await user.type(searchInput, "*");
		await user.type(searchInput, "{enter}");

		await waitFor(() =>
			expect(clients.postClient.search).toHaveBeenCalledTimes(1)
		);

		const container = getByTestId("sort-order-group-topbar");

		const select =
			container instanceof HTMLSelectElement
				? container
				: container.querySelector("select")!;

		user.selectOptions(select, "newest");

		await waitFor(() =>
			expect(clients.postClient.search).toHaveBeenCalledTimes(2)
		);
		expect(clients.postClient.search).toHaveBeenLastCalledWith(
			{
				term: "",
				limit: 6,
				offset: 0,
				sortBy: {
					property: "publishedTimestamp",
					order: "desc",
				},
				where: {
					authors: undefined,
					tags: undefined,
				},
				facets: expect.anything(),
			},
			expect.anything(),
		);

		user.selectOptions(select, "oldest");

		await waitFor(() =>
			expect(clients.postClient.search).toHaveBeenCalledTimes(3)
		);
		expect(clients.postClient.search).toHaveBeenLastCalledWith(
			{
				term: "",
				limit: 6,
				offset: 0,
				sortBy: {
					property: "publishedTimestamp",
					order: "asc",
				},
				where: {
					authors: undefined,
					tags: undefined,
				},
				facets: expect.anything(),
			},
			expect.anything(),
		);
	});

	test("Pagination - Changing pages to page 2 shows second page of results", async () => {
		// 6 posts per page
		mockPeopleIndex([]);
		const clients = mockClients(() => ({
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

		const { findByTestId, getByText, getByTestId } = render(
			<SearchPage mockClients={clients} />,
		);

		const searchInput = getByTestId("search-input");
		await user.type(searchInput, "*");
		await user.type(searchInput, "{enter}");

		await waitFor(() =>
			expect(clients.postClient.search).toHaveBeenCalledOnce()
		);
		expect(clients.postClient.search).toHaveBeenLastCalledWith(
			{
				term: "",
				limit: 6,
				offset: 0,
				sortBy: {
					property: "publishedTimestamp",
					order: "desc",
				},
				where: {
					authors: undefined,
					tags: undefined,
				},
				facets: expect.anything(),
			},
			expect.anything(),
		);

		expect(getByText("One blog post")).toBeInTheDocument();
		expect(getByText("Six blog post")).toBeInTheDocument();

		const container = await findByTestId("pagination");

		const page2 = await findByTextFrom(container, "2");

		await user.click(page2);

		await waitFor(() =>
			expect(clients.postClient.search).toHaveBeenCalledTimes(2)
		);
		expect(clients.postClient.search).toHaveBeenLastCalledWith(
			{
				term: "",
				limit: 6,
				offset: 6,
				sortBy: {
					order: "desc",
					property: "publishedTimestamp",
				},
				where: {
					authors: undefined,
					tags: undefined,
				},
				facets: expect.anything(),
			},
			expect.anything(),
		);
	});

	test("Pagination - Filters impact pagination", async () => {
		(global as { innerWidth: number }).innerWidth = 2000;
		// 6 posts per page
		mockPeopleIndex([MockPerson, MockPersonTwo]);
		const clients = mockClients(() => ({
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

		const { findByTestId, getByText, getByTestId } = render(
			<SearchPage mockClients={clients} />,
		);

		const searchInput = getByTestId("search-input");
		await user.type(searchInput, "*");
		await user.type(searchInput, "{enter}");

		await waitFor(() =>
			expect(clients.postClient.search).toHaveBeenCalledOnce()
		);
		expect(clients.postClient.search).toHaveBeenLastCalledWith(
			{
				term: "",
				limit: 6,
				offset: 0,
				sortBy: {
					property: "publishedTimestamp",
					order: "desc",
				},
				where: {
					authors: undefined,
					tags: undefined,
				},
				facets: expect.anything(),
			},
			expect.anything(),
		);

		const container = await findByTestId("pagination");

		expect(getByText("One blog post")).toBeInTheDocument();
		expect(getByText("Four blog post")).toBeInTheDocument();

		expect(await findByTextFrom(container, "2")).toBeInTheDocument();

		const authorContainer = getByTestId("author-filter-section-sidebar");

		const author = await findByTextFrom(authorContainer, MockPerson.name);

		await user.click(author);

		// Invokes the expected post query
		await waitFor(() =>
			expect(clients.postClient.search).toHaveBeenCalledTimes(2)
		);
		expect(clients.postClient.search).toHaveBeenLastCalledWith(
			{
				term: "",
				limit: 6,
				offset: 0,
				sortBy: {
					property: "publishedTimestamp",
					order: "desc",
				},
				where: {
					authors: [MockPerson.id],
					tags: undefined,
				},
				facets: expect.anything(),
			},
			expect.anything(),
		);
	});

	// Search page, sort order, etc
	test("Make sure that initial search props are not thrown away", async () => {
		mockPeopleIndex([]);
		const clients = mockClients(() => ({
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

		const { getByTestId } = render(<SearchPage mockClients={clients} />);

		// Persists search query
		const searchInput = getByTestId("search-input");
		expect(searchInput).toHaveValue("blog");

		// Invokes the expected post query
		expect(clients.postClient.search).toHaveBeenCalledOnce()
		expect(clients.postClient.search).toHaveBeenCalledWith(
			{
				term: "blog",
				limit: 6,
				offset: 6,
				sortBy: {
					property: "publishedTimestamp",
					order: "asc",
				},
				where: {
					tags: ["angular"],
					authors: [MockPerson.id],
				},
				facets: expect.anything(),
			},
			expect.anything(),
		);

		// Invokes the expected collections query
		expect(clients.collectionClient.search).toHaveBeenCalledOnce()
		expect(clients.collectionClient.search).toHaveBeenCalledWith(
			{
				term: "blog",
				limit: 4,
				offset: 4,
				sortBy: {
					property: "publishedTimestamp",
					order: "asc",
				},
				where: {
					tags: ["angular"],
					authors: [MockPerson.id],
				},
				facets: expect.anything(),
			},
			expect.anything(),
		);
	});

	test("Make sure that complete re-renders preserve tags, authors, etc", async () => {
		(global as { innerWidth: number }).innerWidth = 2000;

		mockPeopleIndex([MockPerson, MockPersonTwo]);
		const clients = mockClients(() => ({
			people: [MockPerson, MockPersonTwo],
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
			tags: { angular: 1 },
			authors: { [MockPerson.id]: 1 },
		}));

		var { getByTestId, getByText } = render(<SearchPage mockClients={clients} />);

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
		var { getByTestId, getByText } = render(<SearchPage mockClients={clients} />);

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
		mockPeopleIndex([]);
		const clients = mockClients(() => ({
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

		const { getByTestId, getByText } = render(<SearchPage mockClients={clients} />);

		await waitFor(() =>
			expect(clients.postClient.search).toHaveBeenCalledOnce()
		);

		await waitFor(() => expect(getByText("Ten blog post")).toBeInTheDocument());

		const searchInput = getByTestId("search-input");
		expect(searchInput).toHaveValue("blog");

		await user.type(searchInput, "other");
		await user.type(searchInput, "{enter}");

		await waitFor(() =>
			expect(clients.postClient.search).toHaveBeenCalledTimes(2)
		);

		expect(clients.postClient.search).toHaveBeenLastCalledWith({
			term: "blogother",
			limit: 6,
			offset: 0,
			sortBy: {
				property: "publishedTimestamp",
				order: "asc",
			},
			where: {
				authors: ["joe"],
				tags: ["angular"],
			},
			facets: expect.anything(),
		}, expect.anything());

		await waitFor(() => expect(getByText("One blog post")).toBeInTheDocument());

		// Since the search URL is debounced, it might update a while after the search results are visible
		await waitFor(() => {
			expect(window.location.search).toEqual(
				"?q=blogother&display=articles&filterTags=angular&filterAuthors=joe&sort=oldest",
			);
		});
	});

	test("Make sure that re-searches to empty string reset page, tags, authors, etc", async () => {
		mockPeopleIndex([]);
		const clients = mockClients(() => ({
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

		const { getByTestId, getByText } = render(<SearchPage mockClients={clients} />);

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
		mockPeopleIndex([]);
		const clients = mockClients(() => ({
			posts: [],
			totalPosts: 0,
			totalCollections: 0,
			collections: [],
			tags: {},
			authors: {},
		}));

		const { getByTestId, getByText } = render(<SearchPage mockClients={clients} />);

		const searchInput = getByTestId("search-input");
		await user.type(searchInput, "blog");

		await waitFor(() => {
			expect(window.location.search).toBe("?q=blog");
			expect(getByText("No results found...")).toBeInTheDocument();
		}, { timeout: 1500 });

		await user.type(searchInput, "other");

		await waitFor(() =>
			expect(window.location.search).toBe("?q=blogother")
		, { timeout: 1500 });

		history.back();
		expect(window.location.search).toBe("?q=blog");
	});
});
