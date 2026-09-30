---
title: "Ollama vs vLLM vs TGI en una RTX 4090: lo que dicen los benchmarks"
description: "Ollama, vLLM y Hugging Face TGI con un modelo de 8B en una RTX 4090: rendimiento con carga según fuentes publicadas, VRAM, cuantización, APIs de OpenAI y el estado de mantenimiento de TGI."
excerpt: "Con una petición cada vez, los motores van más o menos igual de rápido en una RTX 4090. Con muchos usuarios a la vez, vLLM se distancia claramente. TGI está ahora en modo mantenimiento. Cifras publicadas, fuentes y qué elegir."
pubDate: 2026-02-25
updatedDate: 2026-09-30
locale: "es"
category: "benchmarks"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/rtx4090-inference-benchmark-hero.png"
heroImageAlt: "Benchmark de inferencia en una GPU RTX 4090 mostrado en un terminal con métricas de rendimiento"
faq:
  - question: "¿Es vLLM más rápido que Ollama en una RTX 4090?"
    answer: "Solo cuando hay muchas peticiones a la vez. En una prueba de ComputingForGeeks de septiembre de 2026 con Qwen2.5-7B a 4 bits, los dos generaban unos 174 tokens por segundo con una sola petición en una RTX 4090. Con 64 peticiones a la vez, vLLM llegó a 6.623 tokens por segundo en total y Ollama a 2.018."
  - question: "¿Sigue manteniéndose Hugging Face TGI?"
    answer: "Solo a mínimos. La documentación de TGI dice que está en modo mantenimiento y que solo acepta pequeñas correcciones de errores y cambios en la documentación, y el repositorio de GitHub se archivó en modo de solo lectura el 21 de marzo de 2026. Hugging Face recomienda en su lugar vLLM o SGLang, o llama.cpp y MLX para uso local."
  - question: "¿Cuánta VRAM usa vLLM con un modelo de 8B?"
    answer: "Por defecto vLLM reserva el 90 % de la memoria de la GPU (gpu-memory-utilization 0.9), unos 21,6 GB en una RTX 4090 de 24 GB, sea cual sea el tamaño del modelo. Lo que no usan los pesos se convierte en caché KV para las peticiones simultáneas."
  - question: "¿Puede Ollama atender a varios usuarios a la vez?"
    answer: "Sí, pero por defecto atiende una petición cada vez por modelo (OLLAMA_NUM_PARALLEL=1). Puedes subirlo, y cada hueco en paralelo añade su propia memoria de contexto. Los benchmarks publicados muestran que Ollama escala peor que vLLM con mucha concurrencia."
  - question: "¿Tienen Ollama, vLLM y TGI APIs compatibles con OpenAI?"
    answer: "Sí. Los tres sirven /v1/chat/completions. Ollama y vLLM también sirven completions, embeddings y la Responses API; la Messages API de TGI, compatible con OpenAI, existe desde la versión 1.4.0."
  - question: "¿Puedo ejecutar Llama 3.1 8B en FP16 en una GPU de 24 GB?"
    answer: "Sí. 8.030 millones de parámetros a 2 bytes cada uno son unos 16,1 GB de pesos, que caben en 24 GB con sitio para una caché KV modesta. La mayoría de la gente que sirve modelos en una sola tarjeta de consumo usa pesos de 4 u 8 bits para dejar más sitio al contexto y a los usuarios simultáneos."
---

En una sola RTX 4090 sirviendo un modelo de 7B–8B, Ollama y vLLM van más o menos igual de rápido con una petición cada vez. La diferencia aparece cuando llegan muchas peticiones juntas: en una prueba publicada en septiembre de 2026 con 64 peticiones simultáneas, vLLM produjo unas tres veces el rendimiento total de Ollama. Hugging Face TGI sigue funcionando, pero está en modo mantenimiento desde que su repositorio se archivó en marzo de 2026, y la propia Hugging Face recomienda ahora vLLM y SGLang.

