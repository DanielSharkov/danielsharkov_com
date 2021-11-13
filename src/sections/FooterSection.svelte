<script lang='ts'>
	import {_} from 'svelte-i18n'
	import {GlobalStore} from '../global_store'
	import {vibrateLink} from '../utils/misc'

	const currentYear = new Date().getFullYear()
	let socialMediaButtons: HTMLElement
</script>



<footer class='grid'>
	<div class='get-in-touch grid grid-center'>
		<h1 id='contact' class='text-center'>
			{$_('section.contact.title')}
		</h1>
	
		<ul role='listbox' bind:this={socialMediaButtons} tabindex='-1' class='social-media flex flex-center gap-1'>
			{#each $GlobalStore.socialMedia as {name, url, app}, idx}
				{#if app}
					<button role='listitem'
					class='btn flex flex-center'
					on:click={()=> GlobalStore.openSocialModal(idx, socialMediaButtons)}>
						<svg class='icon icon-large' aria-hidden='true' focusable='false' role='presentation'>
							<title>{name}</title>
							<use xlink:href='#LOGO_{name}'/>
						</svg>
					</button>
				{:else}
					<a href={url} target='_blank' role='listitem'
					class='btn flex flex-center'
					use:vibrateLink>
						<svg class='icon icon-large' aria-hidden='true' focusable='false' role='presentation'>
							<title>{name}</title>
							<use xlink:href='#LOGO_{name}'/>
						</svg>
					</a>
				{/if}
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
			padding: 1.5em
		.social-media
			margin-top: 2em
			padding: .5em 1em 0 1em
			font-size: 1.5em
			border-radius: 1.5em
			> .btn
				position: relative
				width: 3em
				height: 3em
				margin-bottom: .5em
				transition: var(--transition)
				transition-property: font-size, margin
				will-change: font-size, margin
				> svg
					position: absolute
					top: auto
					left: auto
					pointer-events: none
					transition: var(--transition)
					transition-property: font-size
					will-change: font-size
				&:hover, &:focus
					> svg
						font-size: 2em
				&:not(:last-child)
					margin-right: .5em
			&:hover > .btn:not(:hover):not(:focus) > svg
				font-size: .75em
			@media screen and (min-width: 800px)
				> .btn:hover
					margin-left: .5em
					margin-right: .75em
					&:last-child
						margin-left: .5em
						margin-right: .5em
			@media screen and (max-width: 799px)
				> .btn:hover > svg
					font-size: 1.75em
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
		.social-media > .btn
			opacity: 1
</style>
