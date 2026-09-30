---
title: "Stable-Diffusion-LoRA für unter 10 $ auf einer gemieteten GPU trainieren"
description: "SDXL- oder Flux-LoRA auf einer gemieteten RTX 4090 für deutlich unter 10 $ trainieren: GPU-Wahl nach VRAM, Captions, Einstellungen für sd-scripts und ai-toolkit und eine Beispielrechnung."
excerpt: "Ein SDXL-LoRA-Lauf auf einer gemieteten RTX 4090 kostet im September 2026 etwa 0,35 $ bis 0,80 $. Hier steht, welche GPU Sie nehmen, wie Sie Bilder vorbereiten und beschriften, der genaue Trainingsbefehl und wohin das Geld tatsächlich geht."
pubDate: 2026-02-11
updatedDate: 2026-09-30
locale: "de"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/stable-diffusion-lora-training-guide.jpg"
heroImageAlt: "Illustration von Menschen vor einem großen Monitor mit einem LoRA-Netzwerkdiagramm, daneben ein Server-Rack und eine Tafel, die Beispielbilder aus zwei Trainingsepochen vergleicht"
faq:
  - question: "Was kostet es, eine LoRA auf einer gemieteten GPU zu trainieren?"
    answer: "Im September 2026 kostete eine RTX 4090 zur Miete etwa 0,31 $ pro Stunde bei Vast.ai und 0,74 $ pro Stunde laut Preisseite von RunPod. Eine SDXL-LoRA-Sitzung von etwa 65 Minuten, Einrichtung und Tests eingeschlossen, kostet also ungefähr 0,34 $ bis 0,80 $."
  - question: "Wie viel VRAM brauche ich, um eine SDXL-LoRA zu trainieren?"
    answer: "Laut Doku von sd-scripts lässt sich eine SDXL-LoRA mit 8 GB GPU-Speicher trainieren, empfohlen sind 10 GB, wenn Sie nur das U-Net trainieren, Latents und Ausgaben des Text-Encoders cachen und Gradient Checkpointing nutzen. Mit einer 24-GB-Karte wie der RTX 3090 oder 4090 trainieren Sie in 1024x1024, ohne gegen Speichergrenzen zu kämpfen."
  - question: "Kann ich eine Flux-LoRA auf einer RTX 4090 trainieren?"
    answer: "Ja. ai-toolkit liefert Beispielkonfigurationen für FLUX.1, die für 24-GB-Karten benannt sind, und sd-scripts nennt Einstellungen für FLUX.1 bis hinunter zu 8 GB mit Block Swapping. Laut der Anleitung von Black Forest Labs dauert ein FLUX.2-[klein]-LoRA-Lauf mit 1.800 Schritten auf einer RTX 4090 weniger als eine Stunde."
  - question: "Wie viele Bilder brauche ich, um eine LoRA zu trainieren?"
    answer: "Für eine Figur, ein Objekt oder einen Stil sind 15 bis 40 gute Bilder üblich; Black Forest Labs empfiehlt für FLUX.2 [klein] 15 bis 40 Bilder mit einem gemeinsamen Look. Scharfe, abwechslungsreiche und gut beschriftete Bilder sind wichtiger als eine große Anzahl."
  - question: "Was ist besser für LoRA-Training: kohya_ss, OneTrainer oder ai-toolkit?"
    answer: "Alle drei funktionieren. sd-scripts von kohya ist die Referenz auf der Kommandozeile, und kohya_ss setzt eine Web-Oberfläche darauf; OneTrainer hat eine Desktop-Oberfläche und eingebautes Captioning; ai-toolkit hat eine Web-Oberfläche, ein offizielles RunPod-Template und frühe Unterstützung für neue Modelle wie FLUX.2 und Qwen-Image."
  - question: "Kann ich bei GPUFlow eine LoRA trainieren?"
    answer: "Nein. GPUFlow vermietet eine OpenAI-kompatible Chat-API auf der GPU eines Anbieters, ohne Shell, SSH oder Dateizugriff. Ein Trainingsskript können Sie dort also nicht ausführen. Nehmen Sie eine Plattform, die Ihnen die Maschine vermietet, zum Beispiel Vast.ai oder RunPod."
---

