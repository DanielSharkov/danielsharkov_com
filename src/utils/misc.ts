function fallbackCopyToClipboard(data: string): boolean {
	const tempEl = document.createElement('textarea')
	tempEl.value = data

	// Avoid scrolling to bottom
	tempEl.style.position = 'fixed'
	tempEl.classList.add('hidden')

	document.body.appendChild(tempEl)
	tempEl.focus()
	tempEl.select()

	try {
		document.execCommand('copy')
		document.body.removeChild(tempEl)
		return true
	} catch (err) {
		document.body.removeChild(tempEl)
		return false
	}
}

export async function copyToClipboard(data: string): Promise<boolean> {
	if (!window.navigator?.clipboard) return fallbackCopyToClipboard(data)

	try {
		await navigator.clipboard.writeText(data)
		return true
	} catch(_) {
		return false
	}
}

export function vibrate(duration?: number|number[]): void {
	if (window.navigator?.vibrate) {
		window.navigator.vibrate(duration ? duration : 1)
	}
}

export function vibrateLink(node, opts?: {duration?: number|number[]}) {
	let _hasVibrated = false

	function _click(event) {
		if (!_hasVibrated) {
			event.preventDefault()
			_hasVibrated = true
			vibrate(opts?.duration)
			node.click()
		}
		else {
			_hasVibrated = false
		}
	}
	node.addEventListener('click', _click, {passive: false})

	return {
		destroy(): void {
			node.removeEventListener('click', _click)
		}
	}
}


import {cubicInOut} from 'svelte/easing'
import {get as getStore} from 'svelte/store'
import {GlobalStore} from '../global_store'

export function modalBgAnim(_, duration?: number) {
	const reducedMotion = getStore(GlobalStore).a11y.reducedMotion
	duration = (
		!reducedMotion &&
		Number.isNaN(Number(duration)) ? 400 : duration
	)
	return {
		duration: duration,
		css: (t)=> `opacity: ${cubicInOut(t)};`,
	}
}

export function modalPointBlockAnim(_, duration?: number) {
	const reducedMotion = getStore(GlobalStore).a11y.reducedMotion
	duration = (
		!reducedMotion &&
		Number.isNaN(Number(duration)) ? 500 : duration
	)
	return {
		duration: duration,
		css: ()=> `pointer-events: all;`,
	}
}

export function projectModalAnim(_, o?) {
	const reducedMotion = getStore(GlobalStore).a11y.reducedMotion
	return {
		duration: !reducedMotion && 400,
		css(t) {
			return (
				`opacity: ${t};` +
				`transform: translate(0, ${8 - 8 * cubicInOut(t)}rem);`
			)
		},
	}
}

export function socialModalAnim(_, o?) {
	const reducedMotion = getStore(GlobalStore).a11y.reducedMotion
	return {
		duration: !reducedMotion && 250,
		css(t) {
			return (
				`opacity: ${t};` +
				`transform: scale(${.5 + .5 * cubicInOut(t)});`
			)
		},
	}
}
