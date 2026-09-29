---
title: "GPU mieten: Was der Stundenpreis verschweigt und was Sie wirklich zahlen"
description: "Speicher im gestoppten Zustand, Bandbreite, Mindesteinzahlungen, Abrechnungstakt, Leerlauf und Kartengebühren: Was Sie bei Vast.ai, RunPod, Lambda, AWS und GPUFlow über den GPU-Stundenpreis hinaus bezahlen."
excerpt: "Der Stundenpreis ist nur ein Teil der Rechnung. Hier sind alle Zusatzkosten, die wir bei den wichtigsten GPU-Vermietungsplattformen gefunden haben, jeweils mit Zahlen und Quelle."
pubDate: 2026-02-15
updatedDate: 2026-09-29
locale: "de"
category: "pricing"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/gpu-server-rack.jpg"
heroImageAlt: "Nahaufnahme der Lüfter von GPU-Servern in einem Rack"
faq:
  - question: "Berechnen GPU-Vermietungsplattformen Speicher, während die Maschine gestoppt ist?"
    answer: "Oft ja. Bei RunPod kostet die Volume Disk eines gestoppten Pods 0,20 $ pro GB und Monat, doppelt so viel wie im laufenden Betrieb. Bei Vast.ai wird Speicher für jede Sekunde abgerechnet, in der die Instanz existiert, auch im gestoppten Zustand. GPUFlow berechnet keinen Speicher, weil eine Miete ein API-Schlüssel ist und keine Maschine."
  - question: "Welche GPU-Vermietungsplattformen berechnen Bandbreite?"
    answer: "Bei Vast.ai legen die Hosts selbst fest, was gesendete und empfangene Daten kosten, und jedes Byte wird abgerechnet. RunPod und Lambda geben an, weder eingehenden noch ausgehenden Datenverkehr zu berechnen. AWS berechnet Daten, die ins Internet gehen, sobald die ersten 100 GB im Monat aufgebraucht sind."
  - question: "Gibt es einen Mindestbetrag, den ich zum Start zahlen muss?"
    answer: "Die Mindesteinzahlung bei Vast.ai beträgt 5 $. Lambda reserviert 10 $ auf Ihrer Karte. RunPod verlangt von Nutzern mit Prepaid-Karte mindestens 100 $ pro Transaktion. Bei GPUFlow beginnen Aufladungen bei 10 $, ohne Gebühr."
  - question: "Berechnet meine Bank eine Gebühr, wenn ich eine GPU-Miete in US-Dollar bezahle?"
    answer: "Das kann passieren. Auslandseinsatzgebühren für Karten liegen meist bei 1 % bis 3 %, und manche Banken erheben sie bei Käufen von ausländischen Händlern auch dann, wenn der Preis in Dollar angezeigt wird. In Brasilien beträgt die IOF-Steuer auf internationale Kartenkäufe 3,5 %."
---

Der Preis in einem GPU-Angebot gilt pro Stunde GPU-Zeit. Was Sie am Monatsende bezahlen, enthält oft noch mehr: Speicherplatz, Datenübertragung, die Zeit für die Einrichtung und Gebühren Ihrer eigenen Bank. Nichts davon wird absichtlich versteckt, aber es geht leicht unter, wenn Sie Plattformen nur nach dem beworbenen Stundenpreis vergleichen.

Dieser Artikel listet alle Zusatzkosten auf, die wir bei den wichtigsten Plattformen bestätigen konnten, jeweils mit einem Link zur Quelle. Geprüft haben wir alles im September 2026. Preise ändern sich, also prüfen Sie die Links, bevor Sie sich auf eine Zahl verlassen.

## Die Kurzfassung

