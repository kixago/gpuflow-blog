---
title: "Ollama vs. vLLM vs. TGI auf der RTX 4090: Was Benchmarks zeigen"
description: "Ollama, vLLM und Hugging Face TGI für ein 8B-Modell auf der RTX 4090: belegter Durchsatz unter Last, VRAM, Quantisierung, OpenAI-APIs und der Wartungsstatus von TGI."
excerpt: "Bei einer Anfrage nach der anderen sind die Engines auf einer RTX 4090 etwa gleich schnell. Bei vielen Nutzern gleichzeitig zieht vLLM weit davon. TGI ist inzwischen im Wartungsmodus. Veröffentlichte Zahlen, Quellen und eine Empfehlung."
pubDate: 2026-02-25
updatedDate: 2026-09-30
locale: "de"
category: "benchmarks"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/rtx4090-inference-benchmark-hero.png"
heroImageAlt: "Inferenz-Benchmark einer RTX 4090 im Terminal mit Leistungskennzahlen"
faq:
  - question: "Ist vLLM auf einer RTX 4090 schneller als Ollama?"
    answer: "Nur wenn viele Anfragen gleichzeitig laufen. In einem Test von ComputingForGeeks vom September 2026 mit Qwen2.5-7B in 4 Bit erzeugten beide auf einer RTX 4090 bei einer einzelnen Anfrage etwa 174 Tokens pro Sekunde. Bei 64 gleichzeitigen Anfragen kam vLLM auf insgesamt 6.623 Tokens pro Sekunde, Ollama auf 2.018."
  - question: "Wird Hugging Face TGI noch gepflegt?"
    answer: "Nur noch minimal. Laut TGI-Doku befindet es sich im Wartungsmodus und nimmt nur noch kleine Fehlerkorrekturen und Änderungen an der Dokumentation an, und das GitHub-Repository wurde am 21. März 2026 archiviert und schreibgeschützt. Hugging Face empfiehlt stattdessen vLLM oder SGLang, für den lokalen Einsatz llama.cpp und MLX."
  - question: "Wie viel VRAM braucht vLLM für ein 8B-Modell?"
    answer: "Standardmäßig belegt vLLM 90 % des GPU-Speichers (gpu-memory-utilization 0.9), auf einer RTX 4090 mit 24 GB also etwa 21,6 GB, unabhängig von der Modellgröße. Was die Gewichte nicht brauchen, wird KV-Cache für gleichzeitige Anfragen."
  - question: "Kann Ollama mehrere Nutzer gleichzeitig bedienen?"
    answer: "Ja, aber standardmäßig bearbeitet es eine Anfrage pro Modell auf einmal (OLLAMA_NUM_PARALLEL=1). Sie können den Wert erhöhen, und jeder parallele Slot belegt eigenen Kontextspeicher. Veröffentlichte Benchmarks zeigen, dass Ollama bei hoher Parallelität schlechter skaliert als vLLM."
  - question: "Haben Ollama, vLLM und TGI OpenAI-kompatible APIs?"
    answer: "Ja. Alle drei stellen /v1/chat/completions bereit. Ollama und vLLM bieten außerdem Completions, Embeddings und die Responses API; die OpenAI-kompatible Messages API von TGI gibt es seit Version 1.4.0."
  - question: "Kann ich Llama 3.1 8B in FP16 auf einer GPU mit 24 GB betreiben?"
    answer: "Ja. 8,03 Milliarden Parameter zu je 2 Byte ergeben etwa 16,1 GB Gewichte. Das passt auf 24 GB, mit Platz für einen moderaten KV-Cache. Die meisten, die auf einer einzelnen Consumer-Karte ausliefern, nutzen 4- oder 8-Bit-Gewichte, um mehr Platz für Kontext und gleichzeitige Nutzer zu lassen."
---

Auf einer einzelnen RTX 4090 mit einem 7B- bis 8B-Modell sind Ollama und vLLM bei einer Anfrage nach der anderen etwa gleich schnell. Der Abstand entsteht, wenn viele Anfragen zusammen ankommen: In einem veröffentlichten Test vom September 2026 mit 64 gleichzeitigen Anfragen lieferte vLLM etwa den dreifachen Gesamtdurchsatz von Ollama. Hugging Face TGI funktioniert weiterhin, ist aber im Wartungsmodus, seit das Repository im März 2026 archiviert wurde, und Hugging Face selbst verweist inzwischen auf vLLM und SGLang.

