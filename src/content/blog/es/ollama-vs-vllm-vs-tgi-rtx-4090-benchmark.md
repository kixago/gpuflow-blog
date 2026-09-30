---
title: "Ollama vs vLLM vs TGI: benchmark de inferencia en una RTX 4090 (medido, no publicitado)"
description: "Benchmark controlado en una RTX 4090 que compara Ollama, vLLM y Hugging Face TGI con Llama‑3.1‑8B. Rendimiento, latencia, uso de VRAM y coste por token."
excerpt: "Benchmark medido de Ollama, vLLM y TGI en una sola RTX 4090 con Llama‑3.1‑8B. Rendimiento real, latencia real y lo que supone en costes."
pubDate: 2026-02-25
updatedDate: 2026-09-29
locale: "es"
category: "benchmarks"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/rtx4090-inference-benchmark-hero.png"
heroImageAlt: "Benchmark de inferencia de una GPU RTX 4090 en un terminal con métricas de rendimiento"
faq:
  - question: "¿Qué servidor de inferencia es el más rápido en una RTX 4090 con Llama-3.1-8B?"
    answer: "En pruebas medidas en FP16 sobre una RTX 4090, vLLM logró el mayor rendimiento sostenido con carga concurrente: entre 185 y 215 tokens por segundo con ocho flujos. TGI dio entre 150 y 176 tokens por segundo, y Ollama se quedó en una media de 95 a 108 tokens por segundo en las mismas condiciones."

  - question: "¿vLLM usa más VRAM que Ollama o TGI?"
    answer: "vLLM usó entre 20 y 22GB de VRAM aproximadamente al servir Llama-3.1-8B en FP16. TGI consumió una cantidad parecida, de 21 a 23GB. Ollama usó menos VRAM en general, normalmente entre 14 y 17GB, pero no alcanzó el mismo rendimiento con carga concurrente."

  - question: "¿Sirve Ollama para inferencia en producción?"
    answer: "Ollama sirve para entornos de desarrollo y herramientas internas con poca concurrencia. En las pruebas no escaló tan bien como vLLM o TGI con ocho flujos de peticiones concurrentes. Para una API en producción con tráfico sostenido, suele ser más eficiente un servidor optimizado para continuous batching."

  - question: "¿Cuánto cuesta ejecutar inferencia de Llama-3.1-8B en una RTX 4090?"
    answer: "Con una tarifa media de alquiler de unos 0,45 USD por hora, generar 500 000 tokens con vLLM llevó unos 41-42 minutos, con un coste aproximado de 0,31 USD. Con Ollama, la misma carga llevó unos 83-84 minutos, con un coste aproximado de 0,63 USD. El coste real depende de la carga de trabajo y del precio del alquiler."

  - question: "¿Qué parámetros de prompt y de generación se usaron en este benchmark?"
    answer: "El benchmark usó un prompt de entrada de 512 tokens y generó 128 tokens por petición con decodificación greedy y temperatura a cero. Todas las mediciones se tomaron después de calentar el modelo, con ocho flujos de peticiones concurrentes y sin decodificación especulativa."

  - question: "¿Puedo reproducir yo mismo este benchmark de inferencia en una RTX 4090?"
    answer: "Sí. El artículo incluye las especificaciones del hardware, la versión de CUDA, la versión del driver, los parámetros de decodificación y la configuración de concurrencia. Si despliegas Llama-3.1-8B en FP16 en una sola RTX 4090 con la misma longitud de prompt y la misma concurrencia, obtendrás resultados comparables."
---

Ejecutar tu propio modelo es solo la mitad de la ecuación.

Una vez terminado el fine-tuning, como se explica en nuestra [guía de fine-tuning privado de LLM](/es/private-llm-fine-tuning-guide/), la siguiente decisión es operativa: ¿cómo sirves el modelo de forma eficiente?

La inferencia determina:

- El coste por token
- La latencia con carga
- La eficiencia en el uso de la GPU
- Si el hardware de consumo es viable en producción

Este benchmark compara tres stacks de inferencia muy utilizados:

- Ollama
- vLLM
- Hugging Face Text Generation Inference (TGI)

El objetivo no es opinar. El objetivo es medir.

---

## Entorno de pruebas

**Hardware**

- GPU: NVIDIA RTX 4090 (24GB de VRAM)
- CPU: procesador de consumo de 16 núcleos, clase Ryzen
- RAM: 64GB DDR5
- Almacenamiento: SSD NVMe
- CUDA: 12.1
- Driver de NVIDIA: 550+

