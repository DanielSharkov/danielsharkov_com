<div id='Project_Details_Container'>
	<div class='bg' transition:bgTrans/>
	<div id='Project_Details_Modal' class='grid' transition:modalTrans class:no-about={project.about === null}>
		<button class='close-modal flex flex-center' on:click={closeModal}>
			<svg class='icon stroke icon-big' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 120 120'>
				<path d='M10 110l50-50m0 0l50-50M60 60l50 50M60 60L10 10' stroke-width='.25rem' stroke-linecap='round' stroke-linejoin='round'/>
			</svg>
		</button>
		<div class='image-container flex flex-center block-select'
		class:no-image={ !project.cover }
		class:dark-theme={ project.darkTheme }>
			{#if project.cover}
				<div class='light flex flex-center'>
					{#if !$GlobalStore.projectImgLoad[project.id].light}
					<div
						class='thumb bg-cover'
						style='background-image: url(projects/{project.id}/thumbnail.jpg)'
					/>
					<div
						class='thumb image'
						style='background-image: url(projects/{project.id}/thumbnail.jpg)'
					/>
					{/if}
					{#if $GlobalStore.projectImgLoad[project.id].light}
						<div
							class='bg-cover'
							style='background-image: url(projects/{project.id}/cover.png)'
						/>
						<img
							class='image'
							src='projects/{project.id}/cover.png'
							alt='{project.id} cover'
						/>
					{/if}
				</div>
				{#if project.darkTheme}
					<div class='dark flex flex-center'>
						{#if !$GlobalStore.projectImgLoad[project.id].dark}
						<div
							class='thumb bg-cover'
							style='background-image: url(projects/{project.id}/thumbnail_dark.jpg)'
						/>
						<div
							class='thumb image'
							style='background-image: url(projects/{project.id}/thumbnail_dark.jpg)'
						/>
						{/if}
						{#if $GlobalStore.projectImgLoad[project.id].dark}
							<div
								class='bg-cover'
								style='background-image: url(projects/{project.id}/cover_dark.png)'
							/>
							<img
								class='image'
								src='projects/{project.id}/cover_dark.png'
								alt='{project.id} dark cover'
							/>
						{/if}
					</div>
				{/if}
			{:else if project.about === null}
				<svg class='no-image icon' fill='none' aria-hidden='true' focusable='false' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'>
					<path d='M84.2922 34.7947L84.9993 35.5018L120.855 -0.353501L120.147 -1.06061L84.2922 34.7947Z' class='fill' opacity='.1'/>
					<path d='M85.5569 84.9356L84.8498 85.6427L119.562 120.355L120.269 119.647L85.5569 84.9356Z' class='fill' opacity='.1'/>
					<path d='M35.5018 84.9993L34.7947 84.2922L-0.0606959 119.148L0.646411 119.855L35.5018 84.9993Z' class='fill' opacity='.1'/>
					<path d='M35.3523 36.1452L36.0594 35.4381L0.0606224 -0.560669L-0.646484 0.146438L35.3523 36.1452Z' class='fill' opacity='.1'/>
					<path d='M89.5 46V77C89.5 77.8284 88.8284 78.5 88 78.5H32C31.1716 78.5 30.5 77.8284 30.5 77V46C30.5 45.1716 31.1716 44.5 32 44.5H44.6667C45.6759 44.5 46.5862 43.8932 46.9744 42.9615L49.6987 36.4231C49.9316 35.8641 50.4778 35.5 51.0833 35.5H53.5H60H66.5H68.9167C69.5222 35.5 70.0684 35.8641 70.3013 36.4231L73.0256 42.9615C73.4138 43.8932 74.3241 44.5 75.3333 44.5H88C88.8284 44.5 89.5 45.1716 89.5 46Z' opacity='.5' class='stroke'/>
					<circle cx='60' cy='60' r='9.5' opacity='.5' class='stroke'/>
				</svg>
			{/if}
		</div>
		<div class='header grid gap-2'>
			<div class='left-piece grid gap-1'>
				<h1 class='name'>{ project.name }</h1>
				<div class='used-technologies flex list gap-05'>
					{#each project.usedTechnologies as techno, idx}
						<a href={technologies[techno].link} target='_blank' class='techno flex flex-center gap-05' on:click={vibrate}>
							<div
								class='color'
								style='background-color: {technologies[techno].color}'
							/>
							{#if technologies[techno].icon}
								<svg class='logo'>
									<title>{techno} Logo</title>
									<use xlink:href='#LOGO_{techno}'/>
								</svg>
							{:else if technologies[techno].image}
								<img
									class='logo'
									src='technologies/logo_{techno}.png'
									alt='{techno} Logo'
								/>
							{/if}
							<span class='name'>
								{ technologies[techno].name }
							</span>
						</a>
					{/each}
				</div>
			</div>
			<div class='right-piece flex' class:single-btn={anyHeaderBtnActive} class:no-btn={noHeaderBtn}>
				{#if project.codeUrl}
					<a href={project.codeUrl} class='open-source-code flex flex-center gap-05' target='_blank' on:click={(e)=> vibrateLink(e)}>
						<svg class='icon fill icon-medium' viewBox='0 0 120 120' fill='none' xmlns='http://www.w3.org/2000/svg'>
							<path d='M42.0439 53.512L17.2039 62.8L42.0439 72.088V79.576L8.85188 66.688V58.912L42.0439 46.024V53.512ZM68.2406 27.376H76.3046L52.5446 95.2H44.4806L68.2406 27.376ZM111.231 58.912V66.688L78.0394 79.576V72.088L102.879 62.8L78.0394 53.512V46.024L111.231 58.912Z'/>
						</svg>
						<span class='label'>Source code</span>
					</a>
				{/if}
				{#if project.codeUrl === null}
					<div class='closed-source flex flex-center gap-05'>
						<svg class='icon stroke icon-default' viewBox='0 0 120 120' fill='none' xmlns='http://www.w3.org/2000/svg'>
							<path d='M16.5 53C16.5 49.4101 19.4101 46.5 23 46.5H60H97C100.59 46.5 103.5 49.4101 103.5 53V97C103.5 100.59 100.59 103.5 97 103.5H23C19.4101 103.5 16.5 100.59 16.5 97V53Z' stroke-width='.5rem'/>
							<path d='M78 45V33C78 23.0589 69.9411 15 60 15V15C50.0589 15 42 23.0589 42 33V45' stroke-width='.5rem'/>
							<line x1='60' y1='67' x2='60' y2='83' stroke-width='.6rem' stroke-linecap='round' stroke-linejoin='round'/>
						</svg>
						<span class='label'>Closed source</span>
					</div>
				{/if}
				{#if project.projectUrl !== null && project.projectUrl !== 'COMING_SOON'}
					<a href={project.projectUrl} class='open-project flex flex-center gap-05' target='_blank' on:click={(e)=> vibrateLink(e)}>
						<div class='shine'/>
						<span class='label'>Projekt öffnen</span>
						<svg class='icon stroke icon-medium' viewBox='0 0 120 120' fill='none' xmlns='http://www.w3.org/2000/svg'>
							<path d='M57.7778 25H35C29.4772 25 25 29.4772 25 35V85C25 90.5228 29.4772 95 35 95H85C90.5228 95 95 90.5228 95 85V62.2222' stroke-width='.5rem' stroke-linecap='round' stroke-linejoin='round'/>
							<path d='M105 15L60 60M105 15L105 45M105 15L75 15' stroke-width='.5rem' stroke-linecap='round' stroke-linejoin='round'/>
						</svg>
					</a>
				{:else if project.projectUrl === 'COMING_SOON'}
					<div href={project.projectUrl} class='open-project-soon flex flex-center gap-05'>
						<span class='label'>Bald verfügbar</span>
						<svg class='icon stroke icon-medium' viewBox='0 0 120 120' fill='none' xmlns='http://www.w3.org/2000/svg'>
							<circle cx='60' cy='60' r='53' stroke-width='.5rem'/>
							<path d='M60 23V60L77 73' stroke-width='.5rem' stroke-linecap='round' stroke-linejoin='round'/>
						</svg>
					</div>
				{/if}
			</div>
		</div>
		{#if project.about}
			<div class='about' class:loading={ projectAbout !== null }>
				{#if projectAbout !== null && !(projectAbout instanceof Error)}
					<div class='rtf-content'>{@html renderedRTF}</div>
				{:else}
					<div class='placeholder' class:error-placeholder={projectAbout instanceof Error}>
						<h1>Entschuldige, irgendwas ist schief gelaufen.</h1>
						<hr class='h1-border'>
						<p class='i'>_</p>
						<h3>_</h3>
						<p class='ii'>_</p>
						<p class='iii'>_</p>
					</div>
				{/if}
			</div>
			<div class='footer grid grid-center-y'>
				<div class='share-post flex flex-center-y'>
					<span class='label'>Teilen:</span>
					<button
					class='share-option flex flex-center gap-05 nowrap'
					class:is-sharing={userIsSharingURL}
					on:click={shareURL}>
						<div class='status grid gap-05 grid-center-x' class:active={userIsSharingURL}>
							<span class='label'>
								{#if shareURLWasCanceled}
									Etwas ist schief gelaufen
								{:else if shareURLWasSuccess}
									URL Kopiert
								{:else}
									Wird kopiert...
								{/if}
							</span>
							<StatusIcon
								loading={userIsSharingURL}
								failed={shareURLWasCanceled}
								succeeded={shareURLWasSuccess}
							/>
						</div>
						<svg class='icon icon-default stroke' viewBox='0 0 120 120' fill='none' xmlns='http://www.w3.org/2000/svg'>
							<path d='M34.2893 54.7108L19.0614 69.9387C10.6513 78.3489 10.6513 91.9844 19.0614 100.395C27.4716 108.805 41.1071 108.805 49.5173 100.395L64.7452 85.1667C73.1553 76.7565 73.1553 63.121 64.7452 54.7108M85.0491 64.8628L100.277 49.6348C108.687 41.2247 108.687 27.5891 100.277 19.179C91.8669 10.7688 78.2313 10.7688 69.8212 19.179L54.5932 34.4069C52.0762 36.924 50.3124 39.9091 49.302 43.0821C46.9364 50.5109 48.7001 58.9697 54.5932 64.8628' stroke-width='.5rem' stroke-linecap='round' stroke-linejoin='round'/>
						</svg>
						<span class='label'>URL kopieren</span>
					</button>
					<button
					class='share-option flex flex-center gap-05 nowrap'
					class:is-sharing={userIsSharing}
					on:click={shareThis}>
						<div class='status grid gap-05 grid-center-x' class:active={userIsSharing}>
							<span class='label'>
								{#if shareNotSupported}
									Dein Browser unterstützt leider diese Funktion nicht
								{:else if shareWasCanceled}
									Abgebrochen
								{:else if shareWasSuccess}
									Geteilt
								{:else}
									Wird geteilt...
								{/if}
							</span>
							<StatusIcon
								loading={userIsSharing}
								failed={shareWasCanceled || shareNotSupported}
								succeeded={shareWasSuccess}
							/>
						</div>
						<svg class='icon stroke icon-default' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120' fill='none'>
							<path d='M45.25 40H35C29.4772 40 25 44.4772 25 50V100C25 105.523 29.4772 110 35 110H85C90.5229 110 95 105.523 95 100V50C95 44.4772 90.5229 40 85 40H74.75M60.5 10V70M60.5 10L77 26.5M60.5 10L44 26.5' stroke-width='.5rem' stroke-linecap='round' stroke-linejoin='round'/>
						</svg>
						<span class='label'>Teilen mit...</span>
					</button>
					<!-- {#if isSharingSupported}
					{/if} -->
				</div>
				<button class='close flex flex-center-y flex-self-right gap-1 nowrap' on:click={closeModal}>
					<svg class='icon stroke icon-small' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 120 120'>
						<path d='M10 110l50-50m0 0l50-50M60 60l50 50M60 60L10 10' stroke-width='.5rem' stroke-linecap='round' stroke-linejoin='round'/>
					</svg>
					<span>Schließen</span>
				</button>
			</div>
		{/if}
	</div>
</div>

<script lang='ts'>
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()
	import { cubicInOut } from 'svelte/easing'
	import { projects, technologies } from './database'
	import Marked from 'marked'
	import { GlobalStore } from './global_store'
	import { vibrate, vibrateLink, copyToClipboard } from './utils/misc'
	import StatusIcon from './StatusIcon.svelte'

	function closeModal() {
		vibrate()
		dispatch('close')
	}

	export let projectIndex: number
	const project: Project = projects[projectIndex]

	const bgTrans =()=> ({
		duration: 500,
		css: (t)=> `opacity: ${cubicInOut(t)}`,
	})

	const modalTrans =()=> ({
		duration: 500,
		css(t) {
			t = cubicInOut(t)
			return `opacity: ${t}; transform: translate(0, ${8 - 8 * t}rem);`
		},
	})

	let renderedRTF = null
	let projectAbout = null
	async function fetchAbout() {
		try {
			const resp = await fetch(`projects/${project.id}/about/de.md`)
			if (resp.status !== 200) throw new Error('404')
			const text = await resp.text()
			projectAbout = text
			renderedRTF = Marked(projectAbout, {
				smartLists: true,
			})
			setTimeout(()=> {
				for (const link of document.querySelectorAll('.rtf-content a')) {
					link.setAttribute('target', '_blank')
				}
			})
		} catch(err) {
			setTimeout(()=> projectAbout = err, 1000)
		}
	}
	if (project.about) fetchAbout()

	const anyHeaderBtnActive = (
		project.codeUrl !== undefined && project.projectUrl === undefined ||
		project.codeUrl === undefined && project.projectUrl !== undefined
	)

	const noHeaderBtn = (
		project.codeUrl === undefined && project.projectUrl === null
	)

	let userIsSharingURL = false
	let shareURLWasCanceled = false
	let shareURLWasSuccess = false
	async function shareURL() {
		if (userIsSharingURL) return
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
	function shareThis() {
		if (userIsSharing) return
		shareWasCanceled = false
		shareWasSuccess = false
		shareURLReset()

		if (window.navigator?.share && window.location?.href) {
			vibrate()
			userIsSharing = true

			navigator.share({
				title: project.name + ' - A project by Daniel Sharkov',
				url: window.location.href,
			})
			.then(() => {
				vibrate([0,500,200,100,50])
				setTimeout(()=> {
					shareWasSuccess = true
					setTimeout(shareThisReset, 2000)
				})
			})
			.catch(()=> {
				vibrate([0,500,100,50,100])
				setTimeout(()=> {
					shareWasCanceled = true
					setTimeout(shareThisReset, 2000)
				})
			})
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

	// const isSharingSupported = window.navigator?.share !== undefined
</script>

<style>
	#Project_Details_Container
		z-index: 100
		position: fixed
		top: 0
		left: 0
		width: 100%
		height: 100%
		overflow-y: auto
		@media screen and (min-width: 600px)
			padding: 1rem
		> .bg
			z-index: -1
			position: fixed
			top: 0
			right: 0
			bottom: 0
			left: 0
			background-color: var(--overlay-bg)

	#Project_Details_Modal
		position: relative
		right: 0
		left: 0
		min-height: 100%
		background-color: var(--background)
		grid-template-rows: auto auto 1fr
		transform: translate3d(0,0,0)
		@media screen and (min-width: 600px)
			margin-bottom: 5rem
			box-shadow: 0 0 10px var(--foreground-025)
			border-radius: .5rem
		@media screen and (max-width: 600px)
			box-shadow: none !important
		> .close-modal
			z-index: 100
			position: absolute
			top: 1rem
			right: 1rem
			padding: .5rem
			background-color: var(--background)
			border: solid 1px var(--border-hard)
			border-radius: 2rem
			cursor: pointer
			line-height: 1
			transition: var(--transition)
			transition-property: transform, box-shadow, color
			&:hover, &:active
				transform: scale(1.1)
				border-color: var(--color-accent)
				.icon.stroke > *
					stroke: var(--color-accent)
			&:active
				transform: scale(0.95)
		> .image-container
			position: relative
			height: auto
			min-height: 65vh
			max-height: 65vh
			background-color: var(--foreground-0025)
			border-bottom: solid 1px var(--border-soft)
			overflow: hidden
			@media screen and (max-width: 600px)
				min-height: auto
				max-height: 55vh
			&.no-image
				height: 4.5rem
				min-height: unset
			.bg-cover
				position: absolute
				top: 0
				left: 0
				width: 100%
				height: 100%
				background-position: center
				background-repeat: no-repeat
				&.thumb
					filter: blur(5px)
				@media screen and (min-width: 600px)
					border-radius: .5rem .5rem 0 0
			> .light, > .dark
				top: 0
				right: 0
				bottom: 0
				left: 0
				padding: 1.5rem
				@media screen and (min-width: 600px)
					position: absolute
				@media screen and (max-width: 600px)
					padding: 5rem 1rem 2rem 1rem
			.bg-cover
				z-index: 1
				background-size: cover
				background-position: top
				opacity: .1
			.image
				height: auto
				max-height: 100%
				width: auto
				max-width: 100%
				margin: auto
				z-index: 3
				box-shadow:
					0 0 1px var(--foreground-01),
					0 18px 30px -20px var(--foreground-05)
				background-size: contain
				border-radius: .5rem
			.dark
				background-color: #000
			> .no-image
				width: 25%
				height: 25%
		> .header
			padding: 2rem
			grid-template-columns: 1fr auto
			@media screen and (max-width: 600px)
				grid-template-columns: 1fr
				padding: 1rem
			> .right-piece
				justify-content: flex-end
				align-content: center
				align-items: center
				@media screen and (max-width: 600px)
					display: grid
					grid-template-columns: 1fr 1fr
					grid-gap: .5rem
					&.single-btn
						grid-template-columns: 1fr
					&.no-btn
						display: none
			.used-technologies
				.techno
					z-index: 0
					position: relative
					padding: .25rem .75rem
					line-height: 1
					text-decoration: none
					border-radius: 1rem
					transition: var(--transition)
					transition-property: transform, box-shadow, color
					> .color
						z-index: -1
						position: absolute
						top: 0
						left: 0
						width: 100%
						height: 100%
						border-radius: 1rem
						opacity: .1
						transition: var(--transition)
						transition-property: opacity, background-color
					> .logo
						height: 1.25rem
						width: 1.25rem
					> img.logo
						object-fit: contain
						object-position: center
					> .name
						font-size: .85rem
					&:hover
						transform: translate(0, -.25rem)
						box-shadow:
							0 0 1px var(--foreground-01),
							0 10px 20px -10px var(--foreground-05)
						> .color
							opacity: .25
			.open-project, .open-project-soon, .open-source-code
				cursor: pointer
				padding: .5rem 1rem
				border-radius: 2rem
				text-decoration: none
				font-size: 1.15rem
				@media screen and (max-width: 600px)
					padding: .5rem
					font-size: 1rem
					flex-wrap: nowrap
			.open-source-code
				margin-right: 1rem
				transition: var(--transition)
				transition-property: transform, box-shadow, color
				&:hover
					background-color: var(--foreground-01)
				&:not(:hover)
					opacity: .75
			.closed-source
				margin-right: 2rem
				color: var(--foreground-025)
				.icon.stroke > *
					stroke: var(--foreground-025)
			.closed-source, .open-source-code
				@media screen and (max-width: 600px)
					margin: 0
			.open-project
				position: relative
				background-color: var(--color-accent)
				color: #FFF
				overflow: hidden
				transition: var(--transition)
				transition-property: transform, box-shadow, color
				.icon.stroke > *
					stroke: #FFF
				.shine
					position: absolute
					left: 0
					top: 0
					height: 100%
					width: 100%
					background: rgb(#FFF)
					background: -moz-linear-gradient(90deg, rgba(#FFF,0) 30%, rgba(#FFF,.15) 30%, rgba(#FFF,.15) 70%, rgba(#FFF,0) 70%)
					background: -webkit-linear-gradient(90deg, rgba(#FFF,0) 30%, rgba(#FFF,.15) 30%, rgba(#FFF,.15) 70%, rgba(#FFF,0) 70%)
					background: linear-gradient(90deg, rgba(#FFF,0) 30%, rgba(#FFF,.15) 30%, rgba(#FFF,.15) 70%, rgba(#FFF,0) 70%)
					transform: skew(35deg) translate(-100%,0)
					transition: var(--transition)
					transition-property: transform, box-shadow, color
				&:hover
					box-shadow:
						0 0 1px var(--foreground-01),
						0 5px 20px -10px var(--color-accent)
					transform: scale(1.05)
					.shine
						transition-duration: 1s
						transform: skew(35deg) translate(100%,0)
			.open-project-soon
				cursor: default
				background-color: var(--foreground-01)
		> .about
			border-top: solid 1px var(--border-soft)
			border-bottom: solid 1px var(--border-soft)
			> .placeholder
				pointer-events: none
				user-select: none
				h1, h3, p, .image
					position: relative
					margin-bottom: 1rem
					background-color: var(--foreground-0025)
					overflow: hidden
					border-radius: .25rem
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
					padding: 0 .25rem
					line-height: 1.25
					font-weight: 300
				.h1-border
					width: 100%
					margin: .25rem 0 1rem 0
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
				&.error-placeholder
					h1
						color: var(--color-danger)
					h1, h3, p, .image
						background-color: var(--color-danger-01)
						transition-duration: 1s
				&:not(.error-placeholder)
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
							background: -moz-linear-gradient(90deg, rgba(#FFF, 0) 0%, var(--placeholder-loading) 50%, rgba(#FFF, 0) 100%)
							background: -webkit-linear-gradient(90deg, rgba(#FFF, 0) 0%, var(--placeholder-loading) 50%, rgba(#FFF, 0) 100%)
							background: linear-gradient(90deg, rgba(#FFF, 0) 0%, var(--placeholder-loading) 50%, rgba(#FFF, 0) 100%)
			> .rtf-content, > .placeholder, > .error-placeholder
				max-width: 1000px
				margin: auto
				padding: 2rem
				@media screen and (max-width: 1000px)
					padding: 2rem 1rem
			> .rtf-content
				font-size: 1.15rem
				@media screen and (max-width: 1000px)
					font-size: 1rem
		> .footer
			padding: 2rem
			grid-template-columns: auto auto
			justify-content: space-between
			grid-gap: 1rem
			@media screen and (max-width: 600px)
				padding: 2rem 1rem
				grid-template-columns: 1fr
				grid-gap: 2rem
			.share-post
				> .label
					margin-right: 1rem
				.share-option
					position: relative
					padding: .5rem 1rem
					background-color: var(--foreground-005)
					border-radius: 2rem
					transition: var(--transition)
					transition-property: background-color, transform, box-shadow
					cursor: pointer
					font-size: 1rem
					.status
						z-index: 10
						position: absolute
						left: auto
						bottom: 175%
						margin: 0
						padding: 1rem
						background-color: var(--modal-bg)
						box-shadow:
							0 0 1px var(--foreground-015),
							0 72px 10px -54px var(--foreground-01),
							0 10px 30px -10px var(--foreground-025)
						border-radius: .5rem
						transition: var(--transition)
						transition-property: opacity, transform
						pointer-events: none
						&:not(.active)
							opacity: 0
							transform: translate(0, 2rem)
						> .label
							font-weight: 600
							font-size: .75rem
						:global > .icon
							width: 6rem
							height: 6rem
						&:before
							content: ''
							position: absolute
							bottom: -2rem
							border: solid 1rem transparent
							border-top-color: var(--modal-bg)
					&:not(:last-child)
						margin-right: .5rem
					&:hover, &:active, &.is-sharing
						background-color: var(--color-accent)
						transform: translate(0, -.25rem)
						box-shadow:
							0 0 1px var(--foreground-01),
							0 10px 20px -10px var(--foreground-05)
						> .label
							color: #FFF
						.icon.fill > *
							fill: #FFF
						.icon.stroke > *
							stroke: #FFF
					&.is-sharing
						background-color: var(--foreground)
						> .label
							color: var(--background)
						.icon.fill > *
							fill: var(--background)
						.icon.stroke > *
							stroke: var(--background)
				@media screen and (max-width: 600px)
					> .label, .share-option
						margin: 0
						flex: 1 1 100%
					.share-option
						margin-top: 1rem
			.close
				padding: .5rem 1rem
				border-radius: 2rem
				font-size: 1.15rem
				cursor: pointer
				background-color: var(--foreground-005)
				transition: var(--transition)
				transition-property: transform, box-shadow, color
				&:hover
					transform: scale(1.05)
					background-color: var(--foreground-015)
		&.no-about
			grid-template-rows: 1fr auto
			margin-bottom: 0
			> .image-container
				height: auto

	@media (prefers-color-scheme: light)
		#Project_Details_Modal > .image-container .dark
			display: none

	@media (prefers-color-scheme: dark)
		#Project_Details_Modal
			box-shadow:
				0 0 2px var(--border-soft),
				0 6px 20px var(--foreground-015)
			> .image-container
				.image
					box-shadow:
						0 -1px 1px var(--foreground-025),
						0 1px 1px var(--background),
						0 18px 30px -20px var(--foreground-05)
				&.dark-theme .light
					display: none
			> .header
				.used-technologies .techno
					box-shadow:
						0 -1px 1px var(--foreground-025),
						0 1px 1px var(--background-05)
					> .color
						opacity: .25
					&:hover
						box-shadow:
							0 -1px 1px var(--foreground-025),
							0 1px 1px var(--background-05),
							0 10px 20px -10px var(--foreground-05)
						> .color
							opacity: .4
				.open-source-code:hover
					background-color: var(--foreground-015)
			> .footer
				.share-post .share-option
					box-shadow:
						0 -1px 1px var(--foreground-025),
						0 1px 1px var(--background-05)
					&:hover
						box-shadow:
							0 -1px 1px var(--foreground-025),
							0 1px 1px var(--background-05),
							0 10px 20px -10px var(--foreground-05)
				.close
					background-color: var(--foreground-01)
					&:hover
						background-color: var(--foreground-025)
	
	@keyframes textLoading
		from
			transform: translate(125%, 0) skew(-45deg)
		to
			transform: translate(-125%, 0) skew(-45deg)
</style>
