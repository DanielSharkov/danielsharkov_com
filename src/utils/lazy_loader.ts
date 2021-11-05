import {Readable, writable, Writable} from 'svelte/store'

export enum LazyLoadStatus {LOADING, DONE, ERR}

type T_Store_LazyLoad = {
	status: LazyLoadStatus
}

export class LazyLoader implements Readable<T_Store_LazyLoad> {
	#store: Writable<T_Store_LazyLoad> = writable({
		status: LazyLoadStatus.LOADING,
	})
	public readonly subscribe = this.#store.subscribe

	private _mediaSrc: string
	private _imgEl: HTMLImageElement

	constructor(src: string) {
		this.changeSource(src)
	}

	private _removeListeners(): void {
		this._imgEl.removeEventListener('load', this._doneLoading.bind(this))
		this._imgEl.removeEventListener('error', this._failedToLoad.bind(this))
		this._imgEl.removeEventListener('abort', this._failedToLoad.bind(this))
	}

	private _doneLoading(): void {
		this.#store.update((store)=> {
			store.status = LazyLoadStatus.DONE
			return store
		})
		this._removeListeners()
	}

	private _failedToLoad(): void {
		console.error('LazyLoader: failed to load', this._mediaSrc)
		this.#store.update((store)=> {
			store.status = LazyLoadStatus.ERR
			return store
		})
		this._removeListeners()
	}

	private _load():void {
		this._imgEl.addEventListener('load', this._doneLoading.bind(this), { passive: true })
		this._imgEl.addEventListener('error', this._failedToLoad.bind(this), { passive: true })
		this._imgEl.addEventListener('abort', this._failedToLoad.bind(this), { passive: true })
		this._imgEl.src = this._mediaSrc
		if (this._imgEl.complete) {
			if (this._imgEl.naturalWidth === 0 || this._imgEl.naturalHeight === 0) {
				return this._failedToLoad()
			}
			return this._doneLoading()
		}
	}

	public load(): void {
		if (document.readyState === 'complete') {
			this._load()
		}
		else window.addEventListener(
			'load', this._load.bind(this),
			{once: true, passive: true},
		)
	}

	public changeSource(newSrc: string): void {
		this._mediaSrc = newSrc
		this._imgEl = document.createElement('img')
	}

	public destroy() {
		if (!this._imgEl) return
		this._removeListeners()
		this._imgEl.remove()
	}
}
