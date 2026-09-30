---
title: "RunPod vs. Vast.ai 2026: Preise, Zuverlässigkeit und Speicher"
description: "RunPod vs. Vast.ai, geprüft im September 2026: Preise für RTX 4090 und 3090, sekundengenaue Abrechnung, unterbrechbare Pods, Speicherkosten, Serverless und für wen sich welche Plattform eignet."
excerpt: "Vast.ai ist pro GPU-Stunde meist günstiger; RunPod ist einfacher und hat Speicher, der Ihnen von Maschine zu Maschine folgt. Aktuelle Preise, Abrechnungsregeln und ein Entscheidungsschema."
pubDate: 2026-02-12
updatedDate: 2026-09-30
locale: "de"
category: "comparisons"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/runpod-vs-vastai-comparison.png"
heroImageAlt: "Geteilter Bildschirm mit GPU-Server-Oberflächen, die für die Plattformen RunPod und Vast.ai stehen"
faq:
  - question: "Ist RunPod oder Vast.ai für eine RTX 4090 günstiger?"
    answer: "Meistens Vast.ai. Im September 2026 listete getdeploying.com RTX 4090 auf Vast.ai ab 0,31 $ pro Stunde On-Demand und 0,21 $ unterbrechbar, gegenüber 0,34 $ in der RunPod Community Cloud und 0,74 $ in der RunPod Secure Cloud. Vast.ai berechnet außerdem Datenübertragung, RunPod nicht."
  - question: "Rechnen RunPod und Vast.ai sekundengenau ab?"
    answer: "Ja, beide messen GPU-Zeit pro Sekunde. RunPod rechnet Network Volumes stündlich ab und verlangt mindestens eine Stunde Guthaben für Ihre Konfiguration, bevor ein Pod startet. Vast.ai berechnet Speicher, solange eine Instanz existiert, auch im gestoppten Zustand."
  - question: "Kostet ein gestoppter Pod oder eine gestoppte Instanz weiter Geld?"
    answer: "Bei beiden ja. RunPod berechnet für die Volume-Disk eines gestoppten Pods 0,20 $ pro GB und Monat, und Network Volumes werden weiter mit 0,07 $ pro GB und Monat berechnet. Vast.ai berechnet den Speicherpreis des Hosts, bis Sie die Instanz löschen."
  - question: "Was passiert, wenn mein Guthaben bei RunPod oder Vast.ai aufgebraucht ist?"
    answer: "RunPod stoppt Pods mit Network Volume und beendet Pods ohne eines; deren Daten lassen sich nicht wiederherstellen. Vast.ai stoppt Instanzen bei null Guthaben und löscht sie samt Daten, wenn keine hinterlegte Karte den negativen Saldo deckt."
  - question: "Kann ich RunPod oder Vast.ai mit Krypto bezahlen?"
    answer: "Ja. RunPod akzeptiert Karten, Krypto nach einer KYC-Prüfung und Rechnungen für Bestellungen über 5.000 $. Vast.ai akzeptiert Karten über Stripe und Krypto über BitPay und Crypto.com, mit 5 $ Mindesteinzahlung."
  - question: "Ist Vast.ai zuverlässig genug für den Produktivbetrieb?"
    answer: "Das hängt vom gewählten Host ab. Jede Maschine auf Vast.ai startet mit einem Zuverlässigkeitswert von 60 %, der sich mit ihrer Historie ändert, und Datacenter-Hosts (ISO-27001-zertifiziert, mit blauem Label) sind die, die Vast für den Produktivbetrieb empfiehlt. RunPod Secure Cloud läuft in T3/T4-Rechenzentren."
---

