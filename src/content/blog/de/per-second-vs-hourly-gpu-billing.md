---
title: "GPU-Abrechnung pro Sekunde oder pro Stunde: Was kurze Jobs wirklich kosten"
description: "Bei 0,40 $/h kostet ein GPU-Test von 90 Sekunden sekundengenau abgerechnet 1 Cent und stundenweise 40 Cent. Rechenbeispiele, ein maßstabsgetreues Diagramm und Takt und Mindestdauer jeder Plattform."
excerpt: "Der Abrechnungstakt entscheidet, was kurze GPU-Jobs kosten. Wir berechnen fünf Joblängen mit sekundengenauer, minutengenauer und stundenweiser Abrechnung und zeigen, was jede Plattform tatsächlich verwendet."
pubDate: 2026-09-30
locale: "de"
category: "pricing"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/per-second-vs-hourly-gpu-billing-hero.png"
heroImageAlt: "Illustration einer Stoppuhr neben einer treppenförmigen Kostenkurve"
faq:
  - question: "Ist sekundengenaue GPU-Abrechnung günstiger als stundenweise?"
    answer: "Bei kurzen Jobs deutlich. Bei 0,40 $ pro Stunde kostet ein Test von 90 Sekunden sekundengenau abgerechnet mit 60 Sekunden Mindestdauer 1 Cent, nach vollen Stunden abgerechnet 40 Cent. Bei langen Läufen schrumpft der Unterschied auf höchstens eine angebrochene Stunde pro Sitzung."
  - question: "Was ist die Mindestgebühr für eine AWS-EC2-Instanz?"
    answer: "AWS rechnet On-Demand-Instanzen mit Linux, Windows, RHEL und Ubuntu Pro sekundengenau ab, mit 60 Sekunden Mindestdauer. Instanzen mit SUSE Linux Enterprise Server werden nach vollen Stunden abgerechnet."
  - question: "Rechnet Azure virtuelle Maschinen pro Sekunde oder pro Minute ab?"
    answer: "Pro Minute. Laut der FAQ zu den Preisen für Linux-VMs berechnet Azure die Zahl der vollen Minuten, die eine VM läuft. Eine VM, die 6 Minuten und 45 Sekunden läuft, wird also mit 6 Minuten berechnet."
  - question: "Berechnet Google Cloud eine Mindestdauer für GPU-Instanzen?"
    answer: "Ja. Compute Engine berechnet vCPUs, GPUs und Arbeitsspeicher für mindestens 1 Minute und danach in Schritten von 1 Sekunde."
  - question: "Was zahle ich bei GPUFlow, wenn ich eine Miete vorzeitig beende?"
    answer: "Die genutzten Sekunden, mindestens 60, aufgerundet auf den nächsten Cent und nie mehr als der reservierte Betrag. Beim Start der Miete wird der volle gebuchte Betrag reserviert, und der ungenutzte Teil geht am Ende zurück an Ihre Credits."
  - question: "Was passiert mit meiner GPUFlow-Miete, wenn der Rechner des Anbieters offline geht?"
    answer: "Sendet der Rechner 10 Minuten lang keinen Heartbeat, endet die Miete von selbst. Berechnet wird nur die Zeit bis zum letzten Heartbeat des Rechners, der Rest der Reservierung geht zurück an Ihre Credits."
---

Bei 0,40 $ pro Stunde kostet ein Testlauf von 90 Sekunden 1 Cent, wenn sekundengenau mit 60 Sekunden Mindestdauer abgerechnet wird, 1,3 Cent bei minutengenauer Abrechnung und 40 Cent bei Abrechnung nach vollen Stunden. Dieser Faktor 40 ist bei kurzen Jobs die ganze Geschichte. Sobald ein Job länger als ein paar Minuten läuft, liegen sekunden- und minutengenaue Abrechnung weniger als einen Cent auseinander, und über die Rechnung entscheiden Leerlauf, Einrichtungszeit und Speicher.

Unten finden Sie die veröffentlichten Regeln jeder Plattform, Rechenbeispiele mit der Rechnung, ein maßstabsgetreues Diagramm und wie bei GPUFlow aus Reservierung und Erstattung eine Abbuchung wird. Regeln und Preise sind auf dem Stand von September 2026; die Quellen stehen am Ende.

## Drei Arten, GPU-Zeit zu zählen

Jede GPU-Miete hat einen Stundenpreis. Der Unterschied liegt darin, wie die genutzte Zeit in abrechenbare Zeit umgerechnet wird, bevor sie mit diesem Preis multipliziert wird.

- **Pro Sekunde mit Mindestdauer.** Die Sekunden werden gezählt. Liegt die Summe unter der Mindestdauer (meist 60 Sekunden), wird die Mindestdauer berechnet. Kosten = max(60, Sekunden) × Stundenpreis / 3.600.
- **Pro Minute.** Die Minuten werden gezählt. Was mit einer angebrochenen Minute passiert, handhaben die Plattformen unterschiedlich: Manche runden auf, Azure lässt sie weg. In den Beispielen unten runde ich auf, das ist für Sie der ungünstigere Fall. Kosten = Minuten × Stundenpreis / 60.
- **Volle Stunde.** Jede angefangene Stunde zählt ganz. Ein Job von 61 Minuten kostet zwei Stunden. Kosten = ceil(Sekunden / 3.600) × Stundenpreis.

