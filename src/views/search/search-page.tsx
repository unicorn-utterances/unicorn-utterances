import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "preact/hooks";
import { Pagination } from "components/pagination/pagination";
import { useSearchParams } from "./use-search-params";
import {
	QueryClient,
	QueryClientProvider,
	useQuery,
} from "@tanstack/react-query";
import { useDebouncedValue } from "./use-debounced-value";

import style from "./search-page.module.scss";
import { PostCardGrid } from "components/post-card/post-card-grid";
import { SubHeader } from "components/subheader/subheader";
import { Fragment } from "preact";
import { CollectionCard } from "components/collection-card/collection-card";
import { FilterDisplay } from "./components/filter-display";
import { useElementSize } from "../../hooks/use-element-size";
import { SearchTopbar } from "./components/search-topbar";
import { SearchHero } from "./components/search-hero";
import { LargeButton } from "components/button/button";
import retry from "src/icons/refresh.svg?raw";
import sadUnicorn from "../../assets/unicorn_sad.svg";
import happyUnicorn from "../../assets/unicorn_happy.svg";
import scaredUnicorn from "../../assets/unicorn_scared.svg";
import {
	SEARCH_PAGE_KEY,
	SearchQuery,
	serializeParams,
	deserializeParams,
	DisplayContentType,
	SortType,
} from "./search";
import { SearchResultCount } from "./components/search-result-count";
import { ServerReturnType } from "./types";
import { CollectionInfo } from "types/CollectionInfo";
import { isDefined } from "utils/is-defined";

const MAX_POSTS_PER_PAGE = 6;