**Modelo**

- `meta-llama/Llama-3.1-8B`
- Precisión: FP16 (sin cuantización a 4 bits)
- Ventana de contexto: 4096 tokens

**Condiciones del benchmark**

- Prompt de entrada de 512 tokens
- Generación de 128 tokens de salida
- Decodificación greedy (temperatura = 0)
- Sin decodificación especulativa
- Sin paralelismo de tensores
- Solo arranque en caliente (modelo cargado antes de medir)
- 8 flujos de peticiones concurrentes (cuando el servidor lo permite)

Todas las pruebas se ejecutaron en una máquina limpia, sin otras cargas en segundo plano. Cada medición es la media de cinco ejecuciones.

---

![Terminal con las métricas del benchmark de inferencia en la RTX 4090](../_images/rtx4090-inference-terminal-results.png)

---

## Resultados

### 1. Ollama

Ollama prioriza la sencillez. La instalación es mínima y los modelos se descargan automáticamente.

```bash
ollama run llama3
```

Las opciones para configurar el batching o la estrategia de planificación son limitadas.

#### Rendimiento medido (RTX 4090, FP16)

- **Rendimiento con un flujo:** 62–74 tokens/s
- **Rendimiento con 8 flujos:** 95–108 tokens/s
- **Latencia del primer token:** 720–980 ms
- **Uso de VRAM observado:** 14–17GB

#### Observaciones

- El uso de la GPU fluctuó con concurrencia.
- A partir de 4 flujos, el rendimiento dejó de escalar de forma lineal.
- No hay controles expuestos para optimizar el batching avanzado.

Ollama funciona de forma fiable en desarrollo local y en servicios con poco tráfico. Con carga concurrente sostenida, no llega a saturar la GPU.

---

### 2. vLLM

vLLM está diseñado para maximizar el rendimiento. Su implementación de PagedAttention mejora la eficiencia de la caché KV con peticiones concurrentes.

Instalación:

```bash
pip install vllm
```

Arranque:

```bash
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-3.1-8B \
  --dtype float16
```

#### Rendimiento medido (RTX 4090, FP16)

- **Rendimiento con un flujo:** 92–104 tokens/s
- **Rendimiento con 8 flujos:** 185–215 tokens/s
- **Latencia del primer token:** 360–480 ms
- **Uso de VRAM observado:** 20–22GB

#### Observaciones

- El uso de la GPU se mantuvo por encima del 95 % con carga.
- El continuous batching mejoró la eficiencia al escalar.
- La latencia se mantuvo estable con flujos concurrentes.

vLLM logró el mayor rendimiento sostenido por hora de alquiler.

---

### 3. Hugging Face Text Generation Inference (TGI)

TGI es un servidor de inferencia para producción que se ejecuta en contenedor.

```bash
docker run --gpus all \
  -p 8080:80 \
  ghcr.io/huggingface/text-generation-inference:latest \
  --model-id meta-llama/Llama-3.1-8B
```

#### Rendimiento medido (RTX 4090, FP16)

- **Rendimiento con un flujo:** 78–88 tokens/s
- **Rendimiento con 8 flujos:** 150–176 tokens/s
- **Latencia del primer token:** 510–690 ms
- **Uso de VRAM observado:** 21–23GB

#### Observaciones

- El rendimiento fue constante y previsible.
- Escaló mejor que Ollama, pero por debajo de vLLM.
- Más sobrecarga operativa por el runtime de contenedores.

TGI ofrece controles y monitorización para producción, pero no exprime al máximo el rendimiento de una sola 4090.

---

![Salida de nvidia-smi con el uso de la GPU durante la inferencia concurrente](../_images/rtx4090-nvidia-smi-inference-load.png)

---

## Comparación directa

| Stack  | Un flujo   | 8 flujos    | Primer token | VRAM    | Saturación de GPU |
| ------ | ---------- | ----------- | ------------ | ------- | ----------------- |
| Ollama | 62–74 t/s  | 95–108 t/s  | 720–980ms    | 14–17GB | Parcial           |
| TGI    | 78–88 t/s  | 150–176 t/s | 510–690ms    | 21–23GB | Alta              |
| vLLM   | 92–104 t/s | 185–215 t/s | 360–480ms    | 20–22GB | Muy alta          |

---

## Qué supone en costes con GPU alquiladas

En los marketplaces de GPU, alquilar una RTX 4090 costaba en septiembre de 2026 entre 0,30 $ y 0,46 $ por hora, según la plataforma y la demanda. Tienes el desglose detallado en:

- [Comparativa de precios de alquiler de GPU en 2026](/es/gpu-rental-pricing-comparison-2026/)
- [Lo que cuesta de verdad alquilar una GPU](/es/hidden-fees-in-gpu-rental/)

Supongamos:

- Alquiler a 0,45 $/hora
- 500 000 tokens generados
- 8 flujos concurrentes

Con el rendimiento mediano medido:

**vLLM (~200 tokens/s)**  
500 000 / 200 = 2500 segundos ≈ 41–42 minutos  
Coste ≈ 0,31 $

**Ollama (~100 tokens/s)**  
500 000 / 100 = 5000 segundos ≈ 83–84 minutos  
Coste ≈ 0,63 $

Por sí sola, la diferencia de coste no es espectacular. Pero se multiplica a escala.

Con 50 millones de tokens al día, la eficiencia del rendimiento influye directamente en el número de GPU que necesitas y en cuántas horas las alquilas.

### Cómo reproducir este benchmark

Para reproducir estas mediciones necesitas una máquina que controles, para poder instalar y configurar cada servidor. Sirven los marketplaces que alquilan contenedores con acceso SSH, como Vast.ai o RunPod.

Si solo quieres probar modelos servidos con Ollama en una RTX 4090 sin configurar nada, los proveedores de [GPUFlow](https://gpuflow.app/es/marketplace) ejecutan Ollama y tú alquilas el acceso mediante una clave de API compatible con OpenAI, con facturación por segundos. Allí no puedes cambiar el servidor de inferencia, así que sirve para usar los modelos, no para comparar servidores.

Como el alquiler es por horas, la eficiencia de la inferencia repercute directamente en el coste. La diferencia entre 100 tokens/s y 200 tokens/s se nota con cargas de trabajo sostenidas.

---

## Contexto de despliegue

Si alquilas GPU por horas, la eficiencia de la inferencia determina directamente la eficiencia de costes. Hacemos las cuentas en [GPU por horas o API por token](/es/hourly-gpu-vs-per-token-api/).

El rendimiento influye en:

- Cuántas horas de alquiler necesita un trabajo
- Cuántas GPU necesitas para tu tráfico
- La exposición a la inestabilidad del host
- El margen operativo

Las GPU de consumo siguen siendo rentables para modelos de 7B–8B si se combinan con un stack de inferencia eficiente.

---

## Cuándo usar cada uno

**Ollama**

- Herramientas internas
- Poca concurrencia
- Prototipado rápido

**TGI**

- Entornos basados en contenedores
- Equipos que necesitan logs estructurados
- Despliegues gestionados en producción

**vLLM**

- Servicios de API
- Mucha concurrencia
- Máximos tokens por dólar

---

## Conclusión

En una sola RTX 4090 con Llama‑3.1‑8B en FP16:

- vLLM logró el mayor rendimiento sostenido.
- TGI ofreció un rendimiento equilibrado con controles para producción.
- Ollama priorizó la sencillez sobre el máximo aprovechamiento de la GPU.

Elegir el stack de inferencia no es una cuestión estética. Define la estructura de costes y cómo escalas.

En cargas de trabajo desplegadas en GPU de consumo alquiladas, la eficiencia del batching tiene un impacto real en la economía.

## Dónde ejecutar esto en producción

Todos los benchmarks de este artículo se hicieron con hardware de consumo alquilado, no con infraestructura propia.

Para hacer fine-tuning o ejecutar tu propio servidor de inferencia, alquila una máquina a la que puedas conectarte. Para usar un modelo servido con Ollama a través de una API sin configurar nada, echa un vistazo a [GPUFlow](https://gpuflow.app/es/marketplace): los alquileres se facturan por segundos y se pagan con créditos comprados con tarjeta.

#### Recursos relacionados

**Profundiza en tu stack de despliegue:**

- [La guía definitiva de fine-tuning privado de LLM en GPU alquiladas](/es/private-llm-fine-tuning-guide/): recorrido completo para entrenar modelos de pesos abiertos de forma segura
- [Comparativa de precios de alquiler de GPU en 2026](/es/gpu-rental-pricing-comparison-2026/): diferencias de coste entre las principales plataformas de alquiler de GPU
- [Lo que cuesta de verdad alquilar una GPU](/es/hidden-fees-in-gpu-rental/): lo que no cuentan las páginas de precios por hora
- [Comparativa RunPod vs Vast.ai](/es/runpod-vs-vastapi-comparison/): diferencias entre una infraestructura centralizada y un marketplace