Die Mindestdauer ist wichtiger, als man denkt. Sekundengenaue Abrechnung mit 60 Sekunden Mindestdauer und minutengenaue Abrechnung sind für alles unter einer Minute identisch. Der Takt ändert nur den Rest am Ende eines Jobs und kann Sie deshalb nie mehr als einen Takt pro Sitzung kosten: knapp 40 Cent pro Sitzung bei stundenweiser Abrechnung zu 0,40 $ und unter 0,7 Cent pro Sitzung bei minutengenauer Abrechnung zum selben Preis (59 Sekunden × 40 / 3.600 = 0,66 ¢).

## Was jede Plattform verwendet

Das sind die veröffentlichten Regeln für On-Demand-Instanzen, im September 2026 in der Dokumentation des jeweiligen Anbieters geprüft.

| Plattform | Takt | Mindestdauer | Hinweis aus der Doku |
| --- | --- | --- | --- |
| AWS EC2 On-Demand | Pro Sekunde | 60 Sekunden | Gilt für Linux, Windows, RHEL und Ubuntu Pro. SUSE Linux Enterprise Server wird nach vollen Stunden abgerechnet. |
| Google Cloud Compute Engine | Pro Sekunde | 1 Minute | „Alle vCPUs, GPUs und GB Arbeitsspeicher werden für mindestens 1 Minute berechnet.“ |
| Azure Virtual Machines | Pro Minute | Keine Angabe | Berechnet „die Zahl der vollen Minuten“; eine VM, die 6 Min. 45 s läuft, wird mit 6 Minuten berechnet. |
| Lambda (On-Demand-Cloud) | Pro Minute | Keine Angabe | Berechnet „in Schritten von einer Minute“, ab dem Moment, in dem die Instanz die Health Checks besteht, bis Sie sie beenden. |
| RunPod Pods | Pro Sekunde | Keine Angabe | Rechenleistung und Speicher werden beide sekundengenau berechnet. |
| Vast.ai | Pro Sekunde | Keine Angabe | Eine aktive Miete wird jede Sekunde berechnet; Speicher jede Sekunde, die die Instanz existiert, außer sie ist offline. |
| GPUFlow | Pro Sekunde | 60 Sekunden | Volle Sekunden, auf den Cent aufgerundet, gedeckelt auf den reservierten Betrag. |

Zwei Hinweise zum Lesen der Tabelle. Die Regel von Azure rundet tatsächlich ab: Laut FAQ werden Ihnen „keine zusätzlichen Sekunden berechnet“. Die Doku von Lambda spricht von Schritten zu einer Minute, sagt aber nicht, in welche Richtung eine angebrochene Minute gerundet wird; ich habe daher keines von beiden angenommen. Und „keine Angabe“ heißt genau das: Die Doku, die ich gelesen habe, nennt keine Mindestdauer. Das ist etwas anderes als eine dokumentierte Mindestdauer von null.

Keine dieser Plattformen rundet GPU-Rechenzeit für die genannten Instanztypen auf volle Stunden. Stundenweises Runden taucht aber im Kleingedruckten noch auf, wie bei SUSE auf AWS. Prüfen Sie also die Abrechnungsseite, bevor Sie irgendwo neu viele kurze Jobs laufen lassen.

## Fünf Jobs zu 0,40 $ pro Stunde

Hier ist ein einziger Preis, 0,40 $ pro Stunde, angewendet auf fünf Joblängen. Das sind 40 Cent pro 3.600 Sekunden oder 1/90 Cent pro Sekunde.

**Ein Test von 90 Sekunden.** Pro Sekunde: 90 × 40 / 3.600 = 1,0 ¢. Pro Minute: 2 Minuten × 40 / 60 = 1,33 ¢. Volle Stunde: 40 ¢. Die stundenweise Rechnung ist 40-mal so hoch wie die sekundengenaue.

**7 Minuten 30 Sekunden.** Pro Sekunde: 450 × 40 / 3.600 = 5,0 ¢. Pro Minute: 8 Minuten × 40 / 60 = 5,33 ¢. Volle Stunde: 40 ¢, 8-mal so viel.

**38 Minuten 20 Sekunden.** Pro Sekunde: 2.300 × 40 / 3.600 = 25,56 ¢. Pro Minute: 39 Minuten × 40 / 60 = 26,0 ¢. Volle Stunde: 40 ¢, etwa 1,57-mal so viel.

**61 Minuten.** Pro Sekunde: 3.660 × 40 / 3.600 = 40,67 ¢. Pro Minute: 61 × 40 / 60 = 40,67 ¢ (der Job endet auf einer vollen Minute, also stimmen beide überein). Volle Stunde: zwei Stunden, 80 ¢. Eine Minute mehr verdoppelt die stundenweise Rechnung fast.

