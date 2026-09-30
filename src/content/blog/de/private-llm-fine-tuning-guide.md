---
title: "LLM privat auf einer gemieteten GPU feintunen: Eine praktische Anleitung"
description: "Wann Fine-Tuning besser ist als RAG oder Prompting, VRAM-Bedarf für QLoRA nach Modellgröße, TRL, Unsloth und Axolotl, Datenschutz auf gemieteten GPUs, Kosten und Bereitstellung."
excerpt: "Ein QLoRA-Fine-Tuning eines offenen 8B-Modells passt auf eine gemietete 24-GB-GPU und kostet etwa 0,35 $ bis 0,83 $ pro Lauf. Bevor Sie dafür zahlen, prüfen Sie, ob Fine-Tuning das richtige Werkzeug ist, und planen Sie, wie Ihre Daten auf dem Rechner eines anderen Ihre bleiben."
pubDate: 2025-02-23
updatedDate: 2026-09-30
locale: "de"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/private-llm-fine-tuning-guide-hero.png"
heroImageAlt: "Illustration eines privaten Datensatzes, mit dem auf einem gemieteten GPU-Server ein Sprachmodell feingetunt wird"
faq:
  - question: "Wie viel VRAM brauche ich, um ein 7B- oder 8B-Modell zu feintunen?"
    answer: "Mit QLoRA nennt die Anforderungstabelle von Unsloth etwa 5 GB für ein 7B-Modell und 6 GB für ein 8B-Modell; normales 16-Bit-LoRA braucht etwa 19 GB und 22 GB. Echte Läufe brauchen Reserve für längere Sequenzen und größere Batches, daher ist eine 24-GB-Karte wie die RTX 3090 oder 4090 die bequeme Wahl."
  - question: "Soll ich feintunen oder RAG nutzen?"
    answer: "Nutzen Sie RAG, wenn das Modell Fakten aus Ihren Dokumenten braucht, vor allem Fakten, die sich ändern. Eine Studie von Ovadia et al. aus dem Jahr 2024 ergab, dass RAG beim Hinzufügen von Wissen durchweg besser abschnitt als unüberwachtes Fine-Tuning. Feintunen Sie, wenn Sie ein gleichbleibendes Format, einen festen Tonfall oder ein eng umrissenes Verhalten brauchen, das sich per Prompt nicht zuverlässig erreichen lässt."
  - question: "Was kostet es, ein LLM auf einer gemieteten GPU zu feintunen?"
    answer: "Ein QLoRA-Lauf auf einem 8B-Modell mit 2.000 Beispielen dauert mit Einrichtung etwas über eine Stunde. Das sind etwa 0,35 $ auf einer RTX 4090 bei Vast.ai zu 0,31 $/h oder 0,83 $ zum Listenpreis von RunPod von 0,74 $/h (September 2026). Ein Lauf mit 20.000 Beispielen dauert etwa vier Stunden und kostet 1,24 $ bis 2,97 $."
  - question: "Kann der GPU-Host meine Trainingsdaten sehen?"
    answer: "Dem Host gehört die Hardware, gehen Sie also davon aus, dass er es könnte. Container-Isolation schützt Sie vor anderen Mietern, nicht vor dem Besitzer der Maschine. Nutzen Sie für sensible Daten geprüfte Rechenzentrums-Hosts (Vast.ai Secure Cloud, RunPod Secure Cloud), entfernen Sie personenbezogene Daten vor dem Hochladen und löschen Sie die Instanz, wenn Sie fertig sind."
  - question: "Was ist der Unterschied zwischen LoRA und QLoRA?"
    answer: "LoRA friert das Basismodell ein und trainiert kleine Adapter-Matrizen. QLoRA macht dasselbe, lädt das eingefrorene Basismodell aber in 4-Bit-NF4-Präzision. Das senkte den Speicherbedarf im ursprünglichen Paper so weit, dass sich ein 65B-Modell auf einer einzigen 48-GB-GPU feintunen ließ."
  - question: "Kann ich bei GPUFlow feintunen oder mein Modell hochladen?"
    answer: "Nein. GPUFlow ist reine Inferenz: Sie mieten eine OpenAI-kompatible Chat-API für Modelle, die Anbieter auf ihren eigenen Rechnern installiert haben, meist mit Ollama. Es gibt keine Shell und keinen Dateizugriff, Sie können dort also weder trainieren noch ein eigenes Modell hochladen."
