import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { visit, SKIP, EXIT } from "unist-util-visit";
import { is } from "unist-util-is";
import { toString } from "hast-util-to-string";
import { Nodes } from "hast";

const unifiedChain = unified()
	.use(remarkParse, { fragment: true } as never)
	.use(remarkGfm);

function isTextOrCode(node: unknown): node is Nodes {
	return (
		is(node, "text") ||
		is(node, "code") ||
		is(node, "link") ||
		is(node, "listitem") ||
		is(node, "inlineCode")
	);
}

/**
 * Uses a minimal version of the unified chain to parse
 * the provided [markdownContent] into an excerpt no longer
 * than [maxLength].
 *
 * If [maxLength is undefined], then no maximum length is enforced.
 */
export function getExcerpt(
	markdownContent: string,
	maxLength: number | undefined,
): string {
	const tree = unifiedChain.parse(markdownContent);

	const excerptParts: string[] = [];
	let excerptLength = 0;
	visit(tree, isTextOrCode, (node) => {
		const value = toString(node);
		excerptParts.push(value);
		excerptLength += value.length;

		if (typeof maxLength === "undefined" || excerptLength < maxLength)
			return SKIP;
		else return EXIT;
	});

	const excerpt = excerptParts.map((s) => s.trim()).join(" ");

	return typeof maxLength !== "undefined" && excerpt.length > maxLength
		? excerpt.slice(0, maxLength - 3) + "..."
		: excerpt;
}
