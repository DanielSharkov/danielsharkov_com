<script lang='ts'>
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()
	import { projects } from './database'
	import { GlobalStore, ImageThumbKind } from './global_store'
	import { vibrate } from './utils/misc'
	export let projectIndex: number

	let project: Project = projects[projectIndex]

	let highResImgDone = false
	let highResImgDarkDone = false
	const lazyLoaded =()=> highResImgDone = true
	const lazyLoadedDark =()=> highResImgDarkDone = true

	function openThisProject() {
		vibrate()
		dispatch('open')
	}
</script>

<button class='project grid' on:click={openThisProject} style='animation-delay: {1000 + projectIndex * 100}ms'>
	<div class='preview block-select'
	class:loaded={ highResImgDone }
	class:loaded-dark={ highResImgDarkDone }
	class:dark-theme={ project.darkTheme }>
		{#if project.cover}
			{#if project.darkTheme}
				<div class='image-container dark'>
					{#if !$GlobalStore.projectImgLoad[project.id].dark}
					<img
						class='thumb'
						src='projects/{project.id}/thumbnail_dark.jpg'
						alt={`Daniel Sharkov's project ${project.name} dark thumbnail`}
						on:load={()=> {
							GlobalStore.thumbDone(project.id, ImageThumbKind.DARK)
						}}
					/>
					{/if}
					{#if $GlobalStore.projectImgLoad[project.id].dark}
						<img
							class='image'
							src='projects/{project.id}/preview_dark.jpg'
							alt={`Daniel Sharkov's project ${project.name} dark themed`}
							on:load={lazyLoadedDark}
						/>
					{/if}
				</div>
			{/if}
			<div class='image-container light'>
				{#if !$GlobalStore.projectImgLoad[project.id].light}
					<img
						class='thumb'
						src='projects/{project.id}/thumbnail.jpg'
						alt={`Daniel Sharkov's project ${project.name} thumbnail`}
						on:load={()=> {
							GlobalStore.thumbDone(project.id, ImageThumbKind.LIGHT)
						}}
					/>
				{/if}
				{#if $GlobalStore.projectImgLoad[project.id].light}
					<img
						class='image'
						src='projects/{project.id}/preview.jpg'
						alt={`Daniel Sharkov's project ${project.name}`}
						on:load={lazyLoaded}
					/>
				{/if}
			</div>
		{:else}
			<div class='no-image flex flex-center'>
				<svg class='icon' fill='none' aria-hidden='true' focusable='false' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'>
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
		<span class='name'>{ project.name }</span>
	</div>
</button>

<style lang='stylus'>
	.project
		position: relative
		border-radius: .5rem
		box-shadow:
			0 0 1px var(--foreground-015),
			0 2px 4px var(--foreground-015)
		align-content: start
		text-align: left
		-webkit-appearance: unset
		overflow: hidden
		cursor: pointer
		background-color: var(--background)
		transition: all var(--transition)
		> .preview
			z-index: 0
			position: relative
			width: 100%
			background-color: var(--foreground-0025)
			overflow: hidden
			border-radius: .5rem
			@media screen and (min-width: 1600px)
				height: 14rem
			@media screen and (max-width: 1600px)
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
				transition: opacity var(--transition)
				@media screen and (min-width: 1200px)
					opacity: .75
			> .no-image svg
				height: 6rem
				width: 6rem
		> .contents
			z-index: 1
			position: absolute
			bottom: 0
			left: 0
			right: 0
			padding: 1rem
			background-color: var(--background-095)
			box-shadow: 0 0 6px var(--foreground-005)
			border-radius: 0 0 .5rem .5rem
			transition: all var(--transition)
			transform: translate(0, 100%)
			> .name
				display: block
				font-size: 1rem
		&:hover
			transform: translate(0, -1rem) scale(1.05)
			box-shadow:
				0 0 1px var(--foreground-015),
				0 26px 40px -26px var(--foreground-05)
			> .preview img
				opacity: 1
			> .contents
				transform: translate(0,0)

@media (prefers-color-scheme: light)
	.project > .preview > .dark
		display: none
		visibility: hidden

@media (prefers-color-scheme: dark)
	.project
		background-color: #111
		box-shadow:
			0 -1px 1px var(--foreground-015),
			0 1px 1px var(--background),
			0 3px 10px var(--foreground-01)
		> .preview.dark-theme > .light
			display: none
			visibility: hidden
		> .contents
			background-color: rgba(#151515, .95)
		&:hover
			box-shadow:
				0 -1px 1px var(--foreground-015),
				0 1px 1px var(--background),
				0 26px 40px -26px var(--foreground-025)
</style>
