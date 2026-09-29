---
title: "Guia completo de fine-tuning privado de LLMs em GPUs alugadas"
description: "Tutorial completo de fine-tuning de modelos de linguagem open-weights com o seu próprio dataset em uma GPU alugada. Proteja seus dados, reduza o custo de computação e evite ficar preso a um fornecedor."
excerpt: "Aprenda a fazer fine-tuning de LLMs open-weights em GPUs alugadas sem perder o controle dos seus dados. Instruções passo a passo sobre transferência segura, treinamento com QLoRA e limpeza do ambiente."
pubDate: 2025-02-23
updatedDate: 2026-09-29
locale: "pt_br"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/secure-server-room-abstract.png"
heroImageAlt: "Representação abstrata de uma sala de servidores segura processando dados de IA, com iluminação azul"
faq:
  - question: "Dá para fazer fine-tuning de modelos de linguagem grandes em uma única RTX 4090?"
    answer: "Sim. Com QLoRA (Quantized Low-Rank Adaptation), modelos de até 8B parâmetros cabem com folga em 24 GB de VRAM. Este tutorial mostra exatamente como configurar o script de treinamento para hardware de consumo, com valores específicos de batch size, comprimento de sequência e rank do LoRA."
  - question: "Meu dataset fica seguro em uma GPU alugada?"
    answer: "Seu dataset fica tão seguro quanto as suas práticas operacionais. Este guia explica como transferir os dados criptografados via SCP, como evitar intermediários de armazenamento em nuvem como S3 ou Google Drive e como limpar a máquina remota depois do treinamento. Lembre-se de que a máquina é de outra pessoa: apague tudo antes de encerrar o aluguel."
  - question: "Quanto custa fazer fine-tuning de um modelo de 8B em uma GPU alugada?"
    answer: "Um fine-tuning típico de um modelo de 8B parâmetros em uma RTX 4090 alugada custa entre três e oito dólares, dependendo do tamanho do dataset e do número de épocas."
  - question: "Preciso comprovar minha identidade para alugar GPU para treinamento?"
    answer: "Normalmente não. Marketplaces como Vast.ai e RunPod pedem um e-mail e crédito pré-pago, não documentos de identidade. A RunPod só pede KYC antes do primeiro pagamento em cripto. Na AWS, contas novas começam com cota de GPU zerada, e você precisa solicitar um aumento."
  - question: "Em que formato o script de treinamento espera o dataset?"
    answer: "O script espera um arquivo JSONL em que cada linha contém um objeto JSON com um campo text. Esse campo deve trazer a instrução, a entrada e a resposta formatadas como uma única string com quebras de linha. Há um exemplo com a formatação correta no Passo 4 deste guia."
  - question: "Este tutorial funciona com outros modelos além do Llama?"
    answer: "Sim. O fluxo vale para qualquer modelo open-weights, incluindo Mistral, Qwen, Falcon e outros. O exemplo de código usa o Llama-3.1-8B, mas basta trocar o identificador do modelo para fazer fine-tuning de outro modelo base."
  - question: "Quanto tempo leva o fine-tuning de um modelo de 8B parâmetros?"
    answer: "O tempo de treinamento depende do tamanho do dataset. Uma execução típica com 1.000 exemplos termina em 30 a 60 minutos em uma RTX 4090. Datasets maiores escalam de forma aproximadamente linear: um dataset de 10.000 exemplos exige de 5 a 10 horas de computação."
  - question: "O que devo fazer com a máquina remota depois do treinamento?"
    answer: "Você precisa limpar o ambiente, apagando o dataset, o código de treinamento, o cache do Hugging Face e o histórico do bash. Este guia traz os comandos exatos para uma exclusão segura, incluindo o uso opcional do shred para destruir os arquivos por completo antes de encerrar o aluguel."
---

Se você está lendo isto, provavelmente tem um dataset que não pode (ou não quer) enviar para a OpenAI.

Você não está sozinho. Para muitas empresas e desenvolvedores independentes, a conveniência do ChatGPT não compensa o risco inaceitável de vazamento de dados. Seja com prontuários médicos sujeitos à HIPAA, com bases de código proprietárias que representam anos de investimento em engenharia ou com modelos financeiros sensíveis capazes de mexer com o mercado, usar IA na nuvem muitas vezes significa confiar a um terceiro a sua propriedade intelectual mais valiosa.

Quando esse terceiro é um conglomerado de tecnologia com histórico de usar dados de clientes para treinar modelos futuros, "confiança" vira uma palavra desconfortável.

