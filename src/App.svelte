<script lang='ts' context='module'>
import type {Writable} from 'svelte/store'
import {writable, get as get$} from 'svelte/store'

export const reducedMotionMediaQuery = (
	matchMedia('(prefers-reduced-motion: reduce)')
)
export const moreContrastMediaQuery = (
	matchMedia('(prefers-contrast: more)')
)
export const colorSchemaMediaQuery = (
	matchMedia('(prefers-color-scheme: dark)')
)

export enum t_AppTheme {
	System = 'sys', Light = 'light', Dark = 'dark',
}

export const socialMedia = [
	{
		name: 'GitHub',
		url: 'https://github.com/DanielSharkov',
	},
	{
		name: 'Codepen',
		url: 'https://codepen.io/DanielSharkov',
	},
	{
		name: 'Discord',
		url: 'https://discordapp.com/users/253168850969821184',
		app: 'discord://discordapp.com/users/253168850969821184',
	},
	{
		name: 'Telegram',
		url: 'https://t.me/danielsharkov',
		app: 'tg://t.me/danielsharkov',
	},
	{
		name: 'Twitter',
		url: 'https://twitter.com/DanielSharkov',
	},
]

const appThemeLocStoreID = 'danielsharkov_com'

let _appTheme = t_AppTheme.System
if ('localStorage' in window) {
	const locStore = localStorage.getItem(appThemeLocStoreID)
	if (locStore) {
		_appTheme = locStore as t_AppTheme
	}
}

const thisStore = writable<{
	theme: t_AppTheme
	isOffline: boolean
	a11y: {
		isDarkTheme:   boolean
		reducedMotion: boolean
		moreContrast:  boolean
	}
}>({
	theme: _appTheme,
	isOffline: (
		typeof navigator?.onLine === 'boolean' && !navigator?.onLine
	),
	a11y: {
		isDarkTheme: colorSchemaMediaQuery.matches,
		reducedMotion: reducedMotionMediaQuery.matches,
		moreContrast: moreContrastMediaQuery.matches,
	},
})
export const appState = {
	subscribe: thisStore.subscribe,
	$: ()=> get$(appState),
}

function _reducedMotionChanged() {
	thisStore.update(($)=> {
		$.a11y.reducedMotion = reducedMotionMediaQuery.matches
		return $
	})
}

function _moreContrastChanged() {
	thisStore.update(($)=> {
		$.a11y.moreContrast = moreContrastMediaQuery.matches
		return $
	})
}

function _colorSchemaChanged() {
	thisStore.update(($)=> {
		$.a11y.isDarkTheme = colorSchemaMediaQuery.matches
		return $
	})
}

function _userOnlineStatus() {
	thisStore.update(($)=> {
		$.isOffline = !navigator?.onLine
		return $
	})
}

reducedMotionMediaQuery.addEventListener('change', _reducedMotionChanged)
moreContrastMediaQuery.addEventListener('change', _moreContrastChanged)
colorSchemaMediaQuery.addEventListener('change', _colorSchemaChanged)

thisStore.subscribe(($)=> {
	document.documentElement.setAttribute(
		'app-theme', $.theme,
	)
	document.documentElement.setAttribute(
		'reduced-motion', $.a11y.reducedMotion ? 'true':'false',
	)
	document.documentElement.setAttribute(
		'more-contrast', $.a11y.moreContrast ? 'true':'false',
	)
	if ('localStorage' in window) {
		localStorage.setItem(appThemeLocStoreID, $.theme as string)
	}
})

const lockScrollStore: Writable<Array<string>> = writable([])

export function lockScroll(id: string): void {
	if (id === '') {
		throw new Error(`lockScroll: invalid ID given, got "${id}"`)
	}

	let err = null
	lockScrollStore.update(($)=> {
		if ($.indexOf(id) >= 0) {
			err = new Error(`lockScroll: ID "${id}" already locked`)
			return $
		}
		$.push(id)
		if ($.length > 0) {
			document.scrollingElement?.setAttribute('lock-scroll', 'true')
		}
		return $
	})
	if (err !== null) {throw err}
}

export function unlockScroll(id: string): void {
	if (id === '') {
		throw new Error(
			`unlockScroll: invalid ID given "${id}"`
		)
	}

	let err = null
	lockScrollStore.update(($)=> {
		const idx = $.indexOf(id)
		if (idx < 0) {
			err = new Error(`unlockScroll: ID "${id}" not locked`)
			return $
		}
		$.splice(idx, 1)
		if ($.length < 1) {
			document.scrollingElement?.removeAttribute('lock-scroll')
		}
		return $
	})
	if (err !== null) {throw err}
}

