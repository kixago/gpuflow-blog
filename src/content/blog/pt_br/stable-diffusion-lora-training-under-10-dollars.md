---
title: "Treinar uma LoRA de Stable Diffusion por menos de US$ 10 numa GPU alugada"
description: "Treine uma LoRA de SDXL ou Flux numa RTX 4090 alugada por bem menos de US$ 10: qual GPU escolher pela VRAM, legendas, configurações do sd-scripts e do ai-toolkit e um custo calculado."
excerpt: "Um treino de LoRA de SDXL numa RTX 4090 alugada custa cerca de US$ 0,35 a US$ 0,80 em setembro de 2026. Aqui está a GPU certa, como preparar e legendar as imagens, o comando de treino exato e para onde o dinheiro vai de fato."
pubDate: 2026-02-11
updatedDate: 2026-09-30
locale: "pt_br"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/stable-diffusion-lora-training-guide.jpg"
heroImageAlt: "Ilustração de pessoas em volta de um monitor grande com o diagrama de uma rede LoRA, ao lado de um rack de servidores e de um painel que compara imagens de amostra de duas épocas de treino"
faq:
  - question: "Quanto custa treinar uma LoRA numa GPU alugada?"
    answer: "Em setembro de 2026, uma RTX 4090 custava cerca de US$ 0,31 por hora no Vast.ai e US$ 0,74 por hora na página de preços do RunPod. Uma sessão de LoRA de SDXL de uns 65 minutos, contando preparação e testes, custa portanto de US$ 0,34 a US$ 0,80."
  - question: "Quanta VRAM é preciso para treinar uma LoRA de SDXL?"
    answer: "A documentação do sd-scripts diz que dá para treinar uma LoRA de SDXL com 8 GB de memória de GPU, sendo 10 GB o recomendado, se você treinar só a U-Net, fizer cache dos latents e das saídas do text encoder e usar gradient checkpointing. Uma placa de 24 GB, como a RTX 3090 ou a 4090, permite treinar em 1024x1024 sem brigar com o limite de memória."
  - question: "Dá para treinar uma LoRA de Flux numa RTX 4090?"
    answer: "Dá. O ai-toolkit traz configurações de exemplo para o FLUX.1 com nomes de placas de 24 GB, e o sd-scripts lista configurações para o FLUX.1 até 8 GB usando block swapping. O próprio guia da Black Forest Labs diz que um treino de LoRA do FLUX.2 [klein] com 1.800 passos numa RTX 4090 leva menos de uma hora."
  - question: "Quantas imagens são necessárias para treinar uma LoRA?"
    answer: "Para um personagem, objeto ou estilo, de 15 a 40 boas imagens é a faixa comum; a Black Forest Labs sugere de 15 a 40 imagens com o mesmo visual para o FLUX.2 [klein]. Imagens nítidas, variadas e bem legendadas importam mais do que a quantidade."
  - question: "O que é melhor para treinar LoRA: kohya_ss, OneTrainer ou ai-toolkit?"
    answer: "Os três funcionam. O sd-scripts do kohya é a referência em linha de comando e o kohya_ss coloca uma interface web por cima dele; o OneTrainer tem interface desktop e legendagem embutida; o ai-toolkit tem interface web, um template oficial no RunPod e suporte rápido a modelos novos como FLUX.2 e Qwen-Image."
  - question: "Dá para treinar uma LoRA no GPUFlow?"
    answer: "Não. O GPUFlow aluga uma API de chat compatível com a OpenAI rodando na GPU de um provedor, sem shell, SSH nem acesso a arquivos, então não há como rodar um script de treino ali. Use uma plataforma que alugue a máquina, como o Vast.ai ou o RunPod."
---

Treinar uma LoRA de SDXL ou de um modelo Flux pequeno numa GPU alugada custa bem menos de US$ 10. Em setembro de 2026, uma RTX 4090 sai por cerca de US$ 0,31 por hora no Vast.ai e US$ 0,74 por hora no RunPod, e uma sessão de LoRA de SDXL, com preparação e testes, leva pouco mais de uma hora. São US$ 0,34 a US$ 0,80 por tentativa, então um orçamento de US$ 10 dá para uma dúzia delas.

