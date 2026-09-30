---
title: "Ollama vs vLLM vs TGI numa RTX 4090: o que mostram os benchmarks"
description: "Ollama, vLLM e Hugging Face TGI com um modelo 8B numa RTX 4090: throughput sob carga com fontes, VRAM, quantização, APIs compatíveis com a OpenAI e o status de manutenção do TGI."
excerpt: "Com uma requisição por vez, os motores rodam mais ou menos na mesma velocidade numa RTX 4090. Com muitos usuários ao mesmo tempo, o vLLM dispara na frente. O TGI agora está em modo de manutenção. Números publicados, fontes e o que escolher."
pubDate: 2026-02-25
updatedDate: 2026-09-30
locale: "pt_br"
category: "benchmarks"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/rtx4090-inference-benchmark-hero.png"
heroImageAlt: "Benchmark de inferência numa GPU RTX 4090 exibido num terminal com métricas de desempenho"
faq:
  - question: "O vLLM é mais rápido que o Ollama numa RTX 4090?"
    answer: "Só quando muitas requisições rodam ao mesmo tempo. Num teste de setembro de 2026 do ComputingForGeeks com Qwen2.5-7B em 4 bits, os dois geraram cerca de 174 tokens por segundo com uma única requisição numa RTX 4090. Com 64 requisições simultâneas, o vLLM chegou a 6.623 tokens por segundo no total e o Ollama a 2.018."
  - question: "O Hugging Face TGI ainda recebe manutenção?"
    answer: "Só o mínimo. A documentação do TGI diz que ele está em modo de manutenção e só aceita pequenas correções de bugs e mudanças na documentação, e o repositório no GitHub foi arquivado como somente leitura em 21 de março de 2026. A Hugging Face recomenda vLLM ou SGLang no lugar dele, ou llama.cpp e MLX para uso local."
  - question: "Quanta VRAM o vLLM usa com um modelo 8B?"
    answer: "Por padrão, o vLLM reserva 90% da memória da GPU (gpu-memory-utilization 0.9), cerca de 21,6 GB numa RTX 4090 de 24 GB, qualquer que seja o tamanho do modelo. O que os pesos não usam vira KV cache para requisições simultâneas."
  - question: "O Ollama consegue atender vários usuários ao mesmo tempo?"
    answer: "Consegue, mas o padrão é uma requisição por vez por modelo (OLLAMA_NUM_PARALLEL=1). Dá para aumentar, e cada slot paralelo acrescenta a sua própria memória de contexto. Os benchmarks publicados mostram o Ollama escalando pior que o vLLM com muita concorrência."
  - question: "Ollama, vLLM e TGI têm APIs compatíveis com a OpenAI?"
    answer: "Têm. Os três servem /v1/chat/completions. O Ollama e o vLLM também servem completions, embeddings e a Responses API; a Messages API do TGI, compatível com a OpenAI, existe desde a versão 1.4.0."
  - question: "Dá para rodar o Llama 3.1 8B em FP16 numa GPU de 24 GB?"
    answer: "Dá. 8,03 bilhões de parâmetros a 2 bytes cada são cerca de 16,1 GB de pesos, o que cabe em 24 GB com espaço para um KV cache modesto. A maioria das pessoas que servem modelos numa única placa de consumo usa pesos de 4 ou 8 bits para sobrar mais espaço para contexto e usuários simultâneos."
---

Numa única RTX 4090 servindo um modelo de 7B–8B, o Ollama e o vLLM rodam mais ou menos na mesma velocidade com uma requisição por vez. A diferença aparece quando muitas requisições chegam juntas: num teste publicado em setembro de 2026, com 64 requisições simultâneas, o vLLM entregou cerca de três vezes o throughput total do Ollama. O Hugging Face TGI ainda funciona, mas está em modo de manutenção desde que o repositório foi arquivado em março de 2026, e a própria Hugging Face agora indica o vLLM e o SGLang.

Então a escolha depende de quantas pessoas batem no modelo ao mesmo tempo. Um usuário, um script ou uma ferramenta interna pequena: Ollama, porque dá menos trabalho. Uma API pública ou jobs em lote com muitas requisições em andamento: vLLM. Um deploy novo em TGI: eu não começaria um.

## De onde vêm os números

Uma versão anterior desta página mostrava números de throughput, latência e VRAM apresentados como medições nossas numa RTX 4090. Não conseguimos rastreá-los até uma execução reproduzível nem até uma fonte publicada, então os removemos. Um motivo para desconfiar: os números antigos de fluxo único em FP16 passavam do que a largura de banda de memória de uma RTX 4090 permite (veja a próxima seção).

