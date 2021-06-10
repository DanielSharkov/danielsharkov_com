<script lang='ts'>
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()
	import { projects } from './database'
	import { GlobalStore, ImageThumbKind } from './global_store'
	export let projectIndex: number

	let project: Project = projects[projectIndex]

	let highResImgDone = false
	let highResImgDarkDone = false
	const lazyLoaded =()=> highResImgDone = true
	const lazyLoadedDark =()=> highResImgDarkDone = true
</script>

<button class='project grid' on:click={()=> dispatch('open')}>
	<div class='preview'
	class:loaded={ highResImgDone }
	class:loaded-dark={ highResImgDarkDone }
	class:dark-theme={ project.darkTheme }>
		{#if project.cover}
			{#if project.darkTheme}
				<div class='image-container dark'>
					<img
						class='thumb'
						src='/projects/{project.id}/thumbnail_dark.jpg'
						alt={`Daniel Sharkov's project ${project.name} dark thumbnail`}
						on:load={GlobalStore.thumbDone(project.id, ImageThumbKind.DARK)}
					/>
					{#if $GlobalStore.projectImgLoad[project.id].dark}
						<img
							class='image'
							src='/projects/{project.id}/cover_dark.png'
							alt={`Daniel Sharkov's project ${project.name} dark themed`}
							on:load={lazyLoadedDark}
						/>
					{/if}
				</div>
			{/if}
			<div class='image-container light'>
				<img
					class='thumb'
					src='/projects/{project.id}/thumbnail.jpg'
					alt={`Daniel Sharkov's project ${project.name} thumbnail`}
					on:load={()=> {
						GlobalStore.thumbDone(project.id, ImageThumbKind.LIGHT)
					}}
				/>
				{#if $GlobalStore.projectImgLoad[project.id].light}
					<img
						class='image'
						src='/projects/{project.id}/cover.png'
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
			0 0 1px var(--foreground-01),
			0 3px 8px var(--foreground-01)
		align-content: start
		text-align: left
		-webkit-appearance: unset
		overflow: hidden
		cursor: pointer
		background-color: var(--background)
		> .preview
			z-index: 0
			position: relative
			width: 100%
			height: 16rem
			background-color: var(--foreground-0025)
			overflow: hidden
			border-radius: .5rem
			@media screen and (min-width: 1600px)
				height: 16rem
			@media screen and (max-width: 1600px)
				height: 15rem
			@media screen and (max-width: 1200px)
				height: 14rem
			@media screen and (max-width: 600px)
				height: 10rem
			@media screen and (max-width: 400px)
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
				height: 6rem
				width: 6rem
			&.loaded .light .thumb,
			&.loaded-dark .dark .thumb
				opacity: 0
		> .contents
			z-index: 1
			position: absolute
			bottom: 0
			left: 0
			width: 100%
			padding: 1rem
			border-top: solid 1px var(--foreground-005)
			background-color: var(--background)
			transform: translate3d(0, 100%, 0)
			border-radius: 0 0 .5rem .5rem
			> .name
				display: block
				font-size: 1rem
		&:hover
			transform: translate(0,-.5rem) scale(1.025)
			box-shadow:
				0 0 1px var(--foreground-015),
				0 6px 20px var(--foreground-015)
			> .contents
				transform: translate(0,0)

@media (prefers-color-scheme: light)
	.project > .preview > .dark
		display: none

@media (prefers-color-scheme: dark)
	.project
		background-color: var(--foreground-005)
		box-shadow:
			0 0 1px var(--foreground-05),
			0 3px 10px #000
		> .preview.dark-theme > .light
			display: none
		> .contents
			border-color: var(--foreground-025)
		&:hover
			box-shadow:
				0 0 1px var(--foreground-05),
				0 6px 20px #000
</style>
