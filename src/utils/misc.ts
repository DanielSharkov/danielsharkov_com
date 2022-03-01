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
