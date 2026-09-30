---
title: "GPU vermieten: Was Ihre Gaming-GPU nach Gebühren und Strom verdient, von RTX 3060 bis RTX 5090"
description: "Ehrliche Rechnung für die Vermietung einer Consumer-GPU im Jahr 2026: aktuelle Mietpreise, Plattformgebühren, Strompreise in den USA, Kanada, Großbritannien, Deutschland und Frankreich und was pro Monat bei 4 und 12 vermieteten Stunden am Tag übrig bleibt."
excerpt: "Was eine vermietete Stunde einbringt, was die Plattform behält, was Ihre Stromrechnung frisst und was jeden Monat übrig bleibt. Mit Formel, damit Sie mit Ihren eigenen Zahlen rechnen können."
pubDate: 2026-09-29
locale: "de"
category: "guides"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/how-much-can-you-earn-renting-out-your-gpu-hero.png"
heroImageAlt: "Illustration einer Grafikkarte neben wachsenden Münzstapeln"
faq:
  - question: "Wie viel kann eine RTX 4090 pro Monat auf einem GPU-Vermietungsmarktplatz verdienen?"
    answer: "Bei einem typischen Preis von etwa 0,38 $ pro Stunde im September 2026, der Gebühr von 12 % bei GPUFlow und dem US-Durchschnittsstrompreis bleiben bei einer RTX 4090 etwa 0,25 $ pro vermieteter Stunde. Das sind rund 30 $ im Monat bei 4 vermieteten Stunden am Tag und etwa 91 $ bei 12 Stunden am Tag, noch ohne den Strom für den restlichen PC."
  - question: "Lohnt es sich, eine RTX 3060 zu vermieten?"
    answer: "Nur knapp. Bei 0,05 $ bis 0,08 $ pro Stunde bleiben einer RTX 3060 nach Gebühren und US-Strompreis etwa 0,03 $ pro vermieteter Stunde. Bei 4 vermieteten Stunden am Tag sind das etwa 3 $ im Monat."
  - question: "Was kostet der Strom, wenn eine GPU zur Vermietung läuft?"
    answer: "Multiplizieren Sie die Leistungsaufnahme in Kilowatt mit Ihrem Preis pro kWh. Eine RTX 4090 mit ihrer Board Power von 450 W kostet beim US-Durchschnitt 2026 von 18,2 Cent pro kWh etwa 0,08 $ pro Stunde, in Deutschland etwa 0,17 € pro Stunde."
  - question: "In welchen Ländern lassen sich Einnahmen von GPUFlow auszahlen?"
    answer: "Auszahlungen laufen über Stripe und funktionieren derzeit in den USA, in Kanada, im Vereinigten Königreich, in der Schweiz und im Europäischen Wirtschaftsraum."
---

Wenn Sie eine Gaming-GPU haben, die den Großteil des Tages ungenutzt ist, können Sie sie über einen Marktplatz vermieten und werden pro Stunde bezahlt. Ob sich das lohnt, hängt von vier Zahlen ab:

1. **Was Mieter** pro Stunde für Ihre Karte bezahlen.
2. **Was die Plattform behält.**
3. **Was Sie der Strom kostet**, während die Karte läuft.
4. **Wie viele Stunden am Tag sie tatsächlich vermietet ist.**

Die ersten drei lassen sich leicht nachschlagen. Die vierte kann Ihnen niemand versprechen, deshalb zeigen wir eine Spanne. Alle Preise unten wurden im September 2026 geprüft; die Quellen stehen am Ende.

## 1. Was Mieter bezahlen

Das sind typische On-Demand-Preise pro Stunde auf GPU-Vermietungsseiten (Vast.ai, RunPod, Salad, SimplePod, TensorDock, Hyperstack, Lambda) im September 2026:

| GPU | Typischer Preis pro Stunde | Mitte der Spanne |
| --- | --- | --- |
| RTX 3060 12 GB | 0,05 $ – 0,08 $ | 0,065 $ |
| RTX 4070 | 0,07 $ – 0,15 $ | 0,11 $ |
| RTX 3090 | 0,11 $ – 0,31 $ | 0,21 $ |
| RTX 4080 | 0,23 $ – 0,27 $ | 0,25 $ |
| RTX 4090 | 0,30 $ – 0,46 $ | 0,38 $ |
| RTX 5090 | 0,41 $ – 0,69 $ | 0,55 $ |