Eine LoRA für SDXL oder ein kleines Flux-Modell kostet auf einer gemieteten GPU deutlich unter 10 $. Im September 2026 kostet eine RTX 4090 etwa 0,31 $ pro Stunde bei Vast.ai und 0,74 $ pro Stunde bei RunPod, und eine SDXL-LoRA-Sitzung dauert mit Einrichtung und Tests etwas über eine Stunde. Das sind 0,34 $ bis 0,80 $ pro Versuch. Ein Budget von 10 $ reicht also für ein Dutzend Anläufe.

Das Geld ist nicht das Schwierige. Schwierig sind die Bilder, die Captions und zu wissen, wann man aufhört. Diese Anleitung behandelt alles davon, mit Befehlen zum Kopieren. Preise und Tool-Versionen wurden im September 2026 geprüft; die Quellen stehen am Ende.

## Der Ablauf in fünf Schritten

<figure>
<svg viewBox="0 0 720 250" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">Ablauf des LoRA-Trainings: Datensatz, Captions, Training, Test, Einsatz, mit einem Rückweg zum Datensatz, wenn das Ergebnis nicht stimmt</title>
<defs><marker id="d1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6366f1"/></marker></defs>
<rect width="720" height="250" fill="#ffffff"/>
<line x1="20" y1="40" x2="280" y2="40" stroke="#16a34a" stroke-width="2"/>
<text x="150" y="30" text-anchor="middle" fill="#16a34a" font-size="13">Kostenlos: auf Ihrem eigenen PC</text>
<line x1="300" y1="40" x2="560" y2="40" stroke="#f97316" stroke-width="2"/>
<text x="430" y="30" text-anchor="middle" fill="#f97316" font-size="13">Bezahlt: auf der gemieteten GPU</text>
<rect x="20" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="80" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">Datensatz</text>
<text x="80" y="112" text-anchor="middle" fill="#64748b" font-size="13">15–40 Bilder</text>
<rect x="160" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="220" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">Captions</text>
<text x="220" y="112" text-anchor="middle" fill="#64748b" font-size="13">je eine .txt</text>
<rect x="300" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="360" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">Training</text>
<text x="360" y="112" text-anchor="middle" fill="#64748b" font-size="13">sd-scripts</text>
<rect x="440" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="500" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">Test</text>
<text x="500" y="112" text-anchor="middle" fill="#64748b" font-size="13">Beispielraster</text>
<rect x="580" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="640" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">Einsatz</text>
<text x="640" y="112" text-anchor="middle" fill="#64748b" font-size="13">ComfyUI, Forge</text>
<line x1="140" y1="95" x2="158" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="280" y1="95" x2="298" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="420" y1="95" x2="438" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="560" y1="95" x2="578" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<path d="M500,130 L500,180 L80,180 L80,134" fill="none" stroke="#f97316" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#d1-arrow)"/>
<text x="290" y="205" text-anchor="middle" fill="#1e1b4b" font-size="13">Passt nicht? Bilder oder Captions korrigieren, dann neu trainieren</text>
<text x="360" y="235" text-anchor="middle" fill="#64748b" font-size="13">Die Qualität entsteht vor allem in den ersten beiden Kästen, und die kosten nichts</text>
</svg>
<figcaption>Erledigen Sie Datensatz und Captions, bevor Sie mieten. Die GPU wird nur für Training und Tests berechnet, und ein schlechtes Ergebnis führt meist zurück zu den Bildern, nicht zu den Einstellungen.</figcaption>
</figure>

## Was eine LoRA ist und warum sie so günstig ist

LoRA (Low-Rank Adaptation) friert das Basismodell ein und trainiert zwei kleine Matrizen neben einigen seiner Schichten. Das ursprüngliche Paper meldete im Vergleich zum vollständigen Fine-Tuning von GPT-3 175B 10.000-mal weniger trainierbare Parameter und ein Drittel des GPU-Speichers. Bildmodelle funktionieren genauso: Der SDXL-Basis-Checkpoint ist eine Datei mit 6,9 GB, die LoRA, die Sie trainieren, dagegen eine kleine separate Datei, die Sie in beliebiger Stärke darüberladen.

Deshalb reicht eine einzelne Consumer-GPU, und deshalb dauert ein Lauf Minuten statt Tage.

## Die GPU nach VRAM wählen

Der VRAM entscheidet, was Sie trainieren können. Die Geschwindigkeit entscheidet, wie viele bezahlte Minuten der Lauf braucht. Eine schnellere Karte mit höherem Stundenpreis kann pro Lauf also ungefähr gleich viel kosten.

