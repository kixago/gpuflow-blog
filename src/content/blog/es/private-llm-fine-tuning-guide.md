---
title: "Fine-tuning privado de un LLM en una GPU alquilada: guía práctica"
description: "Cuándo el fine-tuning supera a RAG o a un buen prompt, cuánta VRAM necesita QLoRA según el tamaño del modelo, TRL, Unsloth y Axolotl, cómo mantener los datos privados en una GPU alquilada, costes y despliegue."
excerpt: "El fine-tuning con QLoRA de un modelo abierto de 8B cabe en una sola GPU alquilada de 24 GB y cuesta entre 0,35 $ y 0,83 $ por sesión. Antes de pagarlo, comprueba que el fine-tuning es la herramienta adecuada y planifica cómo tus datos siguen siendo tuyos en la máquina de otra persona."
pubDate: 2025-02-23
updatedDate: 2026-09-30
locale: "es"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/private-llm-fine-tuning-guide-hero.png"
heroImageAlt: "Ilustración de un conjunto de datos privado que se usa para hacer fine-tuning de un modelo de lenguaje en un servidor de GPU alquilado"
faq:
  - question: "¿Cuánta VRAM necesito para hacer fine-tuning de un modelo de 7B u 8B?"
    answer: "Con QLoRA, la tabla de requisitos de Unsloth indica unos 5 GB para un modelo de 7B y 6 GB para uno de 8B; LoRA normal en 16 bits necesita unos 19 GB y 22 GB. En la práctica hace falta margen para secuencias más largas y lotes más grandes, así que una tarjeta de 24 GB, como una RTX 3090 o 4090, es la opción cómoda."
  - question: "¿Hago fine-tuning o uso RAG?"
    answer: "Usa RAG cuando el modelo necesita datos de tus documentos, sobre todo si esos datos cambian. Un estudio de 2024 de Ovadia et al. concluyó que RAG superaba de forma sistemática al fine-tuning no supervisado para añadir conocimiento. Haz fine-tuning cuando necesites un formato, un tono o un comportamiento en una tarea concreta que el prompt no consigue de forma fiable."
  - question: "¿Cuánto cuesta hacer fine-tuning de un LLM en una GPU alquilada?"
    answer: "Una sesión de QLoRA sobre un modelo de 8B con 2000 ejemplos dura algo más de una hora con la preparación incluida, lo que son unos 0,35 $ en una RTX 4090 de Vast.ai a 0,31 $/h o 0,83 $ al precio de lista de RunPod de 0,74 $/h (septiembre de 2026). Una sesión con 20.000 ejemplos dura unas cuatro horas, es decir, entre 1,24 $ y 2,97 $."
  - question: "¿Puede el anfitrión de la GPU ver mis datos de entrenamiento?"
    answer: "El anfitrión es dueño del hardware, así que da por hecho que podría. El aislamiento de contenedores te protege de otros inquilinos, no del dueño de la máquina. Para datos sensibles, usa anfitriones de centro de datos verificados (Vast.ai Secure Cloud, RunPod Secure Cloud), quita los datos personales antes de subir nada y borra la instancia al terminar."
  - question: "¿Qué diferencia hay entre LoRA y QLoRA?"
    answer: "LoRA congela el modelo base y entrena pequeñas matrices adaptadoras. QLoRA hace lo mismo, pero carga el modelo base congelado en precisión NF4 de 4 bits, lo que en el artículo original redujo la memoria lo suficiente para hacer fine-tuning de un modelo de 65B en una sola GPU de 48 GB."
  - question: "¿Puedo hacer fine-tuning o subir mi modelo en GPUFlow?"
    answer: "No. GPUFlow es solo inferencia: alquilas una API de chat compatible con OpenAI para modelos que los proveedores han instalado en sus propias máquinas, normalmente con Ollama. No hay shell ni acceso a archivos, así que no puedes entrenar ahí ni subir tu propio modelo."
---

Puedes hacer fine-tuning de un modelo de pesos abiertos de 8B con tus propios datos usando QLoRA en una sola GPU alquilada de 24 GB, y una sesión típica cuesta menos de un dólar. Las preguntas difíciles vienen antes: si el fine-tuning es de verdad la solución (para datos, la recuperación suele ganar) y cómo tus datos siguen siendo privados en una máquina que es de otra persona.

Esta guía cubre las dos cosas y después la VRAM que necesitas según el tamaño del modelo, las herramientas actuales, un script de entrenamiento que funciona, un cálculo de coste y cómo servir el resultado. Todo se comprobó en septiembre de 2026; las fuentes están al final.

