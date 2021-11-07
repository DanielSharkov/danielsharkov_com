import {init, register, locale, getLocaleFromNavigator} from 'svelte-i18n'
import {derived, Readable, writable, get as getStore, Writable} from 'svelte/store'
import {getQuery, removeQuery, setQuery} from './utils/url_handler'

export enum Locale {
	DE = 'de',
	EN = 'en',
}

const localeMap: { [key: string]: Locale } = {
	'en': Locale.EN,
	'en-us': Locale.EN,
	'en-gb': Locale.EN,
	'de': Locale.DE,
	'de-de': Locale.DE,
	// 'ru': 'ru',
}
export const LocaleList: Array<Locale> = [Locale.EN, Locale.DE]
export const LocaleName = {
	en: 'EN',
	de: 'DE',
	// ru: 'Русский',
}
export const LocaleFullName = {
	en: 'English',
	de: 'Deutsch',
	// ru: 'Русский',
}
export const DefaultLocale = LocaleList[0]

const LOC_STORE_ID = 'DaSh_x097_locale'

class _i18n implements Readable<Locale> {
	#store: Writable<Locale> = writable()
	public readonly subscribe = this.#store.subscribe

	private _syncLocalStore(state: Locale): void {
		if (localStorage) {
			localStorage.setItem(LOC_STORE_ID, state)
		}
	}

	private _readLocalStore(): Locale|null {
		if (localStorage) {
			return localStorage.getItem(LOC_STORE_ID) as Locale
		}
		return null
	}

	constructor() {
		for (const l of Object.keys(localeMap)) {
			register(l, async ()=> {
				const resp = await fetch(`locale/${localeMap[l]}.json`)
				return await resp.json()
			})
		}
		let locStore = this._readLocalStore()
		if (locStore === null) {
			locStore = getQuery('locale') as Locale
		}

		init({fallbackLocale: 'en'})

		const navLocale = (
			locStore ||
			localeMap[getLocaleFromNavigator().toLowerCase()] ||
			getLocaleFromNavigator().toLowerCase()
		)
		this.switch(navLocale as Locale)
	}

	public switch(l: Locale): void {
		if (!LocaleList.includes(l) && localeMap[l]) {
			l = localeMap[l]
		}
		this.#store.set(l)
		locale.set(l)
		document.documentElement.setAttribute('locale', l)

		if (!localStorage && LocaleList.includes(l)) {
			setQuery(
				'locale', l,
				window.history?.state, window.history?.state?.title, true,
			)
		} else {
			removeQuery('locale')
		}

		this._syncLocalStore(l)
	}
}

export const i18n = new _i18n

export const isInvalidLocale = derived(
	i18n, (s): boolean => !LocaleList.includes(s as Locale)
)