---

Sie können ein offenes 8B-Modell mit QLoRA auf einer einzigen gemieteten 24-GB-GPU mit Ihren eigenen Daten feintunen, und ein typischer Lauf kostet unter einem Dollar. Die schwierigeren Fragen kommen vorher: ob Fine-Tuning überhaupt die richtige Lösung ist (für Fakten gewinnt meist Retrieval) und wie Ihre Daten auf einer Maschine, die jemand anderem gehört, privat bleiben.

Diese Anleitung behandelt beides, dann den VRAM-Bedarf nach Modellgröße, die aktuellen Tools, ein funktionierendes Trainingsskript, eine Beispielrechnung und die Bereitstellung des Ergebnisses. Alles wurde im September 2026 geprüft; die Quellen stehen am Ende.

## Fine-Tuning, RAG oder bessere Prompts

Fine-Tuning verändert, wie sich ein Modell verhält. Um ihm Fakten beizubringen, taugt es wenig. Ovadia et al. haben beides für das Einbringen von Wissen verglichen und festgestellt, dass RAG unüberwachtes Fine-Tuning „durchweg übertrifft“, „sowohl bei vorhandenem Wissen, das im Training vorkam, als auch bei völlig neuem Wissen“. Ihr Fazit: LLMs tun sich schwer, durch Fine-Tuning neue Fakten zu lernen.

Gehen Sie also diesen Baum durch, bevor Sie irgendetwas mieten:

<figure>
<svg viewBox="0 0 720 420" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">Entscheidungsbaum für die Wahl zwischen Retrieval, besseren Prompts, Fine-Tuning und einem größeren Modell</title>
<defs><marker id="d1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker></defs>
<rect width="720" height="420" fill="#ffffff"/>
<rect x="60" y="15" width="280" height="40" rx="8" fill="#1e1b4b"/>
<text x="200" y="40" text-anchor="middle" fill="#ffffff">Die Antworten reichen nicht</text>
<line x1="200" y1="55" x2="200" y2="83" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<rect x="20" y="85" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="115" text-anchor="middle" fill="#1e1b4b">Fehlen Fakten, oder ändern sich die Daten?</text>
<rect x="440" y="80" width="260" height="60" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
<text x="570" y="105" text-anchor="middle" fill="#1e1b4b" font-weight="600">RAG nutzen</text>
<text x="570" y="126" text-anchor="middle" fill="#64748b" font-size="13">Dokumente pro Anfrage durchsuchen</text>
<line x1="380" y1="110" x2="438" y2="110" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="102" text-anchor="middle" fill="#16a34a" font-size="13">Ja</text>
<line x1="200" y1="135" x2="200" y2="173" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="160" fill="#64748b" font-size="13">Nein</text>
<rect x="20" y="175" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="205" text-anchor="middle" fill="#1e1b4b">Helfen Anweisungen und Beispiele?</text>
<rect x="440" y="170" width="260" height="60" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
<text x="570" y="195" text-anchor="middle" fill="#1e1b4b" font-weight="600">Prompt verbessern</text>
<text x="570" y="216" text-anchor="middle" fill="#64748b" font-size="13">System-Prompt, Few-Shot-Beispiele</text>
<line x1="380" y1="200" x2="438" y2="200" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="192" text-anchor="middle" fill="#16a34a" font-size="13">Ja</text>
<line x1="200" y1="225" x2="200" y2="263" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="250" fill="#64748b" font-size="13">Nein</text>
<rect x="20" y="265" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="295" text-anchor="middle" fill="#1e1b4b">Geht es um Format, Tonfall oder Fähigkeit?</text>
<rect x="440" y="260" width="260" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="570" y="285" text-anchor="middle" fill="#1e1b4b" font-weight="600">Fine-Tuning mit QLoRA</text>
<text x="570" y="306" text-anchor="middle" fill="#64748b" font-size="13">Hunderte gute Beispiele</text>
<line x1="380" y1="290" x2="438" y2="290" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="282" text-anchor="middle" fill="#16a34a" font-size="13">Ja</text>
<line x1="200" y1="315" x2="200" y2="353" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="340" fill="#64748b" font-size="13">Nein</text>
<rect x="60" y="355" width="280" height="50" rx="10" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
<text x="200" y="385" text-anchor="middle" fill="#1e1b4b">Größeres Basismodell testen</text>
<text x="570" y="370" text-anchor="middle" fill="#64748b" font-size="13">RAG und Fine-Tuning ergänzen sich:</text>
<text x="570" y="390" text-anchor="middle" fill="#64748b" font-size="13">Verhalten trainieren, Fakten abrufen</text>
</svg>
<figcaption>Die meisten Probleme der Art „das Modell kennt unsere Sachen nicht“ sind Retrieval-Probleme. Fine-Tuning lohnt sich, wenn Sie jedes Mal dasselbe Verhalten brauchen: ein JSON-Schema, einen Hausstil, ein Klassifikationsschema.</figcaption>
</figure>

