---
title: "¿GPU por horas o API por token? Lo que cuesta de verdad ejecutar un modelo de 7B–8B"
description: "Una comparación de costes sin rodeos entre alquilar una GPU de consumo por horas y pagar una API de IA por token, con precios actuales, velocidades medidas y un ejemplo práctico de 1.000 peticiones."
excerpt: "Las API por token y las GPU por horas se cobran en unidades distintas. Convertimos ambas al mismo trabajo y mostramos cuándo sale más barata cada una."
pubDate: 2026-09-29
locale: "es"
category: "comparisons"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/hourly-gpu-vs-per-token-api-hero.png"
heroImageAlt: "Gráfico con una línea plana para el precio por horas y una línea ascendente para el precio por token"
faq:
  - question: "¿Sale más barato alquilar una GPU por horas que usar una API por token?"
    answer: "Depende de con qué lo compares. Para modelos abiertos populares como Llama 3.1 8B, las API por token alojadas son más baratas: DeepInfra cobra 0,02 $ por millón de tokens de entrada y 0,04 $ por millón de tokens de salida. Frente a gpt-5-mini (2,00 $ por millón de tokens de salida) o Claude Haiku 4.5 (5,00 $), cualquier GPU alquilada, de la RTX 3060 a la RTX 5090, con un modelo abierto de 7B–8B cuesta menos por token si se mantiene ocupada. Frente a gpt-4o-mini (0,60 $), solo las tarjetas más baratas, como la RTX 3060, ganan con claridad."
  - question: "¿Cuántos tokens por segundo genera una RTX 4090 con un modelo de 8B?"
    answer: "Hardware Corner midió 104 tokens por segundo en una RTX 4090 con Qwen3 8B cuantizado a 4 bits y un contexto de 16K, con una petición cada vez. El marcador de llama.cpp muestra 186 tokens por segundo con el modelo más pequeño Llama 2 7B en Q4_0 y un contexto corto."
  - question: "¿Cuánto cuesta un millón de tokens de salida en una RTX 4090 alquilada?"
    answer: "A 0,35 $ la hora y unos 104 tokens por segundo, una hora produce unos 376.000 tokens, así que un millón de tokens de salida cuesta unos 0,93 $ de tiempo de GPU. Leer el prompt es mucho más rápido que escribir la respuesta, así que los tokens de entrada apenas suman."
  - question: "¿Cuándo tiene más sentido una GPU por horas que una API?"
    answer: "Cuando el modelo que necesitas no se ofrece por token (tu propio fine-tune, un modelo de la comunidad, una cuantización concreta), cuando prefieres un coste fijo por hora en lugar de pagar por tokens consumidos, o cuando lo comparas con un modelo cerrado que cobra 2 $ o más por millón de tokens de salida."
---

Hay dos formas habituales de pagar por un modelo de IA abierto y pequeño como Llama 3.1 8B o Qwen 2.5 7B:

- **Por token:** una empresa aloja el modelo y te cobra por cada token que envías y recibes.
- **Por hora:** alquilas una GPU que ejecuta el modelo y pagas por el tiempo, uses los tokens que uses.

Los precios parecen imposibles de comparar: «0,04 $ por millón de tokens» por un lado, «0,35 $ por hora» por el otro. En este artículo pasamos ambos a la misma unidad y calculamos un trabajo realista. Todos los precios se revisaron en septiembre de 2026; las fuentes están al final.

## Paso 1: ¿A qué velocidad escribe una GPU de consumo?

La velocidad que importa es cuántos tokens por segundo genera la GPU para una petición. Usamos las mediciones de Hardware Corner, que probó Qwen3 8B cuantizado a 4 bits (Q4_K_XL) con un contexto de 16K en llama.cpp, el mismo motor sobre el que está construido Ollama.

| GPU | Tokens por segundo (una petición) | Tokens por hora |
| --- | --- | --- |
| RTX 3060 12 GB | 42 | unos 151.000 |
| RTX 3090 | 87 | unos 315.000 |
| RTX 4090 | 104 | unos 376.000 |
| RTX 5090 | 145 | unos 523.000 |

