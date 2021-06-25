<section id='get-in-touch' class='auto-height grid grid-center'>
	<h1>Du möchtest mich gerne erreichen?</h1>
	<div class='social-media flex flex-center-y gap-1'>
		{#each $GlobalStore.socialMedia as {name, url}, idx}
			<a href={url} target='_blank' style='animation-delay: {50+idx*50}ms' on:click={(e)=> vibrateLink(e)}>
				<svg class='logo icon-big'>
					<title>{name} Logo</title>
					<use xlink:href='#LOGO_{name}'/>
				</svg>
			</a>
		{/each}
	</div>
	<div class='formular grid gap-1' valid-form={validForm}>
		<div class='currently-unavailable flex flex-center'>
			<span>Derzeit nur durch Soziale Medien kontaktierbar. 👆</span>
		</div>
		<div class='field grid gap-05'>
			<label for='Contact_Email'>Deine Email</label>
			<input id='Contact_Email' type='text' bind:value={email}/>
		</div>
		<div class='field grid gap-05'>
			<label for='Contact_Subejct'>Betreff</label>
			<input id='Contact_Subejct' type='text' bind:value={subject}/>
		</div>
		<div class='grid gap-05'>
			<label for='Contact_Message'>Nachricht</label>
			<textarea id='Contact_Message' bind:value={message}></textarea>
		</div>
		<div class='actions flex flex-center-y'>
			<button class='flex-self-right'>Versenden</button>
		</div>
	</div>
</section>

<script lang='ts'>
	import { GlobalStore } from '../global_store'
	import { vibrateLink } from '../utils/vibrate'

	let email: string = ''
	let subject: string = ''
	let message: string = ''

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
		background-image: linear-gradient(45deg, #FA8BFF 0%, #2BD2FF 52%, #2BFF88 90%)
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
			cursor: pointer
			transition: all var(--transition)
			svg
				pointer-events: none
				> *
					fill: var(--foreground) !important
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
		box-shadow: 0 0 1px var(--foreground-015), 0 6px 20px rgba(#000, .05)
		background-color: var(--background)
		overflow: hidden
		.currently-unavailable
			position: absolute
			top: 0
			left: 0
			height: 100%
			width: 100%
			padding: 4rem
			background-color: var(--background-085)
			font-size: 2rem
			text-align: center
		input, textarea
			padding: .5rem
			border-radius: .25rem
			background-color: var(--foreground-0025)
			font-size: 1.15rem
			border: solid 1px var(--foreground-0025)
			&:hover
				border-color: var(--foreground-015)
			&:active, &:focus
				border-color: var(--foreground)
		.actions
			margin-top: 1rem
			button
				padding: .5rem 2rem
				border-radius: 2rem
				font-size: 1.15rem
				cursor: pointer
				background-color: var(--foreground-01)
		&[valid-form='false']
			.actions button
				opacity: .25
				pointer-events: none
		&[valid-form='true']
			.actions button
				color: #FFF
				background-color: var(--color-accent)
	
	@media (prefers-color-scheme: dark)
		section
			background-color: #FF3CAC
			background-image: linear-gradient(225deg, #FF3CAC 0%, #784BA0 50%, #2B86C5 100%)
		.formular
			box-shadow: 0 -1px 1px rgba(#fff, .1), 0 6px 20px rgba(#000, .75)
			input, textarea
				box-shadow: 0 0 0 1px #000
</style>