Die Wahl hängt also davon ab, wie viele gleichzeitig auf das Modell zugreifen. Ein Nutzer, ein Skript oder ein kleines internes Tool: Ollama, weil es am wenigsten Arbeit macht. Eine öffentliche API oder Batch-Jobs mit vielen Anfragen gleichzeitig: vLLM. Ein neues Deployment auf TGI: Würde ich nicht mehr anfangen.

## Woher die Zahlen kommen

Eine frühere Version dieser Seite zeigte Werte für Durchsatz, Latenz und VRAM, die als unsere eigenen Messungen auf einer RTX 4090 ausgegeben wurden. Wir konnten sie weder auf einen reproduzierbaren Lauf noch auf eine veröffentlichte Quelle zurückführen und haben sie deshalb entfernt. Ein Grund für Zweifel: Die alten FP16-Werte für einen einzelnen Stream lagen über dem, was die Speicherbandbreite einer RTX 4090 zulässt (siehe nächster Abschnitt).

Jede Zahl unten ist jetzt der Quelle zugeordnet, die sie veröffentlicht hat, mit der verwendeten Hardware und dem Modell. Wo niemand einen sauberen Vergleich auf der RTX 4090 veröffentlicht hat (etwa für TGI), sage ich das, statt die Lücke zu füllen.

Die wichtigsten Quellen:

- **ComputingForGeeks, 18. September 2026.** Ollama, vLLM und llama.cpp auf RTX 4090, L40S und RTX 5090. Modell: Qwen2.5-7B-Instruct, AWQ 4 Bit für vLLM und GGUF Q4_K_M für Ollama und llama.cpp. Fester Prompt mit 512 Tokens, Temperatur 0, bis zu 256 Ausgabe-Tokens, 4.096 Tokens Kontext pro Slot, 64 parallele Slots.
- **Red Hat Developer, 8. August 2025.** Ollama 0.9.2 vs. vLLM 0.9.1 auf einer A100 40 GB, Llama 3.1 8B Instruct in FP16, 1 bis 256 gleichzeitige Nutzer, gemessen mit GuideLLM.
- **BentoML, 5. Juni 2024.** vLLM 0.4.2, TGI 2.0.4 und andere auf einer A100 80 GB mit Llama 3 8B Instruct.
- **CUDA-Scoreboard von llama.cpp.** Geschwindigkeit bei einem einzelnen Stream für Llama 2 7B Q4_0 auf vielen Karten, darunter die RTX 4090.

Nur die erste Quelle lief auf einer RTX 4090 mit allen Engines, um die es hier geht, außer TGI. Die anderen zeigen dasselbe Muster auf Rechenzentrumskarten.

## Eine Anfrage: Die Karte setzt die Obergrenze

Wenn eine GPU Tokens für eine einzelne Anfrage erzeugt, muss sie für jedes Token alle Gewichte des Modells aus dem Speicher lesen. Die Obergrenze setzt also die Speicherbandbreite, nicht die Engine.

Die RTX 4090 hat 24 GB GDDR6X mit 1.008 GB/s. Llama 3.1 8B hat 8,03 Milliarden Parameter.

- In FP16 sind das 8,03 × 2 Byte ≈ 16,1 GB Gewichte. 1.008 ÷ 16,1 ≈ **63 Tokens pro Sekunde**, höchstens, für eine Anfrage.
- Der Standard-Tag `llama3.1:8b` von Ollama ist Q4_K_M, ein Download von 4,9 GB. 1.008 ÷ 4,9 ≈ **205 Tokens pro Sekunde**, höchstens.