| Joblänge | Pro Sekunde (60 s Minimum) | Pro Minute (aufgerundet) | Volle Stunde | GPUFlow-Abbuchung |
| --- | --- | --- | --- | --- |
| 1 Min. 30 s | 1,00 ¢ | 1,33 ¢ | 40 ¢ | 1 ¢ |
| 7 Min. 30 s | 5,00 ¢ | 5,33 ¢ | 40 ¢ | 5 ¢ |
| 38 Min. 20 s | 25,56 ¢ | 26,00 ¢ | 40 ¢ | 26 ¢ |
| 61 Min. | 40,67 ¢ | 40,67 ¢ | 80 ¢ | 41 ¢ |
| 20 Jobs à 2 Min. 30 s | 33,33 ¢ | 40,00 ¢ | 8,00 $ | 40 ¢ (20 Mieten) |

Die GPUFlow-Spalte ist das sekundengenaue Ergebnis, pro Miete auf einen vollen Cent aufgerundet, so wie es der Abrechnungscode macht. Die letzte Zeile erklären wir zwei Abschnitte weiter unten.

## Kosten nach Joblänge, maßstabsgetreu

Das erste Diagramm reicht von 0 bis 150 Minuten. Die Treppe der minutengenauen Abrechnung hat Stufen von 1 Minute Breite und 0,67 Cent Höhe; in diesem Maßstab liegt sie deshalb auf der sekundengenauen Linie. Die Treppe, auf die es ankommt, ist die der vollen Stunden: Sie springt bei 0, 60 und 120 Minuten um 40 Cent.

