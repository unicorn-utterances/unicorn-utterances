import * as React from "preact";
import { ComponentProps, Layout } from "../base";
import style from "./twitter-preview-css";
import fs from "fs/promises";
import { getUnicornById } from "utils/api";

const playfulProgrammingHead = await fs.readFile(
	"src/assets/playfulprogramming_sticker.svg",
	"utf-8",
);

interface TwitterCodeScreenProps {
	title: string;
	html: string;
}

const TwitterCodeScreen = ({ title, html }: TwitterCodeScreenProps) => {
	const rotations = [
		"rotateX(-17deg) rotateY(32deg) rotateZ(-3deg) translate(16%, 0%)",
		"rotateX(5deg) rotateY(35deg) rotateZ(345deg) translate(18%, 0)",
		"rotateX(15deg) rotateY(25deg) rotateZ(12deg) translate(3%, -15%)",
	];

	// use second char of title as "deterministic" random value
	const transform = rotations[title.charCodeAt(1) % rotations.length];

	return (
		<div className={`absoluteFill codeScreenBg`}>
			<div
				className="absoluteFill codeScreen"
				style={`transform: ${transform};`}
			>
				<div
					className="absoluteFill"
					dangerouslySetInnerHTML={{ __html: html }}
				/>
			</div>
		</div>
	);
};

const TwitterLargeCard = ({
	post,
	postHtml,
	width,
	authorImageMap,
}: ComponentProps) => {
	return (
		<>
			<TwitterCodeScreen title={post.title} html={postHtml} />
			<div className="absoluteFill codeScreenOverlay" />
			<div className="absoluteFill backgroundColor content">
				<div style="flex-grow: 1; text-align: right;">
					<div class="url">playfulprogramming.com</div>
				</div>
				<h1
					style={{
						maxWidth: "100%",
						fontSize: `clamp(300%, 4.5rem, ${
							Math.round(width / post.title.length) * 3
						}px)`,
					}}
				>
					{post.title}
				</h1>
				<div class="row">
					<div class="authorImages">
						{post.authors.map((author) => (
							<img
								key={author}
								src={authorImageMap[author]}
								alt=""
								className="authorImage"
								height={90}
								width={90}
							/>
						))}
					</div>
					<div class="postInfo">
						<span class="authors">
							{post.authors
								.map((id) => getUnicornById(id, post.locale)!.name)
								.join(", ")}
						</span>
						<span class="date">
							{post.publishedMeta} &nbsp;&middot;&nbsp;{" "}
							{post.wordCount.toLocaleString("en")} words
						</span>
					</div>
					<div
						class="unicorn"
						dangerouslySetInnerHTML={{ __html: playfulProgrammingHead }}
					/>
				</div>
			</div>
		</>
	);
};

export default {
	name: "twitter-preview",
	css: style,
	Component: TwitterLargeCard,
} as Layout;
