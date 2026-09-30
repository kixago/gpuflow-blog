---
title: "Ollama vs. vLLM vs. TGI: Inferenz-Benchmark auf der RTX 4090 (gemessen, nicht beworben)"
description: "Ein kontrollierter Benchmark auf der RTX 4090: Ollama, vLLM und Hugging Face TGI im Vergleich bei der Inferenz mit Llama‑3.1‑8B. Durchsatz, Latenz, VRAM-Bedarf und Kosten pro Token."
excerpt: "Gemessener Benchmark von Ollama, vLLM und TGI auf einer einzelnen RTX 4090 mit Llama‑3.1‑8B. Echter Durchsatz, echte Latenz, echte Kostenfolgen."
pubDate: 2026-02-25
updatedDate: 2026-09-29
locale: "de"
category: "benchmarks"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/rtx4090-inference-benchmark-hero.png"
heroImageAlt: "Inferenz-Benchmark einer RTX 4090 im Terminal mit Leistungskennzahlen"
faq:
  - question: "Welcher Inferenzserver ist auf einer RTX 4090 mit Llama-3.1-8B am schnellsten?"
    answer: "In FP16-Messungen auf einer RTX 4090 erreichte vLLM unter paralleler Last den höchsten dauerhaften Durchsatz mit etwa 185 bis 215 Tokens pro Sekunde über acht Streams. TGI kam auf 150 bis 176 Tokens pro Sekunde, Ollama unter denselben Bedingungen im Schnitt auf 95 bis 108 Tokens pro Sekunde."

  - question: "Braucht vLLM mehr VRAM als Ollama oder TGI?"
    answer: "vLLM belegte beim Bereitstellen von Llama-3.1-8B in FP16 etwa 20 bis 22 GB VRAM. TGI lag mit 21 bis 23 GB in einem ähnlichen Bereich. Ollama brauchte insgesamt weniger VRAM, typischerweise 14 bis 17 GB, erreichte unter paralleler Last aber nicht denselben Durchsatz."

  - question: "Eignet sich Ollama für Inferenz-Workloads in Produktion?"
    answer: "Ollama eignet sich für Entwicklungsumgebungen und interne Tools mit wenigen parallelen Anfragen. Im Test skalierte es bei acht parallelen Request-Streams weniger effizient als vLLM oder TGI. Für Produktions-APIs mit dauerhaftem Traffic ist ein Server, der auf Continuous Batching optimiert ist, in der Regel effizienter."

  - question: "Was kostet die Inferenz mit Llama-3.1-8B auf einer RTX 4090?"
    answer: "Bei einem durchschnittlichen Mietpreis von etwa 0,45 USD pro Stunde brauchte vLLM für 500.000 Tokens rund 41 bis 42 Minuten Laufzeit, was etwa 0,31 USD kostet. Ollama brauchte für denselben Workload etwa 83 bis 84 Minuten, was etwa 0,63 USD kostet. Die tatsächlichen Kosten hängen vom Workload und vom Mietpreis ab."

  - question: "Mit welchen Prompt- und Generierungseinstellungen wurde gemessen?"
    answer: "Der Benchmark verwendete einen Eingabe-Prompt mit 512 Tokens und erzeugte pro Anfrage 128 Tokens mit Greedy Decoding bei einer Temperatur von null. Alle Messungen erfolgten nach dem Aufwärmen des Modells, mit acht parallelen Request-Streams und ohne Speculative Decoding."

  - question: "Kann ich diesen Inferenz-Benchmark auf der RTX 4090 selbst nachstellen?"
    answer: "Ja. Der Artikel nennt Hardwareausstattung, CUDA-Version, Treiberversion, Decoding-Parameter und Parallelitätskonfiguration. Wenn Sie Llama-3.1-8B in FP16 auf einer einzelnen RTX 4090 bereitstellen und Prompt-Länge und Parallelität übernehmen, erhalten Sie vergleichbare Ergebnisse."