export function setTheme(theme: t_AppTheme) {
	thisStore.update(($)=> {
		$.theme = theme
		return $
	})
}

const _actionStack: Array<{id: string, resolver: ()=> void}> = []

// stack an action which can be escaped via the ESC key
// the callback must resolve the action itself, otherwise it will break things
export function stackAction(resolver: ()=> void) {
	const id = randID()
	_actionStack.unshift({id, resolver})
	return id
}

// resolve action by id
export function resolveAction(id: string) {
	for (let i = 0; i < _actionStack.length; i++) {
		if (_actionStack[i].id === id) {
			_actionStack.splice(i,1)
		}
	}
}

// unstack recent action by ESC key
function escapeAction(event: KeyboardEvent & {currentTarget: EventTarget & Window}) {
	if (_actionStack.length > 0) {
		event.preventDefault()
		_actionStack[0].resolver()
		return false
	}
	return true
}

// the latest restriction will be 
let _restrictedFocusStack: Array<{id: string, target: HTMLElement}> = []

export function restrictFocus(el: HTMLElement) {
	if (Number.isNaN(Number(el.tabIndex))) {
		console.error(el)
		throw new Error(
			'cannot restrict focus on given element, because the element is ' +
			'not focusable (invalid tabindex)'
		)
	}
	const id = randID()
	_restrictedFocusStack.unshift({id, target: el})
	el.focus({preventScroll: true})
	return function(): void {
		for (let i = 0; i < _restrictedFocusStack.length; i++) {
			if (_restrictedFocusStack[i].id === id) {
				_restrictedFocusStack.splice(i,1)
				break
			}
		}
	}
}

function _checkIsFocusAllowed(event: FocusEvent & {currentTarget: EventTarget & Window}) {
	if (_restrictedFocusStack.length > 0) {
		let isAllowedFocus = false
		for (const el of event.composedPath()) {
			if (el === _restrictedFocusStack[0].target) {
				isAllowedFocus = true
				break
			}
		}
		if (!isAllowedFocus) {
			event.preventDefault()
			_restrictedFocusStack[0].target.focus()
			return false
		}
		return true
	}
}
</script>



<script lang='ts'>
import Section_Landing from './sections/Landing.svelte'
// import Section_AboutMe from './sections/AboutMeSection.svelte'
import Section_Projects from './sections/Projects.svelte'
import Section_Skills from './sections/Skills.svelte'
import Section_Footer from './sections/Footer.svelte'

import Modals, {openModal} from './components/Modals.svelte'
import Icons from './components/Icons.svelte'
import {isLoading, _} from 'svelte-i18n'
import {i18n, LanguageList, LanguageFullName, isInvalidLanguage, Language} from './i18n'
import {randID, vibrate} from './utils/misc'
import {disclosureTransition} from './utils/transitions'
import {onMount} from 'svelte'
import {getQuery, removeQuery} from './utils/url_handler'
import {projects, projectsIdxMap} from './database'

let selectingLang = false

function closeLangSelect() {
	selectingLang = false
}

function openLangSelect() {
	selectingLang = true
}

function toggleLangSelect() {
	vibrate()
	if (selectingLang) closeLangSelect()
	else openLangSelect()
}

function selectLang(lang: Language) {
	vibrate()
	i18n.switch(lang)
	closeLangSelect()
}

onMount(()=> {
	let queryProjectID = getQuery('project')
	if (queryProjectID && queryProjectID in projectsIdxMap) {
		openModal({
			name: 'project', props: {
				project: projects[projectsIdxMap[queryProjectID]],
			},
		})
	} else {
		removeQuery('project')
	}
})
</script>

<svelte:window
	on:focus|capture={_checkIsFocusAllowed}
	on:online={_userOnlineStatus}
	on:offline={_userOnlineStatus}
	on:keydown={(event)=> {
		if (event.key == 'Escape') {return escapeAction(event)}
	}}
/>

<Icons/>

