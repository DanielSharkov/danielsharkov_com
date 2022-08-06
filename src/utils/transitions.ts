import type {TransitionConfig} from 'svelte/transition'
import {fade} from 'svelte/transition'
import {cubicInOut, cubicOut} from 'svelte/easing'
import {appState} from '../App.svelte'

export function modalBgTransition(
	node: Element, opts?: {duration?: number},
): TransitionConfig {
	return fade(node, {
		duration: (
			appState.$().a11y.reducedMotion ? 0 : (opts?.duration || 200)
		),
		easing: cubicInOut,
	})
}

export function projectModalAnim(_, o?): TransitionConfig {
	return {
		duration: appState.$().a11y.reducedMotion ? 0 : 600,
		css: (t)=> (
			`opacity: ${cubicInOut(t)};` +
			`transform: scale(${.9 + .1 * cubicInOut(t)}) translate(0, ${20 - 20 * cubicInOut(t)}rem);`
		),
	}
}

export function modalTransition(_, o?) {
	return {
		duration: appState.$().a11y.reducedMotion ? 0 : 250,
		css: (t)=> (
			`opacity: ${t};` +
			`transform: scale(${.5 + .5 * cubicOut(t)});`
		),
	}
}

export function disclosureTransition(_, o?) {
	return {
		duration: appState.$().a11y.reducedMotion ? 0 : 250,
		css: (t)=> (
			`opacity: ${cubicOut(t)};` +
			`transform: translateY(-${1 - cubicOut(t)}rem);`
		),
	}
}
