import Fuse from "fuse.js";
import * as fs from "fs";
import * as path from "path";
import * as api from "utils/api";
import { PostInfo, CollectionInfo, PersonInfo } from "types/index";

const posts = api.getPostsByLang("en");
const collections = api.getCollectionsByLang("en");

const createPostIndex = () => {
	return Fuse.createIndex<PostInfo>(
		[
			{
				name: "title",
				weight: 2,
			},
			{
				name: "authorName",
				getFn: (post) => {
					return post.authors
						.map((id) => api.getPersonById(id, post.locale)!.name)
						.join(", ");
				},
				weight: 1.8,
			},
			{
				name: "slug",
				weight: 1.6,
			},
			{
				name: "authorHandles",
				getFn: (post) => {
					return post.authors
						.map((id) => api.getPersonById(id, post.locale))
						.flatMap((author) => Object.values(author!.socials))
						.filter((handle) => handle)
						.join(", ");
				},
				weight: 1.2,
			},
			{ name: "tags", weight: 1.5, getFn: (post) => post.tags.join(", ") },
			{ name: "description", weight: 1.2 },
			{ name: "excerpt", weight: 1.2 },
		],
		posts,
	).toJSON();
};

const createCollectionIndex = () => {
	return Fuse.createIndex<CollectionInfo>(
		[
			{
				name: "title",
				weight: 2,
			},
			{
				name: "slug",
				weight: 1.6,
			},
			{
				name: "authorName",
				getFn: (post) => {
					return post.authors
						.map((id) => api.getPersonById(id, post.locale)!.name)
						.join(", ");
				},
				weight: 1.8,
			},
			{
				name: "authorHandles",
				getFn: (post) => {
					return post.authors
						.map((id) => api.getPersonById(id, post.locale))
						.flatMap((author) => Object.values(author!.socials))
						.filter((handle) => handle)
						.join(", ");
				},
				weight: 1.2,
			},
			{
				name: "description",
				weight: 1.2,
			},
		],
		collections,
	).toJSON();
};

const postIndex = createPostIndex();
const collectionIndex = createCollectionIndex();

const people = api.getPeopleByLang("en").reduce(
	(obj, person) => {
		obj[person.id] = person;
		return obj;
	},
	{} as Record<string, PersonInfo>,
);

const json = JSON.stringify({
	postIndex,
	posts,
	collectionIndex,
	collections,
	people,
});
fs.writeFileSync(path.resolve(process.cwd(), "./api/searchIndex.json"), json);
