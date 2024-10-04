import { PersonInfo } from "types/PersonInfo";
import { TagInfo } from "types/TagInfo";

export const SEARCH_QUERY_KEY = "q";
export const SEARCH_PAGE_KEY = "page";
export const CONTENT_TO_DISPLAY_KEY = "display";
export const FILTER_TAGS_KEY = "filterTags";
export const FILTER_AUTHOR_KEY = "filterAuthors";
export const SORT_KEY = "sort";

export type SortType = "relevance" | "newest" | "oldest";

export type DisplayContentType = "all" | "articles" | "collections";

export interface TagFilterInfo extends TagInfo {
	id: string;
	totalPostCount: number;
}

export interface SearchFiltersData {
	people: PersonInfo[];
	tags: TagFilterInfo[];
}

export interface SearchQuery {
	searchQuery: string;
	searchPage: number;
	display: DisplayContentType;
	filterTags: string[];
	filterAuthors: string[];
	sort: SortType;
}

const defaultQuery: SearchQuery = {
	searchQuery: "",
	searchPage: 1,
	display: "all",
	filterTags: [],
	filterAuthors: [],
	sort: "relevance",
};

export function serializeParams(query: SearchQuery): URLSearchParams {
	const obj: Record<string, string | undefined> = {
		[SEARCH_QUERY_KEY]: query.searchQuery ? query.searchQuery : undefined,
		[SEARCH_PAGE_KEY]:
			query.searchPage > 1 ? query.searchPage.toString() : undefined,
		[CONTENT_TO_DISPLAY_KEY]:
			query.display === defaultQuery.display ? undefined : query.display,
		[FILTER_TAGS_KEY]: query.filterTags.length
			? query.filterTags.join(",")
			: undefined,
		[FILTER_AUTHOR_KEY]: query.filterAuthors.length
			? query.filterAuthors.join(",")
			: undefined,
		[SORT_KEY]: query.sort === defaultQuery.sort ? undefined : query.sort,
	};

	// Remove any undefined entries from the object
	for (const [key, value] of Object.entries(obj)) {
		if (typeof value === "undefined") delete obj[key];
	}

	return new URLSearchParams(obj as Record<string, string>);
}

export function deserializeParams(params: URLSearchParams): SearchQuery {
	const searchQuery = params.get(SEARCH_QUERY_KEY);
	const searchPage = params.get(SEARCH_PAGE_KEY);
	const display = params.get(CONTENT_TO_DISPLAY_KEY);
	const filterTags = params.get(FILTER_TAGS_KEY);
	const filterAuthors = params.get(FILTER_AUTHOR_KEY);
	const sort = params.get(SORT_KEY);

	return {
		searchQuery: searchQuery ?? "",
		searchPage: searchPage ? Number(searchPage) : 1,
		display:
			display && ["all", "articles", "collections"].includes(display)
				? (display as DisplayContentType)
				: defaultQuery.display,
		filterTags: filterTags ? filterTags.split(",").filter(Boolean) : [],
		filterAuthors: filterAuthors
			? filterAuthors.split(",").filter(Boolean)
			: [],
		sort:
			sort && ["relevance", "newest", "oldest"].includes(sort)
				? (sort as SortType)
				: defaultQuery.sort,
	};
}

export const buildSearchQuery = (query: Partial<SearchQuery>) => {
	const params = serializeParams(Object.assign({}, defaultQuery, query));
	// Returned without a question mark
	return params.toString();
};
