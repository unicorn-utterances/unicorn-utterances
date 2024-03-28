import { Root, Element } from "hast";
import { VFile } from "vfile";
import { Plugin } from "unified";

import { visit } from "unist-util-visit";

import { EMBED_MIN_HEIGHT, EMBED_SIZE } from "../constants";
import { fromHtml } from "hast-util-from-html";
import { find } from "unist-util-find";
import { getLargestManifestIcon } from "../../get-largest-manifest-icon";
import { getPicture, type GetPictureResult } from "utils/get-picture";
import { IFramePlaceholder } from "./iframe-placeholder";

interface RehypeUnicornIFrameClickToRunProps {
	srcReplacements?: Array<(val: string, root: VFile) => string>;
}

// default icon, used if a frame's favicon cannot be resolved
const defaultPageIcon = getPicture({
	src: "/link.png",
	width: 24,
	height: 24,
});

// Cache the fetch *promises* - so that only one request per manifest/icon is processed,
//   and multiple fetchPageInfo() calls can await the same icon
const pageIconMap = new Map<string, Promise<GetPictureResult>>();
function fetchPageIcon(src: URL, srcHast: Root): Promise<GetPictureResult> {
	if (pageIconMap.has(src.origin)) return pageIconMap.get(src.origin)!;

	const promise = (async () => {
		// <link rel="manifest" href="/manifest.json">
		const manifestPath: Element | undefined = find(
			srcHast,
			(node: unknown) =>
				(node as Element)?.properties?.rel?.toString() === "manifest",
		);

		let iconLink: string | undefined;

		if (manifestPath?.properties?.href) {
			// `/manifest.json`
			const manifestRelativeURL = String(manifestPath.properties.href);
			const fullManifestURL = new URL(manifestRelativeURL, src).href;

			const manifest = await fetch(fullManifestURL)
				.then((r) => r.status === 200 && r.json())
				.catch(() => null);

			if (manifest) {
				const largestIcon = getLargestManifestIcon(manifest);
				if (largestIcon?.icon)
					iconLink = new URL(largestIcon.icon.src, src.origin).href;
			}
		}

		if (!iconLink) {
			// fetch `favicon.ico`
			// <link rel="shortcut icon" type="image/png" href="https://example.com/img.png">
			const favicon: Element | undefined = find(
				srcHast,
				(node: unknown) =>
					(node as Element)?.properties?.rel?.toString()?.includes("icon") ??
					false,
			);

			if (favicon?.properties?.href) {
				iconLink = new URL(favicon.properties.href.toString(), src).href;
			}
		}

		// no icon image URL is found
		if (!iconLink) return null;

		// TODO: needs to insert favicons into /public/generated instead of using a remote URL
		return getPicture({
			src: iconLink,
			width: 24,
			height: 24,
		});
	})()
		// if an error is thrown, or response is null, use the default page icon
		.catch(() => null)
		.then((p) => p || defaultPageIcon);

	pageIconMap.set(src.origin, promise);
	return promise;
}

const pageHtmlMap = new Map<string, Promise<Root | null>>();
function fetchPageHtml(src: string): Promise<Root | null> {
	if (pageHtmlMap.has(src)) return pageHtmlMap.get(src)!;

	const promise = (async () => {
		const srcHTML = await fetch(src)
			.then((r) => (r.status === 200 ? r.text() : undefined))
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
	const titleEl = find<Element>(srcHast, { tagName: "title" });
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
		visit(tree, "element", (node: Element) => {
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
					src = replacement(src!.toString(), file);
				}

				width = width ?? EMBED_SIZE.w;
				height = height ?? EMBED_SIZE.h;
				const info: PageInfo = (await fetchPageInfo(src!.toString()).catch(
					() => null,
				)) || { icon: defaultPageIcon };

				const [, heightPx] = /^([0-9]+)(px)?$/.exec(height + "") || [];
				if (Number(heightPx) < EMBED_MIN_HEIGHT) height = EMBED_MIN_HEIGHT;

				const iframeReplacement = IFramePlaceholder({
					width: width.toString(),
					height: height.toString(),
					src: String(src),
					pageTitle: String(dataFrameTitle ?? "") || info.title || "",
					pageIcon: info.icon,
					propsToPreserve: JSON.stringify(propsToPreserve),
				});

				Object.assign(iframeNode, iframeReplacement);
			}),
		);
	};
};
