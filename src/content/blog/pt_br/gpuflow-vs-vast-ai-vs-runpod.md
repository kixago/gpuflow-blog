---
title: "GPUFlow vs Vast.ai vs RunPod vs SaladCloud: qual combina com o seu trabalho"
description: "Uma comparação lado a lado de quatro plataformas de aluguel de GPU em 2026: o que você realmente recebe, como funciona a cobrança, cobranças extras, formas de pagamento, preços da RTX 4090 e da 3090 e para quais trabalhos cada uma serve."
excerpt: "Essas quatro plataformas alugam GPUs de jeitos muito diferentes. Uma máquina inteira, um contêiner ou uma chave de API: veja qual serve para treino, inferência, processamento em lote e desenvolvimento de apps."
pubDate: 2026-09-29
locale: "pt_br"
category: "comparisons"
featured: true
draft: false
author: "GPUFlow Team"
heroImage: "../_images/gpu-rental-platforms-compared-hero.png"
heroImageAlt: "Três colunas de alturas diferentes representando plataformas de aluguel de GPU"
faq:
  - question: "Qual é a principal diferença entre o GPUFlow, a Vast.ai e a RunPod?"
    answer: "A Vast.ai e a RunPod alugam um contêiner ou uma máquina com acesso por SSH, Jupyter ou algo parecido, então você pode rodar qualquer software. O GPUFlow aluga uma chave de API compatível com a OpenAI para modelos de IA que já estão rodando na GPU de outra pessoa. Você não pode rodar o seu próprio código nele, mas não há nada para configurar."
  - question: "Qual é a mais barata para uma RTX 4090?"
    answer: "Em setembro de 2026, vimos RTX 4090 a partir de cerca de US$ 0,37 por hora na Vast.ai (getdeploying.com), US$ 0,34 na RunPod Community Cloud (esgotada na época), US$ 0,74 na RunPod Secure Cloud e US$ 0,33 na SaladCloud. No GPUFlow, os provedores definem os próprios preços; a faixa típica entre os sites de aluguel vai de US$ 0,30 a US$ 0,46."
  - question: "Posso treinar ou fazer fine-tuning de um modelo no GPUFlow?"
    answer: "Não. O GPUFlow dá acesso de chat a modelos por meio de uma API. Para treinar ou fazer fine-tuning, você precisa de uma plataforma que entregue a máquina, como a Vast.ai, a RunPod ou a TensorDock."
  - question: "Quais plataformas aceitam cripto?"
    answer: "A Vast.ai aceita cripto via BitPay e Crypto.com, a RunPod aceita cripto (com KYC antes do primeiro pagamento em cripto) e a SaladCloud aceita USDC, USDT e RENDER na Solana. O GPUFlow aceita cartões pela Stripe."
---

"Alugar uma GPU" quer dizer coisas diferentes em cada plataforma. Em algumas você recebe um contêiner completo em que faz login. Em outras você recebe um endpoint que roda o seu contêiner por você. No GPUFlow você recebe uma chave de API para um modelo de IA. A escolha certa depende menos do preço e mais do que você está tentando fazer.

Comparamos quatro plataformas que alugam GPUs de consumo como a RTX 3090 e a 4090. Tudo aqui foi verificado em setembro de 2026 na documentação e nas páginas de preços de cada plataforma; as fontes estão no final.

## O que você realmente recebe

| | GPUFlow | Vast.ai | RunPod | SaladCloud |
| --- | --- | --- | --- | --- |
| **O que você aluga** | Uma chave de API para modelos de IA em uma GPU | Um contêiner na máquina de um host | Um pod (contêiner) ou workers serverless | Grupos de contêineres em PCs domésticos |
| **Como você usa** | API compatível com a OpenAI: `/v1/models`, `/v1/chat/completions` | SSH, Jupyter | SSH, JupyterLab, VS Code, proxy web | A API do seu contêiner; SSH nas instâncias em execução |
| **Rodar o seu próprio código** | Não | Sim | Sim | Sim |
| **Configuração antes do primeiro uso** | Nenhuma | Escolher uma imagem, baixar o seu modelo | Escolher um template, baixar o seu modelo | Criar e publicar um contêiner |
| **Onde ficam as GPUs** | Nos computadores dos próprios provedores | De pessoas físicas a data centers | Secure Cloud (data centers) e Community Cloud | PCs de consumo ("Chefs") |

## Dinheiro

