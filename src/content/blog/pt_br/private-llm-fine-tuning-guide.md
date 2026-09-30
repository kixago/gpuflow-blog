---
title: "Fine-tuning de LLM com privacidade numa GPU alugada: um guia prático"
description: "Quando o fine-tuning vale mais que RAG ou prompt, VRAM do QLoRA por tamanho de modelo, TRL, Unsloth e Axolotl, dados privados em GPU alugada, custos e como servir o modelo."
excerpt: "Um fine-tuning QLoRA de um modelo aberto de 8B cabe numa única GPU alugada de 24 GB e custa cerca de US$ 0,35 a US$ 0,83 por treino. Antes de pagar, confirme que o fine-tuning é a ferramenta certa e planeje como os seus dados continuam seus na máquina de outra pessoa."
pubDate: 2025-02-23
updatedDate: 2026-09-30
locale: "pt_br"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/private-llm-fine-tuning-guide-hero.png"
heroImageAlt: "Ilustração de um dataset privado sendo usado para fazer fine-tuning de um modelo de linguagem num servidor de GPU alugado"
faq:
  - question: "Quanta VRAM é preciso para fazer fine-tuning de um modelo de 7B ou 8B?"
    answer: "Com QLoRA, a tabela de requisitos do Unsloth indica cerca de 5 GB para um modelo de 7B e 6 GB para um de 8B; LoRA comum em 16 bits precisa de cerca de 19 GB e 22 GB. Treinos reais precisam de folga para sequências mais longas e batches maiores, então uma placa de 24 GB, como a RTX 3090 ou a 4090, é a escolha confortável."
  - question: "Devo fazer fine-tuning ou usar RAG?"
    answer: "Use RAG quando o modelo precisa de fatos dos seus documentos, principalmente fatos que mudam. Um estudo de 2024 de Ovadia et al. concluiu que o RAG superou de forma consistente o fine-tuning não supervisionado para adicionar conhecimento. Faça fine-tuning quando precisar de um formato, um tom ou um comportamento de tarefa específica que o prompt não entrega de forma confiável."
  - question: "Quanto custa fazer fine-tuning de um LLM numa GPU alugada?"
    answer: "Um treino QLoRA de um modelo de 8B com 2.000 exemplos leva pouco mais de uma hora, contando a preparação, o que dá cerca de US$ 0,35 numa RTX 4090 do Vast.ai a US$ 0,31/h ou US$ 0,83 pelo preço de tabela do RunPod, de US$ 0,74/h (setembro de 2026). Um treino com 20.000 exemplos leva umas quatro horas, ou de US$ 1,24 a US$ 2,97."
  - question: "O host da GPU consegue ver os meus dados de treino?"
    answer: "O host é dono do hardware, então parta do princípio de que consegue. O isolamento por contêiner protege você de outros locatários, não do dono da máquina. Use hosts de data center verificados (Vast.ai Secure Cloud, RunPod Secure Cloud) para dados sensíveis, tire os dados pessoais antes de subir e apague a instância quando terminar."
  - question: "Qual é a diferença entre LoRA e QLoRA?"
    answer: "A LoRA congela o modelo base e treina matrizes adaptadoras pequenas. O QLoRA faz o mesmo, mas carrega o modelo base congelado em precisão NF4 de 4 bits, o que reduziu a memória o bastante para fazer fine-tuning de um modelo de 65B numa única GPU de 48 GB no artigo original."
  - question: "Posso fazer fine-tuning ou subir o meu modelo no GPUFlow?"
    answer: "Não. O GPUFlow é só para inferência: você aluga uma API de chat compatível com a OpenAI para modelos que os provedores instalaram nas próprias máquinas, normalmente com o Ollama. Não há shell nem acesso a arquivos, então não dá para treinar nem subir um modelo seu."
---

Você consegue fazer fine-tuning de um modelo de pesos abertos de 8B com os seus próprios dados usando QLoRA numa única GPU alugada de 24 GB, e um treino típico custa menos de um dólar. As perguntas difíceis vêm antes: se o fine-tuning é mesmo a solução (para fatos, a busca por recuperação costuma ganhar) e como os seus dados continuam privados numa máquina que pertence a outra pessoa.

