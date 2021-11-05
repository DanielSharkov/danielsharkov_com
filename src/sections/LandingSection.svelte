<script lang='ts'>
	import {cubicInOut} from 'svelte/easing'
	import {GlobalStore} from '../global_store'
	import {createEventDispatcher} from 'svelte'
	import {vibrate, vibrateLink} from '../utils/misc'
	const dispatch = createEventDispatcher()
	import {_} from 'svelte-i18n'
	import {LazyLoader, LazyLoadStatus} from '../utils/lazy_loader'

	let profilePicSrc = 'me-myself-and-i-thumb.jpg'
	let codingBgSrc = 'code-bg-thumb.png'
	const professions = [
		'software_engineer', 'fullstack_webdev',
		'ux_ui_designer', 'junior_devop',
	]
	const questions = [
		'projects', 'skills', 'me-myself-and-i', 'get-in-touch',
		// 'worked-with',
	]

	function goToSection(questID: string): void {
		dispatch('goToSection', questID)
	}

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

	let profilePicLazyloader = new LazyLoader('me-myself-and-i.jpg')
	profilePicLazyloader.load()
	profilePicLazyloader.subscribe((s)=> {
		if (s.status === LazyLoadStatus.DONE) {
			profilePicSrc = 'me-myself-and-i.jpg'
		}
		profilePicLazyloader.destroy()
	})
	let codingBgLazyloader = new LazyLoader('code-bg.png')
	codingBgLazyloader.load()
	codingBgLazyloader.subscribe((s)=> {
		if (s.status === LazyLoadStatus.DONE) {
			codingBgSrc = 'code-bg.png'
		}
		codingBgLazyloader.destroy()
	})

	function bigPicTrans(_, o?) {
		const reducedMotion = $GlobalStore.a11y.reducedMotion
		return {
			duration: !reducedMotion && 400,
			css(t) {
				t = cubicInOut(t)
				return (
					`opacity: ${t};` +
					`transform: `+
						`scale(${.9 + .1 * t}) `+
						`translate(-${5 - 5 * t}rem, -${1 - t}rem);`
				)
			},
		}
	}

	function bigPicBgTrans(_, o?) {
		const reducedMotion = $GlobalStore.a11y.reducedMotion
		return {
			duration: !reducedMotion && 400,
			css: (t)=> `opacity: ${cubicInOut(t)}`,
		}
	}
</script>