Con prompts cortos va más rápido. El marcador del propio proyecto llama.cpp, con el modelo más pequeño Llama 2 7B en Q4_0 y un contexto corto, muestra 76, 158, 186 y 290 tokens por segundo para esas mismas cuatro tarjetas. Nosotros usamos las cifras más bajas, que son más realistas.

Leer tu prompt es mucho más rápido que escribir la respuesta. El mismo marcador muestra un procesamiento del prompt de unos 2.100 tokens por segundo en una RTX 3060 y de unos 12.000 en una RTX 4090. Así que, en una GPU por horas, los prompts largos apenas añaden tiempo.

## Paso 2: Pasar el precio por hora a precio por millón de tokens

Divide el precio por hora entre los tokens por hora. Usamos precios bajo demanda habituales en webs de alquiler de GPU en septiembre de 2026:

| GPU | Precio por hora | Coste por 1 millón de tokens de salida, con la GPU siempre ocupada |
| --- | --- | --- |
| RTX 3060 12 GB | 0,06 $ | unos 0,40 $ |
| RTX 3090 | 0,20 $ | unos 0,64 $ |
| RTX 4090 | 0,35 $ | unos 0,93 $ |
| RTX 5090 | 0,55 $ | unos 1,05 $ |

Lo importante es lo de «siempre ocupada». Estas cifras dan por hecho que la GPU escribe durante toda la hora. Si pasa la mitad del tiempo parada, el coste por token se duplica.

## Paso 3: Lo que cobran las API por token

Precios por millón de tokens, entrada / salida:

| Modelo | Proveedor | Entrada | Salida |
| --- | --- | --- | --- |
| Llama 3.1 8B Instruct Turbo | DeepInfra | 0,02 $ | 0,04 $ |
| Gemma 3 12B | DeepInfra | 0,05 $ | 0,15 $ |
| Qwen3.5 9B | DeepInfra | 0,10 $ | 0,15 $ |
| gpt-4o-mini | OpenAI | 0,15 $ | 0,60 $ |
| gpt-5-mini | OpenAI | 0,25 $ | 2,00 $ |
| Claude Haiku 4.5 | Anthropic | 1,00 $ | 5,00 $ |

Hay dos cosas que llaman la atención. Los modelos abiertos alojados son muy baratos. Y los modelos pequeños cerrados cuestan entre 15 y 125 veces más por token de salida que el modelo abierto de 8B más barato.

## Paso 4: Un trabajo real, con todos los precios

Supón que lanzas 1.000 peticiones. Cada una envía 1.500 tokens (instrucciones más un documento) y recibe 500 tokens. En total son 1,5 millones de tokens de entrada y 0,5 millones de tokens de salida.

| Opción | Coste del trabajo | Notas |
| --- | --- | --- |
| Llama 3.1 8B en DeepInfra | unos 0,05 $ | La más barata con diferencia |
| gpt-4o-mini | unos 0,53 $ | |
| gpt-5-mini | unos 1,38 $ | |
| Claude Haiku 4.5 | unos 4,00 $ | |
| RTX 3060 alquilada, una petición cada vez | unos 0,21 $ | Unas 3,5 horas |
| RTX 3090 alquilada | unos 0,33 $ | Unas 1,7 horas |
| RTX 4090 alquilada | unos 0,48 $ | Unas 1,4 horas |
| RTX 5090 alquilada | unos 0,54 $ | Alrededor de 1 hora |

Cómo hemos calculado las cifras de las GPU: 500.000 tokens de salida divididos entre la velocidad del paso 1, más 1,5 millones de tokens de prompt divididos entre la velocidad de procesamiento del prompt del marcador de llama.cpp, y todo ello multiplicado por el precio por hora.

## Qué significa todo esto

**Si una API alojada ofrece el modelo abierto que quieres, es la forma más barata de usarlo.** Para Llama 3.1 8B, nada de lo que alquiles por horas se acerca a 0,04 $ por millón de tokens de salida.

**Frente a la mayoría de los modelos pequeños cerrados, una GPU por horas sale más barata, siempre que el modelo abierto sea suficiente para tu tarea.** Una RTX 3060 bien aprovechada cuesta menos por token de salida que gpt-4o-mini, y una RTX 3090 cuesta más o menos lo mismo; si cuentas también los tokens de entrada, como en el trabajo de arriba, las dos salen más baratas. Todas las tarjetas de la tabla cuestan menos que gpt-5-mini o Claude Haiku. Que un modelo abierto de 7B–8B dé respuestas lo bastante buenas depende del trabajo: suele cumplir para clasificar, extraer campos, resumir y reescribir textos cortos, y flojea en razonamientos largos.

