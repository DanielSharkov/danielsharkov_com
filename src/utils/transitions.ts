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
