import { Root, Element } from "hast";
import { visit } from "unist-util-visit";
import { TwitchTransformer } from "./remark-embedder-twitch";
import { fromHtml } from "hast-util-from-html";

/**
 * Transforms iframe src URLs if they match an oembed provider spec so
 * that they can be correctly hosted on the site.
 *
 * For example, Twitch embed URLs need a "parent" path to match the site's hostname.
 */
export const rehypeIframeTransformOEmbedSrc = () => {
	const transformers = [TwitchTransformer];

	return (tree: Root) => {
		visit(tree, "element", (node: Element, index, parent: Element) => {
			if (node.tagName !== "iframe") return;

			const src = node.properties.src.toString();

			const transformer = transformers.find((t) => t.shouldTransform(src));
			if (!transformer) return;

			const html = transformer.getHTML(src);
			parent.children[index] = fromHtml(html, {
				fragment: true,
			}) as never as Element;
		});
	};
};