O dinheiro não é a parte difícil. As imagens, as legendas e saber a hora de parar são. Este guia cobre tudo isso, com comandos para copiar e colar. Preços e versões das ferramentas foram conferidos em setembro de 2026; as fontes estão no final.

## O fluxo em cinco etapas

<figure>
<svg viewBox="0 0 720 250" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">Fluxo de treino de LoRA: dataset, legendas, treino, teste e uso, com uma volta ao dataset quando o resultado sai errado</title>
<defs><marker id="d1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6366f1"/></marker></defs>
<rect width="720" height="250" fill="#ffffff"/>
<line x1="20" y1="40" x2="280" y2="40" stroke="#16a34a" stroke-width="2"/>
<text x="150" y="30" text-anchor="middle" fill="#16a34a" font-size="13">Grátis: no seu próprio PC</text>
<line x1="300" y1="40" x2="560" y2="40" stroke="#f97316" stroke-width="2"/>
<text x="430" y="30" text-anchor="middle" fill="#f97316" font-size="13">Cobrado: na GPU alugada</text>
<rect x="20" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="80" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">Dataset</text>
<text x="80" y="112" text-anchor="middle" fill="#64748b" font-size="13">15–40 imagens</text>
<rect x="160" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="220" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">Legendas</text>
<text x="220" y="112" text-anchor="middle" fill="#64748b" font-size="13">um .txt cada</text>
<rect x="300" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="360" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">Treino</text>
<text x="360" y="112" text-anchor="middle" fill="#64748b" font-size="13">sd-scripts</text>
<rect x="440" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="500" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">Teste</text>
<text x="500" y="112" text-anchor="middle" fill="#64748b" font-size="12">grade de amostras</text>
<rect x="580" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="640" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">Uso</text>
<text x="640" y="112" text-anchor="middle" fill="#64748b" font-size="13">ComfyUI, Forge</text>
<line x1="140" y1="95" x2="158" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="280" y1="95" x2="298" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="420" y1="95" x2="438" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="560" y1="95" x2="578" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<path d="M500,130 L500,180 L80,180 L80,134" fill="none" stroke="#f97316" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#d1-arrow)"/>
<text x="290" y="205" text-anchor="middle" fill="#1e1b4b" font-size="13">Não ficou bom? Corrija as imagens ou as legendas e treine de novo</text>
<text x="360" y="235" text-anchor="middle" fill="#64748b" font-size="13">A maior parte da qualidade vem das duas primeiras caixas, que não custam nada</text>
</svg>
<figcaption>Monte o dataset e as legendas antes de alugar. A GPU só é cobrada pelo treino e pelos testes, e um resultado ruim normalmente manda você de volta às imagens, não às configurações.</figcaption>
</figure>

## O que é uma LoRA e por que ela sai barata

A LoRA (Low-Rank Adaptation) congela o modelo base e treina duas matrizes pequenas ao lado de algumas das camadas dele. O artigo original relatou uma redução de 10.000 vezes nos parâmetros treináveis e de 3 vezes na memória de GPU em comparação com o fine-tuning completo do GPT-3 175B. Modelos de imagem funcionam do mesmo jeito: o checkpoint base do SDXL é um arquivo de 6,9 GB, enquanto a LoRA que você treina é um arquivo pequeno e separado, carregado por cima dele com a intensidade que você quiser.

É por isso que uma única GPU doméstica basta, e por isso que um treino leva dezenas de minutos, e não dias.

## Escolha a GPU pela VRAM

A VRAM decide o que você consegue treinar. A velocidade decide quantos minutos cobrados o treino leva, então uma placa mais rápida e mais cara por hora pode acabar custando mais ou menos o mesmo por treino.

