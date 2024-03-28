import rehypeShiki, { type RehypeShikiOptions } from "@shikijs/rehype";
import type { Root } from "hast";
import type { Plugin } from "unified";
import { transformerNotationHighlight } from "@shikijs/transformers";

export const rehypeShikiUU: [
	Plugin<[RehypeShikiOptions], Root, Root>,
	RehypeShikiOptions,
] = [
	rehypeShiki as never,
	{
		themes: {
			light: "github-light",
			dark: "github-dark",
		},
		transformers: [
			// supports "[!code highlight]" transforms to add a .shiki-line-highlight class
			transformerNotationHighlight({
				classActiveLine: "highlight",
			}),
		],
	},
];