Vast.ai ist meist die günstigere der beiden Plattformen: Eine RTX 4090 gab es dort im September 2026 ab 0,31 $ pro Stunde On-Demand, gegenüber 0,34 $ in der RunPod Community Cloud und 0,74 $ in der RunPod Secure Cloud. RunPod ist das einfachere Produkt: feste Listenpreise, kostenlose Datenübertragung und Network Volumes, mit denen Ihre Dateien jede einzelne Maschine überdauern. Nehmen Sie Vast.ai, wenn der Preis am meisten zählt und Ihr Job den Ausfall eines Hosts übersteht. Nehmen Sie RunPod, wenn Sie weniger Entscheidungen treffen wollen und Speicher brauchen, der nicht an eine Kiste gebunden ist.

Alles hier stammt aus der Doku und den Preisseiten der beiden Unternehmen, dazu getdeploying.com für die Marktplatzpreise von Vast.ai, alles geprüft im September 2026. Die Preise ändern sich wöchentlich. Betrachten Sie sie als Momentaufnahme.

## Auf einen Blick

| | RunPod | Vast.ai |
| --- | --- | --- |
| **Modell** | Ein Unternehmen: Secure Cloud (Rechenzentren) und Community Cloud (geprüfte Peer-Hosts) | Marktplatz: Hosts vom Heim-Rig bis zum zertifizierten Rechenzentrum |
| **Wer legt die Preise fest** | RunPod, feste Liste | Jeder Host |
| **Abrechnung** | Pro Sekunde; 1 Stunde Guthaben zum Start nötig | Pro Sekunde |
| **RTX 4090, pro Stunde** | 0,34 $ Community, 0,74 $ Secure | Ab 0,31 $ On-Demand, 0,21 $ unterbrechbar |
| **Günstigere Stufen** | Spot-Pods (unterbrechbar), Savings Plans über 3 oder 6 Monate | Unterbrechbar (Gebot), reserviert bis zu 50 % günstiger |
| **Speicher im gestoppten Zustand** | Volume-Disk 0,20 $/GB/Monat | Preis des Hosts, bis Sie löschen |
| **Speicher, der mitwandert** | Network Volumes, 0,07 $/GB/Monat | Volumes hängen an einer Maschine |
| **Datenübertragung** | Kostenlos in beide Richtungen | Preis des Hosts, pro Byte |
| **Serverless** | Flex- und Active-Worker | Serverless zu Instanzpreisen |
| **Zahlung** | Karte, Krypto (nach KYC), Rechnung ab 5.000 $ | Karte, BitPay, Crypto.com; 5 $ Minimum |

Der Rest des Beitrags erklärt, woher diese Zeilen kommen und wo sie wehtun.

## Zwei unterschiedliche Arten von Unternehmen

**RunPod** betreibt zwei Pools. Die Secure Cloud „läuft in T3/T4-Rechenzentren“, so RunPod selbst, und richtet sich an Produktivbetrieb und sensible Daten. Die Community Cloud „verbindet einzelne Compute-Anbieter über ein geprüftes, sicheres Peer-to-Peer-System mit Nutzern“. Ein Detail hat sich dieses Jahr geändert: Laut Doku nimmt RunPod „keine neuen Hosts für die Community Cloud mehr an“; bestehende Community-Kapazität bleibt verfügbar. Die günstige RunPod-Stufe ist also ein fester Pool, und gefragte Karten sind dort oft ausverkauft.

**Vast.ai** ist ein Marktplatz. Hosts listen Maschinen, legen ihre eigenen Preise fest, und Sie mieten auf einer davon einen Docker-Container (oder eine VM). Maschinen gibt es in drei Stufen: unverifiziert (neu), verifiziert (hat die Tests von Vast bestanden) und Datacenter. Ein Datacenter-Host muss ISO/IEC 27001 oder eine Tier-2/3-Einstufung vorweisen, einen Hosting-Vertrag unterschreiben, nachweisen, wem das Unternehmen gehört, und mindestens fünf GPU-Server listen. Diese Angebote tragen ein blaues Label und bilden das, was Vast seine „Secure Cloud“ nennt.

Beide Unternehmen nennen ihre Rechenzentrumsstufe „Secure Cloud“. Sie meinen Ähnliches, aber die Prüfung ist unterschiedlich. Lesen Sie also die Definition des jeweiligen Unternehmens, bevor Sie einem Compliance-Team etwas zusagen.