Echte Engines bleiben unter diesen Obergrenzen. Das Scoreboard von llama.cpp zeigt eine RTX 4090 mit 186 Tokens pro Sekunde bei Llama 2 7B in Q4_0 (189 mit Flash Attention). ComputingForGeeks hat für eine einzelne Anfrage mit Qwen2.5-7B in 4 Bit etwa 174 Tokens pro Sekunde gemessen und vLLM, llama.cpp und Ollama auf der 4090 als „ungefähr“ gleich schnell eingestuft. (Auf der L40S und der RTX 5090 decodierte ihr Ollama-Build mit etwa der halben Geschwindigkeit von llama.cpp. Prüfen Sie also Ihre Karte und Version.)

Für einen Nutzer nach dem anderen wählen Sie die Engine nach Bequemlichkeit und die Quantisierung nach Geschwindigkeit. Von FP16 auf 4 Bit zu gehen verdreifacht die Obergrenze ungefähr. Ein Wechsel der Engine bewegt sie kaum.

## Viele Anfragen: Batching entscheidet

Sind viele Anfragen gleichzeitig in Arbeit, kann die GPU die Gewichte einmal lesen und für einen ganzen Batch von Anfragen verwenden. Wie gut eine Engine Batches bildet und wie sie den KV-Cache verwaltet (den Speicher pro Anfrage für die bisherige Unterhaltung), ist jetzt das, was zählt.

<figure>
<svg viewBox="0 0 720 310" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">Balkendiagramm des Gesamtdurchsatzes auf einer RTX 4090 bei 64 gleichzeitigen Anfragen: vLLM 6.623, llama.cpp 2.391, Ollama 2.018 Tokens pro Sekunde</title>
<text x="160" y="63" text-anchor="end" fill="#1e1b4b">vLLM (AWQ)</text>
<rect x="170" y="40" width="454" height="36" fill="#6366f1"/>
<text x="632" y="63" fill="#1e1b4b">6.623</text>
<text x="160" y="123" text-anchor="end" fill="#1e1b4b">llama.cpp</text>
<rect x="170" y="100" width="164" height="36" fill="#a5b4fc"/>
<text x="342" y="123" fill="#1e1b4b">2.391</text>
<text x="160" y="183" text-anchor="end" fill="#1e1b4b">Ollama</text>
<rect x="170" y="160" width="138" height="36" fill="#a5b4fc"/>
<text x="316" y="183" fill="#1e1b4b">2.018</text>
<line x1="170" y1="210" x2="650" y2="210" stroke="#64748b" stroke-width="1.5"/>
<line x1="170" y1="30" x2="170" y2="210" stroke="#64748b" stroke-width="1.5"/>
<line x1="307" y1="210" x2="307" y2="216" stroke="#64748b" stroke-width="1.5"/>
<line x1="444" y1="210" x2="444" y2="216" stroke="#64748b" stroke-width="1.5"/>
<line x1="581" y1="210" x2="581" y2="216" stroke="#64748b" stroke-width="1.5"/>
<text x="170" y="232" text-anchor="middle" fill="#64748b" font-size="13">0</text>
<text x="307" y="232" text-anchor="middle" fill="#64748b" font-size="13">2.000</text>
<text x="444" y="232" text-anchor="middle" fill="#64748b" font-size="13">4.000</text>
<text x="581" y="232" text-anchor="middle" fill="#64748b" font-size="13">6.000</text>
<text x="410" y="256" text-anchor="middle" fill="#64748b" font-size="13">Ausgabe-Tokens pro Sekunde insgesamt, 64 Anfragen gleichzeitig</text>
<text x="360" y="290" text-anchor="middle" fill="#1e1b4b" font-size="14">Einzelne Anfrage: etwa 174 Tokens pro Sekunde bei allen dreien</text>
</svg>
<figcaption>RTX 4090, Qwen2.5-7B-Instruct in 4 Bit (AWQ für vLLM, GGUF Q4_K_M für die anderen), 64 gleichzeitige Anfragen. Zahlen von ComputingForGeeks, September 2026; Balken maßstabsgetreu. TGI war nicht Teil dieses Tests.</figcaption>
</figure>

