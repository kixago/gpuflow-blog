---
title: "Ollama vs vLLM vs TGI: benchmark de inferência na RTX 4090 (medido, não prometido)"
description: "Um benchmark controlado na RTX 4090 comparando Ollama, vLLM e Hugging Face TGI na inferência do Llama‑3.1‑8B. Throughput, latência, uso de VRAM e custo por token."
excerpt: "Benchmark medido de Ollama, vLLM e TGI em uma única RTX 4090 com Llama‑3.1‑8B. Throughput real, latência real e o impacto real no custo."
pubDate: 2026-02-25
updatedDate: 2026-09-29
locale: "pt_br"
category: "benchmarks"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/rtx4090-inference-benchmark-hero.png"
heroImageAlt: "Benchmark de inferência na GPU RTX 4090 exibido em um terminal com métricas de desempenho"
faq:
  - question: "Qual servidor de inferência é o mais rápido em uma RTX 4090 com Llama-3.1-8B?"
    answer: "Nos testes medidos em FP16 em uma RTX 4090, o vLLM teve o maior throughput sustentado sob carga concorrente, chegando a aproximadamente 185 a 215 tokens por segundo com oito fluxos. O TGI entregou de 150 a 176 tokens por segundo, e o Ollama ficou em média entre 95 e 108 tokens por segundo nas mesmas condições."

  - question: "O vLLM usa mais VRAM que o Ollama ou o TGI?"
    answer: "O vLLM usou aproximadamente 20 a 22GB de VRAM servindo o Llama-3.1-8B em FP16. O TGI consumiu uma faixa parecida, de 21 a 23GB. O Ollama usou menos VRAM no geral, normalmente entre 14 e 17GB, mas não alcançou o mesmo throughput sob carga concorrente."

  - question: "O Ollama serve para cargas de inferência em produção?"
    answer: "O Ollama serve para ambientes de desenvolvimento e ferramentas internas com pouca concorrência. Nos testes, ele não escalou tão bem quanto o vLLM ou o TGI com oito fluxos de requisições simultâneos. Para APIs em produção com tráfego constante, um servidor otimizado para batching contínuo costuma ser mais eficiente."

  - question: "Quanto custa rodar inferência do Llama-3.1-8B em uma RTX 4090?"
    answer: "Com um preço médio de aluguel de aproximadamente 0,45 USD por hora, gerar 500.000 tokens com o vLLM levou cerca de 41 a 42 minutos, a um custo aproximado de 0,31 USD. Com o Ollama, a mesma carga levou aproximadamente 83 a 84 minutos, a um custo aproximado de 0,63 USD. Os custos reais variam conforme a carga e o preço do aluguel."

  - question: "Quais configurações de prompt e de geração foram usadas neste benchmark?"
    answer: "O benchmark usou um prompt de entrada de 512 tokens e gerou 128 tokens por requisição, com decodificação greedy e temperatura zero. Todas as medições foram feitas depois do aquecimento do modelo, com oito fluxos de requisições simultâneos e sem decodificação especulativa."

  - question: "Posso reproduzir este benchmark de inferência na RTX 4090?"
    answer: "Sim. O artigo traz as especificações de hardware, a versão do CUDA, a versão do driver, os parâmetros de decodificação e a configuração de concorrência. Rodando o Llama-3.1-8B em FP16 em uma única RTX 4090, com o mesmo tamanho de prompt e a mesma concorrência, você consegue resultados comparáveis."
---

Rodar o seu próprio modelo é só metade da equação.

Depois do fine-tuning, como mostramos no nosso [Guia de fine-tuning de LLM privado](/pt_br/private-llm-fine-tuning-guide/), a próxima decisão é operacional: como servir o modelo de forma eficiente?

A inferência determina:

- O custo por token
- A latência sob carga
- A eficiência de uso da GPU
- Se hardware de consumo é viável em produção

Este benchmark compara três stacks de inferência muito usados:

- Ollama
- vLLM
- Hugging Face Text Generation Inference (TGI)

O objetivo não é preferência. O objetivo é medição.

---

## Ambiente de teste

**Hardware**

- GPU: NVIDIA RTX 4090 (24GB de VRAM)
- CPU: processador de consumo classe Ryzen com 16 núcleos
- RAM: 64GB DDR5
- Armazenamento: SSD NVMe
- CUDA: 12.1
- Driver NVIDIA: 550+

**Modelo**

