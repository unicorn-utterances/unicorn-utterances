import * as fs from "fs/promises";
import { VFile } from "vfile";
import matter from "gray-matter";
import { MarkdownFileInfo, MarkdownVFile } from "./types";

export async function getMarkdownVFile(
	data: MarkdownFileInfo,
): Promise<MarkdownVFile> {
	let fileContent: string | null = null;
	try {
		// Using import() here enables hot-reloading, but fails during astro build
		const fileImport = await import(/* @vite-ignore */ `${data.file}?raw`);
		fileContent = (fileImport as { default: string }).default;
	} catch (e) {
		fileContent = await fs.readFile(data.file, "utf-8");
	}

	const vfileData: MarkdownVFile["data"] = {
		kind: data.kind,
		file: data.file,
		headingsWithIds: [],
	};
	return new VFile({
		value: matter(fileContent).content,
		path: data.file,
		data: vfileData,
	}) as MarkdownVFile;
}