| Família de modelos | Mínimo documentado | Com folga | Observações |
| --- | --- | --- | --- |
| SD 1.5 | 8 GB | 12 GB+ | Treina em 512x512, o mais barato e rápido |
| SDXL | 8 GB (10 GB recomendados) | 24 GB | Só a U-Net, com cache dos latents e das saídas do text encoder |
| FLUX.1 [dev] (12B) | 8 GB com muito block swapping | 24 GB | O sd-scripts lista configurações para 24, 16, 12, 10 e 8 GB |
| FLUX.2 [klein] 4B/9B | não informado | 24 GB | BFL: cerca de 13 GB de pesos em bf16, um treino de LoRA cabe em menos de 24 GB |

As configurações de pouca VRAM funcionam, mas são lentas. Trocar blocos do transformer entre a GPU e a RAM do sistema é como o sd-scripts faz o FLUX.1 caber em 8 a 16 GB, e cada troca custa tempo que você paga. Numa máquina alugada, uma placa de 24 GB é o padrão sensato: uma RTX 3090 ou 4090. A RTX 5090 (32 GB) também serve, mas o sd-scripts avisa que ela precisa do PyTorch 2.8.0 com CUDA 12.8 ou 12.9, então confira se o seu template traz um stack recente o bastante.

![Uma placa de vídeo ASUS TUF com três ventoinhas, em pé numa prateleira branca](../_images/test-hero.jpg)

Placas de data center são mais rápidas, mas o RunPod lista uma A100 80 GB a US$ 1,59 por hora, mais do que o dobro de uma 4090. Para uma LoRA com 20 ou 30 imagens, a velocidade extra raramente compensa; elas fazem mais sentido para datasets grandes ou fine-tuning completo.

## Onde alugar e quanto custa

Você precisa de uma plataforma que entregue uma máquina: um shell ou um notebook Jupyter, um disco e um jeito de copiar arquivos para dentro e para fora. [Vast.ai e RunPod](/pt_br/runpod-vs-vastapi-comparison/) são as duas escolhas mais comuns para esse tipo de trabalho.

| GPU | VRAM | Vast.ai (a partir de) | Página de preços do RunPod | Mais barato rastreado no RunPod |
| --- | --- | --- | --- | --- |
| RTX 3090 | 24 GB | cerca de US$ 0,11–0,13/h | US$ 0,50/h | US$ 0,22/h |
| RTX 4090 | 24 GB | cerca de US$ 0,31–0,33/h | US$ 0,74/h | US$ 0,34/h |
| RTX 5090 | 32 GB | cerca de US$ 0,41–0,47/h | US$ 0,99/h | US$ 0,69/h |

Preços de setembro de 2026. "Vast.ai (a partir de)" e "Mais barato rastreado no RunPod" vêm do rastreador de preços do getdeploying.com; a coluna do meio é a página de preços do próprio RunPod. No Vast.ai, cada host define o próprio preço, então as ofertas que você vê variam conforme a localização e a nota de confiabilidade.

As duas cobram por segundo. Os extras são diferentes e pesam mais num trabalho de uma hora do que o preço por hora sugere:

- **Vast.ai** cobra armazenamento "enquanto a sua instância existir, qualquer que seja o estado dela", e cobra banda por byte, a uma tarifa definida por cada host. Baixar um modelo base de 7 GB num host com banda cara soma. Apague a instância, não se limite a pará-la.
- **RunPod** cobra US$ 0,10 por GB por mês pelo container disk enquanto o pod roda, nada por ele depois de parado, e US$ 0,20 por GB por mês por um volume disk parado. Não cobra entrada nem saída de dados.

As duas têm templates prontos. O autor do ai-toolkit mantém um template oficial no RunPod, e o README do kohya_ss lista o RunPod como ambiente suportado. Um template poupa dez minutos ou mais instalando o PyTorch em tempo cobrado. Para uma comparação de preços mais ampla, veja [GPUFlow vs Vast.ai vs RunPod vs SaladCloud](/pt_br/gpuflow-vs-vast-ai-vs-runpod/) e [os custos escondidos do aluguel de GPU](/pt_br/hidden-fees-in-gpu-rental/).

