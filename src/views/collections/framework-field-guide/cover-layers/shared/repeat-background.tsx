import { JSX } from "preact";
import {
	useCallback,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "preact/hooks";

interface RepeatBackgroundProps {
	svg: string;
	fallbackStyle?: Omit<JSX.HTMLAttributes<HTMLElement>["style"], string>;
	javascriptEnabledStyle?: Omit<
		JSX.HTMLAttributes<HTMLElement>["style"],
		string
	>;
	aspectRatio: string;
}

export const RepeatBackground = ({
	svg,
	fallbackStyle = {},
	javascriptEnabledStyle = {},
	aspectRatio,
}: RepeatBackgroundProps) => {
	const [repeat, setRepeat] = useState(1);
	const [hasSet, setHasSet] = useState(false);

	const elRef = useRef<HTMLDivElement>();

	const checkEl = useCallback((el: HTMLDivElement | undefined) => {
		if (hasSet || !el) return;
		setHasSet(true);
		const repeatLocal = Math.ceil(
			window.innerWidth / el.getBoundingClientRect().width,
		);
		setRepeat(repeatLocal);
	}, []);

	useLayoutEffect(() => {
		const fn = () => checkEl(elRef.current);
		window.addEventListener("resize", fn);
		fn();
		return () => window.removeEventListener("resize", fn);
	}, [checkEl]);

	const arraySizeOfRepeat = useMemo(() => {
		return Array.from({ length: repeat }, (_, i) => i);
	}, [repeat]);

	const [isClient, setIsClient] = useState(false);

	useLayoutEffect(() => {
		setIsClient(true);
	}, []);

	// Client-only
	if (isClient) {
		return (
			<div
				class="repeat-background-container"
				style={{
					"--svgAspectRatio": aspectRatio,
					...javascriptEnabledStyle,
				}}
			>
				{arraySizeOfRepeat.map((_) => (
					<div
						aria-hidden={true}
						style={{ marginLeft: -1 }}
						class="repeat-background-svg-container"
						ref={(el) => {
							if (!el) return;
							checkEl(el);
							elRef.current = el;
						}}
						dangerouslySetInnerHTML={{ __html: svg }}
					></div>
				))}
			</div>
		);
	}

	return (
		<div
			style={{
				backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
				width: "100%",
				backgroundPosition: "center center",
				backgroundRepeat: "repeat no-repeat",
				height: "100%",
				backgroundSize: "auto 100%",
				...fallbackStyle,
			}}
		/>
	);
};