---

Ein eigenes Modell zu betreiben ist nur die halbe Miete.

Nach dem Fine-Tuning – ausführlich beschrieben in unserem [Leitfaden zum privaten LLM-Fine‑Tuning](/de/private-llm-fine-tuning-guide/) – steht die nächste Entscheidung an, und zwar eine betriebliche: Wie stellen Sie das Modell effizient bereit?

Die Inferenz bestimmt:

- Die Kosten pro Token
- Die Latenz unter Last
- Wie effizient die GPU ausgelastet wird
- Ob Consumer-Hardware in Produktion taugt

Dieser Benchmark vergleicht drei verbreitete Inferenz-Stacks:

- Ollama
- vLLM
- Hugging Face Text Generation Inference (TGI)

Es geht nicht um Vorlieben. Es geht ums Messen.

---

## Testumgebung

**Hardware**

- GPU: NVIDIA RTX 4090 (24GB VRAM)
- CPU: Consumer-Prozessor der Ryzen-Klasse mit 16 Kernen
- RAM: 64GB DDR5
- Speicher: NVMe-SSD
- CUDA: 12.1
- NVIDIA-Treiber: 550+

**Modell**

- `meta-llama/Llama-3.1-8B`
- Präzision: FP16 (keine 4‑Bit-Quantisierung)
- Kontextfenster: 4096 Tokens

**Benchmark-Bedingungen**

- Eingabe-Prompt mit 512 Tokens
- Ausgabe von 128 Tokens
- Greedy Decoding (Temperatur = 0)
- Kein Speculative Decoding
- Keine Tensor-Parallelität
- Nur Warmstart (Modell vor der Messung vorgeladen)
- 8 parallele Request-Streams (sofern unterstützt)

Alle Tests liefen auf einer sauberen Maschine ohne Hintergrundlast. Jeder Messwert ist der Mittelwert aus fünf Durchläufen.

---

![Terminal mit strukturierten Kennzahlen eines Inferenz-Benchmarks auf der RTX 4090](../_images/rtx4090-inference-terminal-results.png)

---

## Ergebnisse

### 1. Ollama

Ollama setzt auf Einfachheit. Die Installation ist minimal, Modelle werden automatisch heruntergeladen.

```bash
ollama run llama3
```

Batching-Verhalten und Scheduling-Strategie lassen sich nur eingeschränkt konfigurieren.

#### Gemessene Leistung (RTX 4090, FP16)

- **Durchsatz mit einem Stream:** 62–74 Tokens/s
- **Durchsatz mit 8 Streams:** 95–108 Tokens/s
- **Latenz bis zum ersten Token:** 720–980 ms
- **Beobachteter VRAM-Bedarf:** 14–17GB

#### Beobachtungen

- Die GPU-Auslastung schwankte unter paralleler Last.
- Ab 4 Streams skalierte der Durchsatz nicht mehr linear.
- Es gibt keine Stellschrauben für fortgeschrittene Batching-Optimierung.

Ollama läuft zuverlässig für die lokale Entwicklung und Dienste mit wenig Traffic. Unter dauerhafter paralleler Last lastet es die GPU nicht voll aus.

---

### 2. vLLM

vLLM ist auf Durchsatz ausgelegt. Die PagedAttention-Implementierung nutzt den KV-Cache bei parallelen Anfragen effizienter.

Installation:

```bash
pip install vllm
```

Start:

```bash
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-3.1-8B \
  --dtype float16
```

#### Gemessene Leistung (RTX 4090, FP16)

- **Durchsatz mit einem Stream:** 92–104 Tokens/s
- **Durchsatz mit 8 Streams:** 185–215 Tokens/s
- **Latenz bis zum ersten Token:** 360–480 ms
- **Beobachteter VRAM-Bedarf:** 20–22GB

#### Beobachtungen

- Die GPU-Auslastung blieb unter Last über 95 %.
- Continuous Batching verbesserte die Skalierung.
- Die Latenz blieb über alle parallelen Streams stabil.

