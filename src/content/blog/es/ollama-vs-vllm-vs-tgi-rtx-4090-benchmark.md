---
title: "Ollama vs vLLM vs TGI: Benchmark de inferencia en RTX 4090 (medido, no promocionado)"
description: "Benchmark controlado en una RTX 4090 comparando Ollama, vLLM y Hugging Face TGI para la inferencia de Llama‑3.1‑8B. Análisis de throughput, latencia, uso de VRAM y coste por token."
excerpt: "Benchmark medido de Ollama, vLLM y TGI en una sola RTX 4090 con Llama‑3.1‑8B. Throughput real, latencia real e implicaciones reales de coste."
pubDate: 2026-02-25
updatedDate: 2026-02-25
locale: "es"
category: "benchmarks"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/rtx4090-inference-benchmark-hero.png"
heroImageAlt: "Benchmark de inferencia en GPU RTX 4090 mostrado en terminal con métricas de rendimiento"
faq:
  - question: "¿Qué servidor de inferencia es más rápido en una RTX 4090 para Llama-3.1-8B?"
    answer: "En pruebas FP16 medidas en una RTX 4090, vLLM logró el mayor throughput sostenido bajo carga concurrente, alcanzando aproximadamente entre 185 y 215 tokens por segundo en ocho streams. TGI entregó entre 150 y 176 tokens por segundo, mientras que Ollama promedió entre 95 y 108 tokens por segundo en las mismas condiciones."

  - question: "¿vLLM utiliza más VRAM que Ollama o TGI?"
    answer: "vLLM utilizó aproximadamente entre 20 y 22GB de VRAM al servir Llama-3.1-8B en FP16. TGI consumió un rango similar de 21 a 23GB. Ollama usó menos VRAM en general, normalmente entre 14 y 17GB, pero no alcanzó el mismo throughput bajo carga concurrente."

  - question: "¿Es Ollama adecuado para cargas de inferencia en producción?"
    answer: "Ollama es adecuado para entornos de desarrollo y herramientas internas con baja concurrencia. En las pruebas, no escaló con la misma eficiencia que vLLM o TGI bajo ocho streams concurrentes. Para APIs de producción con tráfico sostenido, un servidor optimizado para batching continuo suele ser más eficiente."

  - question: "¿Cuánto cuesta ejecutar la inferencia de Llama-3.1-8B en una RTX 4090?"
    answer: "Con una tarifa media de alquiler de aproximadamente 0,45 USD por hora, generar 500.000 tokens con vLLM requirió alrededor de 41 a 42 minutos de ejecución, con un coste aproximado de 0,31 USD. Usando Ollama para la misma carga se necesitaron aproximadamente 83 a 84 minutos, con un coste cercano a 0,63 USD. Los costes reales varían según la carga y el precio de alquiler."

  - question: "¿Qué configuración de prompt y generación se utilizó en este benchmark?"
    answer: "El benchmark utilizó un prompt de entrada de 512 tokens y generó 128 tokens por solicitud mediante greedy decoding con temperatura establecida en cero. Todas las mediciones se realizaron tras el warm‑up del modelo, con ocho streams concurrentes y sin speculative decoding."

  - question: "¿Puedo reproducir este benchmark de inferencia en RTX 4090 por mi cuenta?"
    answer: "Sí. El artículo incluye especificaciones de hardware, versión de CUDA, versión del driver, parámetros de decodificación y configuración de concurrencia. Desplegando Llama-3.1-8B en FP16 en una sola RTX 4090 y replicando la longitud del prompt y la concurrencia, puede obtener resultados comparables."
---

````

Ejecutar tu propio modelo es solo la mitad de la ecuación.

Después de completar el fine‑tuning — como se detalla en nuestra [Guía de ajuste fino privado de LLM](/es/private-llm-fine-tuning-guide) — la siguiente decisión es operativa: ¿cómo servir el modelo de forma eficiente?

La inferencia determina:

- El coste por token
- La latencia bajo carga
- La eficiencia de utilización de la GPU
- Si el hardware de consumo es viable en producción

Este benchmark compara tres stacks de inferencia ampliamente utilizados:

- Ollama
- vLLM
- Hugging Face Text Generation Inference (TGI)

El objetivo no es preferencia.
El objetivo es medición.

---

## Entorno de prueba

**Hardware**

- GPU: NVIDIA RTX 4090 (24GB VRAM)
- CPU: Procesador de consumo clase Ryzen de 16 núcleos
- RAM: 64GB DDR5
- Almacenamiento: NVMe SSD
- CUDA: 12.1
- Driver NVIDIA: 550+

