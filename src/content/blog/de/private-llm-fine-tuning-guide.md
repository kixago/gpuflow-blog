---
title: "LLM-Fine-Tuning auf gemieteten GPUs: der vollständige Leitfaden für private Daten"
description: "Ausführliche Anleitung: Open-Weights-Sprachmodelle mit eigenem Datensatz auf einer gemieteten GPU feinabstimmen. Daten schützen, Rechenkosten senken, keine Abhängigkeit von einem Anbieter."
excerpt: "So stimmen Sie Open-Weights-LLMs auf gemieteten GPUs fein, ohne die Kontrolle über Ihre Daten abzugeben. Schritt für Schritt: sichere Datenübertragung, QLoRA-Training und das Aufräumen der Umgebung."
pubDate: 2025-02-23
updatedDate: 2026-09-29
locale: "de"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/secure-server-room-abstract.png"
heroImageAlt: "Abstrakte Darstellung eines gesicherten Serverraums in blauem Licht, in dem KI-Daten verarbeitet werden"
faq:
  - question: "Kann ich große Sprachmodelle auf einer einzelnen RTX 4090 feinabstimmen?"
    answer: "Ja. Mit QLoRA (Quantized Low-Rank Adaptation) passen Modelle bis 8B Parameter problemlos in 24GB VRAM. Dieser Leitfaden zeigt, wie Sie das Trainingsskript für Consumer-Hardware konfigurieren, mit konkreten Werten für Batch-Größe, Sequenzlänge und LoRA-Rang."
  - question: "Ist mein Datensatz auf einer gemieteten GPU sicher?"
    answer: "Ihr Datensatz ist so sicher wie Ihre Arbeitsweise. Dieser Leitfaden behandelt die verschlüsselte Übertragung per SCP, den Verzicht auf Cloud-Speicher wie S3 oder Google Drive als Zwischenstation und das Aufräumen des entfernten Rechners nach dem Training. Denken Sie daran: Der Rechner gehört jemand anderem. Löschen Sie also alles, bevor Sie die Miete beenden."
  - question: "Was kostet das Fine-Tuning eines 8B-Modells auf einer gemieteten GPU?"
    answer: "Ein typischer Fine-Tuning-Lauf für ein 8B-Modell auf einer gemieteten RTX 4090 kostet je nach Datensatzgröße und Anzahl der Epochen zwischen drei und acht Dollar."
  - question: "Muss ich mich ausweisen, um GPU-Rechenleistung für das Training zu mieten?"
    answer: "In der Regel nicht. Marktplätze wie Vast.ai und RunPod verlangen eine E-Mail-Adresse und Guthaben im Voraus, aber keine Ausweisdokumente. RunPod verlangt eine KYC-Prüfung nur vor der ersten Zahlung mit Krypto. Bei AWS beginnen neue Konten mit einem GPU-Kontingent von null, das Sie erst beantragen müssen."
  - question: "Welches Datensatzformat erwartet das Trainingsskript?"
    answer: "Das Skript erwartet eine JSONL-Datei, in der jede Zeile ein JSON-Objekt mit einem Feld text enthält. Dieses Feld enthält Anweisung, Eingabe und Antwort als einen einzigen String mit Zeilenumbrüchen. Ein korrekt formatiertes Beispiel finden Sie in Schritt 4 dieses Leitfadens."
  - question: "Funktioniert diese Anleitung auch für andere Modelle als Llama?"
    answer: "Ja. Der Ablauf gilt für jedes Open-Weights-Modell, etwa Mistral, Qwen, Falcon und andere. Das Codebeispiel verwendet Llama-3.1-8B, aber für ein anderes Basismodell müssen Sie nur die Modellkennung ändern."
  - question: "Wie lange dauert das Fine-Tuning eines Modells mit 8B Parametern?"
    answer: "Die Trainingsdauer hängt von der Größe des Datensatzes ab. Ein typischer Lauf mit 1.000 Beispielen dauert auf einer RTX 4090 30 bis 60 Minuten. Größere Datensätze skalieren ungefähr linear: 10.000 Beispiele brauchen 5 bis 10 Stunden Rechenzeit."
  - question: "Was mache ich nach dem Training mit dem entfernten Rechner?"
    answer: "Sie müssen die Umgebung aufräumen: Datensatz, Trainingscode, Hugging-Face-Cache und Bash-Verlauf löschen. Dieser Leitfaden enthält die konkreten Befehle für das sichere Löschen, optional mit shred für eine gründliche Vernichtung der Dateien, bevor Sie die Miete beenden."
---

Wenn Sie diesen Artikel lesen, haben Sie vermutlich einen Datensatz, den Sie nicht zu OpenAI hochladen können – oder nicht wollen.

Damit sind Sie nicht allein. Für viele Unternehmen und unabhängige Entwickler wiegt das Risiko eines Datenabflusses schwerer als der Komfort von ChatGPT. Ob Patientenakten, die unter HIPAA fallen, eigener Quellcode, in dem Jahre an Entwicklungsarbeit stecken, oder sensible Finanzmodelle, die Märkte bewegen könnten: Wer Cloud-KI nutzt, vertraut sein wertvollstes geistiges Eigentum meist einem Dritten an.

Wenn dieser Dritte ein Technologiekonzern ist, der Kundendaten schon früher zum Training künftiger Modelle genutzt hat, wird „Vertrauen“ zu einem unbequemen Wort.