Praktisch bekommen Sie bei beiden einen Container mit SSH und Jupyter. RunPod bietet zusätzlich Verbindungen für VS Code und Cursor sowie einen Web-Proxy zum Freigeben von Ports. Die tägliche Arbeit (Image ziehen, Speicher einhängen, Skript ausführen) ist auf beiden gleich.

## Preise für gängige Karten

Pro GPU und Stunde, On-Demand, sofern nicht anders angegeben, September 2026:

| GPU | Vast.ai | RunPod Community | RunPod Secure |
| --- | --- | --- | --- |
| RTX 3090 | 0,13 $ On-Demand, 0,08 $ unterbrechbar | 0,22 $ | 0,50 $ |
| RTX 4090 | 0,31 $ On-Demand, 0,21 $ unterbrechbar | 0,34 $ | 0,74 $ |

Die Preise für Vast.ai sind die günstigsten Angebote, die getdeploying.com am 30. September 2026 gelistet hat. Der Preis von 0,13 $ für die RTX 3090 galt für eine Maschine mit 8 GPUs, der unterbrechbare Preis von 0,21 $ für die RTX 4090 für eine Maschine mit 4 GPUs in Kanada, beide pro GPU. Angebote mit einer einzelnen GPU liegen manchmal etwas höher. Die RunPod-Preise stammen von der Preisseite und von getdeploying.com. Für größere Karten zeigt die Secure-Cloud-Liste von RunPod die RTX 5090 zu 0,99 $, die A100 80 GB zu 1,59 $ und die H100 SXM zu 3,49 $ pro Stunde.

RunPod hat am 20. September 2026 elf Preise in der Secure Cloud erhöht. Die RTX 4090 stieg von 0,69 $ auf 0,74 $, die A100 von 1,39 $ auf 1,59 $ und die H100 SXM von 2,99 $ auf 3,49 $. RTX 3090 und RTX 5090 blieben gleich, und kein Preis in der Community Cloud hat sich geändert.

### Ein Rechenbeispiel

Zehn Stunden Fine-Tuning auf einer RTX 4090:

- Vast.ai On-Demand: 10 × 0,31 $ = 3,10 $, plus das, was der Host für die bewegten Bytes berechnet.
- Vast.ai unterbrechbar: 10 × 0,21 $ = 2,10 $, wenn Sie niemand überbietet. Wenn doch, verlieren Sie die Zeit seit Ihrem letzten Checkpoint.
- RunPod Community: 10 × 0,34 $ = 3,40 $, wenn eine Karte frei ist.
- RunPod Secure: 10 × 0,74 $ = 7,40 $.

Bei einem einzelnen Job sind das ein paar Dollar Unterschied. Bei einem Monat Dauerbetrieb (730 Stunden) sind es 226 $ auf Vast.ai On-Demand gegenüber 540 $ auf RunPod Secure. Das ist die Zahl, auf die Sie schauen sollten, wenn Sie ein Zuhause für einen lang laufenden Workload suchen.

### Unterbrechbar und Spot

Beide verkaufen günstigere Kapazität, die Ihnen wieder weggenommen werden kann.

Auf Vast.ai geben Sie ein Gebot ab. Eine unterbrechbare Instanz „kann durch höhere Gebote gestoppt werden“, und dann „wird Ihre Instanz gestoppt (laufende Prozesse werden beendet)“. Laut Vast liegt unterbrechbar oft 50 % oder mehr unter On-Demand. On-Demand-Instanzen sind das Gegenteil: ein fester Preis, den der Host festlegt, und sie „können nicht unterbrochen werden“.

RunPod nennt sie unterbrechbare oder Spot-Pods. Die API beschreibt sie als Pods, die „zu geringeren Kosten gemietet, aber jederzeit gestoppt werden können, um Ressourcen für einen anderen Pod freizugeben“. Der Blog von RunPod nennt als Beispiel eine RTX A6000 zu 0,232 $ als Spot gegenüber 0,491 $ On-Demand.

