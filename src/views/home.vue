<template>
	<div class="view-home">
		<img alt="Vue logo" src="../assets/logo.png">
		<HelloWorld msg="Welcome to Your Vue.js App"/>
	</div>
</template>

<script>
import HelloWorld from '@/components/hello_world.vue'

export default {
	name: 'ViewHome',
	routeOptions: {
		path: '/',
		name: 'home',
		meta: {
			label: 'Home',
		},
	},
	components: {
		HelloWorld,
	},
}



export const store = {
	state: {},
	getters: {},
	actions: {},
	mutations: {},
}
</script>
