---
title: "Guía completa de fine-tuning privado de LLM en GPU alquiladas"
description: "Tutorial completo para hacer fine-tuning de modelos de lenguaje de pesos abiertos con tu propio dataset en una GPU alquilada. Protege tus datos, reduce el coste de cómputo y evita depender de un proveedor."
excerpt: "Aprende a hacer fine-tuning de LLM de pesos abiertos en GPU alquiladas sin perder el control de tus datos. Instrucciones paso a paso sobre transferencia segura de datos, entrenamiento con QLoRA y limpieza del entorno."
pubDate: 2025-02-23
updatedDate: 2026-09-29
locale: "es"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/secure-server-room-abstract.png"
heroImageAlt: "Representación abstracta de una sala de servidores segura procesando datos de IA con iluminación azul"
faq:
  - question: "¿Puedo hacer fine-tuning de modelos de lenguaje grandes en una sola RTX 4090?"
    answer: "Sí. Con QLoRA (Quantized Low-Rank Adaptation), los modelos de hasta 8B parámetros caben sin problema en 24 GB de VRAM. Este tutorial muestra exactamente cómo configurar el script de entrenamiento para hardware de consumo, con valores concretos de tamaño de lote, longitud de secuencia y rango de LoRA."
  - question: "¿Está seguro mi dataset en una GPU alquilada?"
    answer: "Tu dataset está tan seguro como lo sean tus prácticas operativas. Esta guía explica la transferencia cifrada por SCP, cómo evitar intermediarios de almacenamiento en la nube como S3 o Google Drive y cómo limpiar la máquina remota al terminar el entrenamiento. Recuerda que la máquina es de otra persona, así que bórralo todo antes de terminar el alquiler."
  - question: "¿Cuánto cuesta hacer fine-tuning de un modelo de 8B en una GPU alquilada?"
    answer: "Un fine-tuning típico de un modelo de 8B parámetros en una RTX 4090 alquilada cuesta entre tres y ocho dólares, según el tamaño del dataset y el número de épocas."
  - question: "¿Tengo que verificar mi identidad para alquilar GPU para entrenar?"
    answer: "Normalmente no. Marketplaces como Vast.ai y RunPod piden una dirección de correo y saldo prepago, no documentos de identidad. RunPod solo pide KYC antes del primer pago con criptomonedas. En AWS, las cuentas nuevas empiezan con una cuota de GPU de cero, que tienes que solicitar."
  - question: "¿Qué formato de dataset espera el script de entrenamiento?"
    answer: "El script espera un archivo JSONL en el que cada línea contiene un objeto JSON con un campo text. Ese campo debe contener la instrucción, la entrada y la respuesta en una sola cadena con saltos de línea. En el paso 4 de esta guía tienes un ejemplo con el formato correcto."
  - question: "¿Sirve este tutorial para modelos distintos de Llama?"
    answer: "Sí. El flujo de trabajo vale para cualquier modelo de pesos abiertos, como Mistral, Qwen, Falcon y otros. El código de ejemplo usa Llama-3.1-8B, pero solo tienes que cambiar el identificador del modelo para hacer fine-tuning de otro modelo base."
  - question: "¿Cuánto tarda el fine-tuning de un modelo de 8B parámetros?"
    answer: "Depende del tamaño del dataset. Un entrenamiento típico con 1.000 ejemplos termina en 30 a 60 minutos en una RTX 4090. Con datasets más grandes el tiempo crece de forma aproximadamente lineal: 10.000 ejemplos requieren de 5 a 10 horas de cómputo."
  - question: "¿Qué debo hacer con la máquina remota al terminar el entrenamiento?"
    answer: "Tienes que limpiar el entorno: borrar el dataset, el código de entrenamiento, la caché de Hugging Face y el historial de bash. Esta guía incluye los comandos concretos para un borrado seguro, con la opción de usar shred para destruir los archivos a fondo antes de terminar el alquiler."
---

Si estás leyendo esto, probablemente tienes un dataset que no puedes (o no quieres) subir a OpenAI.

