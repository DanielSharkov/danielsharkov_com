<script>
	import globalStyles from './styles/user_interface.styl'
	import { RouterViewport } from '@danielsharkov/svelte-router'
	import router from './router'
</script>



<style lang="stylus">
	#app
		--app-bg #000
		--app-fg #fff
		--app-font-size 1rem
		--app-line-height 1.5
		--app-font-family 'Montserrat'
		--app-transition all 150ms cubic-bezier(.22,.61,.36,1)

		position relative
		height 100%
		width 100%
		overflow auto
		font-family var(--app-font-family)
		background-color var(--app-bg)
		line-height var(--app-line-height)


	:global(#router-viewport)
		height 100%
		width 100%
		:global(> div)
			display flex
			height 100%
			width 100%
			justify-content center
			align-content center
			align-items center

	#app-bg
		z-index -1
		position fixed
		height 100%
		width 100%
		background-image url(/app-bg.jpg)
		background-position center
		background-size cover
		opacity .1
		pointer-events none
</style>

<div id="app">
	<div id="app-bg"/>
	<div id="router-viewport">
		<RouterViewport router={router}/>
	</div>
</div>

<svelte:head>
	<title>Daniel Sharkov</title>
	<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.2/css/all.css" integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous">
	<link rel="mask-icon" href="logo/vector.svg" color="#000000">
	<meta name="theme-color" content="#000000">
	<meta name="apple-mobile-web-app-status-bar-style" content="#000000">
	<meta name="apple-touch-fullscreen" content="yes">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="application-name" content="EOD Infocenter">
	<meta name="msapplication-TileColor" content="#000000">
	<meta name="msapplication-navbutton-color" content="#000000">
	<link rel="apple-touch-icon" type="image/png" href="logo/64x64.png">
	<link rel="apple-touch-icon" type="image/png" sizes="128x128" href="logo/128x128.png">
	<link rel="apple-touch-icon" type="image/png" sizes="192x192" href="logo/192x192.png">
	<link rel="apple-touch-icon" type="image/png" sizes="256x256" href="logo/256x256.png">
	<link rel="apple-touch-icon" type="image/png" sizes="512x512" href="logo/512x512.png">
	<link rel="bookmark" title="DaSh" href="https://danielsharkov.com">
	<link rel="fluid-icon" type="image/png" href="logo/512x512.png">
	<link rel="manifest" href="manifest.json">
</svelte:head>
