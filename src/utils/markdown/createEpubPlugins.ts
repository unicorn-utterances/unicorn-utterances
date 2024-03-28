import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkUnwrapImages from "remark-unwrap-images";
import remarkToRehype from "remark-rehype";
import rehypeSlug from "rehype-slug-custom-id";
import rehypeRaw from "rehype-raw";
import {
	rehypeMakeHrefPathsAbsolute,
	rehypeMakeImagePathsAbsolute,
} from "./rehype-absolute-paths";
import { rehypeFixTwoSlashXHTML } from "./rehype-fix-twoslash-xhtml";
import { rehypeNoEbook } from "./rehype-no-ebook";
import { Processor } from "unified";
import rehypeStringify from "rehype-stringify";
import { rehypeExpandDetailsAndSummary } from "./rehype-expand-details-summary";
import { rehypeShikiUU } from "./shiki/rehype-transform";

export function createEpubPlugins(unified: Processor): Processor {
	return (
		unified
			.use(remarkParse, { fragment: true } as never)
			.use(remarkGfm)
			.use(remarkUnwrapImages)
			.use(remarkToRehype, { allowDangerousHtml: true })
			// This is required to handle unsafe HTML embedded into Markdown
			.use(rehypeRaw, { passThrough: ["mdxjsEsm"] })
			// When generating an epub, any relative paths need to be made absolute
			.use(rehypeFixTwoSlashXHTML)
			.use(rehypeMakeImagePathsAbsolute)
			.use(rehypeMakeHrefPathsAbsolute)
			.use(rehypeNoEbook)
			.use(rehypeExpandDetailsAndSummary)
			.use(rehypeSlug, {
				maintainCase: true,
				removeAccents: true,
				enableCustomId: true,
			})
			.use(...rehypeShikiUU)
			// Voids: [] is required for epub generation, and causes little/no harm for non-epub usage
			.use(rehypeStringify, { allowDangerousHtml: true, voids: [] })
	);
}