| Modellfamilie | Dokumentiertes Minimum | Komfortabel | Hinweise |
| --- | --- | --- | --- |
| SD 1.5 | 8 GB | 12 GB+ | Trainiert in 512x512, am günstigsten und schnellsten |
| SDXL | 8 GB (10 GB empfohlen) | 24 GB | Nur U-Net, gecachte Latents und Ausgaben des Text-Encoders |
| FLUX.1 [dev] (12B) | 8 GB mit viel Block Swapping | 24 GB | sd-scripts nennt Einstellungen für 24, 16, 12, 10 und 8 GB |
| FLUX.2 [klein] 4B/9B | keine Angabe | 24 GB | BFL: etwa 13 GB Gewichte in bf16, ein LoRA-Lauf passt in unter 24 GB |

Die Einstellungen für wenig VRAM funktionieren, sind aber langsam. sd-scripts bekommt FLUX.1 in 8 bis 16 GB, indem es Transformer-Blöcke zwischen GPU und Arbeitsspeicher hin- und herschiebt, und jeder dieser Wechsel kostet Zeit, die Sie bezahlen. Auf einer gemieteten Maschine ist eine 24-GB-Karte die vernünftige Wahl: eine RTX 3090 oder 4090. Die RTX 5090 (32 GB) funktioniert auch, laut sd-scripts braucht sie aber PyTorch 2.8.0 mit CUDA 12.8 oder 12.9. Prüfen Sie also, ob Ihr Template einen ausreichend aktuellen Stack mitbringt.

![Eine ASUS-TUF-Grafikkarte mit drei Lüftern auf einem weißen Regal](../_images/test-hero.jpg)

Rechenzentrumskarten sind schneller, aber RunPod listet eine A100 80 GB für 1,59 $ pro Stunde, mehr als das Doppelte einer 4090. Bei einer LoRA mit 20 oder 30 Bildern gleicht die zusätzliche Geschwindigkeit das selten aus; sinnvoll sind diese Karten bei großen Datensätzen oder vollständigem Fine-Tuning.

## Wo mieten, und was es kostet

Sie brauchen eine Plattform, die Ihnen eine Maschine gibt: eine Shell oder ein Jupyter-Notebook, eine Festplatte und einen Weg, Dateien hin- und herzukopieren. [Vast.ai und RunPod](/de/runpod-vs-vastapi-comparison/) sind für diese Art von Job die beiden häufigsten Anbieter.

| GPU | VRAM | Vast.ai (ab) | Preisseite von RunPod | RunPod, günstigster erfasster Preis |
| --- | --- | --- | --- | --- |
| RTX 3090 | 24 GB | etwa 0,11–0,13 $/h | 0,50 $/h | 0,22 $/h |
| RTX 4090 | 24 GB | etwa 0,31–0,33 $/h | 0,74 $/h | 0,34 $/h |
| RTX 5090 | 32 GB | etwa 0,41–0,47 $/h | 0,99 $/h | 0,69 $/h |

Preise vom September 2026. „Vast.ai (ab)“ und „RunPod, günstigster erfasster Preis“ stammen aus dem Preistracker von getdeploying.com; die mittlere Spalte ist die Preisseite von RunPod selbst. Bei Vast.ai legen die Hosts ihre Preise selbst fest, die Angebote schwanken also je nach Standort und Zuverlässigkeitswert.

Beide rechnen sekundengenau ab. Die Zusatzkosten unterscheiden sich, und bei einem Job von einer Stunde zählen sie mehr, als der Stundenpreis vermuten lässt:

- **Vast.ai** berechnet Speicher, „solange Ihre Instanz existiert, unabhängig davon, ob sie läuft“, und Bandbreite pro Byte zu einem Preis, den jeder Host festlegt. Ein Basismodell mit 7 GB auf einem Host mit teurer Bandbreite herunterzuladen, summiert sich. Löschen Sie die Instanz, statt sie nur zu stoppen.
- **RunPod** berechnet 0,10 $ pro GB und Monat für die Container-Disk, solange der Pod läuft, nichts dafür, sobald er gestoppt ist, und 0,20 $ pro GB und Monat für eine gestoppte Volume-Disk. Datenübertragung in beide Richtungen ist kostenlos.

Beide haben fertige Templates. Der Autor von ai-toolkit pflegt ein offizielles RunPod-Template, und die README von kohya_ss führt RunPod als unterstützte Umgebung. Ein Template erspart Ihnen zehn oder mehr Minuten PyTorch-Installation auf bezahlter Zeit. Einen breiteren Preisvergleich finden Sie in [GPUFlow vs. Vast.ai vs. RunPod vs. SaladCloud](/de/gpuflow-vs-vast-ai-vs-runpod/) und in [den versteckten Kosten der GPU-Miete](/de/hidden-fees-in-gpu-rental/).