## Prepare o dataset e as legendas

Faça tudo isso no seu próprio computador, antes de alugar qualquer coisa.

### Imagens

- **Quantidade.** De 15 a 40 imagens para uma pessoa, objeto ou estilo. A Black Forest Labs recomenda "15–40 imagens com o mesmo visual" para o FLUX.2 [klein]. Mais não é melhor se as imagens extras forem piores.
- **Consistência e variedade.** Toda imagem precisa mostrar o conceito. O resto deve variar: ângulo, luz, fundo, enquadramento. Se todas as fotos do seu produto estão na mesma mesa branca, a LoRA aprende a mesa.
- **Qualidade.** Nítidas, bem expostas, sem marca d'água nem texto por cima. A LoRA aprende ruído e blocos de JPEG com a mesma fidelidade que o resto.
- **Resolução.** Pelo menos 1024 pixels no lado menor para SDXL e Flux, 512 para SD 1.5. Não precisa recortar em quadrados: com o bucketing ativado, o sd-scripts agrupa as imagens por proporção.

### Legendas

Cada imagem recebe um arquivo de texto com o mesmo nome (`photo01.jpg`, `photo01.txt`). A legenda diz ao modelo o que já está explicado em palavras, para que a LoRA aprenda o que não está. Coloque primeiro uma palavra-gatilho rara e depois descreva tudo o que você quer que continue mudável:

```text
zxq_mug, a ceramic coffee mug on a wooden desk, morning light from the left, shallow depth of field
```

Duas ferramentas escrevem um primeiro rascunho para você:

- **WD14 tagger**, incluído no sd-scripts, gera tags separadas por vírgula. Bom para modelos de estilo anime e fine-tunes de SDXL treinados com tags:

  ```bash
  python finetune/tag_images_by_wd14_tagger.py --onnx \
    --repo_id SmilingWolf/wd-swinv2-tagger-v3 --batch_size 4 /workspace/dataset/img
  ```

- **JoyCaption**, um modelo aberto (Apache 2.0) de legendagem feito para treinar modelos de difusão, escreve frases em linguagem natural, que combinam melhor com o Flux do que tags. O README diz que ele precisa de cerca de 17 GB de VRAM em bf16, com versões de 8 e 4 bits para placas menores.

O OneTrainer também tem legendagem embutida com BLIP, BLIP2 e WD-1.4. Seja qual for a ferramenta do rascunho, leia cada legenda e corrija. É a meia hora mais valiosa do projeto inteiro.

## Escolha um trainer

Quatro ferramentas atendem quase todo mundo. Todas são gratuitas e de código aberto.

| Ferramenta | Interface | Modelos (setembro de 2026) | Indicado para |
| --- | --- | --- | --- |
| kohya-ss/sd-scripts | Linha de comando | SD 1.x/2.x, SDXL, SD3/3.5, FLUX.1, Lumina, HunyuanImage-2.1, Anima | Treinos reproduzíveis, controle total |
| bmaltais/kohya_ss | Interface web sobre o sd-scripts | Os mesmos do sd-scripts | sd-scripts sem decorar flags |
| Nerogar/OneTrainer | Interface desktop e CLI | SD 1.5 a 3.5, SDXL, FLUX.1, FLUX.2, Chroma, Qwen Image e outros | Legendagem e máscaras embutidas |
| ostris/ai-toolkit | Interface web e configs YAML | SD 1.5, SDXL, FLUX.1, FLUX.2, Qwen-Image, vídeo Wan e outros | Flux e modelos mais novos, template no RunPod |

O sd-scripts está na versão 0.11.1 (junho de 2026), é testado com Python 3.10 e precisa do PyTorch 2.6.0 ou mais recente. O ai-toolkit recomenda Python 3.12 e hoje instala o PyTorch 2.13.0 compilado para CUDA 13.0. O OneTrainer precisa de Python 3.10 a 3.13.

