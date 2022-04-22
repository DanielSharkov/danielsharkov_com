<script type='ts'>
	import ProjectDetails from '../components/ProjectDetails.svelte'
	import {GlobalStore} from '../global_store'
	import {projects, projectsIndexByID} from '../database'
	import ProjectPreviewTile from '../components/ProjectPreviewTile.svelte'
	import {_} from 'svelte-i18n'
	import {getQuery, removeQuery, setQuery} from '../utils/url_handler'

	const LockScroll_SectionModal = 'projects_section_modal'

	let clickedProject = null
	function closeProject() {
		if (clickedProject !== null) {
			GlobalStore.unlockScroll(LockScroll_SectionModal)
		}
		removeQuery('project')
		clickedProject = null
	}

	function openProject(idx: number) {
		clickedProject = idx
		clickedProject = clickedProject
		setQuery(
			'project', projects[clickedProject].id,
			{
				'project_id': projects[clickedProject].id,
				'title': $_('project.' + projects[clickedProject].id),
			},
			$_('project.' + projects[clickedProject].id),
		)
		GlobalStore.lockScroll(LockScroll_SectionModal)
	}

	let queryProject = getQuery('project')
	if (typeof projectsIndexByID[queryProject] === 'number') {
		openProject(projectsIndexByID[queryProject])
	}
	else {
		removeQuery('project')
	}
</script>

<div id='ProjectDetailsContainer' class='modal-container' class:active={clickedProject !== null}>
	{#if clickedProject !== null}
		<ProjectDetails
			bind:projectIndex={clickedProject}
			on:close={closeProject}
		/>
	{/if}
</div>

<section>
	<h1 id='projects' class='display-3'>{$_('section.projects.title')}</h1>
	<div class='projects grid' role='feed'>
		{#each projects as _, idx}
			<ProjectPreviewTile
				projectIndex={idx}
				on:open={()=> openProject(idx)}
			/>
		{/each}
	</div>
</section>

<style lang='stylus'>
	#ProjectDetailsContainer
		transition: .5s var(--transition-easing)
		transition-property: background-color
		will-change: background-color
		@media screen and (min-width: 600px)
			padding: 1rem
		@media screen and (min-width: 1400px)
			padding: 2rem
		&.active
			background-color: var(--overlay-bg)

	h1
		padding: 1rem 3rem 0 3rem
		@media screen and (max-width: 600px)
			padding: 1rem

	.projects
		margin-bottom: 4rem
		contain: content
		@media screen and (min-width: 1600px)
			padding: 3rem
			grid-template-columns: repeat(4, 1fr)
			grid-gap: 2rem
		@media screen and (max-width: 1600px)
			padding: 3rem
			grid-template-columns: repeat(3, 1fr)
			grid-gap: 2rem
		@media screen and (max-width: 1200px)
			padding: 1.5rem
			grid-template-columns: 1fr 1fr 1fr
			grid-gap: 2rem
		@media screen and (max-width: 900px)
			grid-template-columns: 1fr 1fr
			grid-gap: 2rem
		@media screen and (max-width: 600px)
			padding: 1rem
			grid-template-columns: 1fr 1fr
			grid-gap: 1rem
</style>
