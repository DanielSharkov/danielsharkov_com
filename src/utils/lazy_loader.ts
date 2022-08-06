import type {Action, ActionReturn} from 'svelte/action'

export async function lazyLoad(url): Promise<string> {
	const _img = document.createElement('img')

	let resolve: (url: string)=> void
	let reject: (reason: Error|ErrorEvent|UIEvent)=> void
	const loader = new Promise<string>((res, rej)=> {
		resolve = res
		reject = rej
	})

	if (document.readyState === 'complete') {
		_load()
	} else {
		window.addEventListener('load', _load, {once: true})
	}

	function _load() {
		_img.addEventListener('load', _finish)
		_img.addEventListener('error', _fail)
		_img.addEventListener('abort', _fail)
		_img.src = url
		if (_img.complete) {
			if (_img.naturalWidth === 0) {
				_fail(new Error('width is 0px'))
			} else if (_img.naturalHeight === 0) {
				_fail(new Error('height is 0px'))
			} else {
				_finish()
			}
		}
	}

	function _finish() {
		_removeListeners()
		resolve(url)
	}

	function _fail(reason: Error|ErrorEvent|UIEvent) {
		_removeListeners()
		reject(reason)
	}

	function _removeListeners() {
		_img.removeEventListener('load', _finish)
		_img.removeEventListener('error', _fail)
		_img.removeEventListener('abort', _fail)
	}

	return loader
}

interface lazyLoadActionParams {
	thumb: string
	source: string
}

export const lazyLoadAction: Action<
	HTMLImageElement, lazyLoadActionParams
> =(node, {thumb, source}): ActionReturn<lazyLoadActionParams>=> {
	let _thumb = thumb
	let _source = source
	node.src = _thumb
	function _load(url: string) {
		node.setAttribute('lazyloading', url)
		lazyLoad(url)
			.then((url)=> {
				node.src = url
				node.removeAttribute('lazyloading')
			})
			.catch((reason)=> {console.dir(reason)})
	}
	_load(_source)
	return {
		update({source}) {
			if (source !== _source) {
				_source = source
				_load(_source)
			}
		},
	}
}

export const lazyLoadSVGImgAction: Action<
	SVGImageElement, lazyLoadActionParams
> =(node, {thumb, source}): ActionReturn<lazyLoadActionParams>=> {
	let _thumb = thumb
	let _source = source
	node.setAttributeNS('http://www.w3.org/1999/xlink', 'href', _thumb)
	function _load(url: string) {
		node.setAttribute('lazyloading', url)
		lazyLoad(url)
			.then((url)=> {
				node.setAttributeNS('http://www.w3.org/1999/xlink', 'href', url)
				node.removeAttribute('lazyloading')
			})
			.catch((reason)=> {console.dir(reason)})
	}
	_load(_source)
	return {
		update({source}) {
			if (source !== _source) {
				_source = source
				_load(_source)
			}
		},
	}
}

export const lazyLoadBgAction: Action<
	HTMLElement, lazyLoadActionParams
> =(node, {thumb, source}): ActionReturn<lazyLoadActionParams>=> {
	let _thumb = thumb
	let _source = source
	node.style.backgroundImage = 'url('+ _thumb +')'
	function _load(url: string) {
		node.setAttribute('lazyloading', url)
		lazyLoad(url)
			.then((url)=> {
				node.style.backgroundImage = 'url('+ url +')'
				node.removeAttribute('lazyloading')
			})
			.catch((reason)=> {console.dir(reason)})
	}
	_load(_source)
	return {
		update({source}) {
			if (source !== _source) {
				_source = source
				_load(_source)
			}
		},
	}
}