Der Grafikspeicher zählt genauso viel wie die Geschwindigkeit. Eine Karte mit 24 GB wie die 3090 oder 4090 kann [größere KI-Modelle ausführen als eine Karte mit 12 GB oder 16 GB](/de/which-ai-models-fit-your-gpu-vram/), und dafür zahlen Mieter.

## 2. Was die Plattform behält

| Plattform | Anteil | Auszahlungen |
| --- | --- | --- |
| GPUFlow | Behält 12 %, Sie bekommen 88 % | Über Stripe auf Ihr Bankkonto. Mindestens 25 $, 2,50 $ pro Auszahlung. |
| Vast.ai | Laut Vast liegen die Angebotspreise typischerweise etwa 25 % über dem, was Hosts verdienen | Wise, PayPal oder Stripe. Mindestens 20 $, wöchentliche Abrechnung. |
| Salad | Nicht veröffentlicht | PayPal, Geschenkkarten, Spiele und mehr |

Auch die Voraussetzungen unterscheiden sich. Hosts bei Vast.ai nutzen Ubuntu, und Mieter bekommen Container auf dem Host mit Zugriff per SSH oder Jupyter. Salad läuft unter Windows 10 oder 11. Bei GPUFlow führen Sie einen einzigen Befehl auf einem Linux-Rechner mit systemd aus; Mieter greifen nur über eine API auf Ihre KI-Modelle zu, [nie auf eine Shell auf Ihrem Rechner](/de/is-it-safe-to-rent-out-your-gpu/). [Worauf Mieter zugreifen können und worauf nicht](https://docs.gpuflow.app/de/providers/security/).

## 3. Was der Strom kostet

Die Formel: **Leistungsaufnahme in kW × Ihr Preis pro kWh = Kosten pro Stunde.**

Als Leistungsaufnahme verwenden wir die offizielle Board Power jeder Karte. Das ist ungefähr das Maximum, das die Karte selbst zieht; bei der Textgenerierung durch KI ist es oft weniger. Der restliche PC kommt noch hinzu. Am ehrlichsten ist es, selbst zu messen: GPUFlow zeigt die aktuelle Leistungsaufnahme Ihrer GPU unter **Meine Rechner** an, und ein Zwischenstecker-Messgerät zeigt den Verbrauch des ganzen PCs.

| GPU | Board Power |
| --- | --- |
| RTX 3060 | 170 W |
| RTX 4070 | 200 W |
| RTX 3090 | 350 W |
| RTX 4080 | 320 W |
| RTX 4090 | 450 W |
| RTX 5090 | 575 W |

Was eine Stunde RTX 4090 bei 450 W an Strom kostet:

| Wo | Haushaltsstrompreis | Eine Stunde bei 450 W |
| --- | --- | --- |
| USA (Prognose Durchschnitt 2026) | 18,2 ¢/kWh | etwa 0,08 $ |
| Kanada | 0,170 C$/kWh | etwa 0,08 C$ |
| Vereinigtes Königreich (Preisobergrenze Okt.–Dez. 2026) | 26,32 p/kWh | etwa 11,8 p |
| Deutschland | 0,3869 €/kWh | etwa 0,17 € |
| Frankreich | 0,2561 €/kWh | etwa 0,12 € |

In den USA frisst der Strom etwa ein Viertel dessen, was eine 4090 pro vermieteter Stunde einbringt. In Deutschland kostet dieselbe Stunde etwa 0,17 €, prüfen Sie also Ihren eigenen Tarif, bevor Sie einen Preis festlegen.

## 4. Alles zusammen

Pro vermieteter Stunde zum mittleren Preis, mit dem Anteil von 88 % bei GPUFlow und dem US-Durchschnittsstrompreis bei voller Board Power:

| GPU | Ihr Anteil (88 %) | Strom | Übrig pro vermieteter Stunde | 4 h/Tag (120 h/Monat) | 12 h/Tag (360 h/Monat) |
| --- | --- | --- | --- | --- | --- |
| RTX 3060 12 GB | 0,057 $ | 0,031 $ | **0,026 $** | 3,15 $ | 9,45 $ |
| RTX 4070 | 0,097 $ | 0,036 $ | **0,060 $** | 7,25 $ | 21,74 $ |
| RTX 3090 | 0,185 $ | 0,064 $ | **0,121 $** | 14,53 $ | 43,60 $ |
| RTX 4080 | 0,220 $ | 0,058 $ | **0,162 $** | 19,41 $ | 58,23 $ |
| RTX 4090 | 0,334 $ | 0,082 $ | **0,253 $** | 30,30 $ | 90,90 $ |
| RTX 5090 | 0,484 $ | 0,105 $ | **0,379 $** | 45,52 $ | 136,57 $ |

Drei Dinge fehlen in dieser Tabelle:

- **Wartezeit.** Ihr PC muss eingeschaltet und online sein, damit Mieter ihn finden. Auch während er wartet, verbraucht er Strom. Messen Sie Ihren PC im Leerlauf und ziehen Sie das ebenfalls ab.
- **Verschleiß.** Lüfter und Wärmeleitpaste altern unter langer Last schneller. Sorgen Sie für eine gute Belüftung des Gehäuses und behalten Sie die Temperatur im Blick.
- **Steuern.** Einnahmen aus der Vermietung sind Einkünfte. Wie sie besteuert werden, hängt davon ab, wo Sie leben.

## Was die Zahlen sagen

- **RTX 3090, 4080, 4090 und 5090** können einen spürbaren Betrag verdienen, wenn sie mehrere Stunden am Tag vermietet sind. Die 3090 bietet das beste Preis-Leistungs-Verhältnis: 24 GB Speicher bei niedrigen Stromkosten.
- **RTX 3060 und 4070** verdienen pro Stunde sehr wenig. Bei 3 $ im Monat bräuchte eine 3060 etwa acht Monate, um den Mindestbetrag von 25 $ für eine Auszahlung bei GPUFlow zu erreichen. Das lohnt sich nur, wenn Ihr Strom günstig ist oder der PC ohnehin läuft.
- **Die Auslastung ist entscheidend.** Dieselbe 4090 bringt 30 $ oder 91 $ im Monat, je nachdem, ob sie 4 oder 12 Stunden am Tag vermietet ist. Ein fairer Preis und ein zuverlässig erreichbarer Rechner bringen mehr Mieten als ein paar Cent Rabatt.

## So kommen Sie auf mehr vermietete Stunden

1. **Setzen Sie den Preis anfangs in die untere Hälfte der Spanne.** Mieter vergleichen. Erhöhen können Sie ihn, sobald die ersten Mieten eingehen.
2. **Bleiben Sie online.** Eine GPU, die offline ist, kann niemand mieten. Bei GPUFlow können Mieter bei einer Offline-GPU auf **Benachrichtigen, wenn online** klicken; Sie bekommen dann eine E-Mail, wenn jemand wartet.
3. **Bieten Sie gefragte Modelle an.** Nennen Sie die Modelle, die Sie ausführen, in Ihrem Angebot, zum Beispiel `qwen2.5:7b` oder `llama3.1:8b`. Mieter suchen danach.
4. **Schauen Sie nach einer Woche wieder hin.** Meistens vermietet? Erhöhen Sie den Preis ein wenig. Keine Mieten? Senken Sie ihn ein wenig.

Bei GPUFlow zeigt das Angebotsformular, wo Ihr Preis im Vergleich zu anderen Vermietungsseiten und zu anderen GPUFlow-Angeboten derselben Karte liegt und was Sie nach Abzug der Gebühr pro Stunde verdienen:

![Die Preisleiste im GPUFlow-Angebotsformular mit einem typischen Preis für eine RTX 4090 und den Einnahmen nach Abzug der Gebühr](../_images/screens/de/provider-price-bar.png)

## Wo Auszahlungen von GPUFlow funktionieren

GPUFlow zahlt über Stripe auf Bankkonten in den **USA, in Kanada, im Vereinigten Königreich, in der Schweiz und im Europäischen Wirtschaftsraum** aus. Wenn Sie woanders leben, können Sie trotzdem eine GPU anbieten und Ihre Einnahmen für die Miete anderer GPUs ausgeben, aber noch nicht auf ein Bankkonto auszahlen. Einnahmen werden 7 Tage zurückgehalten (14 Tage bei Konten, die jünger als 30 Tage sind), bevor Sie sie auszahlen können. [So werden Sie bei GPUFlow bezahlt](https://docs.gpuflow.app/de/providers/getting-paid/).

## Rechnen Sie mit Ihren eigenen Zahlen

**(Preis pro Stunde × 0,88) − (Watt ÷ 1.000 × Preis pro kWh) = was pro vermieteter Stunde übrig bleibt**

Multiplizieren Sie das Ergebnis dann mit den Stunden, die Sie realistisch erwarten. Kommen nur ein paar Dollar im Monat heraus, ist es den Verschleiß vermutlich nicht wert. Sind es einige Dutzend Dollar, lohnt es sich, es einen Monat lang auszuprobieren und sich dann die echten Zahlen anzusehen.

Für den Einstieg lesen Sie [Ihre GPU online bringen](https://docs.gpuflow.app/de/providers/getting-started/) und [den Preis für Ihre GPU festlegen](https://docs.gpuflow.app/de/providers/pricing/).

## Verwandte Artikel

- [GPUFlow vs. Vast.ai vs. RunPod vs. SaladCloud: Welche Plattform passt zu Ihrem Vorhaben](/de/gpuflow-vs-vast-ai-vs-runpod/)
- [GPU mieten: Was der Stundenpreis verschweigt und was Sie wirklich zahlen](/de/hidden-fees-in-gpu-rental/)

## Quellen

Alle geprüft im September 2026.

- Preisspannen für GPU-Mieten: [GPUFlow-Doku, Den Preis für Ihre GPU festlegen](https://docs.gpuflow.app/de/providers/pricing/)
- Gebühr, Rückhalt und Auszahlungen bei GPUFlow: [GPUFlow-Doku, So werden Sie bezahlt](https://docs.gpuflow.app/de/providers/getting-paid/)
- Einnahmen von Hosts bei Vast.ai: [Artikel auf vast.ai](https://vast.ai/article/how-much-money-can-you-earn-renting-out-your-gpu-on-vast-ai) (18. Mai 2026); Auszahlungen: [docs.vast.ai/host/payment.md](https://docs.vast.ai/host/payment.md); Voraussetzungen für Hosts: [docs.vast.ai/host/hosting-overview.md](https://docs.vast.ai/host/hosting-overview.md)
- Salad: [salad.com/download](https://salad.com/download/), [Einlösen über PayPal](https://support.salad.com/rewards/redeeming-your-rewards/how-to-redeem-paypal/)
- Board Power: NVIDIA-Produktseiten zur [RTX 3060](https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3060-3060ti/), [RTX 4080](https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4080-family/), [RTX 4090](https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4090/), [RTX 5090](https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/); RTX 3090: [TechPowerUp](https://www.techpowerup.com/gpu-specs/geforce-rtx-3090.c3622); RTX 4070: [TechSpot](https://www.techspot.com/review/2663-nvidia-geforce-rtx-4070/)
- Strompreis USA: [EIA Short-Term Energy Outlook](https://www.eia.gov/outlooks/steo/report/elec_coal_renew.php) (September 2026)
- Strompreis Vereinigtes Königreich: [Preisobergrenze von Ofgem](https://www.ofgem.gov.uk/your-energy-supply/your-energy-bill/energy-price-cap-unit-rates-and-standing-charges)
- Strompreise Deutschland und Frankreich, zweites Halbjahr 2025: [Eurostat-Strompreisstatistik](https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Electricity_price_statistics), [Eurostat-Daten nrg_pc_204 für Frankreich](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_pc_204?geo=FR&nrg_cons=KWH2500-4999&unit=KWH&tax=I_TAX&currency=EUR&lastTimePeriod=1)
- Strompreis Kanada, Juni 2025: [GlobalPetrolPrices](https://www.globalpetrolprices.com/Canada/electricity_prices/)
