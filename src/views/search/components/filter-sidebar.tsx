import styles from "./filter-sidebar.module.scss";
import { LargeButton } from "components/button/button";
import { CSSProperties } from "preact/compat";
import { FilterSection } from "./filter-section";
import { FilterSectionItem } from "./filter-section-item";
import { Picture as UUPicture } from "components/image/picture";
import { ExtendedTag, ExtendedUnicorn } from "./types";
import { SortType } from "src/views/search/search";
import { DEFAULT_TAG_EMOJI } from "./constants";
import { FilterSidebarControls } from "./filter-sidebar-controls";

interface FilterSidebar {
	desktopStyle?: CSSProperties;
	selectedTags: string[];
	setSelectedTags: (tags: string[]) => void;
	selectedAuthorIds: string[];
	setSelectedAuthorIds: (authors: string[]) => void;
	sort: SortType;
	setSort: (sortBy: SortType) => void;
	tags: ExtendedTag[];
	authors: ExtendedUnicorn[];
	onSelectedAuthorChange: (authorId: string) => void;
	onTagsChange: (tag: string) => void;
	searchString: string;
	setContentToDisplay: (content: "all" | "articles" | "collections") => void;
	contentToDisplay: "all" | "articles" | "collections";
}

export const FilterSidebar = ({
	sort,
	setSort,
	selectedAuthorIds,
	selectedTags,
	setSelectedAuthorIds,
	setSelectedTags,
	desktopStyle,
	onSelectedAuthorChange,
	onTagsChange,
	authors,
	tags,
	searchString,
	setContentToDisplay,
	contentToDisplay,
}: FilterSidebar) => {
	const hideSearchbar = !searchString;
	return (
		<aside
			className={`${styles.sidebarContainer}`}
			style={{
				...desktopStyle,
			}}
			inert={hideSearchbar}
		>
			<h2 className="visually-hidden">Filters</h2>
			<LargeButton
				tag="button"
				type="button"
				class={styles.jumpToContents}
				onClick={() =>
					(document.querySelector("#search-bar") as HTMLInputElement).focus()
				}
			>
				Jump to search bar
			</LargeButton>

			<FilterSidebarControls
				sort={sort}
				setSort={setSort}
				setContentToDisplay={setContentToDisplay}
				contentToDisplay={contentToDisplay}
			/>
			<FilterSection
				title={"Tag"}
				data-testid="tag-filter-section-sidebar"
				selectedNumber={selectedTags.length}
				onClear={() => setSelectedTags([])}
			>
				{tags.map((tag, i) => {
					return (
						<FilterSectionItem
							count={tag.numPosts}
							icon={
								tag.image ? (
									<img src={tag.image} alt="" className={styles.tagImage} />
								) : tag.emoji ? (
									<span className={styles.tagEmoji}>{tag.emoji}</span>
								) : (
									<span className={styles.tagEmoji}>
										{DEFAULT_TAG_EMOJI[i % DEFAULT_TAG_EMOJI.length]}
									</span>
								)
							}
							label={tag?.displayName ?? tag.tag}
							selected={selectedTags.includes(tag.tag)}
							onChange={() => onTagsChange(tag.tag)}
						/>
					);
				})}
			</FilterSection>
			<FilterSection
				title={"Author"}
				data-testid="author-filter-section-sidebar"
				selectedNumber={selectedAuthorIds.length}
				onClear={() => setSelectedAuthorIds([])}
			>
				{authors.map((author) => {
					return (
						<FilterSectionItem
							count={author.numPosts}
							icon={
								<UUPicture
									src={author.profileImgMeta.relativeServerPath}
									width={24}
									height={24}
									alt={""}
									class={styles.authorIcon}
								/>
							}
							label={author.name}
							selected={selectedAuthorIds.includes(author.id)}
							onChange={() => onSelectedAuthorChange(author.id)}
						/>
					);
				})}
			</FilterSection>
		</aside>
	);
};