| Kosten | Vast.ai | RunPod | Lambda | AWS EC2 | GPUFlow |
| --- | --- | --- | --- | --- | --- |
| Abrechnungseinheit | Pro Sekunde | Pro Sekunde | Pro Minute | Pro Sekunde, mindestens 60 s | Pro Sekunde, mindestens 1 Minute |
| Speicher im laufenden Betrieb | Vom Host festgelegt | 0,10 $/GB/Monat | Dateisysteme, pro GB/Monat | 0,08 $/GB/Monat (gp3) | Keiner |
| Speicher im gestoppten Zustand | Ja, wird berechnet | 0,20 $/GB/Monat (Volume Disk) | Dateisysteme, pro GB/Monat | 0,08 $/GB/Monat (gp3) | Keiner |
| Datenübertragung | Vom Host festgelegt, jedes Byte | Kostenlos | Kostenlos | Ins Internet: erste 100 GB/Monat frei, danach kostenpflichtig | Keine |
| Minimum zum Start | 5 $ Einzahlung | Guthaben für 1 Stunde; 100 $ bei Prepaid-Karten | 10 $ Reservierung auf der Karte | Zahlungsmethode und ein GPU-Kontingent | 10 $ Aufladung |

GPUFlow kann auf Speicher- und Übertragungskosten verzichten, weil hier etwas anderes vermietet wird: Sie bekommen einen API-Schlüssel für KI-Modelle, die auf der GPU eines anderen laufen, keine Maschine, auf der Sie sich anmelden. Das heißt aber auch, dass Sie dort weder eigenen Code noch Trainingsjobs ausführen können. Mehr dazu weiter unten.

## 1. Speicher, vor allem im gestoppten Zustand

Auf Plattformen, die Ihnen eine Maschine oder einen Container vermieten, liegen Ihre Dateien auf einer Disk, und diese Disk kostet Geld, solange sie existiert.

- **RunPod** berechnet 0,10 $ pro GB und Monat für Container Disk und Volume Disk, solange der Pod läuft. Wenn Sie den Pod stoppen, verschwindet die Container Disk und kostet nichts mehr, die Volume Disk kostet dann aber **0,20 $ pro GB und Monat**. Network Volumes kosten unter 1 TB 0,07 $ pro GB und Monat, ob sie laufen oder nicht.
- **Vast.ai** lässt jeden Host den Speicherpreis selbst festlegen. Abgerechnet wird jede Sekunde, in der die Instanz existiert, auch im gestoppten Zustand.
- **AWS** berechnet EBS-Volumes unabhängig davon, ob die Instanz läuft. Ein gp3-Volume in us-east-1 kostet 0,08 $ pro GB und Monat.

Ein Rechenbeispiel: Ein 200-GB-Volume an einem gestoppten RunPod-Pod kostet 200 × 0,20 $ = **40 $ pro Monat**, auch wenn Sie den Pod nie wieder starten. Das ist mehr als 100 Stunden RTX 3090 zu den marktüblichen Preisen, die wir weiter unten aufführen.

**Was Sie tun können:** Löschen Sie Volumes, die Sie nicht nutzen. Wenn Sie Ihre Dateien nur zwischen zwei Sitzungen brauchen, ist ein kleines Network Volume günstiger als ein großer gestoppter Pod.

## 2. Datenübertragung

Beim Herunterladen eines Modells und Hochladen eines Datensatzes kommen schnell Dutzende Gigabyte zusammen.

- **Vast.ai:** Jeder Host legt einen Preis für Up- und Download fest, und laut Doku wird jedes Byte abgerechnet, egal in welchem Zustand die Instanz ist. Schauen Sie sich vor dem Mieten den Bandbreitenpreis im Angebot an, vor allem wenn Sie große Modelle herunterladen.
- **RunPod** und **Lambda** geben an, weder eingehende noch ausgehende Daten zu berechnen.
- **AWS:** Eingehende Daten sind kostenlos. Ausgehende Daten ins Internet sind für die ersten 100 GB im Monat frei, danach wird pro GB abgerechnet. Außerdem berechnet AWS 0,005 $ pro Stunde für jede öffentliche IPv4-Adresse, ob sie genutzt wird oder nicht.

## 3. Mindesteinzahlungen und Reservierungen auf der Karte

Die meisten GPU-Plattformen arbeiten mit Vorauszahlung. Sie kaufen zuerst Guthaben und verbrauchen es dann.

