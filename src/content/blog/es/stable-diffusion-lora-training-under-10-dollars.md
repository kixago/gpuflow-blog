---
title: "Entrena una LoRA de Stable Diffusion por menos de 10 $ en una GPU alquilada"
description: "Entrena una LoRA de SDXL o Flux en una RTX 4090 alquilada por bastante menos de 10 $: qué GPU elegir según la VRAM, descripciones, ajustes de sd-scripts y ai-toolkit y un cálculo de coste real."
excerpt: "Una sesión de entrenamiento de una LoRA de SDXL en una RTX 4090 alquilada cuesta entre 0,35 $ y 0,80 $ en septiembre de 2026. Aquí tienes qué GPU elegir, cómo preparar y describir las imágenes, el comando de entrenamiento exacto y en qué se va realmente el dinero."
pubDate: 2026-02-11
updatedDate: 2026-09-30
locale: "es"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/stable-diffusion-lora-training-guide.jpg"
heroImageAlt: "Ilustración de varias personas alrededor de un monitor grande con el diagrama de una red LoRA, junto a un rack de servidores y un panel que compara imágenes de muestra de dos épocas de entrenamiento"
faq:
  - question: "¿Cuánto cuesta entrenar una LoRA en una GPU alquilada?"
    answer: "En septiembre de 2026, una RTX 4090 se alquilaba por unos 0,31 $ la hora en Vast.ai y por 0,74 $ la hora según la página de precios de RunPod. Una sesión de LoRA de SDXL de unos 65 minutos, preparación y pruebas incluidas, cuesta por tanto entre 0,34 $ y 0,80 $ aproximadamente."
  - question: "¿Cuánta VRAM necesito para entrenar una LoRA de SDXL?"
    answer: "La documentación de sd-scripts dice que se puede entrenar una LoRA de SDXL con 8 GB de memoria de GPU, y recomienda 10 GB, si entrenas solo la U-Net, cacheas los latentes y las salidas del codificador de texto y usas gradient checkpointing. Con una tarjeta de 24 GB, como una RTX 3090 o 4090, entrenas a 1024x1024 sin pelearte con los límites de memoria."
  - question: "¿Puedo entrenar una LoRA de Flux en una RTX 4090?"
    answer: "Sí. ai-toolkit incluye configuraciones de ejemplo para FLUX.1 pensadas para tarjetas de 24 GB, y sd-scripts documenta ajustes para FLUX.1 de hasta 8 GB mediante intercambio de bloques. La propia guía de Black Forest Labs dice que una LoRA de FLUX.2 [klein] de 1800 pasos tarda menos de una hora en una RTX 4090."
  - question: "¿Cuántas imágenes necesito para entrenar una LoRA?"
    answer: "Para un personaje, un objeto o un estilo, lo habitual es entre 15 y 40 imágenes buenas; Black Forest Labs recomienda entre 15 y 40 imágenes con un mismo aspecto para FLUX.2 [klein]. Importa más que sean nítidas, variadas y bien descritas que tener muchas."
  - question: "¿Qué es mejor para entrenar LoRAs: kohya_ss, OneTrainer o ai-toolkit?"
    answer: "Los tres funcionan. sd-scripts de kohya es la referencia en línea de comandos y kohya_ss le pone una interfaz web encima; OneTrainer tiene interfaz de escritorio y generación de descripciones integrada; ai-toolkit tiene interfaz web, una plantilla oficial para RunPod y soporte temprano para modelos nuevos como FLUX.2 y Qwen-Image."
  - question: "¿Puedo entrenar una LoRA en GPUFlow?"
    answer: "No. GPUFlow alquila una API de chat compatible con OpenAI en la GPU de un proveedor, sin shell, sin SSH y sin acceso a archivos, así que no puedes ejecutar ahí un script de entrenamiento. Usa una plataforma que te alquile la máquina, como Vast.ai o RunPod."
---

Entrenar una LoRA para SDXL o para un modelo Flux pequeño en una GPU alquilada cuesta bastante menos de 10 $. En septiembre de 2026, una RTX 4090 se alquila por unos 0,31 $ la hora en Vast.ai y por 0,74 $ la hora en RunPod, y una sesión de LoRA de SDXL, con preparación y pruebas, dura algo más de una hora. Eso son entre 0,34 $ y 0,80 $ por intento, así que con 10 $ tienes para una docena.