function SearchPageBase() {
	const [query, setQuery] = useSearchParams<SearchQuery>(
		serializeParams,
		deserializeParams,
	);

	const search = query.searchQuery ?? "";

	/**
	 * Derive state and setup for search
	 */
	const setSearch = useCallback(
		(str: string) => {
			const newQuery = {
				...query,
				searchQuery: str,
				searchPage: 1,
			};

			if (!str) {
				// Remove tags and authors when no value is present
				newQuery.filterTags = [];
				newQuery.filterAuthors = [];
			}

			setQuery(newQuery);
		},
		[query, setQuery],
	);

	const [debouncedSearch, immediatelySetDebouncedSearch] = useDebouncedValue(
		search,
		500,
	);

	const resultsHeading = useRef<HTMLDivElement | null>(null);

	const onManualSubmit = useCallback(
		(str: string) => {
			immediatelySetDebouncedSearch(str);
			resultsHeading.current?.focus();
		},
		[immediatelySetDebouncedSearch],
	);

	/**
	 * Fetch data
	 */
	const enabled = !!debouncedSearch;

	const { isLoading, isFetching, isError, error, data, refetch } = useQuery({
		queryFn: ({ signal }) => {
			// Analytics go brr
			plausible &&
				plausible("search", { props: { searchVal: debouncedSearch } });

			return fetch(`/api/search?query=${debouncedSearch}`, {
				signal: signal,
				method: "GET",
			}).then((res) => {
				if (!res.ok) {
					return res.text().then((text) => Promise.reject(text));
				}
				return res.json() as Promise<ServerReturnType>;
			});
		},
		queryKey: ["search", debouncedSearch],
		initialData: {
			people: {},
			posts: [],
			totalPosts: 0,
			collections: [],
			totalCollections: 0,
		} as ServerReturnType,
		refetchOnWindowFocus: false,
		retry: false,
		enabled,
	});

	useEffect(() => {
		if (error) {
			console.error("There was an error", { error });
		}
	}, [error]);

	const isContentLoading = isLoading || isFetching;

	const setSelectedPeople = useCallback(
		(authors: string[]) => {
			setQuery({
				...query,
				filterAuthors: authors,
				searchPage: 1, // reset to page 1
			});
		},
		[query, setQuery],
	);

	const setSelectedTags = useCallback(
		(tags: string[]) => {
			setQuery({
				...query,
				filterTags: tags,
				searchPage: 1, // reset to page 1
			});
		},
		[query, setQuery],
	);

	const setContentToDisplay = useCallback(
		(display: DisplayContentType) => {
			setQuery({
				...query,
				display: display,
				searchPage: 1, // reset to page 1
			});
		},
		[query, setQuery],
	);

	const peopleMap = useMemo(() => {
		return new Map(Object.entries(data.people));
	}, [data.people]);

	const showArticles = query.display === "all" || query.display === "articles";

	const showCollections =
		query.display === "all" || query.display === "collections";

	const setSort = useCallback(
		(sort: SortType) => {
			setQuery({
				...query,
				sort: sort,
				searchPage: 1, // reset to page 1
			});
		},
		[query, setQuery],
	);

	/**
	 * Filter and sort posts
	 */
	const filteredAndSortedPosts = useMemo(() => {
		const posts = [...data.posts];
		if (query.sort !== "relevance") {
			posts.sort(
				(a, b) =>
					(query.sort === "newest" ? -1 : 1) *
					(new Date(a.published).getTime() - new Date(b.published).getTime()),
			);
		}

		return posts.filter((post) => {
			if (
				query.filterTags.length > 0 &&
				!post.tags.some((tag) => query.filterTags.includes(tag))
			) {
				return false;
			}

			if (
				query.filterAuthors.length > 0 &&
				!post.authors.some((person) => query.filterAuthors.includes(person))
			) {
				return false;
			}

			return true;
		});
	}, [data, query.sort, query.filterTags, query.filterAuthors]);

	const filteredAndSortedCollections: CollectionInfo[] = useMemo(() => {
		const collections = [...data.collections];

		if (query.sort !== "relevance") {
			collections.sort(
				(a, b) =>
					(query.sort === "newest" ? -1 : 1) *
					(new Date(a.published).getTime() - new Date(b.published).getTime()),
			);
		}

		return collections.filter((collection) => {
			if (
				query.filterTags.length > 0 &&
				!collection.tags.some((tag) => query.filterTags.includes(tag))
			) {
				return false;
			}

			if (
				query.filterAuthors.length > 0 &&
				!collection.authors.some((person) =>
					query.filterAuthors.includes(person),
				)
			) {
				return false;
			}

			return true;
		});
	}, [data, query.sort, query.filterTags, query.filterAuthors]);

	/**
	 * Paginate posts
	 */
	const posts = useMemo(() => {
		return filteredAndSortedPosts.slice(
			(query.searchPage - 1) * MAX_POSTS_PER_PAGE,
			query.searchPage * MAX_POSTS_PER_PAGE,
		);
	}, [filteredAndSortedPosts, query.searchPage]);

	/**
	 * Calculate the last page based on the number of posts.
	 */
	const lastPage = useMemo(
		() => Math.ceil(filteredAndSortedPosts.length / MAX_POSTS_PER_PAGE),
		[filteredAndSortedPosts],
	);

	/**
	 * Styles for header bar
	 */
	const { size, setEl } = useElementSize();

	useLayoutEffect(() => {
		const header = document.querySelector("#header-bar") as HTMLElement;
		setEl(header);
	}, []);

	const headerHeight = size.height;

	const [isFilterDialogOpen, setFilterIsDialogOpen] = useState(false);

	const noResults =
		enabled &&
		!isContentLoading &&
		((posts.length === 0 && showArticles && !showCollections) ||
			(filteredAndSortedCollections.length === 0 &&
				showCollections &&
				!showArticles) ||
			(showCollections &&
				showArticles &&
				posts.length === 0 &&
				filteredAndSortedCollections.length === 0));

	const numberOfCollections = showCollections
		? filteredAndSortedCollections.length
		: 0;

	const numberOfPosts = showArticles ? filteredAndSortedPosts.length : 0;

	return (
		<main className={style.fullPageContainer} data-hide-sidebar={!search}>
			<h1 className={"visually-hidden"}>Search</h1>
			<FilterDisplay
				isFilterDialogOpen={isFilterDialogOpen}
				setFilterIsDialogOpen={setFilterIsDialogOpen}
				collections={data.collections}
				posts={data.posts}
				peopleMap={peopleMap}
				selectedTags={query.filterTags}
				setSelectedTags={setSelectedTags}
				selectedAuthorIds={query.filterAuthors}
				setSelectedAuthorIds={setSelectedPeople}
				sort={query.sort}
				setSort={setSort}
				setContentToDisplay={setContentToDisplay}
				contentToDisplay={query.display}
				desktopStyle={{
					height: `calc(100vh - ${headerHeight}px)`,
					top: headerHeight,
					position: "sticky",
					// this should be overflow: clip; to prevent the browser scrolling within the element when a filter checkbox is focused:
					// https://stackoverflow.com/q/75419337
					// https://github.com/unicorn-utterances/unicorn-utterances/issues/653
					overflow: "clip",
				}}
				searchString={search}
			/>
			<div className={style.mainContents}>
				<SearchTopbar
					onSubmit={(val) => onManualSubmit(val)}
					onBlur={(val) => immediatelySetDebouncedSearch(val)}
					search={search}
					setSearch={setSearch}
					setContentToDisplay={setContentToDisplay}
					contentToDisplay={query.display}
					setSort={setSort}
					sort={query.sort}
					setFilterIsDialogOpen={setFilterIsDialogOpen}
					headerHeight={headerHeight}
				/>
				<section className={style.mainContentsInner}>
					{/* aria-live cannot be on an element that is programmatically removed
				or added via JSX, instead it has to listen to changes in DOM somehow */}
					<div
						aria-live={"polite"}
						aria-atomic="true"
						className={style.passThru}
					>
						{!isContentLoading &&
							(!!numberOfCollections || !!numberOfPosts) && (
								<SearchResultCount
									ref={resultsHeading}
									numberOfCollections={numberOfCollections}
									numberOfPosts={numberOfPosts}
								/>
							)}
						{!isError && isContentLoading && (
							<>
								<div className={style.loadingAnimationContainer}>
									<div className={style.loadingAnimation} />
									<p className={`text-style-headline-4 ${style.loadingText}`}>
										Fetching results...
									</p>
								</div>
							</>
						)}
					</div>
					<div
						aria-live="assertive"
						aria-atomic="true"
						className={style.passThru}
					>
						{!isError && !isContentLoading && noResults && (
							<SearchHero
								imageSrc={sadUnicorn.src}
								imageAlt={""}
								title={"No results found..."}
								description={"Please adjust your query or your active filters!"}
							/>
						)}
						{isError && !isContentLoading && (
							<SearchHero
								imageSrc={scaredUnicorn.src}
								imageAlt={""}
								title={"There was an error fetching your search results."}
								description={"Please adjust your query or try again."}
								buttons={
									<LargeButton
										onClick={() => refetch()}
										leftIcon={
											<span dangerouslySetInnerHTML={{ __html: retry }} />
										}
									>
										Retry
									</LargeButton>
								}
							/>
						)}
					</div>

					{!enabled && !isContentLoading && (
						<SearchHero
							imageSrc={happyUnicorn.src}
							imageAlt={""}
							title={"What would you like to find?"}
							description={
								"Search for your favorite framework or most loved language; we'll share what we know."
							}
						/>
					)}
					{enabled &&
						!isContentLoading &&
						showCollections &&
						Boolean(filteredAndSortedCollections.length) && (
							<Fragment>
								<SubHeader
									tag="h2"
									text="Collections"
									id="collections-header"
									data-testid="collections-header"
								/>
								<ul
									aria-labelledby="collections-header"
									role="list"
									className={style.collectionsGrid}
								>
									{filteredAndSortedCollections.map((collection) => (
										<li>
											<CollectionCard
												collection={collection}
												authors={collection.authors
													.map((id) => peopleMap.get(id))
													.filter(isDefined)}
												headingTag="h3"
											/>
										</li>
									))}
								</ul>
							</Fragment>
						)}
					{enabled &&
						!isContentLoading &&
						showArticles &&
						Boolean(posts.length) && (
							<Fragment>
								<SubHeader
									tag="h2"
									text="Articles"
									id="articles-header"
									data-testid="articles-header"
								/>
								<PostCardGrid
									aria-labelledby={"articles-header"}
									postsToDisplay={posts}
									postAuthors={peopleMap}
									postHeadingTag="h3"
								/>
								<Pagination
									testId="pagination"
									softNavigate={(_href, pageNum) => {
										setQuery({
											...query,
											searchPage: pageNum,
										});
									}}
									page={{
										currentPage: query.searchPage,
										lastPage: lastPage,
									}}
									getPageHref={(pageNum) => {
										const pageParams = new URLSearchParams(
											window.location.search,
										);
										pageParams.set(SEARCH_PAGE_KEY, pageNum.toString());
										return `${
											window.location.pathname
										}?${pageParams.toString()}`;
									}}
								/>
							</Fragment>
						)}
				</section>
			</div>
		</main>
	);
}

const queryClient = new QueryClient();

export default function SearchPage() {
	return (
		<QueryClientProvider client={queryClient}>
			<SearchPageBase />
		</QueryClientProvider>
	);
}
