import {init, register, locale, getLocaleFromNavigator} from 'svelte-i18n'
import type {Readable, Writable} from 'svelte/store'
import {derived, writable} from 'svelte/store'
import {getQuery, removeQuery, setQuery} from './utils/url_handler'

export enum Language {DE = 'de', EN = 'en'}

const langMap: {[key: string]: Language} = {
	'en': Language.EN,
	'en-us': Language.EN,
	'en-gb': Language.EN,
	'de': Language.DE,
	'de-de': Language.DE,
	// 'ru': 'ru',
}
export const LanguageList: Array<Language> = [
	Language.EN, Language.DE,
]
export const LanguageName = {
	en: 'EN',
	de: 'DE',
	// ru: 'Русский',
}
export const LanguageFullName = {
	en: 'English',
	de: 'Deutsch',
	// ru: 'Русский',
}
export const DefaultLanguage = LanguageList[0]

const LOC_STORE_ID = 'danielsharkov_com_lang'

class _i18n implements Readable<Language> {
	#store = writable<Language>()
	public readonly subscribe = this.#store.subscribe

	private _syncLocalStore(state: Language): void {
		if (localStorage) {
			localStorage.setItem(LOC_STORE_ID, state)
		}
	}

	private _readLocalStore(): Language|null {
		if (localStorage) {
			return localStorage.getItem(LOC_STORE_ID) as Language
		}
		return null
	}

	constructor() {
		for (const l of Object.keys(langMap)) {
			register(l, async ()=> {
				const resp = await fetch(`lang/${langMap[l]}.json`)
				return await resp.json()
			})
		}
		let locStore = this._readLocalStore()
		if (locStore === null) {
			locStore = getQuery('lang') as Language
		}

		init({fallbackLocale: 'en'})

		const navLanguage = (
			locStore ||
			langMap[getLocaleFromNavigator().toLowerCase()] ||
			getLocaleFromNavigator().toLowerCase()
		)
		this.switch(navLanguage as Language)
	}

	public switch(l: Language): void {
		if (!LanguageList.includes(l) && langMap[l]) {
			l = langMap[l]
		}
		this.#store.set(l)
		locale.set(l)
		document.documentElement.setAttribute('lang', l)

		if (!localStorage && LanguageList.includes(l)) {
			setQuery(
				'lang', l,
				window.history?.state, window.history?.state?.title, true,
			)
		} else {
			removeQuery('lang')
		}

		this._syncLocalStore(l)
	}
}

export const i18n = new _i18n

export const isInvalidLanguage = derived(
	i18n, (s)=> LanguageList.indexOf(s) === -1,
)