Lo difícil no es el dinero. Lo difícil son las imágenes, las descripciones y saber cuándo parar. Esta guía lo cubre todo, con comandos que puedes copiar y pegar. Los precios y las versiones de las herramientas se comprobaron en septiembre de 2026; las fuentes están al final.

## El proceso en cinco pasos

<figure>
<svg viewBox="0 0 720 250" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">Proceso de entrenamiento de una LoRA: datos, descripciones, entrenar, probar y usar, con una vuelta a los datos cuando el resultado no es bueno</title>
<defs><marker id="d1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6366f1"/></marker></defs>
<rect width="720" height="250" fill="#ffffff"/>
<line x1="20" y1="40" x2="280" y2="40" stroke="#16a34a" stroke-width="2"/>
<text x="150" y="30" text-anchor="middle" fill="#16a34a" font-size="13">Gratis: en tu propio PC</text>
<line x1="300" y1="40" x2="560" y2="40" stroke="#f97316" stroke-width="2"/>
<text x="430" y="30" text-anchor="middle" fill="#f97316" font-size="13">Se factura: en la GPU alquilada</text>
<rect x="20" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="80" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">Datos</text>
<text x="80" y="112" text-anchor="middle" fill="#64748b" font-size="13">15–40 imágenes</text>
<rect x="160" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="220" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600" font-size="14">Descripciones</text>
<text x="220" y="112" text-anchor="middle" fill="#64748b" font-size="13">un .txt por imagen</text>
<rect x="300" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="360" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">Entrenar</text>
<text x="360" y="112" text-anchor="middle" fill="#64748b" font-size="13">sd-scripts</text>
<rect x="440" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="500" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">Probar</text>
<text x="500" y="112" text-anchor="middle" fill="#64748b" font-size="13">muestras</text>
<rect x="580" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="640" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">Usar</text>
<text x="640" y="112" text-anchor="middle" fill="#64748b" font-size="13">ComfyUI, Forge</text>
<line x1="140" y1="95" x2="158" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="280" y1="95" x2="298" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="420" y1="95" x2="438" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="560" y1="95" x2="578" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<path d="M500,130 L500,180 L80,180 L80,134" fill="none" stroke="#f97316" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#d1-arrow)"/>
<text x="290" y="205" text-anchor="middle" fill="#1e1b4b" font-size="13">¿No sale bien? Corrige imágenes o descripciones y vuelve a entrenar</text>
<text x="360" y="235" text-anchor="middle" fill="#64748b" font-size="13">Casi toda la calidad sale de las dos primeras cajas, que no cuestan nada</text>
</svg>
<figcaption>Prepara los datos y las descripciones antes de alquilar. La GPU solo se factura por el entrenamiento y las pruebas, y un mal resultado normalmente te devuelve a las imágenes, no a los ajustes.</figcaption>
</figure>

## Qué es una LoRA y por qué sale barata

LoRA (Low-Rank Adaptation) congela el modelo base y entrena dos matrices pequeñas junto a algunas de sus capas. El artículo original informaba de una reducción de 10.000 veces en los parámetros entrenables y de 3 veces en la memoria de GPU frente al fine-tuning completo de GPT-3 175B. Los modelos de imagen funcionan igual: el checkpoint base de SDXL es un archivo de 6,9 GB, mientras que la LoRA que entrenas es un archivo pequeño y aparte que cargas encima con la intensidad que quieras.

Por eso basta con una sola GPU de consumo, y por eso una sesión dura decenas de minutos y no días.

## Elige la GPU por la VRAM

La VRAM decide qué puedes entrenar. La velocidad decide cuántos minutos facturados dura la sesión, así que una tarjeta más rápida y más cara por hora puede acabar costando más o menos lo mismo por sesión.

| Familia de modelos | Mínimo documentado | Holgado | Notas |
| --- | --- | --- | --- |
| SD 1.5 | 8 GB | 12 GB o más | Entrena a 512x512, lo más barato y rápido |
| SDXL | 8 GB (10 GB recomendados) | 24 GB | Solo U-Net, latentes y salidas del codificador de texto en caché |
| FLUX.1 [dev] (12B) | 8 GB con mucho intercambio de bloques | 24 GB | sd-scripts documenta ajustes para 24, 16, 12, 10 y 8 GB |
| FLUX.2 [klein] 4B/9B | no se indica | 24 GB | BFL: unos 13 GB de pesos en bf16, una LoRA cabe en menos de 24 GB |

