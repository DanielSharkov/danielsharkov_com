<script lang='ts'>
	import {createEventDispatcher, onDestroy} from 'svelte'
	const dispatch = createEventDispatcher()
	import type {Project} from '../database'
	import {projects} from '../database'
	import {GlobalStore} from '../global_store'
	import {vibrate} from '../utils/misc'
	import {_} from 'svelte-i18n'
	import {LazyLoader, LazyLoadStatus} from '../utils/lazy_loader'
	import {get as getStore} from 'svelte/store'
	
	export let projectIndex: number
	let project: Project = projects[projectIndex]

	const thumbSrc = `projects/${project.id}/thumbnail.jpg`
	const previewSrc = `projects/${project.id}/preview.jpg`
	const thumbDarkSrc = `projects/${project.id}/thumbnail_dark.jpg`
	const previewDarkSrc = `projects/${project.id}/preview_dark.jpg`

	function openThisProject(): void {
		vibrate()
		dispatch('open')
	}

	let isCurrentDarkMode = getStore(GlobalStore).a11y.darkMode
	let lazyloader: LazyLoader
	function loadPreview() {
		if (!project.cover) return
		if (isCurrentDarkMode && project.darkTheme) {
			lazyloader = new LazyLoader(`projects/${project.id}/preview_dark.jpg`)
		}
		else {
			lazyloader = new LazyLoader(`projects/${project.id}/preview.jpg`)
		}
		lazyloader.load()
	}
	loadPreview()
	const unSubDarkModeWatcher = GlobalStore.subscribe((s)=> {
		if (s.a11y.darkMode !== isCurrentDarkMode) {
			isCurrentDarkMode = s.a11y.darkMode
			loadPreview()
		}
	})

	onDestroy(function() {
		unSubDarkModeWatcher()
		if (lazyloader && lazyloader.destroy) lazyloader.destroy()
	})
</script>