Así que la elección depende de cuánta gente usa el modelo a la vez. Un usuario, un script o una pequeña herramienta interna: Ollama, porque es lo que menos trabajo da. Una API pública o trabajos por lotes con muchas peticiones en curso: vLLM. Un despliegue nuevo con TGI: yo no lo empezaría.

## De dónde salen las cifras

Una versión anterior de esta página mostraba cifras de rendimiento, latencia y VRAM presentadas como mediciones propias en una RTX 4090. No pudimos relacionarlas con una ejecución reproducible ni con una fuente publicada, así que las quitamos. Un motivo para dudar: las antiguas cifras en FP16 con una sola petición superaban lo que permite el ancho de banda de memoria de una RTX 4090 (lo verás en la siguiente sección).

Ahora cada cifra se atribuye a quien la publicó, con el hardware y el modelo que usó. Donde nadie ha publicado una comparación limpia en una RTX 4090 (con TGI, por ejemplo), lo digo en lugar de rellenar el hueco.

Las fuentes principales:

- **ComputingForGeeks, 18 de septiembre de 2026.** Ollama, vLLM y llama.cpp en una RTX 4090, una L40S y una RTX 5090. Modelo: Qwen2.5-7B-Instruct, AWQ de 4 bits para vLLM y GGUF Q4_K_M para Ollama y llama.cpp. Prompt fijo de 512 tokens, temperatura 0, hasta 256 tokens de salida, contexto de 4.096 tokens por hueco, 64 huecos en paralelo.
- **Red Hat Developer, 8 de agosto de 2025.** Ollama 0.9.2 frente a vLLM 0.9.1 en una A100 de 40 GB, Llama 3.1 8B Instruct en FP16, de 1 a 256 usuarios simultáneos, medido con GuideLLM.
- **BentoML, 5 de junio de 2024.** vLLM 0.4.2, TGI 2.0.4 y otros en una A100 de 80 GB con Llama 3 8B Instruct.
- **Tabla de resultados CUDA de llama.cpp.** Velocidad con una sola petición para Llama 2 7B Q4_0 en muchas tarjetas, entre ellas la RTX 4090.

Solo la primera se hizo en una RTX 4090 con todos los motores de este artículo salvo TGI. Las demás muestran el mismo patrón en tarjetas de centro de datos.

## Una petición: el techo lo pone la tarjeta

Cuando una GPU genera tokens para una sola petición, tiene que leer de memoria todos los pesos del modelo en cada token. Así que el límite superior lo pone el ancho de banda de memoria, no el motor.

La RTX 4090 tiene 24 GB de GDDR6X a 1.008 GB/s. Llama 3.1 8B tiene 8.030 millones de parámetros.

- En FP16, eso son 8,03 × 2 bytes ≈ 16,1 GB de pesos. 1.008 ÷ 16,1 ≈ **63 tokens por segundo**, como máximo, para una petición.
- La etiqueta `llama3.1:8b` por defecto de Ollama es Q4_K_M, una descarga de 4,9 GB. 1.008 ÷ 4,9 ≈ **205 tokens por segundo**, como máximo.

Los motores reales se quedan por debajo de esos techos. La tabla de llama.cpp muestra una RTX 4090 generando 186 tokens por segundo con Llama 2 7B en Q4_0 (189 con flash attention). ComputingForGeeks midió unos 174 tokens por segundo con una sola petición y Qwen2.5-7B a 4 bits, y vio que vLLM, llama.cpp y Ollama iban «más o menos» igual en la 4090. (En la L40S y la RTX 5090, su build de Ollama decodificaba a la mitad de velocidad que llama.cpp, así que comprueba tu tarjeta y tu versión).

Para un usuario cada vez, elige el motor por comodidad y la cuantización por velocidad. Pasar de FP16 a 4 bits multiplica el techo más o menos por tres. Cambiar de motor apenas lo mueve.

## Muchas peticiones: decide el batching

