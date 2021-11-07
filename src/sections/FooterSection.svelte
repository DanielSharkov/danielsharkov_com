<script lang='ts'>
	import {_} from 'svelte-i18n'
	import {GlobalStore} from '../global_store'
	import {vibrateLink} from '../utils/misc'

	const currentYear = new Date().getFullYear()
</script>

<footer class='grid'>
	<div class='get-in-touch grid grid-center'>
		<h1 id='contact' class='text-center'>
			{$_('section.contact.title')}
		</h1>
	
		<ul role='listbox' class='social-media flex flex-center gap-1'>
			{#each $GlobalStore.socialMedia as {name, url}, idx}
				<a href={url} target='_blank' role='listitem' style='animation-delay: {50 + idx * 50}ms' use:vibrateLink>
					<svg class='logo icon-large' aria-hidden='true' focusable='false' role='presentation'>
						<title>{name}</title>
						<use xlink:href='#LOGO_{name}'/>
					</svg>
				</a>
			{/each}
		</ul>
	</div>

	<p class='copyright' role='contentinfo'>
		{$_('copyright', {values: {year: currentYear}})}
	</p>
</footer>

<style lang='stylus'>
	footer
		min-height: 60vh
		background-color: #FA8BFF
		background-image: -webkit-linear-gradient(45deg, #FA8BFF, #2BD2FF, #2BFF88)
		background-image: linear-gradient(45deg, #FA8BFF, #2BD2FF, #2BFF88)
		grid-template-rows: 1fr auto
		.get-in-touch
			padding: 6em 2em
			@media screen and (max-width: 1000px)
				padding: 6em 1.5em
		.social-media
			margin-top: 2em
			padding: 1em
			font-size: 1.25em
			border-radius: 2em
			@media screen and (max-width: 1000px)
				padding: 1em 0
			> a
				display: inline-block
				padding: .5em
				transition: var(--transition)
				transition-property: color, transform, margin
				will-change: color, transform, margin
				svg
					pointer-events: none
				&:hover
					margin: 0 1em
					transform: scale(1.75)
				@media screen and (max-width: 1000px)
					&:not(:last-child)
						margin-right: .5em
		.copyright
			margin-top: auto
			padding: .5em
			text-align: center
			font-size: .85em
		.social-media, .copyright
			background-color: var(--bg-clr-075)
	
	@media (prefers-color-scheme: dark)
		footer
			background-color: #FF3CAC
			background-image: -webkit-linear-gradient(225deg, #44ffb1, #FF3CAC, #784BA0, #2B86C5)
			background-image: linear-gradient(225deg, #44ffb1, #FF3CAC, #784BA0, #2B86C5)
			.social-media
				background-color: var(--bg-clr-05)
			.copyright
				background-color: var(--bg-clr-075)

	@media (prefers-contrast: more)
		.social-media > a
			opacity: 1
</style>