<figure>
<svg viewBox="0 0 720 400" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">Kosten eines Jobs zu 0,40 Dollar pro Stunde von 0 bis 150 Minuten bei sekundengenauer, minutengenauer und stundenweiser Abrechnung</title>
<rect x="0" y="0" width="720" height="400" fill="#ffffff"/>
<line x1="90" y1="320.0" x2="690" y2="320.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="325.0" text-anchor="end" fill="#64748b" font-size="13">0,00 $</text>
<line x1="90" y1="275.0" x2="690" y2="275.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="280.0" text-anchor="end" fill="#64748b" font-size="13">0,20 $</text>
<line x1="90" y1="230.0" x2="690" y2="230.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="235.0" text-anchor="end" fill="#64748b" font-size="13">0,40 $</text>
<line x1="90" y1="185.0" x2="690" y2="185.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="190.0" text-anchor="end" fill="#64748b" font-size="13">0,60 $</text>
<line x1="90" y1="140.0" x2="690" y2="140.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="145.0" text-anchor="end" fill="#64748b" font-size="13">0,80 $</text>
<line x1="90" y1="95.0" x2="690" y2="95.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="100.0" text-anchor="end" fill="#64748b" font-size="13">1,00 $</text>
<line x1="90" y1="50.0" x2="690" y2="50.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="55.0" text-anchor="end" fill="#64748b" font-size="13">1,20 $</text>
<line x1="90.0" y1="320" x2="90.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="90.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">0</text>
<line x1="210.0" y1="320" x2="210.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="210.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">30</text>
<line x1="330.0" y1="320" x2="330.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="330.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">60</text>
<line x1="450.0" y1="320" x2="450.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="450.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">90</text>
<line x1="570.0" y1="320" x2="570.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="570.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">120</text>
<line x1="690.0" y1="320" x2="690.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="690.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">150</text>
<line x1="90" y1="320" x2="690" y2="320" stroke="#64748b" stroke-width="1.5"/>
<line x1="90" y1="50" x2="90" y2="320" stroke="#64748b" stroke-width="1.5"/>
<text x="390.0" y="365" text-anchor="middle" fill="#1e1b4b">Joblänge (Minuten)</text>
<text x="22" y="185.0" text-anchor="middle" fill="#1e1b4b" transform="rotate(-90 22 185.0)">Kosten bei 0,40 $ pro Stunde</text>
<polyline fill="none" stroke="#f97316" stroke-width="3" points="90.0,230.0 330.0,230.0 330.0,140.0 570.0,140.0 570.0,50.0 690.0,50.0"/>
<polyline fill="none" stroke="#16a34a" stroke-width="2.5" stroke-dasharray="6 4" points="90.0,318.5 94.0,318.5 94.0,317.0 98.0,317.0 98.0,315.5 102.0,315.5 102.0,314.0 106.0,314.0 106.0,312.5 110.0,312.5 110.0,311.0 114.0,311.0 114.0,309.5 118.0,309.5 118.0,308.0 122.0,308.0 122.0,306.5 126.0,306.5 126.0,305.0 130.0,305.0 130.0,303.5 134.0,303.5 134.0,302.0 138.0,302.0 138.0,300.5 142.0,300.5 142.0,299.0 146.0,299.0 146.0,297.5 150.0,297.5 150.0,296.0 154.0,296.0 154.0,294.5 158.0,294.5 158.0,293.0 162.0,293.0 162.0,291.5 166.0,291.5 166.0,290.0 170.0,290.0 170.0,288.5 174.0,288.5 174.0,287.0 178.0,287.0 178.0,285.5 182.0,285.5 182.0,284.0 186.0,284.0 186.0,282.5 190.0,282.5 190.0,281.0 194.0,281.0 194.0,279.5 198.0,279.5 198.0,278.0 202.0,278.0 202.0,276.5 206.0,276.5 206.0,275.0 210.0,275.0 210.0,273.5 214.0,273.5 214.0,272.0 218.0,272.0 218.0,270.5 222.0,270.5 222.0,269.0 226.0,269.0 226.0,267.5 230.0,267.5 230.0,266.0 234.0,266.0 234.0,264.5 238.0,264.5 238.0,263.0 242.0,263.0 242.0,261.5 246.0,261.5 246.0,260.0 250.0,260.0 250.0,258.5 254.0,258.5 254.0,257.0 258.0,257.0 258.0,255.5 262.0,255.5 262.0,254.0 266.0,254.0 266.0,252.5 270.0,252.5 270.0,251.0 274.0,251.0 274.0,249.5 278.0,249.5 278.0,248.0 282.0,248.0 282.0,246.5 286.0,246.5 286.0,245.0 290.0,245.0 290.0,243.5 294.0,243.5 294.0,242.0 298.0,242.0 298.0,240.5 302.0,240.5 302.0,239.0 306.0,239.0 306.0,237.5 310.0,237.5 310.0,236.0 314.0,236.0 314.0,234.5 318.0,234.5 318.0,233.0 322.0,233.0 322.0,231.5 326.0,231.5 326.0,230.0 330.0,230.0 330.0,228.5 334.0,228.5 334.0,227.0 338.0,227.0 338.0,225.5 342.0,225.5 342.0,224.0 346.0,224.0 346.0,222.5 350.0,222.5 350.0,221.0 354.0,221.0 354.0,219.5 358.0,219.5 358.0,218.0 362.0,218.0 362.0,216.5 366.0,216.5 366.0,215.0 370.0,215.0 370.0,213.5 374.0,213.5 374.0,212.0 378.0,212.0 378.0,210.5 382.0,210.5 382.0,209.0 386.0,209.0 386.0,207.5 390.0,207.5 390.0,206.0 394.0,206.0 394.0,204.5 398.0,204.5 398.0,203.0 402.0,203.0 402.0,201.5 406.0,201.5 406.0,200.0 410.0,200.0 410.0,198.5 414.0,198.5 414.0,197.0 418.0,197.0 418.0,195.5 422.0,195.5 422.0,194.0 426.0,194.0 426.0,192.5 430.0,192.5 430.0,191.0 434.0,191.0 434.0,189.5 438.0,189.5 438.0,188.0 442.0,188.0 442.0,186.5 446.0,186.5 446.0,185.0 450.0,185.0 450.0,183.5 454.0,183.5 454.0,182.0 458.0,182.0 458.0,180.5 462.0,180.5 462.0,179.0 466.0,179.0 466.0,177.5 470.0,177.5 470.0,176.0 474.0,176.0 474.0,174.5 478.0,174.5 478.0,173.0 482.0,173.0 482.0,171.5 486.0,171.5 486.0,170.0 490.0,170.0 490.0,168.5 494.0,168.5 494.0,167.0 498.0,167.0 498.0,165.5 502.0,165.5 502.0,164.0 506.0,164.0 506.0,162.5 510.0,162.5 510.0,161.0 514.0,161.0 514.0,159.5 518.0,159.5 518.0,158.0 522.0,158.0 522.0,156.5 526.0,156.5 526.0,155.0 530.0,155.0 530.0,153.5 534.0,153.5 534.0,152.0 538.0,152.0 538.0,150.5 542.0,150.5 542.0,149.0 546.0,149.0 546.0,147.5 550.0,147.5 550.0,146.0 554.0,146.0 554.0,144.5 558.0,144.5 558.0,143.0 562.0,143.0 562.0,141.5 566.0,141.5 566.0,140.0 570.0,140.0 570.0,138.5 574.0,138.5 574.0,137.0 578.0,137.0 578.0,135.5 582.0,135.5 582.0,134.0 586.0,134.0 586.0,132.5 590.0,132.5 590.0,131.0 594.0,131.0 594.0,129.5 598.0,129.5 598.0,128.0 602.0,128.0 602.0,126.5 606.0,126.5 606.0,125.0 610.0,125.0 610.0,123.5 614.0,123.5 614.0,122.0 618.0,122.0 618.0,120.5 622.0,120.5 622.0,119.0 626.0,119.0 626.0,117.5 630.0,117.5 630.0,116.0 634.0,116.0 634.0,114.5 638.0,114.5 638.0,113.0 642.0,113.0 642.0,111.5 646.0,111.5 646.0,110.0 650.0,110.0 650.0,108.5 654.0,108.5 654.0,107.0 658.0,107.0 658.0,105.5 662.0,105.5 662.0,104.0 666.0,104.0 666.0,102.5 670.0,102.5 670.0,101.0 674.0,101.0 674.0,99.5 678.0,99.5 678.0,98.0 682.0,98.0 682.0,96.5 686.0,96.5 686.0,95.0 690.0,95.0"/>
<polyline fill="none" stroke="#6366f1" stroke-width="2.5" points="90.0,318.5 94.0,318.5 690.0,95.0"/>
<line x1="110" y1="22" x2="138" y2="22" stroke="#6366f1" stroke-width="3"/><text x="144" y="27" fill="#1e1b4b" font-size="13">Pro Sekunde, min. 60 s</text>
<line x1="330" y1="22" x2="358" y2="22" stroke="#16a34a" stroke-width="3" stroke-dasharray="6 4"/><text x="364" y="27" fill="#1e1b4b">Pro Minute</text>
<line x1="480" y1="22" x2="508" y2="22" stroke="#f97316" stroke-width="3"/><text x="514" y="27" fill="#1e1b4b">Volle Stunde</text>
</svg>
<figcaption>Kosten eines Jobs bei 0,40 $ pro Stunde. Die stundenweise Abrechnung (orange) berechnet die vollen 40 Cent, sobald eine neue Stunde beginnt; sekunden- und minutengenaue Abrechnung sind fast dieselbe Linie.</figcaption>
</figure>

