import { Root, Element } from "hast";
import { visit } from "unist-util-visit";
import { urlPathRegex, resolvePath } from "../url-paths";

import path from "path";
import { Plugin } from "unified";

// TODO: Add switch/case and dedicated files ala "Components"
export const rehypePlayfulElementMap: Plugin<[], Root> = () => {
	return async (tree, file) => {
		visit(tree, "element", (node: Element) => {
			if (node.tagName === "video") {
				node.properties.muted ??= true;
				node.properties.autoPlay ??= true;
				node.properties.controls ??= true;
				node.properties.loop ??= true;
				node.properties.width ??= "100%";
				node.properties.height ??= "auto";

				if (file.path) {
					const resolvedPath = resolvePath(
						String(node.properties.src),
						path.dirname(file.path),
					);
					if (resolvedPath)
						node.properties.src = resolvedPath.relativeServerPath;
				}
			}

			if (node.tagName === "a") {
				const href = node.properties.href;
				const isExternalLink = urlPathRegex.test(href?.toString() || "");
				if (isExternalLink) {
					node.properties.target = "_blank";
					node.properties.rel = "nofollow noopener noreferrer";
				}
			}

			if (node.tagName === "table" && !node.properties["has-changed"]) {
				const children = [...node.children];
				const properties = { ...node.properties, "has-changed": true };
				node.tagName = "div";
				node.properties = {
					class: "table-container",
				};
				node.children = [
					{
						tagName: "table",
						type: "element",
						children,
						properties,
					},
				];
			}
		});
	};
};
