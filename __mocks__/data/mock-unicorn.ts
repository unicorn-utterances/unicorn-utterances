import { MockRole } from "./mock-role";
import { UnicornInfo } from "types/index";

export const MockUnicorn: UnicornInfo = {
	kind: "unicorn",
	name: "Joe",
	firstName: "Joe",
	lastName: "Other",
	id: "joe",
	file: "path/index.md",
	locale: "en",
	locales: ["en"],
	totalPostCount: 2,
	totalWordCount: 1234,
	description: "Exists",
	color: "red",
	roles: [MockRole.id],
	socials: {
		twitter: "twtrusrname",
		github: "ghusrname",
		website: "example.com",
	},
	achievements: [],
	pronouns: "they/them",
	profileImg:
		"https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
	profileImgMeta: {
		relativePath:
			"https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
		relativeServerPath:
			"https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
		absoluteFSPath:
			"https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
		height: 200,
		width: 200,
	},
};

export const MockUnicornTwo: UnicornInfo = {
	kind: "unicorn",
	name: "Diane",
	firstName: "Diane",
	lastName: "",
	id: "diane",
	file: "path/index.md",
	locale: "en",
	locales: ["en"],
	totalPostCount: 3,
	totalWordCount: 12345,
	description: "Is a human",
	color: "blue",
	roles: [MockRole.id],
	socials: {
		twitter: "twtrusrname2",
		github: "ghusrname2",
		website: "example.com/2",
	},
	achievements: [],
	pronouns: "they/them",
	profileImg:
		"https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
	profileImgMeta: {
		relativePath:
			"https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
		relativeServerPath:
			"https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
		absoluteFSPath:
			"https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
		height: 200,
		width: 200,
	},
};
