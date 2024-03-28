import { v4 as uuidv4 } from "uuid";
import { useMemo } from "preact/hooks";

/**
 * Provides a replacement for preact's `useId()` which can be used
 * as a unique identifier for an element.
 *
 * Preact's implementation will return duplicate IDs in Astro:
 * https://github.com/preactjs/preact/issues/3781
 */
export function useRandomId() {
	return "U" + useUUID().replace(/\-/g, "");
}

/**
 * Returns a uuidv4() that is persisted in a useMemo.
 */
export function useUUID() {
	return useMemo(() => {
		return uuidv4();
	}, []);
}
