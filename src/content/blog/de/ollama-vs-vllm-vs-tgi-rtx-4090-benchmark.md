---
title: "Ollama vs vLLM vs TGI: RTX 4090 Inference‑Benchmark (gemessen, nicht beworben)"
description: "Ein kontrollierter RTX 4090 Benchmark, der Ollama, vLLM und Hugging Face TGI für Llama‑3.1‑8B Inference vergleicht. Durchsatz, Latenz, VRAM‑Nutzung und Kosten‑pro‑Token‑Analyse."
excerpt: "Gemessener Benchmark von Ollama, vLLM und TGI auf einer einzelnen RTX 4090 mit Llama‑3.1‑8B. Reale Durchsatzwerte, reale Latenz, reale Kostenauswirkungen."
pubDate: 2026-02-25
updatedDate: 2026-02-25
locale: "de"
category: "benchmarks"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/rtx4090-inference-benchmark-hero.png"
heroImageAlt: "RTX 4090 GPU Inference‑Benchmark im Terminal mit Leistungskennzahlen"
faq:
  - question: "Welcher Inference‑Server ist auf einer RTX 4090 für Llama-3.1-8B am schnellsten?"
    answer: "In gemessenen FP16‑Tests auf einer RTX 4090 erzielte vLLM den höchsten nachhaltigen Durchsatz unter paralleler Last und erreichte etwa 185 bis 215 Tokens pro Sekunde über acht Streams. TGI lieferte 150 bis 176 Tokens pro Sekunde, während Ollama unter denselben Bedingungen durchschnittlich 95 bis 108 Tokens pro Sekunde erreichte."

  - question: "Verbraucht vLLM mehr VRAM als Ollama oder TGI?"
    answer: "vLLM nutzte beim Serving von Llama-3.1-8B in FP16 etwa 20 bis 22GB VRAM. TGI lag in einem ähnlichen Bereich von 21 bis 23GB. Ollama verwendete insgesamt weniger VRAM, typischerweise zwischen 14 und 17GB, erreichte jedoch unter paralleler Last nicht denselben Durchsatz."

  - question: "Ist Ollama für produktive Inference‑Workloads geeignet?"
    answer: "Ollama eignet sich für Entwicklungsumgebungen und interne Tools mit geringer Parallelität. In den Tests skalierte es unter acht gleichzeitigen Request‑Streams nicht so effizient wie vLLM oder TGI. Für produktive APIs mit dauerhaftem Traffic ist ein auf Continuous Batching optimierter Server in der Regel effizienter."

  - question: "Wie viel kostet es, Llama-3.1-8B Inference auf einer RTX 4090 auszuführen?"
    answer: "Bei einer durchschnittlichen Mietrate von etwa 0,45 USD pro Stunde benötigte die Generierung von 500.000 Tokens mit vLLM rund 41 bis 42 Minuten Laufzeit und kostete ungefähr 0,31 USD. Mit Ollama dauerte derselbe Workload etwa 83 bis 84 Minuten und kostete ungefähr 0,63 USD. Die tatsächlichen Kosten variieren je nach Workload und Mietpreis."

  - question: "Welche Prompt‑ und Generierungseinstellungen wurden in diesem Benchmark verwendet?"
    answer: "Der Benchmark verwendete einen 512‑Token‑Input‑Prompt und generierte 128 Tokens pro Request mittels Greedy Decoding bei einer Temperatur von null. Alle Messungen wurden nach dem Warm‑up des Modells durchgeführt, mit acht parallelen Request‑Streams und ohne Speculative Decoding."

  - question: "Kann ich diesen RTX 4090 Inference‑Benchmark selbst reproduzieren?"
    answer: "Ja. Der Artikel enthält Hardware‑Spezifikationen, CUDA‑Version, Treiberversion, Decoding‑Parameter und Parallelitätskonfiguration. Wenn Sie Llama-3.1-8B in FP16 auf einer einzelnen RTX 4090 deployen und Prompt‑Länge sowie Parallelitätseinstellungen angleichen, können Sie vergleichbare Ergebnisse reproduzieren."
---

````

Das Ausführen eines eigenen Modells ist nur die halbe Gleichung.

Nach dem Fine‑Tuning – wie in unserem [Leitfaden für privates LLM‑Fine‑Tuning](/de/private-llm-fine-tuning-guide) beschrieben – ist die nächste Entscheidung operativ: Wie wird das Modell effizient bereitgestellt?

Inference bestimmt:

- Kosten pro Token
- Latenz unter Last
- Effizienz der GPU‑Auslastung
- Ob Consumer‑Hardware in Produktion tragfähig ist

Dieser Benchmark vergleicht drei weit verbreitete Inference‑Stacks:

- Ollama
- vLLM
- Hugging Face Text Generation Inference (TGI)

Das Ziel ist keine Präferenz.
Das Ziel ist Messung.

---

## Testumgebung

**Hardware**

- GPU: NVIDIA RTX 4090 (24GB VRAM)
- CPU: 16‑Core Consumer‑Prozessor der Ryzen‑Klasse
- RAM: 64GB DDR5
- Speicher: NVMe SSD
- CUDA: 12.1
- NVIDIA‑Treiber: 550+

