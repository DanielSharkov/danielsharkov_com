<script type='ts'>
import {projects} from '../database'
import ProjectPreviewTile from '../components/ProjectPreviewTile.svelte'
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
h1
	padding: 1rem 3rem 0 3rem
	@media screen and (max-width: 600px)
		padding: 1rem

.projects
	margin-bottom: 4rem
	grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr))
	grid-gap: 2rem
	@media screen and (min-width: 1600px)
		padding: 3rem
	@media screen and (max-width: 1600px)
		padding: 3rem
	@media screen and (max-width: 1200px)
		padding: 1.5rem
	@media screen and (max-width: 600px)
		padding: 1rem
</style>