Gute Gründe für Fine-Tuning:

- **Striktes Ausgabeformat.** Bei jedem Aufruf Felder in Ihr Schema extrahieren, ohne eine Seite Anweisungen in jedem Prompt.
- **Stil und Tonfall.** Support-Antworten, die wie Ihr Team klingen, oder Berichte mit fester Struktur.
- **Eine eng umrissene Aufgabe für ein kleines Modell.** Ein angepasstes 8B-Modell kann ein großes Allzweckmodell für einen einzelnen Job ersetzen. Das zählt, wenn Sie es auf günstiger Hardware betreiben.
- **Kürzere Prompts.** Verhalten, das in den Gewichten steckt, muss nicht in jeder Anfrage wiederholt werden.

## LoRA und QLoRA

Vollständiges Fine-Tuning aktualisiert jedes Gewicht. Die GPU muss also zusätzlich zum Modell Gradienten und Optimizer-Zustand für alle Gewichte halten. LoRA friert das Basismodell ein und trainiert kleine Matrizen mit niedrigem Rang neben seinen Schichten; das ursprüngliche Paper meldete 10.000-mal weniger trainierbare Parameter und ein Drittel des GPU-Speichers im Vergleich zum vollständigen Fine-Tuning von GPT-3 175B mit Adam.

QLoRA geht weiter: Das eingefrorene Basismodell wird in 4-Bit-NF4-Präzision geladen, nur die Adapter werden in 16 Bit trainiert. Dettmers et al. haben damit ein 65B-Modell auf einer einzigen 48-GB-GPU feingetunt, „bei voller Leistung eines 16-Bit-Fine-Tunings“. Das Paper brachte drei Bausteine mit, die die Tools bis heute nutzen: den Datentyp NF4, doppelte Quantisierung der Quantisierungskonstanten und Paged Optimizers, die Speicherspitzen abfangen.

Das Ergebnis ist in beiden Fällen ein Adapter, ein Ordner mit ein paar Tensoren, den Sie auf das unveränderte Basismodell anwenden. Sie können ihn getrennt halten oder in die Gewichte einmergen.

## Wie viel VRAM Sie brauchen

Unsloth veröffentlicht eine Tabelle mit dem minimalen VRAM für Fine-Tuning nach Modellgröße. Das sind die Zahlen von Unsloth, mit dessen Speicheroptimierungen; normales Training mit Hugging Face braucht mehr, und längere Sequenzen oder größere Batches treiben jede Zeile nach oben.

| Modellgröße | QLoRA (4 Bit) | LoRA (16 Bit) | Mietkarte, auf die QLoRA bequem passt |
| --- | --- | --- | --- |
| 3B | 3,5 GB | 8 GB | Jede Karte ab 12 GB |
| 8B | 6 GB | 22 GB | RTX 3090 / 4090 (24 GB) |
| 14B | 8,5 GB | 33 GB | RTX 3090 / 4090 (24 GB) |
| 32B | 26 GB | 76 GB | 48-GB-Karte (RTX A6000, A40, L40S) |
| 70B | 41 GB | 164 GB | 80-GB-Karte (A100, H100) |