Der Abstand zwischen der orangefarbenen Treppe und der blauen Linie ist das, was das Runden auf volle Stunden pro Job kostet: am größten direkt nach jeder Stufe, null bei vollen Stunden.

Vergrößert auf die ersten zehn Minuten zeigt die minutengenaue Abrechnung ihre Stufen, und die Mindestdauer von 60 Sekunden erscheint als flacher Anfang der sekundengenauen Linie. Die Abrechnung nach vollen Stunden wäre eine flache Linie bei 40 Cent, fünfmal höher als der obere Rand dieses Diagramms.

<figure>
<svg viewBox="0 0 720 400" role="img" aria-labelledby="d2-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d2-title">Vergrößerung der ersten 10 Minuten bei 0,40 Dollar pro Stunde: sekunden- und minutengenaue Abrechnung, die stundenweise Abrechnung liegt außerhalb der Skala</title>
<rect x="0" y="0" width="720" height="400" fill="#ffffff"/>
<line x1="90" y1="320.0" x2="690" y2="320.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="325.0" text-anchor="end" fill="#64748b" font-size="13">0¢</text>
<line x1="90" y1="252.5" x2="690" y2="252.5" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="257.5" text-anchor="end" fill="#64748b" font-size="13">2¢</text>
<line x1="90" y1="185.0" x2="690" y2="185.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="190.0" text-anchor="end" fill="#64748b" font-size="13">4¢</text>
<line x1="90" y1="117.5" x2="690" y2="117.5" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="122.5" text-anchor="end" fill="#64748b" font-size="13">6¢</text>
<line x1="90" y1="50.0" x2="690" y2="50.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="55.0" text-anchor="end" fill="#64748b" font-size="13">8¢</text>
<line x1="90.0" y1="320" x2="90.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="90.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">0</text>
<line x1="150.0" y1="320" x2="150.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="150.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">1</text>
<line x1="210.0" y1="320" x2="210.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="210.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">2</text>
<line x1="270.0" y1="320" x2="270.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="270.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">3</text>
<line x1="330.0" y1="320" x2="330.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="330.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">4</text>
<line x1="390.0" y1="320" x2="390.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="390.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">5</text>
<line x1="450.0" y1="320" x2="450.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="450.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">6</text>
<line x1="510.0" y1="320" x2="510.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="510.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">7</text>
<line x1="570.0" y1="320" x2="570.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="570.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">8</text>
<line x1="630.0" y1="320" x2="630.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="630.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">9</text>
<line x1="690.0" y1="320" x2="690.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="690.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">10</text>
<line x1="90" y1="320" x2="690" y2="320" stroke="#64748b" stroke-width="1.5"/>
<line x1="90" y1="50" x2="90" y2="320" stroke="#64748b" stroke-width="1.5"/>
<text x="390.0" y="365" text-anchor="middle" fill="#1e1b4b">Joblänge (Minuten)</text>
<text x="22" y="185.0" text-anchor="middle" fill="#1e1b4b" transform="rotate(-90 22 185.0)">Kosten bei 0,40 $ pro Stunde</text>
<polyline fill="none" stroke="#16a34a" stroke-width="2.5" stroke-dasharray="6 4" points="90.0,297.5 150.0,297.5 150.0,275.0 210.0,275.0 210.0,252.5 270.0,252.5 270.0,230.0 330.0,230.0 330.0,207.5 390.0,207.5 390.0,185.0 450.0,185.0 450.0,162.5 510.0,162.5 510.0,140.0 570.0,140.0 570.0,117.5 630.0,117.5 630.0,95.0 690.0,95.0"/>
<polyline fill="none" stroke="#6366f1" stroke-width="2.5" points="90.0,297.5 150.0,297.5 690.0,95.0"/>
<text x="104" y="74" text-anchor="start" fill="#f97316">Volle Stunde: 0,40 $ für jede dieser Längen (außerhalb der Skala)</text>
<line x1="110" y1="22" x2="138" y2="22" stroke="#6366f1" stroke-width="3"/><text x="144" y="27" fill="#1e1b4b" font-size="13">Pro Sekunde, min. 60 s</text>
<line x1="330" y1="22" x2="358" y2="22" stroke="#16a34a" stroke-width="3" stroke-dasharray="6 4"/><text x="364" y="27" fill="#1e1b4b">Pro Minute</text>
<line x1="480" y1="22" x2="508" y2="22" stroke="#f97316" stroke-width="3"/><text x="514" y="27" fill="#1e1b4b">Volle Stunde</text>
</svg>
<figcaption>Die ersten 10 Minuten bei 0,40 $ pro Stunde. Beide Linien beginnen wegen der Mindestdauer von einer Minute bei 0,67 Cent. Die minutengenaue Linie (grün) liegt nie mehr als 0,67 Cent über der sekundengenauen (blau).</figcaption>
</figure>

