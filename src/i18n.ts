import {init, register, locale, getLocaleFromNavigator} from 'svelte-i18n'
import type {Readable} from 'svelte/store'
import {get as getStore} from 'svelte/store'
import {setQuery} from './utils/url_handler'

export enum Lang {
	DE = 'de',
	EN = 'en',
}

const langMap: { [key: string]: Lang } = {
	'en': Lang.EN,
	'en-us': Lang.EN,
	'en-gb': Lang.EN,
	'de': Lang.DE,
	'de-de': Lang.DE,
	// 'ru': 'ru',
}
export const LanguageList: Array<Lang> = [Lang.EN, Lang.DE]
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

const LOC_STORE_ID = 'DaSh_x097_locale'

class _i18n implements Readable<string> {
	public readonly subscribe = locale.subscribe

	private _syncLocalStore(state: string): void {
		if (localStorage) {
			localStorage.setItem(LOC_STORE_ID, state)
		}
	}

	private _readLocalStore(): string|null {
		if (localStorage) {
			return localStorage.getItem(LOC_STORE_ID)
		}
		return null
	}

	constructor() {
		for (const lang of Object.keys(langMap)) {
			register(lang, async ()=> {
				const resp = await fetch(`/lang/${langMap[lang]}.json`)
				return await resp.json()
			})
		}
		const locStore = this._readLocalStore()
		if (locStore === null) {
			this._syncLocalStore(getStore(this))
		}
		init({
			fallbackLocale: 'de',
			initialLocale: locStore || langMap[getLocaleFromNavigator()],
		})
		const navLocale = (
			langMap[getLocaleFromNavigator().toLowerCase()] ||
			locStore
		)
		this.switch(navLocale as Lang)
	}

	public switch(lang: Lang): void {
		if (!LanguageList.includes(lang) && typeof langMap[lang] !== 'string') {
			throw new Error('invalid language to switch to')
		}
		document.documentElement.setAttribute('lang', lang)
		locale.set(lang)
		setQuery(
			'locale', getStore(locale),
			window.history?.state, window.history?.state?.title, true,
		)
		this._syncLocalStore(lang)
	}
}

export const i18n = new _i18n
