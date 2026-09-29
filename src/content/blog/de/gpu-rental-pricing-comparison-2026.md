---
title: "GPU mieten: Preisvergleich 2026"
description: "Umfassender Vergleich der GPU-Mietpreise bei AWS, GCP, Azure, Lambda Labs und anderen großen Cloud-Anbietern für ML-Workloads."
excerpt: "Vergleichen Sie die Kosten für GPU-Miete bei den großen Cloud-Anbietern und finden Sie das beste Preis-Leistungs-Verhältnis für Ihre ML-Workloads."
pubDate: 2026-02-07
updatedDate: 2026-09-29
locale: "de"
category: "pricing"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/gpu-rental-pricing-comparison-2026.jpg"
heroImageAlt: "Diagramm zum Vergleich der GPU-Mietpreise bei AWS, Azure, GCP, RunPod und Vast.ai"
faq:
  - question: "Wie miete ich eine GPU für KI-Training am günstigsten?"
    answer: "Peer-to-Peer-Marktplätze wie Vast.ai bieten die niedrigsten GPU-Mietpreise, in der Regel 60–80 % günstiger als die großen Cloud-Anbieter. Im Februar 2026 kostete eine RTX 4090 auf Vast.ai 0,29–0,78 $ pro Stunde, während vergleichbare Rechenleistung bei AWS oder Azure 3–5 $ pro Stunde kostete."
  - question: "Was kostet die Miete einer NVIDIA A100?"
    answer: "Die Mietpreise für die A100 unterscheiden sich je nach Anbieter deutlich. AWS verlangt rund 32,77 $ pro Stunde für eine Instanz mit 8x A100. RunPod bietet einzelne A100-GPUs für 1,39–1,49 $ pro Stunde an. Auf dem Marktplatz von Vast.ai liegen die Preise je nach Zuverlässigkeit und Standort des Anbieters bei 0,84–1,49 $ pro Stunde."
  - question: "Ist es günstiger, eine GPU zu mieten als zu kaufen?"
    answer: "Für die meisten Nutzer ist Mieten wirtschaftlicher. Eine RTX 4090 kostet in der Anschaffung 1.600–2.000 $. Bei einem Mietpreis von 0,60 $ pro Stunde liegt die Gewinnschwelle bei etwa 2.700 Nutzungsstunden. Solange Sie die GPU nicht jeden Tag mehr als 8 Stunden brauchen, fahren Sie mit Mieten besser."
  - question: "Was unterscheidet Cloud-GPU-Anbieter von GPU-Marktplätzen?"
    answer: "Cloud-Anbieter wie AWS, Azure und GCP betreiben eigene Rechenzentren mit garantierten Verfügbarkeits-SLAs und Compliance-Zertifizierungen. GPU-Marktplätze wie Vast.ai bringen private GPU-Besitzer und Mieter nach dem Peer-to-Peer-Prinzip zusammen. Sie sind günstiger, dafür schwanken Verfügbarkeit und Zuverlässigkeit, die auf Community-Bewertungen beruht."
  - question: "Welche GPU sollte ich für das Training von Stable-Diffusion-Modellen mieten?"
    answer: "Für Stable-Diffusion-Training und LoRA-Feinabstimmung bieten eine RTX 4090 oder RTX 3090 mit 24 GB VRAM das beste Preis-Leistungs-Verhältnis. Auf Marktplätzen kosten diese GPUs 0,40–0,80 $ pro Stunde und erledigen die meisten LoRA-Trainingsjobs in 1–3 Stunden, also für insgesamt unter 5 $."
---

# GPU mieten: Preisvergleich 2026 – die vollständige Analyse

> **Preise erhoben im Februar 2026.** Marktplatzpreise vom September 2026 finden Sie in [GPUFlow vs. Vast.ai vs. RunPod vs. SaladCloud](/de/gpuflow-vs-vast-ai-vs-runpod/) und [Was eine GPU-Miete wirklich kostet](/de/hidden-fees-in-gpu-rental/).

Die Kosten für GPU-Miete sind für alle, die mit maschinellem Lernen, KI-Forschung oder rechenintensiven Workloads arbeiten, zu einem entscheidenden Faktor geworden. Diese Analyse vergleicht die Preise von fünf großen Anbietern – Enterprise-Cloud-Plattformen und Peer-to-Peer-Marktplätze –, damit Sie auf Basis Ihrer Anforderungen und Ihres Budgets eine fundierte Entscheidung treffen können.

---

## Auf einen Blick

