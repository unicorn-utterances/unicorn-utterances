import { MockUnicorn, MockUnicornTwo } from "./mock-unicorn";
import { MockLicense } from "./mock-license";
import { PostInfo } from "types/index";

export const MockPost: PostInfo = {
	kind: "post",
	title: "Post title",
	published: "10-10-2010T00:00:00.000Z",
	publishedMeta: "October 10, 2010",
	tags: ["item1"],
	description: "This is a short description dunno why this would be this short",
	excerpt: "This is a short description dunno why this would be this short",
	authors: [MockUnicorn.id],
	license: MockLicense.id,
	locale: "en",
	locales: ["en", "es"],
	slug: "this-post-name-here",
	file: "path/index.md",
	path: "path",
	wordCount: 10000,
	socialImg: "img.png",
};

export const MockMultiAuthorPost: PostInfo = {
	kind: "post",
	title: "Another post title",
	published: "10-20-2010T00:00:00.000Z",
	publishedMeta: "October 20, 2010",
	tags: ["item1"],
	description:
		"This is another short description dunno why this would be this short",
	excerpt:
		"This is another short description dunno why this would be this short",
	authors: [MockUnicornTwo.id, MockUnicorn.id],
	license: MockLicense.id,
	locale: "en",
	locales: ["en", "es"],
	slug: "this-other-post-name-here",
	file: "path/index.md",
	path: "path",
	wordCount: 100000,
	socialImg: "img.png",
};

export const MockMuliLanguagePost: PostInfo = {
	kind: "post",
	title: "Another post title",
	published: "10-20-2010T00:00:00.000Z",
	publishedMeta: "October 20, 2010",
	tags: ["item1"],
	description:
		"This is another short description dunno why this would be this short",
	excerpt:
		"This is another short description dunno why this would be this short",
	authors: [MockUnicornTwo.id, MockUnicorn.id],
	license: MockLicense.id,
	locale: "en",
	locales: ["en", "es"],
	slug: "this-other-post-name-here",
	file: "path/index.md",
	path: "path",
	wordCount: 100000,
	socialImg: "img.png",
};

export const MockCanonicalPost: PostInfo = {
	kind: "post",
	title: "Another post title",
	published: "10-20-2010T00:00:00.000Z",
	publishedMeta: "October 20, 2010",
	originalLink: "https://google.com/",
	tags: ["item1"],
	description:
		"This is another short description dunno why this would be this short",
	excerpt:
		"This is another short description dunno why this would be this short",
	authors: [MockUnicornTwo.id, MockUnicorn.id],
	license: MockLicense.id,
	locale: "en",
	locales: ["en", "es"],
	slug: "this-other-post-name-here",
	file: "path/index.md",
	path: "path",
	wordCount: 100000,
	socialImg: "img.png",
};