Auf der RTX 4090 lieferte vLLM über 64 Anfragen insgesamt 6.623 Tokens pro Sekunde, der Server von llama.cpp 2.391 und Ollama 2.018. Ollama war dafür fair konfiguriert: `OLLAMA_NUM_PARALLEL=64`, `num_ctx 4096` und Flash Attention aktiv. vLLM lief mit `--quantization awq_marlin --max-model-len 4096 --gpu-memory-utilization 0.90`. Die Autoren meldeten außerdem eine Zeit bis zum ersten Token von etwa 8 bis 12 ms für llama.cpp und 16 bis 25 ms für vLLM; Ollama lag auf der L40S und der RTX 5090 am höchsten.

Der A100-Test von Red Hat zeigt mit FP16-Gewichten in dieselbe Richtung. vLLM erreichte in der Spitze 793 Tokens pro Sekunde, Ollama mit Standardeinstellungen 41. Auch nachdem das Parallelitätslimit von Ollama auf 32 angehoben wurde, „den höchsten stabilen Wert“, kam es auf keiner Lastebene an vLLM heran. Seine Zeit bis zum ersten Token „stieg mit mehr Nutzern dramatisch an“, und die Latenz zwischen den Tokens zeigte bei Spitzenlast „massive Ausschläge“.

Zwei Vorbehalte, bevor Sie diese Zahlen jemandem weitergeben. Erstens ist der Vergleich von ComputingForGeeks nicht ganz gleichwertig: vLLM lief mit AWQ-Gewichten, die anderen mit GGUF, und die Builds unterscheiden sich. Zweitens sind das Summen über alle Anfragen. Jeder der 64 Nutzer sieht bei vLLM etwa 6.623 ÷ 64 ≈ 103 Tokens pro Sekunde, was immer noch sehr brauchbar ist, und bei Ollama etwa 2.018 ÷ 64 ≈ 32.

## Wo TGI steht

Text Generation Inference war der Produktivserver von Hugging Face, mit Continuous Batching, Flash Attention und Paged Attention, Tensor-Parallelismus, Prometheus-Metriken und OpenTelemetry-Tracing. Technisch spielte es in derselben Liga wie vLLM.

Sein Status hat sich geändert. Die TGI-Doku beginnt jetzt mit: „text-generation-inference ist jetzt im Wartungsmodus. Künftig nehmen wir Pull Requests für kleinere Fehlerkorrekturen, Verbesserungen der Dokumentation und leichte Wartungsaufgaben an.“ Empfohlen werden „vllm, SGLang sowie lokale Engines mit Interkompatibilität wie llama.cpp oder MLX“. Das GitHub-Repository wurde am 21. März 2026 archiviert und schreibgeschützt.

Einen aktuellen veröffentlichten Benchmark von TGI auf einer RTX 4090 habe ich nicht gefunden. Der nächstliegende seriöse Vergleich ist der von BentoML auf einer A100 80 GB vom Juni 2024: Mit Llama 3 8B erreichte vLLM „2300–2500 Tokens pro Sekunde, ähnlich wie TGI“, und vLLM hatte auf jeder getesteten Lastebene die beste Zeit bis zum ersten Token. Das ist zwei Jahre und viele Releases beider Engines her. Betrachten Sie es als Geschichte.

Wenn TGI bereits Ihren Produktivverkehr bedient, wird es weiter funktionieren. Für ein neues Deployment würden Sie einen Server wählen, der keine neuen Modellarchitekturen und keine Performance-Arbeit mehr bekommt. Auf einer RTX 4090 deckt vLLM alles ab, was TGI konnte.

## VRAM auf einer 24-GB-Karte

Die Engines gehen sehr unterschiedlich mit Speicher um, und das bestimmt, was sich die Karte sonst noch teilen kann.

**vLLM nimmt sich den Großteil der Karte gleich zu Beginn.** Der Standardwert von `--gpu-memory-utilization` ist 0.9. Auf einer RTX 4090 mit 24 GB belegt es beim Start also etwa 21,6 GB, egal wie groß das Modell ist. Alles, was die Gewichte nicht brauchen, wird KV-Cache. Mit Llama 3.1 8B in FP16 (etwa 16,1 GB) bleiben rund 5,5 GB für KV-Cache, Aktivierungen und CUDA-Graphen. Das begrenzt die Kontextlänge und die Zahl der Anfragen, die gleichzeitig hineinpassen. Mit 4-Bit-AWQ-Gewichten (der Build von ComputingForGeeks hatte etwa 5,6 GB) gehen die meisten der 21,6 GB an den KV-Cache; so hält es 64 Anfragen am Laufen. Erwarten Sie nicht, daneben ein zweites GPU-Programm betreiben zu können, außer Sie senken diesen Anteil.

