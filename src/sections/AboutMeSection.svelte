<section id='me-myself-and-i' class='grid'>
	<div class='header'>
		<h1 class='display-3'>Hallo, das bin ich!</h1>
	</div>

	<!-- <article class='photography'>
		<h2 class='article-title'>Hobby Fotograf</h2>
		<p></p>
	</article> -->

	<article class='designe'>
		<h2 class='article-title'>Designer</h2>
		<p>
			Es macht mir Spaß User Experience Designes zu entwerfen und
			gibt mir dazu die Hoffnung auf bessere Anwendungen für Menschen.
			Schon oft musste ich mich, wie auch viele andere Menschen,
			durch von Grund auf unverständlich gestalteten Anwendungen durchkämpfen,
			welche eigentlich eine Erleichterung der hauptsächlichen Arbeit sein sollen,
			jodoch zur weiteren Arbeit ausarten.
			Ein tolles Gefühl ist das Lächeln eines Menschen,
			durch eine saubere und verständliche UX Führung.
		</p>
		<p>
			Ein schönes User Interface darf auch nicht fehl am Platz sein,
			damit die Stimmung entsprechend zum Thema passt.
			Handelt es sich um etwas seriöses z.B. finanzen,
			so könnte man überwiegend Grautöne nutzen.
			Handelt es sich aber z.B. um was lockeres für die Freizeit,
			so verwendet man oft hellere Designs mit viel Farbe,
			damit es sich für die Augen sanft und heimlicher fühlt.
			Durch das ausleben der freien Kreativität,
			gefällt mir die Gestaltung verschiedenster UIs.
		</p>
	</article>

	<article class='gamer'>
		<h2 class='article-title'>Gamer</h2>
		<p>
			Ich mag Spiele – jeder mag Spiele. Mal kompetitiv gegen den Computer,
			mal online mit oder gegen andere Menschen oder auch mal was sehr
			entspanntes und ruhiges zum runter kommen und kreativ sein.
			Schon von Anfang an, als ich noch jünger 10 war, wusste ich,
			dass Spiele nicht nur Spaß machen, sondern auch Dinge lehren können.
		</p>
		<p>
			Ob es die Sprache ist, welches man extra zum Lernen einstellt,
			ob es die Benutzeroberfläche ist, von der man sich
			für seine UX & UI Designs inspirieren lässt,
			oder ob es die blinde Interaktionskommunikation ist,
			in dem das Spiel versucht dem Spieler ohne Sprache etwas zu sagen,
			um die Immersion nich zu zerstören, dass z.B. der Spieler mit etwas interagieren kann.
			Ob es die Kreativität ist, die man frei entfalten kann und Dinge ausprobiert,
			ob es die Gesichte ist, die einen ebenfalls inspirieren lässt,
			das Leben ergänzt oder auch einer sehr tiefgreifenden Metapher lehrt
			und viele mehr Gründ, was Spiele alles bieten.
		</p>
		<p>
			Spiele sind meiner Meinung nach genau der richtige Ansatz,
			um Menschen etwas auf eine spannende und interaktive Art und Weise zu lehren.
			Es gibt so viele Spiele, doch alle hier zu nennen,
			die ich persönlich mag oder allgemein äußerst gelungen sind,
			wäre ein echter Overkill. Hier einige folgende:
		</p>
		<div class='game-container grid grid-center grid-1'>
			<a class='image-container tilt-left' href='https://lifeisstrange.square-enix-games.com/' target='_blank' on:click={vibrate}>
				<img src='life_is_strange.jpg' alt='Life is Strange danielsharkov.com'>
			</a>
			<div class='content'>
				<h3><a class='link' href='https://lifeisstrange.square-enix-games.com/' target='_blank'>
					Life is Strange
				</a></h3>
				<p>
					ist ein wundervolles Meisterwerk,
					welches einem sehr tief in's Herz greif und
					zeigt was Gefühle und Emotionen überhaupt sind.
					Der Grafikstil ist passend zur Geschichte pittoresk.
					<em>(Da kann ich dir nur das Let's Play von Gronkh an's Herz legen: <a class='link' href='https://www.youtube.com/results?search_query=gronkh+life+is+strange' target='_blank'>YouTube – Life is Strange Gronkh</a>)</em>
				</p>
			</div>
		</div>
		<div class='game-container grid grid-center grid-1'>
			<a class='image-container tilt-right' href='https://www.minecraft.net/' target='_blank' on:click={vibrate}>
				<img src='minecraft.jpg' alt='Minecraft danielsharkov.com'>
			</a>
			<div class='content'>
				<h3><a class='link' href='https://www.minecraft.net/' target='_blank'>
					Minecraft
				</a></h3>
				<p>
					ist eine Sandbox die wenig bietet,
					doch die unendlichen Möglichkeiten einem selbst überlässt.
					Ob Überleben oder Kreativ sein, oder auch beides in einem,
					ob Haus, Anwesen oder Schloss und
					ob in Ruhe alleine oder gemeinsam mit Freunden vereint.
					Du selbst entscheidest, welche Möglichkeiten es dir bietet,
					oder auch nicht.
					<em>
						„Sehr viele glaubten von Anfang an,
						dass man das Spiel nicht Let's Playen könnte.
						Ich tat es einfach.“
					</em> – Gronkh.
					<em>
						(Auch hier liegt meine Empfehlung beim Let's Play von Gronkh:
						<a class='link' href='https://www.youtube.com/results?search_query=gronkh+minecraft' target='_blank'>
							YouTube – Minecraft Gronkh
						</a>)
					</em>
				</p>
			</div>
		</div>
	</article>
</section>



<script>
	import { vibrate } from '../utils/misc'
</script>



<style lang='stylus'>
	#me-myself-and-i
		padding: 2rem
		grid-gap: 4rem
		@media screen and (max-width: 600px)
			padding: 1rem

	p
		margin-bottom: .5rem
		font-size: 1.15rem
		color: var(--foreground-075)

	article, .header
		max-width: 900px
		width: 100%
		margin: auto

	.article-title
		margin-bottom: .75rem

	.game-container
		position: relative
		.content
			padding: 2rem
			h3
				margin-bottom: .75rem
				@media screen and (max-width: 1000px)
					text-align: center
				a
					text-decoration: none
		.image-container
			display: inline-block
			padding: .75rem
			box-shadow:
				0 0 1px var(--foreground-015),
				0 16px 20px -12px var(--foreground-025)
			background-color: #FFF
			border-radius: .15rem
			line-height: 0
			transition: all var(--transition)
			img
				width: 8rem
				border-radius: .1rem
			&.tilt-left
				transform: rotate(-4deg)
				&:hover
					transform: rotate(2deg) scale(1.1)
			&.tilt-right
				transform: rotate(4deg)
				&:hover
					transform: rotate(-2deg) scale(1.1)
			&:hover
				box-shadow:
					0 0 1px var(--foreground-015),
					0 20px 30px -16px var(--foreground-05)
		@media screen and (min-width: 1000px)
			grid-template-columns: auto 1fr
			grid-gap: 2rem
		@media screen and (max-width: 600px)
			margin-top: 2rem
			.content
				padding: 0
				margin-top: 2rem

	@media (prefers-color-scheme: dark)
		.game-container .image-container
			box-shadow:
				0 -1px 1px var(--foreground-025),
				0 1px 1px var(--foreground-015),
				0 10px 20px var(--foreground-015)
			background-color: #333
			&:hover
				box-shadow:
					0 -1px 1px var(--foreground-025),
					0 1px 1px var(--foreground-015),
					0 10px 20px var(--foreground-025)
</style>