A solução não é abandonar a IA. A solução é ser dono da infraestrutura.

Fazer fine-tuning de modelos open-weights em hardware que você controla deixou de ser um nicho acadêmico. Para organizações que levam privacidade a sério, virou requisito de negócio. Modelos como Llama, Mistral, Qwen e dezenas de outros estão disponíveis para uso comercial, sem taxa de API e sem exigência de compartilhar dados. O problema sempre foi o acesso à computação. Comprar clusters de NVIDIA H100 exige milhões em investimento. Alugar na AWS exige verificação de identidade, contratos corporativos e preços por hora que tornam treinamentos longos caros demais.

Este guia apresenta um terceiro caminho. Você vai aprender a fazer fine-tuning de um modelo de linguagem open-weights em uma GPU alugada em um marketplace, muitas vezes hardware de pessoas físicas espalhadas pelo mundo. Vamos cobrir a configuração do ambiente, os protocolos de segurança para trabalhar em nós públicos e a execução completa do treinamento.

Os exemplos de código usam o Llama-3.1-8B como referência concreta, mas o fluxo é idêntico para qualquer modelo compatível com o Hugging Face. Troque o identificador do modelo e você pode fazer fine-tuning do Mistral-7B, do Qwen2-7B ou de qualquer lançamento open-weights que sirva ao seu caso.

E tudo isso sem contrato de longo prazo e por uma fração do que os provedores de nuvem tradicionais cobram.

![Janela de terminal mostrando uma conexão SSH ativa com um servidor de GPU remoto](../_images/terminal-ssh-connection.png)

## A economia do fine-tuning privado

Antes de entrar na implementação técnica, vamos estabelecer o contexto financeiro.

Treinar um modelo na AWS significa instâncias grandes e pedidos de cota. A instância p4d.24xlarge (8 GPUs A100) custa US$ 32,77 por hora, e contas novas na AWS começam com cota de GPU zerada.

Em um marketplace de GPU, você aluga poder de computação diretamente de quem é dono do hardware. As consequências são grandes:

**Custo menor:** uma RTX 4090 sai por cerca de US$ 0,30 a US$ 0,46 por hora nos marketplaces (setembro de 2026). Para modelos de 8B parâmetros com QLoRA, uma única 4090 com 24 GB de VRAM conclui um fine-tuning em duas a seis horas, dependendo do tamanho do dataset. O custo total de computação fica entre três e oito dólares.

**Seus dados ficam em uma única máquina:** você copia o dataset direto para a máquina alugada via SSH, treina, baixa o resultado e apaga tudo. Nada de bucket de armazenamento, nada de uma terceira cópia.

**Sem porteiros:** você não precisa de aprovação da equipe de vendas corporativas de um provedor de nuvem nem de aumento de cota. Basta adicionar crédito pré-pago e alugar o hardware.

Para comparar: uma única A10G na AWS (g5.xlarge, a opção mais barata com 24 GB de VRAM) custa cerca de US$ 1,01 por hora em us-east-1. Some o pedido de cota, o tempo de configuração e a computação ociosa enquanto você prepara o ambiente, e o custo real da primeira execução fica muito acima dos poucos dólares que ela custa em um marketplace.

Esses números estão detalhados na nossa [comparação de preços de aluguel de GPU](/pt_br/gpu-rental-pricing-comparison-2026/) e em [o custo real de alugar uma GPU](/pt_br/hidden-fees-in-gpu-rental/).

## Pré-requisitos

Este tutorial parte do princípio de que você conhece a linha de comando do Linux. Não é preciso ter pós-graduação em machine learning, mas você deve saber navegar pelo sistema de arquivos, editar arquivos de texto e interpretar mensagens de erro.

**Requisitos de hardware:**

- **GPU:** no mínimo 24 GB de VRAM. RTX 3090, RTX 4090 e A10G atendem. Para o modelo de 70B parâmetros, você precisa de 48 GB ou mais (A6000, duas A100 ou H100).
- **RAM do sistema:** 32 GB ou mais. O carregamento do modelo passa os pesos pela memória do sistema antes de transferi-los para a GPU.
- **Armazenamento:** 100 GB ou mais de SSD NVMe. Os pesos base do Llama-3 8B ocupam cerca de 16 GB. O dataset, os checkpoints e o adapter final somam mais espaço.