<figure>
<svg viewBox="0 0 720 320" role="img" aria-labelledby="d2-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d2-title">Balkendiagramm des minimalen VRAM für das Fine-Tuning von 8B-, 14B-, 32B- und 70B-Modellen mit QLoRA und 16-Bit-LoRA, verglichen mit Karten mit 24, 48 und 80 GB</title>
<rect width="720" height="320" fill="#ffffff"/>
<rect x="200" y="12" width="14" height="14" fill="#6366f1"/>
<text x="220" y="24" fill="#1e1b4b" font-size="13">QLoRA 4 Bit</text>
<rect x="320" y="12" width="14" height="14" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
<text x="340" y="24" fill="#1e1b4b" font-size="13">LoRA 16 Bit</text>
<line x1="262.1" y1="58" x2="262.1" y2="265" stroke="#f97316" stroke-width="1.5" stroke-dasharray="5 4"/>
<text x="262.1" y="52" text-anchor="middle" fill="#f97316" font-size="12">24 GB</text>
<line x1="324.2" y1="58" x2="324.2" y2="265" stroke="#f97316" stroke-width="1.5" stroke-dasharray="5 4"/>
<text x="324.2" y="52" text-anchor="middle" fill="#f97316" font-size="12">48 GB</text>
<line x1="407.1" y1="58" x2="407.1" y2="265" stroke="#f97316" stroke-width="1.5" stroke-dasharray="5 4"/>
<text x="407.1" y="52" text-anchor="middle" fill="#f97316" font-size="12">80 GB</text>
<text x="190" y="88" text-anchor="end" fill="#1e1b4b">8B</text>
<rect x="200" y="66" width="15.5" height="16" fill="#6366f1"/>
<text x="221" y="79" fill="#1e1b4b" font-size="12">6</text>
<rect x="200" y="84" width="56.9" height="16" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
<text x="268" y="97" fill="#1e1b4b" font-size="12">22</text>
<text x="190" y="138" text-anchor="end" fill="#1e1b4b">14B</text>
<rect x="200" y="116" width="22" height="16" fill="#6366f1"/>
<text x="228" y="129" fill="#1e1b4b" font-size="12">8,5</text>
<rect x="200" y="134" width="85.4" height="16" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
<text x="291" y="147" fill="#1e1b4b" font-size="12">33</text>
<text x="190" y="188" text-anchor="end" fill="#1e1b4b">32B</text>
<rect x="200" y="166" width="67.3" height="16" fill="#6366f1"/>
<text x="273" y="179" fill="#1e1b4b" font-size="12">26</text>
<rect x="200" y="184" width="196.7" height="16" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
<text x="425" y="197" fill="#1e1b4b" font-size="12">76</text>
<text x="190" y="238" text-anchor="end" fill="#1e1b4b">70B</text>
<rect x="200" y="216" width="106.1" height="16" fill="#6366f1"/>
<text x="302" y="229" text-anchor="end" fill="#ffffff" font-size="12">41</text>
<rect x="200" y="234" width="424.5" height="16" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
<text x="631" y="247" fill="#1e1b4b" font-size="12">164</text>
<line x1="200" y1="265" x2="640" y2="265" stroke="#64748b" stroke-width="1"/>
<text x="200" y="283" text-anchor="middle" fill="#64748b" font-size="12">0</text>
<text x="303.5" y="283" text-anchor="middle" fill="#64748b" font-size="12">40</text>
<text x="407.1" y="283" text-anchor="middle" fill="#64748b" font-size="12">80</text>
<text x="510.6" y="283" text-anchor="middle" fill="#64748b" font-size="12">120</text>
<text x="614.1" y="283" text-anchor="middle" fill="#64748b" font-size="12">160</text>
<text x="420" y="306" text-anchor="middle" fill="#64748b" font-size="13">Minimaler VRAM in GB (Anforderungstabelle von Unsloth)</text>
</svg>
<figcaption>Erst QLoRA macht gemietete Consumer-Karten hier nützlich: Bis 14B passt alles mit Luft auf eine 24-GB-Karte, 32B braucht eine 48-GB-Karte und 70B eine mit 80 GB. Ohne 4-Bit-Laden passt selbst 8B kaum in 24 GB.</figcaption>
</figure>

Mein Standard ist ein 8B- oder 14B-Modell auf einer RTX 4090. Das ist die günstigste Mietkarte, die Platz für Sequenzen mit 2.048 Tokens und eine vernünftige Batchgröße lässt, und Modelle dieser Größe lassen sich danach leicht bereitstellen. Wie Sie ein Basismodell nach dem VRAM wählen, auf dem Sie es später betreiben, steht in [welche KI-Modelle in den VRAM Ihrer GPU passen](/de/which-ai-models-fit-your-gpu-vram/).

