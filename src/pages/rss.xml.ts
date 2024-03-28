import { Feed } from "feed";
import { siteUrl } from "constants/site-config";
import { getPostsByLang, getUnicornById } from "utils/api";
import licenses from "../../content/data/licenses.json";

export const GET = () => {
	const feed = new Feed({
		title: "Unicorn Utterances's RSS Feed",
		description:
			"Learning programming from magically majestic words. A place to learn about all sorts of programming topics from entry-level concepts to advanced abstractions",
		id: siteUrl,
		link: siteUrl,
		language: "en",
		image: `${siteUrl}/image.png`,
		favicon: `${siteUrl}/favicon.ico`,
		copyright: `Contributor's rights reserved ${new Date().getFullYear()}, Unicorn Utterances`,
		feedLinks: {
			rss: `${siteUrl}/rss.xml`,
			atom: `${siteUrl}/atom.xml`,
			json: `${siteUrl}/feed.json`,
		},
	});

	getPostsByLang("en").forEach((post) => {
		const nodeUrl = `${siteUrl}/posts/${post.slug}`;

		feed.addItem({
			title: post.title,
			guid: nodeUrl,
			link: nodeUrl,
			description: post.description,
			content: post.excerpt,
			author: post.authors
				.map((id) => getUnicornById(id, post.locale))
				.map((author) => {
					return {
						name: author!.name,
						link: `${siteUrl}/unicorns/${author!.id}`,
					};
				}),
			date: new Date(post.published),
			copyright: licenses.find((l) => l.id === post.license)?.displayName,
			extensions: [],
		});
	});

	return new Response(feed.rss2());
};