Die Lösung ist nicht, auf KI zu verzichten. Die Lösung ist, die Infrastruktur selbst in der Hand zu haben.

Open-Weights-Modelle auf Hardware feinabzustimmen, die Sie kontrollieren, ist längst keine akademische Nische mehr. Für datenschutzbewusste Organisationen ist es eine geschäftliche Notwendigkeit. Modelle wie Llama, Mistral, Qwen und Dutzende weitere dürfen kommerziell genutzt werden, ohne API-Gebühren und ohne Pflicht zur Datenweitergabe. Das Problem war immer der Zugang zu Rechenleistung. Ein eigener NVIDIA-H100-Cluster kostet Millionen an Investitionen. Bei AWS brauchen Sie eine Identitätsprüfung, Unternehmensverträge und Stundenpreise, die längere Trainingsläufe unerschwinglich machen.

Dieser Leitfaden zeigt einen dritten Weg. Sie lernen, wie Sie ein Open-Weights-Sprachmodell auf einer GPU feinabstimmen, die Sie auf einem Marktplatz mieten – oft Hardware, die Privatleuten irgendwo auf der Welt gehört. Wir behandeln die Einrichtung der Umgebung, Sicherheitsregeln für die Arbeit auf öffentlichen Knoten und den kompletten Trainingslauf.

Die Codebeispiele verwenden Llama-3.1-8B als konkretes, lauffähiges Beispiel. Der Ablauf gilt aber genauso für jedes Modell, das mit Hugging Face kompatibel ist. Tauschen Sie die Modellkennung aus, und Sie können Mistral-7B, Qwen2-7B oder jedes andere Open-Weights-Modell feinabstimmen, das zu Ihrem Anwendungsfall passt.

Das alles gelingt ohne langfristige Verträge und zu einem Bruchteil dessen, was klassische Cloud-Anbieter verlangen.

![Terminalfenster mit einer aktiven SSH-Verbindung zu einem entfernten GPU-Server](../_images/terminal-ssh-connection.png)

## Die Kosten des privaten Fine-Tunings

Bevor wir zur technischen Umsetzung kommen, klären wir den finanziellen Rahmen.

Wer ein Modell auf AWS trainiert, braucht große Instanzen und muss Kontingente beantragen. Die Instanz p4d.24xlarge (8x A100-GPUs) kostet 32,77 $ pro Stunde, und neue AWS-Konten starten mit einem GPU-Kontingent von null.

Auf einem GPU-Marktplatz mieten Sie Rechenleistung direkt von den Besitzern der Hardware. Das hat spürbare Folgen:

**Niedrigere Kosten:** Eine RTX 4090 kostet auf Marktplätzen etwa 0,30 $ bis 0,46 $ pro Stunde (September 2026). Für Modelle mit 8B Parametern und QLoRA schafft eine einzelne 4090 mit 24GB VRAM einen Fine-Tuning-Lauf je nach Datensatzgröße in zwei bis sechs Stunden. Die gesamten Rechenkosten liegen zwischen drei und acht Dollar.

**Ihre Daten bleiben auf einem Rechner:** Sie kopieren den Datensatz per SSH direkt auf den gemieteten Rechner, trainieren, laden das Ergebnis herunter und löschen alles. Kein Speicher-Bucket, keine dritte Kopie.

**Keine Hürden:** Sie brauchen weder die Zustimmung des Enterprise-Vertriebs eines Cloud-Anbieters noch eine Kontingenterhöhung. Sie laden Guthaben auf und mieten Hardware.

Zum Vergleich: Eine einzelne A10G auf AWS (g5.xlarge, die günstigste Option mit 24GB VRAM) kostet in us-east-1 etwa 1,01 $ pro Stunde. Rechnet man den Kontingentantrag, die Einrichtungszeit und die ungenutzte Rechenzeit während der Konfiguration hinzu, kostet der erste Lauf dort in Wahrheit weit mehr als die paar Dollar auf einem Marktplatz.

Die Zahlen im Detail finden Sie in unserem [Preisvergleich für GPU-Miete](/de/gpu-rental-pricing-comparison-2026/) und im Artikel über [die tatsächlichen Kosten einer GPU-Miete](/de/hidden-fees-in-gpu-rental/).

## Voraussetzungen

Diese Anleitung setzt voraus, dass Sie mit der Linux-Kommandozeile vertraut sind. Sie brauchen keinen Hochschulabschluss in maschinellem Lernen, sollten sich aber sicher im Dateisystem bewegen, Textdateien bearbeiten und Fehlermeldungen deuten können.

**Hardware-Anforderungen:**

- **GPU:** Mindestens 24GB VRAM. RTX 3090, RTX 4090 und A10G erfüllen das alle. Für das Modell mit 70B Parametern brauchen Sie 48GB oder mehr (A6000, zwei A100 oder H100).
- **Arbeitsspeicher:** 32GB oder mehr. Beim Laden des Modells landen die Gewichte zuerst im Arbeitsspeicher, bevor sie auf die GPU übertragen werden.
- **Speicherplatz:** 100GB oder mehr auf einer NVMe-SSD. Die Basisgewichte von Llama-3 8B belegen etwa 16GB. Datensatz, Checkpoints und der fertige Adapter kommen noch dazu.

