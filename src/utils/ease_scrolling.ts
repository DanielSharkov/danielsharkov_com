type easeScrollingOptions = {
	top:      number
	duration: number
	easing:   Function
}

let isAutoScrolling = null

export default function easeScrolling(
	el: HTMLElement, {
		top = 0,
		duration = 1000,
		easing = null
	}: easeScrollingOptions
) {
	if (!(el instanceof HTMLElement)) {
		throw new Error('Invalid element provided')
	}
	const rAF = window.requestAnimationFrame
	const toScroll = Number(top) - el.scrollTop
	console.log(toScroll)
	if (toScroll == 0) return
	const scrollBegin = el.scrollTop
	console.log(scrollBegin)
	let _startTime = null
	const thisAnim =(now)=> {
		console.log('test')
		if (_startTime == null) {
			_startTime = now
		}
		const frame = now - _startTime
		const progress = 1 / Number(duration) * frame
		const easedProgress = easing ? easing(progress) : progress
		const result = scrollBegin + toScroll * easedProgress
		if (Number(duration) - frame > 0) {
			if (frame > 0) {
				el.scrollTop = result
			}
			isAutoScrolling = rAF(thisAnim)
		}
		else {
			el.scrollTop = Number(top)
			setTimeout(()=> isAutoScrolling = null)
		}
	}
	isAutoScrolling = rAF(thisAnim)
}