vLLM erreichte den höchsten dauerhaften Durchsatz pro Stunde Mietzeit.

---

### 3. Hugging Face Text Generation Inference (TGI)

TGI ist ein containerisierter Inferenzserver für den Produktionseinsatz.

```bash
docker run --gpus all \
  -p 8080:80 \
  ghcr.io/huggingface/text-generation-inference:latest \
  --model-id meta-llama/Llama-3.1-8B
```

#### Gemessene Leistung (RTX 4090, FP16)

- **Durchsatz mit einem Stream:** 78–88 Tokens/s
- **Durchsatz mit 8 Streams:** 150–176 Tokens/s
- **Latenz bis zum ersten Token:** 510–690 ms
- **Beobachteter VRAM-Bedarf:** 21–23GB

#### Beobachtungen

- Die Leistung war konstant und vorhersehbar.
- Der Durchsatz skalierte besser als bei Ollama, aber schlechter als bei vLLM.
- Durch die Container-Laufzeit ist der Betriebsaufwand höher.

TGI bietet Steuerungs- und Monitoring-Funktionen für die Produktion, holt aber aus einer einzelnen 4090 nicht den maximalen Durchsatz heraus.

---

![Ausgabe von nvidia-smi mit der GPU-Auslastung während paralleler Inferenz](../_images/rtx4090-nvidia-smi-inference-load.png)

---

## Direkter Vergleich

| Stack  | Ein Stream    | 8 Streams   | Erstes Token | VRAM    | GPU-Auslastung |
| ------ | ------------- | ----------- | ------------ | ------- | -------------- |
| Ollama | 62–74 t/s     | 95–108 t/s  | 720–980ms    | 14–17GB | Teilweise      |
| TGI    | 78–88 t/s     | 150–176 t/s | 510–690ms    | 21–23GB | Hoch           |
| vLLM   | 92–104 t/s    | 185–215 t/s | 360–480ms    | 20–22GB | Sehr hoch      |

---

## Was das für die Kosten gemieteter GPUs bedeutet

Auf GPU-Marktplätzen kostete eine RTX 4090 im September 2026 je nach Plattform und Nachfrage rund 0,30–0,46 $ pro Stunde. Eine detaillierte Aufschlüsselung finden Sie hier:

- [GPU-Mietpreisvergleich 2026](/de/gpu-rental-pricing-comparison-2026/)
- [Was eine GPU-Miete wirklich kostet](/de/hidden-fees-in-gpu-rental/)

Annahmen:

- 0,45 $/Stunde Miete
- 500.000 generierte Tokens
- 8 parallele Streams

Mit dem gemessenen Mediandurchsatz:

**vLLM (~200 Tokens/s)**  
500.000 / 200 = 2.500 Sekunden ≈ 41–42 Minuten  
Kosten ≈ 0,31 $

**Ollama (~100 Tokens/s)**  
500.000 / 100 = 5.000 Sekunden ≈ 83–84 Minuten  
Kosten ≈ 0,63 $

Für sich genommen ist der Kostenunterschied nicht dramatisch. Er summiert sich aber mit wachsender Größe.

Bei 50 Millionen Tokens pro Tag bestimmt die Durchsatzeffizienz direkt, wie viele GPUs Sie brauchen und wie lange Sie sie mieten.

### Den Benchmark selbst durchführen

Um diese Messungen nachzustellen, brauchen Sie eine Maschine, die Sie selbst kontrollieren, damit Sie jeden Server installieren und konfigurieren können. Dafür eignen sich Marktplätze, die Container mit SSH-Zugang vermieten, etwa Vast.ai oder RunPod.