Los ajustes para poca VRAM funcionan, pero son lentos. sd-scripts mete FLUX.1 en 8 a 16 GB intercambiando bloques del transformer entre la GPU y la RAM del sistema, y cada intercambio cuesta un tiempo que pagas. En una máquina alquilada, lo sensato es una tarjeta de 24 GB: una RTX 3090 o 4090. La RTX 5090 (32 GB) también sirve, pero sd-scripts avisa de que necesita PyTorch 2.8.0 con CUDA 12.8 o 12.9, así que comprueba que tu plantilla trae una versión lo bastante reciente.

![Una tarjeta gráfica ASUS TUF con tres ventiladores, de pie sobre una estantería blanca](../_images/test-hero.jpg)

Las tarjetas de centro de datos son más rápidas, pero RunPod anuncia una A100 de 80 GB a 1,59 $ la hora, más del doble que una 4090. Para una LoRA con 20 o 30 imágenes, la velocidad extra rara vez compensa; tienen más sentido con conjuntos de datos grandes o con fine-tuning completo.

## Dónde alquilar y cuánto cuesta

Necesitas una plataforma que te dé una máquina: una shell o un notebook de Jupyter, un disco y una forma de subir y bajar archivos. Vast.ai y RunPod son las dos opciones más habituales para este tipo de trabajo.

| GPU | VRAM | Vast.ai (desde) | Página de precios de RunPod | RunPod, lo más barato registrado |
| --- | --- | --- | --- | --- |
| RTX 3090 | 24 GB | unos 0,11–0,13 $/h | 0,50 $/h | 0,22 $/h |
| RTX 4090 | 24 GB | unos 0,31–0,33 $/h | 0,74 $/h | 0,34 $/h |
| RTX 5090 | 32 GB | unos 0,41–0,47 $/h | 0,99 $/h | 0,69 $/h |

Precios de septiembre de 2026. «Vast.ai (desde)» y «RunPod, lo más barato registrado» salen del rastreador de precios de getdeploying.com; la columna central es la página de precios de RunPod. En Vast.ai cada host fija su precio, así que las ofertas que veas cambiarán según la ubicación y la puntuación de fiabilidad.

Las dos facturan por segundo. Los extras son distintos, y en un trabajo de una hora pesan más de lo que sugiere el precio por hora:

- **Vast.ai** cobra el almacenamiento «mientras exista tu instancia, esté o no en marcha», y cobra el ancho de banda por byte, a la tarifa que fija cada host. Descargar un modelo base de 7 GB en un host con ancho de banda caro se nota. Borra la instancia; no te limites a pararla.
- **RunPod** cobra 0,10 $ por GB al mes por el disco del contenedor mientras funciona, nada una vez parado, y 0,20 $ por GB al mes por un disco de volumen parado. No cobra la entrada ni la salida de datos.

Las dos tienen plantillas listas para usar. El autor de ai-toolkit mantiene una plantilla oficial para RunPod, y el README de kohya_ss cita RunPod como entorno compatible. Una plantilla te ahorra diez minutos o más instalando PyTorch con el contador en marcha. Para una comparativa de precios más amplia, consulta [GPUFlow frente a Vast.ai, RunPod y SaladCloud](/es/gpuflow-vs-vast-ai-vs-runpod/) y [los costes ocultos de alquilar una GPU](/es/hidden-fees-in-gpu-rental/).

## Prepara las imágenes y las descripciones

Haz todo esto en tu propio ordenador antes de alquilar nada.

### Imágenes

- **Cantidad.** Entre 15 y 40 imágenes para una persona, un objeto o un estilo. Black Forest Labs recomienda «15–40 imágenes que compartan un mismo aspecto» para FLUX.2 [klein]. Más no es mejor si las imágenes de más son peores.
- **Coherencia y variedad.** Todas las imágenes tienen que mostrar el concepto. Todo lo demás debe variar: ángulo, luz, fondo, encuadre. Si en todas las fotos tu producto está sobre la misma mesa blanca, la LoRA aprende la mesa.
- **Calidad.** Nítidas, bien expuestas, sin marcas de agua ni textos superpuestos. La LoRA aprende el ruido y los bloques de JPEG con la misma fidelidad que todo lo demás.
- **Resolución.** Al menos 1024 píxeles en el lado corto para SDXL y Flux, 512 para SD 1.5. No hace falta recortar en cuadrado: con el bucketing activado, sd-scripts agrupa las imágenes por relación de aspecto.