Todo número abaixo agora é atribuído a quem o publicou, com o hardware e o modelo usados. Onde ninguém publicou uma comparação limpa na RTX 4090 (o TGI, por exemplo), eu digo isso em vez de preencher a lacuna.

As fontes principais:

- **ComputingForGeeks, 18 de setembro de 2026.** Ollama, vLLM e llama.cpp numa RTX 4090, numa L40S e numa RTX 5090. Modelo: Qwen2.5-7B-Instruct, AWQ em 4 bits no vLLM e GGUF Q4_K_M no Ollama e no llama.cpp. Prompt fixo de 512 tokens, temperatura 0, até 256 tokens de saída, contexto de 4.096 tokens por slot, 64 slots paralelos.
- **Red Hat Developer, 8 de agosto de 2025.** Ollama 0.9.2 vs vLLM 0.9.1 numa A100 40 GB, Llama 3.1 8B Instruct em FP16, de 1 a 256 usuários simultâneos, medido com GuideLLM.
- **BentoML, 5 de junho de 2024.** vLLM 0.4.2, TGI 2.0.4 e outros numa A100 80 GB com Llama 3 8B Instruct.
- **Placar CUDA do llama.cpp.** Velocidade de fluxo único do Llama 2 7B Q4_0 em muitas placas, incluindo a RTX 4090.

Só a primeira foi feita numa RTX 4090 com todos os motores deste post, menos o TGI. As outras mostram o mesmo padrão em placas de data center.

## Uma requisição: a placa define o teto

Quando uma GPU gera tokens para uma única requisição, ela precisa ler da memória todos os pesos do modelo a cada token. Por isso quem define o limite é a largura de banda da memória, não o motor.

A RTX 4090 tem 24 GB de GDDR6X a 1.008 GB/s. O Llama 3.1 8B tem 8,03 bilhões de parâmetros.

- Em FP16, isso dá 8,03 × 2 bytes ≈ 16,1 GB de pesos. 1.008 ÷ 16,1 ≈ **63 tokens por segundo**, no máximo, para uma requisição.
- A tag padrão `llama3.1:8b` do Ollama é Q4_K_M, um download de 4,9 GB. 1.008 ÷ 4,9 ≈ **205 tokens por segundo**, no máximo.

Os motores reais ficam abaixo desses tetos. O placar do llama.cpp mostra uma RTX 4090 gerando 186 tokens por segundo com o Llama 2 7B em Q4_0 (189 com flash attention). O ComputingForGeeks mediu cerca de 174 tokens por segundo com uma única requisição no Qwen2.5-7B em 4 bits, e achou vLLM, llama.cpp e Ollama "praticamente" iguais na 4090. (Na L40S e na RTX 5090, a versão do Ollama que eles usaram decodificava a cerca de metade da velocidade do llama.cpp, então confira a sua placa e a sua versão.)

Para um usuário por vez, escolha o motor pela conveniência e a quantização pela velocidade. Passar de FP16 para 4 bits mais ou menos triplica o teto. Trocar de motor quase não mexe nele.

## Muitas requisições: o batching decide

Com muitas requisições em andamento, a GPU pode ler os pesos uma vez e usá-los para um lote inteiro de requisições. Agora o que importa é o quanto o motor sabe montar esses lotes e como ele gerencia o KV cache (a memória de cada requisição com a conversa até ali).

<figure>
<svg viewBox="0 0 720 310" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">Gráfico de barras do throughput total numa RTX 4090 com 64 requisições simultâneas: vLLM 6.623, llama.cpp 2.391, Ollama 2.018 tokens por segundo</title>
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
<text x="410" y="256" text-anchor="middle" fill="#64748b" font-size="13">Tokens de saída por segundo no total, 64 requisições simultâneas</text>
<text x="360" y="290" text-anchor="middle" fill="#1e1b4b" font-size="14">Uma requisição por vez: cerca de 174 tokens por segundo nos três</text>
</svg>
<figcaption>RTX 4090, Qwen2.5-7B-Instruct em 4 bits (AWQ no vLLM, GGUF Q4_K_M nos outros), 64 requisições simultâneas. Números do ComputingForGeeks, setembro de 2026; barras em escala. O TGI não fez parte deste teste.</figcaption>
</figure>

Na RTX 4090, o vLLM serviu 6.623 tokens por segundo no total com 64 requisições, o servidor do llama.cpp 2.391 e o Ollama 2.018. O Ollama foi configurado de forma justa para o teste: `OLLAMA_NUM_PARALLEL=64`, `num_ctx 4096` e flash attention ligado. O vLLM rodou com `--quantization awq_marlin --max-model-len 4096 --gpu-memory-utilization 0.90`. Os autores também relataram tempo até o primeiro token de cerca de 8 a 12 ms no llama.cpp e de 16 a 25 ms no vLLM, com o Ollama mais alto na L40S e na RTX 5090.