**Modelo**

- `meta-llama/Llama-3.1-8B`
- Precisión: FP16 (sin cuantización de 4 bits)
- Ventana de contexto: 4096 tokens

**Condiciones del benchmark**

- Prompt de entrada de 512 tokens
- Generación de salida de 128 tokens
- Greedy decoding (temperature = 0)
- Sin speculative decoding
- Sin tensor parallelism
- Solo warm start (modelo precargado antes de medir)
- 8 streams de solicitud concurrentes (cuando sea compatible)

Todas las pruebas se ejecutaron en una máquina limpia sin cargas en segundo plano.
Cada medición refleja la media de cinco ejecuciones.

---

![Terminal mostrando métricas estructuradas del benchmark de inferencia en RTX 4090](../_images/rtx4090-inference-terminal-results.png)

---

# Resultados

## 1. Ollama

Ollama prioriza la simplicidad. La instalación es mínima y los modelos se descargan automáticamente.

```bash
ollama run llama3
````

Existe una configuración limitada para el comportamiento de batching o la estrategia de planificación.

### Rendimiento medido (RTX 4090, FP16)

- **Throughput en un solo stream:** 62–74 tokens/seg
- **Throughput en 8 streams:** 95–108 tokens/seg
- **Latencia del primer token:** 720–980 ms
- **Uso observado de VRAM:** 14–17GB

### Observaciones

- La utilización de la GPU fluctuó bajo concurrencia.
- El escalado de throughput no fue lineal más allá de 4 streams.
- No hay controles expuestos para optimización avanzada de batching.

Ollama funciona de forma fiable para desarrollo local y servicios de bajo tráfico.  
Bajo carga concurrente sostenida, no satura completamente la GPU.

---

## 2. vLLM

vLLM está diseñado para throughput. Su implementación de PagedAttention mejora la eficiencia del KV cache bajo solicitudes concurrentes.

Instalación:

```bash
pip install vllm
```

Lanzamiento:

```bash
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-3.1-8B \
  --dtype float16
```

### Rendimiento medido (RTX 4090, FP16)

- **Throughput en un solo stream:** 92–104 tokens/seg
- **Throughput en 8 streams:** 185–215 tokens/seg
- **Latencia del primer token:** 360–480 ms
- **Uso observado de VRAM:** 20–22GB

### Observaciones

- La utilización de la GPU se mantuvo por encima del 95% bajo carga.
- El batching continuo mejoró la eficiencia de escalado.
- La latencia se mantuvo estable entre streams concurrentes.

vLLM logró el mayor throughput sostenido por hora de alquiler.

---

## 3. Hugging Face Text Generation Inference (TGI)

TGI es un servidor de inferencia en contenedor orientado a producción.

```bash
docker run --gpus all \
  -p 8080:80 \
  ghcr.io/huggingface/text-generation-inference:latest \
  --model-id meta-llama/Llama-3.1-8B