Con muchas peticiones en curso, la GPU puede leer los pesos una vez y usarlos para todo un lote de peticiones. Lo que importa entonces es lo bien que agrupa las peticiones el motor y cómo gestiona la caché KV (la memoria que guarda cada petición de la conversación hasta ese momento).

<figure>
<svg viewBox="0 0 720 310" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">Gráfico de barras del rendimiento total en una RTX 4090 con 64 peticiones simultáneas: vLLM 6.623, llama.cpp 2.391 y Ollama 2.018 tokens por segundo</title>
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
<text x="410" y="256" text-anchor="middle" fill="#64748b" font-size="13">Tokens de salida por segundo en total, 64 peticiones a la vez</text>
<text x="360" y="290" text-anchor="middle" fill="#1e1b4b" font-size="14">Una petición cada vez: unos 174 tokens por segundo en los tres</text>
</svg>
<figcaption>RTX 4090, Qwen2.5-7B-Instruct a 4 bits (AWQ en vLLM, GGUF Q4_K_M en los demás), 64 peticiones simultáneas. Cifras de ComputingForGeeks, septiembre de 2026; barras a escala. TGI no formó parte de esta prueba.</figcaption>
</figure>

En la RTX 4090, vLLM sirvió 6.623 tokens por segundo en total repartidos entre 64 peticiones, el servidor de llama.cpp 2.391 y Ollama 2.018. Ollama estaba bien configurado para la prueba: `OLLAMA_NUM_PARALLEL=64`, `num_ctx 4096` y flash attention activado. vLLM se ejecutó con `--quantization awq_marlin --max-model-len 4096 --gpu-memory-utilization 0.90`. Los autores también publicaron un tiempo hasta el primer token de unos 8 a 12 ms en llama.cpp y de 16 a 25 ms en vLLM, con Ollama como el más alto en la L40S y la RTX 5090.

La prueba de Red Hat en una A100 apunta en la misma dirección con pesos en FP16. vLLM llegó a un máximo de 793 tokens por segundo; Ollama con la configuración por defecto se quedó en 41. Después de subir el límite de paralelismo de Ollama a 32, «el valor estable más alto», siguió sin igualar a vLLM en ningún nivel de concurrencia. Su tiempo hasta el primer token «se disparó con más usuarios», y la latencia entre tokens mostró «picos enormes» con la carga máxima.

Dos advertencias antes de citarle estas cifras a nadie. Primera: la comparación de ComputingForGeeks no es del todo equivalente: vLLM usaba pesos AWQ, los demás GGUF, y los builds son distintos. Segunda: son totales sumando todas las peticiones. Cada uno de los 64 usuarios ve unos 6.623 ÷ 64 ≈ 103 tokens por segundo en vLLM, que sigue siendo muy utilizable, y unos 2.018 ÷ 64 ≈ 32 en Ollama.

## En qué punto está TGI

Text Generation Inference era el servidor de producción de Hugging Face, con batching continuo, Flash Attention y Paged Attention, paralelismo de tensores, métricas de Prometheus y trazas con OpenTelemetry. Técnicamente estaba en la misma liga que vLLM.

Su situación ha cambiado. La documentación de TGI empieza ahora así: «text-generation-inference está ahora en modo mantenimiento. A partir de ahora, aceptaremos pull requests para pequeñas correcciones de errores, mejoras de la documentación y tareas de mantenimiento ligeras». Recomienda «vllm, SGLang, así como motores locales intercompatibles como llama.cpp o MLX». El repositorio de GitHub se archivó y pasó a solo lectura el 21 de marzo de 2026.

No he encontrado ningún benchmark reciente publicado de TGI en una RTX 4090. La comparación seria más cercana es la de BentoML en una A100 de 80 GB, de junio de 2024: con Llama 3 8B, vLLM llegó a «2300-2500 tokens por segundo, similar a TGI», y vLLM tuvo el mejor tiempo hasta el primer token en todos los niveles de concurrencia que probaron. De eso hace dos años y muchas versiones de los dos motores, así que tómalo como historia.