## Datensatz und Captions vorbereiten

Das alles erledigen Sie auf Ihrem eigenen Computer, bevor Sie irgendetwas mieten.

### Bilder

- **Anzahl.** 15 bis 40 Bilder für eine Person, ein Objekt oder einen Stil. Black Forest Labs empfiehlt für FLUX.2 [klein] „15–40 Bilder mit einem gemeinsamen Look“. Mehr ist nicht besser, wenn die zusätzlichen Bilder schwächer sind.
- **Einheitlichkeit und Abwechslung.** Jedes Bild muss das Konzept zeigen. Alles andere sollte variieren: Blickwinkel, Licht, Hintergrund, Bildausschnitt. Steht Ihr Produkt auf jedem Foto auf demselben weißen Tisch, lernt die LoRA den Tisch.
- **Qualität.** Scharf, richtig belichtet, keine Wasserzeichen oder eingeblendeten Texte. Die LoRA lernt Rauschen und JPEG-Artefakte genauso getreu wie alles andere.
- **Auflösung.** Mindestens 1024 Pixel an der kurzen Seite für SDXL und Flux, 512 für SD 1.5. Sie müssen nicht quadratisch zuschneiden: Mit aktiviertem Bucketing gruppiert sd-scripts die Bilder nach Seitenverhältnis.

### Captions

Jedes Bild bekommt eine Textdatei mit demselben Namen (`photo01.jpg`, `photo01.txt`). Die Caption sagt dem Modell, was schon durch Worte erklärt ist, damit die LoRA lernt, was nicht erklärt ist. Setzen Sie ein seltenes Triggerwort an den Anfang und beschreiben Sie dann alles, was veränderbar bleiben soll:

```text
zxq_mug, a ceramic coffee mug on a wooden desk, morning light from the left, shallow depth of field
```

Zwei Tools schreiben Ihnen einen ersten Entwurf:

- **WD14 tagger**, in sd-scripts enthalten, erzeugt kommagetrennte Tags. Gut für Anime-Modelle und SDXL-Fine-Tunes, die auf Tags trainiert wurden:

  ```bash
  python finetune/tag_images_by_wd14_tagger.py --onnx \
    --repo_id SmilingWolf/wd-swinv2-tagger-v3 --batch_size 4 /workspace/dataset/img
  ```

- **JoyCaption**, ein offenes (Apache 2.0) Captioning-Modell, das für das Training von Diffusionsmodellen gebaut wurde, schreibt Sätze in natürlicher Sprache. Die passen zu Flux besser als Tags. Laut README braucht es in bf16 etwa 17 GB VRAM; für kleinere Karten gibt es 8-Bit- und 4-Bit-Versionen.

OneTrainer hat außerdem eingebautes Captioning mit BLIP, BLIP2 und WD-1.4. Egal, was den Entwurf schreibt: Lesen Sie jede Caption und korrigieren Sie sie. Das ist die wertvollste halbe Stunde des ganzen Projekts.

## Einen Trainer wählen

Vier Tools decken fast alle Fälle ab. Alle sind kostenlos und Open Source.

| Tool | Oberfläche | Modelle (September 2026) | Passt gut für |
| --- | --- | --- | --- |
| kohya-ss/sd-scripts | Kommandozeile | SD 1.x/2.x, SDXL, SD3/3.5, FLUX.1, Lumina, HunyuanImage-2.1, Anima | Reproduzierbare Läufe, volle Kontrolle |
| bmaltais/kohya_ss | Web-Oberfläche für sd-scripts | Wie sd-scripts | sd-scripts, ohne Flags auswendig zu lernen |
| Nerogar/OneTrainer | Desktop-Oberfläche und CLI | SD 1.5 bis 3.5, SDXL, FLUX.1, FLUX.2, Chroma, Qwen Image und mehr | Eingebautes Captioning und Masking |
| ostris/ai-toolkit | Web-Oberfläche und YAML-Konfigurationen | SD 1.5, SDXL, FLUX.1, FLUX.2, Qwen-Image, Wan-Video und mehr | Flux und neuere Modelle, RunPod-Template |