**Zur Modellwahl:** Diese Anleitung verwendet Metas Llama-3.1-8B als Beispiel,
weil es zur größten Modellklasse gehört, die mit QLoRA-Quantisierung auf eine einzelne
GPU mit 24GB passt. Zur Llama-Familie gehören inzwischen auch Llama 4 Scout und Maverick.
Diese nutzen aber eine Mixture-of-Experts-Architektur mit insgesamt 109B bzw. 400B
Parametern und brauchen Konfigurationen mit mehreren GPUs, die über die Miete eines
einzelnen Knotens hinausgehen. Der hier beschriebene Ablauf gilt genauso für Mistral-7B,
Qwen2-7B, Gemma-2-9B und jedes andere mit Hugging Face kompatible Modell, das in den
VRAM Ihrer gemieteten Hardware passt.

**Software-Voraussetzungen:**

- Python 3.10 oder neuer
- Grundkenntnisse in PyTorch
- Ein Hugging-Face-Konto (nötig für den Download zugangsbeschränkter Modelle wie Llama, deren Lizenz Sie akzeptieren müssen)
- Ein Konto mit Guthaben bei einem GPU-Marktplatz, der ganze Rechner mit SSH-Zugang vermietet, etwa Vast.ai, RunPod oder TensorDock

Sie sind unsicher, welcher passt? Lesen Sie [was Sie brauchen, um eine GPU zu mieten](/de/what-you-need-to-rent-a-gpu/) und [GPUFlow vs. Vast.ai vs. RunPod vs. SaladCloud](/de/gpuflow-vs-vast-ai-vs-runpod/). GPUFlow selbst eignet sich für diese Anleitung nicht: Es vermietet Zugang zu KI-Modellen über eine API, keinen Rechner, auf dem Sie sich anmelden können.

## Schritt 1: Den Rechenknoten sichern

Im ersten Schritt besorgen Sie sich die Hardware. Bei den großen Cloud-Plattformen heißt das: Konto anlegen, GPU-Kontingent beantragen und auf die Freigabe warten. Auf einem Marktplatz geht es deutlich direkter.

Öffnen Sie den Marktplatz Ihrer Wahl und laden Sie etwas Guthaben auf. Die Oberfläche zeigt die verfügbaren Rechner mit technischen Daten, Stundenpreisen und Zuverlässigkeitswerten.

Filtern Sie nach Rechnern mit diesen Eigenschaften:

- **GPU:** RTX 4090 (24GB VRAM) oder RTX 6000 Ada (48GB VRAM)
- **Arbeitsspeicher:** mindestens 32GB
- **Speicherplatz:** 100GB+ frei
- **Zuverlässigkeit:** Uptime-Wert von 95 % oder höher

Wählen Sie einen Rechner aus und starten Sie die Miete. Nehmen Sie ein Image, auf dem CUDA und PyTorch bereits installiert sind. Das spart Einrichtungszeit, und auch die wird berechnet.

**Sicherheitshinweise für öffentliche Knoten:**

Wenn Sie in einem fremden Netzwerk einen Rechner mieten, arbeiten Sie auf Hardware, die einem Unbekannten gehört und die er physisch kontrolliert. Die Virtualisierungsschicht bietet eine wirksame Isolation, trotzdem ist Vorsicht angebracht:

1. **Speichern Sie keine privaten Schlüssel auf dem entfernten Rechner.** SSH-Schlüssel für andere Systeme, Cloud-Zugangsdaten und API-Tokens für Produktivdienste haben auf einem Mietknoten nichts verloren.

2. **Betrachten Sie das Dateisystem als feindlich.** Gehen Sie davon aus, dass der Host alles, was Sie auf die Festplatte schreiben, nach Ihrer Trennung theoretisch wiederherstellen könnte. Das sichere Löschen behandeln wir in Schritt 6.

3. **Verschlüsseln Sie sensible Daten bei der Übertragung.** Darum geht es in Schritt 3.

4. **Verwenden Sie keine Passwörter mehrfach.** Wenn die Mietoberfläche Standard-Zugangsdaten vorgibt, ändern Sie sie sofort oder erzeugen Sie ein neues SSH-Schlüsselpaar.

Sobald die Miete bestätigt ist, zeigt das Dashboard die Verbindungsdaten an. Sie erhalten einen SSH-Befehl, der etwa so aussieht:

```bash
ssh -p 22345 user@203.0.113.42
```

Öffnen Sie ein Terminal auf Ihrem Rechner und führen Sie diesen Befehl aus. Bestätigen Sie den Fingerabdruck des Host-Schlüssels, wenn Sie danach gefragt werden. Sie sind jetzt mit Ihrem gemieteten GPU-Knoten verbunden.

Prüfen Sie, ob die Hardware Ihrer Bestellung entspricht:

```bash
nvidia-smi
```

Die Ausgabe sollte Ihre gemietete GPU, ihren Speicher und die installierte Treiberversion zeigen. Erscheint die GPU nicht oder weichen die Daten von Ihrer Bestellung ab, trennen Sie die Verbindung sofort und melden Sie die Abweichung beim Support des Marktplatzes.

## Schritt 2: Die Umgebung einrichten

