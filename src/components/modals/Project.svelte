<div class='modal-container flex' role='generic'>
	<div
		class='background'
		aria-hidden='true'
		transition:fade={{duration: 600}}
		on:click={()=> {
			if (escapable) {closeThis()}
		}}
	/>
	<div id='Project_Details_Modal'
	class='grid' role='article'
	transition:projectModalAnim
	bind:this={thisEl} tabindex='-1'>
		<button on:click={closeThis} class='close-modal flex flex-center' aria-label={$_('close')}>
			<svg class='icon' aria-hidden='true' focusable='false' role='presentation'>
				<use xlink:href='#Icon_Cross'/>
			</svg>
		</button>

		<div class='image-container flex flex-center block-select'
		role='img'
		class:no-image={props.project.hasNoCover}
		class:dark-theme={props.project.darkThemed}
		style={customGradientBG}>
			{#if !props.project.hasNoCover}
				<div class='flex flex-center'>
					{#await lazyLoader}
						<div
							class='thumb bg-cover'
							style:background-image='url({_thumbSrc})'
						/>
						<img
							class='thumb image' src={_thumbSrc}
							alt='{props.project.id} thumbnail'
						/>
						<div class='lazyload-overlay flex flex-center'>
							<svg class='icon' aria-hidden='true' focusable='false' role='presentation'>
								<use xlink:href='#Icon_Loader'/>
							</svg>
						</div>
					{:then src}
						<div class='bg-cover' style:background-image='url({src})'/>
						<img class='image' {src} alt='{props.project.id} cover'/>
					{:catch}
						<div
							class='thumb bg-cover'
							style:background-image='url({_thumbSrc})'
						/>
						<img
							class='thumb image' src={_thumbSrc}
							alt='{props.project.id} thumbnail'
						/>
						<div class='lazyload-overlay flex flex-center'>
							<svg class='icon icon-thinner' aria-hidden='true' focusable='false' role='presentation'>
								<use xlink:href='#Icon_ErrorCircle'/>
							</svg>
							<span class='fail-msg'>{$_('failed_to_load_image')}</span>
						</div>
					{/await}
				</div>
			{/if}
		</div>
		<div class='header flex gap-2 nowrap'>
			<div class='left-wrapper'>
				<h1 class='name'>{$_('project.' + props.project.id)}</h1>
				{#if props.project.usedTechnologies.length > 0}
					<div class='used-technologies flex gap-05' role='listbox'>
						{#each props.project.usedTechnologies as techno}
							<a href={technologies[techno].link} target='_blank'
							class='techno flex flex-center gap-05'
							role='listitem'
							use:vibrateLink>
								<div
									class='color'
									style='background-color: {technologies[techno].color}'
								/>
								{#if technologies[techno].hasIcon}
									<svg class='logo' aria-hidden='true' focusable='false' role='presentation'>
										<title>{techno} Logo</title>
										<use xlink:href='#Logo_{techno}'/>
									</svg>
								{:else if technologies[techno].hasImage}
									<img
										class='logo'
										src='technologies/{techno}.png'
										alt='{techno} Logo'
									/>
								{/if}
								<span class='name'>
									{technologies[techno].name}
								</span>
							</a>
						{/each}
					</div>
				{/if}
			</div>
			<div class='right-wrapper flex-center-y flex gap-05'>
				{#if Array.isArray(props.project.otherLinks)}
					{#each props.project.otherLinks as link}
						<a href={link.url} role='button' class='other-link flex flex-center gap-05' target='_blank' use:vibrateLink>
							<svg class='icon' aria-hidden='true' focusable='false' role='presentation'>
								<use xlink:href='#Icon_Chain'/>
							</svg>
							<span class='label'>{$_(link.name)}</span>
						</a>
					{/each}
				{/if}
				{#if props.project.codeUrl}
					<a href={props.project.codeUrl} role='button' class='open-source-code flex flex-center gap-05' target='_blank' use:vibrateLink>
						<svg class='icon' aria-hidden='true' focusable='false' role='presentation'>
							<use xlink:href='#Icon_Code'/>
						</svg>
						<span class='label'>{$_('project_source_code')}</span>
					</a>
				{/if}
				{#if props.project.codeUrl === null}
					<div class='closed-source flex flex-center gap-05'>
						<svg class='icon' aria-hidden='true' focusable='false' role='presentation'>
							<use xlink:href='#Icon_Lock'/>
						</svg>
						<span class='label'>{$_('project_closed_source')}</span>
					</div>
				{/if}
				{#if props.project.projectUrl !== null && props.project.projectUrl !== 'COMING_SOON'}
					<a href={props.project.projectUrl} role='button' class='open-project flex flex-center gap-05' target='_blank' use:vibrateLink>
						<div class='shine'/>
						<span class='label'>{$_('open_project')}</span>
						<svg class='icon' aria-hidden='true' focusable='false' role='presentation'>
							<use xlink:href='#Icon_Link'/>
						</svg>
					</a>
				{:else if props.project.projectUrl === 'COMING_SOON'}
					<div href={props.project.projectUrl} class='open-project-soon flex flex-center gap-05'>
						<span class='label'>{$_('project_coming_soon')}</span>
						<svg class='icon' aria-hidden='true' focusable='false' role='presentation'>
							<use xlink:href='#Icon_Time'/>
						</svg>
					</div>
				{/if}
			</div>
		</div>
		<div class='about flex flex-col'>
			<hr class='seperator top'/>
			{#if !articleTranslationUnavailable && (props.project.lang.length > 1 || articleHasMetaSet)}
				<div class='about-header grid gap-1'>
					{#if props.project.lang.length > 1}
						<div class='load-different-lang flex flex-center-y'>
							<div class='disclosure'>
								<button on:click={toggleTranslationSelection}
								class='loaded-translation flex nowrap flex-center-y gap-05'
								class:active={isSelectingTranslation}
								aria-haspopup='true'>
									<svg class='icon' aria-hidden='true' focusable='false' role='presentation'>
										<use xlink:href='#Icon_Translation'/>
									</svg>
									<span class='label'>{$_('project_load_different_translation')}</span>
									<svg class='icon icon-075 flex-self-right' aria-hidden='true' focusable='false' role='presentation'>
										<use xlink:href='#Icon_Chevron'/>
									</svg>
								</button>
								{#if isSelectingTranslation}
									<div class='options grid gap-05' transition:disclosureTransition>
										{#each props.project.lang as lang}
											{#if lang !== loadedTranslation}
												<button class='option flex nowrap flex-center-y gap-05' on:click={()=> selectDifferentTranslation(lang)}>
													<svg class='flag icon icon-175' aria-hidden='true' focusable='false' role='presentation'>
														<title>{LanguageFullName[lang]} Flag</title>
														<use xlink:href='#Flag_{lang}'/>
													</svg>
													<span class='label'>{LanguageFullName[lang]}</span>
												</button>
											{/if}
										{/each}
									</div>
								{/if}
							</div>
						</div>
					{/if}
					{#if articleHasMetaSet}
						<div class='metadata flex gap-05'>
							{#if props.project.articleWritten !== undefined}
								<div class='flex'>
									<span>{$_('project_article_written')}:</span>
									<span>{$_date(props.project.articleWritten, {month: 'long', year: 'numeric'})}</span>
								</div>
							{/if}
							{#if props.project.prjImpl !== undefined}
								<div class='flex'>
									<span>{$_('project_implemented')}:</span>
									<span>{$_date(props.project.prjImpl, {month: 'long', year: 'numeric'})}</span>
								</div>
							{/if}
							{#if props.project.prjUpdt !== undefined}
								<div class='flex'>
									<span>{$_('project_updated')}:</span>
									<span>{$_date(props.project.prjUpdt, {month: 'long', year: 'numeric'})}</span>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/if}
			{#if articleTranslationUnavailable && about === null}
				<div class='lang-unavailable flex-base-size-variable grid grid-center'>
					{#if props.project.lang.length < 1}
						<p class='no-translations'>
							{$_('project_about_unavailable')}
						</p>
					{:else}
						<p>{$_('project_about_only_available_in')}</p>
						<div class='options flex flex-center-y gap-1'>
							{#each props.project.lang as lang}
								<button on:click={()=> fetchArticle(lang)} class='option flex nowrap flex-center-y gap-05'>
									<svg class='flag icon icon-175' aria-hidden='true' focusable='false' role='presentation'>
										<title>{LanguageFullName[lang]} Flag</title>
										<use xlink:href='#Flag_{lang}'/>
									</svg>
									<span class='label'>{LanguageFullName[lang]}</span>
								</button>
							{/each}
						</div>
					{/if}
				</div>
			{:else if about !== null}
				{#await about}
					<div class='placeholder' aria-hidden='true'>
						<h1>______________</h1>
						<hr class='h1-border'/>
						<p class='i'>_</p>
						<h3>_</h3>
						<p class='ii'>_</p>
						<p class='iii'>_</p>
					</div>
				{:then rtfContent}
					<article class='rtf-content'>{@html rtfContent}</article>
				{:catch}
					<div class='placeholder error'>
						<h1>{$_('project_about_failed')}</h1>
						<hr class='h1-border' aria-hidden='true'/>
						<p class='i' aria-hidden='true'>_</p>
						<!-- svelte-ignore a11y-hidden -->
						<h3 aria-hidden='true'>_</h3>
						<p class='ii' aria-hidden='true'>_</p>
						<p class='iii' aria-hidden='true'>_</p>
					</div>
				{/await}
			{/if}
			<hr class='seperator bot'/>
		</div>
		<div class='footer flex flex-center-y gap-05' class:sharing-not-supported={!isSharingSupported}>
			<button on:click={shareURL}
			style:grid-area='copy-url'
			class='share-option flex flex-center gap-05 nowrap'
			class:is-sharing={userIsSharingURL}>
				<div class='status grid gap-05 grid-center-x' role='alert' class:active={userIsSharingURL}>
					<span class='label'>
						{#if shareURLWasCanceled}
							{$_('copy_url_failed')}
						{:else if shareURLWasSuccess}
							{$_('copy_url_success')}
						{:else}
							{$_('copy_url_inprocess')}
						{/if}
					</span>
					<StatusIcon
						loading={userIsSharingURL}
						failed={shareURLWasCanceled}
						succeeded={shareURLWasSuccess}
					/>
				</div>
				<svg class='icon' aria-hidden='true' focusable='false' role='presentation'>
					<use xlink:href='#Icon_Chain'/>
				</svg>
				<span class='label'>{$_('copy_url')}</span>
			</button>

			{#if isSharingSupported}
				<button on:click={shareThis}
				style:grid-area='share-with'
				class='share-option flex flex-center gap-05 nowrap'
				class:is-sharing={userIsSharing}>
					<div class='status grid gap-05 grid-center-x' role='alert' class:active={userIsSharing}>
						<span class='label'>
							{#if shareNotSupported}
								{$_('share_not_supported')}
							{:else if shareWasCanceled}
								{$_('share_canceled')}
							{:else if shareWasSuccess}
								{$_('shared')}
							{:else}
								{$_('sharing')}
							{/if}
						</span>
						<StatusIcon
							loading={userIsSharing}
							failed={shareWasCanceled || shareNotSupported}
							succeeded={shareWasSuccess}
						/>
					</div>
					<svg class='icon' aria-hidden='true' focusable='false' role='presentation'>
						<use xlink:href='#Icon_Share'/>
					</svg>
					<span class='label'>{$_('share_with')}</span>
				</button>
			{/if}

			<button on:click={closeThis} style:grid-area='close'
			class='close flex flex-center flex-self-right gap-05 nowrap'>
				<svg class='icon' aria-hidden='true' focusable='false' role='presentation'>
					<use xlink:href='#Icon_Cross'/>
				</svg>
				<span class='label'>{$_('close')}</span>
			</button>
		</div>
	</div>
</div>



<script lang='ts' context='module'>
export type Props = {
	project: Project
};
</script>

<script lang='ts'>
import {createEventDispatcher, onDestroy, onMount} from 'svelte'
const dispatch = createEventDispatcher<{close: void, mounted: HTMLElement}>()
import type {Project} from '../../database'
import {technologies} from '../../database'
import {marked} from 'marked'
import {appState, colorSchemaMediaQuery} from '../../App.svelte'
import {vibrate, vibrateLink, copyToClipboard} from '../../utils/misc'
import StatusIcon from '../StatusIcon.svelte'
import {_, date as _date} from 'svelte-i18n'
import {projectModalAnim, fade, disclosureTransition} from '../../utils/transitions'
import {i18n, Language, LanguageFullName, LanguageList} from '../../i18n'
import {lazyLoad} from '../../utils/lazy_loader'
import {removeQuery, setQuery} from '../../utils/url_handler'

function closeThis(): void {
	vibrate()
	dispatch('close')
}

export let props: Props
export let escapable: boolean

let thisEl: HTMLElement

const thumbSrc = `projects/${props.project.id}/thumbnail.jpg`
const coverSrc = `projects/${props.project.id}/cover.png`
const thumbDarkSrc = `projects/${props.project.id}/thumbnail_dark.jpg`
const coverDarkSrc = `projects/${props.project.id}/cover_dark.png`

$:_thumbSrc = (
	$appState.a11y.isDarkTheme && props.project.darkThemed ?
		thumbDarkSrc : thumbSrc
)

$:articleHasMetaSet = (
	props.project.articleWritten !== undefined ||
	props.project.prjImpl !== undefined ||
	props.project.prjUpdt !== undefined
)

$:customGradientBG = (
	Array.isArray(props.project.gradient) ?
		`background: -webkit-linear-gradient(125deg, ${props.project.gradient.join(',')});` +
		`background: linear-gradient(125deg, ${props.project.gradient.join(',')});`
	: ''
)

let about: Promise<any> = null
let loadedTranslation: Language = $i18n
$:articleTranslationUnavailable = (
	props.project.lang.indexOf(loadedTranslation) === -1
)
async function fetchArticle(lang: Language): Promise<void> {
	about = null
	about = new Promise(async (resolve, reject)=> {
		try {
			if (!LanguageList.includes(lang)) {
				throw new Error(`invalid language (${lang}) provided`)
			}
			const resp = await fetch(
				`projects/${props.project.id}/article/${lang}.md`
			)
			if (resp.status !== 200) {
				throw new Error('404')
			}
			const rtf: string = marked.parse(
				await resp.text(), {smartLists: true},
			)
			loadedTranslation = lang
			setTimeout(()=> {
				for (const link of document.querySelectorAll('.rtf-content a')) {
					link.setAttribute('target', '_blank')
				}
			})
			resolve(rtf)
		} catch(err) {
			setTimeout(()=> reject(err), 1e3)
		}
	})
}

let isSelectingTranslation = false

function toggleTranslationSelection() {
	isSelectingTranslation = !isSelectingTranslation
}

function selectDifferentTranslation(lang: Language): void {
	isSelectingTranslation = false
	fetchArticle(lang)
}

let lazyLoader: Promise<string>
function loadCoverImg() {
	if (!props.project.hasNoCover) {
		if (props.project.darkThemed && $appState.a11y.isDarkTheme) {
			lazyLoader = lazyLoad(coverDarkSrc)
		} else {
			lazyLoader = lazyLoad(coverSrc)
		}
	}
}

colorSchemaMediaQuery.addEventListener('change', loadCoverImg)
onMount(()=> {
	dispatch('mounted', thisEl)
	setQuery(
		'project', props.project.id,
		{
			'project_id': props.project.id,
			'title': $_('project.' + props.project.id),
		},
		$_('project.' + props.project.id),
	)
	if (props.project.lang.length > 0 && !articleTranslationUnavailable) {
		fetchArticle($i18n)
	}
	loadCoverImg()
})
onDestroy(function() {
	removeQuery('project')
	colorSchemaMediaQuery.removeEventListener('change', loadCoverImg)
})

let userIsSharingURL = false
let shareURLWasCanceled = false
let shareURLWasSuccess = false
async function shareURL() {
	if (userIsSharingURL) {return}
	shareURLWasCanceled = false
	shareURLWasSuccess = false
	shareThisReset()

	if (window.location?.href) {
		userIsSharingURL = true
		vibrate()
		if (await copyToClipboard(window.location.href)) {
			vibrate([0,500,200,100,50])
			setTimeout(()=> {
				shareURLWasSuccess = true
				setTimeout(shareURLReset, 2000)
			})
		}
		else {
			vibrate([0,500,100,50,100])
			setTimeout(()=> {
				shareURLWasCanceled = true
				setTimeout(shareURLReset, 2000)
			})
		}
	}
	else {
		vibrate([0,500, 100,50,100, 200, 50,50,50,50,50,50,50,50,50])
		userIsSharingURL = true
		setTimeout(()=> {
			shareURLWasCanceled = true
			setTimeout(shareURLReset, 2000)
		})
	}
}
function shareURLReset() {
	userIsSharingURL = false
	setTimeout(()=> {
		shareURLWasCanceled = false
		shareURLWasSuccess = false
	})
}

let userIsSharing = false
let shareWasCanceled = false
let shareNotSupported = false
let shareWasSuccess = false
async function shareThis() {
	if (userIsSharing) {return}
	shareWasCanceled = false
	shareWasSuccess = false
	shareURLReset()

	if (window.navigator?.share && window.location?.href) {
		vibrate()
		userIsSharing = true

		try {
			await navigator.share({
				title: (
					$_('a_project_by', {
						values: {
							'name': $_('project.' + props.project.id),
						},
					})
				),
				url: window.location.href,
			})
			vibrate([0,500,200,100,50])
			setTimeout(()=> {
				shareWasSuccess = true
				setTimeout(shareThisReset, 2000)
			})
		}
		catch(err) {
			vibrate([0,500,100,50,100])
			setTimeout(()=> {
				shareWasCanceled = true
				setTimeout(shareThisReset, 2000)
			})
		}
	}
	else {
		vibrate([0,500, 100,50,100, 200, 50,50,50,50,50,50,50,50,50])
		userIsSharing = true
		setTimeout(()=> {
			shareNotSupported = true
			setTimeout(shareThisReset, 3000)
		})
	}
}
function shareThisReset() {
	userIsSharing = false
	setTimeout(()=> {
		shareWasCanceled = false
		shareNotSupported = false
		shareWasSuccess = false
	})
}

const isSharingSupported = window.navigator?.share !== undefined
</script>



<svelte:window on:hashchange={closeThis} on:popstate={closeThis}/>



<style lang='sass'>
$aboutContentWidth: 900px

.modal-container
	@media screen and (min-width: 600px)
		padding: 1rem
	@media screen and (min-width: 1400px)
		padding: 2rem

#Project_Details_Modal
	position: relative
	right: 0
	left: 0
	min-height: 100%
	width: 100%
	max-width: 1500px
	margin: auto
	background-color: var(--project-modal-bg)
	grid-template-rows: auto auto 1fr
	transform: translate3d(0,0,0)
	@media screen and (min-width: 600px)
		margin-bottom: 5rem
		box-shadow: var(--shadow-2)
		border-radius: 0.5rem
	@media screen and (min-width: 1400px)
		margin-bottom: 10rem
		box-shadow: var(--shadow-4)
	@media screen and (min-width: 1400px)
		margin-bottom: 15rem
	@media screen and (max-width: 600px)
		margin-bottom: 0
		box-shadow: none
		border-radius: 0
	> .close-modal
		z-index: 100
		position: absolute
		right: 1.5rem
		top: 1.5rem
		padding: 1rem
		background-color: var(--page-bg)
		border: solid 1px var(--font-base-clr)
		box-shadow: var(--shadow-1)
		border-radius: 2rem
		line-height: 1
		transition: var(--transition)
		transition-property: transform, background-color, box-shadow, color
		&:hover, &:focus, &:active
			transform: scale(1.25)
			background-color: var(--clr-accent)
			border-color: #fff
			box-shadow: var(--shadow-2)
			.icon
				--icon: #fff
		&:active
			box-shadow: var(--shadow-0)
			transform: scale(0.95)
		@media screen and (max-width: 600px)
			right: 1rem
			top: 1rem
	> .image-container
		height: auto
		min-height: 75vh
		max-height: 75vh
		border-bottom: solid 0.25rem var(--page-bg-025)
		border-radius: inherit
		border-bottom-left-radius: 0
		border-bottom-right-radius: 0
		contain: content
		@supports (-webkit-backdrop-filter: blur(0px))
			position: relative
		@media (prefers-color-scheme: dark)
			background-color: var(--page-bg-05)
		.lazyload-overlay
			z-index: 10
			position: absolute
			top: 0
			right: 0
			bottom: 0
			left: 0
			background-color: var(--page-bg-075)
			.icon
				font-size: 4rem
			.fail-msg
				margin-top: 1rem
				flex: 1 1 100%
				text-align: center
		@media screen and (max-width: 600px)
			min-height: auto
			max-height: 55vh
		> div
			top: 0
			right: 0
			bottom: 0
			left: 0
			padding: 1.5rem
			@media (prefers-color-scheme: dark)
				background-color: var(--page-bg-05)
			@media screen and (min-width: 600px)
				position: absolute
			@media screen and (max-width: 600px)
				padding: 5rem 1rem 2rem 1rem
		.bg-cover
			z-index: 1
			background-size: cover
			background-position: top
			opacity: 0.1
			position: absolute
			top: 0
			left: 0
			width: 100%
			height: 100%
			background-position: center
			background-repeat: no-repeat
			@media screen and (min-width: 600px)
				border-radius: 0.5rem 0.5rem 0 0
		.image
			height: auto
			max-height: 100%
			width: auto
			max-width: 100%
			margin: auto
			z-index: 3
			box-shadow: var(--shadow-contrast), 0 0 1px var(--shadow-ao-clr), 0 18px 30px -20px var(--shadow-huge-clr)
			background-size: contain
			border-radius: .5rem
		.image, .bg-cover
			&.thumb
				filter: blur(5px)
		&.no-image
			height: 6rem
			min-height: unset
			@media screen and (max-width: 600px)
				height: 5rem
	> .header
		padding: 2rem
		@media (prefers-contrast: more)
			border-top: solid 1px var(--border-hard)
		@media screen and (max-width: 600px)
			flex-wrap: wrap
			padding: 1rem
		> .left-wrapper, > .right-wrapper
			flex: 1 1 50%
			@media screen and (max-width: 600px)
				flex: 1 1 100%
		> .left-wrapper > .name
			margin-bottom: 1rem
			letter-spacing: 0
		> .right-wrapper
			justify-content: flex-end
			@media screen and (max-width: 600px)
				flex-flow: nowrap column-reverse
				> *
					flex: 0 0 auto
					width: 100%
		.used-technologies
			.techno
				z-index: 0
				position: relative
				padding: 0.25rem 0.75rem
				line-height: 1
				text-decoration: none
				border-radius: 1rem
				color: var(--font-heading-clr)
				transition: var(--transition)
				transition-property: transform, box-shadow, color
				will-change: transform, box-shadow, color
				> .color
					z-index: -1
					position: absolute
					top: 0
					left: 0
					width: 100%
					height: 100%
					border-radius: 1rem
					opacity: 0.1
					transition: var(--transition)
					transition-property: opacity, background-color
				> .logo
					height: 1.25rem
					width: 1.25rem
				> img.logo
					object-fit: contain
					object-position: center
				> .name
					font-size: 0.85rem
				&:hover, &:focus
					transform: translate(0, -0.25rem)
					box-shadow: 0 0 1px var(--shadow-ao-clr), 0 10px 20px -10px var(--shadow-huge-clr)
					> .color
						opacity: 0.25
				@media (prefers-color-scheme: dark)
					> .color
						opacity: 0.25
					&:hover > .color
						opacity: 0.4
		.open-project, .open-project-soon, .open-source-code, .other-link
			padding: 0.5rem 1rem
			border-radius: 2rem
			text-decoration: none
			font-size: 1.15rem
			font-family: var(--font-heading-stack)
			color: var(--font-heading-clr)
			@media screen and (max-width: 600px)
				padding: 1rem
				font-size: 1rem
				flex-wrap: nowrap
			> .icon
				--icon: var(--font-base-clr-075)
		.open-source-code, .other-link
			transition: var(--transition)
			transition-property: opacity, background-color
			background-color: var(--font-base-clr-005)
			color: var(--font-base-clr)
			&:hover, &:focus
				background-color: var(--font-base-clr-015)
				color: var(--font-heading-clr)
				@media (prefers-color-scheme: dark)
					background-color: var(--font-base-clr-015)
		.closed-source
			padding: 0.5rem 1rem
			color: var(--font-base-clr-05)
			border-radius: 2rem
			font-size: 1rem
			> .icon
				--icon: var(--font-base-clr-035)
			@media (prefers-contrast: more)
				color: var(--font-base-clr)
				> .icon
					--icon: var(--font-base-clr)
			@media screen and (max-width: 600px)
				padding: 1rem
		.closed-source, .open-source-code
			@media screen and (max-width: 600px)
				margin: 0
		.open-project
			position: relative
			background-color: var(--clr-accent)
			color: #fff
			overflow: hidden
			transition: var(--transition)
			transition-property: transform, box-shadow, color
			contain: content
			.icon
				--icon: #fff
			.shine
				position: absolute
				left: 0
				top: 0
				height: 100%
				width: 100%
				background: #fff
				$transparent: rgba(255,255,255, 0)
				$fill: rgba(255,255,255, 0.15)
				background: -moz-linear-gradient(90deg, $transparent 30%, $fill 30%, $fill 70%, $transparent 70%)
				background: -webkit-linear-gradient(90deg, $transparent 30%, $fill 30%, $fill 70%, $transparent 70%)
				background: linear-gradient(90deg, $transparent 30%, $fill 30%, $fill 70%, $transparent 70%)
				transform: skew(35deg) translate(-100%,0)
				transition: var(--transition)
				transition-property: transform, box-shadow, color
				will-change: transform, box-shadow, color
			&:hover, &:focus
				box-shadow: 0 0 1px var(--shadow-ao-clr), 0 5px 20px -8px var(--clr-accent)
				transform: scale(1.05)
				.shine
					transition-duration: 1s
					transform: skew(35deg) translate(100%, 0)
		.open-project-soon
			cursor: default
			background-color: var(--font-base-clr-01)
	> .about
		position: relative
		min-height: 25vh
		> .seperator
			position: absolute
			left: 0
			right: 0
			margin: 0
			&.top
				top: 0px
				transform: scaleY(-1)
			&.bot
				bottom: 0px
		> .about-header
			width: 100%
			max-width: $aboutContentWidth
			margin: auto
			padding: 2rem
			@media screen and (max-width: 600px)
				padding: 1rem
			padding-bottom: 0
			> .load-different-lang > .disclosure
				position: relative
				@media screen and (max-width: 600px)
					width: 100%
				> .loaded-translation
					padding: 0.5em 1em
					background-color: var(--box-bg)
					border-radius: 2em
					box-shadow: var(--shadow-0)
					transition: var(--transition)
					transition-property: background-color, color
					@media screen and (max-width: 600px)
						width: 100%
						padding: 1em 1.5em
					.icon
						font-size: 1.25em
					&:hover, &:focus, &:active, &.active
						background-color: var(--clr-accent)
						color: #fff
						.icon
							--icon: #fff
					&:active, &.active
						background-color: var(--font-base-clr)
						color: var(--page-bg)
						.icon
							--icon: var(--page-bg)
				> .options
					position: absolute
					top: auto
					right: auto
					min-width: 100%
					padding: 0.5em
					border-radius: 0.5em
					box-shadow: var(--shadow-4)
					background-color: var(--box-bg)
					.option
						padding: 0.5em 1em
						border-radius: 0.25em
						transition: var(--transition)
						transition-property: background-color, color
						> .label
							margin-right: 0.5em
						&:hover, &:focus
							background-color: var(--font-base-clr-01)
						&:active
							background-color: var(--font-base-clr-025)
			> .metadata
				font-size: 0.85em
				> div
					border-radius: 0.5rem
					background-color: var(--box-bg)
					box-shadow: 0 0 1px var(--shadow-ao-clr), 0 3px 6px -4px var(--shadow-big-clr), var(--shadow-contrast)
					> span
						padding: 0.5em
					> span:first-child
						background-color: var(--font-base-clr-005)
						border-radius: 0.5rem 0 0 0.5rem
					> span:last-child
						color: var(--font-heading-clr)
		> .lang-unavailable
			width: 100%
			padding: 2em 1em
			text-align: center
			> p
				max-width: 500px
				margin-bottom: 1em
				&.no-translations
					color: var(--font-base-clr-05)
			> .options
				> .option
					padding: 0.5em
					border-radius: 0.5em
					background-color: var(--box-bg)
					box-shadow: var(--shadow-1)
					transition: var(--transition)
					transition-property: background-color, box-shadow, color, transform
					&:hover, &:focus
						box-shadow: var(--shadow-bevel), 0 0 1px var(--shadow-ao-clr), 0 6px 16px var(--clr-accent-05)
						transform: translateY(-0.25em)
						background-color: var(--clr-accent)
						color: #fff
						@media (prefers-color-scheme: dark)
							box-shadow: var(--shadow-bevel), 0 0 1px var(--shadow-ao-clr), 0 6px 16px var(--clr-accent-025)
					&:active, &:focus
						box-shadow: var(--shadow-1)
						transform: translateY(0.15em)
						background-color: var(--clr-accent-dark)
						color: #fff
		> .placeholder
			pointer-events: none
			user-select: none
			h1, h3, p, .image
				position: relative
				margin-bottom: 1rem
				background-color: var(--font-base-clr-005)
				overflow: hidden
				border-radius: 0.5rem
				color: transparent
				&:after
					content: ''
					position: absolute
					top: 0
					left: 0
					width: 100%
					height: 100%
					background: transparent
			h1
				display: inline-block
				margin: 0
				padding: 0 0.25rem
				line-height: 1.25
				font-size: 2.5em
			.h1-border
				width: 100%
				margin: 0.25rem 0 1rem 0
				border: solid var(--border-soft)
				border-width: 1px 0 0
			h3
				width: 25%
				margin-top: 1.5rem
				line-height: 1.25
			p
				&.i
					width: 68%
				&.ii
					width: 85%
				&.iii
					width: 38%
			&.error
				h1
					color: var(--clr-red)
				h1, h3, p, .image
					background-color: var(--clr-red-01)
					transition: 1s var(--transition-easing)
					transition-property: background-color, color
			&:not(.error)
				h1, h3, p, .image
					&:after
						content: ''
						position: absolute
						top: 0
						left: 0
						width: 100%
						height: 100%
						animation: textLoading 2s linear infinite
						background: transparent
						$transparent: rgba(255,255,255, 0)
						background: -moz-linear-gradient(90deg, $transparent 0%, var(--ghost-loader) 50%, $transparent 100%)
						background: -webkit-linear-gradient(90deg, $transparent 0%, var(--ghost-loader) 50%, $transparent 100%)
						background: linear-gradient(90deg, $transparent 0%, var(--ghost-loader) 50%, $transparent 100%)
		> .rtf-content, > .placeholder, > .error
			width: 100%
			max-width: $aboutContentWidth
			margin: auto
			padding: 2rem
			@media screen and (max-width: 1000px)
				padding: 2rem 1rem
	> .footer
		padding: 2rem
		border-radius: inherit
		border-top-left-radius: 0
		border-top-right-radius: 0
		@media screen and (max-width: 600px)
			padding: 1rem
		.share-option
			position: relative
			.status
				z-index: 10
				position: absolute
				left: auto
				bottom: 150%
				margin: 0
				padding: 1rem
				background-color: var(--box-bg)
				box-shadow: 0 0 1px var(--shadow-ao-clr), 0 10px 40px 0 var(--shadow-huge-clr)
				border-radius: 0.5rem
				transition: var(--transition)
				transition-property: opacity, transform
				pointer-events: none
				color: var(--font-heading-clr)
				contain: layout
				&:not(.active)
					opacity: 0
					transform: translateY(2rem)
				> .label
					font-size: 0.85rem
				:global > .icon
					width: 6rem
					height: 6rem
				&:before
					content: ''
					position: absolute
					bottom: -2rem
					border: solid 1rem transparent
					border-top-color: var(--box-bg)
			&:hover, &:active, &:focus, &.is-sharing
				background-color: var(--clr-accent)
				transform: translateY(-0.25rem)
				box-shadow: 0 0 2px var(--shadow-ao-clr), 0 8px 20px var(--clr-accent-05)
				color: #fff
				.icon
					--icon: #fff
				@media (prefers-color-scheme: dark)
					box-shadow: 0 0 2px var(--shadow-ao-clr), 0 8px 20px var(--clr-accent-025)
			&:active, &:focus
				transform: translateY(0.15rem)
			&.is-sharing
				background-color: var(--font-base-clr)
				box-shadow: 0 0 2px var(--shadow-ao-clr), 0 8px 20px var(--shadow-clr)
				color: var(--page-bg)
				.icon
					--icon: var(--page-bg)
		.close
			border-radius: 2rem
			&:hover, &:focus
				background-color: var(--font-base-clr)
				transform: translateY(-0.25rem)
				box-shadow: var(--shadow-4)
				color: var(--page-bg)
				.icon
					--icon: var(--page-bg)
			&:active
				background-color: var(--font-heading-clr)
				transform: translateY(0.15rem)
				box-shadow: var(--shadow-3)
				color: #fff
				.icon
					--icon: #fff
		.share-option, .close
			padding: 0.75rem 1rem
			background-color: var(--font-base-clr-01)
			border-radius: 2rem
			transition: var(--transition)
			transition-property: background-color, transform, box-shadow
			@media screen and (max-width: 600px)
				padding: 0.75rem 1.25rem
				font-size: 1rem
		@media screen and (max-width: 600px)
			display: grid
			grid-template-columns: 1fr 1fr
			grid-template-areas: 'close close' 'copy-url share-with'
			gap: 1rem
			.close
				margin-left: unset
			&.sharing-not-supported
				grid-template-areas: 'close copy-url'

@media (prefers-color-scheme: dark)
	#Project_Details_Modal
		> .header, > .footer
			background-color: var(--font-base-clr-005)

@keyframes textLoading
	from
		transform: translate(125%, 0) skew(-45deg)
	to
		transform: translate(-125%, 0) skew(-45deg)

@media (prefers-contrast: more)
	#Project_Details_Modal
		> .header .used-technologies .techno,
		> .header .open-project, > .header .open-source-code,
		> .header .closed-source, > .header .open-project-soon,
		> .header .other-link, > .footer button, > .footer a
			border: solid 1px var(--border-hard) !important
</style>