| | GPUFlow | Vast.ai | RunPod | SaladCloud |
| --- | --- | --- | --- | --- |
| **Cobrança** | Por segundo, mínimo de 1 minuto | Por segundo, sem mínimo | Por segundo | Por segundo |
| **Armazenamento** | Nenhum | Definido pelo host, também com a máquina parada | US$ 0,10/GB/mês; US$ 0,20 pelo volume de um pod parado | Não informado (o preço da GPU inclui vCPU e RAM) |
| **Transferência de dados** | Nenhuma | Definida pelo host, cada byte | Grátis | Não informada |
| **Para começar** | Recarga mínima de US$ 10, sem taxa | Depósito mínimo de US$ 5 | Pelo menos 1 hora de crédito; US$ 100 com cartão pré-pago | Recargas a partir de US$ 5 |
| **Pagamento** | Cartão (Stripe) | Cartão, BitPay, Crypto.com | Cartão, cripto, faturamento acima de US$ 5.000 | Cartão, cripto na Solana |
| **Validade do crédito** | Não expira; o tempo de aluguel não usado é reembolsado | — | — | 12 meses após a compra |

Um traço significa que não encontramos uma regra na documentação da plataforma.

## Preços das placas mais comuns, setembro de 2026

Por GPU por hora, sob demanda:

| GPU | Vast.ai | RunPod Community / Secure | SaladCloud |
| --- | --- | --- | --- |
| RTX 3090 | a partir de cerca de US$ 0,11 – US$ 0,12 | US$ 0,22 / US$ 0,50 | US$ 0,17 |
| RTX 4090 | a partir de cerca de US$ 0,37 | US$ 0,34 (esgotada) / US$ 0,74 | US$ 0,33 |
| RTX 5090 | cerca de US$ 0,43 | US$ 0,69 (esgotada) / US$ 0,99 | US$ 0,50 |

Os preços da Vast.ai e da SaladCloud vêm do getdeploying.com, porque a tabela de preços da própria Vast não carregou quando verificamos. A SaladCloud também vende, por um preço menor, capacidade de prioridade mais baixa, que pode ser interrompida. A RunPod aumentou os preços da Secure Cloud em 20 de setembro de 2026; os preços da Community Cloud não mudaram.

No GPUFlow, cada provedor define o próprio preço. A faixa típica entre os sites de aluguel é de US$ 0,11 – US$ 0,31 para uma RTX 3090 e de US$ 0,30 – US$ 0,46 para uma RTX 4090, e o formulário de anúncio do GPUFlow mostra aos provedores onde o preço deles fica nessa faixa.

Lembre que não se trata do mesmo produto. Um contêiner de US$ 0,30 que leva 20 minutos para configurar e uma chave de API de US$ 0,35 que funciona na hora custam valores diferentes em um trabalho de uma hora. [Quanto custa de verdade alugar uma GPU](/pt_br/hidden-fees-in-gpu-rental/) passa por todos os extras.

## Qual combina com o seu trabalho

### Treinar ou fazer fine-tuning de um modelo

**Vast.ai ou RunPod.** Você precisa do ambiente inteiro: seu código, seus dados, suas bibliotecas. A Vast.ai costuma ser mais barata; a RunPod tem mais templates prontos e uma opção em data center. Nosso [passo a passo de treino de LoRA de Stable Diffusion](/pt_br/stable-diffusion-lora-training-under-10-dollars/) calcula o preço de um treino típico nas duas. O GPUFlow não faz isso: ele não entrega uma máquina.

### Rodar o seu próprio contêiner em escala

**SaladCloud ou RunPod serverless.** As duas rodam o seu contêiner em várias GPUs e cuidam da escala. O Salad roda em PCs de consumo, então as instâncias podem ser interrompidas e o armazenamento local não persiste; projete o seu trabalho levando isso em conta. O RunPod serverless cobra o tempo de inicialização e um tempo ocioso além do tempo de processamento.

### Chamar um modelo aberto a partir de um app, um script ou uma ferramenta de chat

**GPUFlow**, se algum provedor rodar o modelo que você quer. Você recebe uma chave compatível com a OpenAI, então as bibliotecas da OpenAI, o LangChain, o Open WebUI e a maioria dos apps de chat funcionam só trocando a base URL. Não há servidor para manter, e você paga por segundo pelas horas que reservar. Se encerrar antes, o restante volta para os seus créditos. [Como usar a chave nas suas ferramentas](/pt_br/use-openai-compatible-api-key-in-apps/).