Este guia trata das duas coisas e depois da VRAM necessária por tamanho de modelo, das ferramentas atuais, de um script de treino que funciona, de um custo calculado e de como servir o resultado. Tudo foi conferido em setembro de 2026; as fontes estão no final.

## Fine-tuning, RAG ou prompts melhores

O fine-tuning muda o jeito como o modelo se comporta. É uma forma ruim de ensinar fatos a ele. Ovadia et al. compararam as duas abordagens para injetar conhecimento e concluíram que o RAG "supera de forma consistente" o fine-tuning não supervisionado, "tanto para conhecimento já visto no treino quanto para conhecimento totalmente novo". O resumo deles: LLMs têm dificuldade para aprender fatos novos por fine-tuning.

Então percorra esta árvore antes de alugar qualquer coisa:

<figure>
<svg viewBox="0 0 720 420" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">Árvore de decisão para escolher entre busca por recuperação, prompts melhores, fine-tuning ou um modelo maior</title>
<defs><marker id="d1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker></defs>
<rect width="720" height="420" fill="#ffffff"/>
<rect x="60" y="15" width="280" height="40" rx="8" fill="#1e1b4b"/>
<text x="200" y="40" text-anchor="middle" fill="#ffffff">As respostas deixam a desejar</text>
<line x1="200" y1="55" x2="200" y2="83" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<rect x="20" y="85" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="115" text-anchor="middle" fill="#1e1b4b">Faltam fatos, ou os dados mudam?</text>
<rect x="440" y="80" width="260" height="60" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
<text x="570" y="105" text-anchor="middle" fill="#1e1b4b" font-weight="600">Use RAG</text>
<text x="570" y="126" text-anchor="middle" fill="#64748b" font-size="12">consulte seus documentos a cada pedido</text>
<line x1="380" y1="110" x2="438" y2="110" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="102" text-anchor="middle" fill="#16a34a" font-size="13">Sim</text>
<line x1="200" y1="135" x2="200" y2="173" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="160" fill="#64748b" font-size="13">Não</text>
<rect x="20" y="175" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="205" text-anchor="middle" fill="#1e1b4b">Instruções e exemplos resolvem?</text>
<rect x="440" y="170" width="260" height="60" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
<text x="570" y="195" text-anchor="middle" fill="#1e1b4b" font-weight="600">Melhore o prompt</text>
<text x="570" y="216" text-anchor="middle" fill="#64748b" font-size="13">system prompt, exemplos few-shot</text>
<line x1="380" y1="200" x2="438" y2="200" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="192" text-anchor="middle" fill="#16a34a" font-size="13">Sim</text>
<line x1="200" y1="225" x2="200" y2="263" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="250" fill="#64748b" font-size="13">Não</text>
<rect x="20" y="265" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="295" text-anchor="middle" fill="#1e1b4b">Precisa de formato, tom ou tarefa fixos?</text>
<rect x="440" y="260" width="260" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="570" y="285" text-anchor="middle" fill="#1e1b4b" font-weight="600">Fine-tuning com QLoRA</text>
<text x="570" y="306" text-anchor="middle" fill="#64748b" font-size="13">centenas de bons exemplos</text>
<line x1="380" y1="290" x2="438" y2="290" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="282" text-anchor="middle" fill="#16a34a" font-size="13">Sim</text>
<line x1="200" y1="315" x2="200" y2="353" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="340" fill="#64748b" font-size="13">Não</text>
<rect x="60" y="355" width="280" height="50" rx="10" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
<text x="200" y="385" text-anchor="middle" fill="#1e1b4b">Tente um modelo base maior</text>
<text x="570" y="370" text-anchor="middle" fill="#64748b" font-size="13">RAG e fine-tuning combinam bem:</text>
<text x="570" y="390" text-anchor="middle" fill="#64748b" font-size="13">ajuste o comportamento, busque os fatos</text>
</svg>
<figcaption>A maioria dos problemas do tipo "o modelo não conhece as nossas coisas" é problema de recuperação. O fine-tuning se paga quando você precisa do mesmo comportamento toda vez: um schema JSON, um estilo da casa, um esquema de classificação.</figcaption>
</figure>

Bons motivos para fazer fine-tuning:

- **Formato de saída rígido.** Extrair campos no seu schema em todas as chamadas, sem uma página de instruções em cada prompt.
- **Estilo e tom.** Respostas de suporte que soam como a sua equipe, ou relatórios com estrutura fixa.
- **Uma tarefa específica feita por um modelo pequeno.** Um modelo de 8B ajustado pode substituir um modelo grande e genérico numa única tarefa, o que faz diferença quando você o serve em hardware barato.
- **Prompts mais curtos.** Um comportamento aprendido nos pesos não precisa ser repetido em cada requisição.

## LoRA e QLoRA

O fine-tuning completo atualiza todos os pesos, então a GPU precisa guardar os gradientes e o estado do otimizador de todos eles, além do próprio modelo. A LoRA congela o modelo base e treina matrizes pequenas de posto baixo ao lado das camadas dele; o artigo original relatou 10.000 vezes menos parâmetros treináveis e 3 vezes menos memória de GPU do que o fine-tuning completo do GPT-3 175B com Adam.

O QLoRA vai além: o modelo base congelado é carregado em precisão NF4 de 4 bits, e só os adaptadores são treinados em 16 bits. Dettmers et al. o usaram para fazer fine-tuning de um modelo de 65B numa única GPU de 48 GB "preservando o desempenho do fine-tuning completo em 16 bits". O artigo trouxe três peças que as ferramentas usam até hoje: o tipo de dado NF4, a quantização dupla das constantes de quantização e os otimizadores paginados, que absorvem picos de memória.

O resultado de qualquer um dos dois é um adaptador, uma pasta com alguns tensores, que você aplica sobre o modelo base inalterado. Dá para mantê-lo separado ou mesclá-lo aos pesos.

## Quanta VRAM você precisa

O Unsloth publica uma tabela com a VRAM mínima para fine-tuning por tamanho de modelo. Os números abaixo são dele, com as otimizações de memória dele; um treino comum com Hugging Face precisa de mais, e sequências mais longas ou batches maiores empurram todas as linhas para cima.

| Tamanho do modelo | QLoRA (4 bits) | LoRA (16 bits) | Placa alugada que roda QLoRA com folga |
| --- | --- | --- | --- |
| 3B | 3,5 GB | 8 GB | Qualquer placa de 12 GB+ |
| 8B | 6 GB | 22 GB | RTX 3090 / 4090 (24 GB) |
| 14B | 8,5 GB | 33 GB | RTX 3090 / 4090 (24 GB) |
| 32B | 26 GB | 76 GB | Placa de 48 GB (RTX A6000, A40, L40S) |
| 70B | 41 GB | 164 GB | Placa de 80 GB (A100, H100) |

<figure>
<svg viewBox="0 0 720 320" role="img" aria-labelledby="d2-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d2-title">Gráfico de barras com a VRAM mínima para fine-tuning de modelos de 8B, 14B, 32B e 70B com QLoRA e com LoRA em 16 bits, comparada com placas de 24, 48 e 80 GB</title>
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
<text x="228" y="129" fill="#1e1b4b" font-size="12">8.5</text>
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
<text x="420" y="306" text-anchor="middle" fill="#64748b" font-size="13">VRAM mínima em GB (tabela de requisitos do Unsloth)</text>
</svg>
<figcaption>O QLoRA é o que torna as placas domésticas alugadas úteis aqui: até 14B cabe com folga numa placa de 24 GB, 32B precisa de uma placa de 48 GB e 70B, de uma de 80 GB. Sem o carregamento em 4 bits, até o 8B mal cabe em 24 GB.</figcaption>
</figure>

O meu padrão é um modelo de 8B ou 14B numa RTX 4090. É a placa alugada mais barata que deixa espaço para sequências de 2.048 tokens e um batch razoável, e modelos nessa faixa são fáceis de servir depois. Para escolher o modelo base pela VRAM em que você vai servi-lo, veja [quais modelos de IA cabem na VRAM da sua GPU](/pt_br/which-ai-models-fit-your-gpu-vram/).

## Escolha a ferramenta: TRL, Unsloth ou Axolotl

As três são de código aberto e todas fazem LoRA e QLoRA.

