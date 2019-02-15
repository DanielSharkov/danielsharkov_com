<template>
	<div class="view-about">
		<h1>This is an about page</h1>
	</div>
</template>



<script>
export default {
	name: 'ViewAbout',
	routeOptions: {
		path: '/about',
		name: 'about',
		meta: {
			label: 'About',
		},
	},
}



export const store = {
	state: {},
	getters: {},
	actions: {},
	mutations: {},
}
</script>
