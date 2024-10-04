import { Inputs, useCallback, useEffect, useRef, useState } from "preact/hooks";

export function useDebouncedValue<T>(value: T, delay: number) {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	const immediatelySetDebouncedValue = setDebouncedValue;

	return [debouncedValue, immediatelySetDebouncedValue] as const;
}

export function useDebouncedCallback<T extends Function>(
	callback: T,
	delay: number,
	inputs: Inputs,
) {
	const cb = useCallback(callback, inputs);

	const handler = useRef<NodeJS.Timeout>();

	const cancel = useCallback(() => {
		handler.current && clearTimeout(handler.current);
	}, [handler]);

	const invoke = useCallback(
		(...args: unknown[]) => {
			cancel();
			handler.current = setTimeout(() => {
				callback(...args);
			}, delay);
		},
		[cb],
	);

	return {
		callback: invoke as never as T,
		cancel,
	};
}
