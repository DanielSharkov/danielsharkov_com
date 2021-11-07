import {init, register, locale, getLocaleFromNavigator} from 'svelte-i18n'
import {derived, Readable} from 'svelte/store'
import {get as getStore} from 'svelte/store'
import {setQuery} from './utils/url_handler'

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
		for (const l of Object.keys(localeMap)) {
			register(l, async ()=> {
				const resp = await fetch(`locale/${localeMap[l]}.json`)
				return await resp.json()
			})
		}
		const locStore = this._readLocalStore()
		if (locStore === null) {
			this._syncLocalStore(getStore(this))
		}

		init({fallbackLocale: 'en'})

		const navLocale = (
			locStore ||
			localeMap[getLocaleFromNavigator().toLowerCase()]
		)
		this.switch(navLocale as Locale)
	}

	public switch(l: Locale): void {
		if (!LocaleList.includes(l) && localeMap[l]) {
			l = localeMap[l]
		}
		locale.set(l)
		document.documentElement.setAttribute('locale', l)
		setQuery(
			'locale', l,
			window.history?.state, window.history?.state?.title, true,
		)
		this._syncLocalStore(l)
	}
}

export const i18n = new _i18n

export const isInvalidLocale = derived(
	i18n, (s): boolean => !LocaleList.includes(s as Locale)
)