O que o GPUFlow não faz: embeddings, geração de imagens, a Responses API ou rodar o seu próprio código. E o modelo roda no computador do próprio provedor, então seus prompts passam por ele. Não envie nada que você não compartilharia com um desconhecido.

### Testar um modelo antes de comprar uma GPU

**Qualquer uma delas.** No GPUFlow leva poucos minutos e não exige configuração. Na Vast.ai ou na RunPod você também pode testar as configurações do seu próprio servidor de inferência. De um jeito ou de outro, uma hora custa menos que um café.

### Só precisa de tokens baratos de um modelo popular

**Talvez nenhuma delas.** Se uma API hospedada oferece o modelo que você quer, o preço por token pode sair bem mais barato do que alugar uma GPU. Fizemos as contas em [GPU por hora ou API por token](/pt_br/hourly-gpu-vs-per-token-api/).

## Se você quer colocar sua GPU para alugar

| | GPUFlow | Vast.ai | Salad |
| --- | --- | --- | --- |
| **Sistema operacional** | Linux 64 bits com systemd | Ubuntu | Windows 10/11 |
| **O que os locatários acessam** | Seus modelos de IA pelo relay do GPUFlow. [Sem shell, sem portas abertas](/pt_br/is-it-safe-to-rent-out-your-gpu/) | Um contêiner na sua máquina | As cargas de trabalho do Salad |
| **Sua parte** | 88% | A Vast diz que os preços anunciados costumam ficar cerca de 25% acima do que os hosts recebem | Não divulgada |
| **Saques** | Banco pela Stripe, mínimo de US$ 25, US$ 2,50 por saque | Wise, PayPal ou Stripe, mínimo de US$ 20 | PayPal, vale-presentes e mais |

As contas completas para cada placa estão em [quanto sua GPU gamer pode render](/pt_br/how-much-can-you-earn-renting-out-your-gpu/).

## Resumo

- **Precisa de uma máquina?** Vast.ai pelo preço, RunPod pela praticidade e pela opção em data center.
- **Precisa de um serviço de contêineres escalável?** SaladCloud ou RunPod serverless.
- **Precisa de um modelo de IA atrás de uma API no estilo da OpenAI, sem nada para configurar?** GPUFlow.
- **Precisa dos tokens mais baratos de um modelo popular?** Confira primeiro as APIs hospedadas por token.

## Fontes

Tudo verificado em setembro de 2026.

- GPUFlow: [aluguel](https://docs.gpuflow.app/pt-br/renters/getting-started/), [cobrança](https://docs.gpuflow.app/pt-br/renters/billing/), [API](https://docs.gpuflow.app/pt-br/renters/api-quickstart/), [provedores](https://docs.gpuflow.app/pt-br/providers/getting-started/), [como receber](https://docs.gpuflow.app/pt-br/providers/getting-paid/), [faixas de preço](https://docs.gpuflow.app/pt-br/providers/pricing/)
- Vast.ai: [quickstart](https://docs.vast.ai/guides/get-started/quickstart.md), [preços](https://docs.vast.ai/guides/instances/pricing.md), [cobrança](https://docs.vast.ai/documentation/reference/billing), [hospedagem](https://docs.vast.ai/host/hosting-overview.md), [pagamentos aos hosts](https://docs.vast.ai/host/payment.md), [ganhos dos hosts](https://vast.ai/article/how-much-money-can-you-earn-renting-out-your-gpu-on-vast-ai)
- RunPod: [preços](https://www.runpod.io/pricing), [preços de pods](https://docs.runpod.io/pods/pricing), [preços do serverless](https://docs.runpod.io/serverless/pricing), [cobrança](https://docs.runpod.io/references/billing-information), [pods](https://docs.runpod.io/pods/overview)
- Mudança de preço da RunPod Secure Cloud: [usagepricing.com](https://www.usagepricing.com/blueprint/activity/runpod-2026-09-20-secure-cloud-price-hike)
- SaladCloud: [cobrança](https://docs.salad.com/general/explanation/billing.md), [cobrança de contêineres](https://docs.salad.com/container-engine/explanation/billing-pricing/billing.md), [preços por prioridade](https://docs.salad.com/container-engine/explanation/billing-pricing/priority-pricing.md), [SSH](https://docs.salad.com/container-engine/explanation/container-groups/ssh-and-terminal.md), [Salad para hosts](https://salad.com/download/)
- Preços: getdeploying.com para [RTX 3090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-3090), [RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090), [RTX 5090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-5090), [Vast.ai](https://getdeploying.com/vast-ai), [Salad](https://getdeploying.com/salad)