| Ferramenta | Como usar | Ponto forte | Atenção |
| --- | --- | --- | --- |
| Hugging Face TRL + PEFT | Python (`SFTTrainer`) | A implementação de referência; DPO, GRPO e outros na mesma API | Usa mais memória que o Unsloth no mesmo treino |
| Unsloth | Python, ou a interface web Unsloth Studio | Promete 2x mais velocidade e 70% menos VRAM; exporta direto para GGUF | A interface Studio é AGPL-3.0 (o núcleo é Apache 2.0) |
| Axolotl | Um arquivo YAML, `axolotl train config.yml` | Multi-GPU (FSDP, DeepSpeed), muitas receitas | Exige Python 3.11+ e PyTorch 2.11+ |

Em setembro de 2026, o TRL está na versão 1.14 e o PEFT na 0.21. O Unsloth precisa de Python 3.11 a 3.13 e de uma GPU NVIDIA com CUDA capability 7.0 ou superior (V100, T4, série RTX 20 em diante). O Axolotl recomenda Python 3.12 e PyTorch 2.12.1.

Use o TRL se quiser entender cada linha, o Unsloth se estiver com pouca VRAM ou quiser exportar para GGUF com uma chamada, e o Axolotl se for repetir treinos com configurações diferentes ou passar para várias GPUs. O script abaixo usa o TRL, porque é o caminho mais curto que mostra todas as peças.

## Prepare os dados

O `SFTTrainer` do TRL lê conversas no mesmo formato de uma requisição de API de chat. Um objeto JSON por linha no `train.jsonl`:

```json
{"messages": [{"role": "system", "content": "Extract the invoice fields as JSON."}, {"role": "user", "content": "Invoice 4471 from Norden AB, due 12 March, total 1,250 EUR"}, {"role": "assistant", "content": "{\"invoice_id\": \"4471\", \"supplier\": \"Norden AB\", \"due\": \"2026-03-12\", \"total\": 1250, \"currency\": \"EUR\"}"}]}
```

Regras práticas:

- **Qualidade acima de quantidade.** Algumas centenas a alguns milhares de exemplos consistentes e corretos valem mais do que dezenas de milhares com ruído. Cada erro nos dados é um comportamento que você está pagando para ensinar.
- **Espelhe a produção.** Use o system prompt e o formato de entrada que a sua aplicação vai enviar de fato.
- **Separe de 5 a 10%.** Guarde exemplos com que o modelo nunca treina, para comparar o modelo base e o ajustado lado a lado.
- **Tire o que não precisa.** Nomes, e-mails, números de conta e IDs raramente ajudam o modelo a aprender um formato. Troque-os por marcadores realistas antes de os dados saírem do seu computador.

Essa última regra vai além da máquina alugada. Carlini et al. extraíram centenas de sequências de treino literais do GPT-2, incluindo nomes, números de telefone e endereços de e-mail, alguns dos quais apareciam em um único documento de treino. Um modelo ajustado pode repetir aquilo com que foi treinado para quem o usar depois.

## Mantenha os dados privados numa máquina alugada

Num marketplace de GPU, o computador pertence a outra pessoa. O Vast.ai diz com todas as letras: "os clientes ficam isolados em contêineres Docker sem privilégios e só têm acesso aos próprios dados", e "a segurança dos provedores varia bastante". Esse isolamento protege você de outros locatários. Não protege de quem tem acesso físico e root no host.

Para dados privados:

1. **Escolha um host de data center verificado.** Os provedores do Secure Cloud do Vast.ai são "data centers verificados com certificação ISO 27001 e padrões de data center Tier 3/4", e o Vast os recomenda para trabalhos sensíveis. O Secure Cloud do RunPod roda em data centers T3/T4; o Community Cloud conecta você a provedores individuais. As linhas de data center custam mais por hora e aqui valem a pena.
2. **Suba só o dataset limpo,** por SSH (`rsync -avP` ou `scp`). Não deixe ele num bucket público nem num link compartilhado no meio do caminho.
3. **Mantenha os logs locais.** No TRL 1.14, `report_to` tem `"none"` como padrão, então nada vai para um rastreador de experimentos a menos que você ative. Não chame `push_to_hub` com um adaptador treinado com dados privados.
4. **Tire os resultados e depois apague a instância.** Baixe o adaptador e as saídas da avaliação, saia do Hugging Face (`hf auth logout`) se tiver usado um token, e apague a instância e qualquer volume. No Vast.ai, o armazenamento é cobrado e mantido até a instância ser apagada, não só parada.

