###### *Artikel verfasst: 1 Juni 2021 12:10*
###### *Projektumsetzung: 2018*

# Was ist dieses „Gronkh“

Gronkh, oder auch meist Erik genannt *(Bürgerlich: Erik Range)*, ist wohl der liebste Mensch auf Erden, der viel Herz und Leidenschaft in sein Hobby steckt, welches er zu seiner Arbeit als „Let's player“ machte und auch schon seit längerem überwiegend als Streamer bei Twitch.tv ([twitch.tv/gronkh](https://twitch.tv/gronkh)) tätig ist *(stand Mai 2021)*. Ich verfolge ihn schon seit circa 2011, als ich noch jung war und er sein bekanntestes Let's play zu Minecraft machte ([Let's Play Minecraft #001 [Deutsch] [HD] - Alles auf Anfang](https://www.youtube.com/watch?v=DM52HxaLK-Y&t=366s)), welches ich mir unter anderem seiner anderen Formate auch angesehen habe. Lustig, schlau, charmant und viel mehr, sind die Merkmale welche Gronkh ausmachen.

# Gronkh.de

Gronkh war ebenfalls ein ehemalig selbständiger Programmierer im Bereich Webentwicklung. Nach einigen Änderungen in seinem Leben, wurde er überraschenerweise von seinem späterem Beruf in der Selbständigkeit als Spieleredakteur zu einem Let's player/Streamer. Seither hat er nichts mehr als Programmierer unternommen und hat auch mittlerweile die Zeit nicht mehr dazu, welche er nämlich versucht komplett in sein neues Berufs-Hobby zu investieren. Doch er hat sehr viele Ideen, welche er aber selbst nicht umsetzen und pflegen kann, wie zum Beispiel seine eigene alte selbstentwickelte Webseite bzw. eigene Wiki [gronkh-wiki.de](https://gronkh-wiki.de/wiki/Gronkh.de). In seinen Streams hatte er einige Male erwähnt, dass er nach Webentwicklern auschaut hält, welche ihm bei seinen neuen tollen Ideen aushelfen können. Mit viel Vorfreude, einem Vorbild bei etwas helfen zu können, hab ich die Motivation in mir gespürt, weswegen ich mich begeistert an dieses Projekt setzte.

# Konzeptionierung

Die ersten Schritte fielen mir vorerst etwas schwer. Ich habe nämlich überlegt, was eigentlich die Seite an Information braucht, was sie ausmacht und welchen Sinn und Zweck sie hat. Nach einiger Zeit rum konzeptieren, hatte ich endlich das Konzept vor mir liegen, was mir am richtigsten schien und ich realisieren wollte. Um das Konzept zu erfassen, hatte ich viel danach recherchiert, welche Information dezentralisiert und oder unübersichtlich dargestellt werden, wie zum Beispiel die Google Spreadsheet Tabelle *[„GRONKH: VIDEOÜBERSICHT“](https://docs.google.com/spreadsheets/d/1Sfga9xS_Nqgh5MDSyZ1_oe_IwvYSLmSsWsAAtmo3Yk8/edit#gid=1561140183)*, welche Gronkh selbst bisher gepflegt hat und eventuell auch noch weiterhin selbst tut. Die Tabelle ist weitaus unübersicht und kaum interagierbar, da es schlichtweg eine einfache Tabelle ist, die umständlich zu bedienen ist für einen Normalverbraucher.

- ### Let's play / Stream VODs Archiv
So war mein erstes Ziel klar: Es muss eine Seite sein, welche quasi als Archiv seiner Let's plays und Stream VODs dienen soll, um eine schnellere und einfache bzw. Bildliche übersicht zu bieten.
- ### Neuigkeitenzentrale
Desweiteren konnte ich aus seinen Streams auf Twitch entnehmen, dass meistens eine Nachricht auf seinem Twitter account nicht jeden erreichte, so dachte ich an eine *„Neuigkeitenzentrale“*, welche nämlich die zuletztveröffentlichten Nachrichten zentralisiert auf der Gronkh.de anzeigen soll.
- ### Kalender
Auch wichtig und interessant war der Gedanke eines Kalenders, welcher geplante Streams, Gewinnspiele, real-life Events und sonstige wichtige Termine überblicklich und ebenfalls nämlich zentralisiert festhält, da überlicherweise solche Daten auf sozialen Medien geteilt wurden bzw. bisher noch werden *(stand Mai 2021)*, wo es aber sehr kaotisch von verschiedenten Nachrichten wimmelt und dazu noch Nachrichten mit Planänderungen, die ein Normalverbraucher nicht einfach nachvollziehen kann und deswegen auch häufig die Leute in seinen Streams die ein und die selbe Frage desöfteren wiederholt stellen.
- ### FAQ
Apropo Fragen stellen: Die Leute fragen nicht nur nach Plänen im Kalender nach, sondern sehr viele andere Fragen die ebenfalls wiederholt gestellt werden. Dazu hatte ich mir eine Art FAQ überlegt, wo der Nutzer auf der Gronkh.de nach seiner Frage suchen und schnell seine Antwort erhalten kann. Um bei „heißen“ bzw. Trend-fragen nicht suchen zu müssen, sollten bereits auf der Startseite der FAQ Seite einige Fragen aufgelistet sein. Die Antworten bzw. die Information zu den Fragen, sollten von Mitarbeitern über eine Adminoberfläche gepflegt werden können.

# Realisierung

Zur Realisierung hatte ich Vue.js mit Webpack und Stylus verwendet, mit denen ich mir damals sehr vertraut war. Eine Datenbank habe ich vorerst nicht gebraucht und deswegen alle Daten Hard-Coded abgespeichert, schlicht weg sollte das bloß eine Demo werden. Ran machte ich mich an die Sache und erarbeitete alles Schritt für Schritt. Etwas später erstellt ich selbst auch Buttons mit einem Ripple effekt, welche ziemlich cool sind! Als ich mit dem Layout fertig war, setzte ich das Archiv um, in dem ich einige Daten zur demo dafür aus der Tabelle von Gronkh raussuchte und dazu noch ein passendes Bild zum Spiel im Internet recherchiert habe.

# Kontakt

Sobald ich den ersten Prototypen bereit hatte, hatte ich nun versucht Gronkh auf irgendeine Weise zu kontaktieren. Mit nur einem Post auf Twitter hatte ich mein Glück ihn direkt zu erreichen ([Tweet öffnen](https://twitter.com/Daniel_Sharkov/status/995064806083309568)). Und so haben wir uns danach privat über dieses und ähnliche Themen unterhalten, unteranderem auch über andere Ideen die er hätte.

# Fazit

Leider bin ich nach einer Weile in der Chatliste von Gronkh untergegangen, weshalb er mir erstmal lange Zeit nicht geantwortet hat und letztendlich gar nicht mehr. Ich bereue nichts, nicht die Zeit, den Aufwand, die Mühe und auch nicht einmal die Tatsache, als ich ein Jahr später den Chat nochmal durchgelesen habe, was ich für ein amateur ich damals noch war 😃. Frustlos habe ich mit dem Kopf nach oben weiter gemacht wie zuvor. Weiter meine Fachrichtung studiert und nicht aufgegeben. Heute (stand Mai 2021) hat er schon ein-zwei Entwickler an Board. Vielleicht sollte ich meine Chance mal wieder nutzen, ihn irgendwie anzuschreiben und daraus was zu machen.

Wie auch schon bei jedem Projekt, war das eine gut investierte Zeit, in der ich mich weiterentwickeln konnte und auch wenn es nur für eine kurze Weile andauerte, mit einem sehr tollen Menschen etwas persönlich chatten zu können.

# Anmerkungen zur App Demo

- Die App diente hauptsächlich nur als demo, weswegen die meisten Funktionen nur visuell hinzugefügt wurden, wie z.B. alle Suchen, die FAQ Seite und vieles weitere.
- Sehr viele Bugs, aus dem selben Grund, dass es ist hauptsächlich nur eine Demo ist, welche ich auf die schnelle erstellte. Dazu noch, dass das Projekt schon etwas alt ist...

# Update:

Mittlerweile hat Gronkh eine neue eigene Webseite [gronhk.tv](https://gronkh.tv) mit seinen neuen Entwicklern auf die Beine gestellt - ich muss mich bewerben, ich habe zu große Lust da mitzuwirken! Sehr schöne Seite! 😃