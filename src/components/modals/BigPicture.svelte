<div class='modal-container flex flex-center'>
	<div
		class='background'
		on:click={()=> {dispatch('close')}}
		transition:modalBgTransition={{duration: 400}}
	/>
	<img
		bind:this={thisEl}
		alt='Daniel Scharkov'
		use:lazyLoadAction={{
			thumb: 'me-myself-and-i-thumb.jpg',
			source: 'me-myself-and-i.jpg',
		}}
		out:bigPicTransition={{isOut: true}}
		in:bigPicTransition={{isOut: false}}
	/>
</div>



<script lang='ts'>
import {modalBgTransition} from '../../utils/transitions'
import type {TransitionConfig} from 'svelte/transition'
import {lazyLoadAction} from '../../utils/lazy_loader'
import {createEventDispatcher, onMount} from 'svelte'
import {cubicIn, cubicOut} from 'svelte/easing'
import {appState} from '../../App.svelte'
const dispatch = createEventDispatcher<{close: void, mounted: HTMLElement}>()

const displayDesktop = window.matchMedia('screen and (min-width: 600px)')

let thisEl: HTMLElement;
onMount(()=> {
	dispatch('mounted', thisEl)
})

function bigPicTransition(_, {isOut}: {isOut: boolean}): TransitionConfig {
	const duration = !appState.$().a11y.reducedMotion && 500
	const easing = isOut ? cubicIn : cubicOut
	if (displayDesktop.matches) {
		return {
			duration,
			css(t) {
				t = easing(t)
				return (
					`opacity: ${t};` +
					`transform: `+
						`scale(${.8 + .2 * t}) `+
						`translate(-${10-10 * t}em, -${2-2 * t}em);`
				)
			},
		}
	}
	return {
		duration,
		css(t) {
			t = easing(t)
			return (
				`opacity: ${t};` +
				`transform: scale(${.75 + .25 * t}) translateY(-${5-5 * t}em);`
			)
		},
	}
}
</script>



<style lang='stylus'>
.modal-container
	padding: 2rem

.background
	background-color: rgba(#000, .85)

img
	width: auto
	height: auto
	max-width: 100%
	max-height: 100%
	aspect-ratio: 3/4
	border-radius: 1rem
	box-shadow: var(--shadow-bevel),
		0 0 1px var(--shadow-ao-clr),
		0 20px 40px -20px var(--shadow-huge-clr)
	background-color: var(--page-bg)
	background-position: center
	background-repeat: no-repeat
	background-size: cover
	transform-origin: top left
	@media screen and (max-width: 600px)
		transform-origin: top
</style>