**Sobre a escolha do modelo:** este tutorial usa o Llama-3.1-8B da Meta como exemplo porque ele representa a maior classe de modelo que cabe em uma única GPU de 24 GB com quantização QLoRA. A família Llama agora inclui o Llama 4 Scout e o Maverick, mas eles usam arquitetura Mixture of Experts com 109B e 400B parâmetros no total, respectivamente, e exigem configurações com várias GPUs, o que foge do escopo de um aluguel de nó único. O fluxo descrito aqui vale igualmente para Mistral-7B, Qwen2-7B, Gemma-2-9B e qualquer outro modelo compatível com o Hugging Face que caiba na VRAM do hardware alugado.

**Pré-requisitos de software:**

- Python 3.10 ou superior
- Conhecimento básico de PyTorch
- Uma conta no Hugging Face (necessária para baixar modelos restritos, como o Llama, que exigem aceitar uma licença)
- Uma conta com crédito pré-pago em um marketplace de GPU que alugue máquinas inteiras com acesso SSH, como Vast.ai, RunPod ou TensorDock

Não sabe qual escolher? Veja [o que você precisa para alugar uma GPU](/pt_br/what-you-need-to-rent-a-gpu/) e [GPUFlow vs Vast.ai vs RunPod vs SaladCloud](/pt_br/gpuflow-vs-vast-ai-vs-runpod/). A GPUFlow em si não serve para este tutorial: ela aluga acesso a modelos de IA por meio de uma API, não uma máquina em que você possa fazer login.

## Passo 1: garantir o seu nó de computação

O primeiro passo é conseguir o hardware. Nas grandes plataformas de nuvem, isso significa criar uma conta, solicitar cota de GPU e esperar a aprovação. Em um marketplace, o processo é bem mais direto.

Abra o marketplace de sua preferência e adicione algum crédito. A interface mostra as máquinas disponíveis com especificações, preço por hora e índice de confiabilidade.

Filtre por máquinas com estas características:

- **GPU:** RTX 4090 (24 GB de VRAM) ou RTX 6000 Ada (48 GB de VRAM)
- **RAM:** mínimo de 32 GB
- **Armazenamento:** 100 GB ou mais disponíveis
- **Confiabilidade:** índice de uptime de 95% ou mais

Escolha uma máquina e inicie o aluguel. Prefira uma imagem que já tenha CUDA e PyTorch instalados: isso economiza tempo de configuração, e o tempo de configuração também é cobrado.

**Cuidados de segurança em nós públicos:**

Ao alugar uma máquina em qualquer rede remota, você está acessando um hardware que pertence a um desconhecido e que está fisicamente sob o controle dele. A camada de virtualização oferece um isolamento real, mas você precisa agir com a cautela adequada:

1. **Não guarde chaves privadas na máquina remota.** Chaves SSH de outros sistemas, credenciais de nuvem e tokens de API de serviços em produção nunca devem existir em um nó alugado.

2. **Trate o sistema de arquivos como hostil.** Parta do princípio de que tudo o que você grava em disco pode, em tese, ser recuperado pelo host depois que você se desconectar. Os procedimentos de exclusão segura estão no Passo 6.

3. **Criptografe os dados sensíveis durante a transferência.** Tratamos disso no Passo 3.

4. **Não reutilize senhas.** Se a interface de aluguel fornecer credenciais padrão, troque-as imediatamente ou gere um novo par de chaves SSH.

Depois que o aluguel for confirmado, o painel mostra os dados de conexão. Você vai receber um comando SSH parecido com este:

```bash
ssh -p 22345 user@203.0.113.42
```

Abra o terminal local e execute esse comando. Aceite a impressão digital da chave do host quando for solicitado. Pronto: você está conectado ao seu nó de GPU alugado.

Confira se o hardware corresponde ao que você contratou:

```bash
nvidia-smi
```

A saída deve mostrar a GPU alugada, a capacidade de memória e a versão do driver instalado. Se a GPU não aparecer ou as especificações forem diferentes do pedido, desconecte-se imediatamente e informe a divergência ao suporte do marketplace.

## Passo 2: configuração do ambiente

Com a conexão SSH verificada, a próxima prioridade é montar um ambiente Python limpo. A maioria dos nós alugados já vem com drivers NVIDIA e CUDA toolkit instalados, mas depender dos pacotes Python do sistema do host é pedir conflitos de dependência que vão consumir horas de depuração.

Vamos criar um ambiente virtual isolado para garantir reprodutibilidade e estabilidade.

Execute os comandos a seguir para criar o espaço de trabalho:

```bash
mkdir ~/llama3-finetune
cd ~/llama3-finetune
python3 -m venv venv
source venv/bin/activate
```

