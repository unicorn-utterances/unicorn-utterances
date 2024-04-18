const LOCAL_STORAGE_KEY = "tabs-selection";

type TabEntry = Map<
	string,
	{
		tab: HTMLElement;
		panel: HTMLElement;
	}
>;

export const enableTabs = () => {
	// Array of all TabName->Element mappings in tab sets
	const tabEntries: TabEntry[] = [];

	// If overflow-anchor cannot be applied, tabs should scroll into view when clicked
	//   to prevent confusing content jumps
	const shouldScrollToTab = !(
		CSS.supports && CSS.supports("overflow-anchor", "none")
	);

	// Handle arrow navigation between tabs in the tab list
	function handleKeydown(this: HTMLElement, e: KeyboardEvent) {
		if (e.keyCode === 39 || e.keyCode === 37) {
			const tabs = this.children;
			let tabfocus = Number(this.dataset.tabfocus || 0);
			tabs[tabfocus].setAttribute("tabindex", "-1");
			if (e.keyCode === 39) {
				// Move right
				// Increase tab index, wrap by # of tabs
				tabfocus = (tabfocus + 1) % tabs.length;
			} else if (e.keyCode === 37) {
				// Move left
				tabfocus--;
				// If we're at the start, move to the end
				if (tabfocus < 0) {
					tabfocus = tabs.length - 1;
				}
			}

			// Update tabfocus values
			this.dataset.tabfocus = tabfocus + "";
			// Focus + click selected tab
			const tab = tabs[tabfocus] as HTMLElement;
			tab.setAttribute("tabindex", "0");
			tab.focus();
			tab.click();

			// Redundant: Scroll handled by `handleClick` on `tab.click()`
			// setTimeout(() => {
			// 	tab.scrollIntoView &&
			// 		tab.scrollIntoView({
			// 			behavior: "auto",
			// 			block: "center",
			// 			inline: "center",
			// 		});
			// }, 0);
		}
	}

	function handleClick(e: Event) {
		const target = e.target as HTMLElement;
		const tabName = target.dataset.tabname;
		if (!tabName) return;

		const offsetBeforeChangeTabs = target.offsetTop - window.scrollY;

		changeTabs(tabName);

		if (shouldScrollToTab) {
			// Scroll onto screen in order to avoid jumping page locations
			setTimeout(() => {
				window.scroll(0, target.offsetTop - offsetBeforeChangeTabs);
			}, 0);
		}
	}

	// Iterate through all tabs to populate tabEntries & set listeners
	document
		.querySelectorAll<HTMLElement>('[role="tablist"]')
		.forEach((tabList) => {
			const entry: TabEntry = new Map();
			const parent = tabList.parentElement!;

			const tabs: NodeListOf<HTMLElement> =
				tabList.querySelectorAll('[role="tab"]');

			tabs.forEach((tab) => {
				const panel = parent.querySelector<HTMLElement>(
					`#${tab.getAttribute("aria-controls")}`,
				)!;
				entry.set(tab.dataset.tabname!, {
					tab,
					panel,
				});

				// Add a click event handler to each tab
				tab.addEventListener("click", handleClick);
			});

			// Enable arrow navigation between tabs in the tab list
			tabList.addEventListener("keydown", handleKeydown);

			tabEntries.push(entry);
		});

	function changeTabs(tabName: string) {
		// find all tabs on the page that match the selected tabname
		for (const tabEntry of tabEntries) {
			const tab = tabEntry.get(tabName);
			if (!tab) continue;

			// Set all encountered tabs as selected
			tab.tab.setAttribute("aria-selected", "true");
			// Show the selected panel
			tab.panel.removeAttribute("aria-hidden");

			// Iterate through sibling tabs
			for (const [otherKey, otherTab] of tabEntry) {
				if (otherKey === tabName) continue;

				// Set all sibling tabs as unselected
				otherTab.tab.setAttribute("aria-selected", "false");
				// Hide sibling tab panels
				otherTab.panel.setAttribute("aria-hidden", `true`);
			}
		}

		localStorage.setItem(LOCAL_STORAGE_KEY, tabName);
	}

	/* -------------------- */

	// If the user has already visited a tab name, enable it on load
	const currentTab = localStorage.getItem(LOCAL_STORAGE_KEY);
	if (currentTab) {
		changeTabs(currentTab);
	}

	// If user has linked to a heading that's inside of a tab
	const hash = window.location.hash;
	if (!hash) return;
	const heading = document.getElementById(hash.slice(1));
	if (!heading) return;

	for (const tabEntry of tabEntries)
		for (const [, tab] of tabEntry) {
			// If the tab is hidden and the heading is contained within the tab
			if (
				tab.panel.hasAttribute("aria-hidden") &&
				tab.panel.contains(heading)
			) {
				tab.tab.click();
				setTimeout(() => {
					heading.scrollIntoView(true);
				}, 0);
				return;
			}
		}
};