sd-scripts steht bei Version 0.11.1 (Juni 2026), ist mit Python 3.10 getestet und braucht PyTorch 2.6.0 oder neuer. ai-toolkit empfiehlt Python 3.12 und installiert derzeit PyTorch 2.13.0 für CUDA 13.0. OneTrainer braucht Python 3.10 bis 3.13.

Ich nehme sd-scripts für SDXL, weil die Kommandozeile die gesamte Konfiguration ist. So lassen sich Läufe leicht wiederholen und vergleichen. Für Flux nehme ich ai-toolkit.

## Eine SDXL-LoRA mit sd-scripts trainieren

Auf einer frischen Linux-Instanz mit NVIDIA-Treiber ist die Einrichtung eine Handvoll Befehle:

```bash
git clone https://github.com/kohya-ss/sd-scripts.git
cd sd-scripts
python -m venv venv && source venv/bin/activate
pip install torch==2.6.0 torchvision==0.21.0 --index-url https://download.pytorch.org/whl/cu124
pip install --upgrade -r requirements.txt
accelerate config default --mixed_precision bf16

# SDXL base model (not gated, CreativeML Open RAIL++-M license)
hf download stabilityai/stable-diffusion-xl-base-1.0 sd_xl_base_1.0.safetensors \
  --local-dir /workspace/models
```

Kopieren Sie Ihren Ordner mit Bildern und `.txt`-Captions per `scp`, `rsync` oder über den Dateibrowser der Plattform nach `/workspace/dataset/img`. Beschreiben Sie dann den Datensatz in `/workspace/dataset.toml`:

```toml
[general]
caption_extension = ".txt"
enable_bucket = true

[[datasets]]
resolution = 1024
batch_size = 1

  [[datasets.subsets]]
  image_dir = "/workspace/dataset/img"
  num_repeats = 10
```

Und starten Sie das Training:

```bash
accelerate launch --num_cpu_threads_per_process 1 sdxl_train_network.py \
  --pretrained_model_name_or_path=/workspace/models/sd_xl_base_1.0.safetensors \
  --dataset_config=/workspace/dataset.toml \
  --output_dir=/workspace/output --output_name=zxq_mug \
  --save_model_as=safetensors \
  --network_module=networks.lora --network_dim=16 --network_alpha=8 \
  --network_train_unet_only \
  --optimizer_type=AdamW8bit --learning_rate=1e-4 \
  --lr_scheduler=constant_with_warmup --lr_warmup_steps=100 \
  --max_train_epochs=8 --save_every_n_epochs=2 \
  --mixed_precision=bf16 --save_precision=bf16 \
  --cache_latents --cache_latents_to_disk --cache_text_encoder_outputs \
  --gradient_checkpointing --sdpa --seed=42 \
  --sample_prompts=/workspace/prompts.txt --sample_every_n_epochs=2
```

`prompts.txt` enthält einen Test-Prompt pro Zeile, mit den Inline-Optionen von sd-scripts für Größe, Seed und Schritte:

```text
zxq_mug, a ceramic coffee mug on a kitchen counter --w 1024 --h 1024 --d 42 --s 28
zxq_mug, a ceramic coffee mug held by a hiker on a mountain top --w 1024 --h 1024 --d 42 --s 28
```

### Was die Einstellungen bewirken

- **Schritte.** Bilder × Wiederholungen × Epochen ÷ Batchgröße. Bei 25 Bildern: 25 × 10 × 8 = 2.000 Schritte.
- **`network_dim` 16, `network_alpha` 8.** Die Kapazität der LoRA. 16 reicht für ein Objekt oder ein Gesicht; Stile brauchen manchmal 32. Höhere Ränge überanpassen schneller und erzeugen größere Dateien.
- **`--network_train_unet_only`.** Hier Pflicht: sd-scripts weigert sich, Ausgaben des Text-Encoders zu cachen, während es die Text-Encoder trainiert, und die Doku nennt reines U-Net-Training für SDXL-LoRAs ohnehin „dringend empfohlen“.
- **Caching und Gradient Checkpointing.** Damit passt SDXL in 8 bis 10 GB. Caching schaltet außerdem Caption Shuffling und Caption Dropout ab; deshalb fehlen sie in der Datensatzdatei.
- **`learning_rate` 1e-4 mit AdamW8bit.** Der Wert aus dem SDXL-LoRA-Beispiel von sd-scripts selbst. Ändern sich die Beispielbilder nach vier Epochen kaum, versuchen Sie 2e-4. Werden sie zu Kopien Ihrer Trainingsbilder, senken Sie den Wert oder hören früher auf.
- **Checkpoints alle 2 Epochen.** Sie bekommen Dateien für die Epochen 2, 4, 6 und 8 und wählen die beste. Die beste LoRA ist oft nicht die letzte.

