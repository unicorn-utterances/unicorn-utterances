export const metadata = {
	title: "Next.js Async Components",
	description: "For use in the Next.js Suspense article on Playful Programming",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