### Descripciones

Cada imagen lleva un archivo de texto con el mismo nombre (`photo01.jpg`, `photo01.txt`). La descripción (el caption) le dice al modelo lo que ya queda explicado con palabras, para que la LoRA aprenda lo que no. Pon primero una palabra clave poco común y después describe todo lo que quieras que siga siendo modificable:

```text
zxq_mug, a ceramic coffee mug on a wooden desk, morning light from the left, shallow depth of field
```

Hay dos herramientas que te escriben un primer borrador:

- **WD14 tagger**, incluido en sd-scripts, genera etiquetas separadas por comas. Va bien para modelos de estilo anime y para fine-tunes de SDXL entrenados con etiquetas:

  ```bash
  python finetune/tag_images_by_wd14_tagger.py --onnx \
    --repo_id SmilingWolf/wd-swinv2-tagger-v3 --batch_size 4 /workspace/dataset/img
  ```

- **JoyCaption**, un modelo de descripción abierto (Apache 2.0) creado para entrenar modelos de difusión, escribe frases en lenguaje natural, que a Flux le sientan mejor que las etiquetas. Su README dice que necesita unos 17 GB de VRAM en bf16, con versiones de 8 y 4 bits para tarjetas más pequeñas.

OneTrainer también genera descripciones con BLIP, BLIP2 y WD-1.4. Uses lo que uses para el borrador, lee cada descripción y corrígela. Es la media hora más rentable de todo el proyecto.

## Elige el entrenador

Cuatro herramientas cubren a casi todo el mundo. Todas son gratuitas y de código abierto.

| Herramienta | Interfaz | Modelos (septiembre de 2026) | Encaja bien en |
| --- | --- | --- | --- |
| kohya-ss/sd-scripts | Línea de comandos | SD 1.x/2.x, SDXL, SD3/3.5, FLUX.1, Lumina, HunyuanImage-2.1, Anima | Sesiones reproducibles, control total |
| bmaltais/kohya_ss | Interfaz web sobre sd-scripts | Los mismos que sd-scripts | sd-scripts sin memorizar opciones |
| Nerogar/OneTrainer | Interfaz de escritorio y CLI | SD 1.5 a 3.5, SDXL, FLUX.1, FLUX.2, Chroma, Qwen Image y más | Descripciones y máscaras integradas |
| ostris/ai-toolkit | Interfaz web y configuraciones YAML | SD 1.5, SDXL, FLUX.1, FLUX.2, Qwen-Image, vídeo Wan y más | Flux y modelos más nuevos, plantilla para RunPod |

sd-scripts va por la versión 0.11.1 (junio de 2026), está probado con Python 3.10 y necesita PyTorch 2.6.0 o posterior. ai-toolkit recomienda Python 3.12 y ahora instala PyTorch 2.13.0 compilado para CUDA 13.0. OneTrainer necesita Python de la 3.10 a la 3.13.

Yo uso sd-scripts para SDXL, porque la línea de comandos es toda la configuración y eso hace que las sesiones sean fáciles de repetir y comparar, y ai-toolkit para Flux.

## Entrena una LoRA de SDXL con sd-scripts

En una instancia Linux recién creada con driver de NVIDIA, la instalación son unos pocos comandos:

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

Copia tu carpeta de imágenes y descripciones `.txt` a `/workspace/dataset/img` con `scp`, `rsync` o el explorador de archivos de la plataforma. Después describe el conjunto de datos en `/workspace/dataset.toml`:

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

Y lanza el entrenamiento:

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

`prompts.txt` tiene un prompt de prueba por línea, con las opciones en línea de sd-scripts para tamaño, semilla y pasos:

```text
zxq_mug, a ceramic coffee mug on a kitchen counter --w 1024 --h 1024 --d 42 --s 28
zxq_mug, a ceramic coffee mug held by a hiker on a mountain top --w 1024 --h 1024 --d 42 --s 28
```

