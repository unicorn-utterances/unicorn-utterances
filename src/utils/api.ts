import { CollectionInfo, PostInfo, RolesInfo, UnicornInfo } from "types/index";
import { Languages } from "types/index";
import { roles, unicorns, posts, collections } from "./data";
import { isDefined } from "./is-defined";

function compareByDate(date1: string, date2: string): number {
	return new Date(date1) > new Date(date2) ? -1 : 1;
}

function compareByPublished<T extends { published: string }>(
	obj1: T,
	obj2: T,
): number {
	return compareByDate(obj1.published, obj2.published);
}

export function getAllPosts(): PostInfo[] {
	return [...posts.values()].flatMap((locales) => locales);
}

export function getAllCollections(): CollectionInfo[] {
	return [...collections.values()].flatMap((locales) => locales);
}

export function getUnicornById(
	id: string,
	language: Languages,
): UnicornInfo | undefined {
	const locales = unicorns.get(id);
	if (!locales) return undefined;
	return locales.find((u) => u.locale === language) || locales[0];
}

export function getUnicornsByLang(language: Languages): UnicornInfo[] {
	return [...unicorns.values()]
		.map((locales) => locales.find((p) => p.locale === language) || locales[0])
		.filter(isDefined);
}

export function getPostBySlug(
	slug: string,
	language: Languages,
): PostInfo | undefined {
	const locales = posts.get(slug) || [];
	return locales.find((p) => p.locale === language) || locales[0];
}

export function getPostsByLang(language: Languages): PostInfo[] {
	return [...posts.values()]
		.map((locales) => locales.find((p) => p.locale === language) || locales[0])
		.filter(isDefined)
		.filter((p) => !p.noindex)
		.sort(compareByPublished);
}

export function getPostsByCollection(
	collectionSlug: string,
	language: Languages,
): PostInfo[] {
	return [...posts.values()]
		.map((locales) => locales.find((p) => p.locale === language) || locales[0])
		.filter((p) => p?.collection === collectionSlug)
		.filter((p) => !p.noindex)
		.sort((postA, postB) =>
			Number(postA.order) > Number(postB.order) ? 1 : -1,
		);
}

export function getPostsByUnicorn(
	unicornId: string,
	language: Languages,
): PostInfo[] {
	return [...posts.values()]
		.map((locales) => locales.find((p) => p.locale === language) || locales[0])
		.filter(isDefined)
		.filter((p) => p.authors.includes(unicornId))
		.filter((p) => !p.noindex)
		.sort(compareByPublished);
}

export function getCollectionBySlug(
	slug: string,
	language: Languages,
): CollectionInfo | undefined {
	const locales = collections.get(slug) || [];
	return locales.find((c) => c.locale === language) || locales[0];
}

export function getCollectionsByLang(language: Languages): CollectionInfo[] {
	return [...collections.values()]
		.map((locales) => locales.find((p) => p.locale === language) || locales[0])
		.filter(isDefined)
		.sort(compareByPublished);
}

export function getCollectionsByUnicorn(
	unicornId: string,
	language: Languages,
): CollectionInfo[] {
	return [...collections.values()]
		.map((locales) => locales.find((p) => p.locale === language) || locales[0])
		.filter(isDefined)
		.filter((c) => c.authors.includes(unicornId))
		.sort(compareByPublished);
}

export function getRoleById(
	roleId: string,
	language: Languages,
): RolesInfo | undefined {
	// TODO: support role name translations
	return roles.find((r) => r.id === roleId);
}