### Wie lange es dauert

Nutzer in einem Issue-Thread von kohya_ss meldeten etwa 1,1 bis 1,4 Iterationen pro Sekunde für SDXL-LoRA-Training in 1024x1024, Batchgröße 1, auf einer RTX 4090 mit Gradient Checkpointing. Bei diesem Tempo dauern 2.000 Schritte 24 bis 30 Minuten, dazu ein paar Minuten für das Cachen der Latents. Derselbe Thread zeigt, wie schlimm es wird, wenn einer Karte der VRAM ausgeht und sie in den gemeinsamen Speicher ausweicht: 50 Sekunden oder mehr pro Schritt. Liegt Ihre Geschwindigkeit weit unter dem erwarteten Bereich, prüfen Sie `nvidia-smi`, bevor Sie den Einstellungen die Schuld geben.

## Flux und neuere Modelle mit ai-toolkit

Für Flux ist ai-toolkit der einfachste Weg. Auf einer gemieteten Maschine:

```bash
git clone https://github.com/ostris/ai-toolkit.git
cd ai-toolkit
python3 -m venv venv && source venv/bin/activate
pip3 install --no-cache-dir torch==2.13.0 torchvision==0.28.0 torchaudio==2.11.0 \
  --index-url https://download.pytorch.org/whl/cu130
pip3 install -r requirements.txt
cp config/examples/train_lora_flux_24gb.yaml config/zxq_mug.yml
# edit the dataset path, trigger word and steps, then:
python run.py config/zxq_mug.yml
```

Oder starten Sie die Web-Oberfläche mit `cd ui && npm run build_and_start` und öffnen Port 8675. Auf einem Server, den andere erreichen können, setzen Sie vorher `AI_TOOLKIT_AUTH` auf ein Passwort, wie es die README empfiehlt.

Zwei Dinge zu Lizenzen sollten Sie wissen, bevor Sie ein Flux-Modell wählen:

- **FLUX.1 [dev]** ist auf Hugging Face zugangsbeschränkt. Sie akzeptieren die FLUX.1 [dev] Non-Commercial License und laden das Modell mit einem Lese-Token von Hugging Face herunter. Laut Model Card dürfen generierte Bilder kommerziell genutzt werden; die Gewichte und Ihre LoRA fallen unter die nicht kommerzielle Lizenz.
- **FLUX.2 [klein] 4B** steht unter Apache 2.0 und ist frei zugänglich. Die 9B-Version nutzt die FLUX Non-Commercial License.

Black Forest Labs hat im Juni 2026 eine Anleitung für das Training von FLUX.2-[klein]-LoRAs mit ai-toolkit veröffentlicht: Ein Lauf mit 1.800 Schritten auf einer RTX 4090 „dauert weniger als eine Stunde“, und die Checkpoints um die Schritte 750 bis 1.500 sollte man sich ansehen. Eine ähnlich belastbare veröffentlichte Zeitangabe für FLUX.1 [dev], das dreimal so groß ist wie klein 4B, habe ich nicht gefunden. Planen Sie mehr Zeit ein und messen Sie Ihren ersten Lauf.

## Die LoRA testen, bevor Sie aufhören zu zahlen

Sehen Sie sich die Beispielbilder jeder gespeicherten Epoche an, solange die Maschine noch läuft. Sie zeigen Ihnen ohne Zusatzkosten, ob die LoRA das Konzept gelernt hat und ab wann sie überangepasst ist. Laden Sie dann die Checkpoints herunter, die Ihnen gefallen:

```bash
rsync -avP user@your-instance:/workspace/output/*.safetensors ./loras/
```

Zu Hause legen Sie die Datei in den Ordner `models/loras` von ComfyUI oder `models/Lora` von Forge und testen mit festen Seeds:

- **Stärke.** Probieren Sie 0,6, 0,8 und 1,0. Manche LoRAs sehen unter 1,0 am besten aus.
- **Flexibilität.** Setzen Sie das Triggerwort in Szenen, die nicht in Ihren Daten vorkamen. Eine Tasse auf einem Berg, ein Gesicht in einem Gemälde. Funktioniert es nur in Szenen wie auf den Trainingsbildern, ist die LoRA überangepasst: Nehmen Sie eine frühere Epoche oder weniger Wiederholungen.
- **Durchsickern.** Generieren Sie ohne das Triggerwort. Taucht das Konzept trotzdem auf, haben Ihre Captions zu wenig vom Bild beschrieben.