In beiden Fällen gilt dieselbe Regel: Nur für Jobs nutzen, die oft Checkpoints speichern und auf einer anderen Maschine weitermachen können.

### Laufzeitverträge

RunPod verkauft Savings Plans: 3 oder 6 Monate im Voraus zahlen und dafür Rabatt auf GPU-Rechenzeit bekommen. Sie sind nicht erstattungsfähig, haben ein festes Enddatum und decken keinen Speicher ab. Vast.ai verkauft reservierte Instanzen mit Rabatten bis zu 50 %, je nachdem, wie lange Sie sich binden. Bei Vast gilt eine Reservierung für die Maschine eines bestimmten Hosts. Prüfen Sie also dessen Zuverlässigkeit, bevor Sie im Voraus zahlen.

## Zuverlässigkeit: Rechenzentren vs. Host-Marktplatz

Hier unterscheiden sich die beiden am stärksten, und hier kommt der Preisunterschied her.

In der RunPod Secure Cloud mieten Sie von einem Unternehmen, das Hardware und Standort kontrolliert. On-Demand-Pods gehören laut Preisdoku von RunPod Ihnen „und können nicht von anderen Nutzern verdrängt werden“. Die Community Cloud besteht aus Peer-Hosts mit „variabler“ Zuverlässigkeit, so die Vergleichstabelle von RunPod selbst.

Auf Vast.ai mieten Sie von dem, der die Maschine gelistet hat. Vast gibt Ihnen Werkzeuge, um das einzuschätzen:

- **Zuverlässigkeitswert.** „Ein Maß für die bisherige Verfügbarkeit und den Zustand der Maschine. Alle Maschinen starten bei 60 %.“ Ein Wert im oberen 90er-Bereich bedeutet eine lange, saubere Historie.
- **Verifiziert vs. unverifiziert.** Unverifizierte Maschinen sind neu und ungetestet.
- **Datacenter-Label.** Zertifizierte Standorte, von Vast für den Produktivbetrieb empfohlen.
- **Maximale Laufzeit.** Jedes Angebot zeigt, wie lange der Host es vermietet. Ein Angebot „bleibt verfügbar … bis es sein Enddatum erreicht oder vom Host zurückgezogen wird“. Eine Maschine, die Ihnen gefällt, ist nächsten Monat also vielleicht nicht mehr da.

Meine Regel nach Jahren mit Marktplatz-Mieten: zuerst nach Zuverlässigkeit filtern, dann nach Preis, und nie die einzige Kopie von irgendetwas auf der Festplatte eines Hosts lassen. Eine Maschine für 0,25 $, die mitten im Lauf verschwindet, kostet mehr als eine für 0,35 $, die bleibt.

Eine RunPod-Falle sollten Sie kennen. Wenn Sie einen gestoppten Pod neu starten, warnt RunPod, dass Ihnen „möglicherweise null GPUs zugewiesen werden, wenn sich die Kapazität geändert hat“. Ihre Dateien sind noch da, aber die GPU auf dieser Maschine ist vielleicht an jemand anderen vermietet. Genau dafür gibt es Network Volumes.

## Speicher und was das Stoppen kostet

Beim Speicher erzählt der Stundenpreis nicht mehr die ganze Geschichte. Er wird weiter berechnet, wenn die GPU es nicht mehr wird.

### RunPod

| Speicher | Im laufenden Betrieb | Im gestoppten Zustand |
| --- | --- | --- |
| Container-Disk | 0,10 $/GB/Monat | Nicht berechnet (und gelöscht) |
| Volume-Disk (/workspace) | 0,10 $/GB/Monat | 0,20 $/GB/Monat |
| Network Volume, unter 1 TB | 0,07 $/GB/Monat | 0,07 $/GB/Monat |
| Network Volume, über 1 TB | 0,05 $/GB/Monat | 0,05 $/GB/Monat |