Si TGI ya sirve tu tráfico de producción, seguirá funcionando. Para un despliegue nuevo estarías eligiendo un servidor que no va a recibir nuevas arquitecturas de modelos ni mejoras de rendimiento. En una RTX 4090, vLLM cubre todo lo que hacía TGI.

## VRAM en una tarjeta de 24 GB

Los motores tratan la memoria de forma muy distinta, y eso afecta a lo que más puede compartir la tarjeta.

**vLLM se queda con casi toda la tarjeta desde el principio.** Su `--gpu-memory-utilization` es 0.9 por defecto, así que en una RTX 4090 de 24 GB reserva unos 21,6 GB al arrancar, sea cual sea el tamaño del modelo. Todo lo que no usan los pesos se convierte en caché KV. Con Llama 3.1 8B en FP16 (unos 16,1 GB), quedan más o menos 5,5 GB para la caché KV, las activaciones y los CUDA graphs, lo que limita la longitud del contexto y cuántas peticiones caben a la vez. Con pesos AWQ de 4 bits (el build de ComputingForGeeks ocupaba unos 5,6 GB), casi todos los 21,6 GB van a la caché KV, y así es como mantiene 64 peticiones en marcha. No cuentes con ejecutar un segundo programa de GPU a su lado salvo que bajes esa fracción.

**Ollama reserva por modelo y por contexto.** Un modelo `llama3.1:8b` Q4_K_M ocupa 4,9 GB, más la caché KV de su ventana de contexto. Ollama elige el contexto por defecto según tu VRAM: 4k por debajo de 24 GiB, 32k entre 24 y 48 GiB, y 256k a partir de 48 GiB. Una RTX 4090 está justo en la línea de los 24 GiB (nvidia-smi informa de algo menos de 24 GiB), así que mira `ollama ps` para ver qué contexto te ha tocado de verdad, o fíjalo tú. Los huecos en paralelo lo multiplican: el ejemplo de la documentación es que «un contexto de 2K con 4 peticiones en paralelo dará lugar a un contexto de 8K y a una reserva de memoria adicional». Si vas justo de memoria, la cuantización de la caché KV ayuda: `q8_0` usa más o menos la mitad de memoria que el `f16` por defecto, y `q4_0` más o menos una cuarta parte. Ollama también puede mantener por defecto hasta tres modelos cargados por GPU, si caben, lo que viene bien en una tarjeta que alterna entre modelos. Para saber qué modelos caben de entrada en tarjetas de 8, 12, 16 y 24 GB, consulta [qué modelos de IA caben en la VRAM de tu GPU](/es/which-ai-models-fit-your-gpu-vram/).

**TGI** también reserva memoria por adelantado para el batching continuo, igual que vLLM. No he encontrado una cifra de VRAM actual y citable para un modelo de 8B en una 4090, así que no voy a dar ninguna.

## Cuantización y formatos de modelo

| | Ollama | vLLM | TGI |
| --- | --- | --- | --- |
| **Formato principal** | GGUF (p. ej., Q4_K_M) | Safetensors de Hugging Face | Safetensors de Hugging Face |
| **Opciones de 4 bits** | Variantes Q4 de GGUF | AWQ, GPTQ, bitsandbytes, INT4 W4A16 | AWQ, GPTQ, Marlin, EXL2, bitsandbytes NF4/FP4 |
| **8 bits / FP8** | GGUF Q8_0 | FP8 W8A8 en Ada (RTX 4090) y Hopper; INT8 | bitsandbytes de 8 bits, EETQ, fp8 |
| **GGUF** | Nativo | Compatible | No aparece |
| **Cuantización de la caché KV** | q8_0, q4_0 | Sí | No se trata aquí |

