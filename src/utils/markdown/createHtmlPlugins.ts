import remarkParse from "remark-parse";
import remarkEmbedder, { RemarkEmbedderOptions } from "@remark-embedder/core";
import remarkGfm from "remark-gfm";
import remarkUnwrapImages from "remark-unwrap-images";
import { TwitchTransformer } from "./remark-embedder-twitch";
import oembedTransformer from "@remark-embedder/transformer-oembed";
import remarkToRehype from "remark-rehype";
import rehypeSlug from "rehype-slug-custom-id";
import rehypeRaw from "rehype-raw";
import { rehypeTabs } from "./tabs/rehype-transform";
import { rehypeTooltips } from "./tooltips/rehype-transform";
import { rehypeHints } from "./hints/rehype-transform";
import { rehypeAstroImageMd } from "./picture/rehype-transform";
import { rehypeUnicornElementMap } from "./rehype-unicorn-element-map";
import { rehypeUnicornIFrameClickToRun } from "./iframes/rehype-transform";
import { rehypeHeaderText } from "./rehype-header-text";
import { rehypeHeaderClass } from "./rehype-header-class";
import { rehypeFileTree } from "./file-tree/rehype-file-tree";
import { rehypeTwoslashTabindex } from "./twoslash-tabindex/rehype-transform";
import { rehypeInContentAd } from "./in-content-ad/rehype-transform";
import { Processor } from "unified";
import { dirname, relative, resolve } from "path";
import type { VFile } from "vfile";
import { siteMetadata } from "../../constants/site-config";
import branch from "git-branch";
import { rehypeShikiUU } from "./shiki/rehype-transform";
import rehypeStringify from "rehype-stringify";

const currentBranch = process.env.VERCEL_GIT_COMMIT_REF ?? (await branch());

export function createHtmlPlugins(unified: Processor): Processor {
	return (
		unified
			.use(remarkParse, { fragment: true } as never)
			.use(remarkGfm)
			// Remove complaining about "div cannot be in p element"
			.use(remarkUnwrapImages)
			/* start remark plugins here */
			.use(remarkEmbedder, {
				transformers: [oembedTransformer, TwitchTransformer],
			} as RemarkEmbedderOptions)
			.use(remarkToRehype, { allowDangerousHtml: true })
			// This is required to handle unsafe HTML embedded into Markdown
			.use(rehypeRaw, { passThrough: ["mdxjsEsm"] })
			// Do not add the tabs before the slug. We rely on some of the heading
			// logic in order to do some of the subheading logic
			.use(rehypeSlug, {
				maintainCase: true,
				removeAccents: true,
				enableCustomId: true,
			})
			/**
			 * Insert custom HTML generation code here
			 */
			.use(rehypeTabs)
			.use(rehypeHints)
			.use(rehypeTooltips)
			.use(rehypeAstroImageMd)
			.use(rehypeUnicornIFrameClickToRun, {
				srcReplacements: [
					(val: string, file: VFile) => {
						const iFrameUrl = new URL(val);
						if (!iFrameUrl.protocol.startsWith("uu-code:")) return val;

						const contentDir = dirname(file.path);
						const fullPath = resolve(contentDir, iFrameUrl.pathname);

						const fsRelativePath = relative(file.cwd, fullPath);

						// Windows paths need to be converted to URLs
						let urlRelativePath = fsRelativePath.replace(/\\/g, "/");

						if (urlRelativePath.startsWith("/")) {
							urlRelativePath = urlRelativePath.slice(1);
						}

						const q = iFrameUrl.search;
						const repoPath = siteMetadata.repoPath;
						const provider = `stackblitz.com/github`;
						return `
								https://${provider}/${repoPath}/tree/${currentBranch}/${urlRelativePath}${q}
							`.trim();
					},
				],
			})
			.use(rehypeUnicornElementMap)
			.use(rehypeTwoslashTabindex)
			.use(rehypeFileTree)
			.use(rehypeHeaderText)
			.use(rehypeHeaderClass, {
				// the page starts at h3 (under {title} -> "Post content")
				depth: 2,
				// visually, headings should start at h2-h6
				className: (depth: number) =>
					`text-style-headline-${Math.min(depth + 1, 6)}`,
			})
			.use(rehypeInContentAd)
			// Shiki is the last plugin before stringify, to avoid performance issues
			// with node traversal (shiki creates A LOT of element nodes)
			.use(...rehypeShikiUU)
			.use(rehypeStringify, { allowDangerousHtml: true, voids: [] })
	);
}
