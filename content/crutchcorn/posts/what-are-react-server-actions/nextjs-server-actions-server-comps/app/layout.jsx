export const metadata = {
	title: "Next.js Server Actions Server Comps",
	description:
		"For use in the Next.js Server Actions article on Unicorn Utterances",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
