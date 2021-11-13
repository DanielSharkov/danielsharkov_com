<section class='auto-height'>
	<div class='section-header'>
		<h1 id='skills' class='display-3'>{$_('section.skills.title')}</h1>
		<p class='subtitle'>{$_('section.skills.description')}</p>
	</div>
	<ul class='technologies grid'>
		<div class='background-seperators flex'>
			{#each Array(yearsSinceCareerBegin) as _}
				<div class='period'/>
			{/each}
		</div>
		<div class='header flex flex-center-y'>
			{#each Array(yearsSinceCareerBegin) as _, idx}
				{#if showHeaderYear(idx)}
					<span class='period flex flex-center'>{careerBegin + idx}</span>
				{:else}
					<span class='period placeholder'></span>
				{/if}
			{/each}
		</div>
		{#each Object.keys(technologies) as techno}
			<li class='techno'>
				<div class='header flex flex-center-y'>
					{#if technologies[techno].icon}
						<svg class='logo flex-base-size' aria-hidden='true' focusable='false' role='presentation'>
							<title>{techno} Logo</title>
							<use xlink:href='#LOGO_{techno}'/>
						</svg>
					{:else if technologies[techno].image}
						<img
							class='logo'
							src='technologies/logo_{techno}.png'
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
					<a href={technologies[techno].link} target='_blank' class='link flex flex-center' use:vibrateLink>
						<svg class='icon stroke icon-medium' viewBox='0 0 120 120' aria-hidden='true' focusable='false' role='presentation' fill='none' xmlns='http://www.w3.org/2000/svg'>
							<path d='M57.7778 25H35C29.4772 25 25 29.4772 25 35V85C25 90.5228 29.4772 95 35 95H85C90.5228 95 95 90.5228 95 85V62.2222' stroke-width='.5em' stroke-linecap='round' stroke-linejoin='round'/>
							<path d='M105 15L60 60M105 15L105 45M105 15L75 15' stroke-width='.5em' stroke-linecap='round' stroke-linejoin='round'/>
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

<style lang='stylus'>
	section
		margin-bottom: 4em

	.section-header
		max-width: 900px
		margin: auto auto 1em auto
		h1
			margin-bottom: .25em
	.technologies
		position: relative
		max-width: 900px
		margin: auto
		> .background-seperators
			z-index: -1
			position: absolute
			top: 5em
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
		> .header
			z-index: 25
			position: sticky
			position: -webkit-sticky
			top: -1px
			margin: 0 -1.5em 1em -1.5em
			padding: 3em 1.5em .5em 1.5em
			background-color: var(--bg-clr-085)
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
					font-size: .75em
				&.placeholder
					height: 1em
					border-right: solid 1px var(--font-base-clr-025)
		> .techno
			> .header
				padding: 1em
				background-color: var(--bg-clr)
				border-bottom: dotted .1em var(--font-base-clr-025)
				> .logo
					width: 3em
					height: 3em
					margin-right: 1em
				> img.logo
					object-fit: contain
					object-position: center
				> .naming
					> .name
						display: block
						color: var(--font-heading-clr)
						margin-bottom: .25em
					> .type
						color: var(--font-base-clr-035)
				> .link
					margin-left: 1em
					padding: .5em
					border-radius: .5em
					transition: var(--transition)
					transition-property: opacity, background-color
					will-change: opacity, background-color
					&:not(:hover) .icon.stroke > *
						stroke: var(--font-base-clr-05)
					&:hover
						background-color: var(--font-base-clr-015)
					&:active, &:focus
						background-color: var(--color-accent-01)
						.icon.stroke > *
							stroke: var(--color-accent)
			> .time-span
				position: relative
				top: -.15em
				width: 100%
				margin-bottom: 1em
				> .period
					height: .2em
					border-radius: 1em
					box-shadow:
						0 0 1px var(--bg-clr),
						0 1px 10px var(--shadow-clr)

	@media screen and (max-width: 1000px)
		.section-header
			padding: 1em
		.technologies
			padding: 0 1.5em
			> .header
				
			> .background-seperators
				left: 1.5em
				right: 1.5em
			> .techno > .header
				padding: .5em

	@media (prefers-contrast: more)
		.technologies
			> .header, > .techno
				border-color: var(--border-hard)
</style>
