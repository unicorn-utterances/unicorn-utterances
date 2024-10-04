import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import { debounce } from "utils/debounce";

export function useSearchParams<T>(
	serialize: (params: T) => URLSearchParams,
	deserialize: (params: URLSearchParams) => T,
): [T, (newState: T) => void] {
	const [urlParams, setUrlParams] = useState<URLSearchParams>(
		() => new URL(window.location.href).searchParams,
	);

	const pushHistoryState = useMemo(() => {
		// Debounce any calls to pushState to avoid spamming the history API
		return debounce(
			(urlParams: URLSearchParams) => {
				const currentUrl = new URL(window.location.href).toString();
				const newUrl = new URL(
					"?" + urlParams.toString(),
					window.location.href,
				).toString();

				if (currentUrl != newUrl) {
					window.history.pushState({}, "", newUrl);
				}
			},
			500,
			false,
		);
	}, []);

	useEffect(() => {
		pushHistoryState(urlParams);
	}, [urlParams]);

	useEffect(() => {
		const onPopState = () => {
			// When 'popstate' is sent, the window properties do not immediately reflect the change
			// so we need to wait until the end of the event loop
			setTimeout(() => {
				const searchParams = new URL(window.location.href).searchParams;
				setUrlParams(searchParams);
			}, 0);
		};

		window.addEventListener("popstate", onPopState);
		return () => {
			window.removeEventListener("popstate", onPopState);
		};
	}, [setUrlParams]);

	const params = useMemo(() => deserialize(urlParams), [urlParams]);

	const setParams = useCallback(
		(params: T) => {
			setUrlParams(serialize(params));
		},
		[setUrlParams],
	);

	return [params, setParams];
}
