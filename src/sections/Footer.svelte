<script lang='ts'>
import {_} from 'svelte-i18n'
import {socialMedia} from '../App.svelte'
import {openModal} from '../components/Modals.svelte'
import {vibrateLink, vibrateAction} from '../utils/misc'
const currentYear = new Date().getFullYear()

let sendInvalidReCapToken = false
let showMailSubForm = false
let userSubEmail = ''
let emailSubStatus: 'userInput'|'sending'|'subscribed'|'failed' = 'userInput'
let subFailedReason: string = null
const emailRegex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]){2,40}$/
const reCaptchaSiteKey = '6Lf3J4YkAAAAANXQNDA6XH6RBOX3xtYh4Tfo7_u6'

$:isValidSubscribeForm = emailRegex.test(userSubEmail.trim()) === true

window['newsletter'] = {
	enableForm() {
		showMailSubForm = true
		return ''
	},
	toggleInvalidReCaptcha() {
		sendInvalidReCapToken = !sendInvalidReCapToken
		return sendInvalidReCapToken ? 'now sending invalid reCaptcha token' : 'sending valid reCaptcha token'
	},
	debugSetFormStatus(status: string) {
		if (status === 'userInput' || status === 'sending' || status === 'subscribed' || status === 'failed') {
			emailSubStatus = status
		} else {
			console.error(`invalid form status "${status}"`)
		}
	},
}

async function submitForm(event: Event & { currentTarget: HTMLFormElement}) {
	event.preventDefault()
	let reCaptchaToken = 'invalid-token'
	if (!sendInvalidReCapToken) {
		reCaptchaToken = await window['grecaptcha'].execute(reCaptchaSiteKey, {action: 'submit'})
	}
	if (!isValidSubscribeForm) {return}
	if (!reCaptchaToken) {
		subFailedReason = 'Invalid reCaptcha'
		emailSubStatus = 'failed'
	}

	const form = new FormData()
	form.set('g-recaptcha-response', reCaptchaToken)
	form.set('EMAIL', userSubEmail.trim())
	form.set('locale', 'en')
	form.set('email_address_check', '')
	form.set('html_type', 'simple')

	const resp = await fetch(
		'https://459fb692.sibforms.com/serve/MUIEACzb3-kbZ0omwsFLpwcdy5VsKRfSrzhYFWuD44xrp7FhbgPzN3TrSlb1lj6sdnnaOvVrmWVlyTKBtcHjYmsfVJ00xUAseI50v28-7LAl67GcLxq6YWV5d5oZyzMp_xLUgQBQCf-k9vAIRPBcl2Ysou5UhGFLprLJwZg7VaswRJCXs4fupydN9tmi2KEsg8s6L7kJ-kTPXKqX',
		{method: 'POST', body: form},
	)
	const json = await resp.json()
	if (resp.status === 200 && json['success'] === true) {
		emailSubStatus = 'subscribed'
	} else {
		console.error(resp)
		subFailedReason = 'Oh no, sorry, something went wrong 😕 Please retry right again or later.'
		emailSubStatus = 'failed'
	}
}
</script>

<svelte:head>
{#if showMailSubForm}
	<script src='https://www.google.com/recaptcha/api.js?render={reCaptchaSiteKey}'/>
{/if}
</svelte:head>


<footer class='grid'>
	<div class='get-in-touch grid grid-center'>
		<h1 id='contact'>{$_('section.contact.title')}</h1>

		{#if showMailSubForm}
			<form id='NewsletterSubForm' on:submit={submitForm}>
				{#if emailSubStatus === 'userInput' || emailSubStatus === 'sending' || emailSubStatus === 'failed'}
					<h1>Oh, well, you litte hacker...</h1>
					<p>Seems like your interested... well then, sub to my newsletter and stay tuned for awesome news about things all around the world.</p>

					<input
						type='email'
						bind:value={userSubEmail}
						aria-label='email'
						pattern={'^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]){2,40}$'}
						aria-required='true'
						placeholder='Email'
						autocomplete='email'
					/>

					{#if emailSubStatus === 'failed'}
						<p class='fail'>{subFailedReason}</p>
					{/if}

					<button
					type='submit'
					class='flex gap-05 flex-center'
					disabled={!isValidSubscribeForm || emailSubStatus === 'sending'}>
						{#if emailSubStatus === 'sending'}
							<span>Subscribing...</span>
							<svg class='icon' aria-hidden='true' focusable='false' role='presentation'>
								<use xlink:href='#Icon_Loader'/>
							</svg>
						{:else}
							<span>Subscribe</span>
						{/if}
					</button>
				{:else if emailSubStatus === 'subscribed'}
					<h1>Thank you ❤️</h1>
					<p>You are awesome. Stay tuned for exciting coming newsletters!</p>
				{/if}
			</form>
		{/if}
	
		<div role='list' tabindex='-1' class='social-media flex flex-center gap-15'>
			{#each socialMedia as {name, url, app}}
				{#if app}
					<button
					class='btn flex flex-center'
					aria-haspopup='dialog'
					use:vibrateAction
					on:click={()=> openModal({name: 'socialMedia', props: {name, url, app}})}>
						<svg class='icon' aria-hidden='true' focusable='false' role='presentation'>
							<title>{name}</title>
							<use xlink:href='#Logo_{name}'/>
						</svg>
					</button>
				{:else}
					<a href={url} target='_blank' rel='noreferrer'
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



<style lang='sass'>
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
			padding: 1rem 0.5rem
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
				opacity: 0.75
				font-size: 2rem
	.copyright
		margin-top: auto
		padding: 0.5rem
		text-align: center
		font-size: 0.85rem
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

#NewsletterSubForm
	width: 600px
	max-width: 100%
	background-color: var(--box-bg)
	border-radius: 1.5rem
	padding: 2.5rem
	> h1
		font-size: 1.5rem
		font-weight: bold
		margin-bottom: 1rem
	> p
		line-height: 1.5
	input
		width: 100%
		margin: 1rem 0
		padding: 0.5rem
		border: solid 1px var(--border-hard)
		border-radius: 0.25rem
		transition: var(--transition) border
		&:hover
			border-color: #aaa
		&:focus
			border-color: #000
	> .fail
		margin: 0.5rem 0
		padding: 0.5rem
		color: var(--clr-red)
		background-color: var(--clr-red-01)
		border-radius: 0.5rem
	> button
		width: 100%
		padding: 1rem
		color: #fff
		background-color: #333
		border-radius: 0.25rem
		cursor: pointer
		transition: var(--transition) background-color
		&:not([disabled]):hover
			background-color: #000
		&[disabled]
			cursor: default
			background-color: #888
			.icon
				--icon: #fff

:global(.ml-form-recaptcha.ml-error iframe)
	border: solid 2px #ff0000
</style>