Wenn Sie nur Modelle ausprobieren möchten, die Ollama auf einer RTX 4090 bereitstellt, ohne etwas einzurichten: Bei [GPUFlow](https://gpuflow.app/de/marketplace) betreiben die Anbieter Ollama, und Sie mieten den Zugang über einen OpenAI-kompatiblen API-Schlüssel, sekundengenau abgerechnet. Den Inferenzserver können Sie dort nicht austauschen. Das Angebot ist also zum Nutzen der Modelle gedacht, nicht zum Benchmarken der Server.

Da stundenweise abgerechnet wird, wirkt sich die Inferenzeffizienz direkt auf die Kosten aus. Der Unterschied zwischen 100 und 200 Tokens/s macht sich bei dauerhafter Last deutlich bemerkbar.

---

## Einordnung für das Deployment

Wenn Sie GPUs stundenweise mieten, bestimmt die Inferenzeffizienz direkt Ihre Kosteneffizienz. Die Zahlen dazu rechnen wir in [GPU pro Stunde oder API pro Token](/de/hourly-gpu-vs-per-token-api/) durch.

Der Durchsatz beeinflusst:

- Wie viele Mietstunden ein Job braucht
- Wie viele GPUs Sie für Ihren Traffic brauchen
- Wie stark Sie von instabilen Hosts betroffen sind
- Ihren betrieblichen Spielraum

Consumer-GPUs bleiben für Modelle mit 7B–8B Parametern wirtschaftlich, wenn sie mit effizienten Inferenz-Stacks kombiniert werden.

---

## Wann sich welcher Stack eignet

**Ollama**

- Interne Tools
- Wenige parallele Anfragen
- Schnelles Prototyping

**TGI**

- Containerisierte Umgebungen
- Teams, die strukturiertes Logging brauchen
- Verwaltete Produktions-Deployments

**vLLM**

- API-Dienste
- Viele parallele Anfragen
- Maximale Tokens pro Dollar

---

## Fazit

Auf einer einzelnen RTX 4090 mit Llama‑3.1‑8B in FP16 gilt:

- vLLM erreichte den höchsten dauerhaften Durchsatz.
- TGI lieferte ausgewogene Leistung mit Steuerungsfunktionen für die Produktion.
- Ollama setzte auf Einfachheit statt auf maximale GPU-Auslastung.

Die Wahl des Inferenz-Stacks ist keine Geschmacksfrage. Sie bestimmt die Kostenstruktur und das Skalierungsverhalten.

Bei Workloads auf gemieteten Consumer-GPUs beeinflusst die Batching-Effizienz die Wirtschaftlichkeit erheblich.

## Wo Sie das in Produktion betreiben

Alle Benchmarks in diesem Artikel liefen auf gemieteter Consumer-Hardware, nicht auf eigener Infrastruktur.

Für Fine-Tuning oder einen eigenen Inferenzserver mieten Sie eine Maschine, auf der Sie sich anmelden können. Wenn Sie ein von Ollama bereitgestelltes Modell ohne jede Einrichtung über eine API nutzen möchten, sehen Sie sich [GPUFlow](https://gpuflow.app/de/marketplace) an: Mieten werden sekundengenau abgerechnet und mit Guthaben bezahlt, das Sie per Karte kaufen.

#### Weiterführende Ressourcen

**Vertiefen Sie Ihr Wissen zum Deployment-Stack:**

- [Der umfassende Leitfaden zum privaten LLM-Fine‑Tuning auf gemieteten GPUs](/de/private-llm-fine-tuning-guide/) – Vollständige Anleitung zum sicheren Training von Open‑Weights-Modellen
- [GPU-Mietpreisvergleich 2026](/de/gpu-rental-pricing-comparison-2026/) – Kostenunterschiede zwischen den großen GPU-Mietplattformen
- [Was eine GPU-Miete wirklich kostet](/de/hidden-fees-in-gpu-rental/) – Was Preisseiten mit Stundenpreisen verschweigen
- [RunPod vs. Vast.ai im Vergleich](/de/runpod-vs-vastapi-comparison/) – Zentral verwaltete Infrastruktur und Marktplatz im Vergleich
