import {
	getCollectionsByLang,
	getPostsByCollection,
	getUnicornById,
} from "../src/utils/api";
import { resolve } from "path";
import { EPub } from "@lesjoursfr/html-to-epub";
import { unified } from "unified";
import { CollectionInfo, PostInfo } from "types/index";
import { createEpubPlugins } from "utils/markdown/createEpubPlugins";
import { getMarkdownVFile } from "utils/markdown/getMarkdownVFile";

const unifiedChain = unified();
createEpubPlugins(unifiedChain);

async function generateEpubHTML(post: PostInfo) {
	const vfile = await getMarkdownVFile(post);
	const result = await unifiedChain.process(vfile);
	return result.toString();
}

type EpubOptions = ConstructorParameters<typeof EPub>[0];

async function generateCollectionEPub(
	collection: CollectionInfo,
	collectionPosts: PostInfo[],
	fileLocation: string,
) {
	const authors = collection.authors
		.map((id) => getUnicornById(id, collection.locale)?.name)
		.filter((name): name is string => !!name);

	const epub = new EPub(
		{
			title: collection.title,
			author: authors,
			publisher: "Unicorn Utterances",
			cover: collection.coverImgMeta.absoluteFSPath,
			css: `
					img {
						max-width: 100%;
					}

					/**
					* Shiki styling
					*/
					pre {
						padding: 0.5rem;
						border: 1px solid currentcolor;
						border-radius: 8px;
					}

					/** Don't show the language identifiers */
					pre.shiki .language-id {
						display: none !important;
					}

					/*
					* This code handles line of code counting
					*/
					code {
						counter-reset: step;
						counter-increment: step 0;
					}

					code .line::before {
						content: counter(step);
						counter-increment: step;
						width: 1rem;
						margin-right: 1.5rem;
						display: inline-block !important;
						text-align: right;
						color: currentcolor;
						opacity: 0.8;
					}

					pre.shiki span.line {
						white-space: normal;
					}
					`,
			// fonts: ['/path/to/Merriweather.ttf'],
			lang: "en",
			content: await Promise.all(
				collectionPosts.map(async (post) => ({
					title: post.title,
					data: await generateEpubHTML(post),
				})),
			),
		} as Partial<EpubOptions> as EpubOptions,
		fileLocation,
	);

	await epub.render();
}

for (const collection of getCollectionsByLang("en")) {
	const collectionPosts = getPostsByCollection(
		collection.slug,
		collection.locale,
	);

	generateCollectionEPub(
		collection,
		collectionPosts,
		resolve(process.cwd(), `public/${collection.slug}.epub`),
	);
}