## Ein Tool wählen: TRL, Unsloth oder Axolotl

Alle drei sind Open Source, und alle beherrschen LoRA und QLoRA.

| Tool | Bedienung | Stärke | Worauf achten |
| --- | --- | --- | --- |
| Hugging Face TRL + PEFT | Python (`SFTTrainer`) | Die Referenzimplementierung; DPO, GRPO und mehr über dieselbe API | Braucht beim selben Lauf mehr Speicher als Unsloth |
| Unsloth | Python oder die Web-Oberfläche Unsloth Studio | Verspricht doppelte Geschwindigkeit und 70 % weniger VRAM; exportiert direkt nach GGUF | Studio steht unter AGPL-3.0 (der Kern unter Apache 2.0) |
| Axolotl | Eine YAML-Datei, `axolotl train config.yml` | Mehrere GPUs (FSDP, DeepSpeed), viele Rezepte | Braucht Python 3.11+ und PyTorch 2.11+ |

Stand September 2026 ist TRL bei Version 1.14 und PEFT bei 0.21. Unsloth braucht Python 3.11 bis 3.13 und eine NVIDIA-GPU mit CUDA Compute Capability 7.0 oder neuer (V100, T4, RTX-20-Serie und neuer). Axolotl empfiehlt Python 3.12 und PyTorch 2.12.1.

Nehmen Sie TRL, wenn Sie jede Zeile verstehen wollen, Unsloth, wenn der VRAM knapp ist oder Sie den GGUF-Export mit einem Aufruf wollen, und Axolotl, wenn Sie Läufe mit anderen Einstellungen wiederholen oder auf mehrere GPUs gehen. Das Skript unten nutzt TRL, weil es der kürzeste Weg ist, der alle beweglichen Teile zeigt.

## Die Daten vorbereiten

`SFTTrainer` von TRL liest Konversationen im selben Format wie eine Anfrage an eine Chat-API. Ein JSON-Objekt pro Zeile in `train.jsonl`:

```json
{"messages": [{"role": "system", "content": "Extract the invoice fields as JSON."}, {"role": "user", "content": "Invoice 4471 from Norden AB, due 12 March, total 1,250 EUR"}, {"role": "assistant", "content": "{\"invoice_id\": \"4471\", \"supplier\": \"Norden AB\", \"due\": \"2026-03-12\", \"total\": 1250, \"currency\": \"EUR\"}"}]}
```

Praktische Regeln:

- **Qualität vor Menge.** Ein paar hundert bis ein paar tausend einheitliche, korrekte Beispiele schlagen Zehntausende verrauschte. Jeder Fehler in den Daten ist Verhalten, für dessen Training Sie bezahlen.
- **Wie in Produktion.** Nutzen Sie den System-Prompt und das Eingabeformat, das Ihre Anwendung tatsächlich senden wird.
- **5 bis 10 % zurückhalten.** Behalten Sie Beispiele, auf denen das Modell nie trainiert, um Basismodell und angepasstes Modell direkt zu vergleichen.
- **Entfernen, was Sie nicht brauchen.** Namen, E-Mail-Adressen, Kontonummern und IDs helfen dem Modell selten, ein Format zu lernen. Ersetzen Sie sie durch realistische Platzhalter, bevor die Daten Ihren Computer verlassen.

Bei der letzten Regel geht es um mehr als die gemietete Maschine. Carlini et al. haben Hunderte wörtliche Trainingssequenzen aus GPT-2 extrahiert, darunter Namen, Telefonnummern und E-Mail-Adressen, von denen manche nur in einem einzigen Trainingsdokument vorkamen. Ein feingetuntes Modell kann das, worauf es trainiert wurde, jedem wiedergeben, der es später nutzt.

## Die Daten auf einer gemieteten Maschine privat halten

Auf einem GPU-Marktplatz gehört der Computer jemand anderem. Vast.ai sagt es klar: „Kunden sind in Docker-Containern ohne Root-Rechte isoliert und haben nur Zugriff auf ihre eigenen Daten“, und „die Sicherheit bei den Anbietern schwankt stark“. Diese Isolation schützt Sie vor anderen Mietern. Vor der Person mit physischem Zugang und Root-Rechten auf dem Host schützt sie nicht.

Für private Daten:

1. **Wählen Sie einen geprüften Rechenzentrums-Host.** Die Secure-Cloud-Anbieter von Vast.ai sind „geprüfte Rechenzentren mit ISO-27001-Zertifizierung und Tier-3/4-Standard“, und Vast empfiehlt sie für sensible Arbeit. Die Secure Cloud von RunPod läuft in T3/T4-Rechenzentren; die Community Cloud verbindet Sie mit einzelnen Anbietern. Die Rechenzentrumsstufen kosten mehr pro Stunde und sind es hier wert.
2. **Laden Sie nur den bereinigten Datensatz hoch,** über SSH (`rsync -avP` oder `scp`). Legen Sie ihn unterwegs nicht in einem öffentlichen Bucket oder hinter einem geteilten Link ab.
3. **Halten Sie das Logging lokal.** In TRL 1.14 steht `report_to` standardmäßig auf `"none"`, es geht also nichts an einen Experiment-Tracker, solange Sie das nicht einschalten. Rufen Sie `push_to_hub` nicht mit einem Adapter auf, der auf privaten Daten trainiert wurde.
4. **Holen Sie die Ergebnisse heraus und löschen Sie dann die Instanz.** Laden Sie Adapter und Evaluationsergebnisse herunter, melden Sie sich bei Hugging Face ab (`hf auth logout`), falls Sie ein Token genutzt haben, und löschen Sie Instanz und Volumes. Bei Vast.ai wird Speicher berechnet und aufbewahrt, bis die Instanz gelöscht ist, nicht nur gestoppt.

Dateien in einem Container zu löschen garantiert nicht, dass die Festplatte des Hosts gelöscht wird. Der eigentliche Schutz sind deshalb die Schritte 1 und 2: Wählen Sie, wer die Hardware hält, und schicken Sie so wenig wie möglich dorthin. Mehr dazu in [einen Datensatz auf einem öffentlichen GPU-Knoten absichern](/de/how-to-secure-dataset-on-public-gpu-node/). Verbietet Ihre Richtlinie jede fremde Hardware, läuft dasselbe Skript auch auf Ihrer eigenen 24-GB-Karte.

## Training: ein QLoRA-Skript mit TRL

Auf einer gemieteten Linux-Maschine mit RTX 3090 oder 4090:

```bash
python -m venv venv && source venv/bin/activate
pip install torch trl peft bitsandbytes datasets
```

Dann `train.py`, nach dem QLoRA-Muster aus der PEFT-Doku von TRL. Qwen3-8B steht unter Apache 2.0 und ist frei zugänglich, ein Hugging-Face-Token ist also nicht nötig:

```python
import torch
from datasets import load_dataset
from peft import LoraConfig
from transformers import BitsAndBytesConfig
from trl import SFTConfig, SFTTrainer

dataset = load_dataset("json", data_files="train.jsonl", split="train")

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True,
)

peft_config = LoraConfig(
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    target_modules="all-linear",
    task_type="CAUSAL_LM",
)

args = SFTConfig(
    output_dir="out",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    lr_scheduler_type="cosine",
    warmup_steps=20,
    max_length=2048,
    bf16=True,
    logging_steps=10,
    save_strategy="epoch",
    model_init_kwargs={"dtype": torch.bfloat16},
)

trainer = SFTTrainer(
    model="Qwen/Qwen3-8B",
    args=args,
    train_dataset=dataset,
    quantization_config=bnb_config,
    peft_config=peft_config,
)
trainer.train()
trainer.save_model("out/adapter")
```

Die Entscheidungen, auf die es ankommt:

- **`learning_rate=2e-4`.** Die Doku von TRL empfiehlt für QLoRA etwa das Zehnfache der üblichen Fine-Tuning-Rate. Steigt der Evaluations-Loss, während der Trainings-Loss fällt, liegt Overfitting vor: Nehmen Sie weniger Epochen.
- **`r=16`, `target_modules="all-linear"`.** Adapter auf jeder linearen Schicht, so wie in den Benchmarks von Unsloth. Rang 16 reicht für Format und Stil; für schwierigere Aufgaben erhöhen Sie ihn.
- **`max_length=2048`.** Längere Beispiele werden abgeschnitten. Prüfen Sie die Token-Längen Ihrer Daten; ein höheres Limit braucht mehr VRAM.
- **Effektive Batchgröße 16** (4 × 4 Akkumulationsschritte). Geht der Speicher aus, senken Sie `per_device_train_batch_size` und erhöhen die Akkumulation, sodass das Produkt gleich bleibt.

