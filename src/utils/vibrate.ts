export function vibrate(duration?: number) {
	if (window.navigator?.vibrate) {
		window.navigator.vibrate(duration ? duration : 5)
	}
}

let _linkClickFirstVibrate = false
export function vibrateLink(event, duration?: number) {
	if (!_linkClickFirstVibrate) {
		console.log('first vibrate')
		event.preventDefault()
		_linkClickFirstVibrate = true
		if (window.navigator?.vibrate) {
			window.navigator.vibrate(duration ? duration : 5)
		}
		event.target.click()
	} else {
		console.log('now click')
		_linkClickFirstVibrate = false
	}
}