## Fine-tuning, RAG o un prompt mejor

El fine-tuning cambia cómo se comporta un modelo. Para enseñarle datos es una mala herramienta. Ovadia et al. compararon ambos métodos para inyectar conocimiento y vieron que RAG «supera de forma sistemática» al fine-tuning no supervisado, «tanto para el conocimiento visto durante el entrenamiento como para conocimiento completamente nuevo». Su conclusión: a los LLM les cuesta aprender datos nuevos mediante fine-tuning.

Así que recorre este árbol antes de alquilar nada:

<figure>
<svg viewBox="0 0 720 420" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">Árbol de decisión para elegir entre recuperación, un prompt mejor, fine-tuning o un modelo más grande</title>
<defs><marker id="d1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker></defs>
<rect width="720" height="420" fill="#ffffff"/>
<rect x="60" y="15" width="280" height="40" rx="8" fill="#1e1b4b"/>
<text x="200" y="40" text-anchor="middle" fill="#ffffff">Las respuestas no son buenas</text>
<line x1="200" y1="55" x2="200" y2="83" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<rect x="20" y="85" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="115" text-anchor="middle" fill="#1e1b4b">¿Le faltan datos o los datos cambian?</text>
<rect x="440" y="80" width="260" height="60" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
<text x="570" y="105" text-anchor="middle" fill="#1e1b4b" font-weight="600">Usa RAG</text>
<text x="570" y="126" text-anchor="middle" fill="#64748b" font-size="13">busca en tus documentos cada vez</text>
<line x1="380" y1="110" x2="438" y2="110" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="102" text-anchor="middle" fill="#16a34a" font-size="13">Sí</text>
<line x1="200" y1="135" x2="200" y2="173" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="160" fill="#64748b" font-size="13">No</text>
<rect x="20" y="175" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="205" text-anchor="middle" fill="#1e1b4b">¿Se arregla con instrucciones y ejemplos?</text>
<rect x="440" y="170" width="260" height="60" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
<text x="570" y="195" text-anchor="middle" fill="#1e1b4b" font-weight="600">Mejora el prompt</text>
<text x="570" y="216" text-anchor="middle" fill="#64748b" font-size="12">prompt de sistema, ejemplos few-shot</text>
<line x1="380" y1="200" x2="438" y2="200" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="192" text-anchor="middle" fill="#16a34a" font-size="13">Sí</text>
<line x1="200" y1="225" x2="200" y2="263" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="250" fill="#64748b" font-size="13">No</text>
<rect x="20" y="265" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="295" text-anchor="middle" fill="#1e1b4b">¿Buscas un formato, tono o tarea fijos?</text>
<rect x="440" y="260" width="260" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="570" y="285" text-anchor="middle" fill="#1e1b4b" font-weight="600">Fine-tuning con QLoRA</text>
<text x="570" y="306" text-anchor="middle" fill="#64748b" font-size="13">cientos de ejemplos buenos</text>
<line x1="380" y1="290" x2="438" y2="290" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="282" text-anchor="middle" fill="#16a34a" font-size="13">Sí</text>
<line x1="200" y1="315" x2="200" y2="353" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="340" fill="#64748b" font-size="13">No</text>
<rect x="60" y="355" width="280" height="50" rx="10" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
<text x="200" y="385" text-anchor="middle" fill="#1e1b4b">Prueba un modelo base más grande</text>
<text x="570" y="370" text-anchor="middle" fill="#64748b" font-size="13">RAG y fine-tuning se combinan bien:</text>
<text x="570" y="390" text-anchor="middle" fill="#64748b" font-size="13">ajusta la conducta, recupera los datos</text>
</svg>
<figcaption>La mayoría de los problemas del tipo «el modelo no sabe nada de lo nuestro» son problemas de recuperación. El fine-tuning se paga solo cuando necesitas el mismo comportamiento cada vez: un esquema JSON, un estilo de la casa, un sistema de clasificación.</figcaption>
</figure>

Buenos motivos para hacer fine-tuning:

- **Formato de salida estricto.** Extraer campos a tu esquema en cada llamada, sin una página de instrucciones en cada prompt.
- **Estilo y tono.** Respuestas de soporte que suenen a tu equipo, o informes con una estructura fija.
- **Una tarea concreta hecha por un modelo pequeño.** Un modelo de 8B ajustado puede sustituir a un modelo grande y generalista en un trabajo concreto, y eso importa cuando lo sirves en hardware barato.
- **Prompts más cortos.** Lo que el modelo aprende en los pesos no hay que repetirlo en cada petición.

