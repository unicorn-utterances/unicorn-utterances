import { CollectionInfo } from "types/CollectionInfo";
import { PostInfo } from "types/PostInfo";
import { PersonInfo } from "types/PersonInfo";

export interface ServerReturnType {
	people: Record<string, PersonInfo>;
	posts: PostInfo[];
	totalPosts: number;
	collections: CollectionInfo[];
	totalCollections: number;
}
