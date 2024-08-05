/** @jsxRuntime automatic */
import { Node, Element } from "hast";

interface SuperScriptLinkProps {
	superScriptNumber: number;
	href: string;
	linkProps: object;
	children: Node[];
}

/** @jsxImportSource hastscript */
export function SuperScriptLink({
	children,
	superScriptNumber,
	href,
	linkProps,
}: SuperScriptLinkProps): Element {
	return (
		<a {...linkProps} href={href}>
			{children}
			<sup>{superScriptNumber}</sup>
		</a>
	) as never;
}