Steht die SSH-Verbindung, bauen Sie als Nächstes eine saubere Python-Umgebung auf. Die meisten Mietknoten bringen NVIDIA-Treiber und CUDA-Toolkit bereits mit. Wer sich aber auf die systemweiten Python-Pakete des Hosts verlässt, handelt sich Abhängigkeitskonflikte ein, deren Fehlersuche Stunden kostet.

Wir legen deshalb eine isolierte virtuelle Umgebung an, damit alles reproduzierbar und stabil bleibt.

Mit diesen Befehlen erstellen Sie Ihren Arbeitsbereich:

```bash
mkdir ~/llama3-finetune
cd ~/llama3-finetune
python3 -m venv venv
source venv/bin/activate
```

Die Eingabeaufforderung zeigt jetzt `(venv)` an: Die virtuelle Umgebung ist aktiv. Alle weiteren Pakete landen in diesem Verzeichnis, das System des Hosts bleibt unberührt.

Prüfen Sie vor der Installation der Python-Pakete, ob das CUDA-Toolkit erreichbar ist:

```bash
nvcc --version
```

Notieren Sie sich die CUDA-Version. Sie brauchen sie, damit PyTorch kompatibel ist. Die meisten Mietknoten laufen mit CUDA 11.8 oder 12.1. Wird `nvcc` nicht gefunden, liegt das CUDA-Toolkit womöglich nicht in Ihrem PATH. Meist hilft es, die passende Umgebungsdatei einzulesen:

```bash
source /etc/profile.d/cuda.sh
```

Gibt es diese Datei nicht, sehen Sie in der Dokumentation des Marktplatzes nach, wie Ihr Knoten konfiguriert ist.

Installieren Sie jetzt das PyTorch-Ökosystem. Der folgende Befehl installiert PyTorch mit Unterstützung für CUDA 12.1. Läuft Ihr Knoten mit einer anderen Version, passen Sie das CUDA-Suffix an:

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

Installieren Sie danach die Bibliotheken für effizientes Fine-Tuning. Wir nutzen das Hugging-Face-Ökosystem, dazu bitsandbytes für die Quantisierung und PEFT für parametereffizientes Training:

```bash
pip install transformers==4.40.0 datasets==2.19.0 peft==0.10.0 bitsandbytes==0.43.1 trl==0.8.6 accelerate==0.29.0
```

**Feste Versionen sind wichtig.** Die oben genannten Versionen sind zum Zeitpunkt des Schreibens getestet und miteinander kompatibel. Das Hugging-Face-Ökosystem entwickelt sich schnell, und Installationen ohne feste Versionen bringen häufig inkompatible Änderungen mit. Treten Importfehler oder unerwartetes Verhalten auf, sind abweichende Versionen die wahrscheinlichste Ursache.

