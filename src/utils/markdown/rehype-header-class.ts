import { headingRank } from "hast-util-heading-rank";
import { hasProperty } from "hast-util-has-property";
import { toString } from "hast-util-to-string";
import { Root, Parent } from "hast";
import { visit } from "unist-util-visit";
import { isMarkdownVFile } from "./types";
import { Plugin } from "unified";

interface RehypeHeaderClassOpts {
	depth: number;
	className: (depth: number) => string;
}

/**
 * Plugin to act as "rehype-behead", but add a className to display headings
 * at the intended visual level.
 */
export const rehypeHeaderClass: Plugin<[RehypeHeaderClassOpts], Root> = (
	opts,
) => {
	return (tree, file) => {
		// exclude the site/about-us*.mdx files, since
		// those start at a different heading level
		if (isMarkdownVFile(file) && file.data.kind === "page") return;

		// Find the minimum heading rank in the file
		// (e.g. if it starts at h2, minDepth = 2)
		let minDepth: number | undefined;
		visit(tree, "element", (node: Parent["children"][number]) => {
			const nodeHeadingRank = headingRank(node);
			if (
				!minDepth ||
				(nodeHeadingRank !== undefined && nodeHeadingRank < minDepth)
			)
				minDepth = nodeHeadingRank;
		});

		visit(tree, "element", (node: Parent["children"][number]) => {
			const nodeHeadingRank = headingRank(node);

			if (
				nodeHeadingRank &&
				"properties" in node &&
				node.properties &&
				!hasProperty(node, "class") &&
				!hasProperty(node, "className")
			) {
				// indent the heading rank by opts.depth - (1 - minDepth), so that:
				// - when (minDepth = 5, depth = 2) h5 + 2 - 4 -> h3
				// - when (minDepth = 1, depth = 2) h1 + 2 + 0 -> h3
				const tagHeadingRank = Math.min(
					nodeHeadingRank + opts.depth + (1 - (minDepth ?? 1)),
					6,
				);
				const className = opts.className(nodeHeadingRank);

				node.tagName = "h" + tagHeadingRank;
				node.properties.className = className;

				const headerText = toString(node as never);
				node.properties["data-header-text"] = headerText;
			}
		});
	};
};
