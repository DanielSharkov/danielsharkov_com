import type {TransitionConfig} from 'svelte/transition'
import {cubicInOut} from 'svelte/easing'
import {appState} from '../App.svelte'

export function customTransition(config: TransitionConfig) {
	return appState.$().a11y.reducedMotion ? null : config
}

export function fade(n, opts?: {duration?: number}) {
	return customTransition({
		duration: opts?.duration || 200,
		easing: cubicInOut,
		css: (t)=> `opacity: ${t};`,
	})
}

export function projectModalAnim(n, o?) {
	return customTransition({
		duration: 500,
		easing: cubicInOut,
		css: (t)=> (
			`opacity: ${t};` +
			`transform: scale(${0.9 + 0.1 * t}) translate(0, ${20 - 20 * t}rem);`
		),
	})
}

export function modalTransition(n, o?) {
	return customTransition({
		duration: 250,
		easing: cubicInOut,
		css: (t)=> (
			`opacity: ${t};` +
			`transform: scale(${0.9 + 0.1 * t});`
		),
	})
}

export function disclosureTransition(n, o?) {
	return customTransition({
		duration: 150,
		easing: cubicInOut,
		css: (t)=> (
			`opacity: ${t};` +
			`transform: translateY(-${0.5 - 0.5 * t}rem);`
		),
	})
}
