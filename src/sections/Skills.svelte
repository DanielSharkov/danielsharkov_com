<section class='auto-height'>
	<div class='section-header'>
		<h1 id='skills' class='display-3'>{$_('section.skills.title')}</h1>
		<p class='subtitle'>{$_('section.skills.description')}</p>
	</div>
	<ul class='technologies grid'>
		<div aria-hidden='true' class='background-seperators flex'>
			{#each Array(yearsSinceCareerBegin) as _}
				<div aria-hidden='true' class='period'/>
			{/each}
		</div>
		<div class='header flex flex-center-y'>
			{#each Array(yearsSinceCareerBegin) as _, idx}
				{#if showHeaderYear(idx)}
					<span class='period flex flex-center'>{careerBegin + idx}</span>
				{:else}
					<span aria-hidden='true' class='period placeholder'></span>
				{/if}
			{/each}
		</div>
		{#each Object.keys(technologies) as techno}
			<li class='techno'>
				<div class='header flex flex-center-y'>
					{#if technologies[techno].hasIcon}
						<svg class='logo flex-base-size' aria-hidden='true' focusable='false' role='presentation'>
							<title>{techno} Logo</title>
							<use xlink:href='#Logo_{techno}'/>
						</svg>
					{:else if technologies[techno].hasImage}
						<img
							class='logo'
							src='technologies/{techno}.png'
							alt='{techno} Logo'
						/>
					{:else}
						<div class='logo placeholder'/>
					{/if}
					<div class='naming'>
						<span class='name flex-base-size'>
							{technologies[techno].name}
						</span>
						<span class='type flex-base-size'>
							{$_('section.skills.technology_type.' + technologies[techno].type)}
						</span>
					</div>
					<a href={technologies[techno].link} target='_blank'
					class='link flex flex-center'
					aria-label={$_('section.skills.aria_open_site', {values: {x: technologies[techno].name}})}
					use:vibrateLink>
						<svg class='icon' aria-hidden='true' focusable='false' role='presentation'>
							<use xlink:href='#Icon_Link'/>
						</svg>
					</a>
				</div>
				<div class='time-span grid' style='grid-template-columns: repeat({currentYear - careerBegin}, 1fr);'>
					{#each technologies[techno].careerSpan as period}
						<div
							class='period'
							style={technoCareerSpan(technologies[techno], period)}
						/>
					{/each}
				</div>
			</li>
		{/each}
	</ul>
</section>

<script lang='ts'>
import {_} from 'svelte-i18n'
import {careerBegin, technologies} from '../database'
import {vibrateLink} from '../utils/misc'

const currentYear = Number(new Date().getFullYear())
const yearsSinceCareerBegin = currentYear - careerBegin + 1

function technoCareerSpan(techno, [begin, end]) {
	let endPos = yearsSinceCareerBegin
	if (end !== null) endPos = endPos - (currentYear - end)
	return (
		`background-color: ${techno.color};` +
		`grid-column-start: ${begin - careerBegin + 1};` +
		`grid-column-end: ${endPos};`
	)
}

function showHeaderYear(idx: number): boolean {
	return (
		idx === 0 || idx+1 === yearsSinceCareerBegin
	) || (
		(careerBegin + idx) % 5 === 0 &&
		idx > 1 && idx < yearsSinceCareerBegin-2
	)
}
</script>

<style lang='sass'>
section
	margin-bottom: 4rem

.section-header
	max-width: 900px
	margin: auto auto 1em auto
	h1
		margin-bottom: .25rem
.technologies
	position: relative
	max-width: 900px
	margin: auto
	> .background-seperators
		z-index: 0
		position: absolute
		top: 5rem
		bottom: 0
		left: 0
		right: 0
		pointer-events: none
		justify-content: space-between
		@media screen and (max-width: 1000px)
			top: 3.5
		> .period
			height: 100%
			border-left: solid 1px var(--font-base-clr-015)
			@media (prefers-contrast: more)
				border-color: var(--font-base-clr)
	> .header
		z-index: 25
		position: sticky
		position: -webkit-sticky
		top: -1px
		margin: 0 -1.5rem 1rem -1.5rem
		padding: 3rem 1.5rem .5rem 1.5rem
		background-color: var(--page-bg-085)
		justify-content: space-between
		border-bottom: solid 1px var(--font-base-clr-005)
		box-shadow: 0 20px 10px -20px var(--shadow-clr)
		-webkit-backdrop-filter: blur(8px) saturate(3)
		backdrop-filter: blur(8px) saturate(3)
		color: var(--font-heading-clr)
		.period
			width: 1px
			&:first-child, &:last-child
				font-weight: 500
			&:not(:first-child):not(:last-child)
				color: var(--font-base-clr-075)
			@media screen and (max-width: 1000px)
				font-size: .75rem
			&.placeholder
				height: 1rem
				border-right: solid 1px var(--font-base-clr-025)
	> .techno
		z-index: 1
		> .header
			padding: 1rem
			background-color: var(--page-bg)
			border-bottom: dotted 2px var(--font-base-clr-015)
			@media (prefers-contrast: more)
				border-color: var(--font-base-clr)
			> .logo
				width: 3rem
				height: 3rem
				margin-right: 1rem
			> img.logo
				object-fit: contain
				object-position: center
			> .naming
				> .name
					display: block
					color: var(--font-heading-clr)
					margin-bottom: .25rem
				> .type
					color: var(--font-base-clr-035)
			> .link
				margin-left: 1rem
				padding: .5rem
				border-radius: .5rem
				transition: var(--transition)
				transition-property: opacity, background-color
				@media (prefers-contrast: more)
					border: solid 1px var(--font-base-clr)
				&:not(:hover) .icon
					--icon: var(--font-base-clr-05)
				&:hover
					background-color: var(--font-base-clr-01)
					.icon
						--icon: var(--font-heading-clr)
				&:active, &:focus
					background-color: var(--clr-accent-01)
					.icon
						--icon: var(--clr-accent)
		> .time-span
			top: -.15rem
			width: 100%
			margin-bottom: 1rem
			> .period
				position: relative
				top: -3px
				height: 3px
				box-shadow: 0 0 1px  var(--page-bg),0 1px 10px var(--shadow-clr)

@media screen and (max-width: 1000px)
	.section-header
		padding: 1rem
	.technologies
		padding: 0 1.5rem
		> .background-seperators
			left: 1.5rem
			right: 1.5rem
		> .techno > .header
			padding: .5rem

@media (prefers-contrast: more)
	.technologies
		> .header, > .techno
			border-color: var(--border-hard)
</style>