Container- und Volume-Disk werden sekundengenau berechnet, Network Volumes stündlich. Die Container-Disk ist nur für temporäre Dateien gedacht und wird geleert, wenn der Pod stoppt. Die Volume-Disk übersteht ein Stoppen, wird aber beim Beenden (Terminate) gelöscht. Ein Network Volume ist von jedem Pod unabhängig und kann an einen neuen angehängt werden. Das löst das Problem mit „null GPUs beim Neustart“: stoppen, woanders einen neuen Pod starten, dasselbe Volume anhängen.

Rechenbeispiel: Sie behalten zwischen den Sitzungen 100 GB an Modellen und Checkpoints. Auf der Volume-Disk eines gestoppten Pods sind das 100 × 0,20 $ = 20 $ im Monat. Auf einem Network Volume sind es 100 × 0,07 $ = 7 $ im Monat, und Sie hängen nicht an einer Maschine. Datenübertragung ist in beide Richtungen kostenlos.

### Vast.ai

Vast hat Container-Speicher, der mit der Instanz gelöscht wird, und lokale Volumes. Zwei Regeln bestimmen, wie Sie damit arbeiten:

- **Die Festplattengröße wird beim Anlegen festgelegt.** Sie lässt sich später nicht ändern. Wählen Sie beim ersten Mal also großzügig.
- **Volumes hängen an einer physischen Maschine.** Sie „können nicht verschoben oder an Instanzen auf anderen Maschinen angehängt werden“.

Die Speicherpreise unterscheiden sich je nach Host und stehen in jedem Angebot (mit der Maus über den Rent-Button fahren). Sie werden berechnet, solange die Instanz existiert: „Speicherkosten laufen auch weiter, wenn Instanzen gestoppt sind. Um die Speicherabrechnung zu beenden, müssen Sie die Instanz vollständig löschen.“ Vast weist allerdings darauf hin, dass nichts berechnet wird, solange eine Maschine offline ist.

Auch Bandbreite berechnet der Host, pro Byte, in beide Richtungen. Ein Modell mit 16 GB herunterzuladen und ein paar Checkpoints hochzuladen kostet bei den meisten Hosts wenig, aber prüfen Sie den Preis, bevor Sie einen großen Datensatz bewegen. RunPod berechnet dafür gar nichts.

Eine längere Liste dessen, was der Stundenpreis auf allen Plattformen verschweigt, finden Sie in [GPU mieten: Was der Stundenpreis verschweigt und was Sie wirklich zahlen](/de/hidden-fees-in-gpu-rental/).

## Templates und Einrichtung

Beide nutzen Docker-Images und nennen ihre Vorlagen „Templates“.

Die Templates von RunPod sind „vorkonfigurierte Docker-Image-Setups, mit denen Sie Pods schnell starten können, ohne die Umgebung manuell zu konfigurieren“: PyTorch, ComfyUI, Inferenzserver und viele aus der Community. Sie wählen eines, suchen eine GPU aus und sind innerhalb von Minuten in JupyterLab oder per SSH drin.

Vast.ai verfolgt dieselbe Idee. Der Schnellstart verweist auf fertige Templates wie PyTorch, TensorFlow und ComfyUI oder auf Ihr eigenes. Die Einrichtung hat ein paar Schritte mehr: E-Mail-Adresse vor der ersten Miete bestätigen, einen öffentlichen SSH-Schlüssel hochladen und das Zertifikat von Vast für Jupyter im Browser installieren.

Da Sie auf beiden jedes beliebige Image verwenden können, spielen Templates nach der ersten Woche eine kleinere Rolle. Der größere praktische Unterschied: Auf RunPod kann Ihre Umgebung auf einem Network Volume liegen und Ihnen folgen, während Sie auf Vast.ai entweder auf jeder neuen Maschine neu aufbauen oder alles in Ihr Image packen.

## Serverless

