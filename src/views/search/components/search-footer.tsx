import { useEffect, useState } from "preact/hooks";
import style from "./search-footer.module.scss";

interface Props {
	duration: number;
}

function useDarkMode() {
	const [isDarkTheme, setIsDarkTheme] = useState(
		() => document.documentElement.classList.contains("dark")
	);

	const handleMutation = () => {
		setIsDarkTheme(
			document.documentElement.classList.contains("dark")
		);
	};

	useEffect(() => {
		const observer = new MutationObserver(handleMutation);
		observer.observe(document.documentElement, { attributes: true });
		return () => observer.disconnect();
	}, []);

	return { isDarkTheme };
}

export function SearchFooter(props: Props) {
	const { isDarkTheme } = useDarkMode();
	const oramaSrc = isDarkTheme ? "/sponsors/orama-light.svg" : "/sponsors/orama-dark.svg";
	return (
		<div class={style.footer}>
			<a href="https://orama.com/" target="_blank" class={style.orama}>
				Searched by
				<img src={oramaSrc} alt="Orama" style={{ height: "2em" }} class={style.orama__logo} />
				in
				<span class={style.orama__duration}>{props.duration}ms</span>
			</a>
		</div>
	)
}
