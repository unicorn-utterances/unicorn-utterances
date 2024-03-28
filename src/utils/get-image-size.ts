import { resolvePath } from "./url-paths";
import sharp from "sharp";
import { readFile } from "fs/promises";

export async function getImageSize(src: string, relativeDir: string) {
	const path = resolvePath(src, relativeDir);
	if (!path) return undefined;

	const buffer = await readFile(path.absoluteFSPath);
	const metadata = await sharp(buffer).metadata();
	return {
		width: metadata.width,
		height: metadata.height,
	};
}