**Ollama belegt Speicher pro Modell und pro Kontext.** Ein `llama3.1:8b`-Modell in Q4_K_M hat 4,9 GB, plus KV-Cache für sein Kontextfenster. Ollama wählt den Standardkontext nach Ihrem VRAM: 4k unter 24 GiB, 32k von 24 bis 48 GiB, 256k ab 48 GiB. Eine RTX 4090 liegt genau an der Grenze von 24 GiB (nvidia-smi meldet etwas weniger als 24 GiB). Prüfen Sie also mit `ollama ps`, welchen Kontext Sie tatsächlich bekommen haben, oder legen Sie ihn selbst fest. Parallele Slots vervielfachen das: Das Beispiel aus der Doku ist, dass „ein 2K-Kontext mit 4 parallelen Anfragen einen 8K-Kontext und zusätzlichen Speicherbedarf ergibt“. Wenn der Speicher knapp ist, hilft die Quantisierung des KV-Cache: `q8_0` braucht etwa halb so viel Speicher wie das Standardformat `f16`, `q4_0` etwa ein Viertel. Ollama kann außerdem standardmäßig bis zu drei Modelle pro GPU geladen halten, sofern sie passen. Das passt gut zu einer Karte, die zwischen Modellen wechselt. Welche Modelle überhaupt auf Karten mit 8, 12, 16 und 24 GB passen, steht in [Welche KI-Modelle passen auf Ihre GPU?](/de/which-ai-models-fit-your-gpu-vram/).

**TGI** reserviert für Continuous Batching ebenfalls vorab, wie vLLM. Einen aktuellen, zitierfähigen VRAM-Wert für ein 8B-Modell auf einer 4090 habe ich nicht gefunden, also nenne ich keinen.

## Quantisierung und Modellformate

| | Ollama | vLLM | TGI |
| --- | --- | --- | --- |
| **Hauptformat** | GGUF (z. B. Q4_K_M) | Hugging Face safetensors | Hugging Face safetensors |
| **4-Bit-Optionen** | GGUF-Q4-Varianten | AWQ, GPTQ, bitsandbytes, INT4 W4A16 | AWQ, GPTQ, Marlin, EXL2, bitsandbytes NF4/FP4 |
| **8 Bit / FP8** | GGUF Q8_0 | FP8 W8A8 auf Ada (RTX 4090) und Hopper; INT8 | bitsandbytes 8 Bit, EETQ, fp8 |
| **GGUF** | Nativ | Unterstützt | Nicht aufgeführt |
| **Quantisierung des KV-Cache** | q8_0, q4_0 | Ja | Hier nicht behandelt |

Die RTX 4090 ist eine Ada-Karte (SM 8.9), also funktioniert der FP8-Pfad von vLLM auf ihr. FP8-Gewichte brauchen halb so viel Speicher wie FP16: etwa 8 GB für ein 8B-Modell, ein Mittelweg zwischen FP16 und 4 Bit auf einer 4090.

Die Modellbibliothek von Ollama liefert vorquantisierte GGUF-Tags, Sie müssen also selten darüber nachdenken: `ollama pull llama3.1:8b` bringt Ihnen Q4_K_M. Bei vLLM wählen Sie einen vorquantisierten Checkpoint von Hugging Face oder übergeben selbst ein Quantisierungs-Flag.

## OpenAI-kompatible Server und Einrichtung

Alle drei bieten eine HTTP-API im OpenAI-Stil. Die OpenAI-SDKs und die meisten Chat-Tools funktionieren also, wenn Sie die Basis-URL ändern.

| | Ollama | vLLM | TGI |
| --- | --- | --- | --- |
| **Standardadresse** | `localhost:11434/v1` | `localhost:8000/v1` | Container-Port 80 (oft auf 8080 gemappt) |
| **Chat Completions** | Ja | Ja | Ja (Messages API, seit 1.4.0) |
| **Weitere OpenAI-Endpunkte** | completions, models, embeddings, responses | completions, embeddings, responses, audio | Hier nicht behandelt |
| **Installation** | Ein Skript | pip-Paket | Docker-Image |