## Ein Tag voller kurzer Jobs

Kurze Jobs kommen selten allein. Angenommen, Sie lassen an einem Arbeitstag 20 Jobs von je 2 Minuten 30 Sekunden laufen und starten für jeden eine neue Instanz.

- **Pro Sekunde:** 20 × 150 s = 3.000 s, und 3.000 × 40 / 3.600 = 33,33 ¢.
- **Pro Minute, aufgerundet:** Jeder Job zählt 3 Minuten, insgesamt also 60 Minuten: 40 ¢.
- **Volle Stunde:** Jeder Job ist eine angefangene Stunde: 20 × 40 ¢ = 8,00 $.

Stundenweise Abrechnung kostet für dieselben 50 Minuten GPU-Arbeit das 24-Fache. Der naheliegende Ausweg: eine Maschine den ganzen Tag laufen lassen. Acht Stunden zu 0,40 $ sind 3,20 $. Das schlägt 8,00 $, ist aber immer noch das 9,6-Fache der sekundengenauen Rechnung, weil Sie jetzt die Pausen zwischen den Jobs bezahlen.

Dieses Beispiel schönt allerdings den Ansatz mit neuen Instanzen, denn es geht davon aus, dass ein Job in dem Moment startet, in dem die Maschine startet. Das tut er nicht. Nehmen wir zur Veranschaulichung an, dass jeder Start 3 Minuten mit Booten, dem Laden eines Images und eines Modells verbringt, bevor die Arbeit beginnt (Ihr Wert wird anders sein). Sekundengenaue Abrechnung berechnet dann 20 × 330 s = 6.600 s, also 73,33 ¢, mehr als das Doppelte der 33,33 ¢ für die eigentliche Arbeit. Der Takt ist derselbe; die Verschwendung ist in die Einrichtung gewandert.

Bei GPUFlow sieht derselbe Tag etwas anders aus, denn eine Miete wird in vollen Stunden gebucht und sekundengenau abgerechnet. 20 einzelne Mieten von je 150 s kosten ceil(150 × 40 / 3.600) = ceil(1,67) = 2 ¢ pro Miete, insgesamt also 40 ¢. Das Aufrunden jeder Miete auf einen vollen Cent macht hier 0,33 ¢ pro Job aus; daher kommen die 6,67 ¢ mehr gegenüber der sekundengenauen Summe. Wenn die Jobs dicht aufeinander folgen, beachten Sie das Limit von 10 neuen Mieten pro Stunde und Nutzer. Eine einzige Miete den ganzen Tag offen zu halten, kostet die volle Uhrzeit, 8 Stunden = 3,20 $, denn GPUFlow rechnet nach Zeit ab, nicht nach Tokens.

## Was wichtiger ist als der Takt

Sobald Jobs länger als etwa zehn Minuten laufen, ist die Frage pro Sekunde oder pro Minute ein Rundungsfehler. Diese drei Dinge sind es nicht. Ausführlicher behandelt sie [GPU mieten: Was der Stundenpreis verschweigt und was Sie wirklich zahlen](/de/hidden-fees-in-gpu-rental/).

### Leerlauf

Jede Plattform mit sekundengenauer Abrechnung berechnet eine laufende Instanz, ob die GPU arbeitet oder nicht. Die Doku von Lambda sagt es direkt: Instanzen werden berechnet, „egal ob sie aktiv genutzt werden“. Der Tag mit kurzen Jobs oben zeigt die Größenordnung: 50 Minuten Arbeit, 3,20 $, wenn die Maschine 8 Stunden läuft. Kein Abrechnungstakt hilft gegen eine Maschine, die Sie vergessen haben anzuhalten.

### Einrichtungszeit

Booten, Laden von Images und Herunterladen von Modellen laufen alle auf die Uhr. Lambda beginnt mit der Abrechnung, sobald die Instanz die Health Checks besteht, bevor Ihr Code irgendetwas getan hat. Sekundengenaue Abrechnung beseitigt diese Kosten nicht; Sie zahlen sie bei jedem Start.

### Speicher im gestoppten Zustand

