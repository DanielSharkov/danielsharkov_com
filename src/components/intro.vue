<template>
	<div class="intro flex flex-row centered-content">
		<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.2/css/all.css" integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous">

		<svg
		id="header-profile-picture"
		viewBox="0 0 154 150"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink">
			<mask
			id="profilePictureMask"
			mask-type="alpha"
			maskUnits="userSpaceOnUse"
			width="250" height="250">
				<path fill-rule="evenodd" clip-rule="evenodd" d="M154 75C154 95.3158 145.922 113.745 132.804 127.251C132.177 127.896 132.626 129 133.526 129H136C137.105 129 138 129.895 138 131C138 132.105 137.105 133 136 133H126.553H114C112.895 133 112 133.895 112 135C112 136.105 112.895 137 114 137H117.975C118.958 137 119.336 138.249 118.5 138.768C107.029 145.888 93.4944 150 79 150C46.4631 150 18.7654 129.281 8.38049 100.317C8.14959 99.673 8.63099 99 9.31513 99H14C15.1045 99 16 98.1046 16 97C16 95.8954 15.1045 95 14 95H6.69616H2C0.895431 95 0 94.1046 0 93C0 91.8954 0.895431 91 2 91H5.7104H9.99997C11.1045 91 12 90.1046 12 89C12 87.8954 11.1045 87 9.99997 87H5.80687C5.31588 87 4.89679 86.6437 4.82436 86.1581C4.28137 82.5176 4 78.7916 4 75C4 61.3366 7.6537 48.5265 14.0374 37.4936C14.2148 37.187 14.5429 37 14.8971 37H22C23.1046 37 24 36.1046 24 35C24 33.8954 23.1046 33 22 33H16.854H13C11.8954 33 11 32.1046 11 31C11 29.8954 11.8954 29 13 29H19.2696C19.5783 29 19.8694 28.8571 20.0604 28.6147C33.794 11.1882 55.0904 0 79 0C120.421 0 154 33.5786 154 75ZM144 129C142.895 129 142 129.895 142 131C142 132.105 142.895 133 144 133C145.105 133 146 132.105 146 131C146 129.895 145.105 129 144 129ZM20 97C20 95.8954 20.8954 95 22 95C23.1045 95 24 95.8954 24 97C24 98.1046 23.1045 99 22 99C20.8954 99 20 98.1046 20 97Z" fill="#000"/>
			</mask>
			<g mask="url(#profilePictureMask)">
				<image
					x="-25" y="-25"
					width="200" height="200"
					xlink:href="../assets/myself.jpg"
				/>
			</g>
		</svg>
		<div class="text">
			<h1>Daniel Sharkov</h1>
			<div class="flex flex-row">
				<span>
					<span>Junior Software Engineer</span>
					and
				</span>
				<span>
					<span>UI & UX designer</span>
				</span>
			</div>
		</div>
		<div class="links">
			<i
				v-for="link in links"
				:key="link.url"
				:class="['icon', 'fab', 'fa-' + link.icon]"
				@click="openInNewTab(link.url)"
			/>
		</div>
		<div class="scroll-down"/>
	</div>
</template>



<script>
export default {
	name: 'Intro',
	props: {
		links: Array,
	},
	methods: {
		openInNewTab(url) {
			window.open('https://'+ url)
		},
	},
}
</script>



<style lang="stylus" scoped>
@keyframes scrollDown
	0%
		opacity 0
		transform translateY(-2rem)
	75%
		opacity 1
		transform translateY(0)
	100%
		opacity 0
		transform translateY(0)

.intro
	position relative
	height 100vh
	max-width 960px
	margin auto
	> *
		text-align center
		flex 1 1 100%
	#header-profile-picture
		height 150px
		width @height
		margin-bottom 2rem
	.text
		h1
			font-weight var(--app-font-weight-default)
		> div span
			flex 1 1 100%
			span
				color var(--theme-primary)
	.links
		margin-top 5rem
		> *
			font-size 1.25rem
			margin .5rem
			padding .5rem
			opacity .25
			cursor pointer
			&:hover
				opacity 1
	.scroll-down
		position absolute
		bottom 4rem
		height .75rem
		width @height
		animation scrollDown 2.5s cubic-bezier(.22,.61,.36,1) infinite
		&:before
			content ''
			position absolute
			top 0
			left 0
			height 100%
			width @height
			border solid #000
			border-width 0 .1rem .1rem 0
			transform rotate(45deg)
</style>
