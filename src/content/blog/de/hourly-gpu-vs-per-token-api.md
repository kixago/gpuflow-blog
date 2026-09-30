---
title: "GPU pro Stunde oder API pro Token? Was ein 7B–8B-Modell wirklich kostet"
description: "Ein nüchterner Kostenvergleich: eine Consumer-GPU stundenweise mieten oder eine KI-API pro Token bezahlen. Mit aktuellen Preisen, gemessenen Geschwindigkeiten und einem Rechenbeispiel mit 1.000 Anfragen."
excerpt: "Token-APIs und stundenweise gemietete GPUs werden in unterschiedlichen Einheiten abgerechnet. Wir rechnen beides auf denselben Job um und zeigen, wann was günstiger ist."
pubDate: 2026-09-29
locale: "de"
category: "comparisons"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/hourly-gpu-vs-per-token-api-hero.png"
heroImageAlt: "Diagramm mit einer flachen Linie für Stundenpreise und einer steigenden Linie für Token-Preise"
faq:
  - question: "Ist eine stundenweise gemietete GPU günstiger als eine API mit Abrechnung pro Token?"
    answer: "Das hängt davon ab, womit Sie vergleichen. Für beliebte offene Modelle wie Llama 3.1 8B sind gehostete Token-APIs günstiger: DeepInfra berechnet 0,02 $ pro Million Input-Tokens und 0,04 $ pro Million Output-Tokens. Im Vergleich zu gpt-5-mini (2,00 $ pro Million Output-Tokens) oder Claude Haiku 4.5 (5,00 $) kostet jede gemietete RTX 3060 bis RTX 5090 mit einem offenen 7B–8B-Modell weniger pro Token, sofern sie ausgelastet ist. Gegenüber gpt-4o-mini (0,60 $) liegen nur die günstigeren Karten wie die RTX 3060 klar vorn."
  - question: "Wie viele Tokens pro Sekunde erzeugt eine RTX 4090 mit einem 8B-Modell?"
    answer: "Hardware Corner hat auf einer RTX 4090 mit Qwen3 8B in 4-Bit-Quantisierung und 16K Kontext 104 Tokens pro Sekunde gemessen, bei jeweils einer Anfrage. Das llama.cpp-Scoreboard zeigt 186 Tokens pro Sekunde für das kleinere Llama 2 7B in Q4_0 mit kurzem Kontext."
  - question: "Was kostet eine Million Output-Tokens auf einer gemieteten RTX 4090?"
    answer: "Bei 0,35 $ pro Stunde und etwa 104 Tokens pro Sekunde entstehen in einer Stunde rund 376.000 Tokens. Eine Million Output-Tokens kostet also etwa 0,93 $ GPU-Zeit. Das Einlesen des Prompts geht viel schneller als das Schreiben der Antwort, deshalb fallen Input-Tokens kaum ins Gewicht."
  - question: "Wann lohnt sich eine stundenweise gemietete GPU mehr als eine API?"
    answer: "Wenn das gewünschte Modell nicht pro Token angeboten wird (Ihr eigenes feinabgestimmtes Modell, ein Community-Modell, eine bestimmte Quantisierung), wenn Sie feste Kosten pro Stunde statt einer Abrechnung nach Tokens wollen oder wenn Sie mit einem geschlossenen Modell vergleichen, das 2 $ oder mehr pro Million Output-Tokens kostet."
---

Für ein kleines offenes KI-Modell wie Llama 3.1 8B oder Qwen 2.5 7B gibt es zwei gängige Bezahlmodelle:

- **Pro Token:** Ein Unternehmen hostet das Modell und berechnet jedes Token, das Sie senden und empfangen.
- **Pro Stunde:** Sie mieten eine GPU, auf der das Modell läuft, und bezahlen die Zeit, egal wie viele Tokens Sie verbrauchen.

Die Preise wirken unvergleichbar: „0,04 $ pro Million Tokens“ auf der einen Seite, „0,35 $ pro Stunde“ auf der anderen. Dieser Artikel rechnet beides in dieselbe Einheit um und spielt einen realistischen Job durch. Alle Preise wurden im September 2026 geprüft; die Quellen stehen am Ende.

## Schritt 1: Wie schnell schreibt eine Consumer-GPU?

Entscheidend ist, wie viele Tokens pro Sekunde die GPU für eine einzelne Anfrage erzeugt. Wir verwenden die Messungen von Hardware Corner. Getestet wurde dort Qwen3 8B in 4-Bit-Quantisierung (Q4_K_XL) mit 16K Kontext in llama.cpp, derselben Engine, auf der auch Ollama aufbaut.

| GPU | Tokens pro Sekunde (eine Anfrage) | Tokens pro Stunde |
| --- | --- | --- |
| RTX 3060 12 GB | 42 | etwa 151.000 |
| RTX 3090 | 87 | etwa 315.000 |
| RTX 4090 | 104 | etwa 376.000 |
| RTX 5090 | 145 | etwa 523.000 |