O prompt do terminal agora deve mostrar `(venv)`, indicando que o ambiente virtual está ativo. Todos os pacotes instalados a partir daqui ficam dentro desse diretório, sem mexer no sistema do host.

Antes de instalar pacotes Python, verifique se o CUDA toolkit está acessível:

```bash
nvcc --version
```

Anote a versão do CUDA. Você vai precisar dela para garantir a compatibilidade com o PyTorch. A maioria dos nós alugados roda CUDA 11.8 ou 12.1. Se o `nvcc` não for encontrado, o CUDA toolkit pode não estar no seu PATH. Normalmente isso se resolve carregando o arquivo de ambiente correspondente:

```bash
source /etc/profile.d/cuda.sh
```

Se esse arquivo não existir, consulte a documentação do marketplace sobre a configuração do seu nó.

Agora instale o ecossistema PyTorch. O comando a seguir instala o PyTorch com suporte a CUDA 12.1. Ajuste o sufixo da versão do CUDA se o seu nó usar outra:

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

Em seguida, instale as bibliotecas necessárias para um fine-tuning eficiente. Vamos usar o ecossistema do Hugging Face, junto com o bitsandbytes para quantização e o PEFT para treinamento eficiente em parâmetros:

```bash
pip install transformers==4.40.0 datasets==2.19.0 peft==0.10.0 bitsandbytes==0.43.1 trl==0.8.6 accelerate==0.29.0
```

**Fixar as versões faz diferença.** As versões acima foram testadas e são compatíveis entre si no momento em que este texto foi escrito. O ecossistema do Hugging Face muda rápido, e instalações sem versão fixa costumam trazer mudanças incompatíveis. Se aparecerem erros de importação ou comportamentos estranhos, versões incompatíveis são a causa mais provável.

