import { Router } from '@danielsharkov/svelte-router'
import ViewHome from './views/Home'

export default new Router({
	window,
	routes: {
		'home': {
			path: '/',
			component: ViewHome,
		},
	},
	fallback: {
		name: 'home',
		redirect: true,
	},
})