Beide betreiben Ihren Container als automatisch skalierenden Endpunkt und rechnen ihn unterschiedlich ab.

**RunPod Serverless** hat Flex-Worker, die im Leerlauf auf null skalieren, und Active-Worker, die ständig laufen und günstiger sind (über den Vertrieb vereinbart). Sie zahlen für drei Phasen: Startzeit (Container und Modell in den GPU-Speicher laden), Ausführungszeit und ein Idle-Timeout nach jeder Anfrage, standardmäßig 5 Sekunden. Die Preisseite listete die RTX-4090-Stufe (24 GB PRO) mit 1,10 $ pro Stunde, deutlich mehr als ein Secure-Cloud-Pod für 0,74 $. Sie zahlen dafür, dass nichts laufen muss, solange kein Traffic da ist.

**Vast.ai Serverless** berechnet „denselben Preis wie die Nicht-Serverless-GPU-Instanzen von Vast.ai“, pro Sekunde, ohne Aufschlag. Aktive und ladende Worker zahlen für GPU, Speicher und Bandbreite. Inaktive Worker zahlen nur Speicher und Bandbreite. Worker, die gerade erstellt werden, zahlen keine GPU-Zeit.

Wenn Ihr Traffic in Spitzen kommt und Sie Kaltstarts in Kauf nehmen, funktionieren beide. RunPod ist ausgereifter und hat mehr Beispiele. Vast.ai ist pro GPU-Sekunde günstiger, läuft aber auf demselben gemischten Pool von Hosts.

Wenn Sie nur ein offenes Modell über eine API im OpenAI-Stil aufrufen wollen, brauchen Sie vielleicht keines von beiden. Gehostete APIs mit Abrechnung pro Token sind bei populären Modellen oft am günstigsten ([die Rechnung](/de/hourly-gpu-vs-per-token-api/)). GPUFlow ist eine weitere Option: Sie mieten einen OpenAI-kompatiblen API-Schlüssel für ein Modell, das ein Anbieter mit Ollama auf seiner eigenen GPU betreibt, sekundengenau abgerechnet. Das ist reine Inferenz, ohne SSH, ohne Training und ohne eigenen Code. Für alles andere ersetzt es RunPod oder Vast.ai also nicht. Die drei vergleicht [GPUFlow vs. Vast.ai vs. RunPod](/de/gpuflow-vs-vast-ai-vs-runpod/).

## Zahlung, Mindestbeträge und leeres Guthaben

Beide arbeiten mit Vorkasse, und beide sind unerbittlich, wenn das Guthaben auf null fällt.

**RunPod** nimmt Karten (Visa, Mastercard, Amex und andere über Stripe), Krypto (vor der ersten Kryptozahlung KYC abschließen) und Rechnung per ACH, Überweisung oder Karte für Bestellungen über 5.000 $. Um einen Pod zu starten, brauchen Sie mindestens eine Stunde Guthaben für die gewählte Konfiguration. Guthaben wird nicht erstattet und kann nicht ausgezahlt werden. Wenn es aufgebraucht ist, werden Pods mit Network Volume gestoppt und das Volume bleibt erhalten (und wird weiter berechnet). Pods ohne eines „werden beendet, und ihre Daten lassen sich nicht wiederherstellen“.

**Vast.ai** nimmt Karten über Stripe und Krypto über BitPay und Crypto.com. Die Mindesteinzahlung beträgt 5 $, und vorher bestätigen Sie Ihre E-Mail-Adresse. Die automatische Aufladung belastet eine hinterlegte Karte, wenn Ihr Guthaben unter einen von Ihnen gesetzten Schwellenwert fällt. Bei 0,00 $ stoppen Ihre Instanzen. Mit hinterlegter Karte belastet Vast diese, um den negativen Saldo auszugleichen. Ohne Karte „werden Instanzen und gespeicherte Daten gelöscht“. Speicher wird auch bei negativem Guthaben weiter berechnet. Erstattungen: keine für ausgegebenes Guthaben. Für nicht ausgegebenes Kartenguthaben fragen Sie den Support, und Krypto-Aufladungen können nicht erstattet werden.