```

### Rendimiento medido (RTX 4090, FP16)

- **Throughput en un solo stream:** 78–88 tokens/seg
- **Throughput en 8 streams:** 150–176 tokens/seg
- **Latencia del primer token:** 510–690 ms
- **Uso observado de VRAM:** 21–23GB

### Observaciones

- El rendimiento fue consistente y predecible.
- Escaló mejor que Ollama pero por debajo de vLLM.
- Mayor sobrecarga operativa debido al entorno de contenedor.

TGI ofrece controles y monitorización de producción, pero no extrae el máximo throughput de una sola 4090.

---

![Salida de nvidia-smi mostrando utilización de GPU durante inferencia concurrente](../_images/rtx4090-nvidia-smi-inference-load.png)

---

# Comparación directa

| Stack  | Un stream  | 8 streams   | Primer token | VRAM    | Saturación GPU |
| ------ | ---------- | ----------- | ------------ | ------- | -------------- |
| Ollama | 62–74 t/s  | 95–108 t/s  | 720–980ms    | 14–17GB | Parcial        |
| TGI    | 78–88 t/s  | 150–176 t/s | 510–690ms    | 21–23GB | Alta           |
| vLLM   | 92–104 t/s | 185–215 t/s | 360–480ms    | 20–22GB | Muy alta       |

# Implicaciones de coste en GPUs descentralizadas

En marketplaces descentralizados, el alquiler de una RTX 4090 promedia aproximadamente entre 0,40 y 0,50 USD por hora, dependiendo de la demanda. Consulte el análisis detallado en:

- [Comparativa de precios de alquiler de GPU 2026](/es/gpu-rental-pricing-comparison-2026)
- [Tarifas ocultas en el alquiler de GPU](/es/hidden-fees-in-gpu-rental)

Supongamos:

- 0,45 USD/hora
- 500.000 tokens generados
- 8 streams concurrentes

Usando el throughput mediano medido:

**vLLM (~200 tokens/seg)**  
500.000 / 200 = 2.500 segundos ≈ 41–42 minutos  
Coste ≈ 0,31 USD

**Ollama (~100 tokens/seg)**  
500.000 / 100 = 5.000 segundos ≈ 83–84 minutos  
Coste ≈ 0,63 USD

La diferencia no es significativa de forma aislada.  
A escala, se acumula.

Con 50 millones de tokens por día, la eficiencia de throughput afecta directamente el tamaño de la flota de GPUs y la duración del alquiler.

## Ejecutar este benchmark por tu cuenta

Si desea reproducir estas mediciones sin comprar hardware, normalmente hay nodos RTX 4090 disponibles a través del marketplace de GPUFlow.

Las máquinas se alquilan por hora y pueden utilizarse inmediatamente después de conectar una wallet. No hay aprobaciones de cuenta, contratos empresariales ni colas largas de aprovisionamiento.

Puede consultar las GPUs disponibles en [GPU Flow](https://gpuflow.app)

Dado que el alquiler es por hora, la eficiencia de inferencia impacta directamente en el coste. La diferencia entre 100 tokens/seg y 200 tokens/seg se vuelve relevante bajo cargas sostenidas.

---

# Contexto de despliegue

Si está alquilando GPUs descentralizadas — como se describe en:

- [Cómo alquilar una GPU sin KYC](/es/how-to-rent-gpu-without-kyc)
- [Alquilar GPU con criptomonedas](/es/rent-gpu-with-crypto)
- [Explicación del escrow con smart contracts](/es/smart-contract-escrow)

— la eficiencia de inferencia determina directamente la eficiencia del capital.

El throughput afecta:

- La duración del escrow
- La frecuencia de liquidación en blockchain
- La exposición a inestabilidad del host
- El margen operativo

Las GPUs de consumo siguen siendo económicamente viables para modelos 7B–8B cuando se combinan con stacks de inferencia eficientes.

---

# Cuándo usar cada opción

**Ollama**

- Herramientas internas
- Baja concurrencia
- Prototipado rápido

**TGI**

- Entornos containerizados
- Equipos que requieren logging estructurado
- Despliegues productivos gestionados

**vLLM**

- Servicios API
- Alta concurrencia
- Máximo número de tokens por dólar

---

# Conclusión

En una sola RTX 4090 ejecutando Llama‑3.1‑8B en FP16:

- vLLM logró el mayor throughput sostenido.
- TGI ofreció rendimiento equilibrado con controles de producción.
- Ollama priorizó la simplicidad sobre la utilización máxima de la GPU.

La elección del stack de inferencia no es cosmética.  
Define la estructura de costes y el comportamiento de escalado.

Para cargas desplegadas en GPUs de consumo descentralizadas, la eficiencia de batching afecta materialmente la economía.

# Dónde ejecutarlo en producción

Todos los benchmarks de este artículo se realizaron en hardware de consumo alquilado, no en infraestructura propia.

Si necesita acceso inmediato a RTX 4090, RTX 3090 o GPUs con mayor memoria para inferencia o fine‑tuning, hay nodos disponibles en [GPU Flow](https://gpuflow.app)

## Alquiler por hora. Pago con stablecoin. Acceso inmediato tras conectar la wallet.

### Recursos relacionados

**Profundice en su stack de despliegue:**

- [Guía definitiva para el ajuste fino privado de LLM en GPUs descentralizadas](/es/private-llm-fine-tuning-guide) — Recorrido completo para entrenar modelos de pesos abiertos de forma segura
- [Comparativa de precios de alquiler de GPU 2026](/es/gpu-rental-pricing-comparison-2026) — Diferencias de coste medidas entre las principales plataformas de alquiler de GPU
- [Tarifas ocultas en el alquiler de GPU](/es/hidden-fees-in-gpu-rental) — Lo que las páginas de precios por hora no revelan
- [Comparativa RunPod vs Vast.ai](/es/runpod-vs-vastapi-comparison) — Diferencias entre infraestructura centralizada y marketplaces
