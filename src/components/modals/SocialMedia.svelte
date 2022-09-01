<div class='modal-container flex' role='generic'>
	<div
		class='background'
		aria-hidden='true'
		transition:fade
		on:click={()=> {
			if (escapable) {closeThis()}
		}}
	/>
	<div class='modal grid gap-05' bind:this={thisEl} tabindex='-1' transition:modalTransition>
		<h1 class='name'>{props.name}</h1>

		<a href={props.app} target='_blank' class='btn open-app flex flex-center'>
			{$_('section.contact.social_open_app')}
		</a>

		<a href={props.url} target='_blank' class='btn open-link flex flex-center'>
			{$_('section.contact.social_open_link')}
		</a>

		<button class='btn close flex flex-center' on:click={closeThis}>
			{$_('close')}
		</button>
	</div>
</div>



<script lang='ts' context='module'>
export type Props = {
	name: string
	url: string
	app?: string
}; // semicolon fixed syntax highlighting
</script>

<script lang='ts'>
import {_} from 'svelte-i18n'
import {onMount, createEventDispatcher} from 'svelte'
import {fade, modalTransition} from '../../utils/transitions'
const dispatch = createEventDispatcher<{close: void, mounted: HTMLElement}>()

let thisEl: HTMLElement
onMount(()=> {
	dispatch('mounted', thisEl)
})

export let props: Props
export let escapable: boolean

function closeThis() {
	dispatch('close')
}
</script>



<style lang='sass'>
.modal-container
	padding: 1rem
	@media screen and (max-width: 600px)
		padding: 2rem

.modal
	margin: auto
	width: 100%
	max-width: 400px
	padding: 1.5rem
	background-color: var(--box-bg)
	border-radius: 1rem
	box-shadow: var(--shadow-4)
	> .name
		margin-bottom: 0.5rem
		font-size: 2.5rem
		text-align: center
	> .btn
		border-radius: 0.5rem
		padding: 0.5rem
		transition: var(--transition)
		transition-property: background-color, color, transform
		&.open-link
			background-color: var(--font-base-clr-01)
			padding: 0.5rem
			text-decoration: none
			&:hover, &:focus
				background-color: var(--clr-accent-01)
				color: var(--clr-accent)
			&:active
				background-color: var(--clr-accent-dark)
				color: #fff
		&.open-app, &.close
			box-shadow: var(--shadow-0)
			&:hover, &:focus
				box-shadow: var(--shadow-1)
		&.open-app
			padding: 1rem
			background-color: var(--clr-accent)
			color: #fff
			text-decoration: none
			font-size: 1.25rem
			&:hover, &:focus
				transform: scale(1.05)
			&:hover:active
				box-shadow: var(--shadow-0)
				transform: scale(0.95)
				background-color: var(--clr-accent-dark)
		&.close
			margin-top: 1rem
			background-color: var(--font-base-clr-01)
			&:hover, &:focus
				transform: translateY(-0.15rem)
				background-color: var(--font-base-clr)
				color: var(--page-bg)
			&:active
				transform: translateY(0.15rem)
				background-color: var(--font-heading-clr)
				color: var(--page-bg)
</style>
