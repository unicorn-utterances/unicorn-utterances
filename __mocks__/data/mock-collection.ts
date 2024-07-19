import { MockPerson } from "./mock-person";
import { CollectionInfo } from "types/index";

export const MockCollection: CollectionInfo = {
	kind: "collection",
	authors: [MockPerson.id],
	tags: [],
	postCount: 3,
	coverImgMeta: {
		absoluteFSPath: "",
		height: 0,
		relativePath: "",
		relativeServerPath: "",
		width: 0,
	},
	locales: ["en"],
	locale: "en",
	slug: "this-collection-name-here",
	file: "path/index.md",
	title: "Collection title",
	description: "This is a short description dunno why this would be this short",
	coverImg: "img.png",
	published: "10-10-2010T00:00:00.000Z",
	buttons: [],
};
