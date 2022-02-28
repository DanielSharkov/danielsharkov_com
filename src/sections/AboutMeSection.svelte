<section class='grid'>
	<div class='header'>
		<h1 id='about' class='display-3'>{$_('section.about_me.title')}</h1>
	</div>

	<!-- <article class='photography'>
		<h2 class='article-title'>Hobby Fotograf</h2>
		<p></p>
	</article> -->

	<article class='designe'>
		<h2 class='article-title'>{$_('section.about_me.designer.title')}</h2>
		<p>{$_('section.about_me.designer.block_1')}</p>
		<p>{$_('section.about_me.designer.block_2')}</p>
	</article>

	<article class='gamer'>
		<h2 class='article-title'>{$_('section.about_me.gamer.title')}</h2>
		<p>{$_('section.about_me.gamer.block_1')}</p>
		<p>{$_('section.about_me.gamer.block_2')}</p>
		<p>{$_('section.about_me.gamer.block_3')}</p>
		<div class='game-container grid grid-center grid-1'>
			<a class='image-container tilt-left' href='https://lifeisstrange.square-enix-games.com/' target='_blank' use:vibrateLink>
				<img src='life_is_strange.jpg' alt='Life is Strange danielsharkov.com'>
			</a>
			<div class='content'>
				<h3><a class='link' href='https://lifeisstrange.square-enix-games.com/' target='_blank'>
					Life is Strange
				</a></h3>
				<p>{$_('section.about_me.gamer.game_lis')}</p>
				<em>
					({$_('section.about_me.gamer.game_lis_cta')}:
					<a class='link' href='https://www.youtube.com/results?search_query=gronkh+life+is+strange' target='_blank'>
						YouTube – Life is Strange Gronkh
					</a>)
				</em>
			</div>
		</div>
		<div class='game-container grid grid-center grid-1'>
			<a class='image-container tilt-right' href='https://www.minecraft.net/' target='_blank' use:vibrateLink>
				<img src='minecraft.jpg' alt='Minecraft danielsharkov.com'>
			</a>
			<div class='content'>
				<h3><a class='link' href='https://www.minecraft.net/' target='_blank'>
					Minecraft
				</a></h3>
				<p>{$_('section.about_me.gamer.game_mc')}</p>
				<p><q>{$_('section.about_me.gamer.game_mc_qoute')}</q> – Gronkh.</p>
				<em>
					({$_('section.about_me.gamer.game_lis_cta')}:
					<a class='link' href='https://www.youtube.com/results?search_query=gronkh+minecraft' target='_blank'>
						YouTube – Minecraft Gronkh
					</a>)
				</em>
			</div>
		</div>
	</article>
</section>



<script>
	import {_} from 'svelte-i18n'
	import {vibrateLink} from '../utils/misc'
</script>



<style lang='stylus'>
	section
		padding: 2rem
		grid-gap: 4rem
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
		margin-bottom: .75rem

	.game-container
		.content
			padding: 2rem
			h3
				margin-bottom: .75rem
				@media screen and (max-width: 1000px)
					text-align: center
				a
					text-decoration: none
		.image-container
			display: inline-block
			padding: .75rem
			box-shadow: var(--shadow-0), 0 16px 20px -12px var(--shadow-huge-clr)
			background-color: var(--fg-clr)
			border-radius: .15rem
			line-height: 0
			transition: all var(--transition)
			contain: content
			img
				width: 8rem
				border-radius: .1rem
			&.tilt-left
				transform: rotate(-4deg)
				&:hover, &:focus
					transform: rotate(2deg) scale(1.1)
			&.tilt-right
				transform: rotate(4deg)
				&:hover, &:focus
					transform: rotate(-2deg) scale(1.1)
			&:hover, &:focus
				box-shadow: var(--shadow-0), 0 20px 30px -16px var(--shadow-huge-clr)
		a:focus
			color: var(--color-accent)
		@media screen and (min-width: 1000px)
			grid-template-columns: auto 1fr
			grid-gap: 2rem
		@media screen and (max-width: 600px)
			margin-top: 2rem
			.content
				padding: 0
				margin-top: 2rem
</style>