**Modell**

- `meta-llama/Llama-3.1-8B`
- Präzision: FP16 (keine 4‑Bit‑Quantisierung)
- Kontextfenster: 4096 Tokens

**Benchmark‑Bedingungen**

- 512‑Token Input‑Prompt
- 128‑Token Output‑Generierung
- Greedy Decoding (temperature = 0)
- Kein Speculative Decoding
- Kein Tensor Parallelism
- Nur Warm‑Start (Modell vor Messung geladen)
- 8 parallele Request‑Streams (sofern unterstützt)

Alle Tests wurden auf einem sauberen System ohne Hintergrundlast durchgeführt.
Jeder Messwert entspricht dem Mittelwert aus fünf Durchläufen.

---

![Terminal mit strukturierten Inference‑Benchmark‑Metriken auf einer RTX 4090](../_images/rtx4090-inference-terminal-results.png)

---

# Ergebnisse

## 1. Ollama

Ollama priorisiert Einfachheit. Die Installation ist minimal, Modelle werden automatisch geladen.

```bash
ollama run llama3
````

Es gibt nur begrenzte Konfigurationsmöglichkeiten für Batching‑Verhalten oder Scheduling‑Strategien.

### Gemessene Performance (RTX 4090, FP16)

- **Single‑Stream‑Durchsatz:** 62–74 Tokens/sec
- **8‑Stream‑Durchsatz:** 95–108 Tokens/sec
- **First‑Token‑Latenz:** 720–980 ms
- **Beobachtete VRAM‑Nutzung:** 14–17GB

### Beobachtungen

- Die GPU‑Auslastung schwankte unter Parallelität.
- Die Skalierung war ab mehr als vier Streams nicht linear.
- Keine freigelegten Kontrollen für fortgeschrittene Batching‑Optimierung.

Ollama funktioniert zuverlässig für lokale Entwicklung und Dienste mit geringem Traffic. Unter dauerhaft paralleler Last wird die GPU jedoch nicht vollständig ausgelastet.

---

## 2. vLLM

vLLM ist auf Durchsatz optimiert. Die PagedAttention‑Implementierung verbessert die Effizienz des KV‑Caches bei parallelen Requests.

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

### Gemessene Performance (RTX 4090, FP16)

- **Single‑Stream‑Durchsatz:** 92–104 Tokens/sec
- **8‑Stream‑Durchsatz:** 185–215 Tokens/sec
- **First‑Token‑Latenz:** 360–480 ms
- **Beobachtete VRAM‑Nutzung:** 20–22GB

### Beobachtungen

- GPU‑Auslastung blieb unter Last über 95 %.
- Continuous Batching verbesserte die Skalierungseffizienz.
- Die Latenz blieb bei parallelen Streams stabil.

vLLM erreichte den höchsten nachhaltigen Durchsatz pro Mietstunde.

---

## 3. Hugging Face Text Generation Inference (TGI)

TGI ist ein containerisierter Inference‑Server für Produktionsumgebungen.

```bash
docker run --gpus all \
  -p 8080:80 \
  ghcr.io/huggingface/text-generation-inference:latest \
  --model-id meta-llama/Llama-3.1-8B
