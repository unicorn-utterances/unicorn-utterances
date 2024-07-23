import { dirname, resolve } from "path";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import emojiRegexFn from "emoji-regex";
import { EPub, defaultAllowedAttributes } from "@lesjoursfr/html-to-epub";
import { unified } from "unified";
import { CollectionInfo, PostInfo } from "types/index";
import {
	getCollectionsByLang,
	getPostsByCollection,
	getUnicornById,
} from "utils/api";
import { createEpubPlugins } from "utils/markdown/createEpubPlugins";
import { getMarkdownVFile } from "utils/markdown/getMarkdownVFile";
import {
	rehypeReferencePage,
	collectionMetaRecord,
} from "utils/markdown/reference-page/rehype-reference-page";
import { escapeHtml, fetchPageHtml, getPageTitle } from "utils/fetch-page-html";
import { rehypeRemoveCollectionLinks } from "utils/markdown/rehype-remove-collection-links";

const __dirname = dirname(fileURLToPath(import.meta.url));

const emojiRegex = emojiRegexFn();

interface GetReferencePageMarkdownOptions {
	collection: CollectionInfo;
	collectionPosts: PostInfo[];
}

async function getReferencePageHtml({
	collection,
	collectionPosts,
}: GetReferencePageMarkdownOptions) {
	const collectionMeta = collectionMetaRecord.get(collection.slug);

	const links = await Promise.all(
		collectionMeta?.links?.map(async (link) => {
			const srcHast = await fetchPageHtml(link.originalHref);
			if (!srcHast)
				return {
					...link,
					title: link.originalText,
				};

			const title = getPageTitle(srcHast);
			return {
				...link,
				title: title ?? link.originalText,
			};
		}) ?? [],
	);

	return `
${collectionPosts
	.map((chapter) => {
		const chapterMetaLinks = links.filter(
			(link) => link.associatedChapterOrder === chapter.order,
		);

		if (!chapterMetaLinks?.length) {
			return `
<h2 id="${collection.slug}-${chapter.order}">${chapter.title.trim()}</h2>

<p>No links for this chapter</p>
`.trim();
		}

		// TODO: `<ol start="">` Blocked by: https://github.com/lesjoursfr/html-to-epub/issues/140
		return `
<h2 id="${collection.slug}-${chapter.order}">${chapter.title.trim()}</h2>

<ol start="${chapterMetaLinks[0].countWithinCollection}">
${chapterMetaLinks
	.map((link) => {
		return `
<li style="white-space: pre-line; margin-top: 2rem; margin-bottom: 2rem;">${escapeHtml(link.title.trim())}:

<a href="${link.originalHref.trim()}">${link.originalHref.trim()}</a></li>
`.trim();
	})
	.join("\n")}
</ol>
`.trim();
	})
	.join("\n\n")}
`.trim();
}

interface GenerateReferencePageHTMLOptions {
	markdown: string;
	unifiedChain: ReturnType<typeof createEpubPlugins>;
}

async function generateReferencePageHTML({
	markdown,
	unifiedChain,
}: GenerateReferencePageHTMLOptions) {
	const result = await unifiedChain.process(markdown);
	return result.toString();
}

interface GenerateEpubHTMLOptions {
	post: PostInfo;
	unifiedChain: ReturnType<typeof createEpubPlugins>;
}

async function generateEpubHTML({
	post,
	unifiedChain,
}: GenerateEpubHTMLOptions) {
	const vfile = await getMarkdownVFile(post);

	// Replace our Prettier useTabs with two spaces for ebook consistency
	let contents = vfile.value.toString();
	let didReplace = true;
	while (didReplace) {
		didReplace = false;
		// Only replace tabs at the start of the line
		const newContents = contents.replace
			? contents.replace(/^\t+/gm, (tabs) => "  ".repeat(tabs.length))
			: contents;
		if (newContents !== contents) {
			didReplace = true;
			contents = newContents;
		}
	}
	vfile.value = contents;

	const result = await unifiedChain.process(vfile);
	const html = result.toString();
	return html.replace(emojiRegex, "");
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

	const referenceTitle = "References";

	const unifiedChain = createEpubPlugins(unified())
		.use(rehypeRemoveCollectionLinks, {
			collection,
		})
		.use(rehypeReferencePage, {
			collection,
			collectionPosts,
			referenceTitle,
		});

	const contents: Array<{ title: string; data: string }> = [];

	// We cannot use `Promise.all` here because we need to keep the order for the link transform to work
	for (const post of collectionPosts) {
		contents.push({
			title: post.title,
			data: await generateEpubHTML({ post, unifiedChain }),
		});
	}

	const referencePageHTML = await getReferencePageHtml({
		collection,
		collectionPosts,
	});

	contents.push({
		title: referenceTitle,
		data: referencePageHTML.replace(emojiRegex, ""),
	});

	const epub = new EPub(
		{
			title: collection.title,
			author: authors,
			publisher: "Playful Programming",
			cover: collection.coverImgMeta.absoluteFSPath,
			allowedAttributes: [...defaultAllowedAttributes, "start"],
			css: await fs.readFile(resolve(__dirname, "./epub.css"), "utf-8"),
			// fonts: ['/path/to/Merriweather.ttf'],
			lang: "en",
			content: contents,
		} as Partial<EpubOptions> as EpubOptions,
		fileLocation,
	);

	await epub.render();
}

for (const collection of getCollectionsByLang("en")) {
	// This should return a sorted list of posts in the correct order
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