Zum Schluss melden Sie sich bei Hugging Face an. Die Gewichte von Llama-3 sind durch eine Lizenzvereinbarung geschützt, für die Sie ein Hugging-Face-Konto brauchen. Öffnen Sie das [Meta-Llama-3-Repository](https://huggingface.co) und akzeptieren Sie die Lizenzbedingungen. Erzeugen Sie dann in den Einstellungen Ihres Hugging-Face-Kontos ein Access-Token.

Führen Sie den Anmeldebefehl aus:

```bash
huggingface-cli login
```

Fügen Sie Ihr Access-Token ein, wenn Sie dazu aufgefordert werden. Es wird unter `~/.cache/huggingface/token` gespeichert. Damit dürfen Sie zugangsbeschränkte Modellgewichte direkt auf den Mietknoten herunterladen.

![Python-Code in einem Terminal mit Konfigurationsparametern für das Modell Llama-3](../_images/python-llama3-config.png)

## Schritt 3: Daten sicher übertragen

In diesem Abschnitt geht es um den Hauptgrund, warum Sie einen Rechner mieten, statt eine API aufzurufen: die Hoheit über Ihre Daten.

Der übliche Cloud-Ablauf sieht so aus: Sie laden den Datensatz in einen Speicher-Bucket hoch – S3, Google Cloud Storage, Azure Blob – und von dort auf Ihre Recheninstanz. Dabei entstehen mehrere Kopien Ihrer sensiblen Daten auf Systemen, die Sie nicht kontrollieren. Der Speicheranbieter hat Zugriff. Der Rechenanbieter hat Zugriff. Beide protokollieren Ihre Aktivität.

Wir umgehen das vollständig und übertragen die Daten direkt und verschlüsselt.

Zum SSH-Protokoll gehört `scp` (Secure Copy Protocol). Es überträgt Dateien über denselben verschlüsselten Kanal, den Sie auch für das Terminal nutzen. Ihre Daten gehen direkt von Ihrem Rechner zum Mietknoten, ohne einen Zwischenspeicher zu berühren.

Öffnen Sie auf Ihrem **eigenen Rechner** ein **neues Terminalfenster**. Lassen Sie die bestehende SSH-Sitzung zum Mietknoten offen. Führen Sie den folgenden Befehl aus und setzen Sie dabei Ihren tatsächlichen Dateipfad und Ihre Verbindungsdaten ein:

```bash
scp -P 22345 /path/to/your/dataset.jsonl user@203.0.113.42:~/llama3-finetune/
```

Die Option `-P` gibt die Portnummer an (beachten Sie das große P, anders als das kleine `-p` bei ssh). Bei großen Datensätzen kann die Übertragung einige Minuten dauern. Eine Fortschrittsanzeige zeigt die übertragenen Bytes.

**Datensätze über 1GB** sollten Sie vor der Übertragung komprimieren:

```bash
# On your local machine
gzip -k dataset.jsonl
scp -P 22345 dataset.jsonl.gz user@203.0.113.42:~/llama3-finetune/

# Then on the remote node
cd ~/llama3-finetune
gunzip dataset.jsonl.gz
```

**Zusätzliche Schutzmaßnahmen:**

Wenn Ihr Bedrohungsmodell auch versierte Angreifer umfasst, können Sie den Datensatz vor der Übertragung mit GPG oder age verschlüsseln. Das ist eine zusätzliche Schutzschicht: Selbst wenn die Übertragung irgendwie abgefangen würde, bliebe der Inhalt unlesbar.

```bash
# On your local machine (using age encryption)
age -p dataset.jsonl > dataset.jsonl.age
scp -P 22345 dataset.jsonl.age user@203.0.113.42:~/llama3-finetune/

# On the remote node
age -d dataset.jsonl.age > dataset.jsonl
rm dataset.jsonl.age
```

Für die meisten Nutzer bietet die normale SCP-Übertragung ausreichend Schutz. Das SSH-Protokoll verschlüsselt mit AES-256. Die Prüfung des Host-Schlüssels verhindert Man-in-the-Middle-Angriffe. Ihre Daten laufen über keinen fremden Speicherdienst.

## Schritt 4: Das Fine-Tuning-Skript

Für das überwachte Fine-Tuning nutzen wir die Klasse `SFTTrainer` aus der Bibliothek TRL (Transformer Reinforcement Learning). Sie nimmt Ihnen viel Komplexität ab und bleibt trotzdem für produktive Workloads konfigurierbar.

Bevor Sie das Trainingsskript schreiben, müssen Sie wissen, welches Datensatzformat erwartet wird.

**Anforderungen an das Datensatzformat:**

Das Skript erwartet eine JSONL-Datei (JSON Lines), in der jede Zeile ein gültiges JSON-Objekt mit einem Feld `text` enthält. Dieses Feld enthält das komplette Trainingsbeispiel als einen einzigen String.

Hier drei korrekt formatierte Zeilen als Beispiel:

```json
{"text": "### Instruction: Summarize the following legal clause in plain English.\n\n### Input: Party A shall indemnify, defend, and hold harmless Party B from any claims, damages, or expenses arising from Party A's negligence or willful misconduct.\n\n### Response: Party A agrees to protect Party B from any legal claims or costs that result from Party A's mistakes or intentional wrongdoing."}
{"text": "### Instruction: Extract the key financial metrics from this earnings report.\n\n### Input: Q3 revenue reached $4.2B, up 12% YoY. Operating margin improved to 23.5% from 21.2%. Free cash flow was $890M.\n\n### Response: Revenue: $4.2 billion (12% year-over-year growth). Operating margin: 23.5% (up from 21.2%). Free cash flow: $890 million."}
{"text": "### Instruction: Identify potential HIPAA violations in this process description.\n\n### Input: Patient records are emailed to the billing department as PDF attachments. The billing staff prints these for manual review and shreds them after processing.\n\n### Response: Potential violations include: unencrypted email transmission of PHI, physical documents that may be visible to unauthorized personnel during processing, and lack of documented chain of custody. Recommend encrypted file transfer and on-screen review only."}
```

**Wichtige Hinweise zur Formatierung:**

1. Jedes JSON-Objekt steht in genau einer Zeile. Kein mehrzeiliges JSON.
2. Zeilenumbrüche im Feld `text` müssen als `\n` maskiert sein.
3. Anführungszeichen im Text müssen als `\"` maskiert sein.
4. Die Datei muss UTF-8-kodiert sein.

Liegen Ihre Ausgangsdaten in einem anderen Format vor (CSV, Parquet, getrennte Spalten für Anweisung und Antwort), müssen Sie sie vor der Übertragung in diese Struktur bringen. Die Python-Bibliothek `json` übernimmt das Maskieren automatisch:

```python
import json

with open('dataset.jsonl', 'w') as f:
    for example in your_data:
        text = f"### Instruction: {example['instruction']}\n\n### Input: {example['input']}\n\n### Response: {example['output']}"
        f.write(json.dumps({"text": text}) + '\n')
```

Wenn der Datensatz bereitliegt, legen Sie auf dem entfernten Knoten das Trainingsskript an:

```bash
cd ~/llama3-finetune
nano train.py
```

Fügen Sie die folgende Konfiguration ein. Das Skript nutzt QLoRA, um ein Modell mit 8B Parametern innerhalb der Speichergrenzen einer 24GB-GPU feinabzustimmen. Das Beispiel verwendet Llama-3.1-8B, Sie können aber jedes kompatible Modell einsetzen, indem Sie die Variable MODEL_NAME ändern:

```python
import torch
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    TrainingArguments,
)
from peft import LoraConfig
from trl import SFTTrainer

# ============================================
# CONFIGURATION - Modify these values as needed
# ============================================

# Base model identifier on Hugging Face
# Change this to fine-tune a different model (e.g., "mistralai/Mistral-7B-v0.1")
MODEL_NAME = "meta-llama/Llama-3.1-8B"

# Name for your fine-tuned adapter
OUTPUT_NAME = "llama-3-8b-custom"

# Path to your dataset
DATASET_PATH = "dataset.jsonl"

# Training hyperparameters
NUM_EPOCHS = 1
BATCH_SIZE = 4
LEARNING_RATE = 2e-4
MAX_SEQ_LENGTH = 512

# LoRA hyperparameters
LORA_RANK = 16
LORA_ALPHA = 16
LORA_DROPOUT = 0.05

# ============================================
# QUANTIZATION CONFIGURATION
# ============================================

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True,
)

# ============================================
# MODEL LOADING
# ============================================

print("Loading base model...")
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    quantization_config=bnb_config,
    device_map="auto",
    trust_remote_code=True,
)
model.config.use_cache = False

print("Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
tokenizer.pad_token = tokenizer.eos_token
tokenizer.padding_side = "right"

# ============================================
# DATASET LOADING
# ============================================

print(f"Loading dataset from {DATASET_PATH}...")
dataset = load_dataset("json", data_files=DATASET_PATH, split="train")
print(f"Dataset contains {len(dataset)} examples")

# ============================================
# LORA CONFIGURATION
# ============================================

peft_config = LoraConfig(
    r=LORA_RANK,
    lora_alpha=LORA_ALPHA,
    lora_dropout=LORA_DROPOUT,
    bias="none",
    task_type="CAUSAL_LM",
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
)

# ============================================
# TRAINING ARGUMENTS
# ============================================

training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=NUM_EPOCHS,
    per_device_train_batch_size=BATCH_SIZE,
    gradient_accumulation_steps=1,
    learning_rate=LEARNING_RATE,
    weight_decay=0.001,
    fp16=True,
    logging_steps=10,
    save_steps=100,
    save_total_limit=3,
    optim="paged_adamw_32bit",
    lr_scheduler_type="cosine",
    warmup_ratio=0.03,
    report_to="none",
)

# ============================================
# TRAINER INITIALIZATION AND EXECUTION
# ============================================

print("Initializing trainer...")
trainer = SFTTrainer(
    model=model,
    train_dataset=dataset,
    peft_config=peft_config,
    dataset_text_field="text",
    max_seq_length=MAX_SEQ_LENGTH,
    tokenizer=tokenizer,
    args=training_args,
)

print("Starting training...")
trainer.train()

print(f"Saving adapter to {OUTPUT_NAME}...")
trainer.model.save_pretrained(OUTPUT_NAME)
tokenizer.save_pretrained(OUTPUT_NAME)

print("Training complete.")
```

Speichern Sie die Datei mit `Ctrl+O` und beenden Sie den Editor mit `Ctrl+X`.

**Die wichtigsten Parameter:**

- **LORA_RANK (r=16):** Bestimmt, wie ausdrucksstark der Adapter ist. Höhere Werte lernen mehr, brauchen aber mehr Speicher. Üblich sind Werte zwischen 8 und 64.

- **LORA_ALPHA (16):** Skalierungsfaktor für die LoRA-Gewichte. Eine gängige Faustregel setzt ihn gleich dem Rang.

- **MAX_SEQ_LENGTH (512):** Maximale Länge der Trainingsbeispiele in Tokens. Längere Sequenzen brauchen mehr Speicher. Bei OOM-Fehlern senken Sie zuerst diesen Wert.

- **BATCH_SIZE (4):** Anzahl der Beispiele, die gleichzeitig verarbeitet werden. Reicht der Speicher nicht, senken Sie den Wert auf 2 oder 1.

- **target_modules:** Die Schichten, in die die LoRA-Adapter eingefügt werden. Bei Llama-3 liefern die Projektionsschichten der Attention (q, k, v, o) die besten Ergebnisse.

Starten Sie das Training mit:

```bash
python train.py
```

Das Skript lädt zuerst die Gewichte des Basismodells herunter (bei einem 8B-Modell etwa 16GB). Das passiert nur einmal, spätere Läufe nutzen die zwischengespeicherten Gewichte. Nach dem Laden sehen Sie den Trainingsfortschritt, alle 10 Schritte mit dem aktuellen Loss-Wert.

## Schritt 5: Den Trainingslauf überwachen

Während das Skript läuft, sollten Sie den Zustand der GPU im Blick behalten. Läuft der VRAM voll oder überschreitet die Temperatur sichere Grenzwerte, stürzt der Prozess ab. Im schlimmsten Fall ist dann Ihr Checkpoint beschädigt und die bezahlte Mietzeit verloren.

Öffnen Sie auf Ihrem Rechner ein zweites Terminalfenster und bauen Sie eine weitere SSH-Verbindung zum Mietknoten auf:

```bash
ssh -p 22345 user@203.0.113.42
```

Mit diesem Befehl sehen Sie die GPU-Werte in Echtzeit:

```bash
watch -n 1 nvidia-smi
```

![Terminal mit der Ausgabe von nvidia-smi, die Speicherauslastung und Temperatur der GPU zeigt](../_images/nvidia-smi-monitoring.png)

Die Anzeige aktualisiert sich jede Sekunde und zeigt Speicherbelegung, GPU-Auslastung in Prozent und Temperatur. Auf einer RTX 4090 mit der Konfiguration aus diesem Leitfaden sollten Sie etwa Folgendes sehen:

- **Speicherbelegung:** 18GB bis 22GB der verfügbaren 24GB
- **GPU-Auslastung:** 90 % bis 100 % während aktiver Trainingsschritte
- **Temperatur:** 60 °C bis 80 °C, je nach Kühlung beim Host

**Häufige Probleme und ihre Lösung:**

**Speicher nahe 24GB:** Stößt die Speicherbelegung ständig an die Obergrenze, senken Sie `BATCH_SIZE` im Trainingsskript auf 2 oder 1. Alternativ reduzieren Sie `MAX_SEQ_LENGTH` auf 256. In beiden Fällen müssen Sie den Trainingslauf neu starten.

**GPU-Auslastung nahe 0 %:** Das deutet meist auf einen Engpass beim Laden der Daten hin. Die CPU liefert der GPU die Beispiele nicht schnell genug. Auf Knoten mit NVMe ist das seltener, kann bei sehr großen Datensätzen aber vorkommen. Bereiten Sie den Datensatz in diesem Fall vor der Übertragung in ein effizienteres Format (Arrow/Parquet) auf.

**Temperatur über 85 °C:** Manche Hosts betreiben ihre GPUs in schlecht belüfteten Gehäusen. Dauerhaft hohe Temperaturen können thermisches Drosseln auslösen und Ihr Training verlangsamen. Liegt die Temperatur ständig über 85 °C, beenden Sie die Miete und wählen einen anderen Knoten. Schäden an der Hardware sind das Problem des Hosts, verlorene Zeit und beschädigte Checkpoints aber Ihres.

**Die Loss-Kurve richtig lesen:**

Ihr Trainingsskript gibt alle 10 Schritte einen Loss-Wert aus. Er gibt an, wie „falsch“ die Vorhersagen des Modells sind – niedriger ist besser. Erwarten können Sie:

- **Anfangs-Loss:** je nach Datensatz meist zwischen 1,5 und 3,0
- **Verlauf:** stetig fallend über die ersten paar hundert Schritte
- **End-Loss:** bei einem gut konfigurierten Lauf meist zwischen 0,5 und 1,5

Stagniert der Loss von Anfang an (kein Rückgang nach 100 Schritten), ist die Lernrate womöglich zu niedrig. Schwankt der Loss stark oder steigt er, ist sie zu hoch. Der Standardwert `2e-4` funktioniert für die meisten Datensätze gut, gelegentlich ist aber eine Anpassung nötig.

Sinkt der Loss gleichmäßig und springt dann plötzlich auf sehr hohe Werte (10+), enthält Ihr Datensatz wahrscheinlich fehlerhafte Beispiele. Stoppen Sie das Training, prüfen Sie Ihre JSONL-Datei auf Kodierungsfehler oder falsch maskierte Zeichen und starten Sie neu.

Ein typischer Fine-Tuning-Lauf mit 1.000 Beispielen dauert auf einer RTX 4090 30 bis 60 Minuten. Größere Datensätze skalieren ungefähr linear: 10.000 Beispiele brauchen 5 bis 10 Stunden.

## Schritt 6: Das Modell abholen und die Umgebung bereinigen

Nach dem Training liegen Ihre feinabgestimmten Gewichte als LoRA-Adapter in dem Verzeichnis, das Sie mit `OUTPUT_NAME` festgelegt haben. Der Adapter ist kompakt – meist 100MB bis 500MB, verglichen mit den 16GB des vollständigen Basismodells.

Prüfen Sie zuerst, ob die Adapterdateien vorhanden sind:

```bash
ls -la ~/llama3-finetune/llama-3-8b-custom/
```

Sie sollten unter anderem `adapter_config.json`, `adapter_model.safetensors` und die Tokenizer-Dateien sehen.

**Führen Sie den Adapter nicht auf dem Mietknoten mit dem Basismodell zusammen.** Beim Merge werden die LoRA-Gewichte mit dem Basismodell zu einem eigenständigen, feinabgestimmten Modell kombiniert. Dafür muss das vollständige 16-Bit-Basismodell in den Speicher geladen werden, was den VRAM einer 24GB-Karte übersteigen kann. Führen Sie den Merge auf Ihrer eigenen Infrastruktur durch oder laden Sie den Adapter bei der Inferenz einfach zusammen mit dem Basismodell. Die PEFT-Bibliothek erledigt das problemlos:

```python
from peft import PeftModel
from transformers import AutoModelForCausalLM

base_model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B",
    device_map="auto",
)
model = PeftModel.from_pretrained(base_model, "./llama-3-8b-custom")
```

Um den Adapter herunterzuladen, wechseln Sie zurück in Ihr **lokales Terminal** (nicht in die SSH-Sitzung) und führen Folgendes aus:

```bash
scp -r -P 22345 user@203.0.113.42:~/llama3-finetune/llama-3-8b-custom ./
```

Die Option `-r` kopiert das gesamte Verzeichnis rekursiv. Prüfen Sie, ob die Übertragung vollständig war, indem Sie die lokalen Dateigrößen mit denen auf dem entfernten Rechner vergleichen.

**Die entfernte Umgebung bereinigen:**

An diesem Schritt erkennt man Profis. Auf Ihrem Mietknoten liegen jetzt Ihr vertraulicher Datensatz, Ihr Trainingscode und zwischengespeicherte Modellgewichte. Dieses Material auf einem Rechner zu lassen, den Sie nicht kontrollieren, verstößt gegen die Grundregeln der operativen Sicherheit.

Wechseln Sie zurück in Ihre SSH-Sitzung auf dem Mietknoten und führen Sie die folgenden Befehle aus:

```bash
# Remove your working directory and all contents
rm -rf ~/llama3-finetune

# Clear the Hugging Face cache (contains downloaded model weights)
rm -rf ~/.cache/huggingface

# Clear Python package cache
rm -rf ~/.cache/pip

# Clear bash history
history -c
cat /dev/null > ~/.bash_history

# Clear any potential swap residue (may require sudo depending on node config)
sync
```

Wenn der Knoten `shred` bereitstellt und Sie zusätzlich sicherstellen möchten, dass gelöschte Dateien nicht wiederhergestellt werden können:

```bash
# Secure deletion (slower but more thorough)
find ~/llama3-finetune -type f -exec shred -u {} \;
rm -rf ~/llama3-finetune
```

Trennen Sie die SSH-Sitzung:

```bash
exit
```

Gehen Sie zurück ins Dashboard des Marktplatzes und beenden Sie die Miete samt eventuellem Speicher-Volume, damit keine weiteren Kosten anfallen.

## Inferenz mit dem feinabgestimmten Modell

Sobald der Adapter auf Ihrem Rechner liegt, können Sie Inferenz ganz ohne Cloud betreiben. Ein minimales Beispiel:

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import PeftModel

# Quantization config (same as training)
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
)