O teste da Red Hat numa A100 aponta na mesma direção com pesos em FP16. O vLLM chegou a um pico de 793 tokens por segundo; o Ollama, com as configurações padrão, fez 41. Depois de aumentar o limite de paralelismo do Ollama para 32, "o maior valor estável", ele ainda não alcançou o vLLM em nenhum nível de concorrência. O tempo até o primeiro token "subiu drasticamente com mais usuários", e a latência entre tokens teve "picos enormes" na carga máxima.

Dois cuidados antes de citar isso para alguém. Primeiro, a comparação do ComputingForGeeks não é perfeitamente equivalente: o vLLM rodou pesos AWQ, os outros GGUF, e as versões são diferentes. Segundo, esses são totais somando todas as requisições. Cada um dos 64 usuários vê cerca de 6.623 ÷ 64 ≈ 103 tokens por segundo no vLLM, o que ainda é bem utilizável, e cerca de 2.018 ÷ 64 ≈ 32 no Ollama.

## Onde está o TGI

O Text Generation Inference era o servidor de produção da Hugging Face, com continuous batching, Flash Attention e Paged Attention, paralelismo de tensores, métricas do Prometheus e tracing com OpenTelemetry. Tecnicamente, estava na mesma categoria do vLLM.

O status mudou. A documentação do TGI agora abre com: "o text-generation-inference agora está em modo de manutenção. Daqui em diante, vamos aceitar pull requests de pequenas correções de bugs, melhorias na documentação e tarefas leves de manutenção." Ela recomenda "vllm, SGLang, além de motores locais com intercompatibilidade, como llama.cpp ou MLX." O repositório no GitHub foi arquivado e passou a ser somente leitura em 21 de março de 2026.

Não encontrei nenhum benchmark recente publicado do TGI numa RTX 4090. A comparação séria mais próxima é a da BentoML numa A100 80 GB, de junho de 2024: com o Llama 3 8B, o vLLM chegou a "2300-2500 tokens por segundo, parecido com o TGI", e teve o melhor tempo até o primeiro token em todos os níveis de concorrência testados. Isso foi há dois anos e muitas versões dos dois motores, então trate como história.

Se o TGI já roda o seu tráfego de produção, ele vai continuar funcionando. Num deploy novo, você estaria escolhendo um servidor que não vai receber novas arquiteturas de modelo nem trabalho de desempenho. Numa RTX 4090, o vLLM cobre tudo o que o TGI fazia.

## VRAM numa placa de 24 GB

Os motores tratam a memória de formas muito diferentes, e isso afeta o que mais pode dividir a placa.

**O vLLM pega a maior parte da placa logo de cara.** O padrão de `--gpu-memory-utilization` é 0.9, então numa RTX 4090 de 24 GB ele reserva cerca de 21,6 GB na inicialização, qualquer que seja o tamanho do modelo. Tudo o que os pesos não usam vira KV cache. Com o Llama 3.1 8B em FP16 (cerca de 16,1 GB), sobram uns 5,5 GB para KV cache, ativações e CUDA graphs, o que limita o tamanho do contexto e quantas requisições cabem ao mesmo tempo. Com pesos AWQ em 4 bits (a versão do ComputingForGeeks tinha cerca de 5,6 GB), a maior parte dos 21,6 GB vai para o KV cache, e é assim que ele mantém 64 requisições rodando. Não conte com rodar um segundo programa de GPU ao lado dele, a não ser que você baixe essa fração.

**O Ollama aloca por modelo e por contexto.** Um modelo `llama3.1:8b` Q4_K_M tem 4,9 GB, mais o KV cache da janela de contexto. O Ollama escolhe o contexto padrão pela sua VRAM: 4k abaixo de 24 GiB, 32k de 24 a 48 GiB, 256k a partir de 48 GiB. Uma RTX 4090 fica exatamente na linha dos 24 GiB (o nvidia-smi informa um pouco menos que 24 GiB), então rode `ollama ps` para ver qual contexto você recebeu de fato, ou defina você mesmo. Os slots paralelos multiplicam isso: o exemplo da documentação é que "um contexto de 2K com 4 requisições paralelas resulta num contexto de 8K e em alocação adicional de memória". Se a memória está apertada, quantizar o KV cache ajuda: `q8_0` usa cerca de metade da memória do `f16` padrão, e `q4_0` cerca de um quarto. O Ollama também consegue manter até três modelos carregados por GPU por padrão, se couberem, o que serve bem para uma placa que alterna entre modelos. Para saber quais modelos cabem em placas de 8, 12, 16 e 24 GB, veja [quais modelos de IA cabem na VRAM da sua GPU](/pt_br/which-ai-models-fit-your-gpu-vram/).

