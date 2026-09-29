---
title: "Cómo entrenar modelos LoRA de Stable Diffusion por menos de 10 $"
description: "Guía paso a paso para entrenar modelos LoRA personalizados de Stable Diffusion con GPU alquiladas. Tutorial completo: elección de GPU, preparación del dataset, configuración del entrenamiento y optimización de costes."
excerpt: "Tutorial práctico para entrenar modelos LoRA de calidad alquilando una GPU. Cubre la elección del proveedor, la configuración y las técnicas para mantener el coste total por debajo de 10 $."
pubDate: 2026-02-11
updatedDate: 2026-09-29
locale: "es"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/stable-diffusion-lora-training-guide.jpg"
heroImageAlt: "Tarjeta gráfica NVIDIA instalada en un rack de servidores con ventiladores de refrigeración e iluminación LED visibles"
faq:
  - question: "¿Puedo entrenar modelos LoRA con mi propia GPU en lugar de alquilar una?"
    answer: "Sí, siempre que tengas una GPU NVIDIA con al menos 12 GB de VRAM, como una RTX 3060 o superior. Aun así, el coste de la electricidad, el desgaste del hardware y los tiempos de entrenamiento mucho más largos en hardware de consumo suelen hacer que alquilar sea más económico para proyectos puntuales."
  - question: "¿Cuánto dura una sesión típica de entrenamiento de LoRA?"
    answer: "La mayoría de los entrenamientos de LoRA terminan en una a tres horas con una RTX 4090 o una RTX 3090. La duración exacta depende del tamaño del dataset, del número de épocas y del tamaño de lote que configures."
  - question: "¿Cuál es el número mínimo de imágenes necesario para entrenar un LoRA?"
    answer: "Puedes obtener resultados razonables con solo quince o veinte imágenes. Sin embargo, los datasets de treinta a cien imágenes bien descritas suelen dar mejor calidad. La calidad de las imágenes y la precisión de las descripciones importan más que la cantidad."
  - question: "¿Qué proveedor de alquiler de GPU ofrece la mejor relación calidad-precio para entrenar LoRA?"
    answer: "Vast.ai suele tener las tarifas por hora más bajas para la RTX 4090. RunPod ofrece la interfaz más sencilla para quien empieza a alquilar GPU, con plantillas listas para usar."
  - question: "¿Sale más barato entrenar varios modelos LoRA en una sola sesión?"
    answer: "Sí. Entrenar varios LoRA en una sola sesión larga elimina la configuración repetida y reduce al mínimo el tiempo de GPU ociosa que pagas. Entrenar de tres a cinco modelos LoRA en una sesión de cuatro horas suele costar menos de la mitad que entrenarlos por separado."
---

# Cómo entrenar modelos LoRA de Stable Diffusion por menos de 10 $

Entrenar modelos LoRA personalizados para Stable Diffusion se ha convertido en una de las formas más accesibles de crear imágenes personalizadas con IA. Tanto si quieres reproducir un estilo artístico concreto como generar caras coherentes de un personaje o ajustar el modelo con fotografía de producto, el entrenamiento de LoRA te permite conseguirlo sin el coste computacional de un fine-tuning completo del modelo.

Se suele dar por hecho que este proceso exige hardware local caro o un presupuesto considerable de computación en la nube. Ninguna de las dos cosas es cierta. Con los precios actuales de alquiler de GPU y una configuración de entrenamiento eficiente, puedes entrenar modelos LoRA con calidad de producción por menos de diez dólares, y a menudo por bastante menos.

Esta guía recorre el proceso completo: elegir el hardware adecuado, preparar el dataset de entrenamiento, configurar los parámetros, lanzar el entrenamiento y validar los resultados. Daré cifras concretas de coste en cada fase, porque las promesas vagas de "entrenamiento de IA asequible" no ayudan a nadie que tenga que presupuestar un proyecto real.

**Qué necesitas antes de empezar:**

- De veinte a cien imágenes de entrenamiento (más abajo verás los criterios de selección)
- Nociones básicas de línea de comandos
- Una tarjeta de pago para añadir saldo en una plataforma de alquiler de GPU
- Unas dos a cuatro horas de trabajo concentrado
- Un presupuesto de cinco a quince dólares para tu primer entrenamiento

![Interior de un centro de datos moderno con filas de servidores GPU de alto rendimiento para cargas de machine learning](../_images/data-center-with-person.jpg)

---

## Índice

