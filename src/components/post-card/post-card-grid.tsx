import style from "./post-card-grid.module.scss";
import { PostCard, PostCardExpanded } from "./post-card";
import { PostInfo, UnicornInfo } from "types/index";
import { HTMLAttributes } from "preact/compat";
import { isDefined } from "utils/is-defined";

export interface PostGridProps extends HTMLAttributes<HTMLUListElement> {
	postsToDisplay: PostInfo[];
	postAuthors: Map<string, UnicornInfo>;
	postHeadingTag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
	expanded?: boolean;
}

export function PostCardGrid({
	postsToDisplay,
	postAuthors,
	postHeadingTag,
	expanded,
	...props
}: PostGridProps) {
	return (
		<ul {...props} class={style.list} role="list" id="post-list-container">
			{postsToDisplay.map((post, i) => {
				const authors = post.authors.map(id => postAuthors.get(id))
					.filter(isDefined);

				return expanded && post.bannerImg ? (
					<PostCardExpanded
						class={style.expanded}
						post={post}
						authors={authors}
						headingTag={postHeadingTag}
						// images should be loaded eagerly when presented above-the-fold
						imageLoading={i < 4 ? "eager" : "lazy"}
					/>
				) : (
					<PostCard
						post={post}
						authors={authors}
						headingTag={postHeadingTag}
					/>
				);
			})}
		</ul>
	);
}