- **Vast.ai:** Mindesteinzahlung 5 $.
- **RunPod:** Sie brauchen mindestens Guthaben für eine Stunde auf der gewählten Maschine, und mit Prepaid-Karten müssen Sie mindestens 100 $ pro Transaktion einzahlen.
- **Lambda:** 10 $ werden auf Ihrer Karte reserviert und nach einigen Tagen wieder freigegeben.
- **SaladCloud:** Guthaben verfällt 12 Monate nach dem Kauf.
- **GPUFlow:** Aufladungen von 10 $ bis 500 $, ohne Gebühr, und Credits verfallen nicht.

Guthaben, das verfällt oder ungenutzt herumliegt, ist ebenfalls ein Kostenfaktor. Kaufen Sie nur so viel, wie Sie voraussichtlich brauchen.

## 4. Einrichtungszeit ist bezahlte Zeit

Wenn Sie eine Maschine mieten, läuft die Uhr ab dem Start der Maschine, nicht ab dem Start Ihres Jobs. Treiber und Bibliotheken installieren, ein Container-Image ziehen und ein 15-GB-Modell herunterladen: Das alles geschieht in bezahlter Zeit. Bei 0,35 $ pro Stunde kostet eine halbe Stunde Einrichtung etwa 0,18 $. Für eine einzelne Sitzung ist das wenig, aber es summiert sich, wenn Sie jeden Tag frische Maschinen starten.

Zwei Dinge helfen: Nutzen Sie ein Template oder Container-Image, das schon alles Nötige enthält, und legen Sie Modelle auf ein Volume, damit Sie sie nur einmal herunterladen (und wägen Sie das gegen die Speicherkosten aus Punkt 1 ab).

Bei GPUFlow ist das Modell bereits auf dem Rechner des Anbieters installiert, bevor Sie mieten. Es gibt nichts einzurichten: Sie zahlen ab dem Start der Miete, und der Schlüssel funktioniert sofort.

## 5. Abrechnungstakt und Mindestdauer

Sekundengenaue Abrechnung ist inzwischen üblich, die Mindestdauer unterscheidet sich aber:

| Plattform | Wie Zeit abgerechnet wird |
| --- | --- |
| Vast.ai | Pro Sekunde, ohne Mindestdauer |
| RunPod Pods | Pro Sekunde |
| RunPod Serverless | Pro Sekunde, aufgerundet; zusätzlich zahlen Sie die Startzeit der Worker und ein Idle-Timeout (standardmäßig 5 Sekunden) |
| Lambda | Pro Minute |
| AWS EC2 (Linux) | Pro Sekunde, mindestens 60 Sekunden |
| Google Cloud | Pro Sekunde, mindestens 1 Minute |
| GPUFlow | Pro Sekunde, mindestens 1 Minute |

Am stärksten wirkt sich der Abrechnungstakt bei Serverless aus. Wenn Sie kurze Anfragen mit Pausen dazwischen senden, können Startzeit und Idle-Timeout mehr kosten als die Anfragen selbst.

## 6. Leerlauf auf einer laufenden Maschine

Eine stundenweise gemietete Maschine kostet gleich viel, ob die GPU arbeitet oder auf Sie wartet. Einen Pod über Nacht laufen zu lassen, „damit er morgens bereit ist“, ist ein einfacher Weg, zu viel auszugeben. Lambda sagt es ganz offen: Instanzen werden abgerechnet, solange sie laufen, ob sie genutzt werden oder nicht.

