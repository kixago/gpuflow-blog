---
title: "Stable Diffusion LoRA trainieren für unter 10 $ mit einer gemieteten GPU"
description: "Schritt-für-Schritt-Anleitung: eigene LoRA-Modelle für Stable Diffusion auf einer gemieteten GPU trainieren. Mit GPU-Auswahl, Datensatzvorbereitung, Trainingskonfiguration und Tipps zum Kostensparen."
excerpt: "Eine praxisnahe Anleitung, wie Sie hochwertige LoRA-Modelle auf einer gemieteten GPU trainieren. Mit Anbieterwahl, Konfiguration und Tricks, um die Gesamtkosten unter 10 $ zu halten."
pubDate: 2026-02-11
updatedDate: 2026-09-29
locale: "de"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/stable-diffusion-lora-training-guide.jpg"
heroImageAlt: "NVIDIA-Grafikkarte in einem Server-Rack mit sichtbaren Lüftern und LED-Beleuchtung"
faq:
  - question: "Kann ich LoRA-Modelle auf meiner eigenen GPU trainieren, statt eine zu mieten?"
    answer: "Ja, sofern Sie eine NVIDIA-GPU mit mindestens 12GB VRAM haben, etwa eine RTX 3060 oder besser. Stromkosten, Verschleiß und die deutlich längeren Trainingszeiten auf Consumer-Hardware machen das Mieten bei gelegentlichen Projekten aber oft zur günstigeren Wahl."
  - question: "Wie lange dauert ein typisches LoRA-Training?"
    answer: "Die meisten LoRA-Trainings sind auf einer RTX 4090 oder RTX 3090 in ein bis drei Stunden abgeschlossen. Die genaue Dauer hängt von der Größe des Datensatzes, der Anzahl der Epochen und der Batch-Größe ab."
  - question: "Wie viele Bilder brauche ich mindestens für ein LoRA-Training?"
    answer: "Brauchbare Ergebnisse sind schon mit fünfzehn bis zwanzig Bildern möglich. Mit dreißig bis hundert gut beschrifteten Bildern wird die Qualität aber meist besser. Bildqualität und genaue Captions zählen mehr als die reine Menge."
  - question: "Welcher Anbieter für GPU-Miete bietet das beste Preis-Leistungs-Verhältnis für LoRA-Training?"
    answer: "Vast.ai hat meist die niedrigsten Stundenpreise für RTX-4090-GPUs. RunPod bietet mit fertigen Templates die einfachste Oberfläche für alle, die zum ersten Mal eine GPU mieten."
  - question: "Ist es günstiger, mehrere LoRA-Modelle in einer Sitzung zu trainieren?"
    answer: "Ja. Wer mehrere LoRAs in einer längeren Sitzung trainiert, spart die wiederholte Einrichtung und minimiert Kosten für ungenutzte GPU-Zeit. Drei bis fünf LoRA-Modelle in einer vierstündigen Sitzung kosten meist weniger als die Hälfte dessen, was einzelne Trainings kosten würden."
---

# Stable Diffusion LoRA trainieren für unter 10 $

Eigene LoRA-Modelle für Stable Diffusion zu trainieren, ist heute einer der einfachsten Wege zu individuellen KI-Bildern. Ob Sie einen bestimmten künstlerischen Stil nachbilden, Gesichter von Figuren konsistent darstellen oder das Modell auf Produktfotos abstimmen wollen: Mit LoRA-Training erreichen Sie das ohne den Rechenaufwand eines vollständigen Fine-Tunings.

Oft wird angenommen, dafür brauche man entweder teure eigene Hardware oder ein ordentliches Cloud-Budget. Beides stimmt nicht. Bei den aktuellen Mietpreisen für GPUs und mit einer effizienten Trainingskonfiguration trainieren Sie produktionsreife LoRA-Modelle für unter zehn Dollar – oft sogar für deutlich weniger.

Diese Anleitung führt durch den gesamten Ablauf: passende Hardware wählen, den Trainingsdatensatz vorbereiten, die Trainingsparameter konfigurieren, den Trainingslauf starten und die Ergebnisse prüfen. Ich nenne in jeder Phase konkrete Kosten, denn vage Versprechen von „günstigem KI-Training“ helfen niemandem, der ein echtes Projektbudget plant.

**Was Sie vor dem Start brauchen:**

- Zwanzig bis hundert Trainingsbilder (zu den Auswahlkriterien weiter unten mehr)
- Grundkenntnisse im Umgang mit der Kommandozeile
- Eine Zahlungskarte, um Guthaben auf einer Plattform für GPU-Miete aufzuladen
- Etwa zwei bis vier Stunden konzentrierte Zeit
- Ein Budget von fünf bis fünfzehn Dollar für den ersten Trainingslauf

![Modernes Rechenzentrum mit Reihen leistungsstarker GPU-Server für Machine-Learning-Workloads](../_images/data-center-with-person.jpg)

---

## Inhaltsverzeichnis