<button class='project grid' on:click={openThisProject} style='animation-delay: {1000 + projectIndex * 100}ms'>
	<div class='preview block-select' role='img' class:dark-theme={project.darkTheme}>
		{#if project.cover}
			<div class='image-container {$GlobalStore.a11y.darkMode ? 'dark':'light'}'>
				{#if $GlobalStore.a11y.darkMode && project.darkTheme}
					{#if $lazyloader.status === LazyLoadStatus.DONE}
						<img src={previewDarkSrc}
							alt={`Daniel Sharkov's project ${$_('project.' + project.id)} preview dark`}
							class='image'
						/>
					{:else}
						<img src={thumbDarkSrc}
							alt={`Daniel Sharkov's project ${$_('project.' + project.id)} thumbnail`}
							class='thumb'
						/>
						<div class='lazyloader flex flex-center'>
							{#if $lazyloader.status === LazyLoadStatus.LOADING}
								<svg class='icon icon-load icon-large fill' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' preserveAspectRatio='xMidYMid'>
									<g transform='rotate(0 50 50)'>
										<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
											<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.9166666666666666s' repeatCount='indefinite'/>
										</rect>
									</g>
									<g transform='rotate(30 50 50)'>
										<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
											<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.8333333333333334s' repeatCount='indefinite'/>
										</rect>
									</g>
									<g transform='rotate(60 50 50)'>
										<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
											<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.75s' repeatCount='indefinite'/>
										</rect>
									</g>
									<g transform='rotate(90 50 50)'>
										<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
											<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.6666666666666666s' repeatCount='indefinite'/>
										</rect>
									</g>
									<g transform='rotate(120 50 50)'>
										<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
											<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.5833333333333334s' repeatCount='indefinite'/>
										</rect>
									</g>
									<g transform='rotate(150 50 50)'>
										<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
											<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.5s' repeatCount='indefinite'/>
										</rect>
									</g>
									<g transform='rotate(180 50 50)'>
										<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
											<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.4166666666666667s' repeatCount='indefinite'/>
										</rect>
									</g>
									<g transform='rotate(210 50 50)'>
										<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
											<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.3333333333333333s' repeatCount='indefinite'/>
										</rect>
									</g>
									<g transform='rotate(240 50 50)'>
										<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
											<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.25s' repeatCount='indefinite'/>
										</rect>
									</g>
									<g transform='rotate(270 50 50)'>
										<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
											<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.16666666666666666s' repeatCount='indefinite'/>
										</rect>
									</g>
									<g transform='rotate(300 50 50)'>
										<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
											<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.08333333333333333s' repeatCount='indefinite'/>
										</rect>
									</g>
									<g transform='rotate(330 50 50)'>
										<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
											<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='0s' repeatCount='indefinite'/>
										</rect>
									</g>
								</svg>
							{:else if $lazyloader.status === LazyLoadStatus.ERR}
								<svg class='icon icon-error icon-large fill' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' fill='none'>
									<path d='M256 40c118.621 0 216 96.075 216 216 0 119.291-96.61 216-216 216-119.244 0-216-96.562-216-216 0-119.203 96.602-216 216-216m0-32C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm-11.49 120h22.979c6.823 0 12.274 5.682 11.99 12.5l-7 168c-.268 6.428-5.556 11.5-11.99 11.5h-8.979c-6.433 0-11.722-5.073-11.99-11.5l-7-168c-.283-6.818 5.167-12.5 11.99-12.5zM256 340c-15.464 0-28 12.536-28 28s12.536 28 28 28 28-12.536 28-28-12.536-28-28-28z'/>
								</svg>
							{/if}
						</div>
					{/if}
				{:else}
					{#if $lazyloader.status === LazyLoadStatus.DONE}
						<img src={previewSrc}
							alt={`Daniel Sharkov's project ${$_('project.' + project.id)} preview`}
							class='image'
						/>
					{:else}
						<img src={thumbSrc}
							alt={`Daniel Sharkov's project ${$_('project.' + project.id)} thumbnail`}
							class='thumb'
						/>
						<div class='lazyloader flex flex-center'>
							{#if $lazyloader.status === LazyLoadStatus.LOADING}
								<svg class='icon icon-load icon-large fill' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' preserveAspectRatio='xMidYMid'>
									<g transform='rotate(0 50 50)'>
										<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
											<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.9166666666666666s' repeatCount='indefinite'/>
										</rect>
									</g>
									<g transform='rotate(30 50 50)'>
										<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
											<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.8333333333333334s' repeatCount='indefinite'/>
										</rect>
									</g>
									<g transform='rotate(60 50 50)'>
										<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
											<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.75s' repeatCount='indefinite'/>
										</rect>
									</g>
									<g transform='rotate(90 50 50)'>
										<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
											<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.6666666666666666s' repeatCount='indefinite'/>
										</rect>
									</g>
									<g transform='rotate(120 50 50)'>
										<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
											<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.5833333333333334s' repeatCount='indefinite'/>
										</rect>
									</g>
									<g transform='rotate(150 50 50)'>
										<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
											<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.5s' repeatCount='indefinite'/>
										</rect>
									</g>
									<g transform='rotate(180 50 50)'>
										<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
											<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.4166666666666667s' repeatCount='indefinite'/>
										</rect>
									</g>
									<g transform='rotate(210 50 50)'>
										<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
											<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.3333333333333333s' repeatCount='indefinite'/>
										</rect>
									</g>
									<g transform='rotate(240 50 50)'>
										<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
											<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.25s' repeatCount='indefinite'/>
										</rect>
									</g>
									<g transform='rotate(270 50 50)'>
										<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
											<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.16666666666666666s' repeatCount='indefinite'/>
										</rect>
									</g>
									<g transform='rotate(300 50 50)'>
										<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
											<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.08333333333333333s' repeatCount='indefinite'/>
										</rect>
									</g>
									<g transform='rotate(330 50 50)'>
										<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
											<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='0s' repeatCount='indefinite'/>
										</rect>
									</g>
								</svg>
							{:else if $lazyloader.status === LazyLoadStatus.ERR}
								<svg class='icon icon-error icon-large fill' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' fill='none'>
									<path d='M256 40c118.621 0 216 96.075 216 216 0 119.291-96.61 216-216 216-119.244 0-216-96.562-216-216 0-119.203 96.602-216 216-216m0-32C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm-11.49 120h22.979c6.823 0 12.274 5.682 11.99 12.5l-7 168c-.268 6.428-5.556 11.5-11.99 11.5h-8.979c-6.433 0-11.722-5.073-11.99-11.5l-7-168c-.283-6.818 5.167-12.5 11.99-12.5zM256 340c-15.464 0-28 12.536-28 28s12.536 28 28 28 28-12.536 28-28-12.536-28-28-28z'/>
								</svg>
							{/if}
						</div>
					{/if}
				{/if}
			</div>
		{:else}
			<div class='no-image flex flex-center'>
				<svg class='icon' fill='none' aria-hidden='true' focusable='false' role='presentation' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'>
					<path d='M84.2922 34.7947L84.9993 35.5018L120.855 -0.353501L120.147 -1.06061L84.2922 34.7947Z' class='fill' opacity='.1'/>
					<path d='M85.5569 84.9356L84.8498 85.6427L119.562 120.355L120.269 119.647L85.5569 84.9356Z' class='fill' opacity='.1'/>
					<path d='M35.5018 84.9993L34.7947 84.2922L-0.0606959 119.148L0.646411 119.855L35.5018 84.9993Z' class='fill' opacity='.1'/>
					<path d='M35.3523 36.1452L36.0594 35.4381L0.0606224 -0.560669L-0.646484 0.146438L35.3523 36.1452Z' class='fill' opacity='.1'/>
					<path d='M89.5 46V77C89.5 77.8284 88.8284 78.5 88 78.5H32C31.1716 78.5 30.5 77.8284 30.5 77V46C30.5 45.1716 31.1716 44.5 32 44.5H44.6667C45.6759 44.5 46.5862 43.8932 46.9744 42.9615L49.6987 36.4231C49.9316 35.8641 50.4778 35.5 51.0833 35.5H53.5H60H66.5H68.9167C69.5222 35.5 70.0684 35.8641 70.3013 36.4231L73.0256 42.9615C73.4138 43.8932 74.3241 44.5 75.3333 44.5H88C88.8284 44.5 89.5 45.1716 89.5 46Z' opacity='.35' class='stroke'/>
					<circle cx='60' cy='60' r='9.5' opacity='.35' class='stroke'/>
				</svg>
			</div>
		{/if}
	</div>
	<div class='contents'>
		<span class='name'>{$_('project.' + project.id)}</span>
	</div>
</button>



<style lang='stylus'>
	.project
		position: relative
		border-radius: .5rem
		box-shadow: var(--shadow-1)
		align-content: start
		text-align: left
		-webkit-appearance: unset
		overflow: hidden
		background-color: var(--fg-clr)
		transition: var(--transition)
		transition-property: transform, box-shadow
		will-change: transform, box-shadow
		@media screen and (min-width: 2000px)
			box-shadow: var(--shadow-2)
		> .preview
			z-index: 0
			position: relative
			width: 100%
			background-color: var(--font-base-clr-0025)
			overflow: hidden
			border-radius: .5rem
			@media screen and (min-width: 2000px)
				height: 22rem
			@media screen and (max-width: 2000px)
				height: 18rem
			@media screen and (max-width: 1800px)
				height: 15rem
			@media screen and (max-width: 1200px)
				height: 14rem
			@media screen and (max-width: 600px)
				height: 7rem
			>  div
				width: 100%
				height: 100%
			.thumb
				z-index: 10
				position: absolute
				top: 0
				left: 0
				width: 100%
				height: 100%
				background-position: center
				background-repeat: no-repeat
				background-size: cover
				filter: blur(4px)
			img, >.no-image
				width: 100%
				height: 100%
			img
				object-fit: cover
				object-position: center
				border-radius: .5rem .5rem 0 0
			> .no-image svg
				height: 50%
				width: 50%
			.lazyloader
				z-index: 10
				position: absolute
				top: 0
				right: 0
				bottom: 0
				left: 0
				background-color: var(--bg-clr-085)
				.icon
					font-size: 2em
		> .contents
			z-index: 1
			position: absolute
			bottom: 0
			left: 0
			right: 0
			padding: 1rem
			background-color: var(--preview-tile-content-bg)
			box-shadow: var(--shadow-1)
			border-radius: 0 0 .5rem .5rem
			transition: var(--transition)
			transition-property: transform
			will-change: transform
			transform: translate(0, 102%)
			> .name
				display: block
				font-size: 1rem
		&:hover
			transform: translate(0, -1rem) scale(1.05)
			box-shadow: var(--shadow-6)
			> .contents
				transform: translate(0,0)
</style>
