import { PostHeadingInfo } from "types/PostInfo";
import { unified } from "unified";
import { getMarkdownVFile } from "./getMarkdownVFile";
import { MarkdownFileInfo, MarkdownVFile } from "./types";
import { createHtmlPlugins } from "./createHtmlPlugins";

export type MarkdownHtml = {
	headingsWithIds: PostHeadingInfo[];
	html: string;
};

const unifiedChain = unified();
createHtmlPlugins(unifiedChain);

export async function getMarkdownHtml(
	post: MarkdownFileInfo,
	vfilePromise: Promise<MarkdownVFile> = getMarkdownVFile(post),
): Promise<MarkdownHtml> {
	const vfile = await vfilePromise;

	const result = await unifiedChain.process(vfile).catch((err) => {
		console.error(`Failed to parse markdown file ${vfile.path}:\n`, err);
		return err.toString();
	});

	return {
		headingsWithIds: vfile.data.headingsWithIds,
		html: result.toString(),
	};
}
