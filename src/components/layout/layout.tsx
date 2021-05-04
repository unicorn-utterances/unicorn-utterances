import * as React from "react";
import { graphql } from "gatsby";
import BackIcon from "assets/icons/back.svg";
import layoutStyles from "./layout.module.scss";
import "../../global.scss";
import { DarkLightButton } from "../dark-light-button";
import TransitionLink, { TransitionState } from "gatsby-plugin-transition-link";
import posed from "react-pose";
import { ThemeProvider } from "constants/theme-context";

const Main = React.forwardRef(({ children, ...props }, ref) => (
	<main {...props} ref={ref as any}>
		{children}
	</main>
));
// posed.main is not a thing
const AnimMainTed = posed.div({
	enteringPage: {
		// When back btn is pressed, entry page (list) should go -100 -> 0, but others should go to 0 -> 100vw
		// Otherwise, the entry page (post) should go from 100, but the list (not back btn)
		// isEntryPage = true
		x: 0,

		transition: ({ isBackBtn }: any) => ({
			type: "tween",
			from: isBackBtn ? "-100vw" : "100vw",
			key: "x",
			duration: 600
		})
	},

	leavingPage: {
		x: ({ isBackBtn }: any) => (isBackBtn ? "100vw" : "-100vw"),

		// isEntryPage = true
		transition: {
			type: "tween",
			duration: 600
		}
	}
});

interface LayoutProps {
	location: Location;
}
export const Layout: React.FC<LayoutProps> = ({ location, children }) => {
	const rootPath = `${__PATH_PREFIX__}/`;

	const isBase = location.pathname === rootPath;
	const isBlogPost = location.pathname.startsWith(`${rootPath}posts`);

	return (
		<ThemeProvider>
			<div className={layoutStyles.horizCenter}>
				<header
					className={layoutStyles.header}
					aria-label={"Toolbar for primary action buttons"}
				>
					{!isBase && (
						<TransitionLink
							className={`${layoutStyles.backBtn} baseBtn`}
							to={`/`}
							aria-label="Go back"
						>
							<BackIcon />
						</TransitionLink>
					)}
					<DarkLightButton />
				</header>
				<TransitionState>
					{(transitionProps: any) => {
						const {
							transitionStatus,
							current: { state: { isBackBtn = false } = {} }
						} = transitionProps;
						return (
							<AnimMainTed
								className={!isBlogPost ? "listViewContent" : "postViewContent"}
								pose={
									!["entering", "entered"].includes(transitionStatus)
										? "leavingPage"
										: "enteringPage"
								}
								posedKey={`${isBackBtn}${transitionStatus}${location.pathname}`}
								isBackBtn={isBackBtn}
							>
								{children}
							</AnimMainTed>
						);
					}}
				</TransitionState>
			</div>
		</ThemeProvider>
	);
};

export const authorFragmentQuery = graphql`
	fragment UnicornInfo on UnicornsJson {
		name
		id
		description
		color
		fields {
			isAuthor
		}
		roles {
			prettyname
			id
		}
		socials {
			twitter
			github
			website
			linkedIn
			twitch
			dribbble
		}
		pronouns {
			they
			them
			their
			theirs
			themselves
		}
		profileImg {
			childImageSharp {
				smallPic: fixed(width: 60) {
					...GatsbyImageSharpFixed
				}
				mediumPic: fixed(width: 85) {
					...GatsbyImageSharpFixed
				}
				bigPic: fixed(width: 300, quality: 100) {
					...GatsbyImageSharpFixed
				}
			}
		}
	}
`;

export const postFragmentQuery = graphql`
	fragment PostInfo on MarkdownRemark {
		id
		excerpt(pruneLength: 160)
		html
		frontmatter {
			title
			published(formatString: "MMMM DD, YYYY")
			edited(formatString: "MMMM DD, YYYY")
			tags
			description
			authors {
				...UnicornInfo
			}
			license {
				licenceType
				footerImg
				explainLink
				name
				displayName
			}
		}
		fields {
			slug
			inlineCount
			headingsWithId {
				value
				slug
				depth
			}
		}
		wordCount {
			words
		}
	}
`;