Apagar arquivos dentro de um contêiner não garante que o disco do host seja limpo, então a proteção de verdade está nos passos 1 e 2: escolher quem fica com o hardware e mandar para ele o mínimo possível. Mais detalhes em [como proteger um dataset em um nó de GPU público](/pt_br/how-to-secure-dataset-on-public-gpu-node/). Se a sua política proíbe qualquer hardware de terceiros, o mesmo script roda na sua própria placa de 24 GB.

## Treino: um script QLoRA com o TRL

Numa máquina Linux alugada com uma RTX 3090 ou 4090:

```bash
python -m venv venv && source venv/bin/activate
pip install torch trl peft bitsandbytes datasets
```

Depois o `train.py`, seguindo o padrão de QLoRA da documentação de PEFT do TRL. O Qwen3-8B é Apache 2.0 e não tem acesso restrito, então não é preciso token do Hugging Face:

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

As escolhas que importam:

- **`learning_rate=2e-4`.** A documentação do TRL recomenda cerca de 10 vezes a taxa normal de fine-tuning para QLoRA. Se a loss de avaliação sobe enquanto a de treino cai, é overfitting: use menos épocas.
- **`r=16`, `target_modules="all-linear"`.** Adaptadores em todas as camadas lineares, a configuração dos benchmarks do Unsloth. Rank 16 basta para formato e estilo; aumente para tarefas mais difíceis.
- **`max_length=2048`.** Exemplos mais longos são cortados. Confira o tamanho em tokens dos seus dados; um limite maior exige mais VRAM.
- **Batch efetivo de 16** (4 × 4 passos de acumulação). Se a memória acabar, abaixe `per_device_train_batch_size` e aumente a acumulação para manter o produto.

Antes de desligar a máquina, passe os exemplos separados pelo modelo base e pelo ajustado e compare. É o único teste que diz se o dinheiro serviu para alguma coisa.

## Quanto custa

O tempo de treino é o total de tokens ÷ a vazão. A GigaGPU, uma empresa de hospedagem, publicou uma medição de ~3.500 tokens de treino por segundo para o Llama 3.1 8B com QLoRA numa RTX 4090. Supondo uma taxa parecida para o Qwen3-8B:

**Treino pequeno:** 2.000 exemplos × 600 tokens × 3 épocas = 3,6 milhões de tokens. 3.600.000 ÷ 3.500 = 1.029 s, cerca de 17 minutos.

| Etapa | Tempo |
| --- | --- |
| Preparar o ambiente | 10 min |
| Baixar o Qwen3-8B (16,4 GB de pesos) e subir os dados | 10 min |
| Treino | 17 min |
| Comparar o modelo base e o ajustado nos dados separados | 15 min |
| Mesclar, exportar, baixar, apagar a instância | 15 min |
| **Total** | **67 min (1,12 h)** |

- RTX 4090 no Vast.ai a US$ 0,31/h: 1,12 × US$ 0,31 = **US$ 0,35**
- RTX 4090 no RunPod a US$ 0,74/h (preço de tabela da página de preços): 1,12 × US$ 0,74 = **US$ 0,83**

**Treino maior:** 20.000 exemplos × 1.000 tokens × 2 épocas = 40 milhões de tokens ÷ 3.500 = 11.429 s, cerca de 3,2 horas. Com os mesmos 50 minutos de preparação e finalização, 4,0 horas: **US$ 1,24** no Vast.ai ou **US$ 2,97** no RunPod.

Para um modelo de 32B, o RunPod lista placas de 48 GB a US$ 0,49/h (A40), US$ 0,53/h (RTX A6000) e US$ 1,09/h (L40S) em setembro de 2026. Não tenho uma vazão publicada de QLoRA de 32B nessas placas, então rode 50 passos, leia o tempo por passo no log e faça a mesma multiplicação antes de se comprometer com um treino longo.

Os preços são os de setembro de 2026 da página de preços do RunPod e do rastreador do getdeploying.com para o Vast.ai. As linhas Secure/data center custam mais do que as ofertas comunitárias mais baratas. O panorama geral está na [comparação de preços de aluguel de GPU](/pt_br/gpu-rental-pricing-comparison-2026/).

## Sirva o resultado

