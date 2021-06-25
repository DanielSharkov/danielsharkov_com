<section id='skills' class='auto-height'>
	<div class='section-header'>
		<h1 class='display-3'>Fertigkeiten</h1>
		<p class='subtitle'>
			Sprachen die ich spreche und Technologien ich kenne und benutze mit einem Zeitstrahl dargestellt.
		</p>
	</div>
	<ul class='technologies grid'>
		<div class='background-seperators flex'>
			{#each Array(currentYear - careerBegin + 1) as _}
				<div class='period'/>
			{/each}
		</div>
		<div class='header flex flex-align-end-y' on:sticky-change={ (e)=> {
			console.log(e)
		}}>
			{#each Array(currentYear - careerBegin + 1) as _, idx}
				<span class='period flex flex-center'>{careerBegin + idx}</span>
			{/each}
		</div>
		{#each Object.keys(technologies) as techno}
			<li class='techno'>
				<div class='header flex flex-center-y'>
					{#if technologies[techno].icon}
						<svg class='logo flex-base-size'>
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
							{technoName[technologies[techno].type]}
						</span>
					</div>
					<a class='link' href={technologies[techno].link} target='_blank' on:click={(e)=> vibrateLink(e)}>
						<svg class='icon stroke icon-medium' viewBox='0 0 120 120' fill='none' xmlns='http://www.w3.org/2000/svg'>
							<path d='M57.7778 25H35C29.4772 25 25 29.4772 25 35V85C25 90.5228 29.4772 95 35 95H85C90.5228 95 95 90.5228 95 85V62.2222' stroke-width='.5rem' stroke-linecap='round' stroke-linejoin='round'/>
							<path d='M105 15L60 60M105 15L105 45M105 15L75 15' stroke-width='.5rem' stroke-linecap='round' stroke-linejoin='round'/>
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
	import { careerBegin, technologies } from '../database'
	import { vibrateLink } from '../utils/misc'

	const currentYear: number = Number(new Date().getFullYear())

	const technoName: Array<string> = [
		'Software', 'Sprache', 'Framework', 'Bibliothek',
	]

	function technoCareerSpan(techno, [begin, end]) {
		let endPos = currentYear - careerBegin + 1
		if (end !== null) endPos = endPos - (currentYear - end)
		return (
			`background-color: ${techno.color};` +
			`grid-column-start: ${begin - careerBegin + 1};` +
			`grid-column-end: ${endPos};`
		)
	}
</script>

<style lang='stylus'>
	#skills
		margin-bottom: 4rem

	.section-header
		max-width: 900px
		margin: auto auto 1rem auto
		h1
			margin-bottom: .25em
		.subtitle
			color: var(--foreground-05)
	.technologies
		position: relative
		max-width: 900px
		margin: auto
		> .background-seperators
			z-index: -1
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
				border-width: 0 0 0 1px
				border-color: var(--foreground-015)
				border-style: solid
		> .header
			z-index: 25
			position: sticky
			position: -webkit-sticky
			top: 0
			margin-bottom: 1rem
			padding: 3rem 0 .5rem 0
			background-color: var(--background-085)
			justify-content: space-between
			border-bottom: solid 1px var(--foreground-005)
			box-shadow: 0 10px 10px -8px var(--foreground-005)
			@media screen and (max-width: 1000px)
				padding: 1.5rem 0 .5rem 0
			.period
				width: 1px
				&:first-child, &:last-child
					font-weight: 500
					@media screen and (min-width: 1000px)
						font-size: 1.25rem
				&:not(:first-child):not(:last-child)
					color: var(--foreground-075)
					@media screen and (max-width: 1000px)
						font-size: .5rem
		> .techno
			> .header
				padding: 1rem
				background-color: var(--background)
				border-bottom: dotted .15rem var(--foreground-01)
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
						color: var(--foreground-075)
						margin-bottom: .25rem
					> .type
						color: var(--foreground-025)
				> .link
					margin-left: 1rem
					padding: .5rem
					transition: var(--transition)
					transition-property: opacity
					&:not(:hover)
						opacity: .25
					&:active .icon.stroke > *
						stroke: var(--color-accent)
			> .time-span
				position: relative
				top: -.15rem
				width: 100%
				height: 2px
				margin-bottom: 1rem
				> .period
					height: .15rem
					box-shadow: 0 1px 10px var(--foreground-015)

	@media (prefers-color-scheme: dark)
		.technologies
			> .header
				box-shadow: 0 14px 20px -12px var(--foreground-015)
			> .techno > .time-span > .period
				box-shadow: 0 1px 10px var(--foreground-05)

	@media screen and (max-width: 1000px)
		.section-header
			padding: 1rem
		.technologies
			padding: 0 1.5rem
			> .background-seperators
				left: 1.5rem
				right: 1.5rem
			> .techno
				> .header
					padding: .5rem
</style>