Bevor Sie die Maschine herunterfahren, schicken Sie Ihre zurückgehaltenen Beispiele durch das Basismodell und das angepasste Modell und vergleichen die Ergebnisse. Nur dieser Test sagt Ihnen, ob das Geld etwas bewirkt hat.

## Was es kostet

Trainingszeit ist Gesamtzahl der Tokens ÷ Durchsatz. GigaGPU, ein Hosting-Anbieter, hat für Llama 3.1 8B mit QLoRA auf einer RTX 4090 etwa 3.500 Trainings-Tokens pro Sekunde gemessen und veröffentlicht. Unter der Annahme eines ähnlichen Werts für Qwen3-8B:

**Kleiner Lauf:** 2.000 Beispiele × 600 Tokens × 3 Epochen = 3,6 Millionen Tokens. 3.600.000 ÷ 3.500 = 1.029 s, etwa 17 Minuten.

| Schritt | Zeit |
| --- | --- |
| Umgebung einrichten | 10 Min. |
| Qwen3-8B herunterladen (16,4 GB Gewichte) und Daten hochladen | 10 Min. |
| Training | 17 Min. |
| Basismodell und angepasstes Modell auf zurückgehaltenen Daten vergleichen | 15 Min. |
| Mergen, exportieren, herunterladen, Instanz löschen | 15 Min. |
| **Summe** | **67 Min. (1,12 h)** |

- RTX 4090 bei Vast.ai zu 0,31 $/h: 1,12 × 0,31 $ = **0,35 $**
- RTX 4090 bei RunPod zu 0,74 $/h (Listenpreis der Preisseite): 1,12 × 0,74 $ = **0,83 $**

**Größerer Lauf:** 20.000 Beispiele × 1.000 Tokens × 2 Epochen = 40 Millionen Tokens ÷ 3.500 = 11.429 s, etwa 3,2 Stunden. Mit 50 Minuten desselben Drumherums sind es 4,0 Stunden: **1,24 $** bei Vast.ai oder **2,97 $** bei RunPod.

Für ein 32B-Modell listet RunPod im September 2026 48-GB-Karten zu 0,49 $/h (A40), 0,53 $/h (RTX A6000) und 1,09 $/h (L40S). Einen veröffentlichten Durchsatz für 32B-QLoRA auf diesen Karten habe ich nicht. Lassen Sie also 50 Schritte laufen, lesen Sie die Zeit pro Schritt aus dem Log ab und machen Sie dieselbe Multiplikation, bevor Sie sich auf einen langen Lauf festlegen.

Die Preise sind die Werte vom September 2026 von der Preisseite von RunPod und aus dem Tracker von getdeploying.com für Vast.ai. Secure- und Rechenzentrumsstufen kosten mehr als die günstigsten Community-Angebote. Das Gesamtbild steht im [GPU-Preisvergleich](/de/gpu-rental-pricing-comparison-2026/).

## Das Ergebnis bereitstellen

Sie haben zwei Möglichkeiten: den Adapter getrennt halten oder ihn ins Modell mergen.

**Getrennt halten mit vLLM.** vLLM lädt LoRA-Adapter neben dem Basismodell und stellt jeden unter einem eigenen Modellnamen auf seinem OpenAI-kompatiblen Server bereit:

```bash
vllm serve Qwen/Qwen3-8B --enable-lora --lora-modules invoices=./out/adapter
```

Clients senden dann `"model": "invoices"`. Mehrere Adapter können sich ein Basismodell auf einer GPU teilen.

**Mergen und in Ollama ausführen.** Mergen Sie den Adapter in Gewichte mit voller Präzision, konvertieren Sie sie mit llama.cpp nach GGUF, quantisieren Sie und importieren Sie das Ergebnis:

```python
import torch
from peft import AutoPeftModelForCausalLM
from transformers import AutoTokenizer

model = AutoPeftModelForCausalLM.from_pretrained("out/adapter", dtype=torch.bfloat16)
model.merge_and_unload().save_pretrained("merged")
AutoTokenizer.from_pretrained("Qwen/Qwen3-8B").save_pretrained("merged")
```