Você tem duas opções: manter o adaptador separado ou mesclá-lo ao modelo.

**Mantê-lo separado com o vLLM.** O vLLM carrega adaptadores LoRA ao lado do modelo base e expõe cada um como um nome de modelo no seu servidor compatível com a OpenAI:

```bash
vllm serve Qwen/Qwen3-8B --enable-lora --lora-modules invoices=./out/adapter
```

Os clientes então enviam `"model": "invoices"`. Vários adaptadores podem compartilhar um modelo base numa única GPU.

**Mesclar e rodar no Ollama.** Mescle o adaptador em pesos de precisão completa, converta para GGUF com o llama.cpp, quantize e importe:

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

O Unsloth faz a mesclagem e a exportação para GGUF numa chamada só (`model.save_pretrained_gguf("dir", tokenizer, quantization_method="q4_k_m")`). A documentação dele avisa que a causa mais comum de respostas ruins depois da exportação é o chat template errado: sirva com o template com que você treinou. Os prós e contras de Ollama, vLLM e TGI estão no [nosso benchmark de inferência na RTX 4090](/pt_br/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/).

### Onde o GPUFlow entra

O GPUFlow não faz o treino: ele aluga uma API compatível com a OpenAI na GPU de um provedor, sem shell, SSH nem acesso a arquivos. Ele também não serve o seu modelo ajustado. Os locatários não podem subir modelos; os modelos oferecidos são os que cada provedor instalou (normalmente com o Ollama), como `qwen2.5:7b` ou `llama3.1:8b`.

Onde ele ajuda é no passo anterior a tudo isso: verificar, por alguns centavos, se um modelo aberto comum com um bom prompt já resolve, que é o desfecho mais barato da árvore de decisão. Use dados de teste para isso, não os dados privados de que este guia trata: prompts e respostas passam em texto puro pela máquina do provedor enquanto o aluguel dura. Como funciona está no [guia rápido da API](https://docs.gpuflow.app/pt-br/renters/api-quickstart/), e [como usar a chave nos seus apps](/pt_br/use-openai-compatible-api-key-in-apps/) mostra como conectá-la a ferramentas que você já usa.

## Fontes

Tudo verificado em setembro de 2026.

- Artigos: [Hu et al., LoRA](https://arxiv.org/abs/2106.09685); [Dettmers et al., QLoRA](https://arxiv.org/abs/2305.14314); [Ovadia et al., Fine-Tuning or Retrieval?](https://arxiv.org/abs/2312.05934); [Carlini et al., Extracting Training Data from Large Language Models](https://arxiv.org/abs/2012.07805)
- Hugging Face TRL: [SFT Trainer](https://huggingface.co/docs/trl/sft_trainer), [integração com PEFT e QLoRA](https://huggingface.co/docs/trl/peft_integration)
- Unsloth: [requisitos e tabela de VRAM](https://unsloth.ai/docs/get-started/fine-tuning-for-beginners/unsloth-requirements.md), [benchmarks](https://unsloth.ai/docs/basics/unsloth-benchmarks.md), [como salvar em GGUF](https://unsloth.ai/docs/basics/inference-and-deployment/saving-to-gguf.md), [GitHub](https://github.com/unslothai/unsloth)
- [Axolotl no GitHub](https://github.com/axolotl-ai-cloud/axolotl)
- Modelo: [model card do Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
- Vazão de treino: [GigaGPU, fine-tuning na RTX 4090](https://gigagpu.com/rtx-4090-fine-tuning-guide/)
- Hosts e segurança: [FAQ de segurança do Vast.ai](https://docs.vast.ai/documentation/reference/faq/security), [preços do Vast.ai](https://docs.vast.ai/guides/instances/pricing.md), [visão geral dos pods do RunPod](https://docs.runpod.io/pods/overview)
- Preços: [preços do RunPod](https://www.runpod.io/pricing), getdeploying.com para [Vast.ai](https://getdeploying.com/vast-ai) e [RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090)
- Como servir: [adaptadores LoRA no vLLM](https://docs.vllm.ai/en/latest/features/lora.html), [quantize do llama.cpp](https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md), [importação no Ollama](https://docs.ollama.com/import)
- GPUFlow: [guia rápido da API](https://docs.gpuflow.app/pt-br/renters/api-quickstart/)
