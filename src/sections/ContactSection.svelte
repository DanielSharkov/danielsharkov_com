<section id='get-in-touch' class='auto-height grid grid-center'>
	<h1 class='text-center'>{$_('section.contact.title')}</h1>

	<ul role='listbox' class='social-media flex flex-center-y gap-1'>
		{#each $GlobalStore.socialMedia as {name, url}, idx}
			<a href={url} target='_blank' role='listitem' style='animation-delay: {50 + idx * 50}ms' use:vibrateLink>
				<svg class='logo icon-big' aria-hidden='true' focusable='false' role='presentation'>
					<title>{name}</title>
					<use xlink:href='#LOGO_{name}'/>
				</svg>
			</a>
		{/each}
	</ul>

	<div class='formular grid gap-1' valid-form={validForm}>
		<div class='currently-unavailable flex flex-center'>
			<span>{$_('section.contact.not_available')} 👆</span>
		</div>
		<div class='field grid gap-05'>
			<label for='Contact_Email'>{$_('section.contact.email')}</label>
			<input id='Contact_Email' type='text' bind:value={email}/>
		</div>
		<div class='field grid gap-05'>
			<label for='Contact_Subejct'>{$_('section.contact.subject')}</label>
			<input id='Contact_Subejct' type='text' bind:value={subject}/>
		</div>
		<div class='grid gap-05'>
			<label for='Contact_Message'>{$_('section.contact.msg')}</label>
			<textarea id='Contact_Message' bind:value={message}></textarea>
		</div>
		<div class='actions flex flex-center-y'>
			<button class='flex-self-right'>{$_('section.contact.submit')}</button>
		</div>
	</div>
</section>

<script lang='ts'>
	import {_} from 'svelte-i18n'
	import {GlobalStore} from '../global_store'
	import {vibrateLink} from '../utils/misc'

	let email = '', subject = '', message = ''

	$:validForm = (
		email.length > 0 &&
		subject.length > 0 &&
		message.length > 0
	)
</script>

<style lang='stylus'>
	section
		padding: 6rem 2rem
		background-color: #FA8BFF
		background-image: -webkit-linear-gradient(45deg, #FA8BFF, #2BD2FF, #2BFF88)
		background-image: linear-gradient(45deg, #FA8BFF, #2BD2FF, #2BFF88)
		@media screen and (max-width: 1000px)
			padding: 6rem 1.5rem

	.social-media
		margin-left: -.25rem
		padding: 1rem 2rem
		@media screen and (max-width: 1000px)
			padding: 1rem 0rem
		> a
			display: inline-block
			padding: .5rem
			opacity: .35
			transition: all var(--transition)
			svg
				pointer-events: none
				> *
					fill: var(--font-base-clr) !important
			&:hover
				opacity: 1
				transform: scale(1.25)
			@media screen and (max-width: 1000px)
				&:not(:last-child)
					margin-right: .5rem

	.formular
		position: relative
		width: 700px
		max-width: 100%
		padding: 2rem
		border-radius: 2rem
		box-shadow: var(--shadow-4)
		background-color: var(--bg-clr)
		overflow: hidden
		.currently-unavailable
			position: absolute
			top: 0
			left: 0
			height: 100%
			width: 100%
			padding: 4rem
			background-color: var(--bg-clr-075)
			font-size: 2rem
			text-align: center
		input, textarea
			padding: .5rem
			border-radius: .25rem
			background-color: var(--font-base-clr-01)
			font-size: 1.15rem
			border: solid 1px var(--font-base-clr-01)
			&:hover
				border-color: var(--font-base-clr-015)
			&:active, &:focus
				border-color: var(--font-base-clr)
		.actions
			margin-top: 1rem
			button
				padding: .5rem 2rem
				border-radius: 2rem
				font-size: 1.15rem
				background-color: var(--font-base-clr-015)
		&[valid-form='false']
			.actions button
				opacity: .25
				pointer-events: none
		&[valid-form='true']
			.actions button
				background-color: var(--color-accent)
				color: #fff
	
	@media (prefers-color-scheme: dark)
		section
			background-color: #FF3CAC
			background-image: -webkit-linear-gradient(225deg, #44ffb1, #FF3CAC, #784BA0, #2B86C5)
			background-image: linear-gradient(225deg, #44ffb1, #FF3CAC, #784BA0, #2B86C5)
		.formular
			input, textarea
				box-shadow: 0 0 0 1px #000

	@media (prefers-contrast: more)
		.social-media > a
			opacity: 1
</style>
