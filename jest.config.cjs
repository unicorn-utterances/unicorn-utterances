const { resolve } = require("path");
require('whatwg-fetch');

// Add any custom config to be passed to Jest
module.exports = {
	testEnvironment: "jsdom",
	setupFilesAfterEnv: ["<rootDir>/__mocks__/jest.setup.js"],
	watchPlugins: [
		"jest-watch-typeahead/filename",
		"jest-watch-typeahead/testname",
	],
	collectCoverageFrom: [
		"**/*.{js,jsx,ts,tsx}",
		"!**/*.d.ts",
		"!**/node_modules/**",
	],
	transform: {
		"^.+\\.(js|jsx|ts|tsx)?$": [
			"esbuild-jest",
			{
				sourcemap: true,
			},
		],
	},
	transformIgnorePatterns: [
		// ...your ignore patterns
		"^((?!node_modules).)*node_modules.((?!preact|unified|unist|hast|rehype|remark|mdast|micromark|retext|nlcst|rehype|decode-named-character-reference|character-entities|zwitch|longest-streak|unherit|parse-|strip-|html-void-elements|stringify-entities|ccount|markdown-|slash|vfile|property-|space-separated-|comma-separated-|web-namespaces|junk).)*$",
		"^.+\\.module\\.(css|sass|scss)$",
	],
	// moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
	moduleNameMapper: {
		"^msw/node$": require.resolve("msw/node"),
		"^@mswjs/interceptors/ClientRequest$": require.resolve("@mswjs/interceptors/ClientRequest"),
		"^preact$": require.resolve("preact"),
		"^react(-dom)?$": require.resolve("preact/compat"),
		"^@testing-library\\/preact$": require.resolve("@testing-library/preact"),
		// NextJS
		// Handle CSS imports (with CSS modules)
		// https://jestjs.io/docs/webpack#mocking-css-modules
		"^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",
		// Handle module aliases
		"^@/components/(.*)$": "<rootDir>/components/$1",
		// UU Files
		".+\\.(css|styl|less|sass|scss)$": `identity-obj-proxy`,
		".+\\.svg$": `<rootDir>/__mocks__/imports/svg-comp-mock.ts`,
		".+\\.svg\\?raw$": `<rootDir>/__mocks__/imports/svg-raw-mock.ts`,
		".+\\.(jpg|svg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)(?:\\?.+)?$": `<rootDir>/__mocks__/file-mock.ts`,
		// UU TS
		"^__mocks__/(.*)$": resolve(__dirname, "./__mocks__/$1"),
		"^src/(.*)$": resolve(__dirname, "./src/$1"),
		"^constants/(.*)$": resolve(__dirname, "./src/constants/$1"),
		"^types/(.*)$": resolve(__dirname, "./src/types/$1"),
		"^components/(.*)$": resolve(__dirname, "./src/components/$1"),
		"^utils/(.*)$": resolve(__dirname, "./src/utils/$1"),
		"^uu-types$": resolve(__dirname, "./src/types"),
		"^uu-utils$": resolve(__dirname, "./src/utils"),
		"^uu-constants$": resolve(__dirname, "./src/constants"),
		"^assets/(.*)": resolve(__dirname, "./src/assets/$1"),
	},
};
