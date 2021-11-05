import {Readable, Writable, writable} from 'svelte/store'
import type {SocialMediaItem} from './utils/types'

type T_GlobalStore = {
	a11y: {
		darkMode: boolean
		reducedMotion: boolean
		moreContrast: boolean
	}
	lockScroll: {
		state: boolean
		stack: Array<string>
	},
	socialMedia: Array<SocialMediaItem>,
}

const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
const reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
const moreContrastMediaQuery = window.matchMedia('(prefers-contrast: more)')

class _GlobalStore implements Readable<T_GlobalStore> {
	#store: Writable<T_GlobalStore> = writable({
		a11y: {
			darkMode: darkModeMediaQuery.matches,
			reducedMotion: reducedMotionMediaQuery.matches,
			moreContrast: moreContrastMediaQuery.matches,
		},
		lockScroll: {
			state: false,
			stack: [],
		},
		socialMedia: [
			{name: 'GitHub',   url: 'https://github.com/DanielSharkov'},
			{name: 'Codepen',  url: 'https://codepen.io/DanielSharkov'},
			{name: 'Discord',  url: 'https://discordapp.com/invite/DMBS9xd'},
			{name: 'Telegram', url: 'https://t.me/danielsharkov'},
			{name: 'Twitter',  url: 'https://twitter.com/Daniel_Sharkov'},
			{name: 'Medium',   url: 'https://medium.com/@danielsharkov'},
			{name: 'Quora',    url: 'https://quora.com/profile/Daniel-Sharkov-1'},
		],
	})
	readonly subscribe = this.#store.subscribe

	private _darkModeChanged() {
		this.#store.update((store)=> {
			store.a11y.darkMode = darkModeMediaQuery.matches
			return store
		})
	}

	private _reducedMotionChanged() {
		this.#store.update((store)=> {
			store.a11y.reducedMotion = reducedMotionMediaQuery.matches
			return store
		})
	}

	private _moreContrastChanged() {
		this.#store.update((store)=> {
			store.a11y.moreContrast = moreContrastMediaQuery.matches
			return store
		})
	}

	constructor() {
		darkModeMediaQuery.addEventListener(
			'change', this._darkModeChanged.bind(this),
			{passive: true},
		)
		reducedMotionMediaQuery.addEventListener(
			'change', this._reducedMotionChanged.bind(this),
			{passive: true},
		)
		moreContrastMediaQuery.addEventListener(
			'change', this._moreContrastChanged.bind(this),
			{passive: true},
		)
	}

	lockScroll(id: string) {
		if (id === '') {
			throw new Error('lockScroll: invalid ID provided')
		}
		let err = null
		this.#store.update((store)=> {
			if (store.lockScroll.stack.indexOf(id) >= 0) {
				err = new Error(
					'lockScroll: unable to lock scroll, '+
					'provided ID is already in stack'
				)
				return store
			}
			if (!store.lockScroll.state) {
				store.lockScroll.state = true
			}
			store.lockScroll.stack.push(id)
			return store
		})
		if (err !== null) throw err
		return true
	}

	unlockScroll(id: string) {
		if (id === '') {
			throw new Error('unlockScroll: invalid ID provided')
		}
		let err = null
		this.#store.update((store)=> {
			const idx = store.lockScroll.stack.indexOf(id)
			if (idx < 0) {
				err = new Error(
					'unlockScroll: unable to unlock scroll, '+
					'stack does not contain the provided ID'
				)
				return store
			}
			store.lockScroll.stack.splice(idx, 1)
			if (store.lockScroll.stack.length < 1) {
				store.lockScroll.state = false
			}
			return store
		})
		if (err !== null) throw err
		return true
	}
}

export const GlobalStore = new _GlobalStore