| Bedarf                    | Beste Wahl  | Kosten                 |
| ------------------------- | ----------- | ---------------------- |
| **Am günstigsten**        | Vast.ai     | 0,29 $/Std. (RTX 4090) |
| **Bester Kompromiss**     | RunPod      | 0,59 $/Std. (RTX 4090) |
| **Enterprise/Compliance** | AWS/Azure   | 3–30+ $/Std.           |

---

## Inhalt

- [Zusammenfassung](#zusammenfassung)
- [Der GPU-Mietmarkt im Überblick](#der-gpu-mietmarkt-im-überblick)
- [Die Anbieter im Einzelnen](#die-anbieter-im-einzelnen)
  - [Amazon Web Services (AWS)](#amazon-web-services-aws)
  - [Microsoft Azure](#microsoft-azure)
  - [Google Cloud Platform (GCP)](#google-cloud-platform-gcp)
  - [RunPod](#runpod)
  - [Vast.ai](#vastai)
  - [Wo GPUFlow einzuordnen ist](#wo-gpuflow-einzuordnen-ist)
- [Preistabellen im Vergleich](#preistabellen-im-vergleich)
- [Funktionsvergleich](#funktionsvergleich)
- [Kostenbeispiele aus der Praxis](#kostenbeispiele-aus-der-praxis)
- [Entscheidungshilfe](#entscheidungshilfe)
- [Häufig gestellte Fragen](#häufig-gestellte-fragen)
- [Methodik und Quellen](#methodik-und-quellen)

---

## Zusammenfassung

Die GPU-Mietpreise im Jahr 2026 liegen je nach Anbietertyp und Hardware weit auseinander. Die Enterprise-Cloud-Anbieter AWS, Azure und GCP verlangen Premiumpreise ab 0,80 $ pro Stunde für Einstiegs-GPUs und über 30 $ pro Stunde für High-End-Konfigurationen. Peer-to-Peer-Marktplätze bieten dieselbe Hardware 60–80 % günstiger an, allerdings mit geringeren Verfügbarkeitsgarantien.

**Die wichtigsten Ergebnisse dieser Analyse:**

| Anbietertyp                         | Typische A100-Kosten | Am besten geeignet für                              |
| ----------------------------------- | -------------------- | --------------------------------------------------- |
| Enterprise-Cloud (AWS, Azure, GCP)  | 25–35 $/Std.         | Compliance, garantierte Verfügbarkeit, Enterprise-Support |
| Verwalteter Marktplatz (RunPod)     | 1,39–1,89 $/Std.     | Ausgewogenes Verhältnis von Zuverlässigkeit und Kosten |
| P2P-Marktplatz (Vast.ai)            | 0,84–1,49 $/Std.     | Maximale Ersparnis, flexible Workloads              |

Welche Wahl am wirtschaftlichsten ist, hängt von drei Faktoren ab: Anforderungen an die Verfügbarkeit, Compliance-Vorgaben und Flexibilität der Workloads. Dieser Leitfaden liefert die konkreten Preisdaten und Entscheidungskriterien, damit Sie die passende Option finden.

---

## Der GPU-Mietmarkt im Überblick

Der GPU-Mietmarkt hat sich in zwei klar getrennte Kategorien aufgeteilt. Enterprise-Cloud-Anbieter betreiben eigene Rechenzentren mit standardisierter Hardware, garantierter Verfügbarkeit und Service-Level-Agreements für Unternehmen. Sie richten sich an Organisationen, die Compliance-Zertifizierungen, planbare Leistung und eigene Supportkanäle brauchen.

Peer-to-Peer-Marktplätze gehen einen anderen Weg. Diese Plattformen verbinden private GPU-Besitzer – vom Gaming-Enthusiasten bis zum ehemaligen Kryptominer – mit Nutzern, die Rechenleistung brauchen. Das verteilte Modell spart die Kosten eines Rechenzentrums, gibt deutliche Einsparungen an die Mieter weiter und schafft zugleich Einnahmen für die Hardwarebesitzer.

Keines der beiden Modelle ist grundsätzlich überlegen. Die richtige Wahl hängt von der Art des Workloads ab. Trainingsläufe, die Unterbrechungen verkraften, profitieren von Marktplatzpreisen. Produktive Inferenzsysteme, die eine Verfügbarkeit von 99,999 % brauchen, rechtfertigen den Enterprise-Aufschlag.

**Die aktuelle Marktlage begünstigt Mieter.** Das bessere GPU-Angebot von 2024 bis 2026 hat die Preise in allen Anbieterkategorien gedrückt. Der Wettbewerb zwischen den Marktplätzen hat die Preise für Consumer-GPUs unter 0,50 $ pro Stunde sinken lassen. Die Enterprise-Anbieter haben mit flexibleren Laufzeitoptionen und mehr Spot-Instanzen reagiert.

---

## Die Anbieter im Einzelnen

### Amazon Web Services (AWS)

Amazon Web Services bietet GPU-Rechenleistung über EC2-Instanzen an, mit Zugriff auf NVIDIA-Rechenzentrums-GPUs wie V100, A100 und neuere H100. AWS steht für das Premiumsegment der GPU-Miete: Zuverlässigkeit und Integration ins Ökosystem gehen vor Kosteneffizienz.

**GPU-Instanzen von AWS eignen sich am besten für Organisationen, die bereits fest im AWS-Ökosystem verankert sind** und eine nahtlose Anbindung an S3-Speicher, SageMaker-Pipelines und Sicherheitsframeworks für Unternehmen brauchen. Die Preise spiegeln Zuverlässigkeit auf Rechenzentrumsniveau mit Verfügbarkeits-SLAs von 99,99 % wider.

**Aktuelle Preise (Region US East, On-Demand):**

| Instanz      | GPU-Konfiguration | Stundenpreis |
| ------------ | ----------------- | ------------ |
| p4d.24xlarge | 8x A100 (40GB)    | 32,77 $      |
| p3.2xlarge   | 1x V100 (16GB)    | 3,06 $       |
| p3.8xlarge   | 4x V100 (16GB)    | 12,24 $      |
| g6.xlarge    | 1x L4 (24GB)      | 0,80 $       |
| g5.xlarge    | 1x A10G (24GB)    | 1,01 $       |

**Vorteile:**

- Enterprise-SLA mit garantierter Verfügbarkeit von 99,99 %
- Compliance-Zertifizierungen wie SOC2, HIPAA und FedRAMP
- Weltweit in über 30 Regionen verfügbar
- Tiefe Integration mit den Machine-Learning-Diensten von AWS

**Einschränkungen:**

- Höchstes Preisniveau aller untersuchten Anbieter
- Keine Consumer-GPUs (keine RTX-Serie)
- Komplexe Preisstruktur mit zusätzlichen Kosten für Bandbreite und Speicher
- Nennenswerte Rabatte nur mit Laufzeitbindung über 1–3 Jahre

**Quelle:** [AWS EC2 – Preise](https://aws.amazon.com/ec2/pricing/on-demand/)

---

### Microsoft Azure

Microsoft Azure bietet GPU-Rechenleistung über virtuelle Maschinen der N- und ND-Serie an. Azure hat stark in KI-Infrastruktur investiert, darunter exklusiver Zugang zu bestimmten GPU-Konfigurationen und eine enge Integration mit den Diensten von OpenAI.

**Azure positioniert sich als KI-Plattform für Unternehmen** und bietet besondere Möglichkeiten für Organisationen, die auf dem KI-Stack von Microsoft aufbauen. Durch die Partnerschaft mit OpenAI ist Azure die naheliegende Wahl für Teams, die GPT-basierte Anwendungen mit dedizierter Rechenleistung betreiben.

**Aktuelle Preise (Region East US, On-Demand):**

| Instanz         | GPU-Konfiguration | Stundenpreis |
| --------------- | ----------------- | ------------ |
| NC24ads A100 v4 | 1x A100 (80GB)    | 3,67 $       |
| ND96asr A100 v4 | 8x A100 (80GB)    | 27,20 $      |
| NC6s v3         | 1x V100 (16GB)    | 3,06 $       |
| NC4as T4 v3     | 1x T4 (16GB)      | 0,53 $       |
| ND H100 v5      | 8x H100 (80GB)    | 98,32 $      |

**Vorteile:**

- Exklusiver Zugang zu bestimmten GPU-Konfigurationen
- Native Integration mit Azure Machine Learning und den Diensten von OpenAI
- Hybrid-Cloud-Funktionen mit Azure Arc
- Sicherheits- und Compliance-Rahmen für Unternehmen

**Einschränkungen:**

- Premiumpreise auf dem Niveau von AWS
- GPU-Verfügbarkeit in beliebten Regionen teils knapp
- Komplexes Kontingentsystem, größere Instanzen müssen genehmigt werden
- Keine Consumer-GPUs

**Quelle:** [Azure – Preise für virtuelle Maschinen](https://azure.microsoft.com/en-us/pricing/details/virtual-machines/linux/)

---

### Google Cloud Platform (GCP)

Die Google Cloud Platform bietet GPU-Rechenleistung über Compute Engine an: NVIDIA-GPUs werden als Beschleuniger an normale virtuelle Maschinen angehängt. GCP hebt sich durch seine KI/ML-Werkzeuge und den exklusiven Zugang zu TPU-Hardware (Tensor Processing Unit) ab.

**GCP spricht Forschende und Teams an, die auf das Machine-Learning-Ökosystem von Google setzen.** Die Plattform fügt sich nahtlos in Vertex AI, BigQuery und TensorFlow ein und ist damit attraktiv für Organisationen, die bereits den Analytics-Stack von Google nutzen.

**Aktuelle Preise (Region US East, On-Demand):**

| GPU-Modell         | Speicher | Stundenpreis |
| ------------------ | -------- | ------------ |
| NVIDIA T4          | 16GB     | 0,35 $       |
| NVIDIA L4          | 24GB     | 0,56 $       |
| NVIDIA V100        | 16GB     | 2,48 $       |
| NVIDIA P100        | 16GB     | 1,46 $       |
| NVIDIA A100 (40GB) | 40GB     | 2,93 $\*     |

\*Für A100-Preise ist eine beschleunigeroptimierte A2-Maschinenkonfiguration erforderlich

**Vorteile:**

- TPU-Zugang für bestimmte Workloads (sonst nirgends verfügbar)
- Starke Kubernetes-Integration über GKE
- Günstige Spot-Preise (60–91 % Rabatt)
- Enge Integration mit den KI-Diensten von Google

**Einschränkungen:**

- GPU-Verfügbarkeit schwankt stark je nach Zone
- Zugang zu A100/H100 erfordert eine Kontingentgenehmigung
- Keine Consumer-GPUs
- Komplizierte Preisberechnung bei Kombination von GPUs und Rechenressourcen

**Quelle:** [Google Cloud – GPU-Preise](https://cloud.google.com/compute/gpus-pricing)

---

### RunPod

RunPod betreibt eine verwaltete GPU-Cloud mit eigener Rechenzentrums-Hardware und Ressourcen aus der Community. Die Plattform ist schnell gewachsen, weil sie einen Mittelweg zwischen Enterprise-Zuverlässigkeit und Marktplatzpreisen bietet.

**RunPod ist ein zugänglicher Einstieg in die GPU-Miete** und verbindet günstige Preise mit einer benutzerfreundlichen Oberfläche. Die Plattform bietet vorkonfigurierte Vorlagen für gängige Frameworks und die Bereitstellung typischer KI-Workloads mit einem Klick.

**Aktuelle Preise (Secure Cloud):**

| GPU-Modell       | Speicher | Stundenpreis |
| ---------------- | -------- | ------------ |
| RTX 4090         | 24GB     | 0,59 $       |
| RTX 3090         | 24GB     | 0,46 $       |
| A100 PCIe (80GB) | 80GB     | 1,39 $       |
| A100 SXM (80GB)  | 80GB     | 1,49 $       |
| H100 PCIe (80GB) | 80GB     | 2,39 $       |
| L4               | 24GB     | 0,39 $       |
| RTX A6000        | 48GB     | 0,49 $       |

**Vorteile:**

- Consumer-GPUs verfügbar (RTX 3090, 4090)
- Sekundengenaue Abrechnung vermeidet unnötige Kosten
- Fertige Vorlagen für Stable Diffusion, LLMs und andere Workloads
- Aktive Community und reaktionsschneller Support

**Einschränkungen:**

- Zuverlässigkeit der Community Cloud schwankt je nach Anbieter
- Kein Enterprise-SLA für die Secure-Cloud-Stufe
- Geografisch weniger breit aufgestellt als die Hyperscaler
- Unterbrechungen bei Spot-Instanzen möglich

**Quelle:** [RunPod – Preise](https://www.runpod.io/gpu-instance/pricing)

---

### Vast.ai

Vast.ai hat das Modell des Peer-to-Peer-GPU-Marktplatzes begründet: Private GPU-Besitzer und Mieter finden über ein auktionsbasiertes System zusammen. Dank des verteilten Anbieternetzes bietet die Plattform die niedrigsten Preise am Markt.

**Vast.ai holt bei flexiblen Workloads das Maximum an Kosteneffizienz heraus.** Beim Marktplatzmodell schwanken die Preise mit Angebot und Nachfrage. Wer mit wechselnder Verfügbarkeit umgehen kann, spart deutlich.

**Aktuelle Marktplatzpreise (repräsentative Werte):**

| GPU-Modell   | Speicher | Preisspanne      |
| ------------ | -------- | ---------------- |
| RTX 4090     | 24GB     | 0,29–0,78 $/Std. |
| RTX 3090     | 24GB     | 0,40–0,60 $/Std. |
| RTX 5090     | 32GB     | 0,38–1,08 $/Std. |
| A100 (80GB)  | 80GB     | 0,84–1,49 $/Std. |
| H100 (80GB)  | 80GB     | 1,47–2,94 $/Std. |
| H200 (140GB) | 140GB    | 2,07–5,07 $/Std. |

**Vorteile:**

- Niedrigste Preise am GPU-Mietmarkt
- Große Hardwareauswahl, einschließlich neuester Consumer-GPUs
- Transparente Zuverlässigkeitskennzahlen der Anbieter
- Flexible Mietdauer von Stunden bis Monaten

**Einschränkungen:**

- Schwankende Verfügbarkeit und Preise
- Zuverlässigkeit der Anbieter zwischen 97 % und 99,9 %
- Kein garantiertes Verfügbarkeits-SLA
- Setzt Vertrautheit mit der Dynamik von P2P-Marktplätzen voraus

**Quelle:** [Vast.ai – Marktplatz](https://cloud.vast.ai/)

---

### Wo GPUFlow einzuordnen ist

GPUFlow taucht in den folgenden Preistabellen nicht auf, weil hier etwas anderes vermietet wird. Die oben genannten Anbieter vermieten Ihnen eine Maschine oder einen Container. Bei GPUFlow mieten Sie einen OpenAI-kompatiblen API-Schlüssel für KI-Modelle, die bereits auf der Consumer-GPU einer anderen Person laufen, sekundengenau abgerechnet. Eigenes Training oder eigener Code ist damit nicht möglich, dafür müssen Sie nichts einrichten. Die Anbieter legen ihre Stundenpreise selbst fest und behalten 88 %.

Einen direkten Vergleich beider Ansätze finden Sie in [GPUFlow vs. Vast.ai vs. RunPod vs. SaladCloud](/de/gpuflow-vs-vast-ai-vs-runpod/).

**Quelle:** [GPUFlow-Dokumentation](https://docs.gpuflow.app/de/)

---

## Preistabellen im Vergleich

### Preise für Consumer-GPUs

Die folgende Tabelle vergleicht die Mietpreise für Consumer-GPUs, die häufig für KI-Training, Bildgenerierung und Inferenz eingesetzt werden.

| GPU              | AWS   | Azure | GCP   | RunPod | Vast.ai     |
| ---------------- | ----- | ----- | ----- | ------ | ----------- |
| RTX 4090 (24GB)  | k. A. | k. A. | k. A. | 0,59 $ | 0,29–0,78 $ |
| RTX 3090 (24GB)  | k. A. | k. A. | k. A. | 0,46 $ | 0,40–0,60 $ |
| RTX A6000 (48GB) | k. A. | k. A. | k. A. | 0,49 $ | 0,40–0,70 $ |

### Preise für Rechenzentrums-GPUs

Rechenzentrums-GPUs bieten mehr Speicher und höhere Zuverlässigkeit für produktive Workloads.

| GPU         | AWS       | Azure      | GCP    | RunPod      | Vast.ai     |
| ----------- | --------- | ---------- | ------ | ----------- | ----------- |
| A100 (40GB) | ~4,10 $\* | k. A.      | 2,93 $ | k. A.       | 0,80–1,20 $ |
| A100 (80GB) | ~4,10 $\* | 3,67 $     | k. A.  | 1,39–1,49 $ | 0,84–1,49 $ |
| H100 (80GB) | ~6,90 $\* | ~12,29 $\* | k. A.  | 2,39 $      | 1,47–2,94 $ |
| V100 (16GB) | 3,06 $    | 3,06 $     | 2,48 $ | k. A.       | 0,70–1,10 $ |
| L4 (24GB)   | 0,80 $    | k. A.      | 0,56 $ | 0,39 $      | 0,35–0,50 $ |

\*Die Preise für AWS und Azure sind Kosten pro GPU, abgeleitet aus den Preisen von Multi-GPU-Instanzen

### Rangfolge nach Kosteneffizienz

Bei vergleichbarer Rechenleistung ergibt sich folgende Rangfolge nach Kosteneffizienz:

1. **Vast.ai** – niedrigste absolute Preise, schwankende Verfügbarkeit
2. **RunPod** – bestes Verhältnis von Preis und Zuverlässigkeit
3. **GCP** – der günstigste unter den Hyperscalern
4. **Azure** – Enterprise-Preise im Mittelfeld
5. **AWS** – Premiumpreise, maximale Zuverlässigkeit

---

## Funktionsvergleich

Neben dem Preis beeinflussen weitere Faktoren die Wahl des Anbieters. Diese Tabelle fasst die wichtigsten Unterschiede zusammen.

| Merkmal                  | AWS          | Azure        | GCP          | RunPod          | Vast.ai   |
| ------------------------ | ------------ | ------------ | ------------ | --------------- | --------- |
| Verfügbarkeits-SLA       | 99,99 %      | 99,95 %      | 99,95 %      | Best Effort     | Community |
| Consumer-GPUs            | Nein         | Nein         | Nein         | Ja              | Ja        |
| Einrichtungszeit         | 10–30 Min.   | 10–30 Min.   | 10–30 Min.   | 2–5 Min.        | 2–5 Min.  |
| Mindestabrechnung        | 1 Minute     | 1 Minute     | 1 Minute     | 1 Sekunde       | 1 Sekunde |
| Enterprise-Support       | Ja           | Ja           | Ja           | Kostenpflichtig | Nein      |
| Compliance-Zertifikate   | Umfassend    | Umfassend    | Umfassend    | Begrenzt        | Keine     |

---

## Kostenbeispiele aus der Praxis

Abstrakte Preisvergleiche helfen ohne konkreten Workload nur begrenzt weiter. Die folgenden Szenarien zeigen die tatsächlichen Kosten typischer Anwendungsfälle für GPU-Miete.

### Szenario 1: LoRA-Training für Stable Diffusion

Das Training eines eigenen LoRA-Modells für Stable Diffusion dauert auf einer GPU mit 24 GB in der Regel 1–3 Stunden.

**Workload:** 2 Stunden auf einer RTX 4090

| Anbieter | Berechnung                  | Gesamtkosten |
| -------- | --------------------------- | ------------ |
| AWS      | k. A. (GPU nicht verfügbar) | —            |
| Azure    | k. A. (GPU nicht verfügbar) | —            |
| GCP      | k. A. (GPU nicht verfügbar) | —            |
| RunPod   | 2 Std. × 0,59 $             | **1,18 $**   |
| Vast.ai  | 2 Std. × 0,40 $ (Ø)         | **0,80 $**   |

**Empfehlung:** Marktplatzanbieter sparen bei diesem Workload 80–90 % gegenüber Enterprise-Clouds. Consumer-GPUs gibt es bei AWS, Azure und GCP nicht.

### Szenario 2: Feinabstimmung eines LLM

Die Feinabstimmung eines Sprachmodells mit 7 Mrd. Parametern erfordert viel VRAM und Rechenzeit.

**Workload:** 8 Stunden auf einer A100 (80GB)

| Anbieter | Berechnung          | Gesamtkosten  |
| -------- | ------------------- | ------------- |
| AWS      | 8 Std. × ~4,10 $    | **~32,80 $**  |
| Azure    | 8 Std. × 3,67 $     | **29,36 $**   |
| GCP      | 8 Std. × ~2,93 $    | **~23,44 $**  |
| RunPod   | 8 Std. × 1,39 $     | **11,12 $**   |
| Vast.ai  | 8 Std. × 1,10 $ (Ø) | **8,80 $**    |

**Empfehlung:** Marktplatzanbieter senken die Kosten um 60–75 %. RunPod bietet für längere Trainingsläufe das beste Verhältnis von Zuverlässigkeit und Preis.

### Szenario 3: Produktiver Inferenzserver

Ein Inferenz-Endpunkt im 24/7-Betrieb braucht über lange Zeiträume eine verlässliche Verfügbarkeit.

**Workload:** 720 Stunden (1 Monat) auf einer RTX 4090

| Anbieter | Berechnung                  | Gesamtkosten  |
| -------- | --------------------------- | ------------- |
| AWS      | k. A. (GPU nicht verfügbar) | —             |
| Azure    | k. A. (GPU nicht verfügbar) | —             |
| GCP      | k. A. (GPU nicht verfügbar) | —             |
| RunPod   | 720 Std. × 0,59 $           | **424,80 $**  |
| Vast.ai  | 720 Std. × 0,50 $ (Ø)       | **360,00 $**  |

**Empfehlung:** Für produktive Workloads mit hohen Verfügbarkeitsanforderungen bietet die Secure-Cloud-Stufe von RunPod trotz des moderaten Aufpreises mehr Zuverlässigkeit als reine Marktplatzangebote.

---

## Entscheidungshilfe

Bei der Wahl eines GPU-Mietanbieters müssen Ihre Anforderungen zu den Fähigkeiten des Anbieters passen. Die folgende Übersicht hilft bei der Entscheidung.

### Wählen Sie AWS, wenn:

- Ihre Organisation bereits AWS-Infrastruktur und entsprechendes Know-how hat
- Compliance-Vorgaben eine Zertifizierung nach SOC2, HIPAA oder FedRAMP verlangen
- Ihre Workloads eine garantierte Verfügbarkeit von 99,99 % brauchen
- Zuverlässigkeit und Support wichtiger sind als das Budget
- Sie eine Integration mit SageMaker oder anderen KI-Diensten von AWS brauchen

### Wählen Sie Azure, wenn:

- Sie auf dem KI-Stack von Microsoft aufbauen (OpenAI, Azure ML)
- Hybrid-Cloud-Anforderungen die Einbindung eigener Rechenzentren umfassen
- Ihre Organisation standardmäßig Enterprise-Werkzeuge von Microsoft nutzt
- Sie bestimmte GPU-Konfigurationen brauchen, die es nur bei Azure gibt

### Wählen Sie GCP, wenn:

- Ihr Workload TPU-Zugang erfordert
- Sie stark in das Datenökosystem von Google investiert haben (BigQuery, Vertex AI)
- TensorFlow Ihr wichtigstes Framework ist
- Sie die günstigsten Spot-Preise unter den Hyperscalern wollen

### Wählen Sie RunPod, wenn:

- Sie Marktplatzpreise mit der Zuverlässigkeit eines verwalteten Dienstes verbinden wollen
- Sie Consumer-GPUs brauchen (RTX 4090, 3090)
- Vorkonfigurierte Vorlagen Ihren Arbeitsablauf beschleunigen würden
- Sie ein ausgewogenes Verhältnis von Kosten und Support bevorzugen

### Wählen Sie Vast.ai, wenn:

- Der niedrigste Preis Ihr wichtigstes Kriterium ist
- Ihre Workloads gelegentliche Unterbrechungen verkraften
- Sie die Zuverlässigkeit einzelner Anbieter selbst bewerten können
- Geografische Vielfalt oder bestimmte Hardwarekonfigurationen wichtig sind

### Wählen Sie GPUFlow, wenn:

- Sie ein offenes KI-Modell hinter einer OpenAI-kompatiblen API brauchen, keine Maschine
- Sie keine Treiber, Container oder Inferenzserver einrichten wollen
- Sie für die gebuchten Stunden sekundengenau zahlen wollen und nicht genutzte Zeit erstattet bekommen möchten
- Sie keine Modelle trainieren und keinen eigenen Code ausführen müssen

---

## Häufig gestellte Fragen

### Wie miete ich eine GPU für KI-Training am günstigsten?

Peer-to-Peer-Marktplätze bieten die niedrigsten GPU-Mietpreise. Im Februar 2026 gab es auf Vast.ai eine RTX 4090 ab 0,29 $ pro Stunde, während vergleichbare Rechenleistung auf verwalteten Plattformen über 1,50 $ und in Enterprise-Clouds über 3 $ kostete. Der Preis dafür: schwankende Verfügbarkeit und eine Zuverlässigkeit, die auf Community-Bewertungen statt auf garantierten SLAs beruht.

### Was kostet die Miete einer NVIDIA A100?

Die Mietkosten für eine A100 unterscheiden sich je nach Anbieter erheblich. Enterprise-Clouds verlangen 3–4 $ pro Stunde für eine einzelne GPU, bündeln aber meist mehrere GPUs zu größeren Instanzen. RunPod bietet die A100 für 1,39–1,49 $ pro Stunde an. Auf Marktplätzen wie Vast.ai gibt es die A100 von privaten Anbietern ab 0,84 $ pro Stunde.

### Ist es günstiger, eine GPU zu mieten als zu kaufen?

Bei gelegentlicher Nutzung ist Mieten wirtschaftlicher. Eine RTX 4090 kostet in der Anschaffung 1.600–2.000 $. Bei Marktplatzpreisen von 0,50–0,80 $ pro Stunde liegt die Gewinnschwelle bei 2.000–4.000 Nutzungsstunden – das entspricht 83–167 Tagen Dauerbetrieb rund um die Uhr. Die meisten Nutzer, die Modelle trainieren oder regelmäßig Inferenzjobs ausführen, erreichen diese Schwelle nicht.

Ein Kauf lohnt sich, wenn Sie die GPU über Monate hinweg täglich mehr als 8 Stunden nutzen oder aus Sicherheits- oder Latenzgründen eigene Hardware brauchen.

### Was unterscheidet Cloud-GPU-Anbieter von GPU-Marktplätzen?

Cloud-GPU-Anbieter (AWS, Azure, GCP) betreiben Rechenzentren mit standardisierten Hardwarekonfigurationen, garantierten Verfügbarkeits-SLAs und Compliance-Zertifizierungen. Ihre Preise spiegeln die Investitionen in Infrastruktur, den Supportaufwand und die Zuverlässigkeitsgarantien wider.

GPU-Marktplätze wie Vast.ai bündeln Rechenressourcen privater Hardwarebesitzer – von Gaming-PCs über ehemalige Mining-Rigs bis zu privaten Rechenzentren. Das Peer-to-Peer-Modell spart die Kosten zentraler Infrastruktur und ermöglicht 60–80 % niedrigere Preise. Die Nachteile: schwankende Verfügbarkeit, uneinheitliche Leistung je nach Anbieter und Support aus der Community statt garantierter Unterstützung.

### Welche GPU sollte ich für Machine-Learning-Training mieten?

Die Wahl der GPU hängt von der Modellgröße und den Trainingsanforderungen ab:

- **LoRA-Feinabstimmung, Stable Diffusion, kleine Modelle:** Die RTX 4090 (24GB) bietet das beste Preis-Leistungs-Verhältnis
- **LLMs mit 7–13 Mrd. Parametern:** Die A100 (40GB oder 80GB) bietet den nötigen Speicher
- **Modelle mit 70 Mrd. Parametern und mehr:** H100 (80GB) oder Multi-GPU-Konfigurationen erforderlich
- **Inferenz-Workloads:** L4- oder T4-GPUs sind eine kostengünstige Option für den Betrieb

Wer in die KI-Entwicklung einsteigt, kann mit einer gemieteten RTX 4090 für 0,50–0,80 $ pro Stunde günstig experimentieren und später bei wachsenden Anforderungen auf Rechenzentrums-GPUs umsteigen.

### Gibt es versteckte Kosten bei der GPU-Miete?

Mehrere Faktoren können die Kosten über den angegebenen Stundenpreis hinaus erhöhen:

- **Speicher:** Viele Anbieter berechnen Speicherplatz über ein kleines Grundkontingent hinaus separat
- **Bandbreite:** In Enterprise-Clouds fallen Gebühren für Datenübertragung an, meist 0,05–0,15 $ pro GB
- **Leerlauf:** Bereitgestellte GPUs werden durchgehend abgerechnet – beenden Sie Instanzen rechtzeitig
- **Einrichtungsaufwand:** Bereitstellung von Vorlagen, Konfiguration der Umgebung und Datenübertragung kosten Zeit ohne Rechenleistung
- **Plattformgebühren:** Marktplätze behalten 10–30 % der Mieteinnahmen der Anbieter ein, was sich in den Preisen niederschlägt

Marktplätze haben in der Regel transparentere Preise mit weniger Zusatzkosten. Bei Enterprise-Clouds sollten Sie die gesamte Kostenstruktur genau prüfen.

---

## Methodik und Quellen

Die Preisdaten dieser Analyse wurden im Februar 2026 direkt auf den Websites und Marktplätzen der Anbieter erhoben. Die Preise der Cloud-Anbieter sind On-Demand-Preise in den US-East-Regionen ohne Rabatte für Laufzeitbindung. Die Marktplatzpreise geben die zum Zeitpunkt der Recherche beobachteten Spannen der verfügbaren Angebote wieder. Zur Einordnung: Ein typischer [Ablauf zur LLM-Feinabstimmung](/de/private-llm-fine-tuning-guide/) mit einem Modell mit 8 Mrd. Parametern kostet auf einer RTX 4090 vom Marktplatz zwischen drei und acht Dollar.

**Primärquellen:**

- [AWS EC2 – On-Demand-Preise](https://aws.amazon.com/ec2/pricing/on-demand/)
- [Azure – Preise für virtuelle Maschinen](https://azure.microsoft.com/en-us/pricing/details/virtual-machines/linux/)
- [Google Cloud – GPU-Preise](https://cloud.google.com/compute/gpus-pricing)
- [RunPod – Preise für GPU-Instanzen](https://www.runpod.io/gpu-instance/pricing)
- [Vast.ai – Marktplatz](https://cloud.vast.ai/)

Die Preise der Cloud-Anbieter ändern sich häufig. Spot-Instanzen und Rabatte für Laufzeitbindung können die Kosten deutlich unter die hier genannten On-Demand-Preise senken. Marktplatzpreise schwanken mit Angebot und Nachfrage.

Aktuelle Preise finden Sie direkt auf den Websites der Anbieter.

---

**Sie brauchen ein KI-Modell über eine API statt einer ganzen Maschine?** Auf [GPUFlow](https://gpuflow.app/de/marketplace) mieten Sie eine GPU stundenweise und erhalten einen OpenAI-kompatiblen API-Schlüssel, sekundengenau abgerechnet. [So funktioniert es](https://docs.gpuflow.app/de/renters/getting-started/).

---

_Weitere Leitfäden:_

- [Stable-Diffusion-LoRA-Modelle für unter 10 $ trainieren](/de/stable-diffusion-lora-training-under-10-dollars/)
- [RunPod vs. Vast.ai: ausführlicher Vergleich für KI-Entwickler](/de/runpod-vs-vastapi-comparison/)
- [Was eine GPU-Miete wirklich kostet](/de/hidden-fees-in-gpu-rental/)
