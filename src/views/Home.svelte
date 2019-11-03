<script>
	import route from '../router'

	const profilePicUrl = '/me-myself-and-i.jpg'
	const professions = [
		'Software Engineer',
		'FullStack WebDev',
		'UX & UI Designer',
		'Junior DevOp',
	]
	const socialMedia = [
		{
			alt: 'github',
			icon: 'github',
			url: 'https://github.com/DanielSharkov',
		},{
			alt: 'codepen',
			icon: 'codepen',
			url: 'https://codepen.io/DanielSharkov',
		},{
			alt: 'discord',
			icon: 'discord',
			url: 'https://discordapp.com/invite/DMBS9xd',
		},{
			alt: 'telegram',
			icon: 'telegram-plane',
			url: 'https://t.me/danielsharkov',
		},{
			alt: 'twitter',
			icon: 'twitter',
			url: 'https://twitter.com/Daniel_Sharkov',
		},{
			alt: 'medium',
			icon: 'medium-m',
			url: 'https://medium.com/@danielsharkov',
		},{
			alt: 'quora',
			icon: 'quora',
			url: 'https://quora.com/profile/Daniel-Sharkov-1',
		},
	]
</script>



<style lang="stylus">
	.intro
		max-width 500px
		margin auto
		padding 2rem
		.picture
			height 150px
			width 150px
			margin-bottom 2rem
			border-radius 40%
		.name
			margin 0
			font-weight 400
			flex 1 1 100%
			text-align center
		.professions
			margin-bottom 2rem
			flex 1 1 100%
			line-height 2
			.profession
				font-size .8rem
				color #bebe82
				&:not(:first-child):before
					content ''
					margin 0 .5rem
					width .15rem
					height .15rem
					border-radius 1rem
					background-color var(--app-fg)
					opacity .5
		p
			margin 0
			text-align justify
			opacity .75
		.social-media
			margin 2rem 0
			flex 1 1 100%
			> a
				display inline-block
				padding .75rem
				opacity .25
				cursor pointer
				&:not(:last-child)
					margin-right .5rem
				&:hover
					opacity 1
					transform scale(1.15)
		#more-content
			opacity .25
</style>



<div class="intro flex flex-center">
	<img class="picture" src={profilePicUrl} alt="Me, Myself and I">
	<h1 class="name">Daniel Sharkov</h1>
	<div class="professions flex flex-center">
		{#each professions as job, index}
			<span class="profession flex flex-center-y">{job}</span>
		{/each}
	</div>
	<p>
		Hi there! I'm an software engineer based on web apps as fullstack developer,
		but more active in frontend than in the backend.
		Svelte, Stylus, Vue.js, PWA & SPA are my tools to go.
		As well I have already experienced about 5 years in UX & UI design.
		Next stop: DevOps.
	</p>
	<div class="social-media flex flex-center">
		{#each socialMedia as {url, icon, alt}}
			<a href={url} target="_blank">
				<i class="icon fab fa-{icon}" alt={alt}/>
			</a>
		{/each}
	</div>
	<span id="more-content">More content coming...</span>
</div>
