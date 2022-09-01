<section class='grid auto-height'>
	<div class='header'>
		<h1 id='about' class='display-3'>{$_('section.about_me.title')}</h1>
	</div>

	<article class='designer'>
		<h2 class='article-title'>{$_('section.about_me.designer.title')}</h2>
		<p>{$_('section.about_me.designer.block_1')}</p>
		<p>{$_('section.about_me.designer.block_2')}</p>
	</article>
</section>



<script>
import {_} from 'svelte-i18n'
</script>



<style lang='sass'>
section
	padding: 2rem
	grid-gap: 2rem
	@media screen and (max-width: 600px)
		padding: 1rem

p
	margin-bottom: 1rem
	font-size: 1.15rem

article, .header
	max-width: 900px
	width: 100%
	margin: auto

.article-title
	margin-bottom: 0.75rem
</style>
