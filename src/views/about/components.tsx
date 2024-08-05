import { Button } from "components/button/button";
import * as data from "src/utils/data";

import discord from "src/icons/discord.svg?raw";
import linkedin from "src/icons/linkedin.svg?raw";
import twitter from "src/icons/twitter.svg?raw";
import mastodon from "src/icons/mastodon.svg?raw";
import facebook from "src/icons/facebook.svg?raw";
import rss from "src/icons/rss.svg?raw";

const icons: Record<string, string> = {
	discord,
	linkedin,
	twitter,
	mastodon,
	facebook,
	rss,
};

export function Links() {
	return (
		<ul class="links" role="list" aria-label="Social media links">
			{Object.entries(data.about.links).map(([name, link]) => (
				<li>
					<Button
						variant="primary"
						href={link.url}
						rel={name === "Mastodon" ? "me" : undefined}
						leftIcon={
							<span dangerouslySetInnerHTML={{ __html: icons[link.icon]! }} />
						}
					>
						{name}
					</Button>
				</li>
			))}
		</ul>
	);
}