Kurze Prompts laufen schneller. Das Scoreboard des llama.cpp-Projekts zeigt mit dem kleineren Llama 2 7B in Q4_0 und kurzem Kontext 76, 158, 186 und 290 Tokens pro Sekunde für dieselben vier Karten. Wir rechnen mit den niedrigeren, realistischeren Werten.

Das Einlesen des Prompts geht viel schneller als das Schreiben der Antwort. Laut demselben Scoreboard verarbeitet eine RTX 3060 Prompts mit etwa 2.100 Tokens pro Sekunde, eine RTX 4090 mit etwa 12.000. Auf einer stundenweise gemieteten GPU kosten lange Prompts also kaum zusätzliche Zeit.

## Schritt 2: Stundenpreis in einen Preis pro Million Tokens umrechnen

Teilen Sie den Stundenpreis durch die Tokens pro Stunde. Wir verwenden typische On-Demand-Preise von GPU-Vermietungsseiten im September 2026:

| GPU | Preis pro Stunde | Kosten pro 1 Million Output-Tokens bei voller Auslastung |
| --- | --- | --- |
| RTX 3060 12 GB | 0,06 $ | etwa 0,40 $ |
| RTX 3090 | 0,20 $ | etwa 0,64 $ |
| RTX 4090 | 0,35 $ | etwa 0,93 $ |
| RTX 5090 | 0,55 $ | etwa 1,05 $ |

Der wichtige Teil ist „bei voller Auslastung“. Diese Zahlen setzen voraus, dass die GPU die ganze Stunde lang schreibt. Steht sie die Hälfte der Zeit still, verdoppeln sich die Kosten pro Token.

## Schritt 3: Was Token-APIs berechnen

Preise pro Million Tokens, Input / Output:

| Modell | Anbieter | Input | Output |
| --- | --- | --- | --- |
| Llama 3.1 8B Instruct Turbo | DeepInfra | 0,02 $ | 0,04 $ |
| Gemma 3 12B | DeepInfra | 0,05 $ | 0,15 $ |
| Qwen3.5 9B | DeepInfra | 0,10 $ | 0,15 $ |
| gpt-4o-mini | OpenAI | 0,15 $ | 0,60 $ |
| gpt-5-mini | OpenAI | 0,25 $ | 2,00 $ |
| Claude Haiku 4.5 | Anthropic | 1,00 $ | 5,00 $ |

Zwei Dinge fallen auf. Gehostete offene Modelle sind sehr günstig. Und kleine geschlossene Modelle kosten pro Output-Token 15- bis 125-mal so viel wie das günstigste offene 8B-Modell.

## Schritt 4: Ein echter Job, auf jede Art berechnet

Angenommen, Sie senden 1.000 Anfragen. Jede enthält 1.500 Tokens (Anweisungen plus ein Dokument) und bekommt 500 Tokens zurück. Das sind 1,5 Millionen Input-Tokens und 0,5 Millionen Output-Tokens.

| Option | Kosten für den Job | Anmerkungen |
| --- | --- | --- |
| Llama 3.1 8B bei DeepInfra | etwa 0,05 $ | Mit Abstand am günstigsten |
| gpt-4o-mini | etwa 0,53 $ | |
| gpt-5-mini | etwa 1,38 $ | |
| Claude Haiku 4.5 | etwa 4,00 $ | |
| Gemietete RTX 3060, eine Anfrage nach der anderen | etwa 0,21 $ | Etwa 3,5 Stunden |
| Gemietete RTX 3090 | etwa 0,33 $ | Etwa 1,7 Stunden |
| Gemietete RTX 4090 | etwa 0,48 $ | Etwa 1,4 Stunden |
| Gemietete RTX 5090 | etwa 0,54 $ | Etwa 1 Stunde |

So sind wir auf die GPU-Werte gekommen: 500.000 Output-Tokens geteilt durch die Geschwindigkeit aus Schritt 1, plus 1,5 Millionen Prompt-Tokens geteilt durch die Prompt-Geschwindigkeit laut llama.cpp-Scoreboard, multipliziert mit dem Stundenpreis.

## Was das bedeutet

**Bietet eine gehostete API das gewünschte offene Modell an, ist sie der günstigste Weg, es zu nutzen.** Bei Llama 3.1 8B kommt nichts, was Sie stundenweise mieten, auch nur in die Nähe von 0,04 $ pro Million Output-Tokens.

**Gegenüber den meisten kleinen geschlossenen Modellen ist eine stundenweise gemietete GPU günstiger, sofern das offene Modell für Ihre Aufgabe gut genug ist.** Eine ausgelastete RTX 3060 kostet pro Output-Token weniger als gpt-4o-mini, eine RTX 3090 etwa gleich viel; rechnet man wie im Beispiel oben die Input-Tokens mit, sind beide günstiger. Jede Karte in der Tabelle ist günstiger als gpt-5-mini oder Claude Haiku. Ob ein offenes 7B–8B-Modell gut genug antwortet, hängt von der Aufgabe ab: Zum Klassifizieren, Extrahieren von Feldern, Zusammenfassen und für kurze Umformulierungen reicht es meist, bei längeren, mehrstufigen Schlussfolgerungen ist es schwächer.

