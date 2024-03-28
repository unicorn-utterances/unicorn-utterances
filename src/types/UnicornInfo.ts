import { Languages } from ".";

export interface RawUnicornInfo {
	name: string;
	firstName: string;
	lastName: string;
	description: string;
	socials: {
		twitter?: string;
		github?: string;
		gitlab?: string;
		website?: string;
		linkedIn?: string;
		twitch?: string;
		dribbble?: string;
		mastodon?: string;
		threads?: string;
		youtube?: string;
		cohost?: string;
	};
	pronouns?: string;
	profileImg: string;
	color?: string;
	roles?: Array<string>;
	achievements?: string[];
}

export interface UnicornInfo extends Required<RawUnicornInfo> {
	kind: "unicorn";
	id: string;
	file: string;
	locale: Languages;
	locales: Languages[];
	totalPostCount: number;
	totalWordCount: number;
	profileImgMeta: {
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