**O TGI** também pré-aloca memória para o continuous batching, como o vLLM. Não encontrei um número atual e citável de VRAM para um modelo 8B numa 4090, então não vou dar um.

## Quantização e formatos de modelo

| | Ollama | vLLM | TGI |
| --- | --- | --- | --- |
| **Formato principal** | GGUF (ex.: Q4_K_M) | Safetensors da Hugging Face | Safetensors da Hugging Face |
| **Opções de 4 bits** | Variantes GGUF Q4 | AWQ, GPTQ, bitsandbytes, INT4 W4A16 | AWQ, GPTQ, Marlin, EXL2, bitsandbytes NF4/FP4 |
| **8 bits / FP8** | GGUF Q8_0 | FP8 W8A8 em Ada (RTX 4090) e Hopper; INT8 | bitsandbytes 8 bits, EETQ, fp8 |
| **GGUF** | Nativo | Suportado | Não listado |
| **Quantização do KV cache** | q8_0, q4_0 | Sim | Não abordado aqui |

A RTX 4090 é uma placa Ada (SM 8.9), então o caminho FP8 do vLLM funciona nela. Pesos em FP8 ocupam metade da memória do FP16: cerca de 8 GB para um modelo 8B, um meio-termo entre FP16 e 4 bits numa única 4090.

A biblioteca de modelos do Ollama já vem com tags GGUF pré-quantizadas, então você quase nunca pensa nisso: `ollama pull llama3.1:8b` traz o Q4_K_M. No vLLM, você escolhe um checkpoint pré-quantizado na Hugging Face ou passa você mesmo uma flag de quantização.

## Servidores compatíveis com a OpenAI e instalação

Os três oferecem uma API HTTP no estilo da OpenAI, então os SDKs da OpenAI e a maioria das ferramentas de chat funcionam trocando a URL base.

| | Ollama | vLLM | TGI |
| --- | --- | --- | --- |
| **Endereço padrão** | `localhost:11434/v1` | `localhost:8000/v1` | Porta 80 do contêiner (muitas vezes mapeada para 8080) |
| **Chat completions** | Sim | Sim | Sim (Messages API, desde a 1.4.0) |
| **Outros endpoints da OpenAI** | completions, models, embeddings, responses | completions, embeddings, responses, audio | Não abordado aqui |
| **Instalação** | Um script | Pacote pip | Imagem Docker |

Para colocar um modelo 8B no ar, segundo a documentação de cada projeto:

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

O Ollama é, de longe, o que dá menos trabalho. Ele cuida dos downloads, dos arquivos quantizados, de carregar e descarregar modelos, e funciona igual num notebook e num servidor alugado. A camada OpenAI do Ollama tem lacunas: não há `logprobs` nem `tool_choice` em chat completions, e as imagens precisam ir em base64, não como URL. O vLLM exige um ambiente CUDA e Python funcionando e mais flags para ajustar, mas é o motor que a Hugging Face agora recomenda no lugar do TGI. O TGI é fácil se você já usa Docker, com a ressalva sobre manutenção acima.

## Qual motor para qual trabalho

**Ollama** para uma pessoa, um script, um assistente de programação, uma ferramenta interna com poucos usuários ou uma máquina que alterna entre vários modelos. A instalação leva minutos, e a velocidade com uma requisição numa 4090 é tão boa quanto a de qualquer outro.

**vLLM** quando muitas requisições chegam ao mesmo tempo: uma API pública, um produto de chat multiusuário ou jobs em lote que você pode rodar 32 ou 64 de cada vez. Os números publicados mostram cerca de três vezes o throughput total do Ollama numa RTX 4090 com 64 requisições simultâneas, e muito mais numa A100. Ele também tem o suporte mais amplo a quantização e a APIs.

**TGI** só se você já usa. Para trabalho novo, a recomendação da própria Hugging Face é vLLM ou SGLang.

Quando você aluga por hora, o custo sai do throughput. Pense em um milhão de tokens de saída numa RTX 4090 a US$ 0,31 por hora, o menor preço sob demanda do Vast.ai listado pelo getdeploying.com em setembro de 2026, usando os números do ComputingForGeeks:

- Uma requisição por vez, 174 tokens/s: 1.000.000 ÷ 174 ≈ 5.750 s ≈ 1,6 hora ≈ **US$ 0,50**.
- 64 simultâneas no Ollama, 2.018 tokens/s: ≈ 496 s ≈ **US$ 0,04**.
- 64 simultâneas no vLLM, 6.623 tokens/s: ≈ 151 s ≈ **US$ 0,01**.

Essas contas supõem a GPU ocupada o tempo todo. Se você nunca tem mais de uma requisição em andamento, o batching não traz nada e a escolha do motor não muda a sua conta. Se você tem uma fila de trabalho, ela muda a conta em uma ordem de grandeza. A mesma lógica, comparada com APIs cobradas por token, está em [GPU por hora ou API por token](/pt_br/hourly-gpu-vs-per-token-api/).

## Onde o GPUFlow entra

O instalador de provedor do GPUFlow configura o Ollama por padrão e o agente do GPUFlow encaminha as requisições para ele, então a coluna do Ollama acima costuma ser a que vale lá. Você aluga uma chave de API compatível com a OpenAI (`https://gpuflow.app/v1`, com `/v1/chat/completions` e `/v1/models`, com suporte a streaming) para um modelo na GPU do provedor. Você paga por tempo, por segundo com mínimo de 1 minuto, não por token.

O que você não pode fazer no GPUFlow: escolher o motor, mudar as configurações dele ou rodar o seu próprio código. Não há SSH nem shell. Para reproduzir os benchmarks acima ou rodar o vLLM por conta própria, alugue uma máquina em que você possa entrar, no Vast.ai ou no RunPod ([como os dois se comparam](/pt_br/runpod-vs-vastapi-comparison/)). Para usar um modelo servido pelo Ollama a partir de um app, sem instalar nada, veja o [marketplace do GPUFlow](https://gpuflow.app/pt-BR/marketplace) e [como usar a chave nas ferramentas mais comuns](/pt_br/use-openai-compatible-api-key-in-apps/).

Se você fez fine-tuning do seu próprio modelo e está decidindo como servi-lo, o [guia de fine-tuning de LLM privado](/pt_br/private-llm-fine-tuning-guide/) cobre a etapa anterior a esta.

## Fontes

Tudo verificado em setembro de 2026.

- Ollama vs vLLM vs llama.cpp na RTX 4090, L40S e RTX 5090: [ComputingForGeeks](https://computingforgeeks.com/ollama-vs-vllm-vs-llama-cpp/) (18 de setembro de 2026)
- Ollama vs vLLM na A100 40 GB: [Red Hat Developer](https://developers.redhat.com/articles/2025/08/08/ollama-vs-vllm-deep-dive-performance-benchmarking) (8 de agosto de 2025)
- vLLM, TGI e outros na A100 80 GB: [BentoML, Benchmarking LLM Inference Backends](https://www.bentoml.com/blog/benchmarking-llm-inference-backends) (5 de junho de 2024)
- Placar CUDA do llama.cpp: [github.com/ggml-org/llama.cpp/discussions/15013](https://github.com/ggml-org/llama.cpp/discussions/15013)
- Memória e largura de banda da RTX 4090: [análise da TechPowerUp](https://www.techpowerup.com/review/nvidia-geforce-rtx-4090-founders-edition/)
- Parâmetros e licença do Llama 3.1 8B: [model card na Hugging Face](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
- Ollama: [FAQ (requisições paralelas, KV cache)](https://docs.ollama.com/faq), [tamanho do contexto](https://docs.ollama.com/context-length), [compatibilidade com a OpenAI](https://docs.ollama.com/api/openai-compatibility), [tag llama3.1:8b](https://ollama.com/library/llama3.1:8b)
- vLLM: [servidor compatível com a OpenAI](https://docs.vllm.ai/en/latest/serving/online_serving/openai_compatible_server/), [quantização](https://docs.vllm.ai/en/latest/features/quantization/index.html), [argumentos do motor (gpu-memory-utilization)](https://docs.vllm.ai/en/v0.6.4/models/engine_args.html)
- TGI: [documentação e aviso de manutenção](https://huggingface.co/docs/text-generation-inference/en/index), [repositório no GitHub (arquivado)](https://github.com/huggingface/text-generation-inference), [Messages API](https://huggingface.co/docs/text-generation-inference/en/messages_api), [quantização](https://huggingface.co/docs/text-generation-inference/en/conceptual/quantization)
- Preço de aluguel da RTX 4090: [getdeploying.com](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090)
- GPUFlow: [guia rápido da API](https://docs.gpuflow.app/pt-br/renters/api-quickstart/), [primeiros passos para provedores](https://docs.gpuflow.app/pt-br/providers/getting-started/)
