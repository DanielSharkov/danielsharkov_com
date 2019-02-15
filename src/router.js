import Vue from 'vue'
import Router from 'vue-router'
import view_Home from './views/Home.vue'
import view_About from './views/About.vue'

Vue.use(Router)

export default new Router({
	mode: 'history',
	base: process.env.BASE_URL,
	routes: [{
			path: '/',
			name: 'home',
			component: view_Home,
		},{
			path: '/about',
			name: 'about',
			component: view_About,
	}],
})