## LoRA y QLoRA

El fine-tuning completo actualiza todos los pesos, así que la GPU tiene que guardar gradientes y estado del optimizador para todos ellos, además del modelo. LoRA congela el modelo base y entrena pequeñas matrices de bajo rango junto a sus capas; el artículo original informaba de 10.000 veces menos parámetros entrenables y 3 veces menos memoria de GPU que el fine-tuning completo de GPT-3 175B con Adam.

QLoRA va más allá: el modelo base congelado se carga en precisión NF4 de 4 bits y solo los adaptadores se entrenan en 16 bits. Dettmers et al. lo usaron para hacer fine-tuning de un modelo de 65B en una sola GPU de 48 GB «conservando el rendimiento en la tarea del fine-tuning completo en 16 bits». El artículo añadió tres piezas que las herramientas siguen usando: el tipo de datos NF4, la doble cuantización de las constantes de cuantización y los optimizadores paginados que absorben los picos de memoria.

En los dos casos el resultado es un adaptador, una carpeta con unos pocos tensores, que aplicas sobre el modelo base sin modificar. Puedes mantenerlo aparte o fusionarlo con los pesos. Los modelos de imagen usan el mismo método: una [LoRA de Stable Diffusion](/es/stable-diffusion-lora-training-under-10-dollars/) se entrena en una sola tarjeta alquilada de 24 GB por bastante menos de 10 $.

## Cuánta VRAM necesitas

Unsloth publica una tabla con la VRAM mínima para fine-tuning según el tamaño del modelo. Estas son sus cifras, con sus optimizaciones de memoria; el entrenamiento normal con Hugging Face necesita más, y las secuencias más largas o los lotes más grandes suben todas las filas.

| Tamaño del modelo | QLoRA (4 bits) | LoRA (16 bits) | Tarjeta alquilada donde QLoRA cabe con holgura |
| --- | --- | --- | --- |
| 3B | 3,5 GB | 8 GB | Cualquier tarjeta de 12 GB o más |
| 8B | 6 GB | 22 GB | RTX 3090 / 4090 (24 GB) |
| 14B | 8,5 GB | 33 GB | RTX 3090 / 4090 (24 GB) |
| 32B | 26 GB | 76 GB | Tarjeta de 48 GB (RTX A6000, A40, L40S) |
| 70B | 41 GB | 164 GB | Tarjeta de 80 GB (A100, H100) |

<figure>
<svg viewBox="0 0 720 320" role="img" aria-labelledby="d2-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d2-title">Gráfico de barras con la VRAM mínima para fine-tuning de modelos de 8B, 14B, 32B y 70B con QLoRA y con LoRA en 16 bits, frente a tarjetas de 24, 48 y 80 GB</title>
<rect width="720" height="320" fill="#ffffff"/>
<rect x="200" y="12" width="14" height="14" fill="#6366f1"/>
<text x="220" y="24" fill="#1e1b4b" font-size="13">QLoRA 4 bits</text>
<rect x="320" y="12" width="14" height="14" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
<text x="340" y="24" fill="#1e1b4b" font-size="13">LoRA 16 bits</text>
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
<text x="420" y="306" text-anchor="middle" fill="#64748b" font-size="13">VRAM mínima en GB (tabla de requisitos de Unsloth)</text>
</svg>
<figcaption>QLoRA es lo que hace útiles aquí las tarjetas de consumo alquiladas: hasta 14B cabe de sobra en una tarjeta de 24 GB, 32B necesita una de 48 GB y 70B una de 80 GB. Sin la carga en 4 bits, incluso 8B apenas cabe en 24 GB.</figcaption>
</figure>

Mi opción por defecto es un modelo de 8B o 14B en una RTX 4090. Es la tarjeta alquilada más barata que deja sitio para secuencias de 2048 tokens y un lote razonable, y los modelos de ese tamaño son fáciles de servir después. Para elegir el modelo base según la VRAM en la que lo vas a servir, consulta [qué modelos de IA caben en la VRAM de tu GPU](/es/which-ai-models-fit-your-gpu-vram/).

## Elige herramienta: TRL, Unsloth o Axolotl

Las tres son de código abierto y todas hacen LoRA y QLoRA.

