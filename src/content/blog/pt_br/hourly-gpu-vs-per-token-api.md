---
title: "GPU por hora ou API por token? Quanto custa de verdade rodar um modelo de 7B–8B"
description: "Uma comparação direta de custo entre alugar uma GPU de consumo por hora e pagar uma API de IA por token, com preços atuais, velocidades medidas e um exemplo prático de 1.000 requisições."
excerpt: "APIs por token e GPUs por hora são cobradas em unidades diferentes. Convertemos as duas para o mesmo trabalho e mostramos quando cada uma sai mais barata."
pubDate: 2026-09-29
locale: "pt_br"
category: "comparisons"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/hourly-gpu-vs-per-token-api-hero.png"
heroImageAlt: "Gráfico com uma linha reta para o preço por hora e uma linha crescente para o preço por token"
faq:
  - question: "Alugar uma GPU por hora é mais barato que uma API por token?"
    answer: "Depende do que você compara. Para modelos abertos populares como o Llama 3.1 8B, as APIs hospedadas por token são mais baratas: a DeepInfra cobra US$ 0,02 por milhão de tokens de entrada e US$ 0,04 por milhão de tokens de saída. Em comparação com o gpt-5-mini (US$ 2,00 por milhão de tokens de saída) ou o Claude Haiku 4.5 (US$ 5,00), qualquer placa alugada, da RTX 3060 à RTX 5090, rodando um modelo aberto de 7B–8B custa menos por token quando fica ocupada. Contra o gpt-4o-mini (US$ 0,60), só as placas mais baratas, como a RTX 3060, saem claramente na frente."
  - question: "Quantos tokens por segundo uma RTX 4090 gera com um modelo de 8B?"
    answer: "O Hardware Corner mediu 104 tokens por segundo em uma RTX 4090 com o Qwen3 8B em quantização de 4 bits e contexto de 16K, uma requisição por vez. O placar do llama.cpp mostra 186 tokens por segundo para o Llama 2 7B, menor, em Q4_0 com contexto curto."
  - question: "Quanto custa um milhão de tokens de saída em uma RTX 4090 alugada?"
    answer: "A US$ 0,35 por hora e cerca de 104 tokens por segundo, uma hora produz cerca de 376.000 tokens, então um milhão de tokens de saída custa cerca de US$ 0,93 de tempo de GPU. Ler o prompt é muito mais rápido do que escrever a resposta, então os tokens de entrada pesam pouco."
  - question: "Quando uma GPU por hora faz mais sentido que uma API?"
    answer: "Quando o modelo de que você precisa não é oferecido por token (seu próprio fine-tune, um modelo da comunidade, uma quantização específica), quando você quer um custo fixo por hora em vez de tokens medidos, ou quando a comparação é com um modelo fechado que cobra US$ 2 ou mais por milhão de tokens de saída."
---

Há duas formas comuns de pagar por um modelo de IA aberto e pequeno, como o Llama 3.1 8B ou o Qwen 2.5 7B:

- **Por token:** uma empresa hospeda o modelo e cobra por cada token que você envia e recebe.
- **Por hora:** você aluga uma GPU que roda o modelo e paga pelo tempo, não importa quantos tokens use.

Os preços parecem impossíveis de comparar: "US$ 0,04 por milhão de tokens" de um lado, "US$ 0,35 por hora" do outro. Este artigo converte os dois para a mesma unidade e faz as contas de um trabalho realista. Todos os preços foram verificados em setembro de 2026; as fontes estão no final.

## Passo 1: qual a velocidade de uma GPU de consumo?

A velocidade que importa é quantos tokens por segundo a GPU gera para uma requisição. Usamos as medições do Hardware Corner, que testou o Qwen3 8B em quantização de 4 bits (Q4_K_XL) com contexto de 16K no llama.cpp, o mesmo motor em que o Ollama se baseia.

| GPU | Tokens por segundo (uma requisição) | Tokens por hora |
| --- | --- | --- |
| RTX 3060 12 GB | 42 | cerca de 151.000 |
| RTX 3090 | 87 | cerca de 315.000 |
| RTX 4090 | 104 | cerca de 376.000 |
| RTX 5090 | 145 | cerca de 523.000 |