# Load base model
base_model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B",
    quantization_config=bnb_config,
    device_map="auto",
)

# Load your fine-tuned adapter
model = PeftModel.from_pretrained(base_model, "./llama-3-8b-custom")

# Load tokenizer
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3.1-8B")

# Generate a response
prompt = "### Instruction: Summarize the contract clause.\n\n### Input: The Licensee shall not reverse engineer, decompile, or disassemble the Software.\n\n### Response:"

inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
outputs = model.generate(**inputs, max_new_tokens=100, temperature=0.7)
response = tokenizer.decode(outputs[0], skip_special_tokens=True)

print(response)
```

Für den produktiven Einsatz können Sie das Ganze mit FastAPI oder Flask als API bereitstellen oder über Inferenzserver wie vLLM oder Text Generation Inference (TGI) ausliefern. Einen Vergleich finden Sie in [Ollama vs. vLLM vs. TGI auf einer RTX 4090](/de/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/).

## Fazit

Sie haben ein großes Sprachmodell mit vertraulichen Daten feinabgestimmt und diese Daten dabei so kurz wie möglich auf nur einem Rechner gehalten. Dafür mussten Sie weder Unternehmensverträge unterschreiben noch einem Technologiekonzern Zugriff auf Ihr geistiges Eigentum geben.

Die Gesamtkosten lagen bei einem zweistündigen Trainingslauf auf einer RTX 4090 zu 0,45 $ pro Stunde bei neunzig Cent. Eine einzelne A10G kostet auf AWS etwa 1,01 $ pro Stunde, der Lauf selbst wäre also auch dort nicht teuer. Der Unterschied liegt im Kontingentantrag und in der Einrichtung.

Wichtiger noch: Ihr Datensatz ist nie über einen Speicherdienst gelaufen und wurde nach getaner Arbeit vom gemieteten Rechner gelöscht.

Die Zeit der Abhängigkeit von Closed-Source-APIs geht zu Ende. Organisationen, die Datenschutz brauchen, Forscher, denen Unabhängigkeit wichtig ist, und Entwickler, die Kontrolle wollen, haben eine Alternative. Gemietete GPUs geben ihnen Infrastruktur, Kosten und Daten zurück in die Hand.

Ihr feinabgestimmtes Modell liegt jetzt auf Hardware, die Sie kontrollieren. Wie Sie es bereitstellen, wer darauf zugreifen darf und wofür es eingesetzt wird, entscheiden allein Sie.

---

## Weiterlesen

Dieser Leitfaden hat den grundlegenden Ablauf für privates LLM-Fine-Tuning behandelt. Die folgenden Artikel vertiefen verwandte Themen:

**Kosten verstehen:**

- [Preisvergleich GPU-Miete 2026](/de/gpu-rental-pricing-comparison-2026/) – Kostenanalyse für Marktplätze und große Clouds
- [Die tatsächlichen Kosten einer GPU-Miete](/de/hidden-fees-in-gpu-rental/) – Kostenfaktoren, die auf keiner Preisseite stehen

**Einstieg:**

- [Was Sie 2026 brauchen, um eine GPU zu mieten](/de/what-you-need-to-rent-a-gpu/) – Registrierung, Verifizierung und Zahlung auf jeder Plattform
- [So schützen Sie Ihren Datensatz auf einem öffentlichen GPU-Knoten](/de/how-to-secure-dataset-on-public-gpu-node/) – Sicherheitsmaßnahmen vor, während und nach dem Training

**Optionen vergleichen:**

- [RunPod vs. Vast.ai im Vergleich](/de/runpod-vs-vastapi-comparison/) – Wie sich die beiden größten Marktplätze unterscheiden
- [GPUFlow vs. Vast.ai vs. RunPod vs. SaladCloud](/de/gpuflow-vs-vast-ai-vs-runpod/) – Rechner, Container und API-Keys im Vergleich