| Herramienta | Cómo se usa | Punto fuerte | Ojo con |
| --- | --- | --- | --- |
| Hugging Face TRL + PEFT | Python (`SFTTrainer`) | La implementación de referencia; DPO, GRPO y más con la misma API | Usa más memoria que Unsloth en la misma sesión |
| Unsloth | Python, o la interfaz web Unsloth Studio | Promete el doble de velocidad y un 70 % menos de VRAM; exporta directamente a GGUF | La interfaz Studio es AGPL-3.0 (el núcleo es Apache 2.0) |
| Axolotl | Un archivo YAML, `axolotl train config.yml` | Varias GPU (FSDP, DeepSpeed), muchas recetas | Necesita Python 3.11+ y PyTorch 2.11+ |

En septiembre de 2026, TRL va por la versión 1.14 y PEFT por la 0.21. Unsloth necesita Python de la 3.11 a la 3.13 y una GPU NVIDIA con capacidad CUDA 7.0 o superior (V100, T4, serie RTX 20 en adelante). Axolotl recomienda Python 3.12 y PyTorch 2.12.1.

Usa TRL si quieres entender cada línea, Unsloth si vas justo de VRAM o quieres exportar a GGUF con una sola llamada, y Axolotl si vas a repetir sesiones con ajustes distintos o pasar a varias GPU. El script de abajo usa TRL, porque es el camino más corto que deja ver todas las piezas.

## Prepara los datos

`SFTTrainer` de TRL lee conversaciones con la misma forma que una petición a una API de chat. Un objeto JSON por línea en `train.jsonl`:

```json
{"messages": [{"role": "system", "content": "Extract the invoice fields as JSON."}, {"role": "user", "content": "Invoice 4471 from Norden AB, due 12 March, total 1,250 EUR"}, {"role": "assistant", "content": "{\"invoice_id\": \"4471\", \"supplier\": \"Norden AB\", \"due\": \"2026-03-12\", \"total\": 1250, \"currency\": \"EUR\"}"}]}
```

Reglas prácticas:

- **Calidad antes que cantidad.** Unos cientos o unos miles de ejemplos coherentes y correctos valen más que decenas de miles con ruido. Cada error en los datos es un comportamiento que pagas por enseñar.
- **Igual que en producción.** Usa el prompt de sistema y el formato de entrada que tu aplicación va a enviar de verdad.
- **Aparta entre un 5 y un 10 %.** Guarda ejemplos con los que el modelo no entrena nunca, para comparar el modelo base y el ajustado lado a lado.
- **Quita lo que no necesites.** Los nombres, los correos, los números de cuenta y los identificadores rara vez ayudan al modelo a aprender un formato. Sustitúyelos por marcadores realistas antes de que los datos salgan de tu ordenador.

Esta última regla no va solo de la máquina alquilada. Carlini et al. extrajeron cientos de secuencias de entrenamiento literales de GPT-2, con nombres, teléfonos y direcciones de correo, algunas de las cuales aparecían en un solo documento de entrenamiento. Un modelo ajustado puede repetir lo que aprendió a cualquiera que lo use después.

## Mantén los datos privados en una máquina alquilada

En un mercado de GPU, el ordenador es de otra persona. Vast.ai lo dice sin rodeos: «Los clientes están aislados en contenedores Docker sin privilegios y solo tienen acceso a sus propios datos», y «la seguridad de los proveedores varía mucho». Ese aislamiento te protege de otros inquilinos. No te protege de quien tiene acceso físico y root en el anfitrión.

Para datos privados:

1. **Elige un anfitrión de centro de datos verificado.** Los proveedores de Secure Cloud de Vast.ai son «centros de datos verificados con certificación ISO 27001 y estándares de centro de datos Tier 3/4», y Vast los recomienda para trabajo sensible. La Secure Cloud de RunPod funciona en centros de datos T3/T4; su Community Cloud te conecta con proveedores particulares. Los niveles de centro de datos cuestan más por hora y aquí compensan.
2. **Sube solo el conjunto de datos limpio,** por SSH (`rsync -avP` o `scp`). No lo dejes por el camino en un bucket público ni en un enlace compartido.
3. **Deja los registros en local.** En TRL 1.14, `report_to` vale `"none"` por defecto, así que nada va a un servicio de seguimiento de experimentos salvo que lo actives. No llames a `push_to_hub` con un adaptador entrenado con datos privados.
4. **Saca los resultados y después borra la instancia.** Descarga el adaptador y los resultados de la evaluación, cierra la sesión de Hugging Face (`hf auth logout`) si usaste un token, y borra la instancia y cualquier volumen. En Vast.ai, el almacenamiento se factura y se conserva hasta que borras la instancia, no basta con pararla.

