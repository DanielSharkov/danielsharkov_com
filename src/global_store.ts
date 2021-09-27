import { Readable, Writable, writable, get as getStore } from 'svelte/store'
import { projects } from './database'
import type { SocialMediaItem } from './utils/types'

type ImageThumb = {
	light: boolean,
	dark: boolean,
}

type ImageThumbCollection = { [key:string]: ImageThumb }

export enum ImageThumbKind {
	LIGHT = 'light',
	DARK = 'dark',
}

type T_GlobalStore = {
	lockScroll: {
		state: boolean
		stack: Array<string>
	},
	socialMedia: Array<SocialMediaItem>,
	projectImgLoad: ImageThumbCollection,
}

class _GlobalStore implements Readable<T_GlobalStore> {
	#store: Writable<T_GlobalStore> = writable({
		lockScroll: {
			state: false,
			stack: [],
		},
		socialMedia: [
			{ name: 'GitHub',   url: 'https://github.com/DanielSharkov' },
			{ name: 'Codepen',  url: 'https://codepen.io/DanielSharkov' },
			{ name: 'Discord',  url: 'https://discordapp.com/invite/DMBS9xd' },
			{ name: 'Telegram', url: 'https://t.me/danielsharkov' },
			{ name: 'Twitter',  url: 'https://twitter.com/Daniel_Sharkov' },
			{ name: 'Medium',   url: 'https://medium.com/@danielsharkov' },
			{ name: 'Quora',    url: 'https://quora.com/profile/Daniel-Sharkov-1' },
		],
		projectImgLoad: {},
	})
	public readonly subscribe = this.#store.subscribe

	init() {
		this.#store.update((store)=> {
			for (const p of projects) {
				store.projectImgLoad[p.id] = {
					light: false,
					dark: false,
				}
			}
			return store
		})
	}

	thumbDone(projectID: string, kind: ImageThumbKind) {
		this.#store.update((store)=> {
			store.projectImgLoad[projectID][kind] = true
			return store
		})
	}

	isThumbLoaded(projectID: string, kind: ImageThumbKind) {
		return getStore(this.#store).projectImgLoad[projectID][kind]
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
GlobalStore.init()