- [Was LoRA ist und warum es sich lohnt](#was-lora-ist-und-warum-es-sich-lohnt)
- [Die richtige GPU für das Training wählen](#die-richtige-gpu-für-das-training-wählen)
- [Anbieter für GPU-Miete im Vergleich](#anbieter-für-gpu-miete-im-vergleich)
- [Den Trainingsdatensatz vorbereiten](#den-trainingsdatensatz-vorbereiten)
- [Die Trainingsumgebung einrichten](#die-trainingsumgebung-einrichten)
- [Trainingsparameter konfigurieren](#trainingsparameter-konfigurieren)
- [Den Trainingslauf starten](#den-trainingslauf-starten)
- [Die LoRA prüfen und testen](#die-lora-prüfen-und-testen)
- [Strategien zur Kostensenkung](#strategien-zur-kostensenkung)
- [Häufige Probleme und Lösungen](#häufige-probleme-und-lösungen)
- [Häufig gestellte Fragen](#häufig-gestellte-fragen)

---

## Was LoRA ist und warum es sich lohnt

LoRA steht für Low-Rank Adaptation. Mit dieser Technik stimmen Sie große neuronale Netze fein, indem Sie eine kleine Zahl zusätzlicher Parameter trainieren, statt das ganze Modell zu verändern. Das ursprüngliche Stable-Diffusion-Modell hat fast eine Milliarde Parameter. Ein vollständiges Fine-Tuning müsste sie alle anpassen und bräuchte dafür viel GPU-Speicher und lange Trainingszeiten.

LoRA umgeht dieses Problem: Die ursprünglichen Modellgewichte werden eingefroren, trainiert werden nur kleine Adaptermatrizen, die verändern, wie das Modell Informationen verarbeitet. Eine typische LoRA-Datei ist zehn bis zweihundert Megabyte groß, ein vollständiger Stable-Diffusion-Checkpoint dagegen zwei bis sechs Gigabyte.

Das hat in der Praxis spürbare Folgen:

**Speichereffizienz.** LoRA-Training braucht weit weniger GPU-VRAM als ein vollständiges Fine-Tuning. Auf einer GPU mit 24GB lassen sich problemlos LoRAs für SDXL-Modelle trainieren, deren vollständiges Fine-Tuning 40GB oder mehr bräuchte.

**Trainingsgeschwindigkeit.** Weil weniger Parameter trainiert werden, ist jede Epoche schneller fertig. Was beim vollständigen Fine-Tuning zwölf Stunden dauern kann, schafft LoRA oft in neunzig Minuten.

**Kombinierbarkeit.** Mehrere LoRAs lassen sich bei der Inferenz kombinieren. Sie können etwa eine LoRA für den künstlerischen Stil und eine andere für konsistente Figuren nutzen und beide in unterschiedlicher Stärke mischen, ohne neu zu trainieren.

**Speicherung und Weitergabe.** Dank der kleinen Dateien lassen sich LoRAs leicht teilen und verwalten. Dutzende spezialisierte LoRAs vorzuhalten, ist kein Speicherproblem.

Diese Effizienz macht Training für unter zehn Dollar erst möglich. Sie mieten teure Hardware für ein bis drei Stunden statt für acht bis vierundzwanzig.

---

## Die richtige GPU für das Training wählen

Bei der GPU-Wahl gilt es, drei Faktoren abzuwägen: VRAM, Trainingsgeschwindigkeit und Mietpreis. Die gerade noch ausreichende Option und die optimale Wahl liegen deutlich auseinander.

### VRAM-Anforderungen

Für LoRA-Training mit Stable Diffusion 1.5 sind 12GB VRAM das praktische Minimum. Mit kleineren Batches und geringerer Auflösung geht es auch mit 8GB, darunter leidet aber oft die Trainingsqualität.

Für SDXL-LoRA-Training sind 16GB das Minimum, 24GB sind klar vorzuziehen. SDXL-Modelle sind größer und anspruchsvoller. Wer SDXL mit zu wenig VRAM trainiert, bekommt ständiges Auslagern von Speicher, einen drastisch langsameren Ablauf und häufig abgebrochene Trainings.

### Geschwindigkeit und Kosten abwägen

Teurere GPUs trainieren schneller, aber der höhere Stundenpreis senkt die Gesamtkosten des Projekts nicht immer im gleichen Maß. Ein Vergleich für eine typische SD-1.5-LoRA:

| GPU         | VRAM | Ungefähre Trainingszeit | Üblicher Stundenpreis | Geschätzte Gesamtkosten |
| ----------- | ---- | ----------------------- | --------------------- | ----------------------- |
| RTX 3090    | 24GB | 2,5 Stunden             | 0,50 $                | 1,25 $                  |
| RTX 4090    | 24GB | 1,5 Stunden             | 0,70 $                | 1,05 $                  |
| RTX A6000   | 48GB | 1,5 Stunden             | 0,80 $                | 1,20 $                  |
| A100 (40GB) | 40GB | 1,0 Stunden             | 1,50 $                | 1,50 $                  |

Die RTX 4090 bietet meist das beste Kosten-Nutzen-Verhältnis. Sie trainiert fast so schnell wie Rechenzentrums-GPUs, kostet pro Stunde aber deutlich weniger. Die RTX 3090 bleibt eine brauchbare Alternative, wenn keine 4090 verfügbar ist; die Gesamtkosten liegen nur geringfügig höher.

Beim SDXL-LoRA-Training verschiebt sich die Rechnung etwas, weil das größere Modell stärker von zusätzlichem VRAM und höherer Speicherbandbreite profitiert. Bei komplexen SDXL-Projekten, die auf Consumer-Hardware vier Stunden oder länger dauern würden, wird die A100 konkurrenzfähiger.

Eine ausführliche Analyse der GPU-Mietpreise aller großen Anbieter, einschließlich Enterprise-Clouds und Marktplätzen, finden Sie in unserem [vollständigen Preisvergleich für GPU-Miete 2026](/de/gpu-rental-pricing-comparison-2026/).

![NVIDIA-RTX-4090-Grafikkarte mit Drei-Lüfter-Kühlung, wie sie häufig für das Training von KI-Modellen genutzt wird](../_images/test-hero.jpg)

---

## Anbieter für GPU-Miete im Vergleich

Für LoRA-Training kommen zwei Anbieter infrage. Welcher besser passt, hängt davon ab, wie sicher Sie technisch unterwegs sind und wie preissensibel Sie sind.

### Vast.ai

Vast.ai betreibt einen Peer-to-Peer-Marktplatz, auf dem einzelne Besitzer ihre GPUs zur Miete anbieten. Das sorgt für die niedrigsten Preise am Markt: RTX-4090-GPUs gibt es häufig für 0,35 $ bis 0,60 $ pro Stunde.

Der Preis dafür ist Schwankung. Die Zuverlässigkeit liegt je nach Host zwischen 97 % und 99,9 %. Die Verfügbarkeit hängt von der Nachfrage ab. Unter Umständen müssen Sie mehrere Anbieter ausprobieren, bis einer eine ausreichende Netzwerkgeschwindigkeit für den Upload Ihres Datensatzes bietet.

Für erfahrene Nutzer, die die Kennzahlen der Anbieter einschätzen können, bietet Vast.ai die niedrigsten Trainingskosten. Planen Sie zusätzlich dreißig Minuten für die erste Einrichtung und die Auswahl des Anbieters ein.

### RunPod

RunPod positioniert sich zwischen reinen Marktplätzen und Enterprise-Cloud-Anbietern. Die Plattform bietet sowohl GPUs aus der Community als auch dedizierte „Secure Cloud“-Instanzen mit gleichmäßigerer Leistung.

Die Preise liegen etwas über denen von Vast.ai, typischerweise bei 0,59 $ pro Stunde für eine RTX 4090 in der Secure Cloud. Dafür ist die Einrichtung einfacher, es gibt vorkonfigurierte Templates für gängige KI-Workloads und die Verfügbarkeit ist besser planbar.

Für Einsteiger in die GPU-Miete oder alle, denen eine einfache Oberfläche wichtiger ist als die letzte Kostenoptimierung, ist RunPod ein vernünftiger Mittelweg.

### Ein Hinweis zu GPUFlow

GPUFlow eignet sich nicht für LoRA-Training. Es vermietet Zugang zu KI-Chatmodellen über eine OpenAI-kompatible API, keinen Rechner, auf dem Sie Trainingsskripte ausführen können. Für das Training brauchen Sie eine Plattform, die Ihnen den Rechner selbst gibt, wie die beiden oben. Wie sich die Ansätze unterscheiden, lesen Sie in [GPUFlow vs. Vast.ai vs. RunPod vs. SaladCloud](/de/gpuflow-vs-vast-ai-vs-runpod/).

### Anbieter im Überblick

| Anbieter | Preisspanne RTX 4090      | Einrichtungszeit | Zahlungsarten       | Am besten für         |
| -------- | ------------------------- | ---------------- | ------------------- | --------------------- |
| Vast.ai  | 0,35–0,60 $/Std.          | 5–15 Minuten     | Karte, Krypto       | Maximale Ersparnis    |
| RunPod   | 0,59 $/Std. (Secure Cloud) | 2–5 Minuten      | Karte, Krypto       | Einfache Bedienung    |

Preise Stand Februar 2026. Im September 2026 haben wir RTX-4090-GPUs ab etwa 0,37 $ pro Stunde auf Vast.ai und ab 0,74 $ in der RunPod Secure Cloud gesehen; siehe [unseren aktuellen Vergleich](/de/gpuflow-vs-vast-ai-vs-runpod/).

---

## Den Trainingsdatensatz vorbereiten

Die Qualität des Datensatzes bestimmt das Trainingsergebnis mehr als jeder andere Faktor. Dreißig sorgfältig ausgewählte Bilder liefern bessere Ergebnisse als zweihundert achtlos zusammengesuchte.

### Kriterien für die Bildauswahl

**Konsistenz.** Alle Bilder sollten das Konzept zeigen, das das Modell lernen soll. Trainieren Sie auf das Gesicht einer bestimmten Person, sollte jedes Bild dieses Gesicht deutlich zeigen. Trainieren Sie auf einen künstlerischen Stil, sollte jedes Bild diesen Stil verkörpern.

**Vielfalt innerhalb der Konsistenz.** Bleiben Sie beim Konzept, aber variieren Sie die technischen Aspekte: unterschiedliche Blickwinkel, Lichtverhältnisse, Hintergründe und Kontexte. So lernt das Modell zu verallgemeinern, statt sich zu stark auf bestimmte Bildkompositionen einzuschießen.

**Technische Qualität.** Verwenden Sie scharfe, gut belichtete Bilder. Bewegungsunschärfe, Rauschen, Kompressionsartefakte und schlechtes Licht werden alle Teil dessen, was das Modell lernt. Sind Ihre Trainingsbilder körnig, werden auch die erzeugten Bilder zur Körnigkeit neigen.

**Auflösung.** Trainingsbilder sollten für SD 1.5 mindestens 512x512 Pixel haben, für SDXL mindestens 1024x1024. Höher aufgelöste Ausgangsbilder erlauben der Trainingspipeline, ohne Qualitätsverlust zuzuschneiden und zu skalieren.

### Richtwerte für die Datensatzgröße

Die optimale Größe hängt davon ab, wie komplex das Konzept ist:

**Einfache Konzepte (ein Gesicht, einfacher Stil):** 20–40 Bilder
**Mittlere Konzepte (Figur mit mehreren Outfits, nuancierter Stil):** 40–80 Bilder
**Komplexe Konzepte (detaillierte Umgebung, stark variierender Stil):** 80–150 Bilder

Mehr Bilder erfordern mehr Trainingsschritte und damit mehr Zeit und Geld. Beginnen Sie bei den ersten Versuchen am unteren Ende dieser Spannen.

### Bilder beschriften

Jedes Trainingsbild braucht eine Beschriftung (Caption), die seinen Inhalt beschreibt. Diese Captions bringen dem Modell bei, welche Textbegriffe es mit welchen visuellen Mustern verbinden soll.

Gute Captions sind konkret und einheitlich:

**Schwache Caption:** "a woman"
**Bessere Caption:** "a photograph of Sarah Miller, a woman with short brown hair and green eyes, wearing a blue sweater"

**Schwache Caption:** "fantasy art"
**Bessere Caption:** "a digital painting in the style of luminescent fantasy, featuring glowing mushrooms in a dark forest, detailed linework, vibrant purple and blue color palette"

Das Triggerwort oder die Triggerphrase, die Sie später bei der Inferenz verwenden wollen, sollte in jeder Caption vorkommen. Wollen Sie Ihre LoRA mit "in the style of luminescent fantasy" aufrufen, muss genau diese Phrase in jeder Trainings-Caption stehen.

Bei kleinen Datensätzen können Sie die Captions von Hand schreiben. Bei größeren Sammlungen erzeugen Tools wie BLIP oder WD14 Tagger erste Captions, die Sie anschließend prüfen und verfeinern.

![Übersichtliche Ordnerstruktur mit Trainingsbildern und den zugehörigen Caption-Textdateien für das LoRA-Training](../_images/file-folder-organization.png)

### Verzeichnisstruktur

Legen Sie Ihre Trainingsdaten in der Struktur ab, die die Trainingsskripte erwarten:

```
training_data/
├── 10_concept_name/
│   ├── image001.jpg
│   ├── image001.txt
│   ├── image002.jpg
│   ├── image002.txt
│   └── ...
```

Das Präfix des Ordnernamens (hier die „10“) gibt an, wie oft jedes Bild in diesem Ordner während des Trainings wiederholt wird. Höhere Zahlen geben diesen Bildern mehr Gewicht im Training.

Der Name mit Unterstrichen nach der Zahl wird zum Standard-Triggerwort, wenn Sie keine eigenen Captions verwenden.

---

## Die Trainingsumgebung einrichten

Sind Datensatz und GPU-Miete bereit, richten Sie als Nächstes die Trainingsumgebung ein. Das übliche Werkzeug für LoRA-Training ist kohya_ss/sd-scripts, eine Open-Source-Sammlung von Trainingsskripten, die von der Community gepflegt wird.

### Grundeinrichtung der Umgebung

Nachdem Sie sich mit Ihrer gemieteten GPU-Instanz verbunden haben, klonen Sie das Repository mit den Trainingsskripten und installieren die Abhängigkeiten. Mit diesen Befehlen richten Sie die Grundumgebung ein:

```bash
# Clone the training scripts repository
git clone https://github.com/kohya-ss/sd-scripts.git
cd sd-scripts

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
pip install -r requirements.txt
pip install xformers
```

Die Installation dauert je nach Netzwerkgeschwindigkeit meist fünf bis zehn Minuten. Das Paket xformers ist optional, aber empfehlenswert, weil es den Speicherbedarf beim Training deutlich senkt.

### Das Basismodell herunterladen

Für LoRA-Training brauchen Sie ein Stable-Diffusion-Basismodell, auf dem trainiert wird. Laden Sie es auf Ihre Instanz herunter:

```bash
# Create a models directory
mkdir -p models/sd

# Download Stable Diffusion 1.5 (approximately 4GB)
wget -O models/sd/v1-5-pruned.safetensors \
  "https://huggingface.co/runwayml/stable-diffusion-v1-5/resolve/main/v1-5-pruned.safetensors"
```

Für SDXL-Training verwenden Sie stattdessen das SDXL-Basismodell, das etwa 6,5GB groß ist.

### Trainingsdaten hochladen

Übertragen Sie den vorbereiteten Datensatz auf die GPU-Instanz. Die meisten Anbieter unterstützen SCP oder SFTP:

```bash
# From your local machine
scp -r ./training_data user@gpu-instance-ip:~/sd-scripts/
```

Liegt Ihr Datensatz in einem Cloud-Speicher, können Sie ihn alternativ mit wget oder rclone direkt auf die Instanz herunterladen.

### Einrichtungszeit mit einem Template sparen

RunPod und Vast.ai bieten beide fertige Images mit vorinstallierten Tools für Stable-Diffusion-Training an. Damit sparen Sie meist fünfzehn bis zwanzig Minuten gegenüber der Einrichtung einer leeren Instanz – und Einrichtungszeit ist bezahlte Zeit. Bei gelegentlichen Trainingsläufen kann das ein spürbarer Anteil an den gesamten Mietkosten sein.

---

## Trainingsparameter konfigurieren

Die Trainingskonfiguration beeinflusst sowohl die Qualität des Ergebnisses als auch die Trainingsdauer erheblich. Die folgenden Parameter sind konservative Startwerte, die ohne übermäßigen Rechenaufwand verlässliche Ergebnisse liefern.

### Wichtige Parameter

Legen Sie eine Konfigurationsdatei mit dem Namen `training_config.toml` an:

```toml
[model]
pretrained_model_name_or_path = "./models/sd/v1-5-pruned.safetensors"
v2 = false
v_parameterization = false

[dataset]
train_data_dir = "./training_data"
resolution = 512
batch_size = 2
enable_bucket = true
min_bucket_reso = 256
max_bucket_reso = 1024

[training]
output_dir = "./output"
output_name = "my_lora"
max_train_epochs = 10
learning_rate = 1e-4
unet_lr = 1e-4
text_encoder_lr = 5e-5
lr_scheduler = "cosine_with_restarts"
lr_warmup_steps = 100
network_dim = 32
network_alpha = 16
optimizer_type = "AdamW8bit"
mixed_precision = "fp16"
save_every_n_epochs = 2
save_model_as = "safetensors"
```

### Die Parameter im Einzelnen

**resolution:** Passen Sie den Wert an die Auflösung an, die Sie bei der Inferenz verwenden wollen. 512 für SD 1.5, 1024 für SDXL.

**batch_size:** Höhere Werte trainieren schneller, brauchen aber mehr VRAM. Beginnen Sie mit 2 und erhöhen Sie auf 4, wenn der Speicher reicht.

**max_train_epochs:** Eine Epoche bedeutet, dass das Modell jedes Trainingsbild einmal sieht. Zehn Epochen sind für die meisten Datensätze ein guter Ausgangspunkt.

**learning_rate:** Bestimmt, wie stark das Modell bei jedem Schritt angepasst wird. Die Werte oben sind konservativ. Sind die Ergebnisse zu schwach, erhöhen Sie auf 2e-4 oder 3e-4.

**network_dim und network_alpha:** Diese Werte steuern die Kapazität der LoRA. Dim 32 mit Alpha 16 ist ein guter Kompromiss zwischen Qualität und Dateigröße. Höhere Werte (64, 128) können mehr Details erfassen, erzeugen aber größere Dateien und bergen die Gefahr der Überanpassung.

**optimizer_type:** AdamW8bit senkt den Speicherbedarf erheblich, bei kaum spürbarem Qualitätsverlust. Unverzichtbar, wenn Sie SDXL auf Karten mit 24GB trainieren.

**mixed_precision:** Training in FP16 halbiert den Speicherbedarf gegenüber FP32. Für die meisten Anwendungsfälle ist der Qualitätsunterschied vernachlässigbar.

### Anpassung an Ihre Hardware

RTX 4090 mit 24GB VRAM:

- batch_size = 4 ist für SD 1.5 in der Regel unproblematisch
- batch_size = 2 für SDXL

RTX 3090 mit 24GB VRAM:

- batch_size = 2 für SD 1.5
- batch_size = 1 für SDXL (Gradient Checkpointing aktivieren)

A100 mit 40GB VRAM:

- batch_size = 6–8 für SD 1.5
- batch_size = 4 für SDXL

Größere Batches verkürzen die gesamte Trainingszeit entsprechend. Eine doppelte Batch-Größe halbiert ungefähr die Zahl der nötigen Optimierungsschritte.

![Code-Editor mit einer Konfigurationsdatei für das LoRA-Training mit Parametern für Lernrate, Batch-Größe und Netzwerkdimension](../_images/terminal-screenshot-code-editor.png)

---

## Den Trainingslauf starten

Ist die Umgebung eingerichtet und sind die Parameter gesetzt, starten Sie das Training:

```bash
accelerate launch --num_cpu_threads_per_process=4 train_network.py \
  --config_file="./training_config.toml" \
  --logging_dir="./logs"
```

### Den Fortschritt verfolgen

Die Trainingsausgabe zeigt Loss-Werte und Fortschrittsangaben:

```
epoch 1/10, step 50/500, loss=0.0823
epoch 1/10, step 100/500, loss=0.0756
epoch 1/10, step 150/500, loss=0.0691
...
```

**Worauf Sie achten sollten:**

Der Loss sollte in den ersten Epochen grundsätzlich sinken und sich dann stabilisieren. Ein typischer Trainingslauf könnte so aussehen:

- Epoche 1: Loss etwa 0,08–0,10
- Epoche 5: Loss etwa 0,05–0,07
- Epoche 10: Loss etwa 0,04–0,06

Steigt der Loss nach anfänglichem Rückgang wieder an, passt sich das Modell womöglich zu stark an (Overfitting). Bleibt der Loss von Anfang an flach, ist die Lernrate vielleicht zu niedrig.

### Checkpoints

Die Konfiguration speichert alle zwei Epochen einen Checkpoint. Diese Zwischenstände haben zwei Zwecke:

1. **Wiederherstellung.** Stürzt das Training ab oder müssen Sie es vorzeitig beenden, können Sie beim letzten Checkpoint weitermachen.

2. **Auswahl.** Verschiedene Epochen haben manchmal unterschiedliche Eigenschaften. Epoche 6 trifft Ihr Konzept vielleicht gut, während Epoche 10 schon überangepasst ist. Mit Checkpoints können Sie testen und auswählen.

### Zu erwartende Trainingszeiten

Für eine SD-1.5-LoRA mit 50 Bildern und der Konfiguration oben:

| GPU      | Ungefähre Dauer  |
| -------- | ---------------- |
| RTX 3090 | 90–120 Minuten   |
| RTX 4090 | 60–90 Minuten    |
| A100     | 45–60 Minuten    |

SDXL-Training dauert etwa 1,5- bis 2-mal so lange.

---

## Die LoRA prüfen und testen

Am Ende des Trainings liegt eine .safetensors-Datei in Ihrem Ausgabeverzeichnis. Bevor das Projekt als abgeschlossen gelten kann, müssen Sie diese Datei testen.

### Grundlegende Prüfung

Kopieren Sie die LoRA-Datei auf Ihren eigenen Rechner oder ein System mit Stable Diffusion WebUI:

```bash
# Download from GPU instance
scp user@gpu-instance-ip:~/sd-scripts/output/my_lora.safetensors ./
```

In Automatic1111 WebUI legen Sie die Datei im Verzeichnis `models/Lora` ab. Bei ComfyUI verwenden Sie das Verzeichnis `models/loras`.

### So testen Sie

Erzeugen Sie eine Reihe von Testbildern und variieren Sie dabei diese Faktoren:

**LoRA-Gewicht:** Testen Sie mit den Stärken 0,5, 0,7, 0,8 und 1,0. Manche LoRAs funktionieren unterhalb der vollen Stärke am besten.

**Position im Prompt:** Setzen Sie Ihr Triggerwort an unterschiedliche Stellen im Prompt. Anfang, Mitte und Ende können leicht unterschiedliche Ergebnisse liefern.

**Negative Prompts:** Testen Sie mit und ohne Ihr Konzept im Negative Prompt. Manchmal ergibt das Triggerwort im Negative Prompt bei niedrigem Gewicht interessante Umkehrungen.

**Verschiedene Seeds:** Verwenden Sie pro Konfiguration mindestens fünf verschiedene Seeds, um beständige Muster von zufälligen Schwankungen zu unterscheiden.

### Qualität bewerten

Bewerten Sie Ihre Ergebnisse nach diesen Kriterien:

**Treffsicherheit:** Spiegelt das Ergebnis Ihr Trainingskonzept wider? Wenn Sie auf ein Gesicht trainiert haben: Ist dieses Gesicht erkennbar?

**Integration:** Fügt sich das LoRA-Konzept natürlich in andere Elemente des Prompts ein? Können Sie Ihre trainierte Figur in unterschiedliche Szenen setzen?

**Artefakte:** Achten Sie auf wiederkehrende Muster, unnatürliche Elemente oder Verzerrungen, die immer wieder auftauchen. Sie deuten auf Probleme im Training oder auf Overfitting hin.

**Flexibilität:** Testen Sie Grenzfälle. Wenn Sie eine Figur trainiert haben: Lässt sie sich in unterschiedlichem Alter darstellen? In anderer Kleidung? Bei verschiedenen Tätigkeiten?

Sind die Ergebnisse nicht zufriedenstellend, helfen meist diese Maßnahmen:

- Mehr Epochen trainieren (Underfitting)
- Weniger Epochen trainieren (Overfitting)
- Die Lernrate anpassen
- Die Captions verbessern
- Vielfältigere Trainingsbilder hinzufügen

![Vergleichsraster mit Stable-Diffusion-Ergebnissen bei unterschiedlichen LoRA-Stärken, das Qualitätsunterschiede der KI-Bilder zeigt](../_images/side-by-side-comparison.png)

---

## Strategien zur Kostensenkung

Ob ein Trainingslauf fünf oder zwanzig Dollar kostet, hängt oft eher von einem effizienten Ablauf ab als von der Wahl des Anbieters.

### Den Datensatz vor dem Upload vorbereiten

Erledigen Sie die gesamte Auswahl, das Zuschneiden und das Beschriften auf Ihrem eigenen Rechner, bevor Sie die GPU mieten. 0,70 $ pro Stunde dafür zu zahlen, dass Sie Dateien von Hand sichten und umbenennen, ist eine teure Nutzung dieser Hardware.

Checkliste vor dem Start der Miete:

- Alle Bilder auf passende Seitenverhältnisse zugeschnitten
- Alle Captions geschrieben und geprüft
- Datensatz in der richtigen Ordnerstruktur
- Konfigurationsdatei für das Training vorbereitet
- Testbefehle geschrieben und bereit zum Einfügen

### Mehrere Trainings in einer Sitzung

Brauchen Sie mehrere LoRAs, trainieren Sie sie in einer einzigen Sitzung. Die Fixkosten für Einrichtung und Modell-Download verteilen sich dann auf alle Trainingsläufe.

Ein Beispiel mit drei LoRAs:

- Drei getrennte Sitzungen: 3 × (20 Min. Einrichtung + 90 Min. Training) = 330 Minuten
- Eine gemeinsame Sitzung: 20 Min. Einrichtung + (3 × 90 Min. Training) = 290 Minuten

Die vierzig Minuten Ersparnis entsprechen etwa 15 % weniger Kosten.

### Checkpoints gezielt testen

Statt bis Epoche 15 zu trainieren und auf gute Ergebnisse zu hoffen, gehen Sie besser so vor:

1. Bis Epoche 6 trainieren (etwa 60 % der vollen Trainingszeit)
2. Den Checkpoint testen
3. Ist er zufriedenstellend, aufhören und die restliche GPU-Zeit sparen
4. Bei Underfitting vom Checkpoint aus weitertrainieren

So finden Sie gute Ergebnisse oft früher als erwartet und senken die Gesamtkosten.

### Sofort beenden

Die Abrechnung der GPU läuft in der Regel weiter, bis Sie die Instanz ausdrücklich stoppen. Beenden Sie Ihre Sitzung sofort, nachdem Sie die Ausgabedateien kopiert haben. Eine vergessene Instanz, die über Nacht zu 0,70 $ pro Stunde läuft, macht Ihr Projekt zwölf Dollar teurer.

### Der richtige Zeitpunkt

Verfügbarkeit und Preise von GPUs schwanken mit der Nachfrage. Wer außerhalb der Stoßzeiten trainiert (zum Beispiel werktags vormittags nach US-Zeit), bekommt oft bessere Preise und mehr freie GPUs als am Wochenende abends.

---

## Häufige Probleme und Lösungen

### CUDA out of memory

**Symptom:** Das Training bricht mit der Fehlermeldung "CUDA out of memory" ab.

**Lösungen:**

- batch_size in der Konfiguration senken
- Gradient Checkpointing aktivieren, indem Sie `gradient_checkpointing = true` hinzufügen
- Auflösung verringern (was allerdings die Qualität der Ergebnisse beeinträchtigt)
- Eine GPU mit mehr VRAM verwenden

### Der Loss sinkt nicht

**Symptom:** Die Loss-Werte bleiben während des gesamten Trainings flach oder schwanken zufällig.

**Lösungen:**

- Lernrate erhöhen (2e-4 oder 3e-4 versuchen)
- Prüfen, ob die Captions die Bilder korrekt beschreiben
- Sicherstellen, dass die Bilder korrekt formatiert und lesbar sind
- Pfad zum Basismodell prüfen

### Die LoRA hat keine Wirkung

**Symptom:** Die erzeugten Bilder sehen mit und ohne LoRA gleich aus.

**Lösungen:**

- Prüfen, ob die LoRA-Datei im richtigen Verzeichnis Ihrer Oberfläche liegt
- Prüfen, ob die Triggerwörter mit denen in den Trainings-Captions übereinstimmen
- Gewicht bzw. Stärke der LoRA erhöhen
- Einen anderen Checkpoint aus dem Training ausprobieren

### Die LoRA ist überangepasst und unflexibel

**Symptom:** Die LoRA reproduziert die Trainingsbilder fast exakt, versagt aber bei abweichenden Prompts.

**Lösungen:**

- Weniger Epochen trainieren
- network_dim senken
- Mehr Vielfalt in den Trainingsdatensatz bringen
- Lernrate senken

### Das Training ist zu langsam

**Symptom:** Das Training läuft deutlich langsamer als erwartet.

**Lösungen:**

- Prüfen, ob die GPU tatsächlich genutzt wird (nvidia-smi sollte eine hohe GPU-Auslastung zeigen)
- Sicherstellen, dass xformers installiert ist
- Prüfen, ob mixed_precision aktiviert ist
- network_dim senken, falls Sie sehr hohe Werte verwenden

---

## Häufig gestellte Fragen

### Kann ich LoRA-Modelle auf meiner eigenen GPU trainieren, statt eine zu mieten?

Ja, sofern Sie eine NVIDIA-GPU mit mindestens 12GB VRAM haben, etwa eine RTX 3060 oder besser. Stromkosten, Verschleiß und die deutlich längeren Trainingszeiten auf Consumer-Hardware machen das Mieten bei gelegentlichen Projekten aber oft zur günstigeren Wahl. Ein zweistündiger Trainingslauf zu 0,70 $ pro Stunde kostet weniger als der Strom, den die meisten Rechner zu Hause unter Volllast in den vier bis sechs Stunden verbrauchen, die langsamere Hardware dafür braucht.

### Wie lange dauert ein typisches LoRA-Training?

Die meisten LoRA-Trainings sind auf einer RTX 4090 oder RTX 3090 in ein bis drei Stunden abgeschlossen. Die genaue Dauer hängt von der Größe des Datensatzes, der Anzahl der Epochen und der Batch-Größe ab. SDXL-Modelle brauchen für vergleichbare Trainingsläufe etwa 50–100 % mehr Zeit als SD 1.5.

### Wie viele Bilder brauche ich mindestens für ein LoRA-Training?

Brauchbare Ergebnisse sind schon mit fünfzehn bis zwanzig Bildern möglich. Mit dreißig bis hundert gut beschrifteten Bildern wird die Qualität aber meist besser. Bildqualität und genaue Captions zählen mehr als die reine Menge. Dreißig sorgfältig ausgewählte Bilder schlagen in der Regel hundert hastig zusammengesuchte.

### Welcher Anbieter für GPU-Miete bietet das beste Preis-Leistungs-Verhältnis für LoRA-Training?

Vast.ai hat meist die niedrigsten Stundenpreise für RTX-4090-GPUs, im Februar 2026 oft 0,35 $ bis 0,50 $ pro Stunde. RunPod bietet die einfachste Oberfläche für alle, die zum ersten Mal eine GPU mieten. Einen ausführlichen Vergleich aller Anbieter mit aktuellen Preisen finden Sie in unserem [umfassenden Preisvergleich für GPU-Miete](/de/gpu-rental-pricing-comparison-2026/).

### Ist es günstiger, mehrere LoRA-Modelle in einer Sitzung zu trainieren?

Ja. Wer mehrere LoRAs in einer längeren Sitzung trainiert, spart die wiederholte Einrichtung und minimiert Kosten für ungenutzte GPU-Zeit. Drei bis fünf LoRA-Modelle in einer vierstündigen Sitzung kosten meist weniger als die Hälfte dessen, was einzelne Trainings in getrennten Mietsitzungen kosten würden.

### Darf ich trainierte LoRAs kommerziell nutzen?

Das hängt von der Lizenz Ihres Basismodells ab. Stable Diffusion 1.5 steht unter der Lizenz CreativeML Open RAIL-M, die kommerzielle Nutzung mit gewissen Einschränkungen erlaubt. SDXL ist ähnlich großzügig lizenziert. Ihre LoRA übernimmt die Einschränkungen ihres Basismodells. Auch für Trainingsbilder können Lizenzbedingungen gelten – stellen Sie sicher, dass Sie an allen Bildern, die Sie für das Training verwenden, die nötigen Rechte haben.

---

## Fazit

Eigene LoRA-Modelle zu trainieren, ist bemerkenswert zugänglich geworden. Wo früher erhebliche Investitionen in Hardware nötig waren, reichen heute ein paar Dollar Mietkosten für eine GPU. Mit den Techniken aus diesem Leitfaden und einem gut vorbereiteten Datensatz erhalten Sie zuverlässig schon beim ersten Versuch brauchbare Ergebnisse.

Die entscheidenden Erfolgsfaktoren sind dieselben wie bei teureren Trainingsansätzen: gute Trainingsdaten, passend gewählte Parameter und eine sorgfältige Prüfung der Ergebnisse. Keine noch so große Rechenleistung gleicht schlechte Ausgangsbilder oder falsch konfigurierte Trainingsläufe aus.

Beginnen Sie mit einem überschaubaren Datensatz von zwanzig bis dreißig Bildern. Trainieren Sie mit konservativen Einstellungen. Testen Sie Ihre Ergebnisse gründlich, bevor Sie sich an größere Projekte wagen. Die Kosten pro Versuch sind so niedrig, dass Sie ohne Weiteres iterieren können – betrachten Sie Ihre ersten Trainingsläufe als Lernphase, nicht als Produktion. Derselbe Ablauf gilt auch für andere Modelltypen. Wenn Sie mit Text statt mit Bildern arbeiten, lesen Sie unseren Leitfaden zum [Fine-Tuning großer Sprachmodelle](/de/private-llm-fine-tuning-guide/) auf derselben Art gemieteter GPU.

Wenn Sie GPU-Mietangebote über alle Anbieterarten und Preisklassen hinweg vergleichen möchten, finden Sie in unserem [Preisvergleich für GPU-Miete](/de/gpu-rental-pricing-comparison-2026/) aktuelle Preise für Consumer-GPUs, Rechenzentrums-Hardware und Enterprise-Clouds.

---

_Dieser Leitfaden wurde zuletzt am 12. Februar 2026 aktualisiert. Mietpreise für GPUs und die Konfiguration der Trainingstools ändern sich häufig. Prüfen Sie die aktuellen Preise direkt bei den Anbietern, bevor Sie sich auf ein Trainingsprojekt festlegen._
