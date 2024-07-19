import style from "./collection-card.module.scss";
import { Button } from "components/index";
import { CollectionInfo } from "types/CollectionInfo";
import forward from "src/icons/arrow_right.svg?raw";
import { Picture as UUPicture } from "components/image/picture";
import { UnicornInfo } from "types/UnicornInfo";

interface CollectionCardProps {
	collection: CollectionInfo;
	authors: UnicornInfo[];
	headingTag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export const CollectionCard = ({
	collection,
	authors,
	headingTag: HeadingTag = "h2",
}: CollectionCardProps) => {
	const coverImgAspectRatio =
		collection.coverImgMeta.width / collection.coverImgMeta.height;

	// adjust the image width to ensure its height=240px
	// (i.e. it shouldn't get upscaled/downscaled with `object-fit: cover`)
	const coverImgWidth = Math.max(160, Math.ceil(240 * coverImgAspectRatio));

	return (
		<div className={style.container}>
			<div className={style.topRow}>
				<UUPicture
					src={collection.coverImgMeta.relativeServerPath}
					width={coverImgWidth}
					height={240}
					alt=""
					class={style.coverImg}
				/>
				<div>
					<HeadingTag className={`text-style-headline-4 ${style.title}`}>
						{collection.title}
					</HeadingTag>
					<p className={`text-style-body-medium`}>{collection.description}</p>
				</div>
			</div>
			<div className={style.bottomRow}>
				<ul
					className={`unlist-inline ${style.authorList}`}
					role="list"
					aria-label="Collection authors"
				>
					{authors?.map((author) => (
						<li>
							<a
								href={`/people/${author.id}`}
								className={`text-style-button-regular ${style.authorListItem}`}
							>
								<UUPicture
									src={author.profileImgMeta.relativeServerPath}
									width={24}
									height={24}
									alt=""
									class={style.authorImage}
								/>
								<span>{author.name}</span>
							</a>
						</li>
					))}
				</ul>

				<Button
					href={`/collections/${collection.slug}`}
					rightIcon={
						<span
							className={style.forwardIcon}
							dangerouslySetInnerHTML={{ __html: forward }}
						/>
					}
				>
					{collection.customChaptersText ?? (
						<>{String(collection.postCount)} chapters</>
					)}
				</Button>
			</div>
		</div>
	);
};