No eres el único. Para muchas empresas y desarrolladores independientes, la comodidad de ChatGPT no compensa un riesgo inaceptable de fuga de datos. Tanto si manejas historiales médicos sujetos a HIPAA como código propietario que representa años de inversión en ingeniería o modelos financieros sensibles capaces de mover mercados, usar IA en la nube suele significar confiar a un tercero tu propiedad intelectual más valiosa.

Cuando ese tercero es un gigante tecnológico con antecedentes de usar datos de clientes para entrenar modelos futuros, "confianza" se convierte en una palabra incómoda.

La solución no es renunciar a la IA. La solución es ser dueño de la infraestructura.

Hacer fine-tuning de modelos de pesos abiertos en hardware que controlas ya no es un pasatiempo académico de nicho. Es un requisito de negocio para las organizaciones que se toman en serio la privacidad. Modelos como Llama, Mistral, Qwen y decenas más están disponibles para uso comercial, sin tarifas de API y sin obligación de compartir datos. El problema siempre ha sido el acceso al cómputo. Comprar clústeres de NVIDIA H100 exige millones en inversión. Alquilar en AWS exige verificación de identidad, acuerdos empresariales y tarifas por hora que hacen prohibitivos los entrenamientos largos.

Esta guía propone un tercer camino. Aprenderás a hacer fine-tuning de un modelo de lenguaje de pesos abiertos en una GPU alquilada en un marketplace, a menudo hardware de particulares repartidos por todo el mundo. Veremos la configuración del entorno, los protocolos de seguridad para trabajar en nodos públicos y la ejecución completa del entrenamiento.

Los ejemplos de código usan Llama-3.1-8B como referencia práctica, pero el flujo de trabajo es idéntico para cualquier modelo compatible con Hugging Face. Cambia el identificador del modelo y podrás hacer fine-tuning de Mistral-7B, Qwen2-7B o cualquier modelo de pesos abiertos que encaje con tu caso de uso.

Y lo harás sin contratos a largo plazo y por una fracción de lo que cobran los proveedores cloud tradicionales.

![Ventana de terminal con una conexión SSH activa a un servidor GPU remoto](../_images/terminal-ssh-connection.png)

## La economía del fine-tuning privado

Antes de entrar en la parte técnica, veamos el contexto económico.

Entrenar un modelo en AWS implica instancias grandes y solicitudes de cuota. La instancia p4d.24xlarge (8 GPU A100) cuesta 32,77 $ por hora, y las cuentas nuevas de AWS empiezan con una cuota de GPU de cero.

En un marketplace de GPU alquilas potencia de cálculo directamente a los dueños del hardware. Las consecuencias son importantes:

**Reducción de costes:** una RTX 4090 se alquila por entre 0,30 $ y 0,46 $ por hora en los marketplaces (septiembre de 2026). Para modelos de 8B parámetros con QLoRA, una sola 4090 con 24 GB de VRAM completa un fine-tuning en dos a seis horas, según el tamaño del dataset. El coste total de cómputo va de tres a ocho dólares.

**Tus datos se quedan en una sola máquina:** copias el dataset directamente a la máquina alquilada por SSH, entrenas, descargas el resultado y lo borras todo. Sin bucket de almacenamiento y sin una tercera copia.

**Sin intermediarios:** no necesitas la aprobación del equipo comercial de un proveedor cloud ni un aumento de cuota. Añades saldo prepago y alquilas el hardware.

Para comparar: una sola A10G en AWS (g5.xlarge, la opción más barata con 24 GB de VRAM) cuesta unos 1,01 $ por hora en us-east-1. Si sumas la solicitud de cuota, el tiempo de configuración y el cómputo ocioso mientras preparas el entorno, el coste real de una primera ejecución es muy superior a los pocos dólares que cuesta en un marketplace.

Tienes estas cifras en detalle en nuestra [comparativa de precios de alquiler de GPU](/es/gpu-rental-pricing-comparison-2026/) y en [el coste real de alquilar una GPU](/es/hidden-fees-in-gpu-rental/).

## Requisitos previos