Der praktische Rat ist für beide gleich: automatische Aufladung einschalten oder einen Puffer halten, und alles, was Sie nicht verlieren dürfen, auf einem Network Volume oder außerhalb der Plattform aufbewahren.

## Welche Plattform Sie wählen sollten

<figure>
<svg viewBox="0 0 720 520" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">Entscheidungsschema für die Wahl zwischen RunPod und Vast.ai, vom reinen API-Bedarf bis zum niedrigsten Preis</title>
<defs><marker id="d1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs>
<rect x="20" y="20" width="400" height="56" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="220" y="53" text-anchor="middle" fill="#1e1b4b">Nur ein Modell über eine API aufrufen?</text>
<rect x="480" y="20" width="220" height="56" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
<text x="590" y="53" text-anchor="middle" fill="#1e1b4b" font-size="13">API pro Token oder GPUFlow</text>
<rect x="20" y="120" width="400" height="56" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="220" y="153" text-anchor="middle" fill="#1e1b4b">Produktivbetrieb oder Compliance-Vorgaben?</text>
<rect x="480" y="120" width="220" height="56" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
<text x="590" y="144" text-anchor="middle" fill="#1e1b4b">RunPod Secure Cloud</text>
<text x="590" y="165" text-anchor="middle" fill="#64748b" font-size="13">oder Vast-Datacenter-Hosts</text>
<rect x="20" y="220" width="400" height="56" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="220" y="253" text-anchor="middle" fill="#1e1b4b">Daten müssen über Maschinen hinweg mitwandern?</text>
<rect x="480" y="220" width="220" height="56" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
<text x="590" y="253" text-anchor="middle" fill="#1e1b4b">RunPod Network Volume</text>
<rect x="20" y="320" width="400" height="56" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="220" y="353" text-anchor="middle" fill="#1e1b4b">Endpunkt, der auf null skaliert?</text>
<rect x="480" y="320" width="220" height="56" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
<text x="590" y="353" text-anchor="middle" fill="#1e1b4b">Serverless bei beiden</text>
<rect x="20" y="420" width="400" height="70" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
<text x="220" y="450" text-anchor="middle" fill="#1e1b4b">Sonst: Vast.ai, niedrigster Preis</text>
<text x="220" y="474" text-anchor="middle" fill="#64748b" font-size="13">Zuverlässigkeit prüfen, Spot nur mit Checkpoints</text>
<line x1="420" y1="48" x2="476" y2="48" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="448" y="40" text-anchor="middle" fill="#16a34a" font-size="13">Ja</text>
<line x1="420" y1="148" x2="476" y2="148" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="448" y="140" text-anchor="middle" fill="#16a34a" font-size="13">Ja</text>
<line x1="420" y1="248" x2="476" y2="248" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="448" y="240" text-anchor="middle" fill="#16a34a" font-size="13">Ja</text>
<line x1="420" y1="348" x2="476" y2="348" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="448" y="340" text-anchor="middle" fill="#16a34a" font-size="13">Ja</text>
<line x1="220" y1="76" x2="220" y2="116" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="234" y="101" fill="#f97316" font-size="13">Nein</text>
<line x1="220" y1="176" x2="220" y2="216" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="234" y="201" fill="#f97316" font-size="13">Nein</text>
<line x1="220" y1="276" x2="220" y2="316" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="234" y="301" fill="#f97316" font-size="13">Nein</text>
<line x1="220" y1="376" x2="220" y2="416" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="234" y="401" fill="#f97316" font-size="13">Nein</text>
</svg>
<figcaption>Gehen Sie von oben nach unten und halten Sie beim ersten „Ja“ an. Die meisten Trainings und Experimente, die Checkpoints speichern können, landen im untersten Kasten.</figcaption>
</figure>

**Nehmen Sie Vast.ai, wenn:**