Eu uso o sd-scripts para SDXL, porque a linha de comando é a configuração inteira, o que facilita repetir e comparar treinos, e o ai-toolkit para Flux.

## Treine uma LoRA de SDXL com o sd-scripts

Numa instância Linux nova com driver da NVIDIA, a preparação são poucos comandos:

```bash
git clone https://github.com/kohya-ss/sd-scripts.git
cd sd-scripts
python -m venv venv && source venv/bin/activate
pip install torch==2.6.0 torchvision==0.21.0 --index-url https://download.pytorch.org/whl/cu124
pip install --upgrade -r requirements.txt
accelerate config default --mixed_precision bf16

# SDXL base model (not gated, CreativeML Open RAIL++-M license)
hf download stabilityai/stable-diffusion-xl-base-1.0 sd_xl_base_1.0.safetensors \
  --local-dir /workspace/models
```

Copie a sua pasta de imagens e legendas `.txt` para `/workspace/dataset/img` com `scp`, `rsync` ou o gerenciador de arquivos da plataforma. Depois descreva o dataset em `/workspace/dataset.toml`:

```toml
[general]
caption_extension = ".txt"
enable_bucket = true

[[datasets]]
resolution = 1024
batch_size = 1

  [[datasets.subsets]]
  image_dir = "/workspace/dataset/img"
  num_repeats = 10
```

E comece o treino:

```bash
accelerate launch --num_cpu_threads_per_process 1 sdxl_train_network.py \
  --pretrained_model_name_or_path=/workspace/models/sd_xl_base_1.0.safetensors \
  --dataset_config=/workspace/dataset.toml \
  --output_dir=/workspace/output --output_name=zxq_mug \
  --save_model_as=safetensors \
  --network_module=networks.lora --network_dim=16 --network_alpha=8 \
  --network_train_unet_only \
  --optimizer_type=AdamW8bit --learning_rate=1e-4 \
  --lr_scheduler=constant_with_warmup --lr_warmup_steps=100 \
  --max_train_epochs=8 --save_every_n_epochs=2 \
  --mixed_precision=bf16 --save_precision=bf16 \
  --cache_latents --cache_latents_to_disk --cache_text_encoder_outputs \
  --gradient_checkpointing --sdpa --seed=42 \
  --sample_prompts=/workspace/prompts.txt --sample_every_n_epochs=2
```

O `prompts.txt` tem um prompt de teste por linha, com as opções inline do sd-scripts para tamanho, seed e passos:

```text
zxq_mug, a ceramic coffee mug on a kitchen counter --w 1024 --h 1024 --d 42 --s 28
zxq_mug, a ceramic coffee mug held by a hiker on a mountain top --w 1024 --h 1024 --d 42 --s 28
```

### O que cada configuração faz

- **Passos.** Imagens × repetições × épocas ÷ tamanho do batch. Com 25 imagens: 25 × 10 × 8 = 2.000 passos.
- **`network_dim` 16, `network_alpha` 8.** A capacidade da LoRA. 16 é mais do que suficiente para um objeto ou um rosto; estilos às vezes pedem 32. Ranks maiores entram em overfitting mais rápido e geram arquivos maiores.
- **`--network_train_unet_only`.** Obrigatório aqui: o sd-scripts se recusa a fazer cache das saídas do text encoder enquanto treina os text encoders, e a documentação dele chama o treino só da U-Net de "altamente recomendado" para LoRAs de SDXL de qualquer forma.
- **Cache e gradient checkpointing.** São eles que fazem o SDXL caber em 8 a 10 GB. O cache também desativa o embaralhamento e o dropout das legendas, por isso eles não aparecem no arquivo do dataset.
- **`learning_rate` 1e-4 com AdamW8bit.** O valor do próprio exemplo de LoRA de SDXL do sd-scripts. Se as amostras quase não mudarem depois de quatro épocas, tente 2e-4. Se virarem cópias das suas imagens de treino, abaixe o valor ou pare antes.
- **Checkpoints a cada 2 épocas.** Você recebe arquivos das épocas 2, 4, 6 e 8 e escolhe o melhor. A melhor LoRA muitas vezes não é a última.