### Qué hace cada ajuste

- **Pasos.** Imágenes × repeticiones × épocas ÷ tamaño de lote. Con 25 imágenes: 25 × 10 × 8 = 2000 pasos.
- **`network_dim` 16, `network_alpha` 8.** La capacidad de la LoRA. 16 sobra para un objeto o una cara; los estilos a veces piden 32. Los rangos más altos se sobreajustan antes y generan archivos más grandes.
- **`--network_train_unet_only`.** Aquí es obligatorio: sd-scripts se niega a cachear las salidas del codificador de texto si a la vez entrenas los codificadores, y de todos modos su documentación dice que entrenar solo la U-Net es «muy recomendable» para las LoRAs de SDXL.
- **Caché y gradient checkpointing.** Son lo que hace que SDXL quepa en 8 a 10 GB. La caché también desactiva el barajado y el descarte de descripciones, y por eso no aparecen en el archivo del conjunto de datos.
- **`learning_rate` 1e-4 con AdamW8bit.** El valor del propio ejemplo de LoRA de SDXL de sd-scripts. Si las muestras apenas cambian después de cuatro épocas, prueba con 2e-4. Si se convierten en copias de tus imágenes de entrenamiento, bájalo o para antes.
- **Checkpoints cada 2 épocas.** Tendrás archivos de las épocas 2, 4, 6 y 8, y te quedas con el mejor. La mejor LoRA a menudo no es la última.

### Cuánto tarda

En un hilo de incidencias de kohya_ss, varios usuarios indicaban entre 1,1 y 1,4 iteraciones por segundo entrenando una LoRA de SDXL a 1024x1024, con tamaño de lote 1, en una RTX 4090 con gradient checkpointing. A esa velocidad, 2000 pasos llevan entre 24 y 30 minutos, más unos minutos para cachear los latentes. El mismo hilo muestra lo mal que va todo cuando una tarjeta se queda sin VRAM y tira de memoria compartida: 50 segundos o más por paso. Si tu velocidad está muy por debajo de lo esperado, mira `nvidia-smi` antes de culpar a los ajustes.

## Flux y modelos más nuevos con ai-toolkit

Para Flux, ai-toolkit es el camino más fácil. En una máquina alquilada:

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

O arranca la interfaz web con `cd ui && npm run build_and_start` y abre el puerto 8675. En un servidor al que pueda llegar otra gente, pon antes una contraseña en `AI_TOOLKIT_AUTH`, como recomienda el README.

Dos cosas sobre licencias antes de elegir un modelo Flux:

- **FLUX.1 [dev]** tiene acceso restringido en Hugging Face. Aceptas la FLUX.1 [dev] Non-Commercial License y usas un token de lectura de Hugging Face para descargarlo. Su ficha dice que las imágenes generadas se pueden usar comercialmente; los pesos y tu LoRA quedan bajo la licencia no comercial.
- **FLUX.2 [klein] 4B** es Apache 2.0 y no tiene acceso restringido. La versión 9B usa la FLUX Non-Commercial License.

Black Forest Labs publicó en junio de 2026 una guía para entrenar LoRAs de FLUX.2 [klein] con ai-toolkit: una sesión de 1800 pasos en una RTX 4090 «tarda menos de una hora», y recomiendan revisar los checkpoints entre los pasos 750 y 1500. No he encontrado una cifra publicada igual de sólida para FLUX.1 [dev], que triplica el tamaño de klein 4B; cuenta con más tiempo y mide tu primera sesión.

## Prueba la LoRA antes de dejar de pagar

Mira las imágenes de muestra de cada época guardada mientras la máquina sigue en marcha. Te dicen, gratis, si la LoRA ha aprendido el concepto y cuándo empezó a sobreajustarse. Después descarga los checkpoints que te gusten:

```bash
rsync -avP user@your-instance:/workspace/output/*.safetensors ./loras/
```

En casa, pon el archivo en la carpeta `models/loras` de ComfyUI o en `models/Lora` de Forge, y prueba con semillas fijas:

- **Intensidad.** Prueba 0,6, 0,8 y 1,0. Algunas LoRAs quedan mejor por debajo de 1,0.
- **Flexibilidad.** Pon la palabra clave en escenas que no estaban en tus datos. Una taza en una montaña, una cara en un cuadro. Si solo funciona en escenas parecidas a las de entrenamiento, está sobreajustada: usa una época anterior o menos repeticiones.
- **Fugas.** Genera sin la palabra clave. Si el concepto aparece igualmente, tus descripciones no describían lo suficiente de la imagen.

Cuando el resultado no es bueno, el arreglo suele estar en los datos: quitar unas cuantas imágenes flojas o escribir descripciones que nombren lo que quieres que varíe. Cambiar la tasa de aprendizaje es lo segundo que hay que probar, no lo primero.

## El coste, paso a paso

Una LoRA de SDXL, 25 imágenes, 2000 pasos, en una RTX 4090:

| Paso | Tiempo |
| --- | --- |
| Arrancar desde una plantilla, instalar sd-scripts | 10 min |
| Descargar SDXL base, subir las imágenes, cachear | 10 min |
| Entrenamiento (2000 pasos a 1,1–1,4 it/s) | 30 min |
| Revisar muestras, descargar checkpoints, borrar la instancia | 15 min |
| **Total** | **65 min (1,08 h)** |

- Vast.ai a 0,31 $/h: 1,08 × 0,31 $ = **0,34 $**, más el almacenamiento y la tarifa de ancho de banda del host.
- RunPod a 0,74 $/h: 1,08 × 0,74 $ = **0,80 $**. Un disco de contenedor de 50 GB durante esa hora suma 50 × 0,10 $ ÷ 730 horas = menos de 1 centavo.

Una LoRA de FLUX.2 [klein] con una hora de entrenamiento y 30 minutos de preparación y pruebas sale a 1,5 × 0,74 $ = **1,11 $** en RunPod, o 1,5 × 0,31 $ = **0,47 $** en Vast.ai.

<figure>
<svg viewBox="0 0 720 300" role="img" aria-labelledby="d2-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d2-title">Gráfico de barras con el coste de entrenar LoRAs en una RTX 4090 alquilada frente a un presupuesto de 10 dólares</title>
<rect width="720" height="300" fill="#ffffff"/>
<line x1="230" y1="40" x2="230" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="322" y1="40" x2="322" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="414" y1="40" x2="414" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="506" y1="40" x2="506" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="598" y1="40" x2="598" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="690" y1="30" x2="690" y2="250" stroke="#f97316" stroke-width="2" stroke-dasharray="6 4"/>
<text x="698" y="22" text-anchor="end" fill="#f97316" font-size="13">Presupuesto: 10 $</text>
<text x="220" y="75" text-anchor="end" fill="#1e1b4b">SDXL, Vast.ai</text>
<rect x="230" y="58" width="15.6" height="26" fill="#16a34a"/>
<text x="253" y="76" fill="#1e1b4b" font-size="13">0,34 $</text>
<text x="220" y="125" text-anchor="end" fill="#1e1b4b">SDXL, RunPod</text>
<rect x="230" y="108" width="36.8" height="26" fill="#6366f1"/>
<text x="275" y="126" fill="#1e1b4b" font-size="13">0,80 $</text>
<text x="220" y="175" text-anchor="end" fill="#1e1b4b">FLUX.2 klein, RunPod</text>
<rect x="230" y="158" width="51.1" height="26" fill="#6366f1"/>
<text x="289" y="176" fill="#1e1b4b" font-size="13">1,11 $</text>
<text x="220" y="225" text-anchor="end" fill="#1e1b4b" font-size="14">5 sesiones SDXL, RunPod</text>
<rect x="230" y="208" width="184.5" height="26" fill="#6366f1"/>
<text x="422" y="226" fill="#1e1b4b" font-size="13">4,01 $</text>
<line x1="230" y1="250" x2="690" y2="250" stroke="#64748b" stroke-width="1"/>
<text x="230" y="270" text-anchor="middle" fill="#64748b" font-size="13">0 $</text>
<text x="322" y="270" text-anchor="middle" fill="#64748b" font-size="13">2 $</text>
<text x="414" y="270" text-anchor="middle" fill="#64748b" font-size="13">4 $</text>
<text x="506" y="270" text-anchor="middle" fill="#64748b" font-size="13">6 $</text>
<text x="598" y="270" text-anchor="middle" fill="#64748b" font-size="13">8 $</text>
<text x="690" y="270" text-anchor="middle" fill="#64748b" font-size="13">10 $</text>
<text x="460" y="292" text-anchor="middle" fill="#64748b" font-size="13">Coste por sesión en una RTX 4090, precios de septiembre de 2026</text>
</svg>
<figcaption>Incluso cinco intentos de SDXL al precio de lista de RunPod se quedan muy por debajo de 10 $. A 0,74 $ la hora, 10 $ dan para 13,5 horas de RTX 4090; a 0,31 $, para unas 32 horas.</figcaption>
</figure>