Wer eine Maschine stoppt, stoppt meist die GPU-Kosten. Die Festplatte wird weiter berechnet. RunPod berechnet das Volume eines gestoppten Pods mit 0,20 $ pro GB und Monat, doppelt so viel wie im laufenden Betrieb, und warnt in der Doku, dass „für gestoppte Pods weiterhin Speicherkosten anfallen“. Vast.ai sagt klar, dass „das Stoppen einer Instanz keine Speicherkosten vermeidet“. Ein Volume mit 100 GB an einem gestoppten RunPod-Pod kostet 100 × 0,20 $ = 20 $ im Monat, das sind 50 Stunden GPU-Zeit zu 0,40 $.

Wenn Ihre Arbeit aus Aufrufen eines Modells besteht und nicht aus eigenem Code auf einer Maschine, vergleichen Sie auch mit Preisen pro Token: [GPU pro Stunde oder API pro Token?](/de/hourly-gpu-vs-per-token-api/) rechnet durch, wann was günstiger ist.

## Wie GPUFlow abrechnet: erst reservieren, dann den Rest erstatten

GPUFlow vermietet Inferenz: Sie bekommen einen OpenAI-kompatiblen API-Schlüssel für ein Modell, das auf der GPU eines anderen läuft, keine Maschine. Es gibt keine Shell, keine Festplatte und kein Image, für die Sie zahlen müssten; Speicher und Einrichtung aus dem vorigen Abschnitt fallen also weg. Leerlauf nicht: Die Miete wird vom Start bis zum Ende berechnet, ob die GPU arbeitet oder nicht.

Die Schritte:

1. Sie wählen ein Angebot und eine ganze Zahl von Stunden (standardmäßig 1 bis 168). Der Stundenpreis des Anbieters wird in ganze Cent umgerechnet.
2. Beim Start wird der volle gebuchte Betrag von Ihren Credits reserviert: Preis in Cent × Stunden. Das ist der ganze Betrag, und er wird im Voraus reserviert.
3. Wenn die Miete endet, wird die Abbuchung einmal berechnet: genutzte volle Sekunden, mindestens 60, mal Preis in Cent, geteilt durch 3.600, aufgerundet auf den nächsten Cent und nie mehr als die Reservierung.
4. Was von der Reservierung übrig bleibt, geht im selben Schritt zurück an Ihre verfügbaren Credits.

![Das GPUFlow-Mietformular für eine GPU zu 0,35 $ pro Stunde, mit 2 eingegebenen Stunden, 0,70 $ reserviert und hervorgehobener Schaltfläche 2-Stunden-Miete starten](../_images/screens/de/renter-rent.png)

Das Mietformular zeigt die Reservierung, bevor Sie starten: 2 Stunden zu 0,35 $ reservieren 0,70 $.

### Ein Rechenbeispiel

Sie buchen 3 Stunden zu 0,40 $. Die Reservierung beträgt 40 ¢ × 3 = 120 ¢ (1,20 $). Nach 38 Minuten 20 Sekunden, also 2.300 Sekunden, klicken Sie auf **Jetzt beenden**.

- Abbuchung: ceil(2.300 × 40 / 3.600) = ceil(25,56) = **26 ¢**.
- Zurück an Ihre Credits: 120 − 26 = **94 ¢**.
- Die Plattformgebühr beträgt 12 % der Abbuchung, pro Miete auf den nächsten Cent gerundet: round(26 × 0,12) = round(3,12) = 3 ¢. Der Anbieter bekommt 26 − 3 = 23 ¢, also 88,5 % dieser Abbuchung statt genau 88 %. Bei größeren Beträgen spielt die Rundung eine kleinere Rolle.

<figure>
<svg viewBox="0 0 720 230" role="img" aria-labelledby="d3-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d3-title">Eine Reservierung von 120 Cent für eine Buchung über 3 Stunden zu 0,40 Dollar pro Stunde, beendet nach 38 Minuten 20 Sekunden: 26 Cent berechnet, 94 Cent zurück, und die 26 Cent aufgeteilt in 23 Cent für den Anbieter und 3 Cent für GPUFlow</title>
<rect x="0" y="0" width="720" height="230" fill="#ffffff"/>
<text x="60" y="30" fill="#1e1b4b">Beim Start reserviert: 120¢ (0,40 $ × 3 Stunden)</text>
<rect x="60" y="45" width="130" height="50" fill="#6366f1"/>
<rect x="190" y="45" width="470" height="50" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="125" y="76" text-anchor="middle" fill="#ffffff">26¢</text>
<text x="425" y="76" text-anchor="middle" fill="#1e1b4b">94¢ zurück an Ihre Credits</text>
<line x1="60" y1="95" x2="60" y2="150" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<line x1="190" y1="95" x2="190" y2="150" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="205" y="127" fill="#64748b">Berechnet für 38 Min. 20 s, dann aufgeteilt</text>
<rect x="60" y="150" width="115" height="50" fill="#16a34a"/>
<rect x="175" y="150" width="15" height="50" fill="#f97316"/>
<text x="117" y="181" text-anchor="middle" fill="#ffffff">23¢</text>
<text x="205" y="172" fill="#1e1b4b">Anbieter: 23¢</text>
<text x="205" y="195" fill="#1e1b4b">GPUFlow-Gebühr: 3¢ (12 % von 26¢, gerundet)</text>
</svg>
<figcaption>Die Reservierung von 120 Cent aus dem Beispiel, maßstabsgetreu: 26 Cent für 38 Min. 20 s Nutzung berechnet, 94 Cent zurück an die Credits, und die 26 Cent aufgeteilt zwischen Anbieter und GPUFlow.</figcaption>
</figure>