Borrar archivos dentro de un contenedor no garantiza que el disco del anfitrión quede limpio, así que la protección real son los pasos 1 y 2: elegir quién tiene el hardware y enviarle lo mínimo posible. Más detalles en [cómo proteger un conjunto de datos en un nodo de GPU público](/es/how-to-secure-dataset-on-public-gpu-node/). Si [tu política prohíbe cualquier hardware de terceros](/es/why-corporate-policies-banning-chatgpt/), el mismo script funciona en tu propia tarjeta de 24 GB.

## Entrena: un script de QLoRA con TRL

En una máquina Linux alquilada con una RTX 3090 o 4090:

```bash
python -m venv venv && source venv/bin/activate
pip install torch trl peft bitsandbytes datasets
```

Después, `train.py`, siguiendo el patrón de QLoRA de la documentación de PEFT de TRL. Qwen3-8B es Apache 2.0 y no tiene acceso restringido, así que no hace falta token de Hugging Face:

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

Las decisiones que importan:

- **`learning_rate=2e-4`.** La documentación de TRL recomienda para QLoRA unas 10 veces la tasa normal de fine-tuning. Si la pérdida de evaluación sube mientras la de entrenamiento baja, estás sobreajustando: usa menos épocas.
- **`r=16`, `target_modules="all-linear"`.** Adaptadores en todas las capas lineales, la configuración que usan las pruebas de rendimiento de Unsloth. El rango 16 basta para formato y estilo; súbelo para tareas más difíciles.
- **`max_length=2048`.** Los ejemplos más largos se cortan. Revisa la longitud en tokens de tus datos; un límite mayor necesita más VRAM.
- **Lote efectivo de 16** (4 × 4 pasos de acumulación). Si te quedas sin memoria, baja `per_device_train_batch_size` y sube la acumulación para mantener el producto.

Antes de apagar la máquina, pasa tus ejemplos apartados por el modelo base y por el ajustado y compáralos. Es la única prueba que te dice si el dinero ha servido para algo.

## Lo que cuesta

El tiempo de entrenamiento es el total de tokens ÷ el rendimiento. GigaGPU, una empresa de alojamiento, publicó una medición de unos 3500 tokens de entrenamiento por segundo para Llama 3.1 8B con QLoRA en una RTX 4090. Suponiendo un ritmo parecido para Qwen3-8B:

**Sesión pequeña:** 2000 ejemplos × 600 tokens × 3 épocas = 3,6 millones de tokens. 3.600.000 ÷ 3500 = 1029 s, unos 17 minutos.

| Paso | Tiempo |
| --- | --- |
| Preparar el entorno | 10 min |
| Descargar Qwen3-8B (16,4 GB de pesos) y subir los datos | 10 min |
| Entrenamiento | 17 min |
| Comparar el modelo base y el ajustado con los datos apartados | 15 min |
| Fusionar, exportar, descargar, borrar la instancia | 15 min |
| **Total** | **67 min (1,12 h)** |

- RTX 4090 en Vast.ai a 0,31 $/h: 1,12 × 0,31 $ = **0,35 $**
- RTX 4090 en RunPod a 0,74 $/h (precio de lista de su página de precios): 1,12 × 0,74 $ = **0,83 $**

**Sesión más grande:** 20.000 ejemplos × 1000 tokens × 2 épocas = 40 millones de tokens ÷ 3500 = 11.429 s, unas 3,2 horas. Con 50 minutos de los mismos pasos extra, 4,0 horas: **1,24 $** en Vast.ai o **2,97 $** en RunPod.

Para un modelo de 32B, RunPod anuncia en septiembre de 2026 tarjetas de 48 GB a 0,49 $/h (A40), 0,53 $/h (RTX A6000) y 1,09 $/h (L40S). No tengo un rendimiento publicado de QLoRA con 32B en esas tarjetas, así que ejecuta 50 pasos, lee el tiempo por paso en el registro y haz la misma multiplicación antes de lanzarte a una sesión larga.

Los precios son los de septiembre de 2026 de la página de precios de RunPod y del rastreador de getdeploying.com para Vast.ai. Los niveles Secure o de centro de datos cuestan más que las ofertas comunitarias más baratas. El panorama completo está en [la comparativa de precios de alquiler de GPU](/es/gpu-rental-pricing-comparison-2026/).

## Sirve el resultado

