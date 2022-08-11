function fallbackCopyToClipboard(data: string): boolean {
	const tempEl = document.createElement('textarea')
	tempEl.value = data

	// Avoid scrolling to bottom
	tempEl.style.position = 'fixed'
	tempEl.style.display = 'hidden !important'

	document.body.appendChild(tempEl)
	tempEl.focus({preventScroll: true})
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
	if (!window.navigator?.clipboard) {
		return fallbackCopyToClipboard(data)
	}
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

export function vibrateLink(
	node: HTMLElement, opts?: {duration?: number|number[]},
) {
	let _hasVibrated = false

	function _click(event) {
		if (!_hasVibrated) {
			event.preventDefault()
			_hasVibrated = true
			vibrate(opts?.duration)
			node.click()
		} else {
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

export function vibrateAction(
	node: HTMLElement, opts?: {duration?: number|number[]},
) {
	function _click() {vibrate(opts?.duration)}
	node.addEventListener('click', _click, {passive: false})
	return {
		destroy: ()=> node.removeEventListener('click', _click),
	}
}

export function randNum(max: number, min?: number) {
	const x = Math.floor(Math.random() * max)
	if (!Number.isNaN(Number(min)) && x < min) {
		return min
	}
	return x
}

export function randString(max: number, min?: number, base?: number) {
	let len = randNum(max)
	if (min && len < min) len = min
	if (len > max) len = max

	let arr = new Uint8Array(len / 2)
	window.crypto.getRandomValues(arr)
	return Array.from(arr, (dec)=> (
		dec.toString(base || 36).padStart(2, '0')
	)).join('')
}

export function randID(len: number = 8) {
	return randString(len, len, 36)
}
