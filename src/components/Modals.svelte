<script lang='ts' context='module'>
import {writable} from 'svelte/store'
import type {SvelteComponent} from 'svelte'
import {randID} from '../utils/misc'
import {lockScroll, unlockScroll, stackAction, resolveAction, restrictFocus} from '../App.svelte'

import Modal_BigPicture from './modals/BigPicture.svelte'

import Modal_Project from './modals/Project.svelte'
import type {Props as Modal_Project_Props} from './modals/Project.svelte'

import Modal_SocialMedia from './modals/SocialMedia.svelte'
import type {Props as Modal_SocialMedia_Props} from './modals/SocialMedia.svelte'

export interface i_ModalProps {
	bigPicture: null
	project: Modal_Project_Props
	socialMedia: Modal_SocialMedia_Props
}

const _modalComponent: {[name: string]: typeof SvelteComponent} = {
	bigPicture: Modal_BigPicture,
	project: Modal_Project,
	socialMedia: Modal_SocialMedia,
}

export type t_AppModal<T extends keyof i_ModalProps> = {
	id:        string
	name:      T
	props:     i_ModalProps[T]
	escapable: boolean
}

const thisStore = writable<Array<t_AppModal<keyof i_ModalProps>>>([])

let _modalLastFocus: HTMLElement = document.activeElement as HTMLElement
let _modalResolver: {[id: string]: {
	resolve: Function, actionID: string,
	releaseFocusRestriction: ()=> void,
}} = {}

export type openModal = <mID extends keyof i_ModalProps>(
	{name, props, escapable}: {
		name: mID
		props: i_ModalProps[mID]
		escapable?: boolean
	},
)=> Promise<void>

export function openModal<mID extends keyof i_ModalProps>(
	{name, props = null, escapable = true}: {
		name: mID
		props: i_ModalProps[mID]
		escapable?: boolean
	},
): Promise<void> {
	let resolve: Function;
	const promise = new Promise<void>((r)=> {resolve = r})

	thisStore.update(($)=> {
		_modalLastFocus = document.activeElement as HTMLElement
		if (name in _modalComponent) {
			const id = randID()
			$.push({id, name, props, escapable})
			lockScroll(id)
			const actionID = stackAction(function() {
				if (escapable) {closeModal(id)}
			})
			_modalResolver[id] = {
				actionID,
				resolve,
				releaseFocusRestriction: null,
			}
		}
		else {
			throw new Error(`no modal registered by name "${name}"`)
		}
		return $
	})
	return promise
}

export function closeModal(id: string): void {
	if (!(id in _modalResolver)) {
		throw new Error(`closeModal: provided ID not existing`)
	}
	unlockScroll(id)
	resolveAction(_modalResolver[id].actionID)
	thisStore.update(($)=> {
		const idx = $.findIndex((modal)=> modal.id === id)
		_modalResolver[id].releaseFocusRestriction()
		_modalResolver[id].resolve()
		delete _modalResolver[id]
		$.splice(idx, 1)
		if ($.length < 1) {
			_modalLastFocus.focus();
		}
		return $
	})
}

export function closeAllModals(): void {
	thisStore.update(($)=> {
		for (let idx = 0; idx < $.length; idx++) {
			unlockScroll($[idx].id)
			resolveAction(_modalResolver[$[idx].id].actionID)
			_modalResolver[$[idx].id].releaseFocusRestriction()
			_modalResolver[$[idx].id].resolve()
		}
		_modalResolver = {}
		$ = []
		_modalLastFocus.focus();
		return $
	})
}

function _modalMounted(id: string, el: HTMLElement) {
	_modalResolver[id].releaseFocusRestriction = restrictFocus(el)
}
</script>



<div id='AppModals' class:active={$thisStore.length > 0} role='generic' aria-hidden={$thisStore.length < 1}>
	{#each $thisStore as modal (modal.id)}
		<svelte:component
			this={_modalComponent[modal.name]}
			{openModal}
			escapable={modal.escapable}
			props={modal.props}
			on:close|once={()=> closeModal(modal.id)}
			on:mounted|once={({detail: el})=> _modalMounted(modal.id, el)}
		/>
	{/each}
</div>



<style lang='sass'>
#AppModals
	z-index: var(--idx-modals)
	position: fixed
	top: 0
	left: 0
	width: 100%
	height: 100%
	overflow: auto
	overscroll-behavior: contain
	contain: strict
	&:not(.active)
		pointer-events: none
	:global(> *)
		pointer-events: auto
</style>