Este tutorial da por hecho que te manejas con la línea de comandos de Linux. No necesitas un doctorado en machine learning, pero sí sentirte cómodo moviéndote por el sistema de archivos, editando archivos de texto e interpretando mensajes de error.

**Requisitos de hardware:**

- **GPU:** mínimo 24 GB de VRAM. La RTX 3090, la RTX 4090 y la A10G cumplen. Para el modelo de 70B parámetros necesitas 48 GB o más (A6000, dos A100 o H100).
- **RAM del sistema:** 32 GB o más. Al cargar el modelo, los pesos pasan por la memoria del sistema antes de transferirse a la GPU.
- **Almacenamiento:** 100 GB o más de SSD NVMe. Los pesos base de Llama-3 8B ocupan unos 16 GB. El dataset, los checkpoints y el adaptador resultante suman espacio adicional.

**Una nota sobre la elección del modelo:** este tutorial usa Llama-3.1-8B de Meta como
ejemplo práctico porque es la clase de modelo más grande que cabe en una sola GPU de 24 GB
con cuantización QLoRA. La familia Llama incluye ya Llama 4 Scout y Maverick, pero usan
una arquitectura Mixture of Experts con 109B y 400B parámetros totales respectivamente,
lo que exige configuraciones multi-GPU que quedan fuera del alcance de un alquiler de un
solo nodo. El flujo de trabajo que se describe aquí vale igual para Mistral-7B, Qwen2-7B,
Gemma-2-9B y cualquier otro modelo compatible con Hugging Face que quepa en la VRAM del
hardware que alquiles.

**Requisitos de software:**

- Python 3.10 o posterior
- Nociones básicas de PyTorch
- Una cuenta de Hugging Face (necesaria para descargar modelos restringidos como Llama, que exigen aceptar una licencia)
- Una cuenta con saldo prepago en un marketplace de GPU que alquile máquinas completas con acceso SSH, como Vast.ai, RunPod o TensorDock

¿No sabes cuál elegir? Consulta [qué necesitas para alquilar una GPU](/es/what-you-need-to-rent-a-gpu/) y [GPUFlow vs Vast.ai vs RunPod vs SaladCloud](/es/gpuflow-vs-vast-ai-vs-runpod/). Ten en cuenta que GPUFlow no sirve para este tutorial: alquila acceso a modelos de IA a través de una API, no una máquina en la que puedas iniciar sesión.

## Paso 1: Asegura tu nodo de cómputo

El primer paso es conseguir el hardware. En las grandes plataformas cloud, eso implica crear una cuenta, solicitar una cuota de GPU y esperar la aprobación. En un marketplace, el proceso es mucho más directo.

Abre el marketplace que prefieras y añade algo de saldo. La interfaz muestra las máquinas disponibles con sus especificaciones, su precio por hora y su puntuación de fiabilidad.

Filtra por máquinas con estas características:

- **GPU:** RTX 4090 (24 GB de VRAM) o RTX 6000 Ada (48 GB de VRAM)
- **RAM:** 32 GB como mínimo
- **Almacenamiento:** más de 100 GB disponibles
- **Fiabilidad:** puntuación de disponibilidad del 95 % o superior

Elige una máquina e inicia el alquiler. Escoge una imagen que ya traiga CUDA y PyTorch instalados: te ahorra tiempo de configuración, y ese tiempo se factura.

**Consideraciones de seguridad para nodos públicos:**

Cuando alquilas una máquina en cualquier red remota, estás accediendo a hardware que pertenece a un desconocido y que él controla físicamente. La capa de virtualización ofrece un aislamiento real, pero tienes que trabajar con la debida precaución:

1. **No guardes claves privadas en la máquina remota.** Las claves SSH de otros sistemas, las credenciales de la nube y los tokens de API de servicios de producción nunca deben estar en un nodo alquilado.

2. **Trata el sistema de archivos como hostil.** Da por hecho que el anfitrión podría, en teoría, recuperar cualquier cosa que escribas en disco después de que te desconectes. Veremos los procedimientos de borrado seguro en el paso 6.

3. **Cifra los datos sensibles durante la transferencia.** Lo vemos en el paso 3.