### Wenn eine Miete ohne Sie endet

Sind die gebuchten Stunden abgelaufen, schließt ein Hintergrundjob, der jede Minute läuft, die Miete ab. Die Abbuchung wird bis zum gebuchten Endzeitpunkt berechnet; eine Verzögerung, bis der Job läuft, zahlen Sie also nicht. Der API-Schlüssel funktioniert ab dem Endzeitpunkt nicht mehr. Wenn Sie mehr Zeit brauchen, reserviert **Stunden hinzufügen** weitere Credits, und der Schlüssel bleibt derselbe.

Auch wenn der Rechner des Anbieters verstummt, endet die Miete. Der Agent auf dem Rechner des Anbieters sendet alle 15 Sekunden einen Heartbeat. Kommt 10 Minuten lang keiner, wird die Miete beendet und nur bis zum letzten Heartbeat berechnet. Bei 0,40 $ pro Stunde kostet ein Rechner, der 25 Minuten nach Beginn einer 3-Stunden-Buchung ausfällt, ceil(1.500 × 40 / 3.600) = 17 ¢, und die übrigen 103 ¢ der Reservierung von 120 ¢ kommen zurück.

Beim Buchen in vollen Stunden gibt es mit dem 61-Minuten-Job einen Haken. Wenn Sie 1 Stunde buchen und vergessen, vor dem Ablauf auf **Stunden hinzufügen** zu klicken, funktioniert der Schlüssel nach 60 Minuten nicht mehr, und Sie zahlen 40 ¢ für einen unfertigen Job. Buchen Sie 2 Stunden (80 ¢ reserviert) und beenden Sie nach 61 Minuten, zahlen Sie 41 ¢ und bekommen 39 ¢ zurück. Im Zweifel: lang buchen und früh beenden; ungenutzte Zeit kostet nichts.

## Das Abrechnungsmodell nach Art der Jobs wählen

- **Viele Jobs unter 10 Minuten:** sekunden- oder minutengenaue Abrechnung, und prüfen Sie die Mindestdauer. Alles, was auf volle Stunden rundet, ist hier das falsche Werkzeug.
- **Jobs von 30 bis 90 Minuten:** Meiden Sie das Runden auf volle Stunden (ein Job von 61 Minuten zahlt zwei Stunden). Pro Sekunde oder pro Minute macht weniger als einen Cent pro Job aus.
- **Lange Läufe über viele Stunden:** Der Takt fällt kaum ins Gewicht. Achten Sie stattdessen auf Leerlauf, Einrichtung und Speicher.
- **Aufrufe eines Modells in Schüben über den Tag:** Eine neue Maschine pro Schub zahlt jedes Mal die Einrichtung, eine durchgehend laufende Maschine zahlt die Pausen. Eine Inferenz-Miete, bei der ein Modell bereitsteht, ist ein Weg, die Einrichtung zu vermeiden, aber die Uhr läuft auch zwischen den Aufrufen weiter. Legen Sie die Buchung also auf die Zeiten, in denen Sie tatsächlich arbeiten.

Wenn Sie es ausprobieren wollen: Der [GPUFlow-Marktplatz](https://gpuflow.app/de/marketplace) zeigt die Stundenpreise pro GPU, und [was Sie zum Mieten einer GPU brauchen](/de/what-you-need-to-rent-a-gpu/) behandelt Konto und Zahlung.

## Quellen

- AWS, Preise für Amazon EC2 On-Demand (Abrechnungsdetails): [aws.amazon.com/ec2/pricing/on-demand](https://aws.amazon.com/ec2/pricing/on-demand/)
- Google Cloud, Preise für VM-Instanzen (Abrechnungsmodell): [cloud.google.com/compute/vm-instance-pricing](https://cloud.google.com/compute/vm-instance-pricing)
- Microsoft Azure, Preise für Linux Virtual Machines (FAQ): [azure.microsoft.com/pricing/details/virtual-machines/linux](https://azure.microsoft.com/en-us/pricing/details/virtual-machines/linux/)
- Lambda, Überblick zur Abrechnung: [docs.lambda.ai/public-cloud/billing](https://docs.lambda.ai/public-cloud/billing/)
- RunPod, Preise für Pods: [docs.runpod.io/pods/pricing](https://docs.runpod.io/pods/pricing)
- Vast.ai, Referenz zur Abrechnung: [docs.vast.ai/documentation/reference/billing](https://docs.vast.ai/documentation/reference/billing)
- GPUFlow-Doku, Credits, Abrechnung und Erstattungen: [docs.gpuflow.app/de/renters/billing](https://docs.gpuflow.app/de/renters/billing/)

Alle geprüft im September 2026.