La RTX 4090 es una tarjeta Ada (SM 8.9), así que la vía FP8 de vLLM funciona en ella. Los pesos en FP8 ocupan la mitad de memoria que en FP16: unos 8 GB para un modelo de 8B, un término medio entre FP16 y 4 bits en una sola 4090.

La biblioteca de modelos de Ollama trae etiquetas GGUF ya cuantizadas, así que casi nunca tienes que pensar en ello: `ollama pull llama3.1:8b` te da Q4_K_M. Con vLLM eliges un checkpoint ya cuantizado de Hugging Face o pasas tú mismo una opción de cuantización.

## Servidores compatibles con OpenAI y puesta en marcha

Los tres te dan una API HTTP al estilo de OpenAI, así que los SDK de OpenAI y la mayoría de las herramientas de chat funcionan cambiando la URL base.

| | Ollama | vLLM | TGI |
| --- | --- | --- | --- |
| **Dirección por defecto** | `localhost:11434/v1` | `localhost:8000/v1` | Puerto 80 del contenedor (a menudo mapeado al 8080) |
| **Chat completions** | Sí | Sí | Sí (Messages API, desde la 1.4.0) |
| **Otros endpoints de OpenAI** | completions, models, embeddings, responses | completions, embeddings, responses, audio | No se trata aquí |
| **Instalación** | Un script | Paquete pip | Imagen Docker |

Para poner en marcha un modelo de 8B, según la documentación de cada proyecto:

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

Ollama es, con diferencia, lo que menos trabajo da. Se encarga de las descargas, los archivos cuantizados y de cargar y descargar modelos de memoria, y funciona igual en un portátil que en un servidor alquilado. La capa OpenAI de Ollama tiene huecos: no hay `logprobs` ni `tool_choice` en chat completions, y las imágenes tienen que ir en base64, no como URL. vLLM necesita una instalación de CUDA y Python que funcione y más opciones que ajustar, pero es el motor que Hugging Face recomienda ahora en lugar de TGI. TGI es fácil si ya usas Docker, con la salvedad del mantenimiento que he comentado arriba.

## Qué motor para cada trabajo

**Ollama** para una persona, un script, un asistente de programación, una herramienta interna con un puñado de usuarios o una máquina que va cambiando entre varios modelos. Se pone en marcha en minutos, y la velocidad con una sola petición en una 4090 es tan buena como la de cualquier otro.

**vLLM** cuando llegan muchas peticiones al mismo tiempo: una API pública, un producto de chat multiusuario o trabajos por lotes que puedes lanzar de 32 en 32 o de 64 en 64. Las cifras publicadas muestran unas tres veces el rendimiento total de Ollama en una RTX 4090 con 64 peticiones simultáneas, y mucho más en una A100. También es el que más cuantizaciones y APIs admite.

**TGI** solo si ya lo usas. Para trabajo nuevo, el consejo de la propia Hugging Face es vLLM o SGLang.

Cuando alquilas por horas, el coste depende del rendimiento. Toma un millón de tokens de salida en una RTX 4090 a 0,31 $ la hora, el precio bajo demanda más bajo de Vast.ai que publicó getdeploying.com en septiembre de 2026, con las cifras de ComputingForGeeks:

- Una petición cada vez, 174 tokens/s: 1.000.000 ÷ 174 ≈ 5.750 s ≈ 1,6 horas ≈ **0,50 $**.
- 64 a la vez en Ollama, 2.018 tokens/s: ≈ 496 s ≈ **0,04 $**.
- 64 a la vez en vLLM, 6.623 tokens/s: ≈ 151 s ≈ **0,01 $**.

Esto da por hecho que la GPU está ocupada todo el tiempo. Si nunca tienes más de una petición en curso, el batching no te aporta nada y el motor que elijas no cambia tu factura. Si tienes una cola de trabajo, la cambia en un orden de magnitud. El mismo razonamiento, comparado con las APIs por token, está en [¿GPU por horas o API por token?](/es/hourly-gpu-vs-per-token-api/).

## Dónde encaja GPUFlow