<section id='LandingSection' class='auto-height'>
	<svg id='LandingCodingBG' viewBox='0 0 128 91' aria-hidden='true' focusable='false' role='presentation' fill='none' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>
		<path d='M90.8928 20.304C81.5811 9.97438 97.7283 0 97.7283 0H128V87.8149C128 87.8149 85.4901 90.7668 93.308 73.0945C98.4599 61.4487 89.367 55.0853 97.217 40.3962C100.149 34.9103 99.1144 29.4244 90.8928 20.304Z' fill='url(#code_bg)'/>
		<path d='M90.8928 20.304C81.5811 9.97438 97.7283 0 97.7283 0H128V87.8149C128 87.8149 85.4901 90.7668 93.308 73.0945C98.4599 61.4487 89.367 55.0853 97.217 40.3962C100.149 34.9103 99.1144 29.4244 90.8928 20.304Z' fill='url(#code_bg_image)'/>
		<g opacity='0.25'>
			<path d='M91.5 0C91.5 0 86.1631 7.06026 88.1214 14.9719C86.7321 6.79253 97.7283 0 97.7283 0H91.5Z' fill='url(#code_bg_4fh89hn3)'/>
			<path d='M94.8513 46.0436C95.3713 44.2961 96.1324 42.4256 97.217 40.3962C100.149 34.9103 99.1144 29.4244 90.8928 20.304C90.2987 19.645 89.8082 18.9873 89.4106 18.3337C89.4399 18.3891 89.4697 18.4446 89.5 18.5C91.3067 21.8122 92.796 24.0364 93.9407 25.7459C96.5975 29.7138 97.3978 30.9089 96 36.5C95.1652 39.8391 94.8114 43.0208 94.8513 46.0436Z' fill='url(#code_bg_um0uf8e3)'/>
		</g>
		<g opacity='0.75'>
			<path d='M95 0C95 0 83.6728 8.40057 89.1794 17.9354C83.9654 8.50155 97.7283 0 97.7283 0H95Z' fill='url(#code_bg_4870n8fd)'/>
			<path d='M128 87.8149C128 87.8149 103.765 89.4978 95.2574 82.7149C103.903 97.6885 128 87.8149 128 87.8149Z' fill='url(#code_bg_u09fjdkm)'/>
			<path d='M92.6529 74.9318C92.8084 74.3456 93.0253 73.7335 93.308 73.0945C95.6407 67.8214 95.053 63.6313 94.44 59.2609C94.2624 57.9946 94.0826 56.7131 93.9712 55.3858C93.3331 57.739 92.8055 60.4069 92.5 63.5C92.0587 67.9679 92.1469 71.7458 92.6529 74.9318Z' fill='url(#code_bg_0dn09kmd)'/>
			<path d='M94.8756 25.2082C93.8007 23.6916 92.4808 22.0656 90.8928 20.304C92.4505 22.0844 93.7686 23.7098 94.8756 25.2082Z' fill='url(#code_bg_mlfu93jf)'/>
		</g>
		<path d='M90.8928 20.304C81.5811 9.97438 97.7283 0 97.7283 0H128V87.8149C128 87.8149 85.4901 90.7668 93.308 73.0945C98.4599 61.4487 89.367 55.0853 97.217 40.3962C100.149 34.9103 99.1144 29.4244 90.8928 20.304Z' fill='url(#code_bg_rainbow)' fill-opacity='0.15'/>
		<defs>
			<pattern id='code_bg_image' patternContentUnits='objectBoundingBox' width='1' height='1'>
				<image id='image0' width='1024' height='2146' xlink:href={codingBgSrc} transform='translate(-0.0478835) scale(0.00102516 0.000465983)'/>
			</pattern>
			<linearGradient id='code_bg' x1='108.668' y1='6.1376e-07' x2='178.511' y2='83.6924' gradientUnits='userSpaceOnUse'>
				<stop/><stop offset='1' stop-color='#403828'/>
			</linearGradient>
			<linearGradient id='code_bg_4fh89hn3' x1='93.1988' y1='1.73314e-07' x2='117.5' y2='55' gradientUnits='userSpaceOnUse'>
				<stop stop-color='#E1C769'/>
				<stop offset='1' stop-color='#0038FF'/>
			</linearGradient>
			<linearGradient id='code_bg_um0uf8e3' x1='93.1988' y1='1.73314e-07' x2='117.5' y2='55' gradientUnits='userSpaceOnUse'>
				<stop stop-color='#E1C769'/>
				<stop offset='1' stop-color='#0038FF'/>
			</linearGradient>
			<linearGradient id='code_bg_4870n8fd' x1='122' y1='87' x2='86' y2='97' gradientUnits='userSpaceOnUse'>
				<stop stop-color='#E1C769'/>
				<stop offset='1' stop-color='#FF004D'/>
			</linearGradient>
			<linearGradient id='code_bg_u09fjdkm' x1='122' y1='87' x2='86' y2='97' gradientUnits='userSpaceOnUse'>
				<stop stop-color='#E1C769'/>
				<stop offset='1' stop-color='#FF004D'/>
			</linearGradient>
			<linearGradient id='code_bg_0dn09kmd' x1='122' y1='87' x2='86' y2='97' gradientUnits='userSpaceOnUse'>
				<stop stop-color='#E1C769'/>
				<stop offset='1' stop-color='#FF004D'/>
			</linearGradient>
			<linearGradient id='code_bg_mlfu93jf' x1='122' y1='87' x2='86' y2='97' gradientUnits='userSpaceOnUse'>
				<stop stop-color='#E1C769'/>
				<stop offset='1' stop-color='#FF004D'/>
			</linearGradient>
			<linearGradient id='code_bg_rainbow' x1='106' y1='-5.5' x2='157.999' y2='75.0645' gradientUnits='userSpaceOnUse'>
				<stop stop-color='#FF7A00'/>
				<stop offset='0.151042' stop-color='#FFE300'/>
				<stop offset='0.307292' stop-color='#74FF33'/>
				<stop offset='0.479167' stop-color='#00DD8D'/>
				<stop offset='0.671875' stop-color='#3AB8FF'/>
				<stop offset='0.8125' stop-color='#A661FF'/>
				<stop offset='1' stop-color='#FF03D7'/>
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
				style='background-image: url({profilePicSrc})'
				transition:bigPicTrans
			/>
		</div>
	{/if}
	<div class='contents grid'>
		<div class='header grid grid-center-y gap-2'>
			<button
			class='picture block-select'
			on:click={openBigProfilePicture}
			class:big-preview={showBigProfilePicture}>
				<img class='block-select' src={profilePicSrc} alt='Me, Myself and I'/>
			</button>
			<div class='grid gap-05'>
				<h1 class='name'>{$_('my_name')}</h1>
				<div class='professions flex flex-center-y list gap-05'>
					{#each professions as pfsn, idx}
						<span class='profession flex flex-center-y' style='animation-delay: {50 + idx * 100}ms'>
							{$_('section.landing.profession.' + pfsn)}
						</span>
					{/each}
				</div>
				<ul role='listbox' class='social-media flex flex-center-y gap-1'>
					{#each $GlobalStore.socialMedia as {name, url}, idx}
						<a href={url} target='_blank' role='listitem' style='animation-delay: {50 + idx * 100}ms' use:vibrateLink>
							<svg class='logo icon-big' aria-hidden='true' focusable='false' role='presentation'>
								<title>{name}</title>
								<use xlink:href='#LOGO_{name}'/>
							</svg>
						</a>
					{/each}
				</ul>
			</div>
		</div>
		<p class='text-block'>{$_('about_me')}</p>
		<nav>
			<ul class='grid gap-1 question-list' role='list'>
				{#each questions as questID, idx}
					<li role='listitem' class='question-entry flex flex-center-y nowrap gap-1' style='animation-delay: {50+idx*100}ms'>
						<svg class='icon stroke icon-default flex-base-size' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120' aria-hidden='true' focusable='false' role='presentation' fill='none'>
							<path d='M39.2134 102.64L81.6398 60.2132L39.2134 17.7868' stroke-width='20' stroke-linecap='round' stroke-linejoin='round'/>
						</svg>
						<a href='#{questID}' role='button' class='question flex flex-center-y' on:click|preventDefault={()=> goToSection(questID)}>
							<q>{$_('section.landing.question.' + questID)}</q>
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</div>
</section>



<style lang='stylus'>
	#LandingSection
		overflow: hidden
		@media screen and (min-width: 1000px)
			padding: 3rem
		@media screen and (min-width: 1400px)
			min-height: 75%
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
		@media screen and (max-width: 600px)
			display: none

	#BigProfilePicture
		z-index: 100
		position: fixed
		top: 0
		left: 0
		width: 100%
		height: 100%
		padding: 3rem
		@media screen and (min-width: 600px)
			padding: 2rem
		@media screen and (max-width: 599px)
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
				0 0 1px var(--shadow-ao-clr),
				0 20px 40px -20px var(--shadow-hude-clr)
			background-color: var(--bg-clr)
			background-position: center
			background-repeat: no-repeat
			background-size: cover
			transform-origin: top left
			@media screen and (max-width: 600px)
				width: 100%
				height: 65%

	.contents
		@media screen and (min-width: 1400px)
			max-width: 75%
			grid-gap: 3rem
		@media screen and (min-width: 1200px)
			max-width: 70%
		@media screen and (max-width: 1200px)
			max-width: 70%
		@media screen and (max-width: 600px)
			max-width: 100%
		@media screen and (max-width: 1200px)
			grid-gap: 1.5rem
		.picture
			animation: pictureInAnim var(--transition-easing) 1s
			img
				height: 12rem
				width: 12rem
				object-fit: cover
				object-position: center
				pointer-events: none
				transition-duration: .5s
				border-radius: 30%
				box-shadow: var(--shadow-5)
				background-color: var(--font-base-clr-0025)
				transform: translate3d(0,0,0)
				@media screen and (max-width: 600px)
					margin: auto
			&.big-preview img
				transition-duration: 600
				opacity: 0
				transform: translate(5rem, 3rem) scale(1.2)
			&:hover img
				transform: scale(1.1)
				border-radius: 10%
		> .header
			@media screen and (min-width: 600px)
				grid-template-columns: auto 1fr
		.name
			font-weight: 400
			font-size: 3rem
			letter-spacing: .25rem
			animation: nameInAnim var(--transition-easing) 1s
			@media screen and (max-width: 900px)
				font-size: 1.75rem
			@media screen and (max-width: 600px)
				font-size: 2.25rem
				text-align: center
			@media screen and (max-width: 500px)
				font-size: 2.15rem
		.professions
			@media screen and (min-width: 600px)
				margin-left: .35rem
			@media screen and (max-width: 599px)
				justify-content: center
				justify-items: center
			.profession
				color: var(--color-complementary)
				animation: professionInAnim var(--transition-easing) 1s alternate backwards
				&:not(:last-child):after
					content: ''
					margin-left: .5rem
					width: 1rem
					height: 1px
					background-color: var(--font-base-clr-01)
		.social-media
			@media screen and (min-width: 600px)
				margin-left: -.25rem
			@media screen and (max-width: 599px)
				justify-content: center
				justify-items: center
			> a
				display: inline-block
				padding: .5rem
				opacity: .25
				animation: socialMediaInAnim var(--transition-easing) 1s alternate backwards
				transition: var(--transition)
				transition-property: opacity, transform
				will-change: opacity, transform
				svg
					pointer-events: none
					> *
						fill: var(--font-base-clr) !important
				&:hover
					opacity: 1
					transform: scale(1.25)
				@media screen and (max-width: 600px)
					&:not(:last-child)
						margin-right: .5rem
		.text-block
			width: 100%
			animation: nameInAnim var(--transition-easing) 2s
			@media screen and (min-width: 1200px)
				max-width: 60%
				font-size: 1.25rem
				line-height: 1.5
			@media screen and (min-width: 700px)
				max-width: 90%

	nav
		@media screen and (min-width: 600px)
			padding-left: 1rem
		.question-list
			.question-entry
				animation: questionsInAnim var(--transition-easing) 1s alternate backwards
				@media screen and (max-width: 600px)
					flex-wrap: nowrap
					align-items: baseline
				> .icon
					&.stroke > *
						stroke: var(--font-base-clr-01)
					@media screen and (max-width: 600px)
						margin-right: .5rem
				.question
					padding: 1rem
					border-radius: .5rem
					box-shadow: var(--shadow-1)
					text-decoration: none
					line-height: 1.5
					transition: var(--transition)
					color: var(--font-heading-clr)
					transition-property: box-shadow, transform, color
					will-change: box-shadow, transform, color
					background-color: var(--fg-clr)
					@media screen and (min-width: 600px)
						font-size: 1.15rem
					@media screen and (max-width: 600px)
						flex: 1 1 auto
					> q
						&:before, &:after
							opacity: .5
					&:hover
						transform: scale(1.025) translate(0, -.5rem)
						box-shadow: var(--shadow-5)
						color: var(--color-accent)
						@media screen and (max-width: 1000px)
							transform: scale(1.025) translate(0, -.5rem)

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
			opacity: .25
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

	@media (prefers-contrast: more)
		.contents .social-media > a
			opacity: 1
</style>