Stimmt das Ergebnis nicht, liegt die Lösung meist im Datensatz: ein paar schwache Bilder entfernen oder Captions, die das benennen, was variieren soll. Die Lernrate zu ändern ist der zweite Schritt, nicht der erste.

## Die Beispielrechnung

Eine SDXL-LoRA, 25 Bilder, 2.000 Schritte, auf einer RTX 4090:

| Schritt | Zeit |
| --- | --- |
| Mit einem Template starten, sd-scripts installieren | 10 Min. |
| SDXL-Basismodell herunterladen, Datensatz hochladen, cachen | 10 Min. |
| Training (2.000 Schritte mit 1,1 bis 1,4 it/s) | 30 Min. |
| Beispielbilder ansehen, Checkpoints herunterladen, Instanz löschen | 15 Min. |
| **Summe** | **65 Min. (1,08 h)** |

- Vast.ai zu 0,31 $/h: 1,08 × 0,31 $ = **0,34 $**, dazu Speicher und der Bandbreitenpreis des Hosts.
- RunPod zu 0,74 $/h: 1,08 × 0,74 $ = **0,80 $**. Eine Container-Disk mit 50 GB kostet für diese Stunde 50 × 0,10 $ ÷ 730 Stunden, also weniger als 1 Cent.

Eine FLUX.2-[klein]-LoRA mit einer Stunde Training und 30 Minuten Einrichtung und Tests kostet 1,5 × 0,74 $ = **1,11 $** bei RunPod oder 1,5 × 0,31 $ = **0,47 $** bei Vast.ai.

<figure>
<svg viewBox="0 0 720 300" role="img" aria-labelledby="d2-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d2-title">Balkendiagramm der Kosten für LoRA-Training auf einer gemieteten RTX 4090 im Vergleich zu einem Budget von 10 Dollar</title>
<rect width="720" height="300" fill="#ffffff"/>
<line x1="230" y1="40" x2="230" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="322" y1="40" x2="322" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="414" y1="40" x2="414" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="506" y1="40" x2="506" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="598" y1="40" x2="598" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="690" y1="30" x2="690" y2="250" stroke="#f97316" stroke-width="2" stroke-dasharray="6 4"/>
<text x="698" y="22" text-anchor="end" fill="#f97316" font-size="13">Budget 10 $</text>
<text x="220" y="75" text-anchor="end" fill="#1e1b4b">SDXL, Vast.ai</text>
<rect x="230" y="58" width="15.6" height="26" fill="#16a34a"/>
<text x="253" y="76" fill="#1e1b4b" font-size="13">0,34 $</text>
<text x="220" y="125" text-anchor="end" fill="#1e1b4b">SDXL, RunPod</text>
<rect x="230" y="108" width="36.8" height="26" fill="#6366f1"/>
<text x="275" y="126" fill="#1e1b4b" font-size="13">0,80 $</text>
<text x="220" y="175" text-anchor="end" fill="#1e1b4b">FLUX.2 klein, RunPod</text>
<rect x="230" y="158" width="51.1" height="26" fill="#6366f1"/>
<text x="289" y="176" fill="#1e1b4b" font-size="13">1,11 $</text>
<text x="220" y="225" text-anchor="end" fill="#1e1b4b">5 SDXL-Läufe, RunPod</text>
<rect x="230" y="208" width="184.5" height="26" fill="#6366f1"/>
<text x="422" y="226" fill="#1e1b4b" font-size="13">4,01 $</text>
<line x1="230" y1="250" x2="690" y2="250" stroke="#64748b" stroke-width="1"/>
<text x="230" y="270" text-anchor="middle" fill="#64748b" font-size="13">0 $</text>
<text x="322" y="270" text-anchor="middle" fill="#64748b" font-size="13">2 $</text>
<text x="414" y="270" text-anchor="middle" fill="#64748b" font-size="13">4 $</text>
<text x="506" y="270" text-anchor="middle" fill="#64748b" font-size="13">6 $</text>
<text x="598" y="270" text-anchor="middle" fill="#64748b" font-size="13">8 $</text>
<text x="690" y="270" text-anchor="middle" fill="#64748b" font-size="13">10 $</text>
<text x="460" y="292" text-anchor="middle" fill="#64748b" font-size="13">Kosten pro Sitzung auf einer RTX 4090, Preise vom September 2026</text>
</svg>
<figcaption>Selbst fünf getrennte SDXL-Versuche zum Listenpreis von RunPod bleiben deutlich unter 10 $. Bei 0,74 $ pro Stunde bekommen Sie für 10 $ 13,5 Stunden RTX 4090, bei 0,31 $ etwa 32 Stunden.</figcaption>
</figure>

