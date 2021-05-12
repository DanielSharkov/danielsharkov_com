<script>
	const profilePicUrl = '/me-myself-and-i.jpg'
	const professions = [
		'Software Engineer', 'FullStack WebDev',
		'UX & UI Designer', 'Junior DevOp',
	]
	const socialMedia = [
		{
			alt: 'github', icon: 'github',
			url: 'https://github.com/DanielSharkov',
		},{
			alt: 'codepen', icon: 'codepen',
			url: 'https://codepen.io/DanielSharkov',
		},{
			alt: 'discord', icon: 'discord',
			url: 'https://discordapp.com/invite/DMBS9xd',
		},{
			alt: 'telegram', icon: 'telegram-plane',
			url: 'https://t.me/danielsharkov',
		},{
			alt: 'twitter', icon: 'twitter',
			url: 'https://twitter.com/Daniel_Sharkov',
		},{
			alt: 'medium', icon: 'medium-m',
			url: 'https://medium.com/@danielsharkov',
		},{
			alt: 'quora', icon: 'quora',
			url: 'https://quora.com/profile/Daniel-Sharkov-1',
		},
	]
</script>

<svelte:head>
	<title>Daniel Sharkov</title>
	<link rel='stylesheet' href='https://use.fontawesome.com/releases/v5.7.2/css/all.css' integrity='sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr' crossorigin='anonymous'>
	<link rel='mask-icon' href='logo/vector.svg' color='#000000'>
	<meta name='theme-color' content='#000000'>
	<meta name='apple-mobile-web-app-status-bar-style' content='#000000'>
	<meta name='apple-touch-fullscreen' content='yes'>
	<meta name='apple-mobile-web-app-capable' content='yes'>
	<meta name='application-name' content='EOD Infocenter'>
	<meta name='msapplication-TileColor' content='#000000'>
	<meta name='msapplication-navbutton-color' content='#000000'>
	<link rel='apple-touch-icon' type='image/png' href='logo/64x64.png'>
	<link rel='apple-touch-icon' type='image/png' sizes='128x128' href='logo/128x128.png'>
	<link rel='apple-touch-icon' type='image/png' sizes='192x192' href='logo/192x192.png'>
	<link rel='apple-touch-icon' type='image/png' sizes='256x256' href='logo/256x256.png'>
	<link rel='apple-touch-icon' type='image/png' sizes='512x512' href='logo/512x512.png'>
	<link rel='bookmark' title='DaSh' href='https://danielsharkov.com'>
	<link rel='fluid-icon' type='image/png' href='logo/512x512.png'>
	<link rel='manifest' href='manifest.json'>
</svelte:head>

<main id='app'>
	<div id='app-bg'/>
	<div class='intro flex flex-center'>
		<img class='picture' src={profilePicUrl} alt='Me, Myself and I'>
		<h1 class='name'>Daniel Sharkov</h1>
		<div class='professions flex flex-center'>
			{#each professions as job}
				<span class='profession flex flex-center-y'>{job}</span>
			{/each}
		</div>
		<p class='biography'>
			Hi there! I'm an software engineer based on web apps as fullstack developer,
			but more active in frontend than in the backend.
			Svelte, Stylus, Vue.js, PWA & SPA are my tools to go.
			As well I have already experienced about 5 years in UX & UI design.
			Next stop: DevOps.
		</p>
		<div class='social-media flex flex-center'>
			{#each socialMedia as {url, icon, alt}}
				<a href={url} target='_blank'>
					<i class='icon fab fa-{icon}' alt={alt}/>
				</a>
			{/each}
		</div>
		<a
			href='https://danielsharkov.github.io/beta_danielsharkov_com' id='DemoVersion'>
			New beta version
		</a>
	</div>
</main>

<style>
	#app {
		--app-bg: #000;
		--app-fg: #fff;
		--app-font-size: 1rem;
		--app-line-height: 1.5;
		--app-font-family: 'Montserrat';
		--app-transition: all 150ms cubic-bezier(.22,.61,.36,1);
		position: relative;
		height: 100%;
		width: 100%;
		overflow: auto;
		font-family: var(--app-font-family);
		background-color: var(--app-bg);
		line-height: var(--app-line-height);
	}

	#app-bg {
		z-index: -1;
		position: fixed;
		height: 100%;
		width: 100%;
		background-image: url(/app-bg.jpg);
		background-position: center;
		background-size: cover;
		opacity: .25;
		pointer-events: none;
	}

	.intro {
		height: 100%;
		max-width: 500px;
		margin: auto;
		padding: 2rem;
	}
	.picture {
		height: 150px;
		width: 150px;
		margin-bottom: 2rem;
		border-radius: 40%;
	}
	.name {
		margin: 0;
		font-weight: 400;
		flex: 1 1 100%;
		text-align: center;
	}
	.professions {
		margin-bottom: 2rem;
		flex: 1 1 100%;
		line-height: 2;
	}
	.professions .profession {
		font-size: .8rem;
		color: #bebe82;
	}
	.professions .profession:not(:first-child):before {
		content: '';
		margin: 0 .5rem;
		width: .15rem;
		height: .15rem;
		border-radius: 1rem;
		background-color: var(--app-fg);
		opacity: .5;
	}
	.biography {
		margin: 0;
		text-align: justify;
		opacity: .75;
	}
	.social-media {
		margin: 2rem 0;
		flex: 1 1 100%;
	}
	.social-media > a {
		display: inline-block;
		padding: .75rem;
		opacity: .25;
		cursor: pointer;
	}
	.social-media > a:not(:last-child) {
		margin-right: .5rem;
	}
	.social-media > a:hover {
		opacity: 1;
		transform: scale(1.15);
	}
	#DemoVersion {
		padding: 1rem 2rem;
		border-radius: .5rem;
		background-color: rgba(255,255,255, .1);
		border: solid 1px #fff;
		color: #fff;
		cursor: pointer;
		font-size: 1.25rem;
		text-decoration: none;
	}
	#DemoVersion:hover {
		transform: scale(1.1);
		background-color: #fff;
		color: #000;
	}
</style>