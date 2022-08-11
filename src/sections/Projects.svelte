<script type='ts'>
import ProjectPreviewTile from '../components/ProjectPreviewTile.svelte'
import {projects} from '../database'
import {_} from 'svelte-i18n'
</script>



<section>
	<h1 id='projects' class='display-3'>{$_('section.projects.title')}</h1>
	<div class='projects grid' role='feed'>
		{#each projects as _, idx}
			<ProjectPreviewTile projectIndex={idx}/>
		{/each}
	</div>
</section>



<style lang='stylus'>
section
	animation: sectionInAnim var(--transition-easing) 1s
	margin-bottom: 4rem
	@media screen and (min-width: 1000px)
		padding: 3rem
	@media screen and (max-width: 1000px)
		padding: 1.5rem
	@media screen and (max-width: 600px)
		margin-bottom: 2rem
	h1
		margin-bottom: 2rem
	.projects
		grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr))
		grid-gap: 2rem
		@media screen and (max-width: 600px)
			grid-gap: 1.5rem

@keyframes sectionInAnim
	from {transform: translateY(-4rem)}
	to   {transform: translateY(0)}
</style>
