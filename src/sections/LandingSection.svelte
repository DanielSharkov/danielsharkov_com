<script lang='ts'>
	import { cubicInOut } from 'svelte/easing'
	import { GlobalStore } from '../global_store'
	import { createEventDispatcher } from 'svelte'
	import { vibrate, vibrateLink } from '../utils/vibrate'
	const dispatch = createEventDispatcher()

	const profilePicUrl: string = '/me-myself-and-i.jpg'
	const professions: Array<string> = [
		'Software Engineer', 'FullStack WebDev',
		'UX & UI Designer', 'Junior DevOp',
	]

	let showBigProfilePicture = false
	const openBigProfilePicture =()=> {
		vibrate()
		GlobalStore.lockScroll('landing_big_profile_pic')
		showBigProfilePicture = true
	}
	const closeBigProfilePicture =()=> {
		vibrate()
		showBigProfilePicture = false
		GlobalStore.unlockScroll('landing_big_profile_pic')
	}

	let smallPictureEl = null

	const bigPicTrans =()=> ({
		duration: 600,
		css(t) {
			t = cubicInOut(t)
			return (
				`opacity: ${t};` +
				`transform: `+
					`scale(${.9 + .1 * t}) `+
					`translate(-${5 - 5 * t}rem, -${1 - t}rem);`
			)
		},
	})

	const bigPicBgTrans =()=> ({
		duration: 600,
		css: (t)=> `opacity: ${cubicInOut(t)}`,
	})

	const questions: object = {
		'projects': 'Was hast du bereits geschaffen?',
		'skills': 'Welche (programmier-) Sprachen sprichst du? (Fertigkeiten)',
		'worked-with': 'Wo hast du bereits gearbeitet?',
		'me-myself-and-i': 'Erzähl mir ein wenig über dich?',
		'get-in-touch': 'I würde dich gerne kontaktieren.',
	}
</script>


