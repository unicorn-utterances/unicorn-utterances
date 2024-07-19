import { PostInfo } from "types/index";
import { render } from "preact-render-to-string";
import { VNode, createElement } from "preact";
import sharp from "sharp";
import { Parent } from "unist";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkToRehype from "remark-rehype";
import { findAllAfter } from "unist-util-find-all-after";
import { toString } from "hast-util-to-string";
import rehypeStringify from "rehype-stringify";
import { Layout, PAGE_HEIGHT, PAGE_WIDTH } from "./base";
import { getPersonById } from "utils/api";
import { getPostContentMarkdown } from "utils/get-post-content";

const unifiedChain = unified()
	.use(remarkParse)
	.use(remarkToRehype, { allowDangerousHtml: true })
	.use(() => (tree) => {
		// extract code snippets from parsed markdown
		const nodes = findAllAfter(tree as unknown as Parent, 0, {
			tagName: "pre",
		});

		// join code parts into one element
		const value =
			nodes
				.map((node) => toString(node))
				.join("\n")
				.trim() +
			"\n" +
			renderPostPreviewToString.toString().replace(/([;,])/g, (s) => s + "\n");

		const children = value
			.split("\n")
			.filter((value) => !!value.trim().length)
			.map((value) => ({
				type: "element",
				tagName: "code",
				children: [
					{
						type: "text",
						value: value,
					},
				],
			}));

		return {
			type: "root",
			children: [
				{
					type: "element",
					tagName: "pre",
					children,
				},
			],
		};
	})
	.use(rehypeStringify, { allowDangerousHtml: true });

async function markdownToHtml(content: string) {
	return await (await unifiedChain.process(content)).toString();
}

const authorImageCache = new Map<string, string>();

export const renderPostPreviewToString = async (
	layout: Layout,
	post: PostInfo,
) => {
	const authorImageMap = Object.fromEntries(
		await Promise.all(
			post.authors.map(async (authorId) => {
				const author = getPersonById(authorId, post.locale)!;

				if (authorImageCache.has(author.id))
					return [author.id, authorImageCache.get(author.id)];

				const buffer = await sharp(author.profileImgMeta.absoluteFSPath)
					.resize(90, 90)
					.jpeg({ mozjpeg: true })
					.toBuffer();

				const image = "data:image/jpeg;base64," + buffer.toString("base64");

				authorImageCache.set(author.id, image);
				return [author.id, image];
			}),
		),
	);

	const postHtml = await markdownToHtml(await getPostContentMarkdown(post));

	return `
	<!DOCTYPE html>
	<html>
	<head>
	<style>
	${layout.css}

	html, body {
		margin: 0;
		padding: 0;
		width: ${PAGE_WIDTH}px;
		height: ${PAGE_HEIGHT}px;
		position: relative;
		overflow: hidden;
	}
	</style>
	</head>
	<body>
	${render(
		createElement(layout.Component, {
			post,
			postHtml,
			width: PAGE_WIDTH,
			height: PAGE_HEIGHT,
			authorImageMap,
		}) as VNode<{}>,
	)}
	</body>
	</html>
	`;
};
