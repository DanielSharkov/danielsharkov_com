<script lang='ts'>
	import {_} from 'svelte-i18n'
	const currentYear = new Date().getFullYear()
</script>

<footer>
	<p class='copyright' role='contentinfo'>
		{$_('copyright', {values: {year: currentYear}})}
	</p>
</footer>

<style lang='stylus'>
	footer
		padding: 1rem
	.copyright
		text-align: center
		color: var(--font-base-clr-05)
		font-size: .85em
		font-weight: 500
</style>