<section id='LandingSection'>
	<svg id='LandingCodingBG' viewBox='0 0 128 91' fill='none' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>
		<path d='M90.8928 20.304C81.5811 9.97438 97.7283 0 97.7283 0H128V87.8149C128 87.8149 85.4901 90.7668 93.308 73.0945C98.4599 61.4487 89.367 55.0853 97.217 40.3962C100.149 34.9103 99.1144 29.4244 90.8928 20.304Z' fill='url(#paint0_linear)'/>
		<path d='M90.8928 20.304C81.5811 9.97438 97.7283 0 97.7283 0H128V87.8149C128 87.8149 85.4901 90.7668 93.308 73.0945C98.4599 61.4487 89.367 55.0853 97.217 40.3962C100.149 34.9103 99.1144 29.4244 90.8928 20.304Z' fill='url(#pattern0)'/>
		<g opacity='0.25'>
			<path d='M91.5 0C91.5 0 86.1631 7.06026 88.1214 14.9719C86.7321 6.79253 97.7283 0 97.7283 0H91.5Z' fill='#E1C769'/>
			<path d='M94.8513 46.0436C95.3713 44.2961 96.1324 42.4256 97.217 40.3962C100.149 34.9103 99.1144 29.4244 90.8928 20.304C90.2987 19.645 89.8082 18.9873 89.4106 18.3337C89.4399 18.3891 89.4697 18.4446 89.5 18.5C91.3067 21.8122 92.796 24.0364 93.9407 25.7459C96.5975 29.7138 97.3978 30.9089 96 36.5C95.1652 39.8391 94.8114 43.0208 94.8513 46.0436Z' fill='#E1C769'/>
		</g>
		<g opacity='0.75'>
			<path d='M95 0C95 0 83.6728 8.40057 89.1794 17.9354C83.9654 8.50155 97.7283 0 97.7283 0H95Z' fill='#E1C769'/>
			<path d='M128 87.8149C128 87.8149 103.765 89.4978 95.2574 82.7149C103.903 97.6885 128 87.8149 128 87.8149Z' fill='#E1C769'/>
			<path d='M92.6529 74.9318C92.8084 74.3456 93.0253 73.7335 93.308 73.0945C95.6407 67.8214 95.053 63.6313 94.44 59.2609C94.2624 57.9946 94.0826 56.7131 93.9712 55.3858C93.3331 57.739 92.8055 60.4069 92.5 63.5C92.0587 67.9679 92.1469 71.7458 92.6529 74.9318Z' fill='#E1C769'/>
			<path d='M94.8756 25.2082C93.8007 23.6916 92.4808 22.0656 90.8928 20.304C92.4505 22.0844 93.7686 23.7098 94.8756 25.2082Z' fill='#E1C769'/>
		</g>
		<defs>
			<pattern id='pattern0' patternContentUnits='objectBoundingBox' width='1' height='1'>
				<image id='image0' width='1024' height='2146' xlink:href='/code-bg.png' transform='translate(-0.0478835) scale(0.00102516 0.000465983)'/>
			</pattern>
			<linearGradient id='paint0_linear' x1='108.668' y1='6.1376e-07' x2='178.511' y2='83.6924' gradientUnits='userSpaceOnUse'>
				<stop/><stop offset='1' stop-color='#403828'/>
			</linearGradient>
		</defs>
	</svg>
	{#if showBigProfilePicture}
		<div id='BigProfilePicture' class='flex flex-center'>
			<div
				class='bg'
				on:click={ closeBigProfilePicture }
				transition:bigPicBgTrans
			/>
			<div
				class='picture block-select'
				style='background-image: url({profilePicUrl})'
				transition:bigPicTrans
			/>
		</div>
	{/if}
	<div class='contents grid'>
		<div class='header grid grid-center-y gap-2'>
			<button
			bind:this={ smallPictureEl }
			class='picture block-select'
			on:click={ openBigProfilePicture }
			class:big-preview={ showBigProfilePicture }>
				<img class='block-select' src={profilePicUrl} alt='Me, Myself and I'/>
			</button>
			<div class='grid gap-05'>
				<h1 class='name'>Daniel Sharkov</h1>
				<div class='professions flex flex-center-y list gap-05'>
					{#each professions as job, idx}
						<span class='profession flex flex-center-y' style='animation-delay: {50 + idx * 100}ms'>
							{job}
						</span>
					{/each}
				</div>
				<div class='social-media flex flex-center-y gap-1'>
					{#each $GlobalStore.socialMedia as {name, url}, idx}
						<a href={url} target='_blank' style='animation-delay: {50 + idx * 100}ms' on:click={(e)=> vibrateLink(e)}>
							<svg class='logo icon-big'>
								<title>{name} Logo</title>
								<use xlink:href='#LOGO_{name}'/>
							</svg>
						</a>
					{/each}
				</div>
			</div>
		</div>
		<p class='text-block'>
			Hallo! Ich bin ein FullStack Software Engineer mit Fokus auf web app Front- & Backend Systeme.
			TypeScript, Svelte, Stylus, Vue.js, Go und viele weiter Werkzeuge sind Teil meines professionellen Arsenals.
			5 Jahre Erfahrung in UX & UI Design machen mich zu einem hervorragenden vielseitigen Entwickler.
		</p>
		<nav>
			<ul class='grid gap-1 question-list'>
				{#each Object.keys(questions) as questID, idx}
					<li class='question-entry flex flex-center-y gap-1' style='animation-delay: {50+idx*100}ms'>
						<svg class='icon fill icon-default flex-base-size' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 512'>
							<path d='M17.525 36.465l-7.071 7.07c-4.686 4.686-4.686 12.284 0 16.971L205.947 256 10.454 451.494c-4.686 4.686-4.686 12.284 0 16.971l7.071 7.07c4.686 4.686 12.284 4.686 16.97 0l211.051-211.05c4.686-4.686 4.686-12.284 0-16.971L34.495 36.465c-4.686-4.687-12.284-4.687-16.97 0z'/>
						</svg>
						<a
						href='#{questID}'
						class='question flex flex-center-y'
						on:click={ (e)=> {
							e.preventDefault()
							dispatch('goToSection', questID)
						}}>
							<span>{ questions[questID] }</span>
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</div>
</section>



<style lang='stylus'>
	#LandingSection
		min-height: 100%
		overflow: hidden
		@media screen and (min-width: 1000px)
			padding: 3rem
		@media screen and (max-width: 1000px)
			padding: 1.5rem
		@media screen and (max-width: 600px)
			padding: 1rem 1rem 2rem 1rem

	#LandingCodingBG
		z-index: -1
		position: absolute
		right: 0
		top: 0
		width: 165vh
		max-width: 100vw
		pointer-events: none
		animation: codeBgInAnim var(--transition-easing) 1.5s backwards
		@media screen and (max-width: 1000px)
			display: none

	#BigProfilePicture
		z-index: 100
		position: fixed
		top: 0
		left: 0
		width: 100%
		height: 100%
		padding: 3rem
		@media screen and (max-width: 1000px)
			padding: 2rem
		@media screen and (max-width: 600px)
			padding: 1rem
		> .bg
			z-index: -1
			position: absolute
			top: 0
			left: 0
			width: 100%
			height: 100%
			background-color: var(--overlay-bg)
		> .picture
			width: 65vh
			height: 100%
			border-radius: .5rem
			box-shadow:
				0 0 1px #000,
				0 20px 40px -20px #000
			background-color: var(--background)
			background-position: center
			background-repeat: no-repeat
			background-size: cover
			transform-origin: top left
			@media screen and (max-width: 600px)
				width: 100%
				height: 65%

	.contents
		@media screen and (min-width: 1200px)
			max-width: 75%
			grid-gap: 3rem
		@media screen and (max-width: 1200px)
			max-width: 70%
		@media screen and (max-width: 600px)
			max-width: 100%
		@media screen and (max-width: 1200px)
			grid-gap: 1.5rem
		.picture
			cursor: pointer
			animation: pictureInAnim var(--transition-easing) 1s
			img
				height: 12rem
				width: 12rem
				object-fit: cover
				object-position: center
				pointer-events: none
				transition-duration: .5s
				border-radius: 30%
				box-shadow:
					0 0 1px var(--foreground-015),
					0 14px 30px -14px var(--foreground-05)
				background-color: var(--foreground-0025)
				transform: translate3d(0,0,0)
				@media screen and (max-width: 1000px)
					margin: auto
			&.big-preview img
				transition-duration: 600
				opacity: 0
				transform: translate(5rem, 1rem)
			&:hover img
				transform: scale(1.1)
				border-radius: 10%
		> .header
			@media screen and (min-width: 1000px)
				grid-template-columns: auto 1fr
		.name
			font-weight: 300
			font-size: 3rem
			letter-spacing: .25rem
			animation: nameInAnim var(--transition-easing) 1s
			@media screen and (max-width: 1000px)
				font-size: 2.5rem
				text-align: center
			@media screen and (max-width: 500px)
				font-size: 2.25rem
		.professions
			@media screen and (min-width: 1000px)
				margin-left: .35rem
			@media screen and (max-width: 1000px)
				justify-content: center
				justify-items: center
			.profession
				color #b8a66a
				animation: professionInAnim var(--transition-easing) 1s alternate backwards
				transition: all var(--transition)
				&:not(:last-child):after
					content: ''
					margin-left: .5rem
					width: 1rem
					height: 1px
					background-color: var(--foreground)
					opacity: .15
		.social-media
			@media screen and (min-width: 1000px)
				margin-left: -.25rem
			@media screen and (max-width: 1000px)
				justify-content: center
				justify-items: center
			> a
				display: inline-block
				padding: .5rem
				opacity: .15
				cursor: pointer
				animation: socialMediaInAnim var(--transition-easing) 1s alternate backwards
				transition: all var(--transition)
				svg
					pointer-events: none
					> *
						fill: var(--foreground) !important
				&:hover
					opacity: 1
					transform: scale(1.25)
				@media screen and (max-width: 1000px)
					&:not(:last-child)
						margin-right: .5rem
		.text-block
			color: var(--foreground-075)
			width: 100%
			animation: nameInAnim var(--transition-easing) 2s
			@media screen and (min-width: 1200px)
				max-width: 60%
				font-size: 1.25rem
				line-height: 1.5
			@media screen and (min-width: 700px)
				max-width: 90%

	nav
		@media screen and (min-width: 1000px)
			padding-left: 1rem
		.question-list
			.question-entry
				animation: questionsInAnim var(--transition-easing) 1s alternate backwards
				@media screen and (max-width: 1000px)
					flex-wrap: nowrap
					align-items: baseline
				> .icon
					opacity: .25
					@media screen and (max-width: 1000px)
						margin-right: .5rem
				.question
					padding: 1rem
					border-radius: .5rem
					box-shadow:
						0 0 1px var(--foreground-01),
						0 1px 3px var(--foreground-015)
					cursor: pointer
					text-decoration: none
					line-height: 1.5
					transition: all var(--transition)
					@media screen and (min-width: 1000px)
						font-size: 1.15rem
					@media screen and (max-width: 1000px)
						flex: 1 1 auto
					span
						&:before
							content: '„'
							margin-right: .15rem
						&:after
							content: '“'
							margin-left: .15rem
						&:before, &:after
							opacity: .5
					&:hover
						transform: scale(1.05) translate(0, -.5rem)
						box-shadow:
							0 0 1px var(--foreground-015),
							0 0 30px var(--foreground-005),
							0 20px 30px -20px var(--foreground-05)
						color: var(--color-accent)
						@media screen and (max-width: 1000px)
							transform: scale(1.025) translate(0, -.5rem)

	@media (prefers-color-scheme: dark)
		.contents .picture img
			box-shadow:
				0 -1px 1px var(--foreground-015),
				0 1px 1px var(--background),
				0 14px 30px -12px var(--foreground-025)
		nav .question-list .question-entry .question
			background-color: var(--foreground-01)
			box-shadow:
				0 -1px 1px var(--foreground-015),
				0 1px 1px var(--background-075),
				0 3px 10px var(--foreground-01)
			&:hover
				box-shadow:
					0 -1px 1px var(--foreground-015),
					0 1px 1px var(--background-075),
					0 20px 30px -20px var(--foreground-025)

	@keyframes pictureInAnim
		0%
			opacity: 0
			transform: translate(-2rem, -2rem)
		100%
			opacity: 1
			transform: translate(0,0)

	@keyframes nameInAnim
		0%
			opacity: 0
			transform: translate(-2rem,0)
		100%
			opacity: 1
			transform: translate(0,0)

	@keyframes questionsInAnim
		0%
			opacity: 0
			transform: translate(-10rem,0)
		100%
			opacity: 1
			transform: translate(0,0)

	@keyframes socialMediaInAnim
		0%
			opacity: 0
			transform: translate(4rem,0)
		100%
			opacity: .15
			transform: translate(0,0)

	@keyframes professionInAnim
		0%
			opacity: 0
			transform: translate(4rem,0)
		100%
			opacity: 1
			transform: translate(0,0)

	@keyframes codeBgInAnim
		0%
			opacity: 0
			transform: translate(10rem,0)
		100%
			opacity: 1
			transform: translate(0,0)
</style>