```bash
python llama.cpp/convert_hf_to_gguf.py merged --outfile invoices-bf16.gguf --outtype bf16
./llama.cpp/build/bin/llama-quantize invoices-bf16.gguf invoices-Q4_K_M.gguf Q4_K_M
echo "FROM ./invoices-Q4_K_M.gguf" > Modelfile
ollama create invoices -f Modelfile
```

Unsloth erledigt Merge und GGUF-Export in einem Aufruf (`model.save_pretrained_gguf("dir", tokenizer, quantization_method="q4_k_m")`). Die Doku warnt, dass die häufigste Ursache für schlechte Antworten nach dem Export das falsche Chat-Template ist: Stellen Sie das Modell mit dem Template bereit, mit dem Sie trainiert haben. Die Abwägungen zwischen Ollama, vLLM und TGI stehen in [unserem Inferenz-Benchmark auf der RTX 4090](/de/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/).

### Wo GPUFlow ins Spiel kommt

Das Training kann GPUFlow nicht übernehmen: Es vermietet eine OpenAI-kompatible API auf der GPU eines Anbieters, ohne Shell, SSH oder Dateizugriff. Ihr feingetuntes Modell kann es auch nicht bereitstellen. Mieter können keine Modelle hochladen; angeboten werden die Modelle, die der jeweilige Anbieter installiert hat (meist mit Ollama), etwa `qwen2.5:7b` oder `llama3.1:8b`.

Helfen kann es beim Schritt davor: für ein paar Cent prüfen, ob ein normales offenes Modell mit einem guten Prompt die Aufgabe schon erledigt. Das ist im Entscheidungsbaum das günstigste Ergebnis. Nutzen Sie dafür Testdaten, nicht die privaten Daten, um die es in dieser Anleitung geht: Prompts und Antworten laufen während der Miete im Klartext über den Rechner des Anbieters. Wie das funktioniert, steht im [API-Schnellstart](https://docs.gpuflow.app/de/renters/api-quickstart/), und [den API-Schlüssel in Apps nutzen](/de/use-openai-compatible-api-key-in-apps/) zeigt, wie Sie ihn mit bestehenden Tools verbinden.

## Quellen

Alle geprüft im September 2026.

- Paper: [Hu et al., LoRA](https://arxiv.org/abs/2106.09685); [Dettmers et al., QLoRA](https://arxiv.org/abs/2305.14314); [Ovadia et al., Fine-Tuning or Retrieval?](https://arxiv.org/abs/2312.05934); [Carlini et al., Extracting Training Data from Large Language Models](https://arxiv.org/abs/2012.07805)
- Hugging Face TRL: [SFT Trainer](https://huggingface.co/docs/trl/sft_trainer), [PEFT-Integration und QLoRA](https://huggingface.co/docs/trl/peft_integration)
- Unsloth: [Anforderungen und VRAM-Tabelle](https://unsloth.ai/docs/get-started/fine-tuning-for-beginners/unsloth-requirements.md), [Benchmarks](https://unsloth.ai/docs/basics/unsloth-benchmarks.md), [Speichern als GGUF](https://unsloth.ai/docs/basics/inference-and-deployment/saving-to-gguf.md), [GitHub](https://github.com/unslothai/unsloth)
- [Axolotl auf GitHub](https://github.com/axolotl-ai-cloud/axolotl)
- Modell: [Model Card von Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
- Trainingsdurchsatz: [GigaGPU, Fine-Tuning auf der RTX 4090](https://gigagpu.com/rtx-4090-fine-tuning-guide/)
- Hosts und Sicherheit: [Sicherheits-FAQ von Vast.ai](https://docs.vast.ai/documentation/reference/faq/security), [Preise von Vast.ai](https://docs.vast.ai/guides/instances/pricing.md), [Überblick über Pods bei RunPod](https://docs.runpod.io/pods/overview)
- Preise: [Preise von RunPod](https://www.runpod.io/pricing), getdeploying.com für [Vast.ai](https://getdeploying.com/vast-ai) und [RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090)
- Bereitstellung: [LoRA-Adapter in vLLM](https://docs.vllm.ai/en/latest/features/lora.html), [Quantisierung mit llama.cpp](https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md), [Import in Ollama](https://docs.ollama.com/import)
- GPUFlow: [API-Schnellstart](https://docs.gpuflow.app/de/renters/api-quickstart/)