**Eine stundenweise gemietete GPU lohnt sich, wenn:**

- das benötigte Modell bei keiner Token-API verfügbar ist: Ihr eigenes feinabgestimmtes Modell, ein Community-Modell oder eine bestimmte Quantisierung.
- Sie feste Kosten pro Stunde statt einer verbrauchsabhängigen Rechnung wollen, etwa beim Testen oder für einen Batch-Job über Nacht.
- Ihre Prompts lang sind. Auf einer stundenweise gemieteten GPU kosten Input-Tokens nur die paar Sekunden, die das Einlesen dauert.
- Sie ein Modell auf echter Hardware ausprobieren wollen, bevor Sie selbst eine Karte kaufen.

**Die Abrechnung pro Token lohnt sich, wenn:**

- Ihr Traffic in Schüben mit langen Pausen kommt. Während Sie warten, zahlen Sie nichts.
- Sie viele Anfragen gleichzeitig brauchen. Eine einzelne Consumer-GPU bearbeitet standardmäßig eine Anfrage nach der anderen: `OLLAMA_NUM_PARALLEL` steht bei Ollama standardmäßig auf 1.
- das gewünschte Modell gehostet angeboten wird und Sie mit dem Preis zufrieden sind.

## Datenschutz spielt auf beiden Seiten eine Rolle

Bei einer Token-API [gehen Ihre Prompts an den API-Anbieter](/de/why-corporate-policies-banning-chatgpt/). Bei einer gemieteten GPU gehen sie an die Maschine, die Sie mieten. Bei GPUFlow zum Beispiel läuft das Modell auf dem eigenen Rechner des Anbieters, Prompts und Antworten laufen also über diesen Rechner. Unsere Doku sagt es klar: Senden Sie keine Passwörter, Kartennummern oder sonst etwas, das Sie keinem Fremden zeigen würden. Wenn die Daten wirklich sensibel sind, ersetzt keine der beiden Optionen ein Modell auf Ihrer eigenen Hardware.

## So testen Sie das auf GPUFlow

Bei GPUFlow mieten Sie eine GPU für eine bestimmte Zahl von Stunden und bekommen einen API-Schlüssel, der wie ein OpenAI-Schlüssel funktioniert. Abgerechnet wird sekundengenau, und wenn Sie die Miete früher beenden, wird die ungenutzte Zeit Ihren Credits gutgeschrieben. So messen Sie Ihre eigenen Kosten pro Token:

1. Mieten Sie für eine Stunde eine GPU, auf der das gewünschte Modell läuft.
2. Tragen Sie in Ihrem Skript `https://gpuflow.app/v1` als Base-URL und Ihren Schlüssel ein ([so geht's](https://docs.gpuflow.app/de/renters/api-quickstart/)).
3. Zählen Sie die zurückgelieferten Tokens und teilen Sie den bezahlten Betrag durch diese Zahl.

Zehn Minuten echter Traffic sagen Ihnen mehr als jede Tabelle.

## Verwandte Artikel

- [GPU mieten: Was der Stundenpreis verschweigt und was Sie wirklich zahlen](/de/hidden-fees-in-gpu-rental/)
- [OpenAI-kompatiblen API-Schlüssel in Open WebUI, Continue, LangChain und anderen Tools nutzen](/de/use-openai-compatible-api-key-in-apps/)
- [Ollama vs. vLLM vs. TGI: Inference-Benchmark auf der RTX 4090](/de/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/)

## Quellen

Alle geprüft im September 2026.

- GPU-Geschwindigkeiten, Qwen3 8B Q4_K_XL mit 16K Kontext: [GPU-Ranking von Hardware Corner](https://www.hardware-corner.net/gpu-ranking-local-llm/) (aktualisiert am 9. Dezember 2025)
- CUDA-Scoreboard von llama.cpp, Llama 2 7B Q4_0: [github.com/ggml-org/llama.cpp/discussions/15013](https://github.com/ggml-org/llama.cpp/discussions/15013)
- Parallele Anfragen in Ollama: [docs.ollama.com/faq](https://docs.ollama.com/faq)
- Preise von DeepInfra: [deepinfra.com/pricing](https://deepinfra.com/pricing)
- Preise von OpenAI: [gpt-4o-mini](https://developers.openai.com/api/docs/models/gpt-4o-mini), [gpt-5-mini](https://developers.openai.com/api/docs/models/gpt-5-mini)
- Preise von Anthropic: [Preise auf platform.claude.com](https://platform.claude.com/docs/en/about-claude/pricing)
- Preisspannen für GPU-Mieten: [GPUFlow-Doku, Den Preis für Ihre GPU festlegen](https://docs.gpuflow.app/de/providers/pricing/)
