# Inspiration

Schach macht spaß und ist vor allem spannend. Während ich meine Ausbildung bei der EOD European Online Distribution GmbH machte und die Walther-Rathenau-Schule besuchte, hatte ich einmal im Fach SAE (Software-Anwendungs-Entwicklung) als Klassenarbeit das Thema Schach-Spiel, wo ich mit dem Lehrer im Einzelgespräch das Spiel sehr simpel programmierte, genauer gesagt einfach nur das theoretische Brett mit den Feldern und das sehr simple Bewegen von Figuren, ohne Sinn und Logik. Es war nichts visuelles, nur Code der das Spiel theoretisch funktionieren ließ und statt bildliche Figuren einfache Buchstaben als Bezeichnung in die Konsole ausgab. Für meine Leistung erhielt ich eine glatte Eins.

# Die innere Unruhe während des Urlaubs

Es hat mir keine Ruhe gegeben, dass ich das Schach-Spiel so „hässlich“ implementiert hatte. Damit meine ich, dass man nicht einmal eine Art Schachbrett vor sich hatte, auf der üblicherweise die Figuren zu sehen sind. So bekam ich die Motivation und Inspiration ein Schach-Spiel nochmals für mich selbst zu programmieren, welches diesmal in eine Web-App werden soll. Da ich zu der Zeit Urlaub hatte und nach Laggo Maggiore in Italien zum ausruhen verreist bin, habe ich mir während dem Nichts-tun die Zeit dafür genommen.

![Laggo Maggiore captured by Daniel Sharkov](projects/svelte_chess/media/laggo_maggiore.jpeg)

# „From Scratch“

So machte ich direkt mein MacBook auf und began auf die Schnelle die Engine und das Brett des Spiels funktionell zu implementieren. Als ich die Basis also hatte, war es an der Zeit den Sinn und die Logik in's Spiel zu programmieren. Von da an wurde es auch interessanter und kniffliger, wie ich nun diese Figuren so programmieren kann, dass sie sich nur nach einem vorgegebenen Muster bewegen können, so wie im echten Schach. Es hat seine Zeit gebraucht, um zwei dimensionale Räumlichkeit das aller erste Mal zu berechnen, ob nun der Spieler die Figure inkorrekt bewegen will, die Figur von einer anderen Figur, der selben Partei, blockiert wird oder ob die Figur eine Figur der Gegenpartei schlägt. Noch nie hatte ich mich zuvor damit auseinandergesetzt, doch ich hatte einen sehr großen Willen, der mich nicht mal denken ließ abzubrechen.

Die einfachste Implementierung für die ich am wenigesten gebraucht habe waren die Regeln der Bauern. Darauf gefolgt des Könfigs, welche aber nur *(auch noch bisher)* zwar Regeln der erlaubten Bewegungen erlangen, aber z.B. kein Game-Over bei Vernichtung ausmachen – Naja, darauf hatte ich bis dahin keinen Wert gelegt, da ich nur die Regeln der erlaubten Schritte vorerst implementieren wolle und die Möglichkeit zum Schlagen des Gegners. Auch der Turm bekam seine Regeln schon relativ sehr früh, durch seine relativ einfachen Schritte die ihm erlaubt sind.

Jedoch gibt es *(auch noch bisher)* nicht die Möglichkeit eine Rochade zu machen, sowohl als auch „en Passant“, welchen ich selbst noch gar nicht mal beherrsche. Die Läufer waren mir vorerst ein großes Rätsel. Alle bisher implementierten Figuren laufen senkrecht, was etwas einfacher nachzuvollziehen ist als diagonales laufen. Hierbei musste ich eine Formel finden wie ich wieder die drei Faktoren *„erlaubtes Laufen“*, *„wird blockiert“* und *„schlägt Gegner“* herrausfinde. Nach einer Weile rum denken und probieren hab ich das Problem erfasst und erfolgreich implementiert, sodass die Läufter tatsächlich richtig laufen.
Zu den Damen und den Springern war ich noch nicht gekommen.

# Design

Nach der Implementierung der Grund-Funktionalität und der meisten Figuren, hatte ich bisher nur ein funktionelles Design, was ich ja von Anfang an nicht wollte. Mit Funktionell meine ich, dass ich statt bildliche Darstellungen, nur Namen der jeweiligen Figuren auf dem Schachbrett hate. Ich überlegte mir wie ich wohl die Figuren bildlich darstelle... *„Von jemanden oder selbstgemacht? Raster-Bilder oder Vektorgrafiken?“*. So entschied ich mich aus motivation für eigengefertigte Figuren als Vektoren. Nach einwenig Inspiration durch verschiedenste Designs aus dem Internet, hatte ich die Vision und erstellte das letztendliche und derzeitige Design der Figuren mit der SaaS [Figma](https://figma.com).

Nun war das Schbrett an der Reihe, welches optisch nicht in's Auge fiel. Nach nicht allzu langer Zeit rum probieren hatte die Idee. Da mir das Design von macOS so gefällt und es thematisch passt, da es sehr edel aussieht und zum mittelalterlichen Stil passt, probierte ich dieses Designprinzip zu übernehmen. Und so entstand das Apple ähnliche aussehen der Oberfläche. Unter anderem bemerkte ich aber, dass die meisten Browser den Verwascheneneffekt noch nicht unterstützten oder sogar auf Lowend-Geräten dies zu schlechter Performance führte, weswegen ich eine Option hinzufügte, welche ermöglicht schöne oder schlechte Grafik einzustellen, wo mit der Verwaschungseffekt ein- & ausgeschalten wird. Nach dieser Einstellung merkte ich, dass dem Spiel etwas Personalisierung fehlt. Somit fügt ich zusätzlich die Einstellung des Hintergrunds ein, welche einige vordefinierte Bilder bereitstellt und dem Spieler erlaubt auch eigene Bilder durch eine URL hinzuzufügen.

# Das Leben hat prioritäten...

Auch bei diesem Spaß-Projekt ist es mir durch Lebensereignisse unmöglich gewesen daran weiter zu arbeiten. Somit ist dieses Projekt auch bisher noch unvollständig geblieben.

# Fazit

Ein echt tolles Projekt was mich begeistert hat und immer noch tut. Gerne würde ich wieder in diese Welt eintauchen wollen und weiter Schätze ausgraben – sozusagen. Das entwickeln der Spiele-Engine hat mich sogar sehr motiviert vielleicht mal das Spiel Monopoly selbst zu programmieren, da ich es auch sehr mag. Doch auch habe ich meine Kenntnisse im programmieren zwei dimensionalen Räumlichkeiten verbessert. Nicht zu vergessen die schönen Figuren als Vektorengrafiken, bei denen ich auch meine Erfahrungen machen konnte. Spaß und Kenntnisse zugleich, was besseres kann man nicht bekommen.
