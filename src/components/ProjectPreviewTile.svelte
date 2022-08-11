<script lang='ts'>
import {_} from 'svelte-i18n'
import {projects} from '../database'
import {vibrate} from '../utils/misc'
import {fade} from '../utils/transitions'
import {openModal} from './Modals.svelte'
import {onDestroy, onMount} from 'svelte'
import {lazyLoad} from '../utils/lazy_loader'
import {appState, colorSchemaMediaQuery} from '../App.svelte'

export let projectIndex: number
const project = projects[projectIndex]

const thumbSrc = `projects/${project.id}/thumbnail.jpg`
const previewSrc = `projects/${project.id}/preview.jpg`
const thumbDarkSrc = `projects/${project.id}/thumbnail_dark.jpg`
const previewDarkSrc = `projects/${project.id}/preview_dark.jpg`

$:_thumbSrc = (
	$appState.a11y.isDarkTheme && project.darkThemed ?
		thumbDarkSrc : thumbSrc
)

function openThisProject() {
	vibrate()
	openModal({name: 'project', props: {project: project}})
}

let lazyLoader: Promise<string>
function loadPreviewImg() {
	if (!project.hasNoCover) {
		if (project.darkThemed && $appState.a11y.isDarkTheme) {
			lazyLoader = lazyLoad(previewDarkSrc)
		} else {
			lazyLoader = lazyLoad(previewSrc)
		}
	}
}

colorSchemaMediaQuery.addEventListener('change', loadPreviewImg)
onMount(loadPreviewImg)
onDestroy(()=> {
	colorSchemaMediaQuery.removeEventListener('change', loadPreviewImg)
})

$:customGradientBG = (
	Array.isArray(project.gradient) ?
		`background: -webkit-linear-gradient(125deg, ${project.gradient.join(',')});` +
		`background: linear-gradient(125deg, ${project.gradient.join(',')});`
	: ''
)
</script>



<button on:click={openThisProject}
class='project grid'
style:animation-delay='{projectIndex * 75}ms'
aria-haspopup='dialog'>
	<div class='preview block-select' role='img' class:dark-theme={project.darkThemed}>
		{#if !project.hasNoCover}
			<div class='image-container'>
				{#await lazyLoader}
					<img src={_thumbSrc} transition:fade={{duration: 1000}}
						alt={`Daniel Scharkov's project ${$_('project.' + project.id)} thumbnail`}
						class='thumb'
					/>
					<div class='lazyload-overlay flex flex-center' transition:fade={{duration: 1000}}>
						<svg class='icon' aria-hidden='true' focusable='false' role='presentation'>
							<use xlink:href='#Icon_Loader'/>
						</svg>
					</div>
				{:then src}
					<img {src}
						alt={`Daniel Scharkov's project ${$_('project.' + project.id)} preview dark`}
						class='image'
					/>
				{:catch}
					<img src={_thumbSrc}
						alt={`Daniel Scharkov's project ${$_('project.' + project.id)} thumbnail`}
						class='thumb'
					/>
					<div class='lazyload-overlay flex flex-center'>
						<svg class='icon icon-thinner' aria-hidden='true' focusable='false' role='presentation'>
							<use xlink:href='#Icon_ErrorCircle'/>
						</svg>
						<span class='fail-msg'>{$_('failed_to_load_image')}</span>
					</div>
				{/await}
			</div>
		{:else}
			<div class='no-image flex flex-center'>
				<div class='bg' style={customGradientBG}/>
				<svg class='icon' aria-hidden='true' focusable='false' role='presentation'>
					<use xlink:href='#Icon_NoImage'/>
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
	background-color: var(--box-bg)
	transition: var(--transition)
	transition-property: transform, box-shadow
	will-change: transform, box-shadow
	animation: projectInAnim var(--transition-easing) 1s backwards
	contain: content
	@supports (-webkit-backdrop-filter: blur(0px))
		overflow: hidden
	@media screen and (min-width: 2000px)
		box-shadow: var(--shadow-2)
	> .preview
		z-index: 0
		width: 100%
		background-color: var(--font-base-clr-0025)
		aspect-ratio: 16/10
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
		img, > .no-image
			width: 100%
			height: 100%
		img
			object-fit: cover
			object-position: center
			border-radius: .5rem .5rem 0 0
		> .no-image
			> .bg
				z-index: -1
				position: absolute
				top: 0
				right: 0
				bottom: 0
				left: 0
			> .icon
				height: 50%
				width: 50%
				--icon: #fff
		.lazyload-overlay
			z-index: 10
			position: absolute
			top: 0
			right: 0
			bottom: 0
			left: 0
			background-color: var(--page-bg-075)
			.icon
				font-size: 2.5rem
			.fail-msg
				margin-top: 1rem
				flex: 1 1 100%
				font-size: .85rem
				text-align: center
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
	&:hover, &:focus
		transform: translate(0, -1rem) scale(1.05)
		box-shadow: var(--shadow-bevel),
			0 0 2px var(--shadow-ao-clr),
			0 12px 36px var(--shadow-big-clr)
		> .contents
			transform: translate(0,0)


@keyframes projectInAnim
	from {opacity: 0; transform: translateY(-4rem);}
	to   {opacity: 1; transform: translateY(0);}

@media (prefers-color-scheme: dark)
	.project > .preview > .no-image > .bg
		opacity: .5
</style>