4. **No reutilices contraseñas.** Si la interfaz del alquiler te da credenciales por defecto, cámbialas de inmediato o genera un nuevo par de claves SSH.

Cuando se confirme el alquiler, el panel te mostrará los datos de conexión. Recibirás un comando SSH parecido a este:

```bash
ssh -p 22345 user@203.0.113.42
```

Abre tu terminal local y ejecuta el comando. Acepta la huella de la clave del host cuando te lo pida. Ya estás conectado a tu nodo GPU alquilado.

Comprueba que el hardware coincide con lo que has pedido:

```bash
nvidia-smi
```

La salida debe mostrar la GPU alquilada, su capacidad de memoria y la versión del driver instalada. Si la GPU no aparece o las especificaciones no coinciden con tu pedido, desconéctate de inmediato y comunica la discrepancia al soporte del marketplace.

## Paso 2: Configuración del entorno

Con la conexión SSH verificada, lo siguiente es montar un entorno de Python limpio. La mayoría de los nodos de alquiler vienen con los drivers de NVIDIA y el toolkit de CUDA preinstalados, pero depender de los paquetes de Python del sistema del anfitrión es buscarse conflictos de dependencias que te costarán horas de depuración.

Crearemos un entorno virtual aislado para garantizar reproducibilidad y estabilidad.

Ejecuta los siguientes comandos para crear tu espacio de trabajo:

```bash
mkdir ~/llama3-finetune
cd ~/llama3-finetune
python3 -m venv venv
source venv/bin/activate
```

El prompt de tu terminal debería mostrar ahora `(venv)`, lo que indica que el entorno virtual está activo. Todos los paquetes que instales a partir de ahora quedarán dentro de este directorio y el sistema del anfitrión no se tocará.

Antes de instalar paquetes de Python, comprueba que el toolkit de CUDA está accesible:

```bash
nvcc --version
```

Apunta el número de versión de CUDA. Lo necesitarás para asegurar la compatibilidad con PyTorch. La mayoría de los nodos de alquiler usan CUDA 11.8 o 12.1. Si no se encuentra `nvcc`, puede que el toolkit de CUDA no esté en tu PATH. Normalmente se soluciona cargando el archivo de entorno correspondiente:

```bash
source /etc/profile.d/cuda.sh
```

Si ese archivo no existe, consulta la documentación del marketplace para la configuración concreta de tu nodo.

Ahora instala el ecosistema de PyTorch. El siguiente comando instala PyTorch con soporte para CUDA 12.1. Ajusta el sufijo de la versión de CUDA si tu nodo usa otra:

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

A continuación, instala las librerías necesarias para un fine-tuning eficiente. Usamos el ecosistema de Hugging Face junto con bitsandbytes para la cuantización y PEFT para el entrenamiento eficiente en parámetros:

```bash
pip install transformers==4.40.0 datasets==2.19.0 peft==0.10.0 bitsandbytes==0.43.1 trl==0.8.6 accelerate==0.29.0
```

**Fijar las versiones importa.** Las versiones de arriba están probadas y son compatibles entre sí a fecha de redacción. El ecosistema de Hugging Face evoluciona muy deprisa y las instalaciones sin versión fija suelen introducir cambios que rompen el código. Si te encuentras errores de importación o comportamientos inesperados, lo más probable es que la causa sea una incompatibilidad de versiones.