Ein 8B-Modell zum Laufen bringen, laut Doku des jeweiligen Projekts:

```bash
# Ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.1:8b

# vLLM (Llama 3.1 is gated: accept the license on Hugging Face and set HF_TOKEN)
pip install vllm
vllm serve meta-llama/Llama-3.1-8B-Instruct

# TGI
docker run --gpus all --shm-size 1g -p 8080:80 -v $PWD/data:/data \
  ghcr.io/huggingface/text-generation-inference:3.3.5 \
  --model-id meta-llama/Llama-3.1-8B-Instruct
```

Ollama macht mit Abstand am wenigsten Arbeit. Es kümmert sich um Downloads, quantisierte Dateien, Laden und Entladen und funktioniert auf einem Laptop genauso wie auf einem gemieteten Server. Die OpenAI-Schicht von Ollama hat Lücken: kein `logprobs` und kein `tool_choice` bei Chat Completions, und Bilder müssen als Base64 kommen, nicht als URL. vLLM braucht eine funktionierende CUDA- und Python-Umgebung und mehr Flags zum Feintuning, ist aber die Engine, die Hugging Face jetzt anstelle von TGI empfiehlt. TGI ist einfach, wenn Sie ohnehin Docker betreiben, mit dem Wartungsvorbehalt von oben.

## Welche Engine für welchen Job

**Ollama** für eine Person, ein Skript, einen Coding-Assistenten, ein internes Tool mit einer Handvoll Nutzern oder eine Maschine, die zwischen mehreren Modellen wechselt. Die Einrichtung dauert Minuten, und die Geschwindigkeit bei einer einzelnen Anfrage ist auf einer 4090 so gut wie bei jeder anderen Engine.

**vLLM**, wenn viele Anfragen gleichzeitig ankommen: eine öffentliche API, ein Chat-Produkt für viele Nutzer oder Batch-Jobs, die Sie mit 32 oder 64 Anfragen gleichzeitig laufen lassen können. Die veröffentlichten Zahlen zeigen auf einer RTX 4090 bei 64 gleichzeitigen Anfragen etwa den dreifachen Gesamtdurchsatz von Ollama, auf einer A100 weit mehr. vLLM hat außerdem die breiteste Unterstützung für Quantisierung und APIs.

**TGI** nur, wenn Sie es schon betreiben. Für neue Projekte rät Hugging Face selbst zu vLLM oder SGLang.

Wenn Sie stundenweise mieten, folgen die Kosten aus dem Durchsatz. Nehmen wir eine Million Ausgabe-Tokens auf einer RTX 4090 zu 0,31 $ pro Stunde, dem günstigsten On-Demand-Preis auf Vast.ai, den getdeploying.com im September 2026 gelistet hat, mit den Zahlen von ComputingForGeeks:

- Eine Anfrage nach der anderen, 174 Tokens/s: 1.000.000 ÷ 174 ≈ 5.750 s ≈ 1,6 Stunden ≈ **0,50 $**.
- 64 gleichzeitig auf Ollama, 2.018 Tokens/s: ≈ 496 s ≈ **0,04 $**.
- 64 gleichzeitig auf vLLM, 6.623 Tokens/s: ≈ 151 s ≈ **0,01 $**.

Das setzt voraus, dass die GPU die ganze Zeit beschäftigt ist. Wenn Sie immer nur eine Anfrage gleichzeitig haben, bringt Batching nichts, und die Wahl der Engine ändert Ihre Rechnung nicht. Wenn Sie eine Warteschlange voller Arbeit haben, ändert sie die Rechnung um eine Größenordnung. Dieselbe Logik im Vergleich zu APIs mit Abrechnung pro Token finden Sie in [GPU pro Stunde oder API pro Token?](/de/hourly-gpu-vs-per-token-api/).

## Wo GPUFlow einzuordnen ist