- Sie den Preis pro GPU-Stunde optimieren, besonders bei langen Läufen, bei denen der monatliche Unterschied Hunderte Dollar erreicht.
- Ihr Job Checkpoints speichert und auf einer anderen Maschine neu starten kann. Dann sind unterbrechbare Instanzen die günstigste GPU-Zeit, die Sie finden.
- Sie bereit sind, vor dem Klick auf Rent fünf Minuten lang Zuverlässigkeitswert, Standort und maximale Mietdauer eines Hosts zu lesen.
- Sie Serverless ohne Aufschlag auf den Instanzpreis wollen.

**Nehmen Sie RunPod, wenn:**

- Sie eine feste Preisliste wollen und keine Hosts vergleichen möchten.
- Ihre Daten jede einzelne Maschine überdauern müssen. Network Volumes zu 0,07 $/GB/Monat sind die sauberste Lösung, die eine der beiden Plattformen bietet.
- Sie viele Daten hinein- oder herausbewegen. RunPod berechnet dafür nichts.
- Sie eine Rechenzentrumsstufe, Krypto mit KYC oder Rechnungskauf für große Bestellungen bei einem einzigen Anbieter brauchen.

**Nutzen Sie beide**, wenn Sie können. Viele halten ein RunPod Network Volume als Basis und schicken lange Trainingsläufe mit Checkpoints auf günstige Vast.ai-Maschinen. Ein Docker-Image zwischen beiden zu verschieben ist trivial. Die Daten zu verschieben ist der Teil, den Sie planen müssen.

Wenn Sie noch herausfinden, was eine Miete braucht (Image, Speicher, SSH-Schlüssel), fangen Sie mit [Was Sie zum Mieten einer GPU brauchen](/de/what-you-need-to-rent-a-gpu/) an, und vergleichen Sie breitere Preise im [GPU-Preisvergleich 2026](/de/gpu-rental-pricing-comparison-2026/).

## Quellen

Alle geprüft im September 2026.

- RunPod: [Preisseite](https://www.runpod.io/pricing), [Preise für Pods und Speicher](https://docs.runpod.io/pods/pricing), [Überblick über Pods](https://docs.runpod.io/pods/overview), [Einen Pod auswählen](https://docs.runpod.io/pods/choose-a-pod), [Pods verwalten](https://docs.runpod.io/pods/manage-pods), [API zum Anlegen von Pods (Feld interruptible)](https://docs.runpod.io/api-reference/pods/POST/pods), [Preise für Serverless](https://docs.runpod.io/serverless/pricing), [Abrechnung](https://docs.runpod.io/references/billing-information), [Spot vs. On-Demand](https://www.runpod.io/blog/spot-vs-on-demand-instances-runpod)
- Preisänderung der RunPod Secure Cloud vom 20. September 2026: [usagepricing.com](https://www.usagepricing.com/blueprint/activity/runpod-2026-09-20-secure-cloud-price-hike)
- Vast.ai: [Schnellstart](https://docs.vast.ai/guides/get-started/quickstart.md), [Preise](https://docs.vast.ai/guides/instances/pricing.md), [Miettypen](https://docs.vast.ai/guides/reference/faq/rental-types), [Instanzen finden und mieten](https://docs.vast.ai/guides/instances/choosing/find-and-rent), [Datacenter-Status](https://docs.vast.ai/documentation/host/datacenter-status), [Speichertypen](https://docs.vast.ai/documentation/instances/storage/types), [Volumes](https://docs.vast.ai/documentation/instances/storage/volumes), [Preise für Serverless](https://docs.vast.ai/serverless/pricing), [Abrechnung](https://docs.vast.ai/documentation/reference/billing)
- Marktplatzpreise: getdeploying.com für [RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090) und [RTX 3090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-3090)
- GPUFlow: [Erste Schritte für Mieter](https://docs.gpuflow.app/de/renters/getting-started/), [API-Schnellstart](https://docs.gpuflow.app/de/renters/api-quickstart/)