Por fim, autentique-se no Hugging Face. Os pesos do Llama-3 são restritos por um contrato de licença que exige uma conta no Hugging Face. Acesse o [repositório Meta Llama-3](https://huggingface.co) e aceite os termos da licença. Depois, gere um token de acesso na página de configurações do Hugging Face.

Execute o comando de autenticação:

```bash
huggingface-cli login
```

Cole o token de acesso quando for solicitado. O token fica salvo em `~/.cache/huggingface/token`. Agora você tem autorização para baixar pesos de modelos restritos diretamente no nó alugado.

![Código Python exibido em um terminal com os parâmetros de configuração do modelo Llama-3](../_images/python-llama3-config.png)

## Passo 3: transferência segura dos dados

Esta seção trata do principal motivo para alugar uma máquina em vez de chamar uma API: a soberania dos dados.

O fluxo padrão na nuvem envolve enviar o dataset para um bucket de armazenamento (S3, Google Cloud Storage, Azure Blob) e depois baixá-lo na instância de computação. Essa abordagem cria várias cópias dos seus dados sensíveis em sistemas que você não controla. O provedor de armazenamento tem acesso. O provedor de computação tem acesso. Os dois guardam logs da sua atividade.

Vamos evitar tudo isso com uma transferência direta e criptografada.

O protocolo SSH inclui o `scp` (Secure Copy Protocol), que transfere arquivos pelo mesmo canal criptografado que você usa para acessar o terminal. Os dados vão direto da sua máquina local para o nó alugado, sem passar por nenhum armazenamento intermediário.

Abra uma **nova janela de terminal** no seu **computador local**. Não feche a sessão SSH que já está aberta com o nó alugado. Execute o comando a seguir, substituindo o caminho do arquivo e os dados de conexão pelos seus:

```bash
scp -P 22345 /path/to/your/dataset.jsonl user@203.0.113.42:~/llama3-finetune/
```

A opção `-P` define o número da porta (repare no P maiúsculo, diferente do `-p` minúsculo do ssh). Com datasets grandes, a transferência pode levar alguns minutos. Você vai ver o progresso com a quantidade de bytes transferidos.

**Para datasets acima de 1 GB**, considere compactar antes de transferir:

```bash
# On your local machine
gzip -k dataset.jsonl
scp -P 22345 dataset.jsonl.gz user@203.0.113.42:~/llama3-finetune/

# Then on the remote node
cd ~/llama3-finetune
gunzip dataset.jsonl.gz
```

**Medidas de segurança adicionais:**

Se o seu modelo de ameaças inclui adversários sofisticados, vale criptografar o dataset antes da transferência com GPG ou age. Isso cria uma defesa em camadas: mesmo que a transferência fosse interceptada de alguma forma, o conteúdo continuaria ilegível.

```bash
# On your local machine (using age encryption)
age -p dataset.jsonl > dataset.jsonl.age
scp -P 22345 dataset.jsonl.age user@203.0.113.42:~/llama3-finetune/

# On the remote node
age -d dataset.jsonl.age > dataset.jsonl
rm dataset.jsonl.age
```

Para a maioria dos usuários, a transferência padrão via SCP já oferece proteção suficiente. O protocolo SSH usa criptografia AES-256. Ataques man-in-the-middle são barrados pela verificação da chave do host. Seus dados não passam por nenhum sistema de armazenamento de terceiros.

## Passo 4: o script de fine-tuning

Vamos usar a classe `SFTTrainer` da biblioteca TRL (Transformer Reinforcement Learning) para fazer o fine-tuning supervisionado. A biblioteca esconde boa parte da complexidade e continua configurável o bastante para cargas de produção.

Antes de escrever o script de treinamento, você precisa entender o formato esperado do dataset.

**Formato exigido do dataset:**

O script espera um arquivo JSONL (JSON Lines) em que cada linha contém um objeto JSON válido com um campo `text`. O campo `text` deve trazer o exemplo de treinamento completo, formatado como uma única string.

Veja três linhas formatadas corretamente:

```json
{"text": "### Instruction: Summarize the following legal clause in plain English.\n\n### Input: Party A shall indemnify, defend, and hold harmless Party B from any claims, damages, or expenses arising from Party A's negligence or willful misconduct.\n\n### Response: Party A agrees to protect Party B from any legal claims or costs that result from Party A's mistakes or intentional wrongdoing."}
{"text": "### Instruction: Extract the key financial metrics from this earnings report.\n\n### Input: Q3 revenue reached $4.2B, up 12% YoY. Operating margin improved to 23.5% from 21.2%. Free cash flow was $890M.\n\n### Response: Revenue: $4.2 billion (12% year-over-year growth). Operating margin: 23.5% (up from 21.2%). Free cash flow: $890 million."}
{"text": "### Instruction: Identify potential HIPAA violations in this process description.\n\n### Input: Patient records are emailed to the billing department as PDF attachments. The billing staff prints these for manual review and shreds them after processing.\n\n### Response: Potential violations include: unencrypted email transmission of PHI, physical documents that may be visible to unauthorized personnel during processing, and lack of documented chain of custody. Recommend encrypted file transfer and on-screen review only."}
```

**Observações importantes sobre a formatação:**

1. Cada objeto JSON deve ocupar exatamente uma linha. Nada de JSON em várias linhas.
2. As quebras de linha dentro do campo `text` precisam ser escapadas como `\n`.
3. As aspas dentro do texto precisam ser escapadas como `\"`.
4. O arquivo deve usar codificação UTF-8.

Se os dados de origem estiverem em outro formato (CSV, Parquet, colunas separadas de instrução e resposta), você vai precisar pré-processá-los nessa estrutura antes da transferência. A biblioteca `json` do Python cuida do escape automaticamente:

```python
import json

with open('dataset.jsonl', 'w') as f:
    for example in your_data:
        text = f"### Instruction: {example['instruction']}\n\n### Input: {example['input']}\n\n### Response: {example['output']}"
        f.write(json.dumps({"text": text}) + '\n')
```

Com o dataset no lugar, crie o script de treinamento no nó remoto:

```bash
cd ~/llama3-finetune
nano train.py
```

Cole a configuração abaixo. Este script usa QLoRA para fazer fine-tuning de um modelo de 8B parâmetros dentro dos limites de memória de uma GPU de 24 GB. O exemplo usa o Llama-3.1-8B, mas você pode trocar por qualquer modelo compatível alterando a variável MODEL_NAME:

```python
import torch
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    TrainingArguments,
)
from peft import LoraConfig
from trl import SFTTrainer

# ============================================
# CONFIGURATION - Modify these values as needed
# ============================================

# Base model identifier on Hugging Face
# Change this to fine-tune a different model (e.g., "mistralai/Mistral-7B-v0.1")
MODEL_NAME = "meta-llama/Llama-3.1-8B"

# Name for your fine-tuned adapter
OUTPUT_NAME = "llama-3-8b-custom"

# Path to your dataset
DATASET_PATH = "dataset.jsonl"

# Training hyperparameters
NUM_EPOCHS = 1
BATCH_SIZE = 4
LEARNING_RATE = 2e-4
MAX_SEQ_LENGTH = 512

# LoRA hyperparameters
LORA_RANK = 16
LORA_ALPHA = 16
LORA_DROPOUT = 0.05

# ============================================
# QUANTIZATION CONFIGURATION
# ============================================

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True,
)

# ============================================
# MODEL LOADING
# ============================================

print("Loading base model...")
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    quantization_config=bnb_config,
    device_map="auto",
    trust_remote_code=True,
)
model.config.use_cache = False

print("Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
tokenizer.pad_token = tokenizer.eos_token
tokenizer.padding_side = "right"

# ============================================
# DATASET LOADING
# ============================================

print(f"Loading dataset from {DATASET_PATH}...")
dataset = load_dataset("json", data_files=DATASET_PATH, split="train")
print(f"Dataset contains {len(dataset)} examples")

# ============================================
# LORA CONFIGURATION
# ============================================

peft_config = LoraConfig(
    r=LORA_RANK,
    lora_alpha=LORA_ALPHA,
    lora_dropout=LORA_DROPOUT,
    bias="none",
    task_type="CAUSAL_LM",
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
)

# ============================================
# TRAINING ARGUMENTS
# ============================================

training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=NUM_EPOCHS,
    per_device_train_batch_size=BATCH_SIZE,
    gradient_accumulation_steps=1,
    learning_rate=LEARNING_RATE,
    weight_decay=0.001,
    fp16=True,
    logging_steps=10,
    save_steps=100,
    save_total_limit=3,
    optim="paged_adamw_32bit",
    lr_scheduler_type="cosine",
    warmup_ratio=0.03,
    report_to="none",
)

# ============================================
# TRAINER INITIALIZATION AND EXECUTION
# ============================================

print("Initializing trainer...")
trainer = SFTTrainer(
    model=model,
    train_dataset=dataset,
    peft_config=peft_config,
    dataset_text_field="text",
    max_seq_length=MAX_SEQ_LENGTH,
    tokenizer=tokenizer,
    args=training_args,
)

print("Starting training...")
trainer.train()

print(f"Saving adapter to {OUTPUT_NAME}...")
trainer.model.save_pretrained(OUTPUT_NAME)
tokenizer.save_pretrained(OUTPUT_NAME)

print("Training complete.")
```

Salve o arquivo com `Ctrl+O` e saia com `Ctrl+X`.

**Entendendo os principais parâmetros:**

- **LORA_RANK (r=16):** controla a expressividade do adapter treinado. Valores mais altos aprendem mais, mas consomem mais memória. O comum é ficar entre 8 e 64.

- **LORA_ALPHA (16):** fator de escala dos pesos do LoRA. Uma heurística comum é usar o mesmo valor do rank.

- **MAX_SEQ_LENGTH (512):** comprimento máximo, em tokens, dos exemplos de treinamento. Sequências mais longas exigem mais memória. Se aparecerem erros de OOM, reduza esse valor primeiro.

- **BATCH_SIZE (4):** número de exemplos processados ao mesmo tempo. Reduza para 2 ou 1 se faltar memória.

- **target_modules:** as camadas em que os adapters LoRA são inseridos. No Llama-3, as camadas de projeção da atenção (q, k, v, o) dão os melhores resultados.

Para iniciar o treinamento, execute:

```bash
python train.py
```

Primeiro, o script baixa os pesos do modelo base (cerca de 16 GB para um modelo de 8B). Isso acontece só uma vez; as execuções seguintes usam os pesos em cache. Depois do carregamento, você vai ver o progresso do treinamento, com o valor da loss impresso a cada 10 passos.

## Passo 5: monitorar o treinamento

Enquanto o script roda, você precisa acompanhar a saúde da GPU. Se a VRAM saturar ou a temperatura passar dos limites seguros, o processo vai cair, podendo corromper o checkpoint e desperdiçar o tempo de aluguel.

Abra uma segunda janela de terminal na sua máquina local e abra outra conexão SSH com o nó alugado:

```bash
ssh -p 22345 user@203.0.113.42
```

Execute o comando a seguir para ver as estatísticas da GPU em tempo real:

```bash
watch -n 1 nvidia-smi
```

![Terminal exibindo a saída do nvidia-smi com uso de memória e temperatura da GPU](../_images/nvidia-smi-monitoring.png)

Esse utilitário atualiza a cada segundo e mostra o uso de memória, o percentual de utilização da GPU e a temperatura. Em uma RTX 4090 com a configuração deste guia, você deve observar:

- **Uso de memória:** de 18 GB a 22 GB dos 24 GB disponíveis
- **Utilização da GPU:** de 90% a 100% durante os passos de treinamento
- **Temperatura:** de 60 °C a 80 °C, dependendo da refrigeração do host

**Solução dos problemas mais comuns:**

**Memória chegando a 24 GB:** se o uso de memória bate no teto o tempo todo, reduza o parâmetro `BATCH_SIZE` do script para 2 ou 1. Outra opção é reduzir `MAX_SEQ_LENGTH` para 256. Qualquer uma das mudanças exige reiniciar o treinamento.

**Utilização da GPU perto de 0%:** normalmente indica um gargalo no carregamento de dados. A CPU não consegue entregar exemplos à GPU na velocidade necessária. Isso é menos comum em nós com NVMe, mas pode acontecer com datasets muito grandes. Considere pré-processar o dataset em um formato mais eficiente (Arrow/Parquet) antes da transferência.

**Temperatura acima de 85 °C:** alguns hosts deixam as GPUs em gabinetes mal ventilados. Temperaturas altas por muito tempo podem ativar o thermal throttling e deixar o treinamento mais lento. Se a temperatura passar de 85 °C com frequência, considere encerrar o aluguel e escolher outro nó. Dano ao hardware é problema do host, mas o tempo perdido e os checkpoints corrompidos são problema seu.

**Interpretando a curva de loss:**

O script de treinamento mostra um valor de loss a cada 10 passos. Esse número representa o quanto as previsões do modelo estão "erradas": quanto menor, melhor. Você deve observar:

- **Loss inicial:** normalmente entre 1,5 e 3,0, dependendo do dataset
- **Tendência:** queda constante ao longo das primeiras centenas de passos
- **Loss final:** normalmente entre 0,5 e 1,5 em uma execução bem configurada

Se a loss estagnar logo de cara (sem queda depois de 100 passos), a taxa de aprendizado pode estar baixa demais. Se ela oscilar muito ou subir, a taxa de aprendizado está alta demais. O valor padrão de `2e-4` funciona bem para a maioria dos datasets, mas pode ser preciso ajustar.

Se a loss cair de forma suave e de repente disparar para valores muito altos (10 ou mais), o dataset provavelmente tem exemplos malformados. Pare o treinamento, procure erros de codificação ou caracteres mal escapados no arquivo JSONL e comece de novo.

Um fine-tuning típico com 1.000 exemplos termina em 30 a 60 minutos em uma RTX 4090. Datasets maiores escalam de forma aproximadamente linear: 10.000 exemplos exigem de 5 a 10 horas.

## Passo 6: baixar o modelo e limpar o ambiente

Quando o treinamento termina, os pesos ajustados ficam salvos como um adapter LoRA no diretório definido em `OUTPUT_NAME`. Esse adapter é compacto, normalmente de 100 MB a 500 MB, contra os 16 GB do modelo base completo.

Primeiro, confira se os arquivos do adapter existem:

```bash
ls -la ~/llama3-finetune/llama-3-8b-custom/
```

Você deve ver arquivos como `adapter_config.json`, `adapter_model.safetensors` e os arquivos do tokenizer.

**Não faça o merge do adapter no nó alugado.** O merge combina os pesos do LoRA com o modelo base para gerar um modelo ajustado independente. Essa operação exige carregar o modelo base completo em 16 bits na memória, o que pode passar da VRAM disponível em uma placa de 24 GB. Faça o merge na sua própria infraestrutura ou simplesmente carregue o adapter junto com o modelo base na hora da inferência. A biblioteca PEFT faz isso sem complicação:

```python
from peft import PeftModel
from transformers import AutoModelForCausalLM

base_model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B",
    device_map="auto",
)
model = PeftModel.from_pretrained(base_model, "./llama-3-8b-custom")
```

Para baixar o adapter, volte ao **terminal local** (não à sessão SSH) e execute:

```bash
scp -r -P 22345 user@203.0.113.42:~/llama3-finetune/llama-3-8b-custom ./
```

A opção `-r` copia o diretório inteiro de forma recursiva. Confirme que a transferência deu certo comparando o tamanho dos arquivos locais com o dos remotos.

**Limpando o ambiente remoto:**

É este passo que separa profissionais de amadores. O nó alugado agora contém o seu dataset proprietário, o seu código de treinamento e os pesos do modelo em cache. Deixar esse material em uma máquina que você não controla viola o básico da segurança operacional.

Volte à sessão SSH no nó alugado e execute os comandos a seguir:

```bash
# Remove your working directory and all contents
rm -rf ~/llama3-finetune

# Clear the Hugging Face cache (contains downloaded model weights)
rm -rf ~/.cache/huggingface

# Clear Python package cache
rm -rf ~/.cache/pip

# Clear bash history
history -c
cat /dev/null > ~/.bash_history

# Clear any potential swap residue (may require sudo depending on node config)
sync
```

Se o nó tiver o `shred` e você quiser uma garantia extra de que os arquivos apagados não poderão ser recuperados:

```bash
# Secure deletion (slower but more thorough)
find ~/llama3-finetune -type f -exec shred -u {} \;
rm -rf ~/llama3-finetune
```

Encerre a sessão SSH:

```bash
exit
```

Volte ao painel do marketplace e encerre o aluguel, incluindo qualquer volume de armazenamento, para parar de pagar por ele.

## Inferência com o seu modelo ajustado

Com o adapter baixado na sua máquina local, você pode rodar inferência sem depender de nenhuma nuvem. Veja um exemplo mínimo:

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import PeftModel

# Quantization config (same as training)
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
)

