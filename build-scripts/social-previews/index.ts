import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";
import { promises as fsPromises } from "fs";
import { resolve } from "path";
import { getAllExtendedPosts } from "utils/get-all-posts";
import { ExtendedPostInfo } from "types/index";
import { renderPostPreviewToString } from "./shared-post-preview-png";
import { Layout, PAGE_HEIGHT, PAGE_WIDTH } from "./base";
import banner from "./layouts/banner";
import twitterPreview from "./layouts/twitter-preview";

// For non-prod builds, this isn't needed
if (process.env.BUILD_ENV === "dev") process.exit(0);

const browser_args = [
	"--autoplay-policy=user-gesture-required",
	"--disable-background-networking",
	"--disable-background-timer-throttling",
	"--disable-backgrounding-occluded-windows",
	"--disable-breakpad",
	"--disable-client-side-phishing-detection",
	"--disable-component-update",
	"--disable-default-apps",
	"--disable-dev-shm-usage",
	"--disable-domain-reliability",
	"--disable-extensions",
	"--disable-features=AudioServiceOutOfProcess",
	"--disable-hang-monitor",
	"--disable-ipc-flooding-protection",
	"--disable-notifications",
	"--disable-offer-store-unmasked-wallet-cards",
	"--disable-popup-blocking",
	"--disable-print-preview",
	"--disable-prompt-on-repost",
	"--disable-renderer-backgrounding",
	"--disable-setuid-sandbox",
	"--disable-speech-api",
	"--disable-sync",
	"--hide-scrollbars",
	"--ignore-gpu-blacklist",
	"--metrics-recording-only",
	"--mute-audio",
	"--no-default-browser-check",
	"--no-first-run",
	"--no-pings",
	"--no-sandbox",
	"--no-zygote",
	"--password-store=basic",
	"--use-gl=swiftshader",
	"--use-mock-keychain",
	"--disable-web-security",
];

const browser: puppeteer.Browser = await chromium.puppeteer.launch({
	args: [...chromium.args, ...browser_args],
	defaultViewport: {
		width: PAGE_WIDTH,
		height: PAGE_HEIGHT,
	},
	executablePath: await chromium.executablePath,
	headless: true,
	ignoreHTTPSErrors: true,
	userDataDir: "./.puppeteer",
});

const page: puppeteer.Page = await browser.newPage();

async function renderPostImage(layout: Layout, post: ExtendedPostInfo) {
	const label = `${post.slug} (${layout.name})`;
	console.time(label);

	page.setContent(await renderPostPreviewToString(layout, post));
	const buffer = (await page.screenshot({ type: "jpeg" })) as Buffer;

	console.timeEnd(label);
	return buffer;
}

// Relative to root
const outDir = resolve(process.cwd(), "./public");
await fsPromises.mkdir(outDir, { recursive: true });

/**
 * This is done synchronously, in order to prevent more than a single instance
 * of the browser from running at the same time.
 */
for (const post of getAllExtendedPosts("en")) {
	if (post.socialImg) {
		await fsPromises.writeFile(
			resolve(outDir, `.${post.socialImg}`),
			await renderPostImage(twitterPreview, post)
		);
	}

	if (post.bannerImg) {
		await fsPromises.writeFile(
			resolve(outDir, `.${post.bannerImg}`),
			await renderPostImage(banner, post)
		);
	}
}

await browser.close();