### Quanto tempo leva

Usuários numa issue do kohya_ss relataram cerca de 1,1 a 1,4 iterações por segundo no treino de LoRA de SDXL em 1024x1024, batch 1, numa RTX 4090 com gradient checkpointing. Nessa velocidade, 2.000 passos levam de 24 a 30 minutos, mais alguns minutos para o cache dos latents. A mesma issue mostra o quanto a coisa degringola quando a placa fica sem VRAM e transborda para a memória compartilhada: 50 segundos ou mais por passo. Se a sua velocidade estiver muito abaixo do esperado, olhe o `nvidia-smi` antes de culpar as configurações.

## Flux e modelos mais novos com o ai-toolkit

Para Flux, o ai-toolkit é o caminho mais fácil. Numa máquina alugada:

```bash
git clone https://github.com/ostris/ai-toolkit.git
cd ai-toolkit
python3 -m venv venv && source venv/bin/activate
pip3 install --no-cache-dir torch==2.13.0 torchvision==0.28.0 torchaudio==2.11.0 \
  --index-url https://download.pytorch.org/whl/cu130
pip3 install -r requirements.txt
cp config/examples/train_lora_flux_24gb.yaml config/zxq_mug.yml
# edit the dataset path, trigger word and steps, then:
python run.py config/zxq_mug.yml
```

Ou suba a interface web com `cd ui && npm run build_and_start` e abra a porta 8675. Num servidor que outras pessoas conseguem acessar, defina antes uma senha em `AI_TOOLKIT_AUTH`, como o README recomenda.

Duas coisas sobre licenças antes de escolher um modelo Flux:

- **FLUX.1 [dev]** tem acesso restrito no Hugging Face. Você aceita a FLUX.1 [dev] Non-Commercial License e usa um token de leitura do Hugging Face para baixá-lo. O model card diz que as imagens geradas podem ser usadas comercialmente; os pesos e a sua LoRA ficam sob a licença não comercial.
- **FLUX.2 [klein] 4B** é Apache 2.0 e não tem acesso restrito. A versão 9B usa a FLUX Non-Commercial License.

A Black Forest Labs publicou em junho de 2026 um guia para treinar LoRAs do FLUX.2 [klein] com o ai-toolkit: um treino de 1.800 passos numa RTX 4090 "leva menos de uma hora", e eles sugerem olhar os checkpoints entre os passos 750 e 1.500. Não encontrei um tempo publicado tão confiável para o FLUX.1 [dev], que tem três vezes o tamanho do klein 4B; reserve mais tempo e meça o seu primeiro treino.

## Teste a LoRA antes de parar de pagar

Olhe as imagens de amostra de cada época salva enquanto a máquina ainda está rodando. Elas mostram, sem custo extra, se a LoRA aprendeu o conceito e quando começou o overfitting. Depois baixe os checkpoints que você gostou:

```bash
rsync -avP user@your-instance:/workspace/output/*.safetensors ./loras/
```

Em casa, coloque o arquivo na pasta `models/loras` do ComfyUI ou `models/Lora` do Forge e teste com seeds fixas:

- **Intensidade.** Teste 0,6, 0,8 e 1,0. Algumas LoRAs ficam melhores abaixo de 1,0.
- **Flexibilidade.** Coloque o gatilho em cenas que não estavam nos seus dados. Uma caneca no alto de uma montanha, um rosto numa pintura. Se só funciona em cenas parecidas com as imagens de treino, houve overfitting: use uma época anterior ou menos repetições.
- **Vazamento.** Gere sem a palavra-gatilho. Se o conceito aparecer mesmo assim, as suas legendas não descreveram o suficiente da imagem.

