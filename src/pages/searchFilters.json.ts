import * as api from "utils/api";
import tagsObj from "../../content/data/tags.json";
import { SearchFiltersData, TagFilterInfo } from "src/views/search/search";

export const GET = async () => {
	const people = api
		.getPeopleByLang("en")
		.filter((person) => person.totalPostCount > 0);

	const posts = api.getAllPosts();

	const tags = Object.entries(tagsObj).map(([tag, value]) => {
		return {
			...value,
			id: tag,
			totalPostCount: posts.filter((p) => p.tags.includes(tag)).length,
		} satisfies TagFilterInfo;
	});

	const response = { people, tags } satisfies SearchFiltersData;
	return new Response(JSON.stringify(response));
};
