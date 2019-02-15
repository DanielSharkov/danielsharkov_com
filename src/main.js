import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import './register_service_worker'



Vue.use(Vuex)
Vue.use(VueRouter)
Vue.config.productionTip = false



const routes = []
const store = {
	state: {},
	getters: {},
	actions: {},
	mutations: {},
	created: {},
}
const extendStore = newStore => {
	store.state = {...store.state, ...newStore.state}
	store.getters = {...store.getters, ...newStore.getters}
	store.actions = {...store.actions, ...newStore.actions}
	store.mutations = {...store.mutations, ...newStore.mutations}
	store.created = {...store.created, ...newStore.created}
}

const App = require('./app')
if (App.store) extendStore(App.store)

// Import route templates and the Vuex store fragmentally
// Routes going to show up in the same order as the import list is ordered
for (const filename of [
	'home',
	'about',
]) {
	const route = require(`@/views/${filename}.vue`)
	if (route.store) extendStore(route.store)
	routes.push({
		...route.default.routeOptions,
		component: route.default,
	})
}



new Vue({
	router: new VueRouter({
		mode: 'history',
		base: process.env.BASE_URL,
		routes,
	}),
	store: new Vuex.Store(store),
	created() {
		for (const func in store.created) {
			if (store.created[func] == null) {
				this.$store.dispatch(func)
				continue
			}
			this.$store.dispatch(func, store.created[func])
		}
	},
	render: h => h(App.default)
}).$mount('#app')