Prompts curtos rodam mais rápido. O placar do próprio projeto llama.cpp, com o Llama 2 7B, menor, em Q4_0 e contexto curto, mostra 76, 158, 186 e 290 tokens por segundo para as mesmas quatro placas. Usamos os números mais baixos, que são mais realistas.

Ler o seu prompt é muito mais rápido do que escrever a resposta. O mesmo placar mostra o processamento do prompt a cerca de 2.100 tokens por segundo em uma RTX 3060 e cerca de 12.000 em uma RTX 4090. Então, em uma GPU por hora, prompts longos custam pouco tempo a mais.

## Passo 2: transformar o preço por hora em preço por milhão de tokens

Pegue o preço por hora e divida pelos tokens por hora. Usamos preços típicos sob demanda de sites de aluguel de GPU em setembro de 2026:

| GPU | Preço por hora | Custo por 1 milhão de tokens de saída, com a GPU ocupada |
| --- | --- | --- |
| RTX 3060 12 GB | US$ 0,06 | cerca de US$ 0,40 |
| RTX 3090 | US$ 0,20 | cerca de US$ 0,64 |
| RTX 4090 | US$ 0,35 | cerca de US$ 0,93 |
| RTX 5090 | US$ 0,55 | cerca de US$ 1,05 |

"Com a GPU ocupada" é a parte importante. Esses números supõem que a GPU passe a hora inteira escrevendo. Se ela ficar parada metade do tempo, o custo por token dobra.

## Passo 3: quanto as APIs por token cobram

Preços por milhão de tokens, entrada / saída:

| Modelo | Provedor | Entrada | Saída |
| --- | --- | --- | --- |
| Llama 3.1 8B Instruct Turbo | DeepInfra | US$ 0,02 | US$ 0,04 |
| Gemma 3 12B | DeepInfra | US$ 0,05 | US$ 0,15 |
| Qwen3.5 9B | DeepInfra | US$ 0,10 | US$ 0,15 |
| gpt-4o-mini | OpenAI | US$ 0,15 | US$ 0,60 |
| gpt-5-mini | OpenAI | US$ 0,25 | US$ 2,00 |
| Claude Haiku 4.5 | Anthropic | US$ 1,00 | US$ 5,00 |

Duas coisas chamam a atenção. Modelos abertos hospedados são muito baratos. E modelos fechados pequenos custam de 15 a 125 vezes mais por token de saída do que o modelo aberto de 8B mais barato.

## Passo 4: um trabalho real, com o preço de cada opção

Digamos que você rode 1.000 requisições. Cada uma envia 1.500 tokens (instruções mais um documento) e recebe 500 tokens de volta. São 1,5 milhão de tokens de entrada e 0,5 milhão de tokens de saída.

| Opção | Custo do trabalho | Observações |
| --- | --- | --- |
| Llama 3.1 8B na DeepInfra | cerca de US$ 0,05 | De longe a mais barata |
| gpt-4o-mini | cerca de US$ 0,53 | |
| gpt-5-mini | cerca de US$ 1,38 | |
| Claude Haiku 4.5 | cerca de US$ 4,00 | |
| RTX 3060 alugada, uma requisição por vez | cerca de US$ 0,21 | Cerca de 3,5 horas |
| RTX 3090 alugada | cerca de US$ 0,33 | Cerca de 1,7 hora |
| RTX 4090 alugada | cerca de US$ 0,48 | Cerca de 1,4 hora |
| RTX 5090 alugada | cerca de US$ 0,54 | Cerca de 1 hora |

Como chegamos aos números das GPUs: 500.000 tokens de saída divididos pela velocidade do passo 1, mais 1,5 milhão de tokens de prompt divididos pela velocidade de prompt do placar do llama.cpp, vezes o preço por hora.

## O que isso significa

**Se uma API hospedada oferece o modelo aberto que você quer, ela é a forma mais barata de rodá-lo.** Para o Llama 3.1 8B, nada que você alugue por hora chega perto de US$ 0,04 por milhão de tokens de saída.

