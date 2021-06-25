function fallbackCopyToClipboard(data: string) {
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

export async function copyToClipboard(data: string) {
	if (!window.navigator?.clipboard) return fallbackCopyToClipboard(data)

	try {
		await navigator.clipboard.writeText(data)
		return true
	} catch(_) {
		return false
	}
}

export function vibrate(duration?: number|number[]) {
	if (window.navigator?.vibrate) {
		window.navigator.vibrate(duration ? duration : 1)
	}
}

let _linkClickFirstVibrate = false
export function vibrateLink(event, duration?: number|number[]) {
	if (!_linkClickFirstVibrate) {
		console.log('first vibrate')
		event.preventDefault()
		_linkClickFirstVibrate = true
		if (window.navigator?.vibrate) {
			window.navigator.vibrate(duration ? duration : 1)
		}
		event.target.click()
	} else {
		console.log('now click')
		_linkClickFirstVibrate = false
	}
}
