import { Root, Element } from "hast";
import { visit } from "unist-util-visit";

/**
 * Turns any encountered <iframe> node into a link to the iframe's src.
 *
 * This is mainly for epub support
 */
export const rehypeIframeToUrl = () => {
	return (tree: Root) => {
		visit(tree, "element", (node: Element, index, parent: Element) => {
			if (node.tagName !== "iframe") return;

			const href = node.properties.src.toString();

			parent.children[index] = {
				type: "element",
				tagName: "a",
				properties: {
					href,
				},
				children: [
					{
						type: "text",
						value: href,
					},
				],
			};
		});
	};
};
