<script lang='ts'>
import {_} from 'svelte-i18n'
import {socialMedia} from '../App.svelte'
import {openModal} from '../components/Modals.svelte'
import {vibrateLink} from '../utils/misc'
const currentYear = new Date().getFullYear()
</script>


<footer class='grid'>
	<div class='get-in-touch grid grid-center'>
		<h1 id='contact'>{$_('section.contact.title')}</h1>
	
		<div role='listbox' tabindex='-1' class='social-media flex flex-center gap-15'>
			{#each socialMedia as {name, url, app}}
				{#if app}
					<button role='listitem'
					class='btn flex flex-center'
					aria-haspopup='dialog'
					on:click={()=> openModal({name: 'socialMedia', props: {name, url, app}})}>
						<svg class='icon' aria-hidden='true' focusable='false' role='presentation'>
							<title>{name}</title>
							<use xlink:href='#Logo_{name}'/>
						</svg>
					</button>
				{:else}
					<a href={url} target='_blank' role='listitem'
					class='btn flex flex-center'
					use:vibrateLink>
						<svg class='icon' aria-hidden='true' focusable='false' role='presentation'>
							<title>{name}</title>
							<use xlink:href='#Logo_{name}'/>
						</svg>
					</a>
				{/if}
			{/each}
		</div>
	</div>

	<p class='copyright' role='contentinfo'>{
		$_('copyright',{values: {year: currentYear}})
	}</p>
</footer>



<style lang='stylus'>
footer
	min-height: 60vh
	background-color: #FA8BFF
	background-image: -webkit-linear-gradient(45deg, #FA8BFF, #2BD2FF, #2BFF88)
	background-image: linear-gradient(45deg, #FA8BFF, #2BD2FF, #2BFF88)
	grid-template-rows: 1fr auto
	.get-in-touch
		padding: 1.5rem
		> h1
			text-align: center
	.social-media
		margin-top: 2rem
		padding: 1.5rem 2rem
		font-size: 1.5rem
		border-radius: 1.5rem
		@media screen and (max-width: 600px)
			padding: 1rem .5rem
		@media (prefers-contrast: more)
			border: solid 1px var(--font-base-clr)
		> .btn
			position: relative
			width: 3rem
			height: 3rem
			transition: var(--transition)
			transition-property: opacity
			will-change: opacity
			font-size: 2.5rem
			> svg
				position: absolute
				top: auto
				left: auto
				pointer-events: none
				transition: var(--transition)
				transition-property: font-size
				will-change: font-size
				--icon: var(--font-heading-clr)
			@media screen and (min-width: 600px)
				&:hover, &:focus
					font-size: 3.5rem
		@media screen and (min-width: 600px)
			&:hover > .btn:not(:hover):not(:focus)
				opacity: .75
				font-size: 2rem
	.copyright
		margin-top: auto
		padding: .5rem
		text-align: center
		font-size: .85rem
	.social-media, .copyright
		background-color: var(--page-bg-075)

@media (prefers-color-scheme: dark)
	footer
		background-color: #FF3CAC
		background-image: -webkit-linear-gradient(225deg, #44ffb1, #FF3CAC, #784BA0, #2B86C5)
		background-image: linear-gradient(225deg, #44ffb1, #FF3CAC, #784BA0, #2B86C5)
		.social-media
			background-color: var(--page-bg-05)
		.copyright
			background-color: var(--page-bg-075)

@media (prefers-contrast: more)
	.social-media > .btn
		opacity: 1
</style>