```

### Gemessene Performance (RTX 4090, FP16)

- **Single‑Stream‑Durchsatz:** 78–88 Tokens/sec
- **8‑Stream‑Durchsatz:** 150–176 Tokens/sec
- **First‑Token‑Latenz:** 510–690 ms
- **Beobachtete VRAM‑Nutzung:** 21–23GB

### Beobachtungen

- Performance war konsistent und vorhersehbar.
- Skalierung besser als bei Ollama, aber unter vLLM.
- Höherer operativer Overhead durch Container‑Runtime.

TGI bietet Produktionskontrollen und Monitoring, schöpft jedoch nicht den maximalen Durchsatz einer einzelnen 4090 aus.

---

![nvidia-smi Ausgabe mit GPU‑Auslastung während paralleler Inference](../_images/rtx4090-nvidia-smi-inference-load.png)

---

# Direkter Vergleich

| Stack  | Single Stream | 8 Streams   | First Token | VRAM    | GPU‑Sättigung |
| ------ | ------------- | ----------- | ----------- | ------- | ------------- |
| Ollama | 62–74 t/s     | 95–108 t/s  | 720–980ms   | 14–17GB | Teilweise     |
| TGI    | 78–88 t/s     | 150–176 t/s | 510–690ms   | 21–23GB | Hoch          |
| vLLM   | 92–104 t/s    | 185–215 t/s | 360–480ms   | 20–22GB | Sehr hoch     |

# Kostenauswirkungen auf dezentralen GPUs

Auf dezentralen Marktplätzen liegen die Mietpreise für eine RTX 4090 im Durchschnitt bei etwa 0,40–0,50 USD pro Stunde, abhängig von der Nachfrage. Eine detaillierte Aufschlüsselung finden Sie hier:

- [GPU‑Mietpreisvergleich 2026](/de/gpu-rental-pricing-comparison-2026)
- [Versteckte Gebühren bei der GPU‑Miete](/de/hidden-fees-in-gpu-rental)

Annahmen:

- 0,45 USD pro Stunde
- 500.000 generierte Tokens
- 8 parallele Streams

Unter Verwendung des gemessenen Median‑Durchsatzes:

**vLLM (~200 Tokens/sec)**  
500.000 / 200 = 2.500 Sekunden ≈ 41–42 Minuten  
Kosten ≈ 0,31 USD

**Ollama (~100 Tokens/sec)**  
500.000 / 100 = 5.000 Sekunden ≈ 83–84 Minuten  
Kosten ≈ 0,63 USD

Der Unterschied wirkt isoliert betrachtet gering.  
Im großen Maßstab summiert er sich.

Bei 50 Millionen Tokens pro Tag beeinflusst die Durchsatzeffizienz direkt die benötigte GPU‑Flottengröße und Mietdauer.

## Diesen Benchmark selbst durchführen

Wenn Sie diese Messungen ohne eigene Hardware reproduzieren möchten, sind RTX 4090‑Nodes in der Regel über den GPUFlow‑Marktplatz verfügbar.

Maschinen werden stundenweise vermietet und sind unmittelbar nach Wallet‑Verbindung zugänglich. Es gibt keine Account‑Freigaben, keine Enterprise‑Verträge und keine langen Provisionierungszeiten.

Verfügbare GPUs finden Sie unter [GPU Flow](https://gpuflow.app)

Da die Abrechnung stundenweise erfolgt, wirkt sich Inference‑Effizienz direkt auf die Kosten aus. Der Unterschied zwischen 100 Tokens/sec und 200 Tokens/sec wird bei dauerhafter Last wirtschaftlich relevant.

---

# Deployment‑Kontext

Wenn Sie dezentrale GPUs mieten – wie beschrieben in:

- [GPU ohne KYC mieten](/de/how-to-rent-gpu-without-kyc)
- [GPU mit Krypto mieten](/de/rent-gpu-with-crypto)
- [Smart‑Contract‑Escrow erklärt](/de/smart-contract-escrow)

– bestimmt die Inference‑Effizienz unmittelbar die Kapitaleffizienz.

Der Durchsatz beeinflusst:

- Dauer der Escrow‑Bindung
- Häufigkeit der Blockchain‑Abrechnung
- Exposition gegenüber Host‑Instabilität
- Operative Marge

Consumer‑GPUs bleiben für 7B–8B‑Modelle wirtschaftlich tragfähig, wenn sie mit effizienten Inference‑Stacks kombiniert werden.

---

# Wann welcher Stack sinnvoll ist

**Ollama**

- Interne Tools
- Geringe Parallelität
- Schnelles Prototyping

**TGI**

- Containerisierte Umgebungen
- Teams mit Bedarf an strukturiertem Logging
- Verwaltete Produktionsdeployments

**vLLM**

- API‑Services
- Hohe Parallelität
- Maximale Tokens pro Dollar

---

# Fazit

Auf einer einzelnen RTX 4090 mit Llama‑3.1‑8B in FP16:

- erzielte vLLM den höchsten nachhaltigen Durchsatz.
- bot TGI ausgewogene Performance mit Produktionskontrollen.
- priorisierte Ollama Einfachheit gegenüber maximaler GPU‑Auslastung.

Die Wahl des Inference‑Stacks ist nicht kosmetisch.  
Sie definiert Kostenstruktur und Skalierungsverhalten.

Für Workloads auf dezentralen Consumer‑GPUs beeinflusst Batching‑Effizienz die Wirtschaftlichkeit unmittelbar.

# Wo dies produktiv betrieben werden kann

Alle Benchmarks in diesem Artikel wurden auf gemieteter Consumer‑Hardware und nicht auf eigener Infrastruktur durchgeführt.

Wenn Sie sofortigen Zugriff auf RTX 4090, RTX 3090 oder GPUs mit höherem Speicher für Inference oder Fine‑Tuning benötigen, sind entsprechende Nodes über [GPU Flow](https://gpuflow.app) verfügbar.

## Abrechnung stundenweise. Zahlung per Stablecoin. Zugriff unmittelbar nach Wallet‑Verbindung.

### Verwandte Ressourcen

**Vertiefen Sie Ihr Deployment‑Know‑how:**

- [Der umfassende Leitfaden für privates LLM‑Fine‑Tuning auf dezentralen GPUs](/de/private-llm-fine-tuning-guide) — Vollständige Anleitung zum sicheren Training von Open‑Weights‑Modellen
- [GPU‑Mietpreisvergleich 2026](/de/gpu-rental-pricing-comparison-2026) — Gemessene Kostenunterschiede zwischen großen GPU‑Mietplattformen
- [Versteckte Gebühren bei der GPU‑Miete](/de/hidden-fees-in-gpu-rental) — Was Stundentarif‑Seiten nicht offenlegen
- [RunPod vs. Vast.ai Vergleich](/de/runpod-vs-vastapi-comparison) — Unterschiede zwischen zentralisierter Infrastruktur und Marktplatz‑Modellen
