import { Languages } from "types/index";

export interface RawCollectionInfo {
	title: string;
	description: string;
	authors?: string[];
	coverImg: string;
	socialImg?: string;
	type?: "book";
	pageLayout?: "none";
	customChaptersText?: string;
	tags?: string[];
	published: string;
	buttons?: Array<{ text: string; url: string }>;
	chapterList?: Array<{
		title: string;
		description: string;
		order: string;
	}>;
}

export interface CollectionInfo extends RawCollectionInfo {
	kind: "collection";
	slug: string;
	file: string;
	authors: string[];
	tags: string[];
	locales: Languages[];
	locale: Languages;
	postCount: number;
	coverImgMeta: {
		// Relative to "public/unicorns"
		relativePath: string;
		// Relative to site root
		relativeServerPath: string;
		// This is not stored, it's generated at build time
		absoluteFSPath: string;
		height: number;
		width: number;
	};
}