Por último, autentícate en Hugging Face. Los pesos de Llama-3 están restringidos por un acuerdo de licencia que exige una cuenta de Hugging Face. Ve al [repositorio de Meta Llama-3](https://huggingface.co) y acepta los términos de la licencia. Después genera un token de acceso desde la página de ajustes de Hugging Face.

Ejecuta el comando de autenticación:

```bash
huggingface-cli login
```

Pega tu token de acceso cuando te lo pida. El token se guarda en `~/.cache/huggingface/token`. Ya tienes autorización para descargar los pesos del modelo restringido directamente en el nodo alquilado.

![Código Python en una terminal con los parámetros de configuración del modelo Llama-3](../_images/python-llama3-config.png)

## Paso 3: Transferencia segura de datos

Esta sección trata el motivo principal por el que alquilas una máquina en lugar de llamar a una API: la soberanía de tus datos.

El flujo de trabajo habitual en la nube consiste en subir el dataset a un bucket de almacenamiento (S3, Google Cloud Storage, Azure Blob) y luego descargarlo en la instancia de cómputo. Así se crean varias copias de tus datos sensibles en sistemas que no controlas. El proveedor de almacenamiento tiene acceso. El proveedor de cómputo tiene acceso. Ambos guardan registros de tu actividad.

Nosotros nos saltaremos todo eso con una transferencia cifrada directa.

El protocolo SSH incluye `scp` (Secure Copy Protocol), que transfiere archivos por el mismo canal cifrado que usas para acceder a la terminal. Tus datos van directamente de tu máquina local al nodo alquilado sin pasar por ningún almacenamiento intermedio.

Abre una **nueva ventana de terminal** en tu **ordenador local**. No cierres la sesión SSH que tienes abierta con el nodo alquilado. Ejecuta el siguiente comando, sustituyendo la ruta de tu archivo y tus datos de conexión:

```bash
scp -P 22345 /path/to/your/dataset.jsonl user@203.0.113.42:~/llama3-finetune/
```

La opción `-P` indica el número de puerto (fíjate en la P mayúscula, a diferencia de la `-p` minúscula de ssh). Con datasets grandes, la transferencia puede tardar varios minutos. Verás el progreso con los bytes transferidos.

**Para datasets de más de 1 GB**, plantéate comprimirlos antes de transferirlos:

```bash
# On your local machine
gzip -k dataset.jsonl
scp -P 22345 dataset.jsonl.gz user@203.0.113.42:~/llama3-finetune/

# Then on the remote node
cd ~/llama3-finetune
gunzip dataset.jsonl.gz
```

**Medidas de seguridad adicionales:**

Si tu modelo de amenazas incluye adversarios sofisticados, quizá quieras cifrar el dataset antes de transferirlo con GPG o age. Así tienes defensa en profundidad: aunque alguien interceptara la transferencia, el contenido seguiría siendo ilegible.

```bash
# On your local machine (using age encryption)
age -p dataset.jsonl > dataset.jsonl.age
scp -P 22345 dataset.jsonl.age user@203.0.113.42:~/llama3-finetune/

# On the remote node
age -d dataset.jsonl.age > dataset.jsonl
rm dataset.jsonl.age
```

Para la mayoría de los usuarios, la transferencia SCP estándar ofrece protección suficiente. El protocolo SSH usa cifrado AES-256. La verificación de la clave del host impide los ataques de intermediario (man-in-the-middle). Tus datos no pasan por ningún sistema de almacenamiento de terceros.

## Paso 4: El script de fine-tuning

Usaremos la clase `SFTTrainer` de la librería TRL (Transformer Reinforcement Learning) para hacer el fine-tuning supervisado. Esta librería oculta buena parte de la complejidad y sigue siendo lo bastante configurable para cargas de trabajo de producción.

Antes de escribir el script de entrenamiento, tienes que entender qué formato de dataset espera.

**Requisitos de formato del dataset:**

El script espera un archivo JSONL (JSON Lines) en el que cada línea contiene un objeto JSON válido con un campo `text`. El campo `text` debe contener el ejemplo de entrenamiento completo en una sola cadena.

Aquí tienes un ejemplo de tres líneas con el formato correcto:

```json
{"text": "### Instruction: Summarize the following legal clause in plain English.\n\n### Input: Party A shall indemnify, defend, and hold harmless Party B from any claims, damages, or expenses arising from Party A's negligence or willful misconduct.\n\n### Response: Party A agrees to protect Party B from any legal claims or costs that result from Party A's mistakes or intentional wrongdoing."}
{"text": "### Instruction: Extract the key financial metrics from this earnings report.\n\n### Input: Q3 revenue reached $4.2B, up 12% YoY. Operating margin improved to 23.5% from 21.2%. Free cash flow was $890M.\n\n### Response: Revenue: $4.2 billion (12% year-over-year growth). Operating margin: 23.5% (up from 21.2%). Free cash flow: $890 million."}
{"text": "### Instruction: Identify potential HIPAA violations in this process description.\n\n### Input: Patient records are emailed to the billing department as PDF attachments. The billing staff prints these for manual review and shreds them after processing.\n\n### Response: Potential violations include: unencrypted email transmission of PHI, physical documents that may be visible to unauthorized personnel during processing, and lack of documented chain of custody. Recommend encrypted file transfer and on-screen review only."}
```

**Notas importantes sobre el formato:**

1. Cada objeto JSON debe ocupar exactamente una línea. Nada de JSON en varias líneas.
2. Los saltos de línea dentro del campo `text` deben escaparse como `\n`.
3. Las comillas dentro del texto deben escaparse como `\"`.
4. El archivo debe estar codificado en UTF-8.

Si tus datos de origen están en otro formato (CSV, Parquet, columnas separadas de instrucción y respuesta), tendrás que preprocesarlos a esta estructura antes de la transferencia. La librería `json` de Python se encarga del escapado automáticamente:

```python
import json

with open('dataset.jsonl', 'w') as f:
    for example in your_data:
        text = f"### Instruction: {example['instruction']}\n\n### Input: {example['input']}\n\n### Response: {example['output']}"
        f.write(json.dumps({"text": text}) + '\n')
```

Con el dataset ya en su sitio, crea el script de entrenamiento en el nodo remoto:

```bash
cd ~/llama3-finetune
nano train.py
```

Pega la siguiente configuración. Este script usa QLoRA para hacer fine-tuning de un modelo de 8B parámetros dentro de los límites de memoria de una GPU de 24 GB. El ejemplo usa Llama-3.1-8B, pero puedes cambiarlo por cualquier modelo compatible modificando la variable MODEL_NAME:

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

Guarda el archivo con `Ctrl+O` y sal con `Ctrl+X`.

**Qué hacen los parámetros clave:**

- **LORA_RANK (r=16):** controla la capacidad expresiva del adaptador. Los valores altos aprenden más, pero necesitan más memoria. Lo habitual son valores entre 8 y 64.

- **LORA_ALPHA (16):** factor de escala de los pesos de LoRA. Una regla práctica común es igualarlo al rango.

- **MAX_SEQ_LENGTH (512):** longitud máxima en tokens de los ejemplos de entrenamiento. Las secuencias más largas requieren más memoria. Si te aparecen errores OOM, reduce primero este valor.

- **BATCH_SIZE (4):** número de ejemplos que se procesan a la vez. Bájalo a 2 o a 1 si no tienes memoria suficiente.

- **target_modules:** las capas concretas en las que se insertan los adaptadores LoRA. En Llama-3, las capas de proyección de atención (q, k, v, o) dan los mejores resultados.

Para empezar el entrenamiento, ejecuta:

```bash
python train.py
```

Primero el script descargará los pesos del modelo base (unos 16 GB para un modelo de 8B). Esto solo ocurre una vez; las ejecuciones posteriores usan los pesos en caché. Cuando termine la carga, verás el progreso del entrenamiento con los valores de pérdida cada 10 pasos.

## Paso 5: Supervisa el entrenamiento

Mientras se ejecuta el script, tienes que vigilar el estado de la GPU. Si la VRAM se satura o la temperatura supera los umbrales seguros, el proceso fallará, y eso puede corromper tu checkpoint y hacerte perder tiempo de alquiler.

Abre una segunda ventana de terminal en tu máquina local y establece otra conexión SSH con el nodo alquilado:

```bash
ssh -p 22345 user@203.0.113.42
```

Ejecuta el siguiente comando para ver las estadísticas de la GPU en tiempo real:

```bash
watch -n 1 nvidia-smi
```

![Terminal con la salida de nvidia-smi mostrando el uso de memoria y la temperatura de la GPU](../_images/nvidia-smi-monitoring.png)

La herramienta se actualiza cada segundo y muestra el uso de memoria, el porcentaje de utilización de la GPU y la temperatura. En una RTX 4090 con la configuración de esta guía, deberías ver:

- **Uso de memoria:** entre 18 GB y 22 GB de los 24 GB disponibles
- **Utilización de la GPU:** del 90 % al 100 % durante los pasos de entrenamiento
- **Temperatura:** de 60 °C a 80 °C, según la refrigeración del anfitrión

**Solución de problemas habituales:**

**Memoria cerca de 24 GB:** si ves que el uso de memoria toca el techo de forma constante, baja el parámetro `BATCH_SIZE` del script a 2 o a 1. También puedes reducir `MAX_SEQ_LENGTH` a 256. Cualquiera de los dos cambios exige reiniciar el entrenamiento.

**Utilización de la GPU cerca del 0 %:** suele indicar un cuello de botella en la carga de datos. La CPU no es capaz de alimentar la GPU con ejemplos lo bastante rápido. Es menos habitual en nodos con NVMe, pero puede pasar con datasets muy grandes. Plantéate preprocesar el dataset a un formato más eficiente (Arrow/Parquet) antes de transferirlo.

**Temperatura por encima de 85 °C:** algunos anfitriones tienen las GPU en cajas mal ventiladas. Las temperaturas altas sostenidas pueden provocar thermal throttling y ralentizar el entrenamiento. Si la temperatura supera los 85 °C de forma constante, plantéate terminar el alquiler y elegir otro nodo. Los daños en el hardware son problema del anfitrión, pero el tiempo perdido y los checkpoints corruptos son problema tuyo.

**Cómo interpretar la curva de pérdida:**

El script muestra un valor de pérdida cada 10 pasos. Ese número indica cuánto se "equivoca" el modelo en sus predicciones: cuanto más bajo, mejor. Deberías observar:

- **Pérdida inicial:** normalmente entre 1,5 y 3,0, según el dataset
- **Tendencia:** un descenso constante durante los primeros cientos de pasos
- **Pérdida final:** normalmente entre 0,5 y 1,5 en un entrenamiento bien configurado

Si la pérdida se estanca desde el principio (sin bajar tras 100 pasos), puede que la tasa de aprendizaje sea demasiado baja. Si oscila mucho o sube, la tasa de aprendizaje es demasiado alta. El valor por defecto de `2e-4` funciona bien con la mayoría de los datasets, pero quizá tengas que ajustarlo.

Si la pérdida baja de forma suave y de repente se dispara a valores muy altos (10 o más), probablemente tu dataset contiene ejemplos mal formados. Detén el entrenamiento, revisa el archivo JSONL en busca de errores de codificación o caracteres mal escapados, y vuelve a empezar.

Un fine-tuning típico con 1.000 ejemplos termina en 30 a 60 minutos en una RTX 4090. Con datasets más grandes el tiempo crece de forma aproximadamente lineal: 10.000 ejemplos requieren de 5 a 10 horas.

## Paso 6: Recupera tu modelo y limpia el entorno

Cuando termina el entrenamiento, los pesos ajustados quedan como un adaptador LoRA en el directorio indicado en `OUTPUT_NAME`. Este adaptador es compacto (normalmente entre 100 MB y 500 MB), frente a los 16 GB del modelo base completo.

Primero, comprueba que existen los archivos del adaptador:

```bash
ls -la ~/llama3-finetune/llama-3-8b-custom/
```

Deberías ver archivos como `adapter_config.json`, `adapter_model.safetensors` y los archivos del tokenizador.

**No fusiones el adaptador en el nodo alquilado.** La fusión combina los pesos de LoRA con el modelo base para crear un modelo ajustado independiente. Esta operación exige cargar en memoria el modelo base completo en 16 bits, lo que puede superar la VRAM disponible en una tarjeta de 24 GB. Haz la fusión en tu propia infraestructura o, simplemente, carga el adaptador junto al modelo base durante la inferencia. La librería PEFT lo gestiona sin complicaciones:

```python
from peft import PeftModel
from transformers import AutoModelForCausalLM

base_model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B",
    device_map="auto",
)
model = PeftModel.from_pretrained(base_model, "./llama-3-8b-custom")
```

Para descargar el adaptador, vuelve a tu **terminal local** (no a la sesión SSH) y ejecuta:

```bash
scp -r -P 22345 user@203.0.113.42:~/llama3-finetune/llama-3-8b-custom ./
```

La opción `-r` copia de forma recursiva todo el directorio. Comprueba que la transferencia se ha completado bien verificando que el tamaño de los archivos locales coincide con el de los remotos.

**Limpieza del entorno remoto:**

Este paso separa a los profesionales de los aficionados. Tu nodo alquilado contiene ahora tu dataset propietario, tu código de entrenamiento y los pesos del modelo en caché. Dejar ese material en una máquina que no controlas va contra las normas más básicas de seguridad operativa.

Vuelve a tu sesión SSH en el nodo alquilado y ejecuta los siguientes comandos:

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

Si el nodo tiene `shred` y quieres una garantía adicional de que los archivos borrados no se puedan recuperar:

```bash
# Secure deletion (slower but more thorough)
find ~/llama3-finetune -type f -exec shred -u {} \;
rm -rf ~/llama3-finetune
```

Cierra la sesión SSH:

```bash
exit
```

Vuelve al panel del marketplace y termina el alquiler, incluido cualquier volumen de almacenamiento, para dejar de pagar por él.

## Inferencia con tu modelo ajustado

Con el adaptador descargado en tu máquina local, puedes hacer inferencia sin depender de ninguna nube. Aquí tienes un ejemplo mínimo:

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

Para un despliegue en producción, plantéate envolverlo en una API con FastAPI o Flask, o desplegarlo con servidores de inferencia como vLLM o Text Generation Inference (TGI). Los comparamos en [Ollama vs vLLM vs TGI en una RTX 4090](/es/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/).

## Conclusión

Has hecho fine-tuning de un gran modelo de lenguaje con datos propietarios manteniendo esos datos en una sola máquina durante el menor tiempo posible. Y lo has conseguido sin firmar contratos empresariales y sin dar acceso a tu propiedad intelectual a una gran tecnológica.

El coste total de la operación, suponiendo un entrenamiento de dos horas en una RTX 4090 a 0,45 $ por hora, ha sido de noventa céntimos. Una sola A10G en AWS cuesta unos 1,01 $ por hora, así que allí la ejecución en sí tampoco es cara. La diferencia está en la solicitud de cuota y en la configuración.

Y, lo que es más importante, tu dataset nunca ha pasado por un servicio de almacenamiento y se ha borrado de la máquina alquilada al terminar.

La era de la dependencia de las API de código cerrado se acaba. Las organizaciones que necesitan privacidad, los investigadores que valoran la soberanía y los desarrolladores que quieren control tienen una alternativa. Las GPU alquiladas les devuelven el control de la infraestructura, los costes y los datos.

Tu modelo ajustado está ahora en hardware que controlas. Las decisiones sobre cómo desplegarlo, quién puede acceder a él y para qué se usa son solo tuyas.

---

## Qué leer a continuación

Esta guía ha cubierto el flujo de trabajo básico del fine-tuning privado de LLM. Estos recursos tratan temas relacionados con más profundidad:

**Entender los costes:**

- [Comparativa de precios de alquiler de GPU 2026](/es/gpu-rental-pricing-comparison-2026/): análisis de costes entre marketplaces y grandes nubes
- [El coste real de alquilar una GPU](/es/hidden-fees-in-gpu-rental/): factores de coste que las páginas de precios no anuncian

**Primeros pasos:**

- [Qué necesitas para alquilar una GPU en 2026](/es/what-you-need-to-rent-a-gpu/): registro, verificación y pago en cada plataforma
- [Cómo proteger tu dataset en un nodo GPU público](/es/how-to-secure-dataset-on-public-gpu-node/): prácticas de seguridad antes, durante y después del entrenamiento

**Comparar opciones:**

- [Comparativa RunPod vs Vast.ai](/es/runpod-vs-vastapi-comparison/): en qué se diferencian los dos marketplaces más grandes
- [GPUFlow vs Vast.ai vs RunPod vs SaladCloud](/es/gpuflow-vs-vast-ai-vs-runpod/): máquinas, contenedores y claves de API comparados