Tienes dos opciones: mantener el adaptador aparte o fusionarlo con el modelo.

**Aparte, con vLLM.** vLLM carga adaptadores LoRA junto al modelo base y expone cada uno como un nombre de modelo en su servidor compatible con OpenAI:

```bash
vllm serve Qwen/Qwen3-8B --enable-lora --lora-modules invoices=./out/adapter
```

Los clientes envían entonces `"model": "invoices"`. Varios adaptadores pueden compartir un mismo modelo base en una sola GPU.

**Fusionado, en Ollama.** Fusiona el adaptador con los pesos en precisión completa, conviértelo a GGUF con llama.cpp, cuantízalo e impórtalo:

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

Unsloth hace la fusión y la exportación a GGUF en una sola llamada (`model.save_pretrained_gguf("dir", tokenizer, quantization_method="q4_k_m")`). Su documentación avisa de que la causa más habitual de respuestas malas después de exportar es una plantilla de chat equivocada: sirve el modelo con la plantilla con la que lo entrenaste. Las ventajas e inconvenientes de Ollama, vLLM y TGI están en [nuestra prueba de rendimiento de inferencia en una RTX 4090](/es/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/).

### Dónde encaja GPUFlow

GPUFlow no puede hacer el entrenamiento: alquila una API compatible con OpenAI en la GPU de un proveedor, sin shell, sin SSH y sin acceso a archivos. Tampoco puede servir tu modelo ajustado. Los inquilinos no pueden subir modelos; los modelos disponibles son los que cada proveedor ha instalado (normalmente con Ollama), como `qwen2.5:7b` o `llama3.1:8b`.

Donde sí ayuda es en el paso previo a todo esto: comprobar, por unos céntimos, si un modelo abierto de serie con un buen prompt ya hace el trabajo, que es el resultado más barato del árbol de decisión. Hazlo con datos de prueba, no con los datos privados de los que trata esta guía: los prompts y las respuestas pasan sin cifrar por la máquina del proveedor mientras dura el alquiler. Cómo funciona está en la [guía rápida de la API](https://docs.gpuflow.app/es/renters/api-quickstart/), y [cómo usar la clave en tus aplicaciones](/es/use-openai-compatible-api-key-in-apps/) explica cómo conectarla a herramientas que ya usas.

## Fuentes

Todas revisadas en septiembre de 2026.

- Artículos: [Hu et al., LoRA](https://arxiv.org/abs/2106.09685); [Dettmers et al., QLoRA](https://arxiv.org/abs/2305.14314); [Ovadia et al., Fine-Tuning or Retrieval?](https://arxiv.org/abs/2312.05934); [Carlini et al., Extracting Training Data from Large Language Models](https://arxiv.org/abs/2012.07805)
- Hugging Face TRL: [SFT Trainer](https://huggingface.co/docs/trl/sft_trainer), [integración con PEFT y QLoRA](https://huggingface.co/docs/trl/peft_integration)
- Unsloth: [requisitos y tabla de VRAM](https://unsloth.ai/docs/get-started/fine-tuning-for-beginners/unsloth-requirements.md), [pruebas de rendimiento](https://unsloth.ai/docs/basics/unsloth-benchmarks.md), [guardar en GGUF](https://unsloth.ai/docs/basics/inference-and-deployment/saving-to-gguf.md), [GitHub](https://github.com/unslothai/unsloth)
- [Axolotl en GitHub](https://github.com/axolotl-ai-cloud/axolotl)
- Modelo: [ficha del modelo Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
- Rendimiento de entrenamiento: [GigaGPU, fine-tuning en la RTX 4090](https://gigagpu.com/rtx-4090-fine-tuning-guide/)
- Anfitriones y seguridad: [FAQ de seguridad de Vast.ai](https://docs.vast.ai/documentation/reference/faq/security), [precios de Vast.ai](https://docs.vast.ai/guides/instances/pricing.md), [resumen de los Pods de RunPod](https://docs.runpod.io/pods/overview)
- Precios: [precios de RunPod](https://www.runpod.io/pricing), getdeploying.com para [Vast.ai](https://getdeploying.com/vast-ai) y la [RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090)
- Despliegue: [adaptadores LoRA en vLLM](https://docs.vllm.ai/en/latest/features/lora.html), [cuantización con llama.cpp](https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md), [importar en Ollama](https://docs.ollama.com/import)
- GPUFlow: [guía rápida de la API](https://docs.gpuflow.app/es/renters/api-quickstart/)