Was ein Budget von 10 $ tatsächlich sprengt, ist selten das Training. Es ist eine Instanz, die über Nacht weiterläuft (12 Stunden zu 0,74 $ sind 8,88 $), eine gestoppte Vast.ai-Instanz, die weiter Speicher bezahlt, oder eine Stunde Captioning auf bezahlter Zeit. [Sekundengenaue Abrechnung](/de/per-second-vs-hourly-gpu-billing/) hilft nur, wenn Sie die Maschine löschen, sobald Sie fertig sind.

## Wo GPUFlow ins Spiel kommt

Für diesen Job gar nicht. GPUFlow vermietet über einen OpenAI-kompatiblen API-Schlüssel den Zugang zu einem Sprachmodell, das ein Anbieter (meist mit Ollama) auf seiner eigenen GPU bereitstellt. Es gibt keine Shell, kein SSH und keinen Dateizugriff. Sie können also keinen Trainer installieren, keine Bilder hochladen und keine LoRA herunterladen. Außerdem stellt GPUFlow Chat-Modelle bereit, keine Bildmodelle. Trainieren Sie bei Vast.ai, RunPod oder einer ähnlichen Plattform, die Ihnen die Maschine vermietet.

Wenn Sie mit Text statt mit Bildern arbeiten, gilt dasselbe Vorgehen aus Mieten, Trainieren und Löschen auch für Sprachmodelle: siehe [ein LLM privat auf einer gemieteten GPU feintunen](/de/private-llm-fine-tuning-guide/).

## Quellen

Alle geprüft im September 2026.

- LoRA-Paper: [Hu et al., LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685)
- sd-scripts: [README und Releases](https://github.com/kohya-ss/sd-scripts), [SDXL-LoRA-Training](https://github.com/kohya-ss/sd-scripts/blob/main/docs/sdxl_train_network.md), [Hinweise zu SDXL und VRAM](https://github.com/kohya-ss/sd-scripts/blob/main/docs/train_SDXL-en.md), [Datensatz-Konfiguration](https://github.com/kohya-ss/sd-scripts/blob/main/docs/config_README-en.md), [FLUX.1-LoRA-Training](https://github.com/kohya-ss/sd-scripts/blob/main/docs/flux_train_network.md), [WD14 tagger](https://github.com/kohya-ss/sd-scripts/blob/main/docs/wd14_tagger_README-en.md)
- [bmaltais/kohya_ss](https://github.com/bmaltais/kohya_ss), [Nerogar/OneTrainer](https://github.com/Nerogar/OneTrainer), [ostris/ai-toolkit](https://github.com/ostris/ai-toolkit), [JoyCaption](https://github.com/fpgaminer/joycaption)
- SDXL-Geschwindigkeit auf der 4090: [kohya_ss Issue #1288](https://github.com/bmaltais/kohya_ss/issues/1288)
- Black Forest Labs: [FLUX.2 [klein] in unter 60 Minuten mit einer LoRA feintunen](https://huggingface.co/blog/black-forest-labs/flux-2-klein-lora), Model Cards für [FLUX.1 [dev]](https://huggingface.co/black-forest-labs/FLUX.1-dev), [FLUX.2 [klein] 4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B), [FLUX.2 [klein] 9B](https://huggingface.co/black-forest-labs/FLUX.2-klein-base-9B)
- [Model Card von Stable Diffusion XL base 1.0](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0)
- Preise: [Preise von RunPod](https://www.runpod.io/pricing), [Preise für Pods und Speicher bei RunPod](https://docs.runpod.io/pods/pricing), [Preise von Vast.ai](https://docs.vast.ai/guides/instances/pricing.md), getdeploying.com für [RTX 3090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-3090), [RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090), [RTX 5090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-5090) und [Vast.ai](https://getdeploying.com/vast-ai)
- GPUFlow: [API-Schnellstart](https://docs.gpuflow.app/de/renters/api-quickstart/)