Lo que de verdad se come un presupuesto de 10 $ rara vez es el entrenamiento. Es una instancia que se queda encendida toda la noche (12 horas a 0,74 $ son 8,88 $), una instancia de Vast.ai parada que sigue pagando almacenamiento o una hora describiendo imágenes con el contador en marcha. La facturación por segundo solo ayuda si borras la máquina cuando terminas.

## Dónde encaja GPUFlow

En este trabajo, no encaja. GPUFlow alquila acceso a un modelo de lenguaje que un proveedor sirve (normalmente con Ollama) en su propia GPU, mediante una clave API compatible con OpenAI. No hay shell, ni SSH, ni acceso a archivos, así que no puedes instalar un entrenador, subir imágenes ni descargar una LoRA. Además sirve modelos de chat, no modelos de imagen. Entrena en Vast.ai, RunPod o una plataforma parecida que te alquile la máquina.

Si trabajas con texto y no con imágenes, el mismo enfoque de alquilar, entrenar y borrar vale para los modelos de lenguaje: consulta [cómo hacer fine-tuning de un LLM en privado en una GPU alquilada](/es/private-llm-fine-tuning-guide/).

## Fuentes

Todas revisadas en septiembre de 2026.

- Artículo de LoRA: [Hu et al., LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685)
- sd-scripts: [README y versiones](https://github.com/kohya-ss/sd-scripts), [entrenamiento de LoRAs de SDXL](https://github.com/kohya-ss/sd-scripts/blob/main/docs/sdxl_train_network.md), [notas sobre SDXL y VRAM](https://github.com/kohya-ss/sd-scripts/blob/main/docs/train_SDXL-en.md), [configuración del conjunto de datos](https://github.com/kohya-ss/sd-scripts/blob/main/docs/config_README-en.md), [entrenamiento de LoRAs de FLUX.1](https://github.com/kohya-ss/sd-scripts/blob/main/docs/flux_train_network.md), [WD14 tagger](https://github.com/kohya-ss/sd-scripts/blob/main/docs/wd14_tagger_README-en.md)
- [bmaltais/kohya_ss](https://github.com/bmaltais/kohya_ss), [Nerogar/OneTrainer](https://github.com/Nerogar/OneTrainer), [ostris/ai-toolkit](https://github.com/ostris/ai-toolkit), [JoyCaption](https://github.com/fpgaminer/joycaption)
- Velocidades de SDXL en la 4090: [incidencia n.º 1288 de kohya_ss](https://github.com/bmaltais/kohya_ss/issues/1288)
- Black Forest Labs: [Fine-tune FLUX.2 [klein] with a LoRA under 60 minutes](https://huggingface.co/blog/black-forest-labs/flux-2-klein-lora), fichas de modelo de [FLUX.1 [dev]](https://huggingface.co/black-forest-labs/FLUX.1-dev), [FLUX.2 [klein] 4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B) y [FLUX.2 [klein] 9B](https://huggingface.co/black-forest-labs/FLUX.2-klein-base-9B)
- [Ficha del modelo Stable Diffusion XL base 1.0](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0)
- Precios: [precios de RunPod](https://www.runpod.io/pricing), [precios y almacenamiento de pods en RunPod](https://docs.runpod.io/pods/pricing), [precios de Vast.ai](https://docs.vast.ai/guides/instances/pricing.md), getdeploying.com para la [RTX 3090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-3090), la [RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090), la [RTX 5090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-5090) y [Vast.ai](https://getdeploying.com/vast-ai)
- GPUFlow: [guía rápida de la API](https://docs.gpuflow.app/es/renters/api-quickstart/)
