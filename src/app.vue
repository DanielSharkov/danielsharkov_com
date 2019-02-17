<template>
	<div id="app">
		<meta name="theme-color" content="#FFF"/>
		<meta name="msapplication-TileColor" content="#FFF"/>
		<meta name="apple-mobile-web-app-status-bar-style" content="#FFF"/>
		<intro :links="[{
				icon: 'github',
				url: 'github.com/DanielSharkov',
			},{
				icon: 'codepen',
				url: 'codepen.io/DanielSharkov',
			},{
				icon: 'discord',
				url: 'discordapp.com/invite/DMBS9xd',
			},{
				icon: 'telegram-plane',
				url: 't.me/danielsharkov',
			},{
				icon: 'twitter',
				url: 'twitter.com/Daniel_Sharkov',
			},{
				icon: 'medium-m',
				url: 'medium.com/@danielsharkov',
			},{
				icon: 'quora',
				url: 'quora.com/profile/Daniel-Sharkov-1',
		}]"/>
	</div>
</template>



<script>
import Intro from '@/components/intro.vue'
export default {
	name: 'VueApp',
	components: {
		Intro,
	},
}



export const store = {
	state: {},
	getters: {},
	actions: {},
	mutations: {},
}
</script>




<style lang="stylus">
@import 'styles/user_interface'

:root
	--app-bg #FFF
	--app-default-fg rgba(#000, .6)
	--app-header-fg #000
	--app-font-size 1rem
	--app-font 'Montserrat'
	--app-font-default 500 var(--app-font-size) var(--app-font)
	--app-font-h1 600 2.25rem var(--app-font)
	--app-font-h2 600 1.75rem var(--app-font)
	--app-font-h3 600 1.5rem var(--app-font)
	--app-font-h4 600 1.25rem var(--app-font)
	--app-font-h5 600 1.15rem var(--app-font)
	--app-font-h6 600 1rem var(--app-font)
	--app-font-smallest .65rem
	--app-font-smaller .75rem
	--app-font-small .85rem
	--app-font-weight-thin 100
	--app-font-weight-light 300
	--app-font-weight-default 500
	--app-font-weight-medium 600
	--app-font-weight-bold 700
	--app-font-weight-bolder 900
	--app-line-height 1.5
	--theme-primary #007DFF
	--default-transition all 200ms cubic-bezier(.22,.61,.36,1)

#app
	.view-title
		flex 1 1 100%
		text-align center
</style>
