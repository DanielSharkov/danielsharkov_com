type easeScrollingOptions = {
	top:       number
	duration?: number
	easing?:   Function
}

const rAF = (
	window.requestAnimationFrame ||
	/* @ts-ignore for legacy */
	window.webkitRequestAnimationFrame ||
	/* @ts-ignore for legacy */
	window.mozRequestAnimationFrame ||
	function(callback) { window.setTimeout(callback, 1000 / 60) }
)

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
	const toScroll = function(n){
		if (n + window.innerHeight > el.scrollHeight) {
			return el.scrollHeight - window.innerHeight
		}
		return n
	}(Number(top) - el.scrollTop)
	if (toScroll == 0) return

	const scrollBegin = el.scrollTop
	let _startTime = null
	rAF(_scrollAnim)

	function _scrollAnim(now) {
		if (_startTime == null) _startTime = now
	
		const frame = now - _startTime
		const progress = 1 / Number(duration) * frame
		const easedProgress = easing ? easing(progress) : progress
		const result = scrollBegin + toScroll * easedProgress

		if (Number(duration) - frame > 0) {
			if (frame > 0) el.scrollTop = result
			rAF(_scrollAnim)
		}
		else el.scrollTop = Number(top)
	}
}
