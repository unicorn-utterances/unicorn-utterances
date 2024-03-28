// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
require("whatwg-fetch");
require("@testing-library/jest-dom/jest-globals");
import "jest-location-mock";

global.plausible = null;

let history = [];

window.history.pushState = (data, unused, url) => {
	window.location.assign(url);
	history.push(url);
};

window.history.replaceState = (data, unused, url) => {
	window.location.assign(url);
	history[history.length - 1] = url;
};

window.history.back = () => {
	history.pop();
	window.location.assign(history[history.length - 1]);
};

global.IntersectionObserver = class IntersectionObserver {
	constructor() {}

	observe() {
		return null;
	}

	disconnect() {
		return null;
	}

	unobserve() {
		return null;
	}
};

global.React = require("preact");

// https://github.com/jsdom/jsdom/issues/3294
// eslint-disable-next-line no-undef
HTMLDialogElement.prototype.show = jest.fn(function mock() {
	this.open = true;
});

// eslint-disable-next-line no-undef
HTMLDialogElement.prototype.showModal = jest.fn(function mock() {
	this.open = true;
});

// eslint-disable-next-line no-undef
HTMLDialogElement.prototype.close = jest.fn(function mock() {
	this.open = false;
});

const { TextDecoder, TextEncoder } = require("node:util");

// eslint-disable-next-line no-undef
Object.defineProperties(globalThis, {
	TextDecoder: { value: TextDecoder },
	TextEncoder: { value: TextEncoder },
});