Quando o resultado sai errado, a correção normalmente está no dataset: tirar algumas imagens fracas, ou legendas que nomeiem o que você quer que varie. Mexer na learning rate é a segunda coisa a tentar, não a primeira.

## O custo calculado

Uma LoRA de SDXL, 25 imagens, 2.000 passos, numa RTX 4090:

| Etapa | Tempo |
| --- | --- |
| Partir de um template, instalar o sd-scripts | 10 min |
| Baixar o SDXL base, subir o dataset, fazer o cache | 10 min |
| Treino (2.000 passos a 1,1–1,4 it/s) | 30 min |
| Olhar as amostras, baixar os checkpoints, apagar a instância | 15 min |
| **Total** | **65 min (1,08 h)** |

- Vast.ai a US$ 0,31/h: 1,08 × US$ 0,31 = **US$ 0,34**, mais armazenamento e a tarifa de banda do host.
- RunPod a US$ 0,74/h: 1,08 × US$ 0,74 = **US$ 0,80**. Um container disk de 50 GB durante essa hora soma 50 × US$ 0,10 ÷ 730 horas = menos de 1 centavo.

Uma LoRA de FLUX.2 [klein] com uma hora de treino e 30 minutos de preparação e testes dá 1,5 × US$ 0,74 = **US$ 1,11** no RunPod, ou 1,5 × US$ 0,31 = **US$ 0,47** no Vast.ai.

<figure>
<svg viewBox="0 0 720 300" role="img" aria-labelledby="d2-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d2-title">Gráfico de barras com o custo de treinar LoRAs numa RTX 4090 alugada, comparado com um orçamento de 10 dólares</title>
<rect width="720" height="300" fill="#ffffff"/>
<line x1="230" y1="40" x2="230" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="322" y1="40" x2="322" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="414" y1="40" x2="414" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="506" y1="40" x2="506" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="598" y1="40" x2="598" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="690" y1="30" x2="690" y2="250" stroke="#f97316" stroke-width="2" stroke-dasharray="6 4"/>
<text x="698" y="22" text-anchor="end" fill="#f97316" font-size="13">orçamento de $10</text>
<text x="220" y="75" text-anchor="end" fill="#1e1b4b">SDXL, Vast.ai</text>
<rect x="230" y="58" width="15.6" height="26" fill="#16a34a"/>
<text x="253" y="76" fill="#1e1b4b" font-size="13">$0.34</text>
<text x="220" y="125" text-anchor="end" fill="#1e1b4b">SDXL, RunPod</text>
<rect x="230" y="108" width="36.8" height="26" fill="#6366f1"/>
<text x="275" y="126" fill="#1e1b4b" font-size="13">$0.80</text>
<text x="220" y="175" text-anchor="end" fill="#1e1b4b">FLUX.2 klein, RunPod</text>
<rect x="230" y="158" width="51.1" height="26" fill="#6366f1"/>
<text x="289" y="176" fill="#1e1b4b" font-size="13">$1.11</text>
<text x="220" y="225" text-anchor="end" fill="#1e1b4b" font-size="14">5 treinos SDXL, RunPod</text>
<rect x="230" y="208" width="184.5" height="26" fill="#6366f1"/>
<text x="422" y="226" fill="#1e1b4b" font-size="13">$4.01</text>
<line x1="230" y1="250" x2="690" y2="250" stroke="#64748b" stroke-width="1"/>
<text x="230" y="270" text-anchor="middle" fill="#64748b" font-size="13">$0</text>
<text x="322" y="270" text-anchor="middle" fill="#64748b" font-size="13">$2</text>
<text x="414" y="270" text-anchor="middle" fill="#64748b" font-size="13">$4</text>
<text x="506" y="270" text-anchor="middle" fill="#64748b" font-size="13">$6</text>
<text x="598" y="270" text-anchor="middle" fill="#64748b" font-size="13">$8</text>
<text x="690" y="270" text-anchor="middle" fill="#64748b" font-size="13">$10</text>
<text x="460" y="292" text-anchor="middle" fill="#64748b" font-size="13">Custo por sessão numa RTX 4090, preços de setembro de 2026</text>
</svg>
<figcaption>Mesmo cinco tentativas separadas de SDXL pelo preço de tabela do RunPod ficam bem abaixo de US$ 10. A US$ 0,74 por hora, US$ 10 compram 13,5 horas de RTX 4090; a US$ 0,31, cerca de 32 horas.</figcaption>
</figure>

