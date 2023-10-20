import { Plugin } from "unified";
import rehypeSlug from "rehype-slug-custom-id";
import rehypeRaw from "rehype-raw";
import { rehypeTabs } from "./tabs/rehype-transform";
import { rehypeTooltips } from "./tooltips/rehype-transform";
import { rehypeHints } from "./hints/rehype-transform";
import { rehypeAstroImageMd } from "./rehype-astro-image-md";
import { rehypeUnicornElementMap } from "./rehype-unicorn-element-map";
import { rehypeUnicornIFrameClickToRun } from "./iframes/rehype-transform";
import { MarkdownConfig } from "./constants";
import {
	rehypeMakeHrefPathsAbsolute,
	rehypeMakeImagePathsAbsolute,
} from "./rehype-absolute-paths";
import { rehypeFixTwoSlashXHTML } from "./rehype-fix-twoslash-xhtml";
import { rehypeHeaderText } from "./rehype-header-text";
import { rehypeHeaderClass } from "./rehype-header-class";
import { rehypeFileTree } from "./file-tree/rehype-file-tree";
import { rehypeTwoslashTabindex } from "./twoslash-tabindex/rehype-transform";
import { rehypeIframeToUrl } from "./rehype-iframe-to-url";
import { rehypeIframeTransformOEmbedSrc } from "./rehype-iframe-embed";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RehypePlugin = Plugin<any[]> | [Plugin<any[]>, any];

export function createRehypePlugins(config: MarkdownConfig): RehypePlugin[] {
	return [
		// This is required to handle unsafe HTML embedded into Markdown
		[rehypeRaw, { passThrough: [`mdxjsEsm`] }],
		// When generating an epub, any relative paths need to be made absolute
		...(config.format === "epub"
			? [
					rehypeFixTwoSlashXHTML,
					[rehypeMakeImagePathsAbsolute, { path: config.path }] as RehypePlugin,
					rehypeMakeHrefPathsAbsolute,
					rehypeIframeToUrl,
			  ]
			: []),
		// Do not add the tabs before the slug. We rely on some of the heading
		// logic in order to do some of the subheading logic
		[
			rehypeSlug,
			{
				maintainCase: true,
				removeAccents: true,
				enableCustomId: true,
			},
		],
		...(config.format === "html" ? [rehypeIframeTransformOEmbedSrc] : []),
		...(config.format === "html"
			? [
					/**
					 * Insert custom HTML generation code here
					 */
					rehypeTabs,
					rehypeHints,
					rehypeTooltips,
					rehypeAstroImageMd,
					rehypeUnicornIFrameClickToRun,
					rehypeUnicornElementMap,
					rehypeTwoslashTabindex,
					rehypeFileTree,
			  ]
			: []),
		...(config.format === "html"
			? [
					rehypeHeaderText,
					[
						rehypeHeaderClass,
						{
							// the page starts at h3 (under {title} -> "Post content")
							depth: 2,
							// visually, headings should start at h2-h6
							className: (depth: number) =>
								`text-style-headline-${Math.min(depth + 1, 6)}`,
						},
					] as RehypePlugin,
			  ]
			: []),
	];
}
