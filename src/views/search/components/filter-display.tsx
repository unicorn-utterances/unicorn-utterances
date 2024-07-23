import { PostInfo } from "types/PostInfo";
import { CollectionInfo } from "types/CollectionInfo";
import { useMemo } from "preact/hooks";
import { PersonInfo } from "types/PersonInfo";
import { CSSProperties } from "preact/compat";
import { useWindowSize } from "../../../hooks/use-window-size";
import { tabletLarge } from "../../../tokens/breakpoints";
import { FilterDialog } from "./filter-dialog";
import { FilterSidebar } from "./filter-sidebar";
import tagsObj from "../../../../content/data/tags.json";
import { SortType } from "src/views/search/search";

const tagsMap = new Map(Object.entries(tagsObj));

interface FilterDisplayProps {
	posts: PostInfo[];

	collections: CollectionInfo[];
	peopleMap: Map<string, PersonInfo>;
	selectedTags: string[];
	setSelectedTags: (tags: string[]) => void;
	selectedAuthorIds: string[];
	setSelectedAuthorIds: (authors: string[]) => void;
	sort: SortType;
	setSort: (sortBy: SortType) => void;
	desktopStyle?: CSSProperties;
	isFilterDialogOpen: boolean;
	setFilterIsDialogOpen: (isOpen: boolean) => void;
	searchString: string;
	setContentToDisplay: (content: "all" | "articles" | "collections") => void;
	contentToDisplay: "all" | "articles" | "collections";
}

export const FilterDisplay = ({
	collections,
	peopleMap,
	posts,
	sort,
	setSort,
	selectedAuthorIds,
	selectedTags,
	setSelectedAuthorIds,
	setSelectedTags,
	desktopStyle,
	isFilterDialogOpen,
	setFilterIsDialogOpen,
	searchString,
	setContentToDisplay,
	contentToDisplay,
}: FilterDisplayProps) => {
	const tags = useMemo(() => {
		const tagToPostNumMap = new Map<string, number>();

		const tags = new Set<string>();
		posts.forEach((post) => {
			post.tags.forEach((tag) => {
				tags.add(tag);

				const numPosts = tagToPostNumMap.get(tag) || 0;
				tagToPostNumMap.set(tag, numPosts + 1);
			});
		});

		collections.forEach((collection) => {
			collection.tags.forEach((tag) => {
				tags.add(tag);
			});
		});

		return Array.from(tags)
			.sort((a, b) => a.localeCompare(b))
			.map((tag) => ({
				tag,
				numPosts: tagToPostNumMap.get(tag) || 0,
				...tagsMap.get(tag),
			}));
	}, [posts]);

	const authors = useMemo(() => {
		const postAuthorIdToPostNumMap = new Map<string, number>();

		posts.forEach((post) => {
			post.authors.forEach((author) => {
				const numPosts = postAuthorIdToPostNumMap.get(author) || 0;
				postAuthorIdToPostNumMap.set(author, numPosts + 1);
			});
		});

		return Array.from(peopleMap.values())
			.sort((a, b) => a.name.localeCompare(b.name))
			.map((author) => ({
				...author,
				numPosts: postAuthorIdToPostNumMap.get(author.id) || 0,
			}));
	}, [posts, collections]);

	const onSelectedAuthorChange = (id: string) => {
		const isPresent = selectedAuthorIds.includes(id);
		if (isPresent) {
			setSelectedAuthorIds(selectedAuthorIds.filter((author) => author !== id));
		} else {
			setSelectedAuthorIds([...selectedAuthorIds, id]);
		}
	};

	const onTagsChange = (id: string) => {
		const isPresent = selectedTags.includes(id);
		if (isPresent) {
			setSelectedTags(selectedTags.filter((tag) => tag !== id));
		} else {
			setSelectedTags([...selectedTags, id]);
		}
	};

	const windowSize = useWindowSize();

	const shouldShowDialog = windowSize.width <= tabletLarge;

	if (shouldShowDialog) {
		return (
			<FilterDialog
				isOpen={isFilterDialogOpen}
				onClose={(props) => {
					const { selectedAuthorIds: innerAuthorIds, selectedTags: innerTags } =
						props;
					setSelectedAuthorIds(innerAuthorIds);
					setSelectedTags(innerTags);
					setFilterIsDialogOpen(false);
				}}
				tags={tags}
				authors={authors}
				selectedAuthorIds={selectedAuthorIds}
				selectedTags={selectedTags}
			/>
		);
	}

	return (
		<FilterSidebar
			sort={sort}
			setSort={setSort}
			selectedAuthorIds={selectedAuthorIds}
			selectedTags={selectedTags}
			setSelectedAuthorIds={setSelectedAuthorIds}
			setSelectedTags={setSelectedTags}
			desktopStyle={desktopStyle}
			tags={tags}
			authors={authors}
			onSelectedAuthorChange={onSelectedAuthorChange}
			onTagsChange={onTagsChange}
			searchString={searchString}
			setContentToDisplay={setContentToDisplay}
			contentToDisplay={contentToDisplay}
		/>
	);
};