O que estoura um orçamento de US$ 10 raramente é o treino. É uma instância esquecida ligada durante a noite (12 horas a US$ 0,74 são US$ 8,88), uma instância parada no Vast.ai ainda pagando armazenamento, ou uma hora legendando imagens em tempo cobrado. [Cobrança por segundo](/pt_br/per-second-vs-hourly-gpu-billing/) só ajuda se você apagar a máquina quando terminar.

## Onde o GPUFlow entra

Neste trabalho, não entra. O GPUFlow aluga acesso a um modelo de linguagem que um provedor serve (normalmente com o Ollama) na própria GPU, por meio de uma chave de API compatível com a OpenAI. Não há shell, nem SSH, nem acesso a arquivos, então você não consegue instalar um trainer, subir imagens ou baixar uma LoRA. Além disso, ele serve modelos de chat, não modelos de imagem. Treine no Vast.ai, no RunPod ou numa plataforma parecida que alugue a máquina.

Se você trabalha com texto em vez de imagens, a mesma lógica de alugar, treinar e apagar vale para modelos de linguagem: veja [fine-tuning de um LLM com privacidade numa GPU alugada](/pt_br/private-llm-fine-tuning-guide/).

## Fontes

Tudo verificado em setembro de 2026.

- Artigo da LoRA: [Hu et al., LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685)
- sd-scripts: [README e releases](https://github.com/kohya-ss/sd-scripts), [treino de LoRA de SDXL](https://github.com/kohya-ss/sd-scripts/blob/main/docs/sdxl_train_network.md), [notas sobre SDXL e VRAM](https://github.com/kohya-ss/sd-scripts/blob/main/docs/train_SDXL-en.md), [configuração do dataset](https://github.com/kohya-ss/sd-scripts/blob/main/docs/config_README-en.md), [treino de LoRA do FLUX.1](https://github.com/kohya-ss/sd-scripts/blob/main/docs/flux_train_network.md), [WD14 tagger](https://github.com/kohya-ss/sd-scripts/blob/main/docs/wd14_tagger_README-en.md)
- [bmaltais/kohya_ss](https://github.com/bmaltais/kohya_ss), [Nerogar/OneTrainer](https://github.com/Nerogar/OneTrainer), [ostris/ai-toolkit](https://github.com/ostris/ai-toolkit), [JoyCaption](https://github.com/fpgaminer/joycaption)
- Velocidades de SDXL na 4090: [issue #1288 do kohya_ss](https://github.com/bmaltais/kohya_ss/issues/1288)
- Black Forest Labs: [fine-tuning do FLUX.2 [klein] com uma LoRA em menos de 60 minutos](https://huggingface.co/blog/black-forest-labs/flux-2-klein-lora), model cards do [FLUX.1 [dev]](https://huggingface.co/black-forest-labs/FLUX.1-dev), do [FLUX.2 [klein] 4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B) e do [FLUX.2 [klein] 9B](https://huggingface.co/black-forest-labs/FLUX.2-klein-base-9B)
- [Model card do Stable Diffusion XL base 1.0](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0)
- Preços: [preços do RunPod](https://www.runpod.io/pricing), [preços de pods e armazenamento do RunPod](https://docs.runpod.io/pods/pricing), [preços do Vast.ai](https://docs.vast.ai/guides/instances/pricing.md), getdeploying.com para [RTX 3090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-3090), [RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090), [RTX 5090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-5090) e [Vast.ai](https://getdeploying.com/vast-ai)
- GPUFlow: [guia rápido da API](https://docs.gpuflow.app/pt-br/renters/api-quickstart/)
