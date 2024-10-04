import { useMemo } from "preact/hooks";
import { PersonInfo, TagInfo } from "types/index";
import { CSSProperties } from "preact/compat";
import { useWindowSize } from "../../../hooks/use-window-size";
import { tabletLarge } from "../../../tokens/breakpoints";
import { FilterDialog } from "./filter-dialog";
import { FilterSidebar } from "./filter-sidebar";
import tagsObj from "../../../../content/data/tags.json";
import { SortType } from "src/views/search/search";
import { ExtendedTag, ExtendedUnicorn } from "./types";

const tagsMap: Map<string, TagInfo> = new Map(Object.entries(tagsObj));

interface FilterDisplayProps {
	tagCounts: Record<string, number>,
	authorCounts: Record<string, number>,
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
	tagCounts,
	authorCounts,
	peopleMap,
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
	const tags: ExtendedTag[] = useMemo(() => {
		const totalEntries = {
			// Ensure that selected tags are included in the filter list
			...Object.fromEntries(
				selectedTags.map(tag => [tag, 0])
			),
			...tagCounts,
		};

		return Object.entries(totalEntries)
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([tag, count]) => ({
				tag,
				numPosts: count,
				...tagsMap.get(tag),
			}) satisfies Partial<ExtendedTag>)
			.filter((a): a is ExtendedTag => !!(a.displayName));
	}, [tagCounts]);

	const authors: ExtendedUnicorn[] = useMemo(() => {
		const totalEntries = {
			// Ensure that selected authors are included in the filter list
			...Object.fromEntries(
				selectedAuthorIds.map(author => [author, 0])
			),
			...authorCounts,
		};

		return Object.entries(totalEntries)
			.map(([author, count]) => ({
				numPosts: count,
				...peopleMap.get(author),
			}) satisfies Partial<ExtendedUnicorn>)
			.filter((a): a is ExtendedUnicorn => !!(a.name))
			.sort((a, b) => a.name.localeCompare(b.name));
	}, [authorCounts, peopleMap]);

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