- [Qué es LoRA y por qué importa](#qué-es-lora-y-por-qué-importa)
- [Cómo elegir la GPU adecuada para entrenar](#cómo-elegir-la-gpu-adecuada-para-entrenar)
- [Comparativa de proveedores de alquiler de GPU](#comparativa-de-proveedores-de-alquiler-de-gpu)
- [Cómo preparar el dataset de entrenamiento](#cómo-preparar-el-dataset-de-entrenamiento)
- [Configuración del entorno de entrenamiento](#configuración-del-entorno-de-entrenamiento)
- [Configuración de los parámetros de entrenamiento](#configuración-de-los-parámetros-de-entrenamiento)
- [Ejecución del entrenamiento](#ejecución-del-entrenamiento)
- [Validación y pruebas de tu LoRA](#validación-y-pruebas-de-tu-lora)
- [Estrategias para reducir costes](#estrategias-para-reducir-costes)
- [Problemas habituales y soluciones](#problemas-habituales-y-soluciones)
- [Preguntas frecuentes](#preguntas-frecuentes)

---

## Qué es LoRA y por qué importa

LoRA (Low-Rank Adaptation) es una técnica para hacer fine-tuning de redes neuronales grandes entrenando un número pequeño de parámetros adicionales en lugar de modificar el modelo entero. El modelo original de Stable Diffusion tiene casi mil millones de parámetros. Un fine-tuning completo obligaría a modificarlos todos, lo que exige mucha memoria de GPU y entrenamientos largos.

LoRA evita este problema congelando los pesos originales del modelo y entrenando pequeñas matrices adaptadoras que modifican cómo procesa la información el modelo. Un archivo LoRA típico ocupa entre diez y doscientos megabytes, frente a los dos a seis gigabytes de un checkpoint completo de Stable Diffusion.

Las consecuencias prácticas son importantes:

**Eficiencia de memoria.** Entrenar un LoRA requiere mucha menos VRAM que un fine-tuning completo. Una GPU de 24 GB puede entrenar sin problema LoRA para modelos SDXL que, con un fine-tuning completo, necesitarían 40 GB o más.

**Velocidad de entrenamiento.** Como entrenas menos parámetros, cada época termina antes. Lo que podría llevar doce horas con un fine-tuning completo a menudo se consigue en noventa minutos con LoRA.

**Combinabilidad.** Puedes combinar varios LoRA en el momento de la inferencia. Por ejemplo, un LoRA para el estilo artístico y otro para la coherencia del personaje, mezclados con distinta intensidad y sin volver a entrenar.

**Almacenamiento y distribución.** Al ser archivos pequeños, los LoRA son fáciles de compartir y mantener. Puedes tener decenas de LoRA especializados sin preocuparte por el espacio.

Esta eficiencia es lo que hace posible entrenar por menos de diez dólares. Alquilas hardware caro durante una a tres horas, no durante ocho a veinticuatro.

---

## Cómo elegir la GPU adecuada para entrenar

Elegir la GPU es cuestión de equilibrar tres factores: capacidad de VRAM, velocidad de entrenamiento y precio del alquiler. La opción mínima viable y la óptima son bastante distintas.

### Requisitos de VRAM

Para entrenar LoRA de Stable Diffusion 1.5, 12 GB de VRAM es el mínimo práctico. Se puede hacer con 8 GB reduciendo el tamaño de lote y la resolución, pero la calidad del entrenamiento suele resentirse.

Para entrenar LoRA de SDXL, el mínimo son 16 GB, y lo muy recomendable son 24 GB. Los modelos SDXL son más grandes y exigentes. Intentar entrenar SDXL con VRAM insuficiente provoca un intercambio constante de memoria que ralentiza muchísimo el proceso y a menudo hace que el entrenamiento falle.

### Velocidad frente a coste

Las GPU más caras entrenan más rápido, pero el aumento del precio por hora no siempre reduce en la misma proporción el coste total del proyecto. Fíjate en esta comparación para entrenar un LoRA típico de SD 1.5:

| GPU         | VRAM  | Tiempo de entrenamiento aproximado | Tarifa por hora habitual | Coste total estimado |
| ----------- | ----- | ---------------------------------- | ------------------------ | -------------------- |
| RTX 3090    | 24 GB | 2,5 horas                          | 0,50 $                   | 1,25 $               |
| RTX 4090    | 24 GB | 1,5 horas                          | 0,70 $                   | 1,05 $               |
| RTX A6000   | 48 GB | 1,5 horas                          | 0,80 $                   | 1,20 $               |
| A100 (40GB) | 40 GB | 1,0 horas                          | 1,50 $                   | 1,50 $               |

La RTX 4090 suele ofrecer la mejor relación coste-rendimiento. Entrena casi tan rápido como las GPU de centro de datos con una tarifa por hora bastante más baja. La RTX 3090 sigue siendo una opción válida cuando hay poca disponibilidad de 4090, con un coste total solo ligeramente superior.

Para entrenar LoRA de SDXL, las cuentas cambian un poco, porque el modelo más grande se beneficia más de la VRAM y el ancho de banda de memoria adicionales. La A100 resulta más competitiva en proyectos SDXL complejos en los que el entrenamiento podría llevar cuatro horas o más en hardware de consumo.

Si quieres un análisis completo de los precios de alquiler de GPU en todos los grandes proveedores, incluidas las nubes empresariales y los marketplaces, consulta nuestra [comparativa completa de precios de alquiler de GPU para 2026](/es/gpu-rental-pricing-comparison-2026/).

![Tarjeta gráfica NVIDIA RTX 4090 con refrigeración de triple ventilador, habitual para entrenar modelos de IA](../_images/test-hero.jpg)

---

## Comparativa de proveedores de alquiler de GPU

Hay dos proveedores que merece la pena considerar para entrenar LoRA. Cada uno tiene características propias que importan según tu soltura técnica y lo mucho que te preocupe el precio.

### Vast.ai

Vast.ai funciona como un marketplace entre particulares en el que los dueños de GPU ponen su hardware en alquiler. Este modelo consigue los precios más bajos del mercado, con RTX 4090 disponibles a menudo por entre 0,35 $ y 0,60 $ por hora.

La contrapartida es la variabilidad. La fiabilidad va del 97 % al 99,9 % según el anfitrión. La disponibilidad fluctúa con la demanda. Puede que tengas que probar varios anfitriones hasta encontrar uno con una velocidad de red aceptable para subir tu dataset.

Si tienes experiencia y sabes evaluar las métricas de cada anfitrión, Vast.ai te da el coste de entrenamiento más bajo posible. Reserva treinta minutos más para la configuración inicial y la evaluación del anfitrión.

### RunPod

RunPod se sitúa entre los marketplaces puros y los proveedores cloud empresariales. La plataforma ofrece tanto GPU de la comunidad como instancias dedicadas "Secure Cloud" con un rendimiento más constante.

Los precios son algo más altos que en Vast.ai, normalmente 0,59 $ por hora por una RTX 4090 en el nivel Secure Cloud. A cambio, la configuración es más sencilla, hay plantillas preconfiguradas para las cargas de IA más comunes y la disponibilidad es más predecible.

Si es la primera vez que alquilas una GPU o prefieres una interfaz sencilla antes que apurar hasta el último céntimo, RunPod es un término medio razonable.

### Una nota sobre GPUFlow

GPUFlow no sirve para entrenar LoRA. Alquila acceso a modelos de chat de IA a través de una API compatible con OpenAI, no una máquina en la que puedas ejecutar scripts de entrenamiento. Para entrenar, usa una plataforma que te dé la máquina, como las dos anteriores. En [GPUFlow vs Vast.ai vs RunPod vs SaladCloud](/es/gpuflow-vs-vast-ai-vs-runpod/) verás en qué se diferencian estos enfoques.

### Resumen de proveedores

| Proveedor | Rango de precio RTX 4090   | Tiempo de configuración | Formas de pago    | Ideal para             |
| --------- | -------------------------- | ----------------------- | ----------------- | ---------------------- |
| Vast.ai   | 0,35-0,60 $/h              | 5-15 minutos            | Tarjeta, cripto   | Máximo ahorro          |
| RunPod    | 0,59 $/h (Secure Cloud)    | 2-5 minutos             | Tarjeta, cripto   | Facilidad de uso       |

Precios a febrero de 2026. En septiembre de 2026 vimos RTX 4090 desde unos 0,37 $ por hora en Vast.ai y 0,74 $ en RunPod Secure Cloud; consulta [nuestra comparativa actual](/es/gpuflow-vs-vast-ai-vs-runpod/).

---

## Cómo preparar el dataset de entrenamiento

La calidad del dataset determina el resultado del entrenamiento más que cualquier otro factor. Un conjunto cuidadosamente seleccionado de treinta imágenes dará mejores resultados que una colección de doscientas reunida sin cuidado.

### Criterios para seleccionar imágenes

**Coherencia.** Todas las imágenes deben representar el concepto que quieres que aprenda el modelo. Si entrenas con la cara de una persona concreta, esa cara debe verse con claridad en todas las imágenes. Si entrenas un estilo artístico, todas las imágenes deben ser un buen ejemplo de ese estilo.

**Variedad dentro de la coherencia.** Sin perder la coherencia del concepto, varía los aspectos técnicos. Incluye distintos ángulos, condiciones de luz, fondos y contextos. Esta variedad enseña al modelo a generalizar en lugar de sobreajustarse a composiciones concretas.

**Calidad técnica.** Usa imágenes nítidas y bien expuestas. El desenfoque de movimiento, el ruido, los artefactos de compresión y la mala iluminación pasan a formar parte de lo que aprende el modelo. Si tus imágenes de entrenamiento tienen grano, las imágenes generadas tenderán a tenerlo.

**Resolución.** Las imágenes de entrenamiento deben tener al menos 512x512 píxeles para SD 1.5 y al menos 1024x1024 para SDXL. Con imágenes de origen de mayor resolución, el pipeline de entrenamiento puede recortar y redimensionar sin perder calidad.

### Tamaño recomendado del dataset

El tamaño óptimo del dataset depende de la complejidad del concepto:

**Conceptos sencillos (una sola cara, un estilo básico):** 20-40 imágenes
**Conceptos intermedios (personaje con varios atuendos, estilo con matices):** 40-80 imágenes
**Conceptos complejos (entorno detallado, estilo muy variable):** 80-150 imágenes

Más imágenes requieren más pasos de entrenamiento, lo que aumenta el tiempo y el coste. En tus primeros intentos, empieza por la parte baja de estos rangos.

### Descripciones de las imágenes

Cada imagen de entrenamiento necesita una descripción de texto (caption) de su contenido. Estas descripciones enseñan al modelo qué conceptos de texto debe asociar a cada patrón visual.

Las descripciones eficaces son concretas y coherentes:

**Descripción pobre:** "a woman"
**Descripción mejor:** "a photograph of Sarah Miller, a woman with short brown hair and green eyes, wearing a blue sweater"

**Descripción pobre:** "fantasy art"
**Descripción mejor:** "a digital painting in the style of luminescent fantasy, featuring glowing mushrooms in a dark forest, detailed linework, vibrant purple and blue color palette"

La palabra o frase de activación (trigger) que quieras usar en la inferencia debe aparecer en todas las descripciones. Si quieres invocar tu LoRA con "in the style of luminescent fantasy", esa frase exacta debe aparecer en cada descripción de entrenamiento.

Con datasets pequeños puedes escribir las descripciones a mano. Para colecciones más grandes, herramientas como BLIP o WD14 Tagger generan descripciones iniciales que luego revisas y pules.

![Estructura de carpetas organizada con las imágenes de entrenamiento junto a sus archivos de texto con las descripciones para entrenar un LoRA](../_images/file-folder-organization.png)

### Estructura de directorios

Organiza los datos de entrenamiento con la estructura concreta que esperan los scripts:

```
training_data/
├── 10_concept_name/
│   ├── image001.jpg
│   ├── image001.txt
│   ├── image002.jpg
│   ├── image002.txt
│   └── ...
```

El prefijo del nombre de la carpeta (el "10" de este ejemplo) indica cuántas veces se repite cada imagen de esa carpeta durante el entrenamiento. Los números más altos dan más peso a esas imágenes en el proceso.

El nombre separado por guiones bajos que va después del número se convierte en la palabra de activación por defecto si decides no usar descripciones personalizadas.

---

## Configuración del entorno de entrenamiento

Con el dataset preparado y la GPU alquilada, el siguiente paso es configurar el entorno de entrenamiento. La herramienta estándar para entrenar LoRA es kohya_ss/sd-scripts, una colección de scripts de entrenamiento de código abierto mantenida por la comunidad.

### Configuración inicial del entorno

Después de conectarte a tu instancia GPU alquilada, tendrás que clonar el repositorio de entrenamiento e instalar las dependencias. Estos comandos preparan el entorno básico:

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

La instalación suele tardar de cinco a diez minutos, según la velocidad de la red. El paquete xformers es opcional pero recomendable, porque reduce bastante el uso de memoria durante el entrenamiento.

### Descarga del modelo base

Para entrenar un LoRA necesitas un modelo base de Stable Diffusion sobre el que entrenar. Tendrás que descargarlo en tu instancia:

```bash
# Create a models directory
mkdir -p models/sd

# Download Stable Diffusion 1.5 (approximately 4GB)
wget -O models/sd/v1-5-pruned.safetensors \
  "https://huggingface.co/runwayml/stable-diffusion-v1-5/resolve/main/v1-5-pruned.safetensors"
```

Para entrenar con SDXL, usa en su lugar el modelo base de SDXL, que ocupa unos 6,5 GB.

### Subida de los datos de entrenamiento

Transfiere el dataset preparado a la instancia GPU. La mayoría de los proveedores admiten SCP o SFTP:

```bash
# From your local machine
scp -r ./training_data user@gpu-instance-ip:~/sd-scripts/
```

Si tienes el dataset en un almacenamiento en la nube, también puedes descargarlo directamente en la instancia con wget o rclone.

### Ahorra tiempo de configuración con una plantilla

Tanto RunPod como Vast.ai ofrecen imágenes listas para usar con las herramientas de entrenamiento de Stable Diffusion ya instaladas. Partir de una de ellas suele ahorrarte de quince a veinte minutos respecto a configurar una instancia vacía desde cero, y el tiempo de configuración también se factura. En entrenamientos puntuales, eso puede ser una parte considerable del coste total del alquiler.

---

## Configuración de los parámetros de entrenamiento

La configuración del entrenamiento influye mucho tanto en la calidad del resultado como en la duración. Los parámetros siguientes son puntos de partida conservadores que dan resultados fiables sin un cómputo excesivo.

### Parámetros esenciales

Crea un archivo de configuración llamado `training_config.toml`:

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

### Qué hace cada parámetro

**resolution:** hazla coincidir con la resolución que usarás en la inferencia. 512 para SD 1.5 y 1024 para SDXL.

**batch_size:** los valores altos entrenan más rápido, pero necesitan más VRAM. Empieza con 2 y súbelo a 4 si la memoria lo permite.

**max_train_epochs:** una época significa que el modelo ve cada imagen de entrenamiento una vez. Diez épocas es un punto de partida razonable para la mayoría de los datasets.

**learning_rate:** controla con qué agresividad se actualiza el modelo. Los valores de arriba son conservadores. Si los resultados son flojos, prueba a subirlo a 2e-4 o 3e-4.

**network_dim y network_alpha:** controlan la capacidad del LoRA. Dim 32 con alpha 16 equilibra calidad y tamaño de archivo. Las dimensiones más altas (64, 128) captan más detalle, pero generan archivos más grandes y aumentan el riesgo de sobreajuste.

**optimizer_type:** AdamW8bit reduce mucho el uso de memoria con un impacto mínimo en la calidad. Imprescindible para entrenar SDXL en tarjetas de 24 GB.

**mixed_precision:** entrenar en FP16 reduce a la mitad la memoria necesaria respecto a FP32. El impacto en la calidad es insignificante en la mayoría de los casos.

### Ajustes según tu hardware

Para una RTX 4090 con 24 GB de VRAM:

- batch_size = 4 suele ser seguro para SD 1.5
- batch_size = 2 para SDXL

Para una RTX 3090 con 24 GB de VRAM:

- batch_size = 2 para SD 1.5
- batch_size = 1 para SDXL (activa gradient checkpointing)

Para una A100 con 40 GB de VRAM:

- batch_size = 6-8 para SD 1.5
- batch_size = 4 para SDXL

Un tamaño de lote mayor reduce proporcionalmente el tiempo total de entrenamiento. Duplicar el tamaño de lote reduce aproximadamente a la mitad el número de pasos de optimización necesarios.

![Editor de código con el archivo de configuración de entrenamiento de LoRA y los parámetros de tasa de aprendizaje, tamaño de lote y dimensiones de la red](../_images/terminal-screenshot-code-editor.png)

---

## Ejecución del entrenamiento

Con el entorno configurado y los parámetros definidos, lanza el entrenamiento:

```bash
accelerate launch --num_cpu_threads_per_process=4 train_network.py \
  --config_file="./training_config.toml" \
  --logging_dir="./logs"
```

### Seguimiento del progreso

La salida del entrenamiento muestra los valores de pérdida y el progreso:

```
epoch 1/10, step 50/500, loss=0.0823
epoch 1/10, step 100/500, loss=0.0756
epoch 1/10, step 150/500, loss=0.0691
...
```

**En qué fijarte:**

La pérdida debería bajar en general durante las primeras épocas y después estabilizarse. Un entrenamiento típico podría mostrar:

- Época 1: pérdida en torno a 0,08-0,10
- Época 5: pérdida en torno a 0,05-0,07
- Época 10: pérdida en torno a 0,04-0,06

Si la pérdida sube después de bajar al principio, puede que el modelo se esté sobreajustando. Si se mantiene plana desde el principio, puede que la tasa de aprendizaje sea demasiado baja.

### Checkpoints

La configuración guarda un checkpoint cada dos épocas. Estos guardados intermedios sirven para dos cosas:

1. **Recuperación.** Si el entrenamiento falla o tienes que pararlo antes de tiempo, puedes reanudarlo desde el último checkpoint.

2. **Selección.** A veces cada época da un resultado con características distintas. La época 6 puede captar bien tu concepto mientras que la 10 se sobreajusta. Con los checkpoints puedes probar y elegir.

### Tiempos de entrenamiento esperados

Para un LoRA de SD 1.5 con 50 imágenes y la configuración anterior:

| GPU      | Tiempo aproximado |
| -------- | ----------------- |
| RTX 3090 | 90-120 minutos    |
| RTX 4090 | 60-90 minutos     |
| A100     | 45-60 minutos     |

Entrenar con SDXL lleva aproximadamente entre 1,5 y 2 veces estos tiempos.

---

## Validación y pruebas de tu LoRA

Al terminar el entrenamiento tendrás un archivo .safetensors en el directorio de salida. Tienes que probarlo antes de dar el proyecto por terminado.

### Validación básica

Copia el archivo LoRA a tu máquina local o a un sistema que ejecute Stable Diffusion WebUI:

```bash
# Download from GPU instance
scp user@gpu-instance-ip:~/sd-scripts/output/my_lora.safetensors ./
```

En Automatic1111 WebUI, coloca el archivo en el directorio `models/Lora`. En ComfyUI, usa el directorio `models/loras`.

### Metodología de pruebas

Genera una serie de imágenes de prueba variando estos factores:

**Peso del LoRA:** prueba con intensidades de 0,5, 0,7, 0,8 y 1,0. Algunos LoRA funcionan mejor por debajo de la intensidad máxima.

**Posición en el prompt:** pon la palabra de activación en distintas posiciones del prompt. Al principio, en medio y al final pueden dar resultados sutilmente distintos.

**Prompts negativos:** prueba con y sin tu concepto en los prompts negativos. A veces, añadir la palabra de activación a los negativos con un peso bajo produce inversiones interesantes.

**Distintas semillas:** usa al menos cinco semillas diferentes por configuración para distinguir los patrones consistentes de la variación aleatoria.

### Evaluación de la calidad

Evalúa los resultados con estos criterios:

**Fidelidad al concepto:** ¿el resultado generado refleja el concepto que has entrenado? Si entrenaste con una cara, ¿se reconoce esa cara?

**Integración:** ¿el concepto del LoRA se integra de forma natural con el resto de elementos del prompt? ¿Puedes situar a tu personaje en escenas variadas?

**Artefactos:** busca patrones repetidos, elementos poco naturales o distorsiones que aparezcan de forma sistemática. Indican problemas en el entrenamiento o sobreajuste.

**Flexibilidad:** prueba casos límite. Si entrenaste un personaje, ¿se puede representar con distintas edades? ¿Con otra ropa? ¿Haciendo acciones diferentes?

Si los resultados no te convencen, estas son las soluciones más habituales:

- Entrenar más épocas (infraajuste)
- Entrenar menos épocas (sobreajuste)
- Ajustar la tasa de aprendizaje
- Mejorar la calidad de las descripciones
- Añadir imágenes de entrenamiento más variadas

![Cuadrícula comparativa de resultados de Stable Diffusion con distintas intensidades de LoRA que muestra las diferencias de calidad en las imágenes generadas](../_images/side-by-side-comparison.png)

---

## Estrategias para reducir costes

La diferencia entre un entrenamiento de cinco dólares y uno de veinte suele estar en la eficiencia del flujo de trabajo más que en el proveedor elegido.

### Prepara el dataset antes de subirlo

Termina toda la selección, el recorte y las descripciones del dataset en tu máquina local antes de empezar a alquilar la GPU. Pagar 0,70 $ por hora para revisar y renombrar archivos a mano es un uso muy caro de ese hardware.

Lista de comprobación antes de empezar el alquiler:

- Todas las imágenes recortadas con la relación de aspecto adecuada
- Todas las descripciones escritas y revisadas
- Dataset organizado con la estructura de carpetas correcta
- Archivo de configuración del entrenamiento preparado
- Comandos de prueba escritos y listos para pegar

### Entrenamiento por lotes

Si necesitas varios LoRA, entrénalos en una sola sesión. Los costes fijos de configurar el entorno y descargar el modelo se reparten entre todos los entrenamientos.

Por ejemplo, para entrenar tres LoRA distintos:

- Tres sesiones separadas: 3 × (20 min de configuración + 90 min de entrenamiento) = 330 minutos
- Una sola sesión agrupada: 20 min de configuración + (3 × 90 min de entrenamiento) = 290 minutos

Los cuarenta minutos ahorrados suponen una reducción de costes de aproximadamente el 15 %.

### Estrategia de prueba con checkpoints

En lugar de entrenar hasta la época 15 y esperar que salga bien, plantéate esto:

1. Entrena hasta la época 6 (aproximadamente el 60 % del tiempo total de entrenamiento)
2. Prueba el checkpoint
3. Si el resultado es satisfactorio, para y ahórrate el tiempo de GPU restante
4. Si hay infraajuste, sigue entrenando desde el checkpoint

Con este enfoque a menudo encuentras buenos resultados antes de lo esperado, lo que reduce el coste total.

### Termina el alquiler enseguida

La facturación de la GPU suele continuar hasta que detienes la instancia de forma explícita. Cierra la sesión en cuanto hayas copiado tus archivos de salida. Una instancia olvidada toda la noche a 0,70 $ por hora añade doce dólares al coste del proyecto.

### Elige bien el momento

La disponibilidad y el precio de las GPU fluctúan según la demanda. Entrenar en horas de poca demanda (por ejemplo, las mañanas de los días laborables en los husos horarios de EE. UU.) suele darte mejores precios y más disponibilidad que las tardes del fin de semana.

---

## Problemas habituales y soluciones

### CUDA sin memoria

**Síntoma:** el entrenamiento falla con el error "CUDA out of memory".

**Soluciones:**

- Reduce batch_size en la configuración
- Activa gradient checkpointing añadiendo `gradient_checkpointing = true`
- Baja la resolución (aunque esto afecta a la calidad del resultado)
- Usa una GPU con más VRAM

### La pérdida no baja

**Síntoma:** los valores de pérdida se mantienen planos o fluctúan al azar durante todo el entrenamiento.

**Soluciones:**

- Aumenta la tasa de aprendizaje (prueba con 2e-4 o 3e-4)
- Comprueba que las descripciones describen correctamente las imágenes
- Verifica que las imágenes tienen el formato correcto y se pueden leer
- Asegúrate de que la ruta del modelo base es correcta

### El LoRA no tiene efecto en la generación

**Síntoma:** las imágenes generadas son idénticas con el LoRA activado o desactivado.

**Soluciones:**

- Comprueba que el archivo LoRA está en el directorio correcto para tu interfaz
- Comprueba que las palabras de activación coinciden con las que usaste en las descripciones de entrenamiento
- Aumenta el peso o la intensidad del LoRA
- Prueba con otro checkpoint del entrenamiento

### LoRA sobreajustado y poco flexible

**Síntoma:** el LoRA reproduce las imágenes de entrenamiento casi exactas, pero falla con prompts variados.

**Soluciones:**

- Entrena menos épocas
- Reduce el valor de network_dim
- Añade más variedad al dataset de entrenamiento
- Reduce la tasa de aprendizaje

### Entrenamiento lento

**Síntoma:** el entrenamiento avanza mucho más despacio de lo esperado.

**Soluciones:**

- Comprueba que realmente se está usando la GPU (nvidia-smi debería mostrar una utilización alta)
- Asegúrate de que xformers está instalado
- Comprueba que mixed_precision está activado
- Reduce network_dim si usas valores muy altos

---

## Preguntas frecuentes

### ¿Puedo entrenar modelos LoRA con mi propia GPU en lugar de alquilar una?

Sí, siempre que tengas una GPU NVIDIA con al menos 12 GB de VRAM, como una RTX 3060 o superior. Aun así, el coste de la electricidad, el desgaste del hardware y los tiempos de entrenamiento mucho más largos en hardware de consumo suelen hacer que alquilar sea más económico para proyectos puntuales. Un entrenamiento de dos horas a 0,70 $ por hora cuesta menos que la electricidad que consume la mayoría de los equipos domésticos funcionando a plena carga durante las cuatro a seis horas que necesitaría un hardware más lento.

### ¿Cuánto dura una sesión típica de entrenamiento de LoRA?

La mayoría de los entrenamientos de LoRA terminan en una a tres horas con una RTX 4090 o una RTX 3090. La duración exacta depende del tamaño del dataset, del número de épocas y del tamaño de lote que configures. Los modelos SDXL necesitan aproximadamente un 50-100 % más de tiempo que SD 1.5 para entrenamientos equivalentes.

### ¿Cuál es el número mínimo de imágenes necesario para entrenar un LoRA?

Puedes obtener resultados razonables con solo quince o veinte imágenes. Sin embargo, los datasets de treinta a cien imágenes bien descritas suelen dar mejor calidad. La calidad de las imágenes y la precisión de las descripciones importan más que la cantidad. Un conjunto bien seleccionado de treinta imágenes suele superar a una colección de cien reunida a toda prisa.

### ¿Qué proveedor de alquiler de GPU ofrece la mejor relación calidad-precio para entrenar LoRA?

Vast.ai suele tener las tarifas por hora más bajas para la RTX 4090, a menudo entre 0,35 $ y 0,50 $ por hora en febrero de 2026. RunPod ofrece la interfaz más sencilla para quien empieza a alquilar GPU. Para ver una comparación detallada de todos los proveedores y sus precios actuales, consulta nuestra [comparativa completa de precios de alquiler de GPU](/es/gpu-rental-pricing-comparison-2026/).

### ¿Sale más barato entrenar varios modelos LoRA en una sola sesión?

Sí. Entrenar varios LoRA en una sola sesión larga elimina la configuración repetida y reduce al mínimo el tiempo de GPU ociosa que pagas. Entrenar de tres a cinco modelos LoRA en una sesión de cuatro horas suele costar menos de la mitad que entrenarlos por separado en alquileres distintos.

### ¿Puedo usar los LoRA que entrene con fines comerciales?

Depende de la licencia del modelo base. Stable Diffusion 1.5 usa la licencia CreativeML Open RAIL-M, que permite el uso comercial con ciertas restricciones. SDXL tiene una licencia permisiva similar. Tu LoRA hereda las restricciones de su modelo base. Las imágenes de entrenamiento también pueden tener sus propios requisitos de licencia: asegúrate de tener los derechos necesarios sobre todas las imágenes que uses para entrenar.

---

## Conclusión

Entrenar modelos LoRA personalizados se ha vuelto sorprendentemente accesible. Las barreras computacionales que antes exigían una inversión considerable en hardware se reducen ahora a unos pocos dólares de alquiler de GPU. Las técnicas de esta guía, aplicadas a un dataset bien preparado, dan resultados utilizables al primer intento de forma sistemática.

Los factores clave del éxito son los mismos que en los enfoques de entrenamiento más caros: datos de entrenamiento de calidad, una elección adecuada de parámetros y una validación cuidadosa de los resultados. Ninguna cantidad de potencia de cálculo compensa unas imágenes de origen pobres o un entrenamiento mal configurado.

Empieza con un dataset modesto de veinte a treinta imágenes. Entrena con ajustes conservadores. Prueba a fondo los resultados antes de pasar a proyectos más grandes. Cada intento cuesta tan poco que iterar resulta práctico: trata tus primeros entrenamientos como aprendizaje y no como resultados de producción. Este mismo flujo de trabajo sirve para otros tipos de modelo. Si trabajas con texto en lugar de imágenes, consulta nuestra guía sobre [fine-tuning de modelos de lenguaje grandes](/es/private-llm-fine-tuning-guide/) en el mismo tipo de GPU alquilada.

Si estás comparando opciones de alquiler de GPU entre todo tipo de proveedores y rangos de precio, nuestra [comparativa de precios de alquiler de GPU](/es/gpu-rental-pricing-comparison-2026/) recoge las tarifas actuales de GPU de consumo, hardware de centro de datos y nubes empresariales.

---

_Esta guía se actualizó por última vez el 12 de febrero de 2026. Los precios de alquiler de GPU y la configuración de las herramientas de entrenamiento cambian con frecuencia. Comprueba los precios actuales directamente con los proveedores antes de comprometerte con un proyecto de entrenamiento._