El instalador para proveedores de GPUFlow configura Ollama por defecto y el agente de GPUFlow le reenvía las peticiones, así que la columna de Ollama de arriba suele ser la que aplica allí. Alquilas una clave API compatible con OpenAI (`https://gpuflow.app/v1`, con `/v1/chat/completions` y `/v1/models`, con streaming) para un modelo en la GPU del proveedor. Pagas por tiempo, por segundo con un mínimo de 1 minuto, no por token.

Lo que no puedes hacer en GPUFlow: elegir el motor, cambiar su configuración ni ejecutar tu propio código. No hay SSH ni shell. Para reproducir los benchmarks de arriba o ejecutar vLLM por tu cuenta, alquila en Vast.ai o RunPod una máquina en la que puedas iniciar sesión ([cómo se comparan](/es/runpod-vs-vastapi-comparison/)). Para usar desde una aplicación un modelo servido con Ollama sin instalar nada, mira el [mercado de GPUFlow](https://gpuflow.app/es/marketplace) y [cómo usar la clave en las herramientas habituales](/es/use-openai-compatible-api-key-in-apps/).

Si has hecho fine-tuning de tu propio modelo y estás decidiendo cómo servirlo, la [guía de fine-tuning de LLM privados](/es/private-llm-fine-tuning-guide/) cubre el paso anterior a este.

## Fuentes

Todas revisadas en septiembre de 2026.

- Ollama vs vLLM vs llama.cpp en RTX 4090, L40S y RTX 5090: [ComputingForGeeks](https://computingforgeeks.com/ollama-vs-vllm-vs-llama-cpp/) (18 de septiembre de 2026)
- Ollama vs vLLM en A100 de 40 GB: [Red Hat Developer](https://developers.redhat.com/articles/2025/08/08/ollama-vs-vllm-deep-dive-performance-benchmarking) (8 de agosto de 2025)
- vLLM, TGI y otros en A100 de 80 GB: [BentoML, Benchmarking LLM Inference Backends](https://www.bentoml.com/blog/benchmarking-llm-inference-backends) (5 de junio de 2024)
- Tabla de resultados CUDA de llama.cpp: [github.com/ggml-org/llama.cpp/discussions/15013](https://github.com/ggml-org/llama.cpp/discussions/15013)
- Memoria y ancho de banda de la RTX 4090: [análisis de TechPowerUp](https://www.techpowerup.com/review/nvidia-geforce-rtx-4090-founders-edition/)
- Parámetros y licencia de Llama 3.1 8B: [ficha del modelo en Hugging Face](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
- Ollama: [FAQ (peticiones en paralelo, caché KV)](https://docs.ollama.com/faq), [longitud de contexto](https://docs.ollama.com/context-length), [compatibilidad con OpenAI](https://docs.ollama.com/api/openai-compatibility), [etiqueta llama3.1:8b](https://ollama.com/library/llama3.1:8b)
- vLLM: [servidor compatible con OpenAI](https://docs.vllm.ai/en/latest/serving/online_serving/openai_compatible_server/), [cuantización](https://docs.vllm.ai/en/latest/features/quantization/index.html), [argumentos del motor (gpu-memory-utilization)](https://docs.vllm.ai/en/v0.6.4/models/engine_args.html)
- TGI: [documentación y aviso de mantenimiento](https://huggingface.co/docs/text-generation-inference/en/index), [repositorio de GitHub (archivado)](https://github.com/huggingface/text-generation-inference), [Messages API](https://huggingface.co/docs/text-generation-inference/en/messages_api), [cuantización](https://huggingface.co/docs/text-generation-inference/en/conceptual/quantization)
- Precio de alquiler de la RTX 4090: [getdeploying.com](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090)
- GPUFlow: [guía rápida de la API](https://docs.gpuflow.app/es/renters/api-quickstart/), [primeros pasos para proveedores](https://docs.gpuflow.app/es/providers/getting-started/)
