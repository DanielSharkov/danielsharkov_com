<script type='ts'>
	import ProjectDetails from '../ProjectDetails.svelte'
	import { GlobalStore } from '../global_store'
	import { projects, projectsIndexByID } from '../database'
	import ProjectPreviewTile from '../ProjectPreviewTile.svelte'

	let clickedProject = null
	function closeProject() {
		if (window.history?.pushState) {
			window.history.pushState(null, '', (
				window.location.protocol + '//' +
				window.location.host +
				window.location.pathname
			))
		}
		GlobalStore.unlockScroll('projects_section_modal')
		clickedProject = null
	}
	function openProject(idx: number) {
		clickedProject = idx
		if (window.history?.pushState) {
			window.history.pushState(
				// State
				{ 'project_id': projects[clickedProject].id },
				// Title
				projects[clickedProject].name,
				( // New URL
					window.location.protocol + '//' +
					window.location.host +
					window.location.pathname +
					'?project=' + projects[clickedProject].id
				),
			)
		}
		GlobalStore.lockScroll('projects_section_modal')
	}

	if (window.history?.state?.project_id) {
		openProject(projectsIndexByID[window.history.state.project_id])
	}
</script>

{#if clickedProject !== null}
	<ProjectDetails on:close={closeProject} projectIndex={clickedProject}/>
{/if}

<section id='projects'>
	<h1 class='display-3'>Projekte</h1>
	<div class='projects grid'>
		{#each projects as _, pIdx}
			<ProjectPreviewTile
				projectIndex={ pIdx }
				on:open={ ()=> openProject(pIdx) }
			/>
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
