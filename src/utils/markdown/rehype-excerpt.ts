import { Root } from "hast";
import { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { AstroVFile } from "utils/markdown/types";

interface RehypeExcerptProps {
	maxLength: number;
}

export const rehypeExcerpt: Plugin<[RehypeExcerptProps | never], Root> = ({
	maxLength,
}) => {
	return (tree, file: AstroVFile) => {
		const getFileExcerpt = () =>
			file?.data?.astro?.frontmatter?.excerpt as string;
		const setFileExcerpt = (val) => {
			file.data.astro.frontmatter.excerpt = val;
		};
		if (!getFileExcerpt()) {
			setFileExcerpt("");
		}

		visit(tree, "element", (node) => {
			const fileExcerpt = getFileExcerpt();
			if (fileExcerpt.length >= maxLength) return;
			// Don't get headers or anything other than text
			if (node.tagName === "p") {
				visit(node, "text", (textNode) => {
					let newVal = fileExcerpt + textNode.value;
					if (newVal.length > maxLength) {
						newVal = newVal.slice(0, maxLength - 3) + "...";
					}
					setFileExcerpt(newVal);
				});
			}
		});
	};
};