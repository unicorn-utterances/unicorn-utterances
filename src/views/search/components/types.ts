import { PersonInfo } from "types/PersonInfo";

export interface ExtendedTag {
	tag: string;
	displayName?: string;
	numPosts: number;
	image?: string;
	emoji?: string;
}

export interface ExtendedUnicorn extends PersonInfo {
	numPosts: number;
}