**Contra a maioria dos modelos fechados pequenos, uma GPU por hora sai mais barata, se o modelo aberto for bom o bastante para a sua tarefa.** Uma RTX 3060 ocupada custa menos por token de saída do que o gpt-4o-mini, e uma RTX 3090 custa mais ou menos o mesmo; quando os tokens de entrada entram na conta, como no trabalho acima, as duas saem mais baratas. Todas as placas da tabela custam menos do que o gpt-5-mini ou o Claude Haiku. Se um modelo aberto de 7B–8B dá respostas boas o suficiente depende do trabalho: costuma ir bem em classificação, extração de campos, resumos e reescritas curtas, e é mais fraco em raciocínios longos.

**Uma GPU por hora faz sentido quando:**

- O modelo de que você precisa não está em nenhuma API por token: seu próprio fine-tune, um modelo da comunidade ou uma quantização específica.
- Você quer um custo fixo por hora em vez de uma conta medida, por exemplo durante testes ou em um processamento em lote que roda durante a noite.
- Seus prompts são longos. Em uma GPU alugada por hora, os tokens de entrada custam só os poucos segundos que ela leva para lê-los.
- Você quer testar um modelo em hardware real antes de comprar uma placa.

**Pagar por token faz sentido quando:**

- Seu tráfego chega em picos com longos intervalos. Você não paga nada enquanto espera.
- Você precisa de muitas requisições ao mesmo tempo. Uma única GPU de consumo roda uma requisição por vez por padrão: o `OLLAMA_NUM_PARALLEL` do Ollama vem configurado como 1.
- O modelo que você quer está hospedado e o preço dele serve para você.

## Privacidade conta nos dois lados

Com uma API por token, [seus prompts vão para a empresa da API](/pt_br/why-corporate-policies-banning-chatgpt/). Com uma GPU alugada, eles vão para a máquina que você alugou. No GPUFlow, por exemplo, o modelo roda no computador do próprio provedor, então prompts e respostas passam por ele. Nossa documentação diz isso claramente: não envie senhas, números de cartão nem nada que você não compartilharia com um desconhecido. Nenhuma das duas opções substitui rodar o modelo no seu próprio hardware quando os dados são realmente sensíveis.

## Como testar isso no GPUFlow

No GPUFlow você aluga uma GPU por um número de horas e recebe uma chave de API que funciona como uma chave da OpenAI. A cobrança é por segundo e, se você encerrar antes, o tempo não usado volta para os seus créditos. Para medir o seu próprio custo por token:

1. Alugue por uma hora uma GPU que rode o modelo que você quer.
2. Aponte o seu script para `https://gpuflow.app/v1` com a sua chave ([como fazer](https://docs.gpuflow.app/pt-br/renters/api-quickstart/)).
3. Conte os tokens que você recebeu e divida o que pagou por eles.

Dez minutos de tráfego real dizem mais do que qualquer tabela.

## Artigos relacionados

- [Quanto custa de verdade alugar uma GPU: o que o preço por hora não mostra](/pt_br/hidden-fees-in-gpu-rental/)
- [Como usar uma chave de API compatível com a OpenAI no Open WebUI, Continue, LangChain e outros](/pt_br/use-openai-compatible-api-key-in-apps/)
- [Ollama vs vLLM vs TGI: benchmark de inferência na RTX 4090](/pt_br/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/)

## Fontes

Tudo verificado em setembro de 2026.

- Velocidades das GPUs, Qwen3 8B Q4_K_XL com contexto de 16K: [ranking de GPUs do Hardware Corner](https://www.hardware-corner.net/gpu-ranking-local-llm/) (atualizado em 9 de dezembro de 2025)
- Placar CUDA do llama.cpp, Llama 2 7B Q4_0: [github.com/ggml-org/llama.cpp/discussions/15013](https://github.com/ggml-org/llama.cpp/discussions/15013)
- Requisições paralelas no Ollama: [docs.ollama.com/faq](https://docs.ollama.com/faq)
- Preços da DeepInfra: [deepinfra.com/pricing](https://deepinfra.com/pricing)
- Preços da OpenAI: [gpt-4o-mini](https://developers.openai.com/api/docs/models/gpt-4o-mini), [gpt-5-mini](https://developers.openai.com/api/docs/models/gpt-5-mini)
- Preços da Anthropic: [preços em platform.claude.com](https://platform.claude.com/docs/en/about-claude/pricing)
- Faixas de preço de aluguel de GPU: [documentação do GPUFlow, Como definir o preço da sua GPU](https://docs.gpuflow.app/pt-br/providers/pricing/)