Der Installer für GPUFlow-Anbieter richtet standardmäßig Ollama ein, und der GPUFlow-Agent leitet Anfragen daran weiter. Dort gilt also meist die Ollama-Spalte von oben. Sie mieten einen OpenAI-kompatiblen API-Schlüssel (`https://gpuflow.app/v1`, mit `/v1/chat/completions` und `/v1/models`, Streaming wird unterstützt) für ein Modell auf der GPU des Anbieters. Sie zahlen für Zeit, sekundengenau mit 1 Minute Mindestdauer, nicht pro Token.

Was Sie auf GPUFlow nicht können: die Engine wählen, ihre Einstellungen ändern oder eigenen Code ausführen. Es gibt kein SSH und keine Shell. Um die Benchmarks oben nachzustellen oder vLLM selbst zu betreiben, mieten Sie eine Maschine, auf der Sie sich einloggen können, auf Vast.ai oder RunPod ([wie sie sich unterscheiden](/de/runpod-vs-vastapi-comparison/)). Um ein von Ollama bereitgestelltes Modell aus einer App zu nutzen, ohne etwas zu installieren, sehen Sie sich den [GPUFlow-Marktplatz](https://gpuflow.app/de/marketplace) an und lesen Sie, [wie Sie den Schlüssel in gängigen Tools verwenden](/de/use-openai-compatible-api-key-in-apps/).

Wenn Sie Ihr eigenes Modell feinabgestimmt haben und entscheiden, wie Sie es ausliefern, behandelt der [Leitfaden zum LLM-Fine-Tuning mit privaten Daten](/de/private-llm-fine-tuning-guide/) den Schritt davor.

## Quellen

Alle geprüft im September 2026.

- Ollama vs. vLLM vs. llama.cpp auf RTX 4090, L40S und RTX 5090: [ComputingForGeeks](https://computingforgeeks.com/ollama-vs-vllm-vs-llama-cpp/) (18. September 2026)
- Ollama vs. vLLM auf A100 40 GB: [Red Hat Developer](https://developers.redhat.com/articles/2025/08/08/ollama-vs-vllm-deep-dive-performance-benchmarking) (8. August 2025)
- vLLM, TGI und andere auf A100 80 GB: [BentoML, Benchmarking LLM Inference Backends](https://www.bentoml.com/blog/benchmarking-llm-inference-backends) (5. Juni 2024)
- CUDA-Scoreboard von llama.cpp: [github.com/ggml-org/llama.cpp/discussions/15013](https://github.com/ggml-org/llama.cpp/discussions/15013)
- Speicher und Bandbreite der RTX 4090: [Test von TechPowerUp](https://www.techpowerup.com/review/nvidia-geforce-rtx-4090-founders-edition/)
- Parameter und Lizenz von Llama 3.1 8B: [Model Card auf Hugging Face](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
- Ollama: [FAQ (parallele Anfragen, KV-Cache)](https://docs.ollama.com/faq), [Kontextlänge](https://docs.ollama.com/context-length), [OpenAI-Kompatibilität](https://docs.ollama.com/api/openai-compatibility), [Tag llama3.1:8b](https://ollama.com/library/llama3.1:8b)
- vLLM: [OpenAI-kompatibler Server](https://docs.vllm.ai/en/latest/serving/online_serving/openai_compatible_server/), [Quantisierung](https://docs.vllm.ai/en/latest/features/quantization/index.html), [Engine-Argumente (gpu-memory-utilization)](https://docs.vllm.ai/en/v0.6.4/models/engine_args.html)
- TGI: [Doku und Hinweis zum Wartungsmodus](https://huggingface.co/docs/text-generation-inference/en/index), [GitHub-Repository (archiviert)](https://github.com/huggingface/text-generation-inference), [Messages API](https://huggingface.co/docs/text-generation-inference/en/messages_api), [Quantisierung](https://huggingface.co/docs/text-generation-inference/en/conceptual/quantization)
- Mietpreis der RTX 4090: [getdeploying.com](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090)
- GPUFlow: [API-Schnellstart](https://docs.gpuflow.app/de/renters/api-quickstart/), [Erste Schritte für Anbieter](https://docs.gpuflow.app/de/providers/getting-started/)
