/**
 * This allows items like cards to bind a click event to navigate to a path.
 *
 * Handles:
 * - Left clicks
 * - Middle clicks
 * - Ctrl + Left clicks
 * - Shift + Left clicks
 * - Meta + Left clicks
 *
 *
 * Ignores:
 * - Right clicks (used for context menus)
 * - Alt clicks (used for downloading)
 * - Default prevented events
 * - Elements with [data-dont-bind-navigate-click]
 * - <a> tags and <button>s
 */
function isNestedElement(e: MouseEvent) {
	// if the targeted element is nested inside another clickable anchor/button
	let target = e.target as HTMLElement;
	while (target !== e.currentTarget) {
		if (
			target.tagName.toLowerCase() === "a" ||
			target.tagName.toLowerCase() === "button"
		)
			return true;

		// Explicitly don't bind
		if (target.getAttribute("data-dont-bind-navigate-click") !== null)
			return true;

		target = target.parentElement;
	}
	return false;
}

const handleHrefContainerMouseDown = (e: MouseEvent) => {
	const isMiddleClick = e.button === 1;
	if (!isMiddleClick) return;
	if (e.defaultPrevented) return;
	if (isNestedElement(e)) return;
	e.preventDefault();
};

// implement the AuxClick event using MouseUp (only on browsers that don't support auxclick; i.e. safari)
const handleHrefContainerMouseUp = (e: MouseEvent) => {
	// if auxclick is supported, do nothing
	if ("onauxclick" in e.currentTarget) return;
	// otherwise, pass mouseup events to auxclick
	handleHrefContainerAuxClick(e);
};

// Handle middle click button - should open a new tab (cannot be detected via "click" event)
// - prefer the "auxclick" event for this, since it ensures that mousedown/mouseup both occur within the same element
//   otherwise, using "mouseup" would activate on mouseup even when dragging between elements, which should not trigger a click
const handleHrefContainerAuxClick = (e: MouseEvent) => {
	const href = (e.currentTarget as HTMLElement).dataset.href;

	// only handle middle click events
	if (e.button !== 1) return;

	if (e.defaultPrevented) return;
	if (isNestedElement(e)) return;

	e.preventDefault();
	window.open(href, "_blank");
	return false;
};

const handleHrefContainerClick = (e: MouseEvent) => {
	const href = (e.currentTarget as HTMLElement).dataset.href;

	if (e.defaultPrevented) return;
	if (isNestedElement(e)) return;

	// only handle left click events
	if (e.button !== 0) return;
	// Download
	if (e.altKey) return;

	e.preventDefault();

	// Open in new tab
	if (e.metaKey || e.ctrlKey || e.shiftKey) {
		window.open(href, "_blank");
		return false;
	}

	// If text is selected, don't activate on mouseup (but ctrl+click should still work)
	const selection = window.getSelection();
	if (
		selection?.toString()?.length &&
		selection.containsNode(e.target as Node, true)
	)
		return;

	window.location.href = href;
};

export function enableHrefContainers() {
	document.querySelectorAll<HTMLElement>("[data-href]").forEach((el) => {
		el.addEventListener("mousedown", handleHrefContainerMouseDown);
		el.addEventListener("mouseup", handleHrefContainerMouseUp);
		el.addEventListener("auxclick", handleHrefContainerAuxClick);
		el.addEventListener("click", handleHrefContainerClick);
	});
}

export function getHrefContainerProps(href: string) {
	// If the href is null or empty, no props should be added
	if (!href) return {};

	// hack to detect whether the function is in an Astro or Preact environment,
	// assuming that Preact is only used outside of a node environment
	if (
		typeof process !== "undefined" &&
		typeof process?.versions !== "undefined" &&
		process.versions?.node
	) {
		// if running in NodeJS (Astro), return string props
		return {
			"data-href": href,
		};
	} else {
		// otherwise, need to return client-side functions
		return {
			onMouseDown: handleHrefContainerMouseDown,
			onMouseUp: handleHrefContainerMouseUp,
			onAuxClick: handleHrefContainerAuxClick,
			onClick: handleHrefContainerClick,
			"data-href": href,
		};
	}
}
