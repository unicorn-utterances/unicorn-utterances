import { Root, Element } from "hast";
import { VFile } from "vfile";
import { Plugin } from "unified";

import { visit } from "unist-util-visit";

import { EMBED_MIN_HEIGHT, EMBED_SIZE } from "../constants";
import { fromHtml } from "hast-util-from-html";
import { find } from "unist-util-find";
import { getLargestManifestIcon } from "../../get-largest-manifest-icon";
import { getPicture } from "../get-picture-hack";
import type { GetPictureResult } from "@astrojs/image/dist/lib/get-picture";
// This does not download the whole file to get the file size
import probe from "probe-image-size";
import { IFramePlaceholder } from "./iframe-placeholder";

interface RehypeUnicornIFrameClickToRunProps {
	srcReplacements?: Array<(val: string, root: VFile) => string>;
}

// default icon, used if a frame's favicon cannot be resolved
let defaultPageIcon: Promise<GetPictureResult>;
function fetchDefaultPageIcon(): Promise<GetPictureResult> {
	return (
		defaultPageIcon ||
		(defaultPageIcon = getPicture({
			src: "/link.png",
			widths: [24],
			formats: ["avif", "webp", "png"],
			aspectRatio: 1,
			alt: "",
		}))
	);
}

// Cache the fetch *promises* - so that only one request per manifest/icon is processed,
//   and multiple fetchPageInfo() calls can await the same icon
const pageIconMap = new Map<string, Promise<GetPictureResult>>();
function fetchPageIcon(src: URL, srcHast: Root): Promise<GetPictureResult> {
	if (pageIconMap.has(src.origin)) return pageIconMap.get(src.origin);

	const promise = (async () => {
		// <link rel="manifest" href="/manifest.json">
		const manifestPath: Element = find(
			srcHast,
			(node: unknown) => (node as Element)?.properties?.rel?.[0] === "manifest",
		);

		let iconLink: string;

		if (manifestPath) {
			// `/manifest.json`
			const manifestRelativeURL = manifestPath.properties.href.toString();
			const fullManifestURL = new URL(manifestRelativeURL, src).href;

			const manifest = await fetch(fullManifestURL)
				.then((r) => r.status === 200 && r.json())
				.catch(() => null);

			if (manifest) {
				const largestIcon = getLargestManifestIcon(manifest);
				iconLink = new URL(largestIcon.icon.src, src.origin).href;
			}
		}

		if (!iconLink) {
			// fetch `favicon.ico`
			// <link rel="shortcut icon" type="image/png" href="https://example.com/img.png">
			const favicon: Element = find(
				srcHast,
				(node: unknown) =>
					(node as Element)?.properties?.rel?.toString()?.includes("icon"),
			);

			if (favicon) {
				iconLink = new URL(favicon.properties.href.toString(), src).href;
			}
		}

		// no icon image URL is found
		if (!iconLink) return null;
		const { height: imgHeight, width: imgWidth } = await probe(iconLink);
		const aspectRatio = imgHeight / imgWidth;
		return await getPicture({
			src: iconLink,
			widths: [24],
			formats: ["avif", "webp", "png"],
			aspectRatio: aspectRatio,
			alt: "",
		});
	})()
		// if an error is thrown, or response is null, use the default page icon
		.catch(() => null)
		.then((p) => p || fetchDefaultPageIcon());

	pageIconMap.set(src.origin, promise);
	return promise;
}

const pageHtmlMap = new Map<string, Promise<Root | null>>();
function fetchPageHtml(src: string): Promise<Root | null> {
	if (pageHtmlMap.has(src)) return pageHtmlMap.get(src);

	const promise = (async () => {
		const srcHTML = await fetch(src)
			.then((r) => r.status === 200 && r.text())
			.catch(() => null);

		// if fetch fails...
		if (!srcHTML) return null;

		const srcHast = fromHtml(srcHTML);

		return srcHast;
	})();

	pageHtmlMap.set(src, promise);
	return promise;
}

type PageInfo = {
	title?: string;
	icon: GetPictureResult;
};

export async function fetchPageInfo(src: string): Promise<PageInfo | null> {
	// fetch origin url, catch any connection timeout errors
	const url = new URL(src);
	url.search = ""; // remove any search params

	const srcHast = await fetchPageHtml(url.toString());
	if (!srcHast) return null;

	// find <title> element in response HTML
	const titleEl: Element = find(srcHast, { tagName: "title" });
	const titleContentEl = titleEl && titleEl.children[0];
	const title =
		titleContentEl?.type === "text" ? titleContentEl.value : undefined;

	// find the page favicon (cache by page origin)
	const icon = await fetchPageIcon(url, srcHast);
	return { title, icon };
}

// TODO: Add switch/case and dedicated files ala "Components"
export const rehypeUnicornIFrameClickToRun: Plugin<
	[RehypeUnicornIFrameClickToRunProps | never],
	Root
> = ({ srcReplacements = [], ...props }) => {
	return async (tree, file) => {
		const iframeNodes: Element[] = [];
		visit(tree, (node: Element) => {
			if (node.tagName === "iframe") {
				iframeNodes.push(node);
			}
		});

		await Promise.all(
			iframeNodes.map(async (iframeNode) => {
				let {
					height,
					width,
					// eslint-disable-next-line prefer-const
					src,
					// eslint-disable-next-line prefer-const
					dataFrameTitle,
					// eslint-disable-next-line prefer-const
					...propsToPreserve
				} = iframeNode.properties;

				for (const replacement of srcReplacements) {
					src = replacement(src.toString(), file);
				}

				width = width ?? EMBED_SIZE.w;
				height = height ?? EMBED_SIZE.h;
				const info: PageInfo = (await fetchPageInfo(
					src.toString(),
				).catch(() => null)) || { icon: await fetchDefaultPageIcon() };

				const [, heightPx] = /^([0-9]+)(px)?$/.exec(height + "") || [];
				if (Number(heightPx) < EMBED_MIN_HEIGHT) height = EMBED_MIN_HEIGHT;

				const iframeReplacement = IFramePlaceholder({
					width: width.toString(),
					height: height.toString(),
					src: src.toString(),
					pageTitle: String(dataFrameTitle ?? "") || info.title || "",
					pageIcon: info.icon,
					propsToPreserve: JSON.stringify(propsToPreserve),
				});

				Object.assign(iframeNode, iframeReplacement);
			}),
		);
	};
};