**Una GPU por horas tiene sentido cuando:**

- El modelo que necesitas no está en ninguna API por token: tu propio fine-tune, un modelo de la comunidad o una cuantización concreta.
- Prefieres un coste fijo por hora en lugar de una factura por consumo, por ejemplo mientras haces pruebas o lanzas un trabajo por lotes durante la noche.
- Tus prompts son largos. En una GPU que alquilas por horas, los tokens de entrada solo cuestan los pocos segundos que se tarda en leerlos.
- Quieres probar un modelo en hardware real antes de comprarte una tarjeta.

**Pagar por token tiene sentido cuando:**

- Tu tráfico llega a ráfagas, con pausas largas. No pagas nada mientras esperas.
- Necesitas muchas peticiones a la vez. Una sola GPU de consumo atiende una petición cada vez por defecto: `OLLAMA_NUM_PARALLEL` de Ollama vale 1 por defecto.
- El modelo que quieres está alojado y te convence su precio.

## La privacidad cuenta en los dos casos

Con una API por token, tus prompts van a la empresa de la API. Con una GPU alquilada, van a la máquina que alquilas. En GPUFlow, por ejemplo, el modelo se ejecuta en el propio ordenador del proveedor, así que los prompts y las respuestas pasan por él. Nuestra documentación lo dice claramente: no envíes contraseñas, números de tarjeta ni nada que no compartirías con un desconocido. Ninguna de las dos opciones sustituye a ejecutar el modelo en tu propio hardware cuando los datos son realmente sensibles.

## Cómo probarlo en GPUFlow

En GPUFlow alquilas una GPU durante un número de horas y recibes una clave API que funciona como una clave de OpenAI. Se factura al segundo y, si terminas antes, el tiempo no usado vuelve a tus créditos. Para medir tu propio coste por token:

1. Alquila durante una hora una GPU que ejecute el modelo que quieres.
2. Apunta tu script a `https://gpuflow.app/v1` con tu clave ([cómo hacerlo](https://docs.gpuflow.app/es/renters/api-quickstart/)).
3. Cuenta los tokens que has recibido y divide lo que has pagado entre ellos.

Diez minutos de tráfico real te dicen más que cualquier tabla.

## Artículos relacionados

- [El coste real de alquilar una GPU: lo que no incluye el precio por hora](/es/hidden-fees-in-gpu-rental/)
- [Cómo usar una clave API compatible con OpenAI en Open WebUI, Continue, LangChain y más](/es/use-openai-compatible-api-key-in-apps/)
- [Ollama vs vLLM vs TGI: benchmark de inferencia en una RTX 4090](/es/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/)

## Fuentes

Todas consultadas en septiembre de 2026.

- Velocidades de GPU, Qwen3 8B Q4_K_XL con contexto de 16K: [ranking de GPU de Hardware Corner](https://www.hardware-corner.net/gpu-ranking-local-llm/) (actualizado el 9 de diciembre de 2025)
- Marcador CUDA de llama.cpp, Llama 2 7B Q4_0: [github.com/ggml-org/llama.cpp/discussions/15013](https://github.com/ggml-org/llama.cpp/discussions/15013)
- Peticiones en paralelo en Ollama: [docs.ollama.com/faq](https://docs.ollama.com/faq)
- Precios de DeepInfra: [deepinfra.com/pricing](https://deepinfra.com/pricing)
- Precios de OpenAI: [gpt-4o-mini](https://developers.openai.com/api/docs/models/gpt-4o-mini), [gpt-5-mini](https://developers.openai.com/api/docs/models/gpt-5-mini)
- Precios de Anthropic: [precios en platform.claude.com](https://platform.claude.com/docs/en/about-claude/pricing)
- Rangos de precios de alquiler de GPU: [documentación de GPUFlow, Cómo poner precio a tu GPU](https://docs.gpuflow.app/es/providers/pricing/)