- `meta-llama/Llama-3.1-8B`
- Precisão: FP16 (sem quantização de 4 bits)
- Janela de contexto: 4096 tokens

**Condições do benchmark**

- Prompt de entrada de 512 tokens
- Geração de saída de 128 tokens
- Decodificação greedy (temperatura = 0)
- Sem decodificação especulativa
- Sem paralelismo de tensores
- Apenas warm start (modelo pré-carregado antes da medição)
- 8 fluxos de requisições simultâneos (quando suportado)

Todos os testes rodaram em uma máquina limpa, sem cargas em segundo plano. Cada medição é a média de cinco execuções.

---

![Terminal mostrando métricas estruturadas do benchmark de inferência na RTX 4090](../_images/rtx4090-inference-terminal-results.png)

---

## Resultados

### 1. Ollama

O Ollama prioriza a simplicidade. A instalação é mínima, e os modelos são baixados automaticamente.

```bash
ollama run llama3
```

Há pouca configuração para o comportamento de batching ou a estratégia de agendamento.

#### Desempenho medido (RTX 4090, FP16)

- **Throughput com um fluxo:** 62–74 tokens/s
- **Throughput com 8 fluxos:** 95–108 tokens/s
- **Latência do primeiro token:** 720–980 ms
- **Uso de VRAM observado:** 14–17GB

#### Observações

- O uso da GPU oscilou sob concorrência.
- O throughput deixou de escalar de forma linear acima de 4 fluxos.
- Não há controles expostos para otimização avançada de batching.

O Ollama funciona bem para desenvolvimento local e serviços com pouco tráfego. Sob carga concorrente constante, ele não satura totalmente a GPU.

---

### 2. vLLM

O vLLM foi feito para throughput. Sua implementação de PagedAttention melhora a eficiência do KV cache com requisições simultâneas.

Instalação:

```bash
pip install vllm
```

Inicialização:

```bash
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-3.1-8B \
  --dtype float16
```

#### Desempenho medido (RTX 4090, FP16)

- **Throughput com um fluxo:** 92–104 tokens/s
- **Throughput com 8 fluxos:** 185–215 tokens/s
- **Latência do primeiro token:** 360–480 ms
- **Uso de VRAM observado:** 20–22GB

#### Observações

- O uso da GPU ficou acima de 95% sob carga.
- O batching contínuo melhorou a eficiência de escala.
- A latência se manteve estável com fluxos simultâneos.

O vLLM teve o maior throughput sustentado por hora de aluguel.

---

### 3. Hugging Face Text Generation Inference (TGI)

O TGI é um servidor de inferência para produção distribuído em contêiner.

```bash
docker run --gpus all \
  -p 8080:80 \
  ghcr.io/huggingface/text-generation-inference:latest \
  --model-id meta-llama/Llama-3.1-8B
```

#### Desempenho medido (RTX 4090, FP16)

- **Throughput com um fluxo:** 78–88 tokens/s
- **Throughput com 8 fluxos:** 150–176 tokens/s
- **Latência do primeiro token:** 510–690 ms
- **Uso de VRAM observado:** 21–23GB

#### Observações

- O desempenho foi consistente e previsível.
- O throughput escalou melhor que o do Ollama, mas abaixo do vLLM.
- A sobrecarga operacional é maior por causa do runtime de contêiner.

O TGI oferece controles e monitoramento para produção, mas não extrai o máximo de throughput de uma única 4090.

---

![Saída do nvidia-smi mostrando o uso da GPU durante inferência concorrente](../_images/rtx4090-nvidia-smi-inference-load.png)

---

## Comparação direta

| Stack  | Um fluxo      | 8 fluxos    | Primeiro token | VRAM    | Saturação da GPU |
| ------ | ------------- | ----------- | -------------- | ------- | ---------------- |
| Ollama | 62–74 t/s     | 95–108 t/s  | 720–980ms      | 14–17GB | Parcial          |
| TGI    | 78–88 t/s     | 150–176 t/s | 510–690ms      | 21–23GB | Alta             |
| vLLM   | 92–104 t/s    | 185–215 t/s | 360–480ms      | 20–22GB | Muito alta       |

---

## Impacto no custo em GPUs alugadas

Nos marketplaces de GPU, o aluguel de uma RTX 4090 custava cerca de US$ 0,30–0,46 por hora em setembro de 2026, dependendo da plataforma e da demanda. Veja a análise detalhada em:

- [Comparação de preços de aluguel de GPU em 2026](/pt_br/gpu-rental-pricing-comparison-2026/)
- [O custo real de alugar uma GPU](/pt_br/hidden-fees-in-gpu-rental/)

Considere:

- Aluguel de US$ 0,45/hora
- 500.000 tokens gerados
- 8 fluxos simultâneos

Usando o throughput mediano medido:

**vLLM (~200 tokens/s)**  
500.000 / 200 = 2.500 segundos ≈ 41–42 minutos  
Custo ≈ US$ 0,31

**Ollama (~100 tokens/s)**  
500.000 / 100 = 5.000 segundos ≈ 83–84 minutos  
Custo ≈ US$ 0,63

Isoladamente, a diferença de custo não é dramática. Mas ela se acumula em escala.

Com 50 milhões de tokens por dia, a eficiência de throughput afeta diretamente o tamanho da frota de GPUs e o tempo de aluguel.

### Como rodar este benchmark por conta própria

Para reproduzir essas medições, você precisa de uma máquina que você controle, para instalar e configurar cada servidor. Marketplaces que alugam contêineres com acesso SSH, como a Vast.ai ou a RunPod, servem para isso.

Se você só quer experimentar modelos servidos pelo Ollama em uma RTX 4090 sem configurar nada, no [GPUFlow](https://gpuflow.app/pt-BR/marketplace) os provedores rodam o Ollama e você aluga o acesso por meio de uma chave de API compatível com a OpenAI, com cobrança por segundo. Lá não dá para trocar o servidor de inferência, então ele serve para usar os modelos, não para fazer benchmark dos servidores.

Como o aluguel é por hora, a eficiência da inferência afeta diretamente o custo. A diferença entre 100 tokens/s e 200 tokens/s passa a pesar em cargas contínuas.

---

## Contexto de deploy

Se você aluga GPUs por hora, a eficiência da inferência determina diretamente a eficiência de custo. Fazemos as contas em [GPU por hora ou API por token](/pt_br/hourly-gpu-vs-per-token-api/).

O throughput afeta:

- Quantas horas de aluguel um job precisa
- Quantas GPUs você precisa para o seu tráfego
- A exposição à instabilidade do host
- A margem operacional

GPUs de consumo continuam economicamente viáveis para modelos de 7B–8B quando combinadas com stacks de inferência eficientes.

---

## Quando usar cada um

**Ollama**

- Ferramentas internas
- Pouca concorrência
- Prototipagem rápida

**TGI**

- Ambientes em contêiner
- Equipes que precisam de logs estruturados
- Deploys gerenciados em produção

**vLLM**

- Serviços de API
- Alta concorrência
- Máximo de tokens por dólar

---

## Conclusão

Em uma única RTX 4090 rodando Llama‑3.1‑8B em FP16:

- O vLLM teve o maior throughput sustentado.
- O TGI entregou desempenho equilibrado, com controles para produção.
- O Ollama priorizou a simplicidade em vez do uso máximo da GPU.

A escolha do stack de inferência não é detalhe estético. Ela define a estrutura de custos e o comportamento de escala.

Para cargas rodando em GPUs de consumo alugadas, a eficiência de batching afeta de forma concreta a conta no fim do mês.

## Onde rodar isso em produção

Todos os benchmarks deste artigo foram feitos em hardware de consumo alugado, e não em infraestrutura própria.

Para fazer fine-tuning ou rodar o seu próprio servidor de inferência, alugue uma máquina em que você possa fazer login. Para usar um modelo servido pelo Ollama por meio de uma API, sem nada para configurar, veja o [GPUFlow](https://gpuflow.app/pt-BR/marketplace): os aluguéis são cobrados por segundo e pagos com créditos comprados com cartão.

#### Recursos relacionados

**Aprofunde seu conhecimento sobre o stack de deploy:**

- [O guia definitivo de fine-tuning de LLM privado em GPUs alugadas](/pt_br/private-llm-fine-tuning-guide/) — Passo a passo completo para treinar modelos de pesos abertos com segurança
- [Comparação de preços de aluguel de GPU em 2026](/pt_br/gpu-rental-pricing-comparison-2026/) — Diferenças de custo entre as principais plataformas de aluguel de GPU
- [O custo real de alugar uma GPU](/pt_br/hidden-fees-in-gpu-rental/) — O que as páginas de preço por hora não contam
- [Comparação RunPod vs Vast.ai](/pt_br/runpod-vs-vastapi-comparison/) — Diferenças entre infraestrutura centralizada e marketplace
