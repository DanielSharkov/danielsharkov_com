![SvelteRouter Banner](https://raw.githubusercontent.com/DanielSharkov/svelte-router/master/readme-banner.svg)

# Wozu der Aufwand…?
Obwohl es schon einige Bibliotheken dafür auf dem Markt gibt, habe ich in Kollaboration mit [Roman Scharkov](https://github.com/romshark) dennoch eine eigene entwickelt. Doch wozu, fragt man sich.<br>
Features, Performance & die Schnittstelle, sind Punkte welche uns dazu anstrebten. Die meisten Router-Bibliotheken auf dem Markt verfügten nicht (oder sogar weiterhin nicht) über die Features unserer Verlangen, wie z.B. zuverlässige Übergangsanimationen der Seiten und auch Before-Push-Hooks, welche es erlauben Code zu injizieren, noch bevor eine neue Seite geladen wird. Zu dem basieren die meisten Bibliotheken auf RegEx — wenn nicht sogar alle — was Performance unterschiede aufweist. In diesem Projekt werden jegliche Strings nur mithilfe eigener einfachen Parser geparst. Dazu beruhen auch noch bei einigen die Schnittstellen nicht auf Skalierung, wie z.B. die Konfiguration der Seiten, welche über die Component-Art implementiert wurde, bei der jede Seite direkt als Komponente gesetzt wird, was bei vielen Seiten zu Unübersichtlichkeit führt.

# Dokumentation ist ein wichtiger Grundstein
Ein wohl sehr wichtiger Bestandteil einer Bibliothek ist immer eine ordentliche Dokumentation. Diese wurde sehr schlicht gehalten, ist reich an direkten Bespielen und somit ein guter Start für Entwickler.

# Die Beispiel-Projekte
Für eine gute Einführung zu den Techniken unseres Routers, hatte ich dazu direkt im Anschluss das erste Beispiel-Projekt erstellt. Eine einfache abstrakte Web-App, welche sehr schlicht gehalten ist, um alle Features der Bibliothek zu demonstrieren.
Das Beispiel enthält:
- eine Startseite, die das animierte Logo des Projektes und die Mitwirkenden anzeigt.
- eine About, mit Platzhaltertext.
- einen Blog, mit Platzhalter Beiträgen.
- und eine Dev-Seite, welche einen Before-Push-Hook demonstriert und die einzelnen Seiten der Konfiguration plus die derzeitige Seite im JSON Format anzeigt.

### Soziale Platform Demo
Das zweite Beispiel-Projekt ist ein mehr oder weniger gutes real-world Beispiel. Es demonstriert eine soziale Plattform. Anmelden kann man sich nicht, man wählt eines der vorgegebenen Profile aus, mit dem man im Nachhinein Beiträge erstellen und kommentieren kann.
Das Beispiel enthält:
- eine Navigationsleiste, wodurch man sich ausloggen und auf die Startseite, Benutzerübersicht und sein Profil navigieren kann.
- eine Anmeldeseite, auf der man ein Profil auswählt.
- eine Startseite, auf der alle Beiträge aller vorgegeben Profile chronologischer Reihenfolge angezeigt werden.
- eine Seite zur Übersicht der Benutzer.
- die Profilseite, welche die Daten des jeweiligen Profils und alle mit dem Profil verfassten Beträge chronologischer Reihenfolge anzeigt.
- und jeweils eine Seite für die Beträge und Kommentare, welche sich auf einen Beitrag bzw. Kommentar fokussiert.

### Browser Simulation
Um das ganze nochmal zu toppen, erstellte ich aus Motivation und Interesse das weitere und bisher letzte Beispiel. Es simuliert einen Browser und zeigt, wie man mithilfe der Schnittstellen von SvelteRouter einen Browser mit Verlauf und Navigation erstellen kann. Die einzigen Seiten in diesem Browser, zwischen denen man wechseln kann, sind die zwei ersten Beispiel-Projekte. Sobald man auf den zwei Seiten sich rum-navigiert, kann man seinen Verlauf einsehen und auf einen Moment darin wieder zurückkehren.

# Branding
Um etwas herrauszustechen, erstellte ich mit gefühl und dennoch wenig Aufwand ein Logo mithilfe von Figma.
Direkt bildete sich die erste und letztendliche Version in meinem Köpfchen: Ein Kompass mit dem Namen des Routers eingraviert.
Das Sinnbild dahinter kann sich jeder erdenken: Ein Wegweiser.<br>
Dazu erstellte ich noch einen Banner für jegliche Dokumente wie die Readme bzw. Dokumentation in der GitHub Repository und auch für diesen Artikel.<br>
Das Branding hab ich an den Stil von Svelte gehalten, so dass man diese Bibliothek direkt mit Svelte assoziiert.

### Animierte Version
Um alles nochmals zu toppen — die Kirsche der Sahne aufzusetzen — erstellte ich eine animierte Version des Logos, mit ebenfalls wenig Aufwand, mithilfe meines anderen Projektes *["Animation Creator"](http://danielsharkov.github.io/danielsharkov_com/?project=animation_creator)*.

![SvelteRouter Logo infinit animation](projects/svelte_router/media/svelte-router-logo-anim-infinit.svg)

# Fazit
Ein echt tolles Projekt, welches nicht nur meine Kenntnisse zur History API der Browser und der Verfassung von Dokumentation gestärkt hat, sondern mich auch noch gelernt hat, wie man eigene JavaScript Bibliotheken entwickelt und veröffentlicht. Nicht zu vergessen, die tollen Beispiel-Projekte und das Branding. Diesen Router hab ich bisher schon in eigenen Projekten integriert: Timetabler, Organisations Graph.