**Was Sie tun können:** Stellen Sie sich eine Erinnerung oder nutzen Sie eine Plattformfunktion, die ungenutzte Maschinen stoppt. Bei GPUFlow buchen Sie eine bestimmte Zahl von Stunden; sind Sie früher fertig, klicken Sie auf **Jetzt beenden**, und die ungenutzte Zeit wird Ihren Credits gutgeschrieben. [So funktioniert die Abrechnung bei GPUFlow](https://docs.gpuflow.app/de/renters/billing/).

## 7. Unterbrechbare Maschinen

Unterbrechbare Maschinen (Spot) sind günstiger, oft um die Hälfte oder mehr, können aber gestoppt werden, wenn jemand mehr zahlt. Vast.ai nennt sie „interruptible“ und gibt an, dass sie meist 50 % oder mehr günstiger sind. Bei TensorDock wird Speicher weiter berechnet, während Sie überboten sind. Wenn Ihr Job nicht an einem Checkpoint wieder ansetzen kann, bezahlen Sie nach einer Unterbrechung dieselbe Arbeit zweimal.

## 8. Die Gebühren Ihrer Bank

Fast jede GPU-Plattform rechnet in US-Dollar ab. Läuft Ihre Karte in einer anderen Währung, kann Ihre Bank eine Gebühr aufschlagen:

- Auslandseinsatzgebühren liegen meist bei **1 % bis 3 %**. Manche Banken erheben sie bei Käufen von ausländischen Händlern auch dann, wenn der Preis in Dollar angezeigt wird.
- Viele kanadische Kreditkarten berechnen bei Käufen in einer anderen Währung etwa **2,5 %**.
- In Brasilien beträgt die **IOF-Steuer auf internationale Kartenkäufe 3,5 %**.

Bei einer Aufladung von 100 $ sind das 1 $ bis 3,50 $, die Sie auf der Rechnung der Plattform nicht sehen. Eine Karte ohne Auslandseinsatzgebühr beseitigt den Großteil davon.

## 9. Für Anbieter: Auszahlungsgebühren und Mindestbeträge

Wenn Sie Ihre eigene GPU vermieten, behält die Plattform einen Anteil, und für Auszahlungen gelten eigene Regeln:

| Plattform | Was der Anbieter behält | Mindestbetrag für Auszahlungen | Auszahlungsgebühr |
| --- | --- | --- | --- |
| GPUFlow | 88 % des Mietpreises | 25 $ | 2,50 $ pro Auszahlung |
| Vast.ai | Laut Vast liegen die Angebotspreise typischerweise etwa 25 % über dem, was Hosts verdienen | 20 $ | Von Vast nicht angegeben; Ihr Auszahlungsdienst kann Gebühren erheben |
| TensorDock | Die Hosting-Vereinbarung nennt eine Gebühr von 20 % oder 25 % (im Text steht beides) | 250 $ vor einer Auszahlung | Nicht angegeben |

GPUFlow hält Einnahmen außerdem 7 Tage zurück (14 Tage bei Konten, die jünger als 30 Tage sind), bevor sie ausgezahlt werden können, um Rückbuchungen von Kartenzahlungen abzudecken. [So funktionieren Auszahlungen bei GPUFlow](https://docs.gpuflow.app/de/providers/getting-paid/).

## Typische GPU-Preise, September 2026

Zur Einordnung: Das sind die On-Demand-Preisspannen, die wir im September 2026 bei Vast.ai, RunPod, Salad, SimplePod, TensorDock, Hyperstack und Lambda gefunden haben:

| GPU | Typischer Preis pro Stunde |
| --- | --- |
| RTX 3060 12 GB | 0,05 $ – 0,08 $ |
| RTX 3090 | 0,11 $ – 0,31 $ |
| RTX 4090 | 0,30 $ – 0,46 $ |
| RTX 5090 | 0,41 $ – 0,69 $ |

Zum Vergleich: Eine NVIDIA L4 bei AWS (g6.xlarge in us-east-1) kostet etwa 0,80 $ pro Stunde, eine A10G (g5.xlarge) etwa 1,01 $.

## Checkliste vor dem Mieten

1. Rechnen Sie GPU-Zeit **plus** Speicher für die gesamte Dauer, in der Sie die Dateien behalten.
2. Prüfen Sie den Bandbreitenpreis, falls die Plattform einen hat, und wie viel Sie herunterladen werden.
3. Zählen Sie die Einrichtungszeit als bezahlte Zeit.
4. Klären Sie vorher, wie Sie die Kosten stoppen: Miete beenden, Maschine stoppen, Volume löschen.
5. Prüfen Sie die Auslandseinsatzgebühr Ihrer Karte.

Wenn Sie ein KI-Modell brauchen, das Sie aus Ihrem Code aufrufen, und keine Maschine für eigene Software, fallen bei einer API-basierten Miete die Punkte 1, 2 und 4 komplett weg. Brauchen Sie eine vollständige Maschine zum Trainieren, sind die oben genannten Plattformen das richtige Werkzeug, und mit dieser Checkliste bleibt die Rechnung nah am Stundenpreis.

## Verwandte Artikel

- [GPU pro Stunde oder API pro Token? Was ein 7B–8B-Modell wirklich kostet](/de/hourly-gpu-vs-per-token-api/)
- [GPUFlow vs. Vast.ai vs. RunPod vs. SaladCloud: Welche Plattform passt zu Ihrem Vorhaben](/de/gpuflow-vs-vast-ai-vs-runpod/)
- [GPU mieten 2026: Was Sie dafür brauchen](/de/what-you-need-to-rent-a-gpu/)

## Quellen

Alle geprüft im September 2026.

- RunPod, Pod-Preise und Speicher: [docs.runpod.io/pods/pricing](https://docs.runpod.io/pods/pricing)
- RunPod, Serverless-Abrechnung: [docs.runpod.io/serverless/pricing](https://docs.runpod.io/serverless/pricing)
- RunPod, Abrechnung und Einzahlungen: [docs.runpod.io/references/billing-information](https://docs.runpod.io/references/billing-information)
- Vast.ai, Preise und Abrechnung: [docs.vast.ai/guides/instances/pricing.md](https://docs.vast.ai/guides/instances/pricing.md), [docs.vast.ai/documentation/reference/billing](https://docs.vast.ai/documentation/reference/billing)
- Vast.ai, Einzahlung: [Quickstart auf docs.vast.ai](https://docs.vast.ai/guides/get-started/quickstart.md)
- Vast.ai, Auszahlungen an Hosts: [docs.vast.ai/host/payment.md](https://docs.vast.ai/host/payment.md), Artikel zu den Einnahmen von Hosts: [vast.ai](https://vast.ai/article/how-much-money-can-you-earn-renting-out-your-gpu-on-vast-ai)
- Lambda, Abrechnung: [docs.lambda.ai/public-cloud/billing](https://docs.lambda.ai/public-cloud/billing/), [Abrechnung verwalten](https://docs.lambda.ai/public-cloud/manage-billing/), [Preise („No egress fees“)](https://lambda.ai/pricing)
- SaladCloud, Abrechnung: [Abrechnung auf docs.salad.com](https://docs.salad.com/general/explanation/billing.md)
- TensorDock, Spot-Instanzen: [docs.tensordock.com](https://docs.tensordock.com/virtual-machines/spot-instances), Anbietervereinbarung: [docs.tensordock.com](https://docs.tensordock.com/legal-information/supplier-hosting-agreement.md)
- AWS EC2, Abrechnung: [aws.amazon.com/ec2/pricing/on-demand](https://aws.amazon.com/ec2/pricing/on-demand/); EBS: [aws.amazon.com/ebs/pricing](https://aws.amazon.com/ebs/pricing/); öffentliche IPv4-Adressen: [aws.amazon.com/vpc/pricing](https://aws.amazon.com/vpc/pricing/)
- AWS, Instanzpreise: [instances.vantage.sh g6.xlarge](https://instances.vantage.sh/aws/ec2/g6.xlarge?region=us-east-1), [g5.xlarge](https://instances.vantage.sh/aws/ec2/g5.xlarge?region=us-east-1)
- Google Cloud, VM-Abrechnung: [cloud.google.com/compute/vm-instance-pricing](https://cloud.google.com/compute/vm-instance-pricing)
- Auslandseinsatzgebühren für Karten: [Experian](https://www.experian.com/blogs/ask-experian/what-is-a-foreign-transaction-fee/), [NerdWallet Kanada](https://www.nerdwallet.com/ca/p/best/credit-cards/best-no-foreign-transaction-fee-credit-cards)
- Brasilien, IOF 3,5 %: [Wise Brasilien](https://wise.com/br/blog/iof-cartao-internacional)
- GPU-Preisspannen: [GPUFlow-Doku, Den Preis für Ihre GPU festlegen](https://docs.gpuflow.app/de/providers/pricing/)