# Load base model
base_model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B",
    quantization_config=bnb_config,
    device_map="auto",
)

# Load your fine-tuned adapter
model = PeftModel.from_pretrained(base_model, "./llama-3-8b-custom")

# Load tokenizer
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3.1-8B")

# Generate a response
prompt = "### Instruction: Summarize the contract clause.\n\n### Input: The Licensee shall not reverse engineer, decompile, or disassemble the Software.\n\n### Response:"

inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
outputs = model.generate(**inputs, max_new_tokens=100, temperature=0.7)
response = tokenizer.decode(outputs[0], skip_special_tokens=True)

print(response)
```

Para uso em produção, considere expor isso como uma API com FastAPI ou Flask, ou servir o modelo com servidores de inferência como vLLM ou Text Generation Inference (TGI). Comparamos as opções em [Ollama vs vLLM vs TGI em uma RTX 4090](/pt_br/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/).

## Conclusão

Você fez o fine-tuning de um modelo de linguagem grande com dados proprietários, mantendo esses dados em uma única máquina pelo menor tempo possível. E fez isso sem assinar contratos corporativos e sem dar a uma empresa de tecnologia acesso à sua propriedade intelectual.

O custo total da operação, considerando duas horas de treinamento em uma RTX 4090 a US$ 0,45 por hora, foi de noventa centavos de dólar. Uma única A10G na AWS custa cerca de US$ 1,01 por hora, então a execução em si também não sai cara lá. A diferença está no pedido de cota e na configuração.

Mais importante: o seu dataset nunca passou por um serviço de armazenamento e foi apagado da máquina alugada assim que você terminou.

A era da dependência de APIs fechadas está chegando ao fim. Organizações que precisam de privacidade, pesquisadores que valorizam a soberania e desenvolvedores que querem controle têm uma alternativa. GPUs alugadas devolvem a eles a infraestrutura, os custos e os dados.

O seu modelo ajustado agora está em um hardware que você controla. As decisões sobre como implantá-lo, quem pode acessá-lo e para que ele vai servir são só suas.

---

## O que ler em seguida

Este guia cobriu o fluxo principal de fine-tuning privado de LLMs. Os materiais abaixo aprofundam temas relacionados:

**Entendendo os custos:**

- [Comparação de preços de aluguel de GPU 2026](/pt_br/gpu-rental-pricing-comparison-2026/): análise de custos entre marketplaces e grandes nuvens
- [O custo real de alugar uma GPU](/pt_br/hidden-fees-in-gpu-rental/): fatores de custo que as páginas de preços não mostram

**Primeiros passos:**

- [O que você precisa para alugar uma GPU em 2026](/pt_br/what-you-need-to-rent-a-gpu/): cadastro, verificação e pagamento em cada plataforma
- [Como proteger seu dataset em um nó de GPU público](/pt_br/how-to-secure-dataset-on-public-gpu-node/): práticas de segurança antes, durante e depois do treinamento

**Comparando opções:**

- [Comparação RunPod vs Vast.ai](/pt_br/runpod-vs-vastapi-comparison/): no que os dois maiores marketplaces diferem
- [GPUFlow vs Vast.ai vs RunPod vs SaladCloud](/pt_br/gpuflow-vs-vast-ai-vs-runpod/): máquinas, contêineres e chaves de API comparados