{#if $isLoading}
	<div id='AppLoader' class='flex flex-center'>
		<svg class='icon icon-load' aria-hidden='true' focusable='false' role='presentation'>
			<use xlink:href='#Icon_Loader'/>
		</svg>
	</div>
{:else if $isInvalidLanguage}
	<div id='InvalidLocaleSelect' class='flex flex-center'>
		<div class='centered-content grid gap-2 grid-center-x'>
			<svg class='icon' aria-hidden='true' focusable='false' role='presentation'>
				<use xlink:href='#Icon_Translation'/>
			</svg>
			<div class='options flex flex-center gap-1'>
				{#each LanguageList as locale}
					<button on:click={()=> selectLang(locale)} class='option flex nowrap flex-center-y gap-05'>
						<span class='label'>{LanguageFullName[locale]}</span>
					</button>
				{/each}
			</div>
		</div>
	</div>
{:else}
	<main id='App'>
		<div id='AppLangSelect' class:active={selectingLang}>
			<button on:click={toggleLangSelect} aria-haspopup='listbox' class='selected gap-1 flex flex-center' aria-hidden={selectingLang}>
				<svg class='icon icon-15' aria-hidden='true' focusable='false' role='presentation'>
					<use xlink:href='#Icon_Translation'/>
				</svg>
			</button>
			{#if selectingLang}
				<div id='AppLangOptions' class='options grid gap-05' role='listbox' transition:disclosureTransition>
					{#each LanguageList as locale}
						<button on:click={()=> selectLang(locale)}
						class='option flex nowrap flex-center-y gap-1'
						aria-selected={locale === $i18n}
						class:active={locale === $i18n}>
							<span class='label'>{LanguageFullName[locale]}</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<Section_Landing/>
		<Section_Projects/>
		<Section_Skills/>
		<!-- <Section_AboutMe/> -->
		<Section_Footer/>
	</main>

	<Modals/>
{/if}

<style lang='sass'>
main#App
	background-color: var(--page-bg)
	:global(> section:not(.auto-height))
		min-height: 100%
		width: 100%

#AppLangSelect
	z-index: 40
	position: fixed
	right: 1rem
	animation: localeSelectIn var(--transition-easing) 1.5s alternate backwards
	contain: layout
	.selected
		padding: 0.75rem
		background-color: var(--box-bg)
		border-radius: 0.5rem
		box-shadow: var(--shadow-2)
		transition: var(--transition)
		.label
			margin-right: 0.5rem
		&:hover, &:focus
			background-color: var(--clr-accent)
			color: #fff
			.icon
				--icon: #fff
	.options
		position: absolute
		right: 0
		min-width: 150px
		max-width: 100%
		padding: 0.5rem
		border-radius: 0.5rem
		box-shadow: var(--shadow-4)
		background-color: var(--box-bg)
		transition: var(--transition)
		transition-property: transform, opacity
		.option
			padding: 0.75rem 1.25rem
			font-weight: 500
			border-radius: 0.25rem
			transition: var(--transition)
			transition-property: background-color, color
			> .label
				margin-right: 0.5rem
			&:hover, &:focus
				background-color: var(--font-base-clr-015)
				color: var(--font-heading-clr)
			&:active
				background-color: var(--font-base-clr-025)
			&.active
				background-color: var(--clr-accent)
				color: #fff
				&:hover, &:focus
					background-color: var(--clr-accent-dark)
	&.active .selected
		visibility: hidden
	@media screen and (min-width: 1200px)
		top: 1rem
		right: 1rem
		.options
			top: 0
		&:not(.active) .options
			transform: translateY(-0.5rem)
	@media screen and (max-width: 1199px)
		bottom: 1.5rem
		right: 1.5rem
		.options
			bottom: 0
		&:not(.active) .options
			transform: translateY(0.5rem)

#AppLoader, #InvalidLocaleSelect
	position: fixed
	top: 0
	right: 0
	bottom: 0
	left: 0
	contain: strict

#AppLoader
	background-color: #fff
	font-size: 3rem
	.icon
		--icon: var(--font-heading-clr)
	@media (prefers-color-scheme: dark)
		background-color: #000

#InvalidLocaleSelect
	font-size: 1.25em
	> .centered-content
		> .icon
			font-size: 4rem
			--icon: var(--font-heading-clr)
		> .options > .option
			padding: 0.75rem 1rem
			border-radius: 0.5rem
			font-weight: 500
			font-family: var(--font-heading-stack)
			background-color: var(--box-bg)
			box-shadow: var(--shadow-0)
			transition: var(--transition)
			transition-property: background-color, box-shadow, color, transform
			&:hover
				box-shadow: var(--shadow-3)
				color: var(--font-heading-clr)
				transform: translateY(-0.25em)
			&:active, &:focus
				box-shadow: var(--shadow-1)
				transform: translateY(0.15em)
				background-color: var(--clr-accent)
				color: #fff

@keyframes localeSelectIn
	0%
		opacity: 0
		transform: translate(-2em, 0)
	100%
		opacity: 1
		transform: translate(0, 0)
</style>
