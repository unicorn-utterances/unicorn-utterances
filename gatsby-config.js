const { SeriesToC } = require("./src/components/series-toc");

let CONSTS = require("./config/gatsby-config-consts");
if (!CONSTS) CONSTS = {};

module.exports = {
	siteMetadata: {
		title: `Unicorn Utterances`,
		description: `Learning programming from magically majestic words. A place to learn about all sorts of programming topics from entry-level concepts to advanced abstractions`,
		siteUrl: `https://unicorn-utterances.com/`,
		disqusShortname: "unicorn-utterances",
		repoPath: "unicorn-utterances/unicorn-utterances",
		relativeToPosts: "/content/blog",
		keywords:
			"programming,development,mobile,web,game,utterances,software engineering,javascript,angular,react,computer science"
	},
	plugins: [
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				path: `${__dirname}/content/blog`,
				name: `blog`
			}
		},
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				path: `${__dirname}/src/assets`,
				name: `assets`
			}
		},
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				path: `${__dirname}/content/site`,
				name: `sitecontent`
			}
		},
		`gatsby-transformer-json`,
		`gatsby-plugin-typescript`,
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				path: `./content/data`
			}
		},
		{
			resolve: "gatsby-plugin-web-font-loader",
			options: {
				google: {
					families: [
						`Work Sans:400,500,600,700`,
						`Archivo:400,500,600`,
						`Roboto Mono:400`
					]
				}
			}
		},
		{
			resolve: `gatsby-transformer-remark`,
			options: {
				plugins: [
					{
						resolve: `gatsby-remark-images`,
						options: {
							maxWidth: 590,
							linkImagesToOriginal: false
						}
					},
					{
						resolve: "gatsby-remark-video",
						options: {
							width: "100%",
							height: "auto",
							preload: "auto",
							muted: true,
							autoplay: true,
							controls: true,
							loop: true
						}
					},
					{
						resolve: `gatsby-remark-images-medium-zoom`,
						options: {
							includedSelector: '[src$=".svg"]'
						}
					},
					{
						resolve: `gatsby-remark-responsive-iframe`,
						options: {
							wrapperStyle: `margin-bottom: 1.0725rem`
						}
					},
					{
						resolve: `gatsby-remark-autolink-headers`,
						options: {
							offsetY: `100`,
							icon: `<svg width="20" height="20" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.10021 27.8995C6.14759 25.9469 6.14759 22.7811 8.10021 20.8284L12.6964 16.2322C14.4538 14.4749 17.303 14.4749 19.0604 16.2322L20.121 17.2929C20.7068 17.8787 21.6566 17.8787 22.2423 17.2929C22.8281 16.7071 22.8281 15.7574 22.2423 15.1716L21.1817 14.1109C18.2528 11.182 13.504 11.182 10.5751 14.1109L5.97889 18.7071C2.85469 21.8313 2.85469 26.8966 5.97889 30.0208C9.10308 33.145 14.1684 33.145 17.2926 30.0208L18.3533 28.9602C18.939 28.3744 18.939 27.4246 18.3533 26.8388C17.7675 26.2531 16.8177 26.2531 16.2319 26.8388L15.1713 27.8995C13.2187 29.8521 10.0528 29.8521 8.10021 27.8995Z" fill="#153E67"/><path d="M27.8992 8.10051C29.8518 10.0531 29.8518 13.219 27.8992 15.1716L23.303 19.7678C21.5456 21.5251 18.6964 21.5251 16.939 19.7678L15.8784 18.7071C15.2926 18.1213 14.3428 18.1213 13.7571 18.7071C13.1713 19.2929 13.1713 20.2426 13.7571 20.8284L14.8177 21.8891C17.7467 24.818 22.4954 24.818 25.4243 21.8891L30.0205 17.2929C33.1447 14.1687 33.1447 9.10339 30.0205 5.97919C26.8963 2.855 21.831 2.855 18.7068 5.97919L17.6461 7.03985C17.0604 7.62564 17.0604 8.57539 17.6461 9.16117C18.2319 9.74696 19.1817 9.74696 19.7675 9.16117L20.8281 8.10051C22.7808 6.14789 25.9466 6.14789 27.8992 8.10051Z" fill="#153E67"/></svg>`,
							maintainCase: true,
							removeAccents: true,
							enableCustomId: true
						}
					},
					{
						resolve: `gatsby-remark-prismjs`,
						options: {
							aliases: {
								gradle: "groovy" //prismjs doesn't support gradle yet, so aliasing it to groovy provides at least some highlighting
							}
						}
					},
					`gatsby-remark-copy-linked-files`,
					`gatsby-remark-external-links`,
					{
						resolve: "gatsby-remark-series",
						options: {
							render: {
								// The location where the toc should be rendered.
								placeholder: "top",
								template: SeriesToC
							},
							resolvers: {
								slug: markdownNode => `/posts${markdownNode.fields.slug}`,
								date: markdownNode => markdownNode.frontmatter.published,
								draft: () => false
							}
						}
					}
				]
			}
		},
		`count-inline-code`,
		`remarked-autolink-headers-and-add-id`,
		`gatsby-transformer-sharp`,
		`gatsby-plugin-sharp`,
		{
			resolve: `gatsby-plugin-google-analytics`,
			options: {
				trackingId: CONSTS.googleAnalytics || "",
				head: false,
				respectDNT: true
			}
		},
		{
			resolve: `gatsby-plugin-feed`,
			options: {
				query: `
					{
						site {
							siteMetadata {
								title
								description
								siteUrl
								site_url: siteUrl
							}
						}
					}
				`,
				feeds: [
					{
						serialize: ({ query: { site, allMarkdownRemark } }) => {
							const siteUrl = site.siteMetadata.siteUrl;
							return allMarkdownRemark.edges.map(edge => {
								const slug = edge.node.fields.slug;
								const { frontmatter } = edge.node;
								const nodeUrl = `${siteUrl}/posts${slug}`;
								return {
									description: frontmatter.description || edge.node.excerpt,
									date: frontmatter.published,
									title: frontmatter.title,
									url: nodeUrl,
									guid: nodeUrl,
									custom_elements: [
										/**
										 * We chose `dc:creator` in order to avoid having
										 * to list contact information from our contributors,
										 * as `dc:creator`
										 *
										 * FIXME: This does not have the functionality we'd expect
										 *  it only lists the last author's name
										 *
										 * @see https://github.com/dylang/node-rss/issues/92
										 */
										{
											"dc:creator": frontmatter.authors.map(
												author => author.name
											)
										},
										{ comments: `${nodeUrl}#disqus_thread` }
									]
								};
							});
						},
						query: `
							{
								allMarkdownRemark(
									sort: { order: DESC, fields: [frontmatter___published] },
									filter: {fileAbsolutePath: {regex: "/content/blog/"}}
								) {
									edges {
										node {
											excerpt
											html
											fields { slug }
											frontmatter {
												title
												description
												published
												authors {
													name
												}
											}
										}
									}
								}
							}
						`,
						output: "/rss.xml",
						title: "Unicorn Utterances's RSS Feed"
					}
				]
			}
		},
		{
			resolve: `gatsby-plugin-manifest`,
			options: {
				name: `Unicorn Utterances`,
				short_name: `Unicorn Utterances`,
				start_url: `/`,
				background_color: `#ffffff`,
				theme_color: `#127db3`,
				display: `minimal-ui`,
				icon: `src/assets/unicorn_utterances_logo_512.png`
			}
		},
		{
			resolve: `gatsby-plugin-offline`,
			options: {
				workboxConfig: {
					runtimeCaching: [
						// Some as-is options from default config, explictly stated to avoid regressions from issues with `_.merge`ing into the default
						{
							// DEFAULT - Use cacheFirst since these don't need to be revalidated (same RegExp
							// and same reason as above)
							urlPattern: /(\.js$|\.css$|static\/)/,
							handler: `CacheFirst`
						},
						{
							// MODIFIED - page-data.json files are not content hashed
							urlPattern: /^https?:.*\/page-data\/.*\/page-data\.json/,
							handler: `NetworkFirst`
						},
						{
							// MODIFIED - app-data.json is not content hashed
							urlPattern: /^https?:.*\/page-data\/app-data\.json/,
							handler: `NetworkFirst`
						},
						{
							// DEFAULT - Add runtime caching of various other page resources
							urlPattern: /^https?:.*\.(png|jpg|jpeg|webp|svg|gif|tiff|js|woff|woff2|json|css)$/,
							handler: `StaleWhileRevalidate`
						},
						{
							// DEFAULT - Google Fonts CSS (doesn't end in .css so we need to specify it)
							urlPattern: /^https?:\/\/fonts\.googleapis\.com\/css/,
							handler: `StaleWhileRevalidate`
						}
					]
				}
			}
		},
		`gatsby-plugin-react-helmet`,
		{
			resolve: "gatsby-plugin-react-svg",
			options: {
				rule: {
					include: /(?:\/src\/assets\/icons\/|\\src\\assets\\icons\\).*\.svg$/
				}
			}
		},
		`gatsby-plugin-sass`,
		{
			resolve: `gatsby-plugin-lunr`,
			options: {
				languages: [
					{
						name: "en",
						// A function for filtering nodes. () => true by default
						filterNodes: node =>
							!!node.frontmatter && !!node.frontmatter.authors
					}
				],
				// Fields to index. If store === true value will be stored in index file.
				// Attributes for custom indexing logic. See https://lunrjs.com/docs/lunr.Builder.html for details
				fields: [
					{
						name: "title",
						store: true,
						attributes: { boost: 20 }
					},
					{ name: "excerpt" },
					{ name: "description" },
					{
						name: "slug",
						store: true
					},
					{ name: "authors" },
					{ name: "tags" }
				],
				// How to resolve each field's value for a supported node type
				resolvers: {
					// For any node of type MarkdownRemark, list how to resolve the fields' values
					MarkdownRemark: {
						title: node => node.frontmatter.title,
						excerpt: node => node.excerpt,
						description: node => node.frontmatter.description,
						slug: node => node.fields.slug,
						/**
						 * FIXME: This does not work the way we'd want. We want the name
						 *  the author rather than the username, but the node is not
						 *  populated
						 *
						 * @see https://github.com/humanseelabs/gatsby-plugin-lunr/issues/24
						 */
						authors: node => node.frontmatter.authors.join(", "),
						tags: node => node.frontmatter.tags
					}
				},
				//custom index file name, default is search_index.json
				filename: "search_index.json",
				//custom options on fetch api call for search_ındex.json
				fetchOptions: {
					credentials: "same-origin"
				}
			}
		},
		`gatsby-plugin-sitemap`,
		{
			resolve: "gatsby-plugin-robots-txt",
			options: {
				resolveEnv: () => process.env.GITHUB_REF,
				env: {
					"refs/heads/integration": {
						host: "https://beta.unicorn-utterances.com/sitemap.xml",
						sitemap: "https://beta.unicorn-utterances.com/sitemap.xml",
						policy: [
							{
								userAgent: "*",
								disallow: ["/"]
							}
						]
					},
					"refs/heads/master": {
						host: "https://unicorn-utterances.com/sitemap.xml",
						sitemap: `https://unicorn-utterances.com/sitemap.xml`,
						policy: [
							{
								userAgent: "*",
								allow: "/"
							}
						]
					}
				}
			}
		},
		`gatsby-plugin-transition-link`
	],
	mapping: {
		"MarkdownRemark.frontmatter.authors": `UnicornsJson`,
		"MarkdownRemark.frontmatter.license": `LicensesJson`,
		"UnicornsJson.pronouns": `PronounsJson`,
		"UnicornsJson.roles": `RolesJson`
	}
};
